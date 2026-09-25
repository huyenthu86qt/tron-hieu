// Khách viếng & truyền tin: sổ ghi nhanh, trang thông tin công khai, ca trực.
import type { CaseData, Condolence, GuestGroup, Method, PublicPage } from './types';
import { chosenLabel, findDecision, hasBLT, ORGT, U1_ID } from './model';
import { addDays, fmtDM, fmtDMY, longevityWord, lunarAge, parseISODate } from './person';
import { toLunar, canChi } from './lunar';
import { siteOf, venueLabel } from './vendors';
import { DN_TEXT } from './text';

export const GROUPS: GuestGroup[] = ['Họ nội', 'Họ ngoại', 'Cơ quan, đoàn thể', 'Tổ dân phố, lối xóm', 'Bạn bè', 'Khác'];
export const GIFTS = ['Hương', 'Hoa', 'Vòng hoa', 'Trái cây', 'Nến', 'Khác'];

export interface GuestForm { name: string; group: GuestGroup | null; of: string | null; amount: number; method: Method; gifts: string[]; note: string }

export function addGuest(c: CaseData, f: GuestForm, by: string, now = new Date()): Condolence {
  if (!f.name.trim()) throw new Error('Cần ghi tên người hoặc đoàn đến viếng.');
  if (f.group === 'Bạn bè' && !f.of) throw new Error('Chọn khách là bạn của ai để người con đó biết mà cảm ơn.');
  const x: Condolence = {
    id: 'g' + Math.random().toString(36).slice(2, 9), name: f.name.trim(), group: f.group, of: f.group === 'Bạn bè' ? f.of : null,
    amount: Math.max(0, f.amount), method: f.method, gifts: [...f.gifts], note: f.note.trim() || undefined, by, at: now.toISOString(),
  };
  (c.ledger ??= []).push(x);
  return x;
}

export function removeGuest(c: CaseData, id: string) {
  if (c.finance?.locked) throw new Error('Tài chính đã khóa — không sửa sổ phúng viếng được nữa.');
  c.ledger = (c.ledger ?? []).filter(x => x.id !== id);
}

/* ---------- Trang thông tin ---------- */
const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const emptyPage = (): PublicPage => ({ slug: '', published: false, text: '', auto: false, showPhone: false, phone: '', sched: {} });

export function makeSlug(c: CaseData) {
  const base = slugify(c.person.name ? `${c.person.title} ${c.person.name}` : 'dam-hieu') || 'dam-hieu';
  return `${base}-${c.id.slice(-4)}`;
}

export function defaultNotice(c: CaseData) {
  const P = c.person, d = parseISODate(P.death), a = lunarAge(P);
  return 'Gia đình chúng tôi vô cùng thương tiếc báo tin: ' + DN_TEXT(c) + (d ? ` đã từ trần ngày ${fmtDMY(d)}` : '') + (a ? `, ${longevityWord(a)} ${a} tuổi` : '') + '.';
}

/** Nháp lời báo tin đầy đủ (mẫu có sẵn; gia đình đọc lại trước khi công bố) */
export function draftNotice(c: CaseData) {
  const P = c.person, d = parseISODate(P.death), a = lunarAge(P), L = d ? toLunar(d) : null;
  return 'Gia đình chúng tôi vô cùng thương tiếc báo tin: ' + DN_TEXT(c) + (P.birthYear ? `, sinh năm ${P.birthYear}` : '')
    + (d ? `, đã từ trần${P.time ? ' hồi ' + P.time.replace(':', ' giờ ') + ' phút' : ''} ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()} (tức ngày ${L!.day} tháng ${L!.month} năm ${canChi(L!.year)})` : '')
    + (a ? `, ${longevityWord(a)} ${a} tuổi` : '') + '. Gia đình xin kính báo tới họ hàng nội ngoại, bạn bè, cơ quan, đoàn thể và bà con lối xóm.';
}

/** Lịch lễ: lấy từ quyết định đã chốt; các dòng khác gia đình ghi (mặc định theo ngày mất) */
export function schedule(c: CaseData): [string, string][] {
  const d = parseISODate(c.person.death), C = c.situation.rite === 'catholic', bur = c.situation.form === 'burial';
  const t = findDecision(c, 'time');
  const timeText = t && t.status === 'decided' ? chosenLabel(t) : 'Gia đình sẽ thông báo';
  const o = c.publicPage?.sched ?? {};
  if (!d) return [['Lịch lễ', 'Gia đình sẽ thông báo']];
  return [
    [C ? 'Nghi thức tẩm liệm, nhập quan' : 'Lễ nhập quan', o.nq || `Ngày ${fmtDMY(addDays(d, 1))}`],
    ['Lễ viếng', o.vieng || `Từ ngày ${fmtDM(addDays(d, 2))} đến ngày ${fmtDMY(addDays(d, 3))}`],
    [C ? 'Thánh lễ an táng, đưa tang' : 'Lễ truy điệu, đưa tang', o.dua || (t?.status === 'decided' ? `Trước giờ ${bur ? 'hạ huyệt' : 'hỏa táng'} · ${timeText}` : 'Gia đình sẽ thông báo')],
    [bur ? 'Hạ huyệt' : 'Hỏa táng', timeText],
  ];
}

export function organizerLine(c: CaseData) {
  const s = c.situation;
  if (hasBLT(s)) return `Lễ tang được tổ chức theo nghi lễ tang ${ORGT[s.orgType].label}${s.org === 'official_rel' ? ' kết hợp nghi lễ tôn giáo của gia đình' : ''}`;
  if (s.org === 'community') return 'Lễ tang được tổ chức theo nếp sống văn minh, có sự phối hợp của Ban công tác Mặt trận và các hội, đoàn thể địa phương';
  return '';
}
export const announcer = (c: CaseData) => (hasBLT(c.situation) ? `${ORGT[c.situation.orgType].full} và gia đình` : 'Gia đình chúng tôi');

/** Ảnh chụp thông tin khách thấy lúc công bố — để phát hiện thay đổi và gắn nhãn cho khách */
export const snapshotOf = (c: CaseData) => JSON.stringify({ v: venueLabel(c), a: siteOf(c).address, s: schedule(c) });

export function publish(c: CaseData, page: Partial<PublicPage>, now = new Date()) {
  const cur = c.publicPage ?? emptyPage();
  const next: PublicPage = { ...cur, ...page, slug: cur.slug || makeSlug(c), published: true, publishedAt: now.toISOString(), snapshot: snapshotOf(c), changedAt: undefined };
  c.publicPage = next;
  c.history.push({ at: now.toISOString(), text: cur.published ? 'Cập nhật trang thông tin cho khách' : 'Công bố trang thông tin cho khách' });
}

/** Sau mỗi thay đổi quyết định: nếu trang đã công bố mà thông tin khác → tự cập nhật và gắn nhãn */
export function syncPublicPage(c: CaseData, now = new Date()) {
  const p = c.publicPage;
  if (!p?.published) return;
  const snap = snapshotOf(c);
  if (p.snapshot && p.snapshot !== snap) { p.changedAt = now.toISOString(); p.snapshot = snap; }
}

export const tangChu = (c: CaseData) => c.members.find(m => m.id === U1_ID)!;
