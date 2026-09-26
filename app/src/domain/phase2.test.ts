import { describe, expect, it } from 'vitest';
import type { Answers, CaseData, DirVendor, GeoPoint } from './types';
import { createCase, decide, findDecision, U1_ID } from './model';
import { savePerson, inviteMember, assignTask, returnTask, transferRepresentative } from './actions';
import { DEFAULT_ANSWERS } from './entry';
import { normalizeCase, activatePreNeed } from './normalize';
import {
  addFamilyVendor, afterVenueChange, allAccepted, acceptVendor, catState, choosePackage, commitVendor, confirmVendor,
  distanceKm, packageOffers, parseGeo, rank, resolveVendorDecision, suggestionSnapshot,
} from './vendors';
import {
  addFund, canFinance, children, decideExpense, lockFinance, moveDebt, parseMoney, reconcile, recordPayment, requestExpense,
  totals, type ExpenseForm,
} from './finance';
import { addGuest, publish, syncPublicPage } from './guests';
import { closeCase, closeConds, milestoneList, saveMilestones } from './aftercare';
import {
  checkOtp, createOrder, DEFAULT_PRODUCTS, fullUntil, grantFull, isFull, issueOtp, loginAttempt, matchTransaction, newPreNeed,
  normalizePhone, readiness, type Order, type User,
} from './platform';
import { toLunar } from './lunar';
import { changeDecision } from './model';

const T0 = new Date(2026, 8, 24, 22);
const A = (x: Partial<Answers> = {}): Answers => ({ ...DEFAULT_ANSWERS, ...x });
const mk = (x: Partial<Answers> = {}) => {
  const c = normalizeCase(createCase({ answers: A(x), now: T0 }));
  savePerson(c, { ...c.person, name: 'Nguyễn Văn Hòa', birthYear: '1938', death: '2026-09-24', u1name: 'Nguyễn Minh Tuấn', u1rel: 'Con trai trưởng' });
  return c;
};
// Hà Nội: Hoàn Kiếm và các điểm lân cận (tọa độ thật, không phải dữ liệu của gia đình)
const HOME: GeoPoint = { lat: 21.0285, lng: 105.8542 };
const HALL: GeoPoint = { lat: 21.0017, lng: 105.8208 }; // ~4,6 km
const V = (id: string, cats: DirVendor['cats'], geo: GeoPoint, radiusKm: number, cond: DirVendor['cond'] = 'both'): DirVendor =>
  ({ id, name: id, phone: '0900000000', cats, address: '', geo, radiusKm, cond, active: true, updatedAt: '' });

