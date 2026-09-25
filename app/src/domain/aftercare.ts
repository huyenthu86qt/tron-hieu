// Hậu tang: mốc tưởng niệm (có ngày âm), cảm ơn, khép vòng.
import type { AfterCare, CaseData, Milestones } from './types';
import { addDays, fmtWeekday, parseISODate } from './person';
import { canChi, lunarAnniversary, toLunar, formatLunar } from './lunar';
import { canClose, closeConditions } from './model';
import { allAccepted } from './vendors';

export const emptyMilestones = (): Milestones => ({
  sel: { d49: false, d100: false, gio: false, custom: false, none: false },
  customName: '', customDate: '', base: 'death', count: 'incl', gioCal: 'lunar', saved: false,
});
export const emptyAfter = (): AfterCare => ({ closed: false, thanked: {}, thankText: '', thankAuto: false });

/** Ngày an táng / hỏa táng: các phương án giờ đều rơi vào ngày mất + 4 (phương án “ngày giờ khác” chưa có ngày chuẩn nên cũng tạm tính như vậy) */
export function burialDate(c: CaseData): Date | null {
  const d = parseISODate(c.person.death);
  return d ? addDays(d, 4) : null;
}

export interface MilestoneItem { key: string; name: string; date: Date | null; solar: string; lunar: string }

export function milestoneDates(c: CaseData, m: Milestones = c.milestones ?? emptyMilestones()) {
  const death = parseISODate(c.person.death);
  if (!death) return null;
  const base = m.base === 'death' ? death : burialDate(c)!;
  const inc = m.count === 'incl' ? 1 : 0;
  const cath = c.situation.rite === 'catholic';
  const d49 = addDays(base, (cath ? 7 : 49) - inc), d100 = addDays(base, (cath ? 30 : 100) - inc);
  // Giỗ đầu tính từ ngày mất (âm lịch: cùng ngày tháng âm năm sau)
  const gio = m.gioCal === 'lunar' ? lunarAnniversary(death) : addDays(death, 365);
  return { d49, d100, gio, cath };
}

const lunarLine = (d: Date) => `${formatLunar(d)} âm lịch`;

export function milestoneList(c: CaseData, m: Milestones = c.milestones ?? emptyMilestones()): MilestoneItem[] {
  const D = milestoneDates(c, m);
  if (!D || m.sel.none) return [];
  const L: MilestoneItem[] = [];
  if (m.sel.d49) L.push({ key: 'd49', name: D.cath ? 'Lễ cầu hồn 7 ngày' : 'Lễ 49 ngày', date: D.d49, solar: fmtWeekday(D.d49), lunar: lunarLine(D.d49) });
  if (m.sel.d100) L.push({ key: 'd100', name: D.cath ? 'Lễ cầu hồn 30 ngày' : 'Lễ 100 ngày', date: D.d100, solar: fmtWeekday(D.d100), lunar: lunarLine(D.d100) });
  if (m.sel.gio && D.gio) {
    const Lg = toLunar(D.gio);
    L.push({ key: 'gio', name: 'Giỗ đầu', date: D.gio, solar: fmtWeekday(D.gio), lunar: `${Lg.day}/${Lg.month} âm lịch năm ${canChi(Lg.year)}` });
  }
  if (m.sel.custom && m.customName.trim()) {
    const cd = parseISODate(m.customDate);
    L.push({ key: 'custom', name: m.customName.trim(), date: cd, solar: cd ? fmtWeekday(cd) : 'Chưa chọn ngày', lunar: cd ? lunarLine(cd) : '' });
  }
  return L;
}

export function toggleMilestone(m: Milestones, k: keyof Milestones['sel']): Milestones {
  const sel = { ...m.sel };
  if (k === 'none') { const on = !sel.none; (Object.keys(sel) as (keyof typeof sel)[]).forEach(x => (sel[x] = false)); sel.none = on; }
  else { sel[k] = !sel[k]; sel.none = false; }
  return { ...m, sel };
}

export function saveMilestones(c: CaseData, m: Milestones, now = new Date()) {
  if (m.sel.custom && !m.customName.trim()) throw new Error('Ghi tên cho mốc riêng của gia đình.');
  if (!Object.values(m.sel).some(Boolean)) throw new Error('Chọn ít nhất một mốc, hoặc “Không theo dõi mốc nào”.');
  c.milestones = { ...m, saved: true };
  const t = c.tasks.find(x => x.id === 'm15a');
  if (t) t.status = 'done';
  c.history.push({ at: now.toISOString(), text: 'Lưu mốc tưởng niệm' });
}

export function closeInput(c: CaseData) {
  return { financeLocked: !!c.finance?.locked, vendorsAccepted: allAccepted(c), resultDocSaved: (c.docs ?? []).some(d => d.source === 'after') };
}
export const closeConds = (c: CaseData) => closeConditions(c, closeInput(c));

export function closeCase(c: CaseData, now = new Date()) {
  if (!canClose(closeConds(c))) throw new Error('Chưa đủ điều kiện khép vòng.');
  c.after = { ...(c.after ?? emptyAfter()), closed: true, closedAt: now.toISOString() };
  const t = c.tasks.find(x => x.id === 'm15d');
  if (t) t.status = 'done';
  c.history.push({ at: now.toISOString(), text: 'Khép phần tức thời' });
}

/** Nháp lời cảm ơn (mẫu có sẵn — gia đình đọc lại trước khi gửi) */
export const draftThanks = (dn: string) => 'Gia đình chúng tôi xin chân thành cảm ơn các cụ, các ông bà, cô chú, anh chị, bạn bè, cơ quan, đoàn thể và bà con lối xóm đã đến viếng, gửi vòng hoa, chia buồn và tiễn đưa '
  + dn + ' về nơi an nghỉ cuối cùng. Trong lúc tang gia bối rối, nếu có điều gì sơ suất, kính mong mọi người lượng thứ.';
export const defaultThanks = (dn: string) => `Gia đình chúng tôi xin chân thành cảm ơn đã đến viếng, chia buồn và tiễn đưa ${dn} về nơi an nghỉ cuối cùng.`;
