import { createContext, useContext } from 'react';
import type { CaseData, DirVendor, Member } from '../domain/types';
import type { TaskView } from '../domain/model';
import { DN_TEXT } from '../domain/text';
import { currentPhase, U1_ID } from '../domain/model';
import { PHASES } from '../domain/templates';
import { venueLabel } from '../domain/vendors';
import { canFinance } from '../domain/finance';

export type SheetState =
  | { type: 'assign'; taskId: string }
  | { type: 'lock'; taskId: string }
  | { type: 'return'; taskId: string }
  | { type: 'taskform'; mode: 'new'; phase: number }
  | { type: 'taskform'; mode: 'edit'; id: string }
  | { type: 'invite' }
  | { type: 'member'; id: string }
  | { type: 'areas'; back?: { type: 'member'; id: string } }
  | { type: 'more' }
  | { type: 'search' };

export interface CaseCtx {
  c: CaseData;
  base: string;
  /** Sửa bản nháp rồi lưu. Trả về thông báo lỗi nghiệp vụ nếu có. */
  update: (fn: (d: CaseData) => void) => string | null;
  sheet: SheetState | null;
  openSheet: (s: SheetState | null) => void;
  /** Thành viên ứng với tài khoản đang đăng nhập */
  me: Member;
  isU1: boolean;
  /** Đám hiếu đã mở đầy đủ (gói trả phí) */
  full: boolean;
  canFin: boolean;
  /** Danh bạ nhà cung cấp (Admin quản lý) */
  dir: DirVendor[];
}

export const CaseContext = createContext<CaseCtx | null>(null);

export function useCase() {
  const v = useContext(CaseContext);
  if (!v) throw new Error('useCase ngoài CaseLayout');
  return v;
}

export const DN = DN_TEXT;

export function caseLine(c: CaseData) {
  const cur = currentPhase(c);
  return `Đang ở chặng ${cur}/15 · ${PHASES[cur - 1]} · ${venueLabel(c)}`;
}

export const memberOf = (c: CaseData, id: string | null) => (id ? c.members.find(m => m.id === id) ?? null : null);
export const ACCESS_LABEL = { full: 'Đầy đủ', limited: 'Giới hạn', link: 'Qua link' } as const;

export const permsOf = (me: Member) => ({ isU1: me.id === U1_ID, canFin: canFinance(me) });

/** Người Giới hạn chỉ thấy việc thuộc vùng của mình hoặc việc giao cho mình */
export const inScope = (me: Member, t: TaskView) =>
  me.access === 'full' || me.areas.includes('Toàn bộ') || t.owner === me.id || me.areas.includes(t.area);