describe('Nhà cung cấp — đúng loại + gần nhất', () => {
  it('Haversine và đọc tọa độ dán từ bản đồ', () => {
    expect(distanceKm(HOME, HALL)).toBeGreaterThan(4);
    expect(distanceKm(HOME, HALL)).toBeLessThan(5);
    expect(parseGeo('21,0285, 105,8542')).toEqual(HOME);
    expect(parseGeo('21.0285, 105.8542')).toEqual(HOME);
    expect(parseGeo('abc')).toBeNull();
  });
  it('xếp gần trước, lọc bán kính, điều kiện hình thức; bên trong hồ sơ chuẩn bị lên đầu', () => {
    const dir = [
      V('xa', ['xe'], { lat: 21.2, lng: 105.9 }, 30),
      V('gan', ['xe'], { lat: 21.03, lng: 105.855 }, 10),
      V('ngoai', ['xe'], { lat: 21.2, lng: 105.9 }, 5),
      V('chiMai', ['xe'], { lat: 21.029, lng: 105.854 }, 10, 'burial'),
    ];
    const r = rank(dir, 'xe', { name: '', address: '', geo: HOME }, 'cremation');
    expect(r.ok.map(o => o.v.id)).toEqual(['gan', 'xa']);
    expect(rank(dir, 'xe', { name: '', address: '', geo: HOME }, 'cremation', 'xa').ok[0].v.id).toBe('xa');
    const out = rank(dir, 'xe', { name: '', address: '', geo: HOME }, 'cremation', 'ngoai');
    expect(out.out.map(o => o.v.id)).toEqual(['ngoai']);
  });
  it('chưa có tọa độ nơi tổ chức thì không điền sẵn', () => {
    const c = mk();
    const s = catState(c, [V('gan', ['xe'], HOME, 10)], 'xe');
    expect(s.status).toBe('empty');
    expect(s.r.hasGeo).toBe(false);
  });
  it('đổi nơi tổ chức: gợi ý tự cập nhật; bên đã cam kết ở xa tạo mục Cần quyết', () => {
    const c = mk();
    c.venues!.home.geo = HOME; c.venues!.hall.geo = { lat: 21.1, lng: 105.95 };
    const dir = [V('xeGanNha', ['xe'], HOME, 5), V('xeGanHall', ['xe'], { lat: 21.101, lng: 105.951 }, 5), V('rapNha', ['rap'], HOME, 5)];
    confirmVendor(c, 'xe', 'xeGanNha', false);
    commitVendor(c, 'xe', 'Đón linh cữu', 'Sáng ngày đưa tang');
    const before = suggestionSnapshot(c, dir);
    changeDecision(c, 'venue', 'hall', '');
    afterVenueChange(c, dir, before, 'home');
    const d = findDecision(c, 'vendor-xe')!;
    expect(d.status).toBe('pending');
    expect(d.options.map(o => o.k)).toEqual(['keep', 'xeGanHall']);
    resolveVendorDecision(c, 'vendor-xe', 'xeGanHall');
    expect(c.vendors!.xe!.vendorId).toBe('xeGanHall');
    expect(c.tasks.at(-1)!.custom!.title).toContain('Báo hủy');
  });
  it('trọn gói nhận các hạng mục chưa chốt, giữ bên đã chọn', () => {
    const c = mk();
    c.venues!.home.geo = HOME;
    const pkg = V('tronGoi', ['xe', 'rap', 'hoa'], HOME, 10);
    confirmVendor(c, 'hoa', 'khac', false);
    const offers = packageOffers(c, [pkg]);
    expect(offers[0].open.map(k => k.k)).toEqual(['rap', 'xe']);
    expect(offers[0].locked.map(k => k.k)).toEqual(['hoa']);
    choosePackage(c, pkg, ['xe', 'rap']);
    expect(c.vendors!.rap!.vendorId).toBe('tronGoi');
  });
  it('nhà cung cấp gia đình chỉ thuộc đám hiếu; nghiệm thu đủ mới đạt điều kiện', () => {
    const c = mk();
    const id = addFamilyVendor(c, { name: 'Đội kèn bác Tư', phone: '', cats: ['nhac'], address: '', note: '' });
    confirmVendor(c, 'nhac', id, true);
    expect(catState(c, [], 'nhac')).toMatchObject({ status: 'confirmed', vendor: { family: true } });
    expect(allAccepted(c)).toBe(false);
    acceptVendor(c, id, U1_ID);
    expect(allAccepted(c)).toBe(true);
  });
});

const EXP = (x: Partial<ExpenseForm> = {}): ExpenseForm => ({ name: 'Thuê rạp', amount: '6.500.000', cat: 'rap', payer: U1_ID, method: 'cash', fund: 'cash-1', holder: '', bank: '', acct: '', reason: '', evidence: '', extra: false, ...x });

