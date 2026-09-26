// Kiểm tra 0003 (đề xuất nhà cung cấp từ gia đình) trên PGlite: chạy 0001 + 0003.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (n, c, x = '') => { if (c) { pass++; console.log('  ✓', n); } else { fail++; console.log('  ✗', n, x); } };
const expectErr = async (n, fn, re) => { try { await fn(); ok(n, false, '(không báo lỗi)'); } catch (e) { ok(n, re ? re.test(e.message) : true, e.message); } };
await db.exec(`
  create role anon nologin; create role authenticated nologin; create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated; create publication supabase_realtime;`);
for (const f of process.argv.slice(2)) await db.exec(fs.readFileSync(f, 'utf8'));
await db.exec(fs.readFileSync(process.argv.at(-1), 'utf8'));
ok('chạy và chạy lại không lỗi', true);
const T = '00000000-0000-0000-0000-000000000001', A = '00000000-0000-0000-0000-000000000004';
const mk = (id, phone, name) => db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)`, [id, `${phone}@sdt.tronhieu.app`, JSON.stringify({ name, phone })]);
await mk(T, '0912345678', 'Tuấn'); await mk(A, '0987654321', 'Admin');
await db.query(`update public.profiles set is_admin = true where id = $1`, [A]);
async function as(uid, fn) { await db.exec(`set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`); try { return await fn(); } finally { await db.exec('reset role;'); } }
const data = { id: 'dh1', person: { name: 'Cụ Hòa (riêng tư)' }, members: [{ id: 'u1', name: 'Tuấn', access: 'full', areas: ['Toàn bộ'] }],
  familyVendors: [
    { id: 'f1', name: 'Rạp Minh Anh', phone: '0911 222 333', cats: ['rap'], address: 'Long Biên', note: 'nhà bác cả giới thiệu (riêng)', share: true },
    { id: 'f2', name: 'Cô Lan nấu cỗ', phone: '0977000111', cats: ['an'], address: '', note: '', share: false },
  ],
  vendors: { rap: { vendorId: 'f1', family: true, status: 'committed', incidents: [{ text: 'đến muộn' }], acceptedAt: '2026-09-26' } } };
await as(T, () => db.query(`insert into public.cases (id, owner_id, data) values ('dh1', $1, $2)`, [T, JSON.stringify(data)]));
await expectErr('người dùng thường không gọi được', () => as(T, () => db.query(`select * from public.admin_shared_family_vendors()`)), /Chỉ Admin/);
await expectErr('khách chưa đăng nhập không gọi được', () => as(null, () => db.query(`select * from public.admin_shared_family_vendors()`)), /permission denied/);
const rows = (await as(A, () => db.query(`select * from public.admin_shared_family_vendors()`))).rows;
ok('Admin chỉ thấy bên gia đình đồng ý giới thiệu', rows.length === 1 && rows[0].name === 'Rạp Minh Anh');
ok('kèm dấu hiệu dùng thật: đã chọn, cam kết, nghiệm thu, 1 sự cố', rows[0].used && rows[0].committed && rows[0].accepted && rows[0].incidents === 1);
const txt = JSON.stringify(rows);
ok('không lộ tên người mất, ghi chú riêng, mã đám hiếu', !txt.includes('riêng tư') && !txt.includes('bác cả') && !txt.includes('dh1'));
console.log(`\n${pass} đạt, ${fail} lỗi`); process.exit(fail ? 1 : 0);
