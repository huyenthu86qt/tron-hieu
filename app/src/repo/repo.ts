// Lớp lưu trữ có kiểu: LocalRepo (trên máy — bản chạy thử, trang /mau) hoặc SupabaseRepo (máy chủ, Phase 3a).
// Các màn chỉ dùng giao diện CaseRepo nên không phụ thuộc nơi lưu.
import type { Answers, CaseData, Member } from '../domain/types';
import { normalizeCase } from '../domain/normalize';
import { REMOTE } from './backend';
import { SupabaseRepo } from './remoteRepo';

export interface CaseSummary { id: string; name: string; createdAt: string; ownerId?: string; full: boolean; closed: boolean }

export interface CaseRepo {
  list(): Promise<CaseSummary[]>;
  listAll(): Promise<CaseData[]>;
  /** Trang thông tin công khai theo đường dẫn */
  findBySlug(slug: string): Promise<CaseData | null>;
  get(id: string): Promise<CaseData | null>;
  save(c: CaseData): Promise<void>;
  remove(id: string): Promise<void>;
  /** Link User: tìm đám hiếu và người được nhờ theo mã link */
  findByLinkToken(token: string): Promise<{ c: CaseData; member: Member } | null>;
  /** Admin: danh sách đám hiếu chỉ gồm tên và trạng thái */
  adminCases?(): Promise<CaseData[]>;
  /** Báo khi người khác cập nhật (máy chủ) */
  subscribe?(id: string, onChange: () => void): () => void;
}

const KEY = 'damhieu.cases.v1';

function readAll(): Record<string, CaseData> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, CaseData>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, CaseData>) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export class LocalRepo implements CaseRepo {
  async list() {
    return Object.values(readAll())
      .map(c => ({
        id: c.id, name: c.person.name ? `${c.person.title} ${c.person.name}` : 'Người đã khuất (chưa nhập tên)', createdAt: c.createdAt,
        ownerId: c.ownerId, full: c.access?.plan === 'full', closed: !!c.after?.closed,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listAll() {
    return Object.values(readAll()).map(normalizeCase);
  }
  async get(id: string) {
    const c = readAll()[id];
    return c ? normalizeCase(c) : null;
  }
  async findBySlug(slug: string) {
    const c = Object.values(readAll()).find(x => x.publicPage?.slug === slug);
    return c ? normalizeCase(c) : null;
  }
  async save(c: CaseData) {
    const all = readAll();
    all[c.id] = c;
    writeAll(all);
  }
  async remove(id: string) {
    const all = readAll();
    delete all[id];
    writeAll(all);
  }
  async findByLinkToken(token: string) {
    for (const c of Object.values(readAll())) {
      const member = c.members.find(m => m.access === 'link' && m.linkToken === token);
      if (member) return { c: normalizeCase(c), member };
    }
    return null;
  }
}

export const repo: CaseRepo = REMOTE ? new SupabaseRepo() : new LocalRepo();

/* ---------- Bản nháp bước đầu (chưa tạo đám hiếu) ---------- */
export interface EntryDraft { answers: Answers; step: number; mine: string[]; notified: string[] }
const DKEY = 'damhieu.entry-draft.v1';

export function loadDraft(): EntryDraft | null {
  try {
    const raw = localStorage.getItem(DKEY);
    return raw ? (JSON.parse(raw) as EntryDraft) : null;
  } catch {
    return null;
  }
}
export function saveDraft(d: EntryDraft) {
  try { localStorage.setItem(DKEY, JSON.stringify(d)); } catch { /* bộ nhớ đầy hoặc bị chặn — vẫn dùng được trong phiên */ }
}
export function clearDraft() {
  try { localStorage.removeItem(DKEY); } catch { /* bỏ qua */ }
}
