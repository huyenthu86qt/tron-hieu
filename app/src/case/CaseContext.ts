import { createContext, useContext } from 'react';
import type { CaseData } from '../domain/types';
import { DN_TEXT } from '../domain/text';
import { currentPhase, VENUE_LABEL } from '../domain/model';
import { PHASES } from '../domain/templates';

export type SheetState =
  | { type: 'assign'; taskId: string }
  | { type: 'lock'; taskId: string }
  | { type: 'taskform'; mode: 'new'; phase: number }
  | { type: 'taskform'; mode: 'edit'; id: string }
  | { type: 'invite' }
  | { type: 'member'; id: string }
  | { type: 'areas'; back?: { type: 'member'; id: string } }
  | { type: 'more' };

export interface CaseCtx {
  c: CaseData;
  base: string;
  /** Sửa bản nháp rồi lưu. Trả về thông báo lỗi nghiệp vụ nếu có. */
  update: (fn: (d: CaseData) => void) => string | null;
  sheet: SheetState | null;
  openSheet: (s: SheetState | null) => void;
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
  return `Đang ở chặng ${cur}/15 · ${PHASES[cur - 1]} · ${VENUE_LABEL[c.situation.venue]}`;
}

export const memberOf = (c: CaseData, id: string | null) => (id ? c.members.find(m => m.id === id) ?? null : null);
export const ACCESS_LABEL = { full: 'Đầy đủ', limited: 'Giới hạn', link: 'Qua link' } as const;
