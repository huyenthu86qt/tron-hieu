// Kiểm tra 0005 (chuyển quyền đại diện, xóa theo yêu cầu sau 7 ngày, giữ đơn hàng) trên PGlite.
// Cách chạy: node tests-3c.mjs 0001 0002 0003 0004 0005 (đường dẫn các tệp migration theo thứ tự)
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const db = new PGlite();
let pass = 0, fail = 0;
const ok = (n, c, x = '') => { if (c) { pass++; console.log('  ✓', n); } else { fail++; console.log('  ✗', n, x); } };
const expectErr = async (n, fn, re) => { try { await fn(); ok(n, false, '(không báo lỗi)'); } catch (e) { ok(n, re ? re.test(e.message) : true, e.message); } };

await db.exec(`
  create role anon nologin; create role authenticated nologin; create schema auth; create schema extensions; create schema storage;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}', encrypted_password text, updated_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function extensions.gen_salt(text) returns text language sql as $$ select 's' $$;
  create function extensions.crypt(text, text) returns text language sql as $$ select $1 $$;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
  create table storage.objects (bucket_id text, name text, owner_id text default auth.uid()::text);
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated; grant select, insert, delete on storage.objects to anon, authenticated;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated; create publication supabase_realtime;`);
const files = process.argv.slice(2);
for (const f of files) await db.exec(fs.readFileSync(f, 'utf8'));
await db.exec(fs.readFileSync(files.at(-1), 'utf8'));
ok('chạy 0005 và chạy lại không lỗi (không có pg_cron thì chỉ báo)', true);

const U = { tuan: '00000000-0000-0000-0000-000000000001', lan: '00000000-0000-0000-0000-000000000002', la: '00000000-0000-0000-0000-000000000003', adm: '00000000-0000-0000-0000-000000000004' };
const mk = (id, phone, name) => db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)`, [id, `${phone}@sdt.tronhieu.app`, JSON.stringify({ name, phone })]);
await mk(U.tuan, '0912345678', 'Tuấn'); await mk(U.lan, '0912000111', 'Lan'); await mk(U.la, '0999999999', 'Người lạ'); await mk(U.adm, '0987654321', 'Admin');
await db.query(`update public.profiles set is_admin = true where id = $1`, [U.adm]);
async function as(uid, fn) { await db.exec(`set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`); try { return await fn(); } finally { await db.exec('reset role;'); } }
const q = (s, p) => db.query(s, p);

const data = { id: 'dh1', person: { title: 'Cụ ông', name: 'Hòa' }, history: [], members: [
  { id: 'u1', name: 'Tuấn', rel: 'Con trai trưởng', access: 'full', areas: ['Toàn bộ'], userId: U.tuan },
  { id: 'mlan', name: 'Lan', rel: 'Con gái', access: 'full', areas: ['Hậu cần'], userId: U.lan },
] };
await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh1', $1, $2)`, [U.tuan, JSON.stringify(data)]));
// App tính sẵn: Lan thành người đại diện (u1), Tuấn thành thành viên thường
const swapped = { ...data, members: [
  { id: 'u1', name: 'Lan', rel: 'Con gái', access: 'full', areas: ['Toàn bộ'], userId: U.lan },
  { id: 'mlan', name: 'Tuấn', rel: 'Con trai trưởng', access: 'full', areas: ['Toàn bộ'], userId: U.tuan },
] };

console.log('Yêu cầu xóa đám hiếu:');
await expectErr('Lan (không phải người đại diện) không yêu cầu xóa đám hiếu được', () => as(U.lan, () => q(`update public.cases set delete_requested_at = now() where id = 'dh1'`)), /người đại diện/);

console.log('Chuyển quyền đại diện:');
await expectErr('Lan không tự chuyển quyền về mình', () => as(U.lan, () => q(`select public.transfer_owner('dh1', $1, $2, 1)`, [U.lan, JSON.stringify(swapped)])), /người đại diện hiện tại/);
await expectErr('không chuyển cho người lạ ngoài đội', () => as(U.tuan, () => q(`select public.transfer_owner('dh1', $1, $2, 1)`, [U.la, JSON.stringify(swapped)])), /tham gia đội/);
await expectErr('nội dung không khớp người nhận thì từ chối', () => as(U.tuan, () => q(`select public.transfer_owner('dh1', $1, $2, 1)`, [U.lan, JSON.stringify(data)])), /không khớp/);
await as(U.tuan, () => q(`select public.transfer_owner('dh1', $1, $2, 1)`, [U.lan, JSON.stringify(swapped)]));
const r1 = (await q(`select owner_id, data from public.cases`)).rows[0];
ok('Tuấn chuyển quyền cho Lan: Lan là chủ, lịch sử ghi lại', r1.owner_id === U.lan && r1.data.history.at(-1).text.includes('chuyển quyền'));
ok('Tuấn vẫn ở trong đội và vẫn thấy đám hiếu', (await as(U.tuan, () => q(`select id from public.cases`))).rows.length === 1);
ok('có nhật ký Admin', (await q(`select count(*)::int n from public.audit_log where action = 'Chuyển quyền người đại diện'`)).rows[0].n === 1);