describe('Tài chính', () => {
  it('người đại diện ghi thì duyệt ngay; người khác gửi đề nghị chờ duyệt', () => {
    const c = mk();
    const m = inviteMember(c, { name: 'Lê Thu Hà', rel: 'Con dâu', access: 'limited', areas: ['Tài chính'], phone: '0912345673' });
    const a = requestExpense(c, EXP(), U1_ID);
    const b = requestExpense(c, EXP({ name: 'Hoa', amount: '3200000' }), m.id);
    expect(a.status).toBe('approved');
    expect(b.status).toBe('request');
    decideExpense(c, b.id, false, 'Đã có hoa của cơ quan');
    expect(totals(c.finance!)).toMatchObject({ plan: 6500000, paid: 0, owe: 6500000 });
    recordPayment(c, a.id, 1000000);
    expect(totals(c.finance!)).toMatchObject({ paid: 1000000, owe: 5500000 });
    expect(canFinance(m)).toBe(true);
    expect(canFinance({ ...m, areas: ['Hậu cần'] })).toBe(false);
  });
  it('chuyển khoản cần đủ tài khoản bên nhận; nguồn tiền gia đình chỉ 4 số cuối', () => {
    const c = mk();
    expect(() => requestExpense(c, EXP({ method: 'bank' }), U1_ID)).toThrow('tài khoản bên nhận');
    expect(() => addFund(c, 'TK chung', 'bank', '12345678')).toThrow('4 số cuối');
    expect(addFund(c, 'TK chung', 'bank', '4821').last4).toBe('4821');
    expect(parseMoney('6.500.000 đ')).toBe(6500000);
  });
  it('đối soát: chứng từ, tiền mặt kiểm đếm, sao kê, công nợ → khóa; khóa rồi không sửa được', () => {
    const c = mk();
    const e = requestExpense(c, EXP({ amount: '1000000' }), U1_ID);
    recordPayment(c, e.id, 400000);
    addGuest(c, { name: 'Bác Tư', group: 'Tổ dân phố, lối xóm', of: null, amount: 500000, method: 'cash', gifts: [], note: '' }, 'Chị Lan');
    addGuest(c, { name: 'Anh Huy', group: 'Khác', of: null, amount: 1000000, method: 'bank', gifts: [], note: '' }, 'Chị Lan');
    let r = reconcile(c);
    expect(r.conds.filter(x => !x.ok).map(x => x.key)).toEqual(['evidence', 'cash', 'bank', 'owe']);
    expect(() => lockFinance(c, U1_ID)).toThrow();
    c.finance!.expenses[0].evidence = 'bien-nhan.jpg';
    c.finance!.counted = '500.000';
    c.finance!.bankOk = true;
    moveDebt(c);
    r = reconcile(c);
    expect(r.conds.every(x => x.ok)).toBe(true);
    lockFinance(c, U1_ID);
    expect(() => requestExpense(c, EXP(), U1_ID)).toThrow('đã khóa');
  });
  it('khách “bạn của” từng người con', () => {
    const c = mk();
    inviteMember(c, { name: 'Nguyễn Thị Lan', rel: 'Con gái', access: 'limited', areas: ['Hậu cần'], phone: '0912345674' });
    inviteMember(c, { name: 'Trần Văn Hùng', rel: 'Con rể', access: 'limited', areas: ['Xe cộ'], phone: '0912345675' });
    expect(children(c.members).map(k => k.short)).toEqual(['anh Tuấn', 'chị Lan', 'anh Hùng']);
    expect(() => addGuest(c, { name: 'X', group: 'Bạn bè', of: null, amount: 0, method: 'cash', gifts: [], note: '' }, 'a')).toThrow('bạn của ai');
  });
});

describe('Khách viếng — trang thông tin', () => {
  it('đổi quyết định sau khi công bố thì trang gắn nhãn “đã thay đổi”', () => {
    const c = mk();
    publish(c, { text: 'Báo tin' });
    expect(c.publicPage!.slug).toMatch(/^cu-ong-nguyen-van-hoa-/);
    syncPublicPage(c);
    expect(c.publicPage!.changedAt).toBeUndefined();
    decide(c, 'time', 'a');
    syncPublicPage(c);
    expect(c.publicPage!.changedAt).toBeDefined();
  });
});

