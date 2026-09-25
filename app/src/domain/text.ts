import type { CaseData } from './types';
import { displayName } from './person';

/** Tên hiển thị người đã khuất trong đám hiếu (tên thánh khi Công giáo) */
export const DN_TEXT = (c: CaseData) => (c.person.name.trim() ? displayName(c.person, c.situation.rite === 'catholic') : 'Người đã khuất (chưa nhập tên)');
