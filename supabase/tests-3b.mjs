// Chạy thử migration 0001 + 0002 (Phase 3b) trên PGlite, với phần auth và storage giả lập như Supabase.
// Cách chạy: node tests-3b.mjs migrations/0001_phase3a.sql migrations/0002_phase3b.sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const db = new PGlite();
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, extra); } };
const expectErr = async (name, fn, re) => { try { await fn(); ok(name, false, '(không báo lỗi)'); } catch (e) { ok(name, re ? re.test(e.message) : true, e.message); } };

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  create publication supabase_realtime;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
  create table storage.objects (bucket_id text, name text, owner_id text default auth.uid()::text);
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant select, insert, delete on storage.objects to anon, authenticated;
`);
for (const f of process.argv.slice(2)) await db.exec(fs.readFileSync(f, 'utf8'));
for (const f of process.argv.slice(3)) await db.exec(fs.readFileSync(f, 'utf8'));
ok('chạy migration và chạy lại 0002 không lỗi', true);

const U = { tuan: '00000000-0000-0000-0000-000000000001', lan: '00000000-0000-0000-0000-000000000002', la: '00000000-0000-0000-0000-000000000003', ha: '00000000-0000-0000-0000-000000000005' };
const mkUser = (id, phone, name) => db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [id, `${phone}@sdt.tronhieu.app`, JSON.stringify({ name, phone })]);
await mkUser(U.tuan, '0912345678', 'Tuấn'); await mkUser(U.lan, '0912000111', 'Lan'); await mkUser(U.la, '0999999999', 'Người lạ'); await mkUser(U.ha, '0912000333', 'Hà');

async function as(uid, fn) {
  await db.exec(`set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role;`); }
}
const q = (s, p) => db.query(s, p);

const TOKEN = 'ABCDEFGHJKLMNPQRSTUV';
const data = { id: 'dh1', person: { title: 'Cụ ông', name: 'Hòa', photo: 'data:image/jpeg;base64,xxx' }, members: [
  { id: 'u1', name: 'Tuấn', access: 'full', areas: ['Toàn bộ'], phone: '0912345678' },
  { id: 'mlan', name: 'Lan', access: 'limited', areas: ['Hậu cần'], phone: '0912000111' },
  { id: 'mha', name: 'Hà', access: 'limited', areas: ['Tài chính'], phone: '0912000333' },
  { id: 'mbay', name: 'Chú Bảy', access: 'link', areas: ['Liên lạc'], linkToken: TOKEN, phone: '0911222333' },
], tasks: [
  { id: 't1', templateId: 'x', status: 'todo', owner: 'mbay', assignNote: 'Nhờ chú báo họ nội' },
  { id: 't2', templateId: 'y', status: 'todo', owner: 'mlan', assignNote: 'Riêng cho Lan', note: 'ghi chú riêng' },
], finance: { expenses: [{ id: 'e1', amount: 1000 }] }, history: [{ at: 'x', text: 'riêng tư' }] };
await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh1', $1, $2)`, [U.tuan, JSON.stringify(data)]));

console.log('Kho tệp:');
ok('có 2 kho riêng tư', (await q(`select count(*)::int n from storage.buckets where not public`)).rows[0].n === 2);
await as(U.lan, () => q(`insert into storage.objects (bucket_id, name) values ('case-files', 'dh1/doc/giay-bao-tu.pdf')`));
ok('thành viên tải tài liệu lên được', true);
await expectErr('người lạ không tải lên được', () => as(U.la, () => q(`insert into storage.objects (bucket_id, name) values ('case-files', 'dh1/doc/x.pdf')`)), /row-level security/);
await as(U.lan, () => q(`insert into storage.objects (bucket_id, name) values ('case-files', 'dh1/fin/hoa-don.jpg')`));
ok('Lan (Hậu cần) đính chứng từ chi được', true);
ok('Lan thấy tài liệu chung nhưng không thấy chứng từ chi', (await as(U.lan, () => q(`select name from storage.objects`))).rows.map(r => r.name).join() === 'dh1/doc/giay-bao-tu.pdf');
ok('Hà (Tài chính) thấy cả chứng từ chi', (await as(U.ha, () => q(`select name from storage.objects`))).rows.length === 2);
ok('người lạ không thấy tệp nào', (await as(U.la, () => q(`select name from storage.objects`))).rows.length === 0);
ok('khách chưa đăng nhập không thấy tệp nào', (await as(null, () => q(`select name from storage.objects`))).rows.length === 0);