describe('Hậu tang — mốc tưởng niệm', () => {
  it('49 / 100 ngày tính cả ngày đầu; giỗ đầu theo âm lịch', () => {
    const c = mk();
    const m = { ...c.milestones!, sel: { d49: true, d100: true, gio: true, custom: false, none: false } };
    const L = milestoneList(c, m);
    expect(L[0].solar).toBe('Thứ Tư, 11/11/2026');
    expect(L[1].solar).toBe('Thứ Sáu, 01/01/2027');
    expect(toLunar(L[2].date!)).toMatchObject({ day: 14, month: 8, year: 2027 });
    expect(L[2].lunar).toBe('14/8 âm lịch năm Đinh Mùi');
  });
  it('Công giáo: cầu hồn 7 ngày, 30 ngày', () => {
    const c = mk({ rite: 'catholic' });
    const L = milestoneList(c, { ...c.milestones!, sel: { d49: true, d100: true, gio: false, custom: false, none: false } });
    expect(L.map(x => x.name)).toEqual(['Lễ cầu hồn 7 ngày', 'Lễ cầu hồn 30 ngày']);
  });
  it('khép vòng khi đủ điều kiện', () => {
    const c = mk();
    saveMilestones(c, { ...c.milestones!, sel: { d49: false, d100: false, gio: false, custom: false, none: true } });
    expect(() => closeCase(c)).toThrow();
    for (const t of c.tasks) if (t.status !== 'done') t.status = 'skip';
    c.finance!.locked = true;
    c.docs!.push({ id: 'd', name: 'trich-luc-khai-tu.pdf', at: '', source: 'after' });
    expect(closeConds(c).every(k => k.ok)).toBe(true);
    closeCase(c);
    expect(c.after!.closed).toBe(true);
  });
});

describe('Tài khoản, OTP, đơn hàng, khớp giao dịch', () => {
  it('số điện thoại Việt Nam', () => {
    expect(normalizePhone('+84 912 345 678')).toBe('0912345678');
    expect(normalizePhone('0212345678')).toBeNull();
  });
  it('khóa tạm sau 5 lần sai', () => {
    let u: User = { id: 'u', name: 'A', phone: '0912345678', passHash: '', salt: '', createdAt: '', failed: 0 };
    for (let i = 0; i < 4; i++) u = loginAttempt(u, false, T0).user;
    const r = loginAttempt(u, false, T0);
    expect(r.error).toContain('tạm khóa');
    expect(loginAttempt(r.user, true, T0).error).toContain('Thử lại sau');
    expect(loginAttempt(r.user, true, new Date(T0.getTime() + 6 * 60000)).error).toBeNull();
  });
  it('OTP: hết hạn, sai quá số lần, gửi quá nhiều', () => {
    const t = issueOtp('0912345678', 'register', null, T0);
    expect(checkOtp(t, '000000', T0).ok).toBe(t.code === '000000');
    expect(checkOtp(t, t.code, T0).ok).toBe(true);
    expect(checkOtp(t, t.code, new Date(T0.getTime() + 6 * 60000)).error).toContain('hết hạn');
    const t3 = issueOtp('0912345678', 'register', issueOtp('0912345678', 'register', t, T0), T0);
    expect(() => issueOtp('0912345678', 'register', t3, T0)).toThrow('quá nhiều');
  });
  it('khớp đúng mã + đúng tiền + đúng tài khoản; gọi lại không xử lý hai lần; sai tiền vào chưa khớp', () => {
    const acct = { bank: 'BIDV', number: '1234567890', holder: 'CONG TY', active: true };
    const o: Order = createOrder(DEFAULT_PRODUCTS[0], 'u1', { kind: 'case', id: 'dh1', name: 'x' }, new Set(), undefined, T0);
    const ok = matchTransaction({ providerTxId: 'SP1', amount: o.amount, content: `CK ${o.code} thanh toan`, account: '1234 567 890' }, [o], [], acct, T0);
    expect(ok.tx.status).toBe('matched');
    expect(ok.order!.status).toBe('paid');
    const again = matchTransaction({ providerTxId: 'SP1', amount: o.amount, content: o.code, account: '1234567890' }, [ok.order!], [ok.tx], acct, T0);
    expect(again.duplicate).toBe(true);
    const less = matchTransaction({ providerTxId: 'SP2', amount: o.amount - 1000, content: o.code, account: '1234567890' }, [o], [], acct, T0);
    expect(less.tx).toMatchObject({ status: 'unmatched', reason: 'Thiếu tiền' });
    const noCode = matchTransaction({ providerTxId: 'SP3', amount: o.amount, content: 'chuyen tien', account: '1234567890' }, [o], [], acct, T0);
    expect(noCode.tx.status).toBe('unmatched');
    const wrongAcct = matchTransaction({ providerTxId: 'SP4', amount: o.amount, content: o.code, account: '999' }, [o], [], acct, T0);
    expect(wrongAcct.tx.status).toBe('ignored');
    const late = matchTransaction({ providerTxId: 'SP5', amount: o.amount, content: o.code, account: '1234567890' }, [o], [], acct, new Date(T0.getTime() + 25 * 3600000));
    expect(late.tx.reason).toBe('Đơn đã hết hạn');
  });
  it('gói Mở đầy đủ dùng đến hết giỗ đầu', () => {
    const c = mk();
    expect(isFull(c)).toBe(false);
    grantFull(c, 'payment', 'DH1');
    expect(isFull(c, new Date(2027, 0, 1))).toBe(true);
    const until = new Date(fullUntil(c)!);
    expect(toLunar(until)).toMatchObject({ day: 14, month: 8, year: 2027 });
    expect(isFull(c, new Date(until.getTime() + 86400000))).toBe(false);
  });
});

