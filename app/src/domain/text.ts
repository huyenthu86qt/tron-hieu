import type { CaseData } from './types';
import { displayName } from './person';

/** Tên hiển thị người đã khuất trong đám hiếu (tên thánh khi Công giáo) */
export const DN_TEXT = (c: CaseData) => (c.person.name.trim() ? displayName(c.person, c.situation.rite === 'catholic') : 'Người đã khuất (chưa nhập tên)');

/** Xưng hô với một người trong đội theo quan hệ đã khai: con gái/vợ/con dâu → “chị”, con trai/chồng/con rể → “anh” */
export function xung(rel?: string): string {
  const r = (rel ?? '').toLowerCase();
  if (/anh, chị|anh\/chị|anh chị em/.test(r)) return 'anh/chị';
  if (/con gái|vợ|con dâu|cháu gái|chị|em gái/.test(r)) return 'chị';
  if (/con trai|chồng|con rể|cháu đích tôn|cháu trai|anh|em trai/.test(r)) return 'anh';
  return 'anh/chị';
}
