// Kiểm tra 0006 (Sổ tưởng nhớ, Góc bình an) trên PGlite. Chạy: node tests-3d.mjs 0001 0002 0003 0004 0005 0006
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
ok('chạy 0006 và chạy lại không lỗi', true);

const U = { tuan: '00000000-0000-0000-0000-000000000001', lan: '00000000-0000-0000-0000-000000000002', la: '00000000-0000-0000-0000-000000000003', adm: '00000000-0000-0000-0000-000000000004' };
const mk = (id, phone, name) => db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)`, [id, `${phone}@sdt.tronhieu.app`, JSON.stringify({ name, phone })]);
await mk(U.tuan, '0912345678', 'Tuấn'); await mk(U.lan, '0912000111', 'Lan'); await mk(U.la, '0999999999', 'Người lạ'); await mk(U.adm, '0987654321', 'Admin');
await db.query(`update public.profiles set is_admin = true where id = $1`, [U.adm]);
async function as(uid, fn) { await db.exec(`set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`); try { return await fn(); } finally { await db.exec('reset role;'); } }
const q = (s, p) => db.query(s, p);

await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh1', $1, $2)`, [U.tuan, JSON.stringify({ id: 'dh1', history: [], members: [
  { id: 'u1', name: 'Tuấn', access: 'full', areas: ['Toàn bộ'], userId: U.tuan }, { id: 'ml', name: 'Lan', access: 'limited', areas: ['Hậu cần'], userId: U.lan }] })]));
await as(U.tuan, () => q(`insert into public.public_pages (slug, case_id, content, published) values ('cu-hoa', 'dh1', '{}', true)`));

console.log('Sổ tưởng nhớ:');
const add = (uid, name, body, vis) => as(uid, () => q(`insert into public.memories (case_id, author_id, author_name, body, visibility) values ('dh1', $1, $2, $3, $4)`, [uid, name, body, vis]));
await add(U.lan, 'Lan', 'Bố hay dặn: sống cho tử tế.', 'family');
await add(U.lan, 'Lan', 'Con nhớ bố nhiều lắm (riêng).', 'private');
await add(U.tuan, 'Tuấn', 'Bố là người thầy đầu tiên của con.', 'public');
ok('Tuấn thấy kỷ niệm gia đình của Lan nhưng không thấy dòng riêng của Lan', (await as(U.tuan, () => q(`select body from public.memories`))).rows.map(r => r.body).sort().join('|') === 'Bố hay dặn: sống cho tử tế.|Bố là người thầy đầu tiên của con.');
ok('Lan thấy cả dòng riêng của mình', (await as(U.lan, () => q(`select id from public.memories`))).rows.length === 3);
ok('người lạ không thấy gì', (await as(U.la, () => q(`select id from public.memories`))).rows.length === 0);
await expectErr('người lạ không viết vào sổ được', () => add(U.la, 'Lạ', 'x', 'family'), /row-level security/);
await expectErr('không viết thay tên người khác', () => as(U.lan, () => q(`insert into public.memories (case_id, author_id, author_name, body) values ('dh1', $1, 'Tuấn', 'giả')`, [U.tuan])), /row-level security/);
await expectErr('Tuấn không sửa được bài của Lan', async () => { const r = await as(U.tuan, () => q(`update public.memories set body = 'sửa' where author_name = 'Lan' and visibility = 'family' returning id`)); if (!r.rows.length) throw new Error('không sửa được'); }, /không sửa được/);

console.log('Lời tưởng nhớ của khách:');
await as(null, () => q(`select public.submit_guest_memory('cu-hoa', 'Bác Tư hàng xóm', 'Cụ hiền lành, tốt bụng với cả xóm.')`));
await expectErr('trang không công khai / sai tên trang thì không gửi được', () => as(null, () => q(`select public.submit_guest_memory('khong-co', 'X', 'abc')`)), /không còn nhận/);
ok('lời của khách chưa hiện công khai trước khi gia đình duyệt', (await as(null, () => q(`select * from public.public_memories('cu-hoa')`))).rows.map(r => r.body).join() === 'Bố là người thầy đầu tiên của con.');
ok('Lan (không phải người đại diện) không thấy lời khách chờ duyệt', (await as(U.lan, () => q(`select id from public.memories where kind = 'guest'`))).rows.length === 0);
const g = (await as(U.tuan, () => q(`select id, status from public.memories where kind = 'guest'`))).rows;
ok('người đại diện thấy lời khách chờ duyệt', g.length === 1 && g[0].status === 'pending');
await expectErr('Lan không duyệt được', () => as(U.lan, () => q(`select public.moderate_memory($1, 'approved')`, [g[0].id])), /người đại diện/);
await as(U.tuan, () => q(`select public.moderate_memory($1, 'approved')`, [g[0].id]));
ok('duyệt xong: hiện trên trang cáo phó', (await as(null, () => q(`select author_name from public.public_memories('cu-hoa')`))).rows.some(r => r.author_name === 'Bác Tư hàng xóm'));
ok('khách chưa đăng nhập không đọc thẳng bảng sổ tưởng nhớ', (await as(null, () => q(`select id from public.memories`)).catch(() => ({ rows: [] }))).rows.length === 0);

console.log('Góc bình an:');
ok('5 bài mẫu ở dạng nháp', (await q(`select count(*)::int n from public.articles where status = 'draft'`)).rows[0].n === 5);
ok('khách không thấy bài nháp', (await as(null, () => q(`select id from public.articles`))).rows.length === 0);
ok('Admin thấy bài nháp', (await as(U.adm, () => q(`select id from public.articles`))).rows.length === 5);
await expectErr('người dùng thường không đăng bài', async () => { const r = await as(U.tuan, () => q(`update public.articles set status = 'published' where id = 'a-49-ngay' returning id`)); if (!r.rows.length) throw new Error('không đăng được'); }, /không đăng được/);
await as(U.adm, () => q(`update public.articles set status = 'published', publish_at = now() - interval '1 minute' where id = 'a-49-ngay'`));
await as(U.adm, () => q(`update public.articles set status = 'published', publish_at = now() + interval '1 day' where id = 'a-100-ngay'`));
const pub = (await as(null, () => q(`select id from public.articles`))).rows.map(r => r.id);
ok('khách thấy bài đã đăng; bài hẹn giờ chưa tới thì chưa thấy', pub.join() === 'a-49-ngay');

console.log(`\n${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
