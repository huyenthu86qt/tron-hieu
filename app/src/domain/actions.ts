// Thao tác trên đám hiếu — sửa trực tiếp bản nháp `c` và ghi lịch sử.
// Lớp lưu trữ (repository) chịu trách nhiệm sao chép / lưu; ở đây chỉ có luật nghiệp vụ.
import type { Access, CaseData, Member, Person, TaskInst } from './types';
import { findTask, lockBlocked, newId, systemMembers, U1_ID } from './model';
import { normalizePhone } from './platform';

const stamp = (now?: Date) => (now ?? new Date()).toISOString();
const inst = (c: CaseData, id: string) => c.tasks.find(t => t.id === id);
const memberName = (c: CaseData, id: string | null) => (id ? c.members.find(m => m.id === id)?.name ?? '' : '');
const log = (c: CaseData, text: string, taskId?: string, now?: Date) => c.history.push({ at: stamp(now), text, taskId });

export class RuleError extends Error {}

/* ---------- Việc ---------- */
export function assignTask(c: CaseData, id: string, memberId: string, note?: string, now?: Date) {
  const t = inst(c, id);
  if (!t) return;
  t.owner = memberId;
  t.assignNote = note?.trim() || undefined;
  if (t.status === 'done') t.status = 'todo';
  log(c, `Giao cho ${memberName(c, memberId)}${note?.trim() ? ' · Lời nhắn: ' + note.trim() : ''}`, id, now);
}

export function takeTask(c: CaseData, id: string, memberId: string = U1_ID, now?: Date) {
  const t = inst(c, id);
  if (!t) return;
  t.owner = memberId;
  if (t.status === 'todo') t.status = 'doing';
  log(c, `${memberName(c, memberId)} nhận việc`, id, now);
}

/** Người được giao trả lại việc: việc về trạng thái chưa có người nhận, ghi lý do vào lịch sử để người đại diện giao cho người khác */
export function returnTask(c: CaseData, id: string, reason: string, now?: Date) {
  const t = inst(c, id);
  if (!t || !t.owner || t.status === 'done') return;
  const who = memberName(c, t.owner) || 'Người phụ trách';
  t.owner = null;
  t.assignNote = undefined;
  if (t.status !== 'issue') t.status = 'todo';
  log(c, `${who} trả lại việc${reason.trim() ? ' · Lý do: ' + reason.trim() : ''} — cần giao người khác`, id, now);
}

export function startTask(c: CaseData, id: string, now?: Date) {
  const t = inst(c, id);
  if (!t || t.status === 'done') return;
  t.status = 'doing';
  log(c, `${memberName(c, t.owner) || 'Người phụ trách'} bắt đầu làm`, id, now);
}

/**
 * Đánh dấu xong. Việc khóa: cần mọi việc phía trước đã xong, và
 * hoặc đủ mục kiểm, hoặc ghi lý do chấp nhận rủi ro.
 */
export function completeTask(c: CaseData, id: string, opts: { checksOk?: boolean; riskNote?: string } = {}, now?: Date) {
  const t = inst(c, id), v = findTask(c, id);
  if (!t || !v) return;
  if (v.lock) {
    if (lockBlocked(c, v)) throw new RuleError('Việc không thể quay lại: cần xong các việc phía trước.');
    if (!opts.checksOk && !opts.riskNote?.trim()) throw new RuleError('Cần kiểm đủ các mục hoặc ghi lý do trước khi đánh dấu xong.');
  }
  t.status = 'done';
  t.issue = undefined;
  log(c, `Đánh dấu đã xong${v.lock ? ' · việc đã khóa' : ''}${opts.riskNote?.trim() ? ' · Chấp nhận rủi ro: ' + opts.riskNote.trim() : ''}${t.evidence ? ' · đính kèm ' + t.evidence : ''}`, id, now);
}

export function reportIssue(c: CaseData, id: string, text: string, by?: string, now?: Date) {
  const t = inst(c, id);
  if (!t || !text.trim()) return;
  t.status = 'issue';
  t.issue = text.trim();
  log(c, `${by ? by + ' báo' : 'Báo'} vấn đề: ${t.issue}`, id, now);
}

