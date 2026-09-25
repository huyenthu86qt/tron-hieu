// Chạy thử migration Phase 3a trên Postgres trong bộ nhớ (PGlite) với phần auth giả lập như Supabase.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const db = new PGlite();
const sql = fs.readFileSync(process.argv[2], 'utf8');
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
`);
await db.exec(sql);
console.log('Migration chạy xong. Lần 2 (chạy lại được):');
await db.exec(sql);
ok('chạy lại lần 2 không lỗi', true);

const U = { tuan: '00000000-0000-0000-0000-000000000001', lan: '00000000-0000-0000-0000-000000000002', la: '00000000-0000-0000-0000-000000000003', adm: '00000000-0000-0000-0000-000000000004', ha: '00000000-0000-0000-0000-000000000005' };
const mkUser = (id, phone, name) => db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [id, `${phone}@sdt.tronhieu.app`, JSON.stringify({ name, phone })]);
await mkUser(U.tuan, '0912345678', 'Tuấn'); await mkUser(U.lan, '0912000111', 'Lan'); await mkUser(U.la, '0999999999', 'Người lạ');
await mkUser(U.adm, '0987654321', 'Admin'); await mkUser(U.ha, '0912000333', 'Hà');
ok('tự tạo hồ sơ khi đăng ký', (await db.query(`select count(*)::int n from public.profiles`)).rows[0].n === 5);
await db.query(`update public.profiles set is_admin = true where phone = '0987654321'`);

// Chạy câu lệnh dưới vai trò một người dùng
async function as(uid, fn) {
  await db.exec(`set role ${uid ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role;`); }
}
const q = (s, p) => db.query(s, p);

const data = { id: 'dh1', person: { title: 'Cụ ông', name: 'Hòa' }, members: [
  { id: 'u1', name: 'Tuấn', access: 'full', areas: ['Toàn bộ'], phone: '0912345678' },
  { id: 'mlan', name: 'Lan', access: 'limited', areas: ['Hậu cần'], phone: '0912000111' },
  { id: 'mha', name: 'Hà', access: 'limited', areas: ['Tài chính'], phone: '0912000333' },
], finance: { expenses: [] }, ledger: [{ x: 1 }], access: { plan: 'full' } };

console.log('Đám hiếu & quyền:');
await as(U.tuan, () => q(`insert into public.cases (id, owner_id, data) values ('dh1', $1, $2)`, [U.tuan, JSON.stringify(data)]));
const row = (await q(`select access, data from public.cases where id='dh1'`)).rows[0];
ok('gói luôn bắt đầu miễn phí (không tự ghi “full” được)', row.access.plan === 'free' && !('access' in row.data) && !('ledger' in row.data));
ok('bảng thành viên tự khớp', (await q(`select count(*)::int n from public.case_members where case_id='dh1'`)).rows[0].n === 3);
ok('thành viên (theo số điện thoại) thấy đám hiếu', (await as(U.lan, () => q(`select id from public.cases`))).rows.length === 1);
ok('người lạ không thấy', (await as(U.la, () => q(`select id from public.cases`))).rows.length === 0);
ok('Admin không đọc được nội dung đám hiếu', (await as(U.adm, () => q(`select id from public.cases`))).rows.length === 0);
await as(U.lan, () => q(`update public.cases set data = jsonb_set(data, '{mourning}', 'true'), version = version + 1 where id = 'dh1'`));
ok('thành viên sửa được việc', (await q(`select data->>'mourning' m from public.cases`)).rows[0].m === 'true');
await expectErr('thành viên không sửa được đội', () => as(U.lan, () => q(`update public.cases set data = jsonb_set(data, '{members,1,access}', '"full"') where id = 'dh1'`)), /người đại diện/);
await expectErr('không ai tự mở gói (cột quyền bị khóa)', () => as(U.tuan, () => q(`update public.cases set access = '{"plan":"full"}' where id = 'dh1'`)), /permission denied/);
await expectErr('người lạ không tạo đám hiếu mang tên người khác', () => as(U.la, () => q(`insert into public.cases (id, owner_id, data) values ('dh2', $1, '{}')`, [U.tuan])));

console.log('Sổ phúng viếng:');
await as(U.lan, () => q(`insert into public.condolences (id, case_id, info, amount, method) values ('g1', 'dh1', '{"name":"Bác Tư"}', 500000, 'cash')`));
ok('Lan (Hậu cần) ghi được khách', (await q(`select count(*)::int n from public.condolences`)).rows[0].n === 1);
ok('Lan không đọc được bảng số tiền', (await as(U.lan, () => q(`select * from public.condolences`))).rows.length === 0);
const lanView = (await as(U.lan, () => q(`select * from public.case_ledger('dh1')`))).rows;
ok('Lan thấy tên khách nhưng không thấy số tiền', lanView.length === 1 && lanView[0].amount === null && lanView[0].info.name === 'Bác Tư');
const haView = (await as(U.ha, () => q(`select * from public.case_ledger('dh1')`))).rows;
ok('Hà (Tài chính) thấy số tiền', Number(haView[0].amount) === 500000);
ok('người lạ không thấy gì', (await as(U.la, () => q(`select * from public.case_ledger('dh1')`))).rows.length === 0);
await as(U.lan, () => q(`insert into public.expense_payees (case_id, expense_id, holder, bank, acct) values ('dh1','e1','NGUYEN VAN A','BIDV','123')`));
ok('Lan ghi được tài khoản bên nhận nhưng không đọc lại được', (await as(U.lan, () => q(`select * from public.expense_payees`))).rows.length === 0);
ok('Tuấn đọc được tài khoản bên nhận', (await as(U.tuan, () => q(`select * from public.expense_payees`))).rows.length === 1);

console.log('Đơn hàng & thanh toán giả lập:');
await expectErr('người lạ không tạo đơn cho đám hiếu người khác', () => as(U.la, () => q(`select * from public.create_order('full','case','dh1','x',null,null)`)), /quyền/);
await expectErr('Lan (Giới hạn) không tạo đơn', () => as(U.lan, () => q(`select * from public.create_order('full','case','dh1','x',null,null)`)), /quyền/);
const o = (await as(U.tuan, () => q(`select * from public.create_order('full','case','dh1','Đám hiếu Hòa','/dh/dh1','2027-09-14T16:59:59Z')`))).rows[0];
ok('Tuấn tạo đơn, giá lấy từ máy chủ', /^DH[A-Z0-9]{6}$/.test(o.code) && Number(o.amount) === 299000);
const o2 = (await as(U.tuan, () => q(`select * from public.create_order('full','case','dh1','Đám hiếu Hòa','/dh/dh1',null)`))).rows[0];
ok('không tạo đơn trùng khi còn đơn chờ', o2.code === o.code);
const short = (await as(U.tuan, () => q(`select public.simulate_bank_tx('T1', 289000, $1) r`, ['CK ' + o.code]))).rows[0].r;
ok('thiếu tiền → chưa khớp', short.status === 'unmatched' && short.reason === 'Thiếu tiền');
const good = (await as(U.tuan, () => q(`select public.simulate_bank_tx('T2', 299000, $1) r`, ['CK ' + o.code]))).rows[0].r;
ok('đúng tiền → khớp', good.status === 'matched');
ok('đám hiếu được mở đầy đủ', (await q(`select access->>'plan' p, access->>'activeUntil' u from public.cases`)).rows[0].p === 'full');
ok('gọi lại không xử lý hai lần', (await as(U.tuan, () => q(`select public.simulate_bank_tx('T2', 299000, $1) r`, [o.code]))).rows[0].r.duplicate === true);
ok('người dùng không đọc được giao dịch ngân hàng', (await as(U.tuan, () => q(`select * from public.bank_txs`))).rows.length === 0);
ok('Admin đọc được giao dịch', (await as(U.adm, () => q(`select * from public.bank_txs`))).rows.length === 2);
const tx1 = (await q(`select id from public.bank_txs where provider_tx_id='T1'`)).rows[0].id;
await expectErr('người thường không gán tay được', () => as(U.tuan, () => q(`select public.admin_assign_tx($1, $2, 'x')`, [tx1, o.code])), /Admin/);
await expectErr('Admin không gán vào đơn đã thanh toán', () => as(U.adm, () => q(`select public.admin_assign_tx($1, $2, 'đã đối chiếu')`, [tx1, o.code])), /đã thanh toán/);
await as(U.adm, () => q(`update public.app_settings set data = jsonb_set(data, '{sepay,env}', '"live"')`)).catch(() => {});
ok('người dùng không tự đổi cài đặt', (await q(`select data->'sepay'->>'env' e from public.app_settings`)).rows[0].e === 'test');

console.log('Admin:');
ok('người thường gọi admin_cases không thấy gì', (await as(U.tuan, () => q(`select * from public.admin_cases()`))).rows.length === 0);
const ac = (await as(U.adm, () => q(`select * from public.admin_cases()`))).rows;
ok('Admin thấy tên + trạng thái', ac.length === 1 && ac[0].name === 'Cụ ông Hòa' && !('data' in ac[0]));
await as(U.adm, () => q(`select public.admin_set_case_access('dh1', false, 'khách yêu cầu hoàn tiền', null)`));
ok('Admin thu hồi quyền có lý do', (await q(`select access->>'plan' p from public.cases`)).rows[0].p === 'free');
await as(U.adm, () => q(`select public.admin_save_product('full', $1)`, [JSON.stringify({ id: 'full', name: 'Mở đầy đủ đám hiếu', price: 350000, active: true })]));
ok('Admin đổi giá, đơn cũ giữ giá cũ', (await q(`select amount from public.orders where code=$1`, [o.code])).rows[0].amount == 299000);
await expectErr('người thường không đổi giá', () => as(U.tuan, () => q(`select public.admin_save_product('full', '{"price":1}')`)), /Admin/);
await expectErr('người thường không tự ghi nhật ký', () => as(U.tuan, () => q(`select public.log_audit('Giả mạo','x')`)), /permission denied/);
await expectErr('người thường không tự mở gói qua hàm nội bộ', () => as(U.la, () => q(`select public.apply_paid_order($1)`, [o.code])), /permission denied/);
 await expectErr('khách chưa đăng nhập không gọi hàm tạo đơn', () => as(null, () => q(`select * from public.create_order('full','case','dh1','x',null,null)`)), /permission denied|Cần đăng nhập/);
await expectErr('người thường không tự bật Admin', () => as(U.tuan, () => q(`update public.profiles set is_admin = true where id = $1`, [U.tuan])), /permission denied/);
await as(U.tuan, () => q(`update public.profiles set name = 'Nguyễn Minh Tuấn' where id = $1`, [U.tuan]));
ok('người dùng sửa được tên mình', (await q(`select name from public.profiles where id=$1`, [U.tuan])).rows[0].name === 'Nguyễn Minh Tuấn');
ok('nhật ký có đủ các thao tác', (await as(U.adm, () => q(`select action from public.audit_log`))).rows.length >= 8);

console.log('Hồ sơ chuẩn bị & trang công khai:');
await as(U.tuan, () => q(`insert into public.pre_needs (id, owner_id, data) values ('cb1', $1, $2)`, [U.tuan, JSON.stringify({ subject: { name: 'Mai' }, shares: [{ phone: '0912000111', role: 'view' }] })]));
ok('người được chia sẻ thấy hồ sơ', (await as(U.lan, () => q(`select id from public.pre_needs`))).rows.length === 1);
ok('người lạ không thấy', (await as(U.la, () => q(`select id from public.pre_needs`))).rows.length === 0);
await as(U.lan, () => q(`update public.pre_needs set data = jsonb_set(data, '{special}', '"x"') where id='cb1'`));
ok('người chỉ xem không sửa được', (await q(`select data->>'special' s from public.pre_needs`)).rows[0].s === null);
await expectErr('chưa mở gói thì không kích hoạt được', () => as(U.tuan, () => q(`select public.activate_pre_need('cb1','dh9','{"members":[]}', null)`)), /gói/);
await expectErr('không tự đánh dấu đã trả tiền', () => as(U.tuan, () => q(`update public.pre_needs set paid = true where id='cb1'`)), /permission denied/);
const po = (await as(U.tuan, () => q(`select * from public.create_order('pre','pre','cb1','Hồ sơ Mai',null,null)`))).rows[0];
await as(U.tuan, () => q(`select public.simulate_bank_tx('T3', 199000, $1)`, [po.code]));
await as(U.tuan, () => q(`select public.activate_pre_need('cb1','dh9', $1, null)`, [JSON.stringify({ members: [{ id: 'u1', access: 'full', areas: ['Toàn bộ'] }] })]));
ok('kích hoạt → đám hiếu mở đầy đủ, hồ sơ chỉ đọc', (await q(`select access->>'plan' p from public.cases where id='dh9'`)).rows[0].p === 'full'
  && (await q(`select case_id from public.pre_needs`)).rows[0].case_id === 'dh9');
await as(U.tuan, () => q(`insert into public.public_pages (slug, case_id, content, published) values ('cu-hoa','dh1','{"x":1}', true)`));
ok('khách (chưa đăng nhập) đọc được trang đã công bố', (await as(null, () => q(`select slug from public.public_pages`))).rows.length === 1);
ok('khách không đọc được đám hiếu', (await as(null, () => q(`select id from public.cases`)).catch(() => ({ rows: [] }))).rows.length === 0);

console.log(`\nKết quả: ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