console.log('Xóa sau 7 ngày:');
await as(U.lan, () => q(`update public.cases set delete_requested_at = now() - interval '3 days', version = version + 1 where id = 'dh1'`));
await q(`select public.process_deletions()`);
ok('mới 3 ngày: chưa xóa', (await q(`select count(*)::int n from public.cases`)).rows[0].n === 1);
const pend = (await as(U.adm, () => q(`select * from public.admin_pending_deletions()`))).rows;
ok('Admin thấy yêu cầu đang chờ (tên + ngày xóa), không thấy nội dung', pend.length === 1 && pend[0].name === 'Cụ ông Hòa' && !('data' in pend[0]));
ok('người thường không xem được danh sách chờ xóa', (await as(U.tuan, () => q(`select * from public.admin_pending_deletions()`))).rows.length === 0);
await expectErr('người dùng không tự gọi được hàm xóa', () => as(U.lan, () => q(`select public.process_deletions()`)), /permission denied/);
await as(U.lan, () => q(`update public.cases set delete_requested_at = now() - interval '8 days', version = version + 1 where id = 'dh1'`));
await as(U.lan, () => q(`insert into storage.objects (bucket_id, name) values ('case-files', 'dh1/doc/a.pdf')`));
const res = (await q(`select public.process_deletions() r`)).rows[0].r;
ok('quá 7 ngày: xóa đám hiếu, có nhật ký', res.cases === 1 && (await q(`select count(*)::int n from public.cases`)).rows[0].n === 0
  && (await q(`select count(*)::int n from public.audit_log where action like 'Xóa đám hiếu theo yêu cầu%'`)).rows[0].n === 1);
const orphans = (await as(U.adm, () => q(`select * from public.admin_orphan_files()`))).rows;
ok('Admin thấy tệp mồ côi của đám hiếu đã xóa để dọn', orphans.length === 1 && orphans[0].path === 'dh1/doc/a.pdf');
ok('người thường không thấy tệp mồ côi', (await as(U.tuan, () => q(`select * from public.admin_orphan_files()`))).rows.length === 0);
await as(U.adm, () => q(`delete from storage.objects where name = 'dh1/doc/a.pdf'`));
ok('Admin dọn được tệp mồ côi', (await q(`select count(*)::int n from storage.objects`)).rows[0].n === 0);

console.log('Xóa tài khoản, giữ đơn hàng:');
await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh2', $1, $2)`, [U.tuan, JSON.stringify({ id: 'dh2', history: [], members: [{ id: 'u1', name: 'Tuấn', access: 'full', areas: ['Toàn bộ'] }, { id: 'ml', name: 'Lan', access: 'full', areas: ['Hậu cần'], userId: U.lan }] })]));
await as(U.lan, () => q(`insert into public.cases (id, owner_id, data) values ('dh3', $1, $2)`, [U.lan, JSON.stringify({ id: 'dh3', history: [], members: [{ id: 'u1', name: 'Lan', access: 'full', areas: ['Toàn bộ'] }, { id: 'mt', name: 'Tuấn', access: 'full', areas: ['Hậu cần'], userId: U.tuan }] })]));
await q(`insert into public.orders (code, user_id, data, status, amount) values ('DHAAAAAA', $1, '{}', 'paid', 299000)`, [U.tuan]);
await as(U.tuan, () => q(`update public.profiles set delete_requested_at = now() - interval '8 days' where id = $1`, [U.tuan]));
const r2 = (await q(`select public.process_deletions() r`)).rows[0].r;
ok('quá 7 ngày: xóa tài khoản', r2.users === 1 && (await q(`select count(*)::int n from public.profiles where id = $1`, [U.tuan])).rows[0].n === 0);
ok('đám hiếu Tuấn đứng tên bị xóa theo', (await q(`select count(*)::int n from public.cases where id = 'dh2'`)).rows[0].n === 0);
const dh3 = (await q(`select data from public.cases where id = 'dh3'`)).rows[0].data;
ok('đám hiếu của người khác vẫn còn; Tuấn còn tên nhưng bỏ liên kết tài khoản', dh3 && dh3.members.find(m => m.id === 'mt').name === 'Tuấn' && !dh3.members.find(m => m.id === 'mt').userId);
const ord = (await q(`select user_id from public.orders where code = 'DHAAAAAA'`)).rows[0];
ok('đơn hàng đã thanh toán được giữ lại (bỏ liên kết tài khoản)', ord && ord.user_id === null);

console.log(`\n${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