await as(U.tuan, () => q(`insert into public.pre_needs (id, owner_id, data) values ('cb1', $1, $2)`, [U.tuan, JSON.stringify({ shares: [{ phone: '0912000111', role: 'view' }, { phone: '0912000333', role: 'edit' }] })]));
await as(U.tuan, () => q(`insert into storage.objects (bucket_id, name) values ('pre-files', 'cb1/so-do.pdf')`));
ok('người được chia sẻ (xem) đọc được giấy tờ hồ sơ', (await as(U.lan, () => q(`select name from storage.objects where bucket_id = 'pre-files'`))).rows.length === 1);
await expectErr('người chỉ được xem không thêm giấy tờ', () => as(U.lan, () => q(`insert into storage.objects (bucket_id, name) values ('pre-files', 'cb1/x.pdf')`)), /row-level security/);
await as(U.ha, () => q(`insert into storage.objects (bucket_id, name) values ('pre-files', 'cb1/y.pdf')`));
ok('người được sửa thêm được giấy tờ', true);
ok('người lạ không thấy giấy tờ hồ sơ', (await as(U.la, () => q(`select name from storage.objects where bucket_id = 'pre-files'`))).rows.length === 0);

// Kích hoạt hồ sơ vào đám hiếu dh1 → cả đội đám hiếu mở được giấy tờ
await q(`update public.pre_needs set case_id = 'dh1' where id = 'cb1'`);
await mkUser('00000000-0000-0000-0000-000000000009', '0912000999', 'Khác');
ok('hồ sơ đã kích hoạt: thành viên đám hiếu (Lan) vẫn mở được giấy tờ', (await as(U.lan, () => q(`select name from storage.objects where bucket_id = 'pre-files'`))).rows.length === 2);
ok('hồ sơ đã kích hoạt: người lạ vẫn không mở được', (await as(U.la, () => q(`select name from storage.objects where bucket_id = 'pre-files'`))).rows.length === 0);

console.log('Link nhờ việc:');
const v = (await as(null, () => q(`select public.link_view($1) v`, [TOKEN]))).rows[0].v;
ok('khách mở link xem được đúng người nhận', v && v.memberId === 'mbay');
const txt = JSON.stringify(v);
ok('không lộ số điện thoại, mã link, tài chính, lịch sử, ảnh thờ', !txt.includes('0912') && !txt.includes(TOKEN) && !txt.includes('finance') && !txt.includes('riêng tư') && !txt.includes('base64'));
ok('thấy lời nhắn việc của mình, không thấy lời nhắn việc người khác', txt.includes('Nhờ chú báo họ nội') && !txt.includes('Riêng cho Lan') && !txt.includes('ghi chú riêng'));
ok('mã sai → không thấy gì', (await as(null, () => q(`select public.link_view('SAIMA1234567') v`))).rows[0].v === null);
ok('mã quá ngắn → không thấy gì', (await as(null, () => q(`select public.link_view('') v`))).rows[0].v === null);

const t1 = v.case.tasks.find(t => t.id === 't1');
await as(null, () => q(`select public.link_act($1, $2, $3)`, [TOKEN, JSON.stringify({ ...t1, status: 'doing' }), 'Bắt đầu làm']));
let row = (await q(`select data, version from public.cases where id = 'dh1'`)).rows[0];
ok('nhận việc qua link: trạng thái đổi, lịch sử ghi tên', row.data.tasks[0].status === 'doing' && row.data.history.at(-1).text === 'Chú Bảy (qua link): Bắt đầu làm' && row.version === 2);
await expectErr('không sửa được việc của người khác', () => as(null, () => q(`select public.link_act($1, $2, 'x')`, [TOKEN, JSON.stringify({ id: 't2', templateId: 'y', status: 'done', owner: 'mlan' })])), /không giao cho bác/);
await expectErr('không đổi được người nhận / nội dung việc', () => as(null, () => q(`select public.link_act($1, $2, 'x')`, [TOKEN, JSON.stringify({ ...t1, status: 'done', owner: 'mlan' })])), /chỉ đổi được trạng thái/);
await expectErr('mã sai không làm gì được', () => as(null, () => q(`select public.link_act('SAIMA1234567', $1, 'x')`, [JSON.stringify({ ...t1, status: 'done' })])), /không còn dùng được/);
await as(null, () => q(`select public.link_act($1, $2, 'Đánh dấu đã xong')`, [TOKEN, JSON.stringify({ ...t1, status: 'done' })]));
ok('báo xong qua link', (await q(`select data->'tasks'->0->>'status' s from public.cases`)).rows[0].s === 'done');
await expectErr('việc đã xong không đổi lại được qua link', () => as(null, () => q(`select public.link_act($1, $2, 'x')`, [TOKEN, JSON.stringify({ ...t1, status: 'doing' })])), /đã xong/);
ok('khách vẫn không đọc thẳng được bảng đám hiếu', (await as(null, () => q(`select id from public.cases`)).catch(() => ({ rows: [] }))).rows.length === 0);
await expectErr('khách không gọi được hàm nội bộ tìm link', () => as(null, () => q(`select * from public.link_find($1)`, [TOKEN])), /permission denied/);

// Người đại diện đổi người đó sang “Giới hạn” → link hết hiệu lực
await as(U.tuan, () => q(`update public.cases set data = jsonb_set(data, '{members,3,access}', '"limited"'), version = version + 1 where id = 'dh1'`));
ok('đổi khỏi “Chỉ qua link” thì link không còn dùng được', (await as(null, () => q(`select public.link_view($1) v`, [TOKEN]))).rows[0].v === null);

console.log(`\n${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