describe('Chuẩn bị trước → kích hoạt', () => {
  it('mức sẵn sàng tăng theo nhóm đã điền', () => {
    const p = newPreNeed('u1', false, T0);
    expect(readiness(p)).toBe(0);
    p.subject.name = 'Nguyễn Văn Hòa'; p.subject.birthYear = '1938';
    p.wish.rite = 'Phật giáo'; p.wish.msg = 'Con cháu hòa thuận';
    expect(readiness(p)).toBe(33);
  });
  it('kích hoạt: đám hiếu mở đầy đủ, nguyện vọng là đề xuất, ngân sách và bên mong muốn chuyển sang', () => {
    const p = newPreNeed('user-1', false, T0);
    Object.assign(p.subject, { title: 'Cụ bà', name: 'Trần Thị Lan', birthYear: '1941' });
    Object.assign(p.wish, { form: 'cremation', venue: 'home', rite: 'Công giáo', items: 'Tràng hạt', milestones: ['gio'] });
    p.budget = { amount: 120000000, vendors: { hoa: 'hoaX' } };
    p.contacts = [{ name: 'Lan', phone: '0912345678', rel: 'Con gái' }];
    const c: CaseData = activatePreNeed(p, { death: '2026-09-24', place: 'hospital', org: 'family' }, 'user-1', 'Nguyễn Minh Tuấn', T0);
    expect(isFull(c, T0)).toBe(true);
    expect(c.situation).toMatchObject({ rite: 'catholic', hasPre: true, form: 'cremation' });
    expect(findDecision(c, 'form')).toMatchObject({ status: 'pending', wish: { value: 'cremation' } });
    expect(c.finance!.budget).toBe(120000000);
    expect(c.familyPick!.hoa).toBe('hoaX');
    expect(c.members[0]).toMatchObject({ name: 'Nguyễn Minh Tuấn', userId: 'user-1' });
    expect(c.tasks.find(t => t.id === 'm4c')!.note).toContain('Tràng hạt');
    expect(c.milestones!.sel.gio).toBe(true);
    expect(() => activatePreNeed({ ...p, caseId: c.id }, { death: '2026-09-24', place: 'hospital', org: 'family' }, 'u', 'u')).toThrow('đã được kích hoạt');
  });
});

describe('Trả lại việc', () => {
  it('người được giao trả lại: việc về chưa có người nhận, lịch sử ghi lý do', () => {
    const c = normalizeCase(createCase({ answers: DEFAULT_ANSWERS }));
    const m = inviteMember(c, { name: 'Lan', rel: 'Con gái', access: 'full', areas: [c.areas[0]], phone: '0912000111' });
    const t = c.tasks.find(x => x.status === 'todo')!;
    assignTask(c, t.id, m.id, 'Nhờ em');
    t.status = 'doing';
    returnTask(c, t.id, 'Ở xa, không về kịp');
    expect(t.owner).toBeNull();
    expect(t.status).toBe('todo');
    expect(t.assignNote).toBeUndefined();
    expect(c.history.at(-1)!.text).toContain('Lan trả lại việc · Lý do: Ở xa, không về kịp');
  });
});

