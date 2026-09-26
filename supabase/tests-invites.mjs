// Kiểm tra 0004 (mời bằng link, đổi số, mật khẩu tạm) trên PGlite: chạy 0001 rồi 0004 (2 lần).
// Cách chạy: node tests-invites.mjs migrations/0001_phase3a.sql migrations/0004_invite_links.sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const db = new PGlite();
let pass = 0, fail = 0;
const ok = (n, c, x = '') => { if (c) { pass++; console.log('  ✓', n); } else { fail++; console.log('  ✗', n, x); } };
const expectErr = async (n, fn, re) => { try { await fn(); ok(n, false, '(không báo lỗi)'); } catch (e) { ok(n, re ? re.test(e.message) : true, e.message); } };

await db.exec(`
  create role anon nologin; create role authenticated nologin; create schema auth; create schema extensions;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}', encrypted_password text, updated_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function extensions.gen_salt(text) returns text language sql as $$ select 'salt' $$;
  create function extensions.crypt(text, text) returns text language sql as $$ select 'hash:' || $1 $$;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated; create publication supabase_realtime;`);
const [m1, m4] = process.argv.slice(2);
await db.exec(fs.readFileSync(m1, 'utf8'));

const U = {
  tuan: '00000000-0000-0000-0000-000000000001', lan: '00000000-0000-0000-0000-000000000002', la: '00000000-0000-0000-0000-000000000003',
  adm: '00000000-0000-0000-0000-000000000004', cu: '00000000-0000-0000-0000-000000000005',
};
const mk = (id, phone, name) => db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)`, [id, `${phone}@sdt.tronhieu.app`, JSON.stringify({ name, phone })]);
await mk(U.tuan, '0912345678', 'Tuấn'); await mk(U.lan, '0912000111', 'Lan'); await mk(U.la, '0999999999', 'Người lạ');
await mk(U.adm, '0987654321', 'Admin'); await mk(U.cu, '0912000555', 'Cũ');
await db.query(`update public.profiles set is_admin = true where id = $1`, [U.adm]);
async function as(uid, fn) {
  await db.exec(`set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`);
  try { return await fn(); } finally { await db.exec('reset role;'); }
}
const q = (s, p) => db.query(s, p);

const TOK = 'INVITELAN0123456789A';
const data = { id: 'dh1', person: { title: 'Cụ ông', name: 'Hòa' }, history: [], members: [
  { id: 'u1', name: 'Tuấn', access: 'full', areas: ['Toàn bộ'], phone: '0912345678' },
  // Lan được mời bằng link; số điện thoại ghi nhầm trùng số người lạ
  { id: 'mlan', name: 'Lan', rel: 'Con gái', access: 'limited', areas: ['Hậu cần'], phone: '0999999999', inviteToken: TOK },
  // Người vào đội bằng số điện thoại từ trước khi có link mời
  { id: 'mcu', name: 'Cũ', access: 'limited', areas: ['Hậu cần'], phone: '0912000555' },
] };
await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh1', $1, $2)`, [U.tuan, JSON.stringify(data)]));
ok('trước 0004: người lạ trùng số thấy được đám hiếu (lỗ hổng cần vá)', (await as(U.la, () => q(`select id from public.cases`))).rows.length === 1);

await db.exec(fs.readFileSync(m4, 'utf8'));
await db.exec(fs.readFileSync(m4, 'utf8'));
ok('chạy 0004 và chạy lại không lỗi', true);
const mem = (await q(`select data->'members' m from public.cases`)).rows[0].m;
ok('người vào bằng số điện thoại trước đây được gắn sẵn tài khoản', mem.find(x => x.id === 'mcu').userId === U.cu);
ok('người cũ vẫn thấy đám hiếu', (await as(U.cu, () => q(`select id from public.cases`))).rows.length === 1);
ok('sau 0004: người lạ trùng số KHÔNG còn thấy đám hiếu', (await as(U.la, () => q(`select id from public.cases`))).rows.length === 0);

