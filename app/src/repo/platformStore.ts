// Kho dữ liệu vận hành trên máy (Phase 2, chưa có máy chủ).
// Phase 3 thay bằng Supabase: Auth, bảng profiles / orders / vendor_directory…; màn dùng qua usePlatform() không đổi.
import { useSyncExternalStore } from 'react';
import type { DirVendor } from '../domain/types';
import {
  auditEntry, checkOtp, createOrder, DEFAULT_PRODUCTS, DEFAULT_SETTINGS, grantFull, hashPassword, issueOtp, isExpired, loginAttempt,
  matchTransaction, newPreNeed, newSalt, normalizePhone, passwordError, revokeAccess,
  type AuditEntry, type BankTx, type Order, type OtpTicket, type PreNeed, type Product, type ProductId, type Settings, type User,
} from '../domain/platform';
import { normalizeCase } from '../domain/normalize';
import { repo } from './repo';

export interface Session { userId: string; at: string; expiresAt: string; version: number }

export interface PlatformState {
  users: (User & { sessionVersion?: number })[];
  session: Session | null;
  otp: OtpTicket | null;
  directory: DirVendor[];
  products: Product[];
  orders: Order[];
  txs: BankTx[];
  settings: Settings;
  audit: AuditEntry[];
  preNeeds: PreNeed[];
  readUntil?: string;
}

const KEY = 'damhieu.platform.v1';
const SESSION_DAYS = 30;

const initial = (): PlatformState => ({
  users: [], session: null, otp: null, directory: [], products: DEFAULT_PRODUCTS.map(p => ({ ...p })), orders: [], txs: [],
  settings: structuredClone(DEFAULT_SETTINGS), audit: [], preNeeds: [],
});

function load(): PlatformState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial(), ...(JSON.parse(raw) as PlatformState) } : initial();
  } catch {
    return initial();
  }
}

let state: PlatformState = load();
const subs = new Set<() => void>();

function commit(next: PlatformState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* bộ nhớ đầy — vẫn giữ trong phiên */ }
  subs.forEach(f => f());
}
const mut = (fn: (d: PlatformState) => void) => { const d = structuredClone(state); fn(d); commit(d); };

// Đồng bộ giữa các thẻ trình duyệt
if (typeof window !== 'undefined') window.addEventListener('storage', e => { if (e.key === KEY) { state = load(); subs.forEach(f => f()); } });

export const getPlatform = () => state;
/** Bộ chọn phải trả về tham chiếu ổn định (phần tử có sẵn trong state), không tạo mảng mới */
export function usePlatform<T>(sel: (s: PlatformState) => T): T {
  return useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => sel(state));
}

/* ---------- Phiên ---------- */
export function currentUser(s: PlatformState = state, now = new Date()) {
  const ss = s.session;
  if (!ss) return null;
  const u = s.users.find(x => x.id === ss.userId);
  if (!u || u.locked || (u.sessionVersion ?? 0) !== ss.version) return null;
  if (new Date(ss.expiresAt) < now) return null;
  return u;
}
export const sessionExpired = (s: PlatformState = state, now = new Date()) => !!s.session && new Date(s.session.expiresAt) < now;
export const useUser = () => usePlatform(s => currentUser(s));

function startSession(d: PlatformState, u: PlatformState['users'][number], now = new Date()) {
  d.session = { userId: u.id, at: now.toISOString(), expiresAt: new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString(), version: u.sessionVersion ?? 0 };
}
const log = (d: PlatformState, actor: string, action: string, target: string, detail?: string) => d.audit.unshift(auditEntry(actor, action, target, detail));