describe('Tìm quanh nơi tổ chức trên Google Maps', () => {
  it('có vị trí → tìm quanh tọa độ; chỉ có địa chỉ → tìm theo địa chỉ; không có gì → tìm “gần đây” theo vị trí điện thoại', async () => {
    const { mapsSearchUrl } = await import('./vendors');
    expect(mapsSearchUrl('rap', { name: 'Nhà riêng', address: 'x', geo: { lat: 21.03, lng: 105.88 } }))
      .toBe('https://www.google.com/maps/search/' + encodeURIComponent('cho thuê rạp đám hiếu bàn ghế loa đài') + '/@21.03,105.88,14z');
    expect(mapsSearchUrl('xe', { name: 'Nhà riêng', address: 'Ngọc Lâm, Long Biên' })).toContain(encodeURIComponent('xe tang gần Ngọc Lâm, Long Biên'));
    expect(mapsSearchUrl('hoa', { name: 'Nhà riêng', address: '  ' })).toContain(encodeURIComponent('gần đây'));
    // Hạng mục gia đình tự thêm: tìm theo chính tên hạng mục
    expect(mapsSearchUrl('x-Sư thầy tụng kinh', { name: 'Nhà riêng', address: 'Ngọc Lâm' })).toContain(encodeURIComponent('Sư thầy tụng kinh gần Ngọc Lâm'));
  });
});

describe('Danh bạ tự lớn lên từ các gia đình', () => {
  it('chỉ lấy bên gia đình đồng ý giới thiệu; gom theo số điện thoại; bỏ bên đã có trong danh bạ / đã bỏ qua; xếp bên dùng thật lên đầu', async () => {
    const { sharedFamilyVendors, vendorCandidates } = await import('./vendors');
    const mkCase = (fv: object[], vendors: object = {}) => ({ ...normalizeCase(createCase({ answers: DEFAULT_ANSWERS })), familyVendors: fv, vendors } as unknown as CaseData);
    const a = mkCase([
      { id: 'f1', name: 'Rạp Minh Anh', phone: '0911 222 333', cats: ['rap'], address: 'Long Biên', note: 'riêng', share: true },
      { id: 'f2', name: 'Cô Lan nấu cỗ', phone: '0977000111', cats: ['an'], address: '', note: '', share: false },
      { id: 'f3', name: 'Kèn bác Tư', phone: '0988777666', cats: ['nhac'], address: '', note: '', share: true },
    ], { rap: { vendorId: 'f1', family: true, status: 'committed', incidents: [], acceptedAt: 'x' } });
    const b = mkCase([{ id: 'g1', name: 'Rạp Minh Anh (Long Biên)', phone: '+84 911222333', cats: ['rap', 'xe'], address: '', note: '', share: true }]);
    const c = mkCase([{ id: 'h1', name: 'Hoa Cúc', phone: '0900111222', cats: ['hoa'], address: '', note: '', share: true }]);
    const rows = sharedFamilyVendors([a, b, c]);
    expect(rows.map(r => r.name)).not.toContain('Cô Lan nấu cỗ');
    const dir = [{ id: 'v1', name: 'Hoa Cúc', phone: '0900 111 222', cats: ['hoa'], address: '', radiusKm: 5, cond: 'both', active: true, updatedAt: '' }] as unknown as DirVendor[];
    const L = vendorCandidates(rows, dir, ['0988777666']);
    expect(L).toHaveLength(1);
    expect(L[0]).toMatchObject({ families: 2, committed: 1, accepted: 1, cats: ['rap', 'xe'] });
    expect(L[0].names).toEqual(['Rạp Minh Anh', 'Rạp Minh Anh (Long Biên)']);
  });
});

