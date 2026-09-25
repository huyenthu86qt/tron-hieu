// CHỈ DÙNG KHI CHẠY THỬ (npm run dev). Không có trong bản build thật.
// Dựng một khách hàng trả phí mẫu để Chủ dự án xem đầy đủ chức năng. Mọi tên có chữ “(mẫu)”.
import type { DirVendor } from '../domain/types';
import { createCase, decide, U1_ID } from '../domain/model';
import { assignTask, completeTask, inviteMember, reportIssue, savePerson, startTask } from '../domain/actions';
import { normalizeCase } from '../domain/normalize';
import { commitVendor, confirmVendor, recordQuote } from '../domain/vendors';
import { addFund, recordPayment, requestExpense, setBudget } from '../domain/finance';
import { addGuest, draftNotice, publish } from '../domain/guests';
import { grantFull, newPreNeed } from '../domain/platform';

export function seedDemo(): string {
  const now = new Date().toISOString();
  const uid = 'u-mau';
  const c = normalizeCase(createCase({ answers: { place: 'hospital', venue: 'home', form: 'cremation', org: 'family', orgType: 'cadre', rite: 'traditional', scale: 'medium' } }));
  c.ownerId = uid;
  savePerson(c, { ...c.person, title: 'Cụ ông', name: 'Nguyễn Văn Hòa (mẫu)', birthYear: '1938', death: '2026-09-24', time: '21:15', hometown: 'Nam Định', u1name: 'Nguyễn Minh Tuấn (mẫu)', u1rel: 'Con trai trưởng' });
  Object.assign(c.members[0], { userId: uid, phone: '0912345678' });
  const lan = inviteMember(c, { name: 'Nguyễn Thị Lan', rel: 'Con gái', access: 'limited', areas: ['Hậu cần', 'Khách / Phúng viếng'], phone: '0912000111' });
  const hung = inviteMember(c, { name: 'Trần Văn Hùng', rel: 'Con rể', access: 'limited', areas: ['Nhà cung cấp', 'Xe cộ'], phone: '0912000222' });
  inviteMember(c, { name: 'Lê Thu Hà', rel: 'Con dâu', access: 'limited', areas: ['Tài chính'], phone: '0912000333' });
  const bay = inviteMember(c, { name: 'Chú Bảy', rel: 'Hàng xóm', access: 'link', areas: ['Liên lạc'] });
  for (const id of ['t0', 'm1b', 'm1c', 'm1d', 'e1a', 'm2a', 'm2b', 'm2c', 'm3d', 'm4a', 'm4b']) completeTask(c, id);
  decide(c, 'time', 'a', '8:00 — đã đăng ký giờ');
  assignTask(c, 't3', bay.id, 'Nhờ chú báo giúp họ nội');
  assignTask(c, 't2', lan.id); startTask(c, 't2');
  assignTask(c, 't8', lan.id);
  assignTask(c, 't5', hung.id); reportIssue(c, 't5', 'Rạp chưa xác nhận giờ dựng', 'Trần Văn Hùng');
  assignTask(c, 't6', hung.id);
  grantFull(c, 'payment', 'DHMAU001');
  c.venues = {
    home: { name: 'Nhà riêng', address: 'Phố Hàng Bạc, Hoàn Kiếm, Hà Nội (địa chỉ mẫu)', geo: { lat: 21.0285, lng: 105.8542 } },
    hall: { name: 'Nhà tang lễ (mẫu)', address: 'Đống Đa, Hà Nội (địa chỉ mẫu)', geo: { lat: 21.0017, lng: 105.8208 } },
  };
  const vd = (id: string, name: string, cats: DirVendor['cats'], lat: number, lng: number, r: number): DirVendor =>
    ({ id, name, phone: '0900 000 ' + id.slice(-3), cats, address: 'Hà Nội (mẫu)', geo: { lat, lng }, radiusKm: r, cond: 'both', active: true, updatedAt: now });
  const dir = [
    vd('vx101', 'Nhà xe Minh An (mẫu)', ['xe'], 21.035, 105.85, 30), vd('vx102', 'Xe tang Bình An (mẫu)', ['xe'], 21.005, 105.82, 25),
    vd('vr201', 'Rạp bàn ghế Phúc Lộc (mẫu)', ['rap'], 21.03, 105.856, 10), vd('vh301', 'Hoa tươi Thanh Tâm (mẫu)', ['hoa'], 21.025, 105.849, 15),
    vd('vh302', 'Hoa tươi Ngọc Lan (mẫu)', ['hoa'], 21.05, 105.87, 12), vd('va401', 'Nấu cỗ Bếp Quê (mẫu)', ['an'], 21.02, 105.86, 10),
    vd('vn501', 'Đội nhạc lễ Trống Đồng (mẫu)', ['nhac'], 21.06, 105.8, 15), vd('vm601', 'Dịch vụ mộ phần An Lạc (mẫu)', ['mo'], 21.01, 105.84, 15),
    vd('vp701', 'Tang lễ trọn gói An Nhiên (mẫu)', ['xe', 'rap', 'hoa', 'an'], 21.027, 105.845, 20),
  ];
  confirmVendor(c, 'xe', 'vx101', false);
  commitVendor(c, 'xe', 'Đón linh cữu tại nhà, đưa tới nơi hỏa táng; 1 xe 16 chỗ cho gia đình', '7:00 sáng 28/09');
  recordQuote(c, 'xe', 'Xe tang và 1 xe 16 chỗ', 4500000, 'Trần Văn Hùng');
  confirmVendor(c, 'rap', 'vr201', false);
  const fund = addFund(c, 'TK chung gia đình', 'bank', '4821');
  const base = { cat: 'khac' as const, holder: '', bank: '', acct: '', reason: '', evidence: '', extra: false, method: 'cash' as const, fund: 'cash-1' };
  const e1 = requestExpense(c, { ...base, name: 'Xe tang và xe đưa gia đình', amount: '4.500.000', cat: 'xe', vendorId: 'vx101', payer: hung.id, reason: 'Theo báo giá nhà xe', evidence: 'bao-gia-xe.jpg' }, U1_ID);
  recordPayment(c, e1.id, 1000000);
  requestExpense(c, { ...base, name: 'Thuê rạp, bàn ghế', amount: '6.500.000', cat: 'rap', vendorId: 'vr201', payer: hung.id, method: 'bank', fund: fund.id, holder: 'NGUYEN VAN LOC', bank: 'BIDV', acct: '1234 5678 901', reason: 'Rạp 40 chỗ, 3 ngày', evidence: 'bao-gia-rap.jpg' }, hung.id);
  const e3 = requestExpense(c, { ...base, name: 'Áo quan và đồ khâm liệm', amount: '18.000.000', payer: U1_ID, evidence: 'hoa-don-ao-quan.jpg' }, U1_ID);
  recordPayment(c, e3.id, 18000000);
  setBudget(c, 120000000);
  const gs: [string, 'Tổ dân phố, lối xóm' | 'Họ ngoại' | 'Bạn bè' | 'Cơ quan, đoàn thể', string | null, number, 'cash' | 'bank', string[]][] = [
    ['Gia đình ông Trần Văn Nam', 'Tổ dân phố, lối xóm', null, 500000, 'cash', ['Hương', 'Hoa']], ['Hội Người cao tuổi tổ 5', 'Tổ dân phố, lối xóm', null, 1000000, 'cash', ['Vòng hoa']],
    ['Bà Lê Thị Mai', 'Họ ngoại', null, 2000000, 'cash', ['Trái cây']], ['Anh chị Phạm Quang Huy', 'Bạn bè', U1_ID, 1000000, 'bank', []],
    ['Chị Đỗ Thu Trang', 'Bạn bè', lan.id, 500000, 'cash', ['Hoa']], ['Anh Vũ Đức Minh', 'Bạn bè', hung.id, 1000000, 'cash', ['Vòng hoa']],
    ['Công ty Cơ khí Đông Á', 'Cơ quan, đoàn thể', null, 2000000, 'bank', ['Vòng hoa']],
  ];
  for (const [name, group, of, amount, method, gifts] of gs) addGuest(c, { name, group, of, amount, method, gifts, note: '' }, 'Nguyễn Thị Lan');
  publish(c, { text: draftNotice(c), auto: true, showPhone: true, phone: '0912345678' });
  c.shifts = [{ id: 's1', memberId: lan.id, from: now, note: 'Đoàn Hội Cựu chiến binh hẹn 15:00', at: now }];

  const pre = newPreNeed(uid, false);
  Object.assign(pre, {
    id: 'cbmau01', paid: true, orderId: 'DHMAU002',
    subject: { title: 'Cụ bà', name: 'Trần Thị Mai (mẫu)', birthYear: '1941', hometown: 'Nam Định', idNote: 'CCCD để trong tủ thờ' },
    rep: { name: 'Nguyễn Minh Tuấn', phone: '0912345678', rel: 'Con trai trưởng' },
    contacts: [{ name: 'Nguyễn Thị Lan', phone: '0912000111', rel: 'Con gái' }, { name: 'Trần Văn Hùng', phone: '0912000222', rel: 'Con rể' }],
    wish: { form: 'cremation', venue: 'home', rite: 'Phật giáo', items: 'Tràng hạt, bộ áo the', scale: 'medium', msg: '', milestones: ['d49', 'd100', 'gio'] },
    budget: { amount: 120000000, vendors: { hoa: 'vh302' } },
    shares: [{ id: 'sh1', name: 'Nguyễn Thị Lan', phone: '0912000111', role: 'edit' }],
  });
  const order = (code: string, product: 'full' | 'pre', name: string, kind: 'case' | 'pre', id: string, tname: string, amount: number) =>
    ({ id: code, code, userId: uid, product, productName: name, target: { kind, id, name: tname }, amount, status: 'paid', createdAt: now, expiresAt: now, paidAt: now, note: 'Dữ liệu mẫu' });

  localStorage.setItem('damhieu.cases.v1', JSON.stringify({ [c.id]: c }));
  localStorage.setItem('damhieu.platform.v1', JSON.stringify({
    users: [{ id: uid, name: 'Nguyễn Minh Tuấn (mẫu)', phone: '0912345678', passHash: 'mau', salt: 'mau', createdAt: now, failed: 0 }],
    session: { userId: uid, at: now, expiresAt: new Date(Date.now() + 30 * 864e5).toISOString(), version: 0 },
    directory: dir, preNeeds: [pre],
    orders: [order('DHMAU001', 'full', 'Mở đầy đủ đám hiếu', 'case', c.id, 'Đám hiếu Cụ ông Nguyễn Văn Hòa (mẫu)', 299000), order('DHMAU002', 'pre', 'Chuẩn bị trước', 'pre', 'cbmau01', 'Hồ sơ chuẩn bị Trần Thị Mai (mẫu)', 199000)],
  }));
  return c.id;
}