export function resolveIssue(c: CaseData, id: string, now?: Date) {
  const t = inst(c, id);
  if (!t || t.status !== 'issue') return;
  t.status = t.owner ? 'doing' : 'todo';
  log(c, `Đã xử lý vấn đề: ${t.issue ?? ''}`, id, now);
  t.issue = undefined;
}

export function toggleStep(c: CaseData, id: string, i: number, on: boolean) {
  const t = inst(c, id);
  if (!t) return;
  t.stepsDone = { ...(t.stepsDone ?? {}), [i]: on };
}

export function attachEvidence(c: CaseData, id: string, name: string, now?: Date, path?: string) {
  const t = inst(c, id);
  if (!t) return;
  t.evidence = name;
  t.evidencePath = path;
  log(c, `Đính kèm bằng chứng: ${name}`, id, now);
}

export function skipTask(c: CaseData, id: string, reason: string, now?: Date) {
  const t = inst(c, id);
  if (!t) return;
  if (!reason.trim()) throw new RuleError('Ghi lý do để cả nhà cùng biết.');
  t.status = 'skip';
  t.skipReason = reason.trim();
  log(c, `Không áp dụng cho gia đình: ${t.skipReason}`, id, now);
}

export function restoreTask(c: CaseData, id: string, now?: Date) {
  const t = inst(c, id);
  if (!t || t.status !== 'skip') return;
  t.status = 'todo';
  t.skipReason = undefined;
  log(c, 'Khôi phục việc', id, now);
}

export interface TaskForm { title: string; phase: number; due: string; owner: string; area: string; note: string }

export function addCustomTask(c: CaseData, f: TaskForm, now?: Date): string {
  const title = f.title.trim();
  if (!title) throw new RuleError('Cần nhập tên việc.');
  const id = newId('u');
  const t: TaskInst = {
    id, templateId: null, custom: { title, phase: f.phase || 1, due: f.due.trim() || 'Chưa đặt hạn' },
    status: 'todo', owner: f.owner || null, area: f.area || 'Toàn bộ', note: f.note.trim() || undefined,
  };
  c.tasks.push(t);
  log(c, 'Gia đình thêm việc riêng', id, now);
  return id;
}

export function editTask(c: CaseData, id: string, f: TaskForm, now?: Date) {
  const t = inst(c, id), v = findTask(c, id);
  if (!t || !v) return;
  const title = f.title.trim();
  if (!title) throw new RuleError('Cần nhập tên việc.');
  if (t.custom) {
    t.custom = { title, phase: f.phase || t.custom.phase, due: f.due.trim() || t.custom.due };
  } else {
    if (title !== v.title) t.titleOverride = title;
    if (f.due.trim() && f.due.trim() !== v.due) t.dueOverride = f.due.trim();
  }
  if ((f.owner || null) !== t.owner) {
    t.owner = f.owner || null;
    if (t.owner) log(c, `Giao cho ${memberName(c, t.owner)}`, id, now);
  }
  t.area = f.area || v.area;
  t.note = f.note.trim() || undefined;
  log(c, 'Sửa thông tin việc', id, now);
}

export function deleteCustomTask(c: CaseData, id: string) {
  const t = inst(c, id);
  if (!t || t.templateId !== null) throw new RuleError('Chỉ xóa được việc riêng của gia đình.');
  c.tasks = c.tasks.filter(x => x.id !== id);
}

/* ---------- Hồ sơ người mất & người đại diện ---------- */
export interface PersonForm extends Person { u1name: string; u1rel: string }

export function validatePerson(f: PersonForm): string | null {
  if (!f.name.trim()) return 'Cần nhập họ tên người đã khuất.';
  if (!f.death) return 'Cần nhập ngày mất.';
  const dy = Number(f.death.slice(0, 4));
  if (f.birthYear) {
    const y = Number(f.birthYear);
    if (!Number.isInteger(y) || y < 1880 || y > dy) return 'Năm sinh chưa hợp lệ (phải trước năm mất).';
  }
  return null;
}