describe('Chuyển quyền người đại diện', () => {
  it('người mới thành u1; người cũ ở lại đội; việc được giao đổi đúng người; chưa có tài khoản thì không chuyển được', () => {
    const c = normalizeCase(createCase({ answers: DEFAULT_ANSWERS }));
    c.members[0].userId = 'user-tuan'; c.members[0].name = 'Tuấn';
    const lan = inviteMember(c, { name: 'Lan', rel: 'Con gái', access: 'limited', areas: [c.areas[0]] });
    expect(() => transferRepresentative(c, lan.id)).toThrow('nhận lời mời');
    lan.userId = 'user-lan'; lan.inviteToken = undefined;
    const [t1, t2] = c.tasks.filter(x => x.status === 'todo');
    assignTask(c, t1.id, U1_ID); assignTask(c, t2.id, lan.id);
    transferRepresentative(c, lan.id);
    const u1 = c.members.find(m => m.id === U1_ID)!, old = c.members.find(m => m.id === lan.id)!;
    expect(u1).toMatchObject({ name: 'Lan', userId: 'user-lan', access: 'full', areas: ['Toàn bộ'] });
    expect(old).toMatchObject({ name: 'Tuấn', userId: 'user-tuan', access: 'full', role: 'Thành viên' });
    expect(t1.owner).toBe(lan.id); // việc của Tuấn vẫn là của Tuấn (nay ở mã cũ của Lan)
    expect(t2.owner).toBe(U1_ID);  // việc của Lan vẫn là của Lan (nay là người đại diện)
  });
});

describe('Danh xưng và lứa tuổi người đã khuất', () => {
  it('danh xưng tự viết (Khác) dùng làm xưng hô; lứa tuổi theo năm sinh – năm mất, không có thì theo danh xưng', async () => {
    const { pronoun, ageGroup } = await import('./person');
    expect(pronoun('Cụ bà')).toBe('cụ');
    expect(pronoun('Anh')).toBe('anh');
    expect(pronoun('Cô giáo')).toBe('cô');
    expect(pronoun('Thầy')).toBe('thầy');
    const P = (title: string, birthYear: string, death: string) => ({ title, name: 'A', saint: '', birthYear, death, time: '', hometown: '', photo: null });
    expect(ageGroup(P('Cụ ông', '1938', '2026-09-24'))).toBe('old');
    expect(ageGroup(P('Anh', '2001', '2026-09-24'))).toBe('young');
    expect(ageGroup(P('Chị', '1980', '2026-09-24'))).toBe('mid');
    expect(ageGroup(P('Khác', '2018', '2026-09-24'))).toBe('child');
    expect(ageGroup(P('Anh', '', ''))).toBe('young');
  });
});

describe('Hạng mục dịch vụ', () => {
  it('hiện theo hoàn cảnh; gia đình tự thêm, không trùng tên, không bỏ khi đã chọn bên làm', async () => {
    const { catsOf, addCustomCat, removeCustomCat, catName } = await import('./vendors');
    const { createCase } = await import('./model');
    const { DEFAULT_ANSWERS } = await import('./entry');
    const c = createCase({ answers: { ...DEFAULT_ANSWERS, venue: 'hall', form: 'cremation' } });
    const ks = catsOf(c).map(k => k.k);
    expect(ks).toContain('quan'); expect(ks).toContain('hall'); expect(ks).toContain('hoatang');
    expect(ks).not.toContain('rap'); expect(ks).not.toContain('mo'); expect(ks).not.toContain('nghiatrang');
    addCustomCat(c, '  Sư thầy   tụng kinh ');
    expect(catsOf(c).at(-1)).toMatchObject({ k: 'x-Sư thầy tụng kinh', custom: true });
    expect(catName('x-Sư thầy tụng kinh')).toBe('Sư thầy tụng kinh');
    expect(() => addCustomCat(c, 'sư thầy tụng kinh')).toThrow('Đã có');
    expect(() => addCustomCat(c, 'xe tang')).toThrow('Đã có');
    c.vendors = { 'x-Sư thầy tụng kinh': { vendorId: 'f1', family: true, status: 'confirmed', incidents: [] } };
    expect(() => removeCustomCat(c, 'Sư thầy tụng kinh')).toThrow('bỏ chọn');
  });
});