const pv = (await as(null, () => q(`select public.invite_preview($1) v`, [TOK]))).rows[0].v;
ok('xem trước lời mời khi chưa đăng nhập: chỉ tên đám hiếu, người mời, vị trí', pv.caseName === 'Cụ ông Hòa' && pv.inviter === 'Tuấn' && pv.memberName === 'Lan' && !JSON.stringify(pv).includes('0912'));
ok('mã sai → không thấy gì', (await as(null, () => q(`select public.invite_preview('SAIMASAIMASAIMA123') v`))).rows[0].v === null);
await expectErr('khách chưa đăng nhập không nhận lời mời được', () => as(null, () => q(`select public.claim_invite($1)`, [TOK])), /permission denied/);
const cid = (await as(U.lan, () => q(`select public.claim_invite($1) c`, [TOK]))).rows[0].c;
ok('Lan mở link + đăng nhập → vào đúng đám hiếu', cid === 'dh1' && (await as(U.lan, () => q(`select id from public.cases`))).rows.length === 1);
const after = (await q(`select data from public.cases`)).rows[0].data;
const lan = after.members.find(x => x.id === 'mlan');
ok('mã mời bị xóa sau khi dùng, tài khoản gắn đúng, lịch sử ghi lại', !lan.inviteToken && lan.userId === U.lan && after.history.at(-1).text.includes('Lan đã nhận lời mời'));
await expectErr('link đã dùng thì người khác không dùng lại được', () => as(U.la, () => q(`select public.claim_invite($1)`, [TOK])), /không còn dùng được/);
await expectErr('Lan (không phải người đại diện) vẫn không tự sửa đội', () => as(U.lan, () => q(`update public.cases set data = jsonb_set(data, '{members,1,access}', '"full"') where id = 'dh1'`)), /người đại diện/);

console.log('Hồ sơ chuẩn bị:');
const PT = 'PREINVITE0123456789B';
await as(U.tuan, () => q(`insert into public.pre_needs (id, owner_id, data) values ('cb1', $1, $2)`, [U.tuan, JSON.stringify({ subject: { name: 'Bà Mai' }, shares: [{ id: 's1', name: 'Lan', phone: '0999999999', role: 'view', inviteToken: PT }] })]));
ok('người lạ trùng số không thấy hồ sơ', (await as(U.la, () => q(`select id from public.pre_needs`))).rows.length === 0);
ok('xem trước lời mời hồ sơ', (await as(null, () => q(`select public.pre_invite_preview($1) v`, [PT]))).rows[0].v.subject === 'Bà Mai');
await as(U.lan, () => q(`select public.claim_pre_invite($1)`, [PT]));
ok('Lan nhận lời mời → thấy hồ sơ với quyền xem', (await as(U.lan, () => q(`select public.pre_role('cb1') r`))).rows[0].r === 'view');

console.log('Đổi số, mật khẩu tạm:');
await expectErr('không đổi sang số của người khác', () => as(U.lan, () => q(`select public.set_my_phone('0912345678')`)), /tài khoản khác/);
await expectErr('số sai dạng bị từ chối', () => as(U.lan, () => q(`select public.set_my_phone('12345')`)), /chưa đúng/);
await as(U.lan, () => q(`select public.set_my_phone('0912000222')`));
ok('tự đổi số được', (await q(`select phone from public.profiles where id = $1`, [U.lan])).rows[0].phone === '0912000222');
await expectErr('người thường không đặt mật khẩu người khác', () => as(U.la, () => q(`select public.admin_set_temp_password($1, 'matkhau123')`, [U.lan])), /Chỉ Admin/);
await as(U.adm, () => q(`select public.admin_set_temp_password($1, 'tam12345')`, [U.lan]));
ok('Admin đặt mật khẩu tạm, có nhật ký',
  (await q(`select encrypted_password p from auth.users where id = $1`, [U.lan])).rows[0].p === 'hash:tam12345'
  && (await q(`select count(*)::int n from public.audit_log where action like 'Đặt mật khẩu tạm%'`)).rows[0].n === 1);

console.log(`\n${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
