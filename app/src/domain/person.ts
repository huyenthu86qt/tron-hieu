import type { Person, Title } from './types';
import { canChi, toLunar } from './lunar';

const WEEKDAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const p2 = (n: number) => String(n).padStart(2, '0');

export const parseISODate = (s: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getMonth() === m - 1 ? dt : null;
};
export const addDays = (d: Date, n: number): Date => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const fmtDM = (d: Date) => `${p2(d.getDate())}/${p2(d.getMonth() + 1)}`;
export const fmtDMY = (d: Date) => `${fmtDM(d)}/${d.getFullYear()}`;
export const fmtWeekday = (d: Date) => `${WEEKDAY[d.getDay()]}, ${fmtDMY(d)}`;

export const TITLES = ['Cụ ông', 'Cụ bà', 'Ông', 'Bà', 'Anh', 'Chị'] as const;
const PRONOUN: Record<string, string> = { 'Cụ ông': 'cụ', 'Cụ bà': 'cụ', 'Ông': 'ông', 'Bà': 'bà', 'Anh': 'anh', 'Chị': 'chị', 'Em': 'em', 'Bé': 'bé' };
/** Xưng hô người mất; danh xưng tự viết thì lấy chữ đầu viết thường (“Cô giáo” → “cô”) */
export const pronoun = (title: Title) => PRONOUN[title] ?? (title.trim() ? title.trim().split(/\s+/)[0].toLowerCase() : 'cụ');

/** Lứa tuổi để chọn lời lẽ phù hợp (Sổ tưởng nhớ): theo tuổi khi mất, không có tuổi thì theo danh xưng */
export type AgeGroup = 'old' | 'mid' | 'young' | 'child';
export function ageGroup(p: Person): AgeGroup {
  const by = Number(p.birthYear), d = parseISODate(p.death);
  const age = by ? (d ? d.getFullYear() : new Date().getFullYear()) - by : null;
  if (age !== null && age >= 0 && age < 130) return age < 16 ? 'child' : age < 30 ? 'young' : age < 60 ? 'mid' : 'old';
  if (p.title === 'Bé') return 'child';
  if (p.title === 'Em' || p.title === 'Anh' || p.title === 'Chị') return 'young';
  if (p.title === 'Ông' || p.title === 'Bà') return 'mid';
  return 'old';
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Tên hiển thị: danh xưng + (tên thánh nếu Công giáo) + họ tên */
export function displayName(p: Person, catholic: boolean): string {
  if (!p.name.trim()) return 'Người đã khuất';
  return [p.title, catholic && p.saint.trim() ? p.saint.trim() : '', p.name.trim()].filter(Boolean).join(' ');
}

/** Tuổi âm: năm mất − năm sinh + 1 */
export function lunarAge(p: Person): number | null {
  const by = Number(p.birthYear), d = parseISODate(p.death);
  if (!by || !d) return null;
  return d.getFullYear() - by + 1;
}

/** “hưởng thọ” từ 60 tuổi, dưới 60 “hưởng dương” */
export const longevityWord = (age: number) => (age >= 60 ? 'hưởng thọ' : 'hưởng dương');

export function lunarDeathText(p: Person): string {
  const d = parseISODate(p.death);
  if (!d) return '';
  const L = toLunar(d);
  return `${L.day}/${L.month}${L.leap ? ' nhuận' : ''} năm ${canChi(L.year)}`;
}

export function lifeLine(p: Person): string {
  const d = parseISODate(p.death), age = lunarAge(p);
  const parts = [
    p.birthYear ? `Sinh năm ${p.birthYear}` : null,
    d ? `Từ trần ${p.time ? 'lúc ' + p.time + ' ' : ''}ngày ${fmtDMY(d)} (${lunarDeathText(p)})` : null,
    age ? `${cap(longevityWord(age))} ${age} tuổi` : null,
  ].filter(Boolean);
  return parts.join(' · ') || 'Chưa nhập năm sinh, ngày mất';
}

export function lifeSpan(p: Person): string {
  const d = parseISODate(p.death);
  return `${p.birthYear || '?'} – ${d ? d.getFullYear() : '?'}`;
}

/**
 * Thay token trong chuỗi mẫu:
 *  {p} {P}  → xưng hô người mất
 *  {d+N}    → dd/mm của ngày mất + N
 *  {D+N}    → dd/mm/yyyy của ngày mất + N
 */
export function resolveText(text: string, p: Person): string {
  const pr = pronoun(p.title);
  const d = parseISODate(p.death);
  return text
    .replace(/\{p\}/g, pr)
    .replace(/\{P\}/g, cap(pr))
    .replace(/\{([dD])\+(\d+)\}/g, (_m, kind: string, n: string) => {
      if (!d) return '—';
      const x = addDays(d, Number(n));
      return kind === 'D' ? fmtDMY(x) : fmtDM(x);
    });
}
