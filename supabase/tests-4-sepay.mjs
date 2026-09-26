// Kiểm tra 0009 SePay thật. Chạy: node tests-4-sepay.mjs 0001 … 0009 — dựa trên khung của tests-3d:
// Kiểm tra 0006 (Sổ tưởng nhớ, Góc bình an) trên PGlite. Chạy: node tests-3d.mjs 0001 … 0006 (hoặc … 0008 để kiểm tra thêm Góc Bình An)
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const db = new PGlite();
let pass = 0, fail = 0;
const ok = (n, c, x = '') => { if (c) { pass++; console.log('  ✓', n); } else { fail++; console.log('  ✗', n, x); } };
const expectErr = async (n, fn, re) => { try { await fn(); ok(n, false, '(không báo lỗi)'); } catch (e) { ok(n, re ? re.test(e.message) : true, e.message); } };

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin; create schema auth; create schema extensions; create schema storage;
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


const U = { tuan: '00000000-0000-0000-0000-000000000001', la: '00000000-0000-0000-0000-000000000003', adm: '00000000-0000-0000-0000-000000000004' };
const mk = (id, phone, name) => db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)`, [id, `${phone}@sdt.tronhieu.app`, JSON.stringify({ name, phone })]);
await mk(U.tuan, '0912345678', 'Tuấn'); await mk(U.la, '0999999999', 'Người lạ'); await mk(U.adm, '0987654321', 'Admin');
await db.query(`update public.profiles set is_admin = true where id = $1`, [U.adm]);
async function as(uid, fn) { await db.exec(`set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`); try { return await fn(); } finally { await db.exec('reset role;'); } }
async function svc(fn) { await db.exec(`set role service_role; select set_config('request.jwt.claim.sub', '', false);`); try { return await fn(); } finally { await db.exec('reset role;'); } }
const q = (s, p) => db.query(s, p);
await db.exec(`grant usage on schema public to service_role;`);
await db.query(`update public.app_settings set data = jsonb_set(data, '{sepay,account}', '{"bank":"MBBank","number":"0123456789","holder":"NGUYEN THU HUYEN","active":true}') where id = 1`);
await db.query(`update public.products set data = jsonb_set(data, '{price}', '499000') where id = 'full'`);
await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh1', $1, '{"id":"dh1","history":[],"members":[]}')`, [U.tuan]));
await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh2', $1, '{"id":"dh2","history":[],"members":[]}')`, [U.tuan]));
const order = async (cid) => (await as(U.tuan, () => q(`select * from public.create_order('full','case',$1,'Đám hiếu','/dh/'||$1,'2027-09-14T16:59:59Z')`, [cid]))).rows[0];
const hook = (body) => svc(() => q(`select public.sepay_webhook($1) r`, [JSON.stringify(body)])).then(r => r.rows[0].r);
const tx = (id, o, extra = {}) => ({ id, gateway: 'MBBank', transactionDate: '2026-09-27 10:00:00', accountNumber: '0123456789', code: null, content: `${o.code} chuyen tien`, transferType: 'in', transferAmount: 499000, accumulated: 0, referenceCode: 'FT1', description: 'x', ...extra });

console.log('SePay thật:');
const o1 = await order('dh1');
ok('đơn lấy đúng giá 499.000 từ máy chủ', Number(o1.amount) === 499000);
await expectErr('người dùng thường không gọi được hàm webhook', () => as(U.tuan, () => q(`select public.sepay_webhook('{}')`)), /permission denied/);
await expectErr('khách chưa đăng nhập không gọi được hàm webhook', () => as(null, () => q(`select public.sepay_webhook('{}')`)), /permission denied/);
ok('tiền RA bị bỏ qua', (await hook(tx(1, o1, { transferType: 'out' }))).ignored === 'not incoming');
const wrong = await hook(tx(2, o1, { accountNumber: '9999999' }));
ok('tiền vào tài khoản khác → chưa khớp', wrong.status === 'unmatched' && /tài khoản khác/.test(wrong.reason));
const short = await hook(tx(3, o1, { transferAmount: 490000 }));
ok('thiếu tiền → chưa khớp', short.status === 'unmatched' && short.reason === 'Thiếu tiền');
const good = await hook(tx(4, o1, { content: `MBVCB.123.${o1.code.toLowerCase()} CHUYEN TIEN` }));
ok('đúng mã (kể cả chữ thường, lẫn nội dung ngân hàng), đúng tiền, đúng tài khoản → khớp', good.status === 'matched' && good.order === o1.code);
ok('đám hiếu được mở đầy đủ', (await q(`select access->>'plan' p, access->>'orderId' oid from public.cases where id = 'dh1'`)).rows[0].p === 'full');
ok('SePay gửi lại cùng giao dịch → không xử lý hai lần', (await hook(tx(4, o1))).duplicate === true);
ok('nhật ký ghi SePay khớp giao dịch', (await q(`select count(*)::int n from public.audit_log where actor = 'SePay' and action = 'Khớp giao dịch'`)).rows[0].n === 1);

console.log('Chuyển sang chạy thật:');
const o2 = await order('dh2');
await as(U.tuan, () => q(`select public.simulate_bank_tx('S1', 499000, $1)`, [o2.code]));
ok('giả lập vẫn chạy ở môi trường thử', (await q(`select status from public.orders where code = $1`, [o2.code])).rows[0].status === 'paid');
await expectErr('người không phải Admin không chuyển được', () => as(U.tuan, () => q(`select public.admin_sepay_go_live()`)), /Chỉ Admin/);
const gl = (await as(U.adm, () => q(`select public.admin_sepay_go_live() r`))).rows[0].r;
const left = (await q(`select code from public.orders order by code`)).rows.map(r => r.code);
ok('dọn đơn thử, giữ đơn trả bằng giao dịch thật', left.length === 1 && left[0] === o1.code && gl.orders === 1);
ok('dọn giao dịch giả lập, giữ giao dịch thật', (await q(`select count(*)::int n from public.bank_txs where provider_tx_id not like 'sepay:%'`)).rows[0].n === 0 && (await q(`select count(*)::int n from public.bank_txs`)).rows[0].n === 3);
ok('môi trường chuyển sang “live”', (await q(`select data->'sepay'->>'env' e from public.app_settings`)).rows[0].e === 'live');
await expectErr('chạy thật thì không giả lập được nữa', () => as(U.tuan, () => q(`select public.simulate_bank_tx('S2', 499000, 'x')`)), /Chỉ giả lập/);
ok('đám hiếu đã mở bằng thanh toán thử vẫn giữ quyền', (await q(`select access->>'plan' p from public.cases where id = 'dh2'`)).rows[0].p === 'full');

console.log(`
${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