export function savePerson(c: CaseData, f: PersonForm, now?: Date) {
  const err = validatePerson(f);
  if (err) throw new RuleError(err);
  c.person = {
    title: f.title, name: f.name.trim(), saint: f.saint.trim(), birthYear: f.birthYear ? String(Number(f.birthYear)) : '',
    death: f.death, time: f.time, hometown: f.hometown.trim(), photo: f.photo,
  };
  const u = c.members.find(m => m.id === U1_ID);
  if (u) { if (f.u1name.trim()) u.name = f.u1name.trim(); if (f.u1rel) u.rel = f.u1rel; }
  // Tên Ban lễ tang có xưng hô theo người mất
  const sys = systemMembers(c.situation, c.person);
  c.members.forEach(m => { const s = sys.find(x => x.id === m.id); if (s && m.system === 'blt') m.name = s.name; });
  log(c, 'Cập nhật hồ sơ người đã khuất', undefined, now);
}

/* ---------- Đội & vùng trách nhiệm ---------- */
export const initials = (name: string) => {
  // Chữ cái đầu của từ cuối có chữ (bỏ qua phần như “(mẫu)”, số, dấu câu)
  const w = name.trim().split(/\s+/).filter(x => /^\p{L}/u.test(x));
  return (w[w.length - 1] || '?').charAt(0).toUpperCase();
};

/** Mã link nhờ việc: 20 ký tự ngẫu nhiên (crypto) — đoán không được */
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(20)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');

export interface MemberForm { name: string; rel: string; access: Access; areas: string[]; phone?: string }

/** Số điện thoại chỉ để liên lạc (tùy chọn); người Đầy đủ / Giới hạn vào đội bằng link mời */
function memberPhone(f: MemberForm): string | undefined {
  if (!f.phone?.trim()) return undefined;
  const p = normalizePhone(f.phone);
  if (!p) throw new RuleError('Số điện thoại chưa đúng (10 số, bắt đầu bằng 03, 05, 07, 08, 09).');
  return p;
}