/* ---------- OTP ---------- */
export function sendOtp(phoneRaw: string, purpose: OtpTicket['purpose']): { error?: string; phone?: string } {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { error: 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 03, 05, 07, 08, 09).' };
  const exists = state.users.some(u => u.phone === phone);
  if (purpose === 'register' && exists) return { error: 'Số điện thoại này đã đăng ký. Vui lòng đăng nhập.' };
  if (purpose === 'reset' && !exists) return { error: 'Chưa có tài khoản với số điện thoại này.' };
  if (purpose === 'phone' && exists) return { error: 'Số điện thoại này đã thuộc tài khoản khác.' };
  try {
    const t = issueOtp(phone, purpose, state.otp);
    mut(d => { d.otp = t; });
    return { phone };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
/** Chỉ bản chạy thử: mã OTP hiện trên màn thay cho tin nhắn (Phase 3 gửi qua SMS / Zalo) */
export const devOtpCode = () => state.otp?.code ?? '';

export function verifyOtp(code: string): string | null {
  const t = state.otp;
  if (!t) return 'Chưa gửi mã. Bấm “Gửi mã”.';
  const r = checkOtp(t, code);
  mut(d => { d.otp = r.ok ? null : r.ticket; });
  return r.ok ? null : r.error ?? 'Mã chưa đúng.';
}

/* ---------- Đăng ký, đăng nhập ---------- */
export async function register(name: string, phoneRaw: string, password: string, otp: string): Promise<string | null> {
  if (!name.trim()) return 'Cần nhập họ tên.';
  const phone = normalizePhone(phoneRaw);
  if (!phone) return 'Số điện thoại chưa đúng.';
  const pe = passwordError(password);
  if (pe) return pe;
  if (state.users.some(u => u.phone === phone)) return 'Số điện thoại này đã đăng ký. Vui lòng đăng nhập.';
  const err = verifyOtp(otp);
  if (err) return err;
  const salt = newSalt();
  const u: User = { id: 'u' + Math.random().toString(36).slice(2, 10), name: name.trim(), phone, salt, passHash: await hashPassword(password, salt), createdAt: new Date().toISOString(), failed: 0 };
  mut(d => { d.users.push(u); startSession(d, u); log(d, u.name, 'Đăng ký tài khoản', fmt(u)); });
  await linkMemberships(u.id, phone);
  return null;
}

const fmt = (u: User) => `${u.name} · ${u.phone}`;

export async function login(phoneRaw: string, password: string): Promise<string | null> {
  const phone = normalizePhone(phoneRaw);
  const u = phone ? state.users.find(x => x.phone === phone) : null;
  if (!u) return 'Số điện thoại hoặc mật khẩu chưa đúng.';
  const ok = (await hashPassword(password, u.salt)) === u.passHash;
  const r = loginAttempt(u, ok);
  mut(d => {
    const i = d.users.findIndex(x => x.id === u.id);
    d.users[i] = { ...d.users[i], ...r.user };
    if (!r.error) startSession(d, d.users[i]);
  });
  if (!r.error) await linkMemberships(u.id, u.phone);
  return r.error;
}

export async function resetPassword(phoneRaw: string, otp: string, password: string): Promise<string | null> {
  const phone = normalizePhone(phoneRaw);
  const u = phone ? state.users.find(x => x.phone === phone) : null;
  if (!u) return 'Chưa có tài khoản với số điện thoại này.';
  const pe = passwordError(password);
  if (pe) return pe;
  const err = verifyOtp(otp);
  if (err) return err;
  const salt = newSalt(), passHash = await hashPassword(password, salt);
  mut(d => {
    const x = d.users.find(y => y.id === u.id)!;
    Object.assign(x, { salt, passHash, failed: 0, lockUntil: undefined, sessionVersion: (x.sessionVersion ?? 0) + 1 });
    startSession(d, x);
    log(d, x.name, 'Đặt lại mật khẩu bằng OTP', fmt(x));
  });
  return null;
}

export function logout() { mut(d => { d.session = null; }); }

export async function changePassword(oldP: string, newP: string): Promise<string | null> {
  const u = currentUser();
  if (!u) return 'Phiên đăng nhập đã hết.';
  if ((await hashPassword(oldP, u.salt)) !== u.passHash) return 'Mật khẩu hiện tại chưa đúng.';
  const pe = passwordError(newP);
  if (pe) return pe;
  const salt = newSalt(), passHash = await hashPassword(newP, salt);
  mut(d => { const x = d.users.find(y => y.id === u.id)!; Object.assign(x, { salt, passHash }); });
  return null;
}

/** Đăng xuất khỏi mọi thiết bị: đổi phiên bản phiên, rồi đăng nhập lại trên thiết bị này */
export function logoutAll() {
  const u = currentUser();
  if (!u) return;
  mut(d => { const x = d.users.find(y => y.id === u.id)!; x.sessionVersion = (x.sessionVersion ?? 0) + 1; d.session = null; log(d, x.name, 'Đăng xuất khỏi mọi thiết bị', fmt(x)); });
}

export function updateProfile(name: string): string | null {
  const u = currentUser();
  if (!u) return 'Phiên đăng nhập đã hết.';
  if (!name.trim()) return 'Họ tên không được để trống.';
  mut(d => { d.users.find(y => y.id === u.id)!.name = name.trim(); });
  return null;
}

export function changePhone(phoneRaw: string, otp: string): string | null {
  const u = currentUser();
  const phone = normalizePhone(phoneRaw);
  if (!u || !phone) return 'Số điện thoại chưa đúng.';
  const err = verifyOtp(otp);
  if (err) return err;
  mut(d => { d.users.find(y => y.id === u.id)!.phone = phone; log(d, u.name, 'Đổi số điện thoại', `${u.phone} → ${phone}`); });
  return null;
}

export function requestDeleteAccount(cancel = false) {
  const u = currentUser();
  if (!u) return;
  mut(d => { const x = d.users.find(y => y.id === u.id)!; x.deleteRequestedAt = cancel ? undefined : new Date().toISOString(); log(d, x.name, cancel ? 'Hủy yêu cầu xóa tài khoản' : 'Yêu cầu xóa tài khoản', fmt(x)); });
}

/** Gắn tài khoản vào thành viên đã được mời bằng số điện thoại */
async function linkMemberships(userId: string, phone: string) {
  const all = await repo.listAll();
  for (const c of all) {
    const m = c.members.find(x => !x.userId && x.phone === phone);
    if (m) { m.userId = userId; await repo.save(c); }
  }
}

/* ---------- Admin: tài khoản Admin thử (Phase 3: do chủ hệ thống tạo trên máy chủ) ---------- */
export async function createAdmin(name: string, phoneRaw: string, password: string): Promise<string | null> {
  if (state.users.some(u => u.isAdmin)) return 'Đã có tài khoản Admin.';
  const phone = normalizePhone(phoneRaw);
  if (!name.trim() || !phone) return 'Cần họ tên và số điện thoại đúng.';
  const pe = passwordError(password);
  if (pe) return pe;
  if (state.users.some(u => u.phone === phone)) return 'Số này đã là tài khoản người dùng — Admin dùng số riêng.';
  const salt = newSalt();
  const u: User = { id: 'adm' + Math.random().toString(36).slice(2, 8), name: name.trim(), phone, salt, passHash: await hashPassword(password, salt), createdAt: new Date().toISOString(), failed: 0, isAdmin: true };
  mut(d => { d.users.push(u); startSession(d, u); log(d, u.name, 'Tạo tài khoản Admin', fmt(u)); });
  return null;
}

export function adminLog(action: string, target: string, detail?: string) {
  const u = currentUser();
  mut(d => log(d, u?.name ?? 'Hệ thống', action, target, detail));
}

export function setUserLocked(id: string, locked: boolean, reason: string) {
  const a = currentUser();
  mut(d => { const x = d.users.find(y => y.id === id)!; x.locked = locked; log(d, a?.name ?? 'Admin', locked ? 'Khóa tài khoản' : 'Mở khóa tài khoản', fmt(x), reason); });
}
export function setSupportNote(id: string, note: string) {
  mut(d => { d.users.find(y => y.id === id)!.supportNote = note; });
}

export function saveProduct(p: Product) {
  const a = currentUser();
  mut(d => {
    const i = d.products.findIndex(x => x.id === p.id), old = d.products[i];
    d.products[i] = { ...p, updatedAt: new Date().toISOString() };
    log(d, a?.name ?? 'Admin', 'Sửa gói & giá', p.name, old.price !== p.price ? `Giá ${old.price.toLocaleString('vi-VN')} → ${p.price.toLocaleString('vi-VN')} đ` : undefined);
  });
}

export function saveSettings(s: Settings, what: string) {
  const a = currentUser();
  mut(d => { d.settings = s; log(d, a?.name ?? 'Admin', 'Đổi cài đặt', what); });
}

export function saveVendor(v: DirVendor, isNew: boolean) {
  const a = currentUser();
  mut(d => {
    if (isNew) d.directory.push(v); else d.directory[d.directory.findIndex(x => x.id === v.id)] = v;
    log(d, a?.name ?? 'Admin', isNew ? 'Thêm nhà cung cấp' : 'Sửa nhà cung cấp', v.name);
  });
}
export function setVendorActive(id: string, active: boolean) {
  const a = currentUser();
  mut(d => { const v = d.directory.find(x => x.id === id)!; v.active = active; v.updatedAt = new Date().toISOString(); log(d, a?.name ?? 'Admin', active ? 'Bật nhà cung cấp' : 'Ẩn nhà cung cấp', v.name); });
}

/* ---------- Đơn hàng & thanh toán ---------- */
export function placeOrder(product: ProductId, target: Order['target'], returnTo?: string): { order?: Order; error?: string } {
  const u = currentUser();
  if (!u) return { error: 'Cần đăng nhập.' };
  const p = state.products.find(x => x.id === product)!;
  // Dùng lại đơn đang chờ cùng mục tiêu, tránh tạo đơn trùng
  const open = state.orders.find(o => o.userId === u.id && o.product === product && o.target.id === target.id && o.status === 'pending' && !isExpired(o));
  if (open) return { order: open };
  try {
    const o = createOrder(p, u.id, target, new Set(state.orders.map(x => x.code)), returnTo);
    mut(d => { d.orders.unshift(o); log(d, u.name, 'Tạo đơn', o.code, `${p.name} · ${o.amount.toLocaleString('vi-VN')} đ`); });
    return { order: o };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export function expireOrders(now = new Date()) {
  if (!state.orders.some(o => isExpired(o, now))) return;
  mut(d => { d.orders.forEach(o => { if (isExpired(o, now)) o.status = 'expired'; }); });
}

/** Mở quyền theo đơn đã thanh toán (máy chủ làm ở Phase 4) */
async function applyPaid(o: Order) {
  if (o.target.kind === 'case') {
    const c = await repo.get(o.target.id);
    if (c) { normalizeCase(c); grantFull(c, 'payment', o.code); c.history.push({ at: new Date().toISOString(), text: `Mở đầy đủ đám hiếu (đơn ${o.code})` }); await repo.save(c); }
  } else {
    mut(d => { const p = d.preNeeds.find(x => x.id === o.target.id); if (p) { p.paid = true; p.orderId = o.code; } });
  }
}

/**
 * Giả lập SePay báo có giao dịch (chỉ bản chạy thử). Phase 4: webhook POST /api/webhooks/sepay trên máy chủ,
 * xác thực, rồi gọi cùng luật matchTransaction.
 */
export async function simulateBankTx(input: { providerTxId: string; amount: number; content: string; account?: string }) {
  const cfg = state.settings.sepay.account;
  // Chưa cài tài khoản nhận thì giả lập trên một tài khoản thử
  const acct = cfg.number ? cfg : { bank: 'Tài khoản thử', number: '0000000000', holder: 'THU NGHIEM', active: true };
  const r = matchTransaction({ ...input, account: input.account ?? acct.number }, state.orders, state.txs, acct);
  if (r.duplicate) return r;
  mut(d => {
    d.txs.unshift(r.tx);
    if (r.order) { d.orders[d.orders.findIndex(o => o.id === r.order!.id)] = r.order; log(d, 'SePay (giả lập)', 'Khớp giao dịch', r.order.code, `${r.tx.amount.toLocaleString('vi-VN')} đ`); }
    else log(d, 'SePay (giả lập)', r.tx.status === 'ignored' ? 'Bỏ qua giao dịch' : 'Giao dịch chưa khớp', r.tx.providerTxId, r.tx.reason);
  });
  if (r.order) await applyPaid(r.order);
  return r;
}

/** Admin gán giao dịch chưa khớp vào đơn đúng (có nhật ký) */
export async function assignTx(txId: string, orderCode: string, reason: string): Promise<string | null> {
  const a = currentUser();
  const tx = state.txs.find(t => t.id === txId), o = state.orders.find(x => x.code === orderCode.trim().toUpperCase());
  if (!tx || tx.status !== 'unmatched') return 'Giao dịch không ở trạng thái chưa khớp.';
  if (!o) return 'Không tìm thấy đơn với mã này.';
  if (o.status === 'paid') return 'Đơn này đã thanh toán.';
  if (!reason.trim()) return 'Ghi lý do gán tay.';
  const paid: Order = { ...o, status: 'paid', paidAt: new Date().toISOString(), txId: tx.id, note: `Gán tay: ${reason.trim()}` };
  mut(d => {
    d.txs.find(t => t.id === txId)!.status = 'matched';
    d.txs.find(t => t.id === txId)!.orderId = o.id;
    d.orders[d.orders.findIndex(x => x.id === o.id)] = paid;
    log(d, a?.name ?? 'Admin', 'Gán giao dịch vào đơn', o.code, reason.trim());
  });
  await applyPaid(paid);
  return null;
}

export function refundTx(txId: string, reason: string): string | null {
  const a = currentUser();
  if (!reason.trim()) return 'Ghi lý do hoàn tiền.';
  mut(d => { const t = d.txs.find(x => x.id === txId)!; t.status = 'refunded'; t.reason = reason.trim(); log(d, a?.name ?? 'Admin', 'Đánh dấu hoàn tiền', t.providerTxId, reason.trim()); });
  return null;
}

export function refundOrder(code: string, reason: string): string | null {
  const a = currentUser();
  if (!reason.trim()) return 'Ghi lý do hoàn tiền.';
  mut(d => { const o = d.orders.find(x => x.code === code)!; o.status = 'refunded'; o.note = reason.trim(); log(d, a?.name ?? 'Admin', 'Hoàn tiền đơn (xử lý tay)', code, reason.trim()); });
  return null;
}

/** Admin mở / thu hồi quyền thủ công, có lý do */
export async function setCaseAccess(caseId: string, open: boolean, reason: string): Promise<string | null> {
  if (!reason.trim()) return 'Ghi lý do.';
  const a = currentUser();
  const c = await repo.get(caseId);
  if (!c) return 'Không tìm thấy đám hiếu.';
  normalizeCase(c);
  if (open) grantFull(c, 'manual'); else revokeAccess(c, reason.trim());
  await repo.save(c);
  mut(d => log(d, a?.name ?? 'Admin', open ? 'Mở quyền thủ công' : 'Thu hồi quyền', `Đám hiếu ${caseId}`, reason.trim()));
  return null;
}

/* ---------- Hồ sơ chuẩn bị ---------- */
export function createPreNeed(forSelf: boolean): PreNeed | null {
  const u = currentUser();
  if (!u) return null;
  const p = newPreNeed(u.id, forSelf);
  if (forSelf) p.subject.name = u.name;
  mut(d => { d.preNeeds.push(p); });
  return p;
}
export function savePreNeed(p: PreNeed) {
  mut(d => { d.preNeeds[d.preNeeds.findIndex(x => x.id === p.id)] = p; });
}
export const myPreNeeds = (list: PreNeed[], uid: string, phone: string) =>
  list.filter(p => p.ownerId === uid || p.shares.some(x => x.phone === phone));

export function markRead() { mut(d => { d.readUntil = new Date().toISOString(); }); }

/** Chỉ bản chạy thử: xóa toàn bộ dữ liệu trên máy */
export function resetAllLocalData() {
  localStorage.removeItem(KEY);
  state = initial();
  subs.forEach(f => f());
}