/** Link mời cho người Đầy đủ / Giới hạn chưa có tài khoản gắn */
export const inviteUrl = (token: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/moi/${token}`;

export function inviteMember(c: CaseData, f: MemberForm, now?: Date): Member {
  if (!f.name.trim()) throw new RuleError('Cần nhập tên người hỗ trợ.');
  if (!f.areas.length) throw new RuleError('Chọn ít nhất một vùng trách nhiệm.');
  const m: Member = {
    id: newId('m'), name: f.name.trim(), rel: f.rel.trim() || 'Người hỗ trợ', role: f.access === 'link' ? 'Người hỗ trợ' : 'Thành viên',
    access: f.access, areas: [...f.areas], linkToken: f.access === 'link' ? token() : undefined,
    inviteToken: f.access === 'link' ? undefined : token(), phone: memberPhone(f),
  };
  if (m.phone && c.members.some(x => x.phone === m.phone)) throw new RuleError('Số điện thoại này đã có trong đội.');
  c.members.push(m);
  log(c, `Mời ${m.name} tham gia (${f.access === 'link' ? 'qua link' : f.access === 'full' ? 'đầy đủ' : 'giới hạn'})`, undefined, now);
  return m;
}

export function saveMember(c: CaseData, id: string, f: MemberForm) {
  const m = c.members.find(x => x.id === id);
  if (!m) return;
  if (!f.name.trim()) throw new RuleError('Họ tên không được để trống.');
  if (!f.areas.length) throw new RuleError('Chọn ít nhất một vùng trách nhiệm.');
  m.name = f.name.trim();
  if (!m.system) m.rel = f.rel.trim() || m.rel;
  m.access = id === U1_ID ? 'full' : f.access;
  m.areas = [...f.areas];
  if (id !== U1_ID && !m.system) m.phone = memberPhone({ ...f, access: m.access });
  if (m.access === 'link' && !m.linkToken) m.linkToken = token();
  if (m.access !== 'link') m.linkToken = undefined;
  if (m.access === 'link' || m.userId || id === U1_ID || m.system) m.inviteToken = undefined;
  else if (!m.inviteToken) m.inviteToken = token();
}

/** Hủy link mời cũ, tạo link mới (người chưa nhận lời mời) */
export function renewInvite(c: CaseData, id: string) {
  const m = c.members.find(x => x.id === id);
  if (m && !m.userId && m.access !== 'link' && id !== U1_ID) m.inviteToken = token();
}

export const shareToken = () => token();

export function removeMember(c: CaseData, id: string, now?: Date) {
  if (id === U1_ID) throw new RuleError('Không bỏ được người đại diện gia đình.');
  const m = c.members.find(x => x.id === id);
  if (!m) return;
  c.tasks.forEach(t => { if (t.owner === id) t.owner = null; });
  c.members = c.members.filter(x => x.id !== id);
  log(c, `Bỏ ${m.name} khỏi đội`, undefined, now);
}

/** Thu hồi link cũ và cấp link mới */
export function renewLink(c: CaseData, id: string) {
  const m = c.members.find(x => x.id === id);
  if (m && m.access === 'link') m.linkToken = token();
}

export interface AreaEdit { name: string; orig: string | null; del?: boolean }

export function saveAreas(c: CaseData, list: AreaEdit[]) {
  const keep = list.filter(x => !x.del), names = keep.map(x => x.name.trim());
  if (names.some(n => !n)) throw new RuleError('Tên vùng không được để trống.');
  if (new Set(names.map(n => n.toLowerCase())).size !== names.length) throw new RuleError('Có hai vùng trùng tên.');
  const ren: Record<string, string> = {};
  keep.forEach(x => { if (x.orig && x.orig !== x.name.trim()) ren[x.orig] = x.name.trim(); });
  const del = list.filter(x => x.del && x.orig).map(x => x.orig as string);
  c.members.forEach(m => { m.areas = m.areas.filter(a => !del.includes(a)).map(a => ren[a] ?? a); });
  c.tasks.forEach(t => {
    const v = findTask(c, t.id);
    if (!v) return;
    if (del.includes(v.area)) t.area = 'Toàn bộ';
    else if (ren[v.area]) t.area = ren[v.area];
  });
  c.areas = names;
  return { ren, del };
}

export const areaUse = (c: CaseData, a: string) =>
  c.members.filter(m => m.areas.includes(a)).length + c.tasks.filter(t => findTask(c, t.id)?.area === a).length;

/**
 * Chuyển quyền người đại diện gia đình cho một người trong đội (đã nhận lời mời, có tài khoản).
 * Vị trí “người đại diện” (mã u1) chuyển sang người mới; người đại diện cũ ở lại đội với quyền Đầy đủ.
 * Mọi chỗ ghi mã hai người (việc, khoản chi, ca trực) đổi chéo để lịch sử vẫn đúng người.
 */
export function transferRepresentative(c: CaseData, memberId: string) {
  const oldU1 = c.members.find(m => m.id === U1_ID);
  const target = c.members.find(m => m.id === memberId);
  if (!oldU1 || !target || memberId === U1_ID) throw new RuleError('Chọn một người khác trong đội.');
  if (!target.userId || target.access === 'link' || target.system) throw new RuleError(`${target.name} cần nhận lời mời và tham gia đội bằng tài khoản trước.`);
  const swap = (id: string | null | undefined) => (id === U1_ID ? memberId : id === memberId ? U1_ID : id);
  c.members = c.members.map(m => {
    if (m.id === U1_ID) return { ...target, id: U1_ID, role: oldU1.role, access: 'full' as const, areas: ['Toàn bộ'], inviteToken: undefined };
    if (m.id === memberId) return { ...oldU1, id: memberId, role: 'Thành viên', access: 'full' as const, areas: ['Toàn bộ'] };
    return m;
  });
  c.tasks.forEach(t => { t.owner = swap(t.owner) ?? null; });
  c.finance?.expenses.forEach(e => { e.payer = swap(e.payer) ?? null; e.requestedBy = swap(e.requestedBy) ?? e.requestedBy; });
  c.shifts?.forEach(s => { s.memberId = swap(s.memberId) ?? s.memberId; if (s.handedTo) s.handedTo = swap(s.handedTo) ?? s.handedTo; });
}
