// Kho dữ liệu vận hành: tài khoản, danh bạ nhà cung cấp, gói & giá, đơn hàng, hồ sơ chuẩn bị, nhật ký.
// Hai chế độ, cùng một bộ hàm cho các màn:
//  • REMOTE (Phase 3a): Supabase Auth + bảng trên máy chủ; state ở đây chỉ là bản sao để hiển thị.
//  • Trên máy (bản chạy thử, trang /mau): như Phase 2, lưu localStorage.
import { useSyncExternalStore } from 'react';
import type { CaseData, DirVendor, VendorCat } from '../domain/types';
import { sharedFamilyVendors, vendorCandidates, type SharedFamilyVendor, type VendorCandidate } from '../domain/vendors';
import {
  auditEntry, checkOtp, createOrder, DEFAULT_PRODUCTS, DEFAULT_SETTINGS, grantFull, hashPassword, issueOtp, isExpired, loginAttempt,
  matchTransaction, newPreNeed, newSalt, normalizePhone, passwordError, revokeAccess,
  type AuditEntry, type BankTx, type MatchResult, type Order, type OtpTicket, type PreNeed, type Product, type ProductId, type Settings, type User,
} from '../domain/platform';
import { normalizeCase } from '../domain/normalize';
import { friendlyError, phoneEmail, REMOTE, sb } from './backend';
import { repo } from './repo';

export interface Session { userId: string; at: string; expiresAt: string; version: number }

export interface PlatformState {
  ready: boolean;
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
  /** Tài khoản đang đăng nhập: vào bằng số điện thoại hay Google, đã liên kết Google chưa */
  auth?: { email: string | null; loginByPhone: boolean; google: boolean };
}

const KEY = 'damhieu.platform.v1';
const READ_KEY = 'tronhieu.read-until';
const SESSION_DAYS = 30;
const FAR = '9999-12-31T00:00:00.000Z';

const initial = (): PlatformState => ({
  ready: !REMOTE, users: [], session: null, otp: null, directory: [], products: DEFAULT_PRODUCTS.map(p => ({ ...p })), orders: [], txs: [],
  settings: structuredClone(DEFAULT_SETTINGS), audit: [], preNeeds: [],
});

function load(): PlatformState {
  if (REMOTE) return initial();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial(), ...(JSON.parse(raw) as PlatformState), ready: true } : initial();
  } catch {
    return initial();
  }
}

let state: PlatformState = load();
try { state.readUntil = localStorage.getItem(READ_KEY) ?? state.readUntil; } catch { /* bỏ qua */ }
const subs = new Set<() => void>();

function commit(next: PlatformState) {
  state = next;
  if (!REMOTE) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* bộ nhớ đầy — vẫn giữ trong phiên */ } }
  subs.forEach(f => f());
}
const mut = (fn: (d: PlatformState) => void) => { const d = structuredClone(state); fn(d); commit(d); };

// Đồng bộ giữa các thẻ trình duyệt (chế độ trên máy)
if (typeof window !== 'undefined' && !REMOTE) window.addEventListener('storage', e => { if (e.key === KEY) { state = load(); subs.forEach(f => f()); } });

export const getPlatform = () => state;
/** Bộ chọn phải trả về tham chiếu ổn định (phần tử có sẵn trong state), không tạo mảng mới */
export function usePlatform<T>(sel: (s: PlatformState) => T): T {
  return useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => sel(state));
}

/* =====================================================================
   Máy chủ: nạp dữ liệu sau khi đăng nhập
   ===================================================================== */
type Profile = { id: string; name: string; phone: string | null; email: string | null; is_admin: boolean; locked: boolean; delete_requested_at: string | null; support_note: string | null; created_at: string };
const toUser = (p: Profile): User => ({
  id: p.id, name: p.name, phone: p.phone ?? '', email: p.email ?? undefined, passHash: '', salt: '', createdAt: p.created_at, failed: 0,
  isAdmin: p.is_admin, locked: p.locked, deleteRequestedAt: p.delete_requested_at ?? undefined, supportNote: p.support_note ?? undefined,
});
type PreRow = { id: string; owner_id: string; data: PreNeed; paid: boolean; order_code: string | null; case_id: string | null; activated_at: string | null };
const toPre = (r: PreRow): PreNeed => ({ ...r.data, id: r.id, ownerId: r.owner_id, paid: r.paid, orderId: r.order_code ?? undefined, caseId: r.case_id ?? undefined, activatedAt: r.activated_at ?? r.data.activatedAt });
const dataOf = <T,>(rows: { data: T }[] | null) => (rows ?? []).map(r => r.data);

async function fetchOrders(admin: boolean) {
  const [o, t, a] = await Promise.all([
    sb!.from('orders').select('data, status').order('created_at', { ascending: false }),
    admin ? sb!.from('bank_txs').select('data').order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    admin ? sb!.from('audit_log').select('*').order('at', { ascending: false }).limit(500) : Promise.resolve({ data: [] }),
  ]);
  return {
    orders: ((o.data ?? []) as { data: Order; status: Order['status'] }[]).map(r => ({ ...r.data, status: r.status })),
    txs: dataOf(t.data as { data: BankTx }[]),
    audit: ((a.data ?? []) as { id: number; at: string; actor: string; action: string; target: string; detail: string | null }[])
      .map(x => ({ id: String(x.id), at: x.at, actor: x.actor, action: x.action, target: x.target, detail: x.detail ?? undefined })),
  };
}

async function hydrate(uid: string | null) {
  const prods = await sb!.from('products').select('data');
  const products = prods.data?.length ? dataOf(prods.data as { data: Product }[]) : DEFAULT_PRODUCTS;
  if (!uid) { commit({ ...initial(), products, ready: true, readUntil: state.readUntil }); return; }
  const { data: me } = await sb!.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (!me) { await sb!.auth.signOut(); commit({ ...initial(), products, ready: true }); return; }
  const admin = (me as Profile).is_admin;
  const { data: au } = await sb!.auth.getUser();
  const auth = { email: au.user?.email ?? null, loginByPhone: !!au.user?.email?.endsWith('@sdt.tronhieu.app'), google: (au.user?.identities ?? []).some(i => i.provider === 'google') };
  const [dir, set, pres, users, ord] = await Promise.all([
    sb!.from('vendor_directory').select('data, active'),
    sb!.from('app_settings').select('data').eq('id', 1).maybeSingle(),
    sb!.from('pre_needs').select('*').order('created_at'),
    admin ? sb!.from('profiles').select('*').order('created_at', { ascending: false }) : Promise.resolve({ data: [me] }),
    fetchOrders(admin),
  ]);
  commit({
    ...initial(), ready: true, readUntil: state.readUntil, otp: state.otp, auth,
    users: ((users.data ?? []) as Profile[]).map(toUser),
    session: { userId: uid, at: new Date().toISOString(), expiresAt: FAR, version: 0 },
    directory: ((dir.data ?? []) as { data: DirVendor; active: boolean }[]).map(r => ({ ...r.data, active: r.active })),
    products, settings: (set.data as { data: Settings } | null)?.data ?? structuredClone(DEFAULT_SETTINGS),
    preNeeds: ((pres.data ?? []) as PreRow[]).map(toPre), ...ord,
  });
}

/** Gọi một lần khi mở app: nạp phiên đăng nhập và dữ liệu từ máy chủ */
export async function initPlatform() {
  if (!REMOTE) return;
  try {
    const { data } = await sb!.auth.getSession();
    await hydrate(data.session?.user.id ?? null);
  } catch {
    commit({ ...state, ready: true });
  }
  sb!.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') void hydrate(null); });
}

/** Tải lại đơn hàng (màn chờ thanh toán dùng để cập nhật trạng thái) */
export async function refreshOrders() {
  if (!REMOTE) return;
  const u = currentUser();
  const ord = await fetchOrders(!!u?.isAdmin);
  mut(d => { Object.assign(d, ord); });
}
async function refreshAdmin() {
  const u = currentUser();
  if (!REMOTE || !u) return;
  await hydrate(u.id);
}
const rpcErr = (e: { message: string } | null) => (e ? friendlyError(e) : null);

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
const OTP_LATER = 'Lấy lại mật khẩu và đổi số điện thoại bằng mã OTP sẽ mở khi có bên gửi tin nhắn (giai đoạn 3b). Trong lúc này, liên hệ hỗ trợ để được đặt lại.';

/* ---------- OTP (vẫn giả lập tới Phase 3b) ---------- */
export function sendOtp(phoneRaw: string, purpose: OtpTicket['purpose']): { error?: string; phone?: string } {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { error: 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 03, 05, 07, 08, 09).' };
  if (REMOTE && purpose !== 'register') return { error: OTP_LATER };
  if (!REMOTE) {
    const exists = state.users.some(u => u.phone === phone);
    if (purpose === 'register' && exists) return { error: 'Số điện thoại này đã đăng ký. Vui lòng đăng nhập.' };
    if (purpose === 'reset' && !exists) return { error: 'Chưa có tài khoản với số điện thoại này.' };
    if (purpose === 'phone' && exists) return { error: 'Số điện thoại này đã thuộc tài khoản khác.' };
  }
  try {
    const t = issueOtp(phone, purpose, state.otp);
    mut(d => { d.otp = t; });
    return { phone };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
/** Chỉ bản chạy thử: mã OTP hiện trên màn thay cho tin nhắn (Phase 3b gửi qua SMS / Zalo) */
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
  if (!REMOTE && state.users.some(u => u.phone === phone)) return 'Số điện thoại này đã đăng ký. Vui lòng đăng nhập.';
  // Bản thật: chưa có bên gửi tin nhắn nên không xác minh số bằng mã (số điện thoại không dùng để cấp quyền)
  if (!REMOTE) { const err = verifyOtp(otp); if (err) return err; }
  if (REMOTE) {
    const { data, error } = await sb!.auth.signUp({ email: phoneEmail(phone), password, options: { data: { name: name.trim(), phone } } });
    if (error) return friendlyError(error);
    if (!data.session) return friendlyError({ message: 'Email not confirmed' });
    await hydrate(data.user!.id);
    return null;
  }
  const salt = newSalt();
  const u: User = { id: 'u' + Math.random().toString(36).slice(2, 10), name: name.trim(), phone, salt, passHash: await hashPassword(password, salt), createdAt: new Date().toISOString(), failed: 0 };
  mut(d => { d.users.push(u); startSession(d, u); log(d, u.name, 'Đăng ký tài khoản', fmt(u)); });
  return null;
}

const fmt = (u: User) => `${u.name} · ${u.phone}`;

export async function login(phoneRaw: string, password: string): Promise<string | null> {
  const phone = normalizePhone(phoneRaw);
  if (REMOTE) {
    if (!phone) return 'Số điện thoại hoặc mật khẩu chưa đúng.';
    const { data, error } = await sb!.auth.signInWithPassword({ email: phoneEmail(phone), password });
    if (error) return friendlyError(error);
    const { data: p } = await sb!.from('profiles').select('locked').eq('id', data.user.id).maybeSingle();
    if ((p as { locked?: boolean } | null)?.locked) { await sb!.auth.signOut(); return 'Tài khoản đang bị khóa. Liên hệ hỗ trợ để được mở.'; }
    await hydrate(data.user.id);
    return null;
  }
  const u = phone ? state.users.find(x => x.phone === phone) : null;
  if (!u) return 'Số điện thoại hoặc mật khẩu chưa đúng.';
  const ok = (await hashPassword(password, u.salt)) === u.passHash;
  const r = loginAttempt(u, ok);
  mut(d => {
    const i = d.users.findIndex(x => x.id === u.id);
    d.users[i] = { ...d.users[i], ...r.user };
    if (!r.error) startSession(d, d.users[i]);
  });
  return r.error;
}

export async function resetPassword(phoneRaw: string, otp: string, password: string): Promise<string | null> {
  if (REMOTE) return OTP_LATER;
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

export function logout() {
  if (REMOTE) { void sb!.auth.signOut().then(() => hydrate(null)); mut(d => { d.session = null; }); return; }
  mut(d => { d.session = null; });
}

export async function changePassword(oldP: string, newP: string): Promise<string | null> {
  const u = currentUser();
  if (!u) return 'Phiên đăng nhập đã hết.';
  const pe = passwordError(newP);
  if (REMOTE) {
    const chk = await sb!.auth.signInWithPassword({ email: phoneEmail(u.phone), password: oldP });
    if (chk.error) return 'Mật khẩu hiện tại chưa đúng.';
    if (pe) return pe;
    const { error } = await sb!.auth.updateUser({ password: newP });
    return error ? friendlyError(error) : null;
  }
  if ((await hashPassword(oldP, u.salt)) !== u.passHash) return 'Mật khẩu hiện tại chưa đúng.';
  if (pe) return pe;
  const salt = newSalt(), passHash = await hashPassword(newP, salt);
  mut(d => { const x = d.users.find(y => y.id === u.id)!; Object.assign(x, { salt, passHash }); });
  return null;
}

/** Đăng xuất khỏi mọi thiết bị */
export function logoutAll() {
  const u = currentUser();
  if (!u) return;
  if (REMOTE) { void sb!.auth.signOut({ scope: 'global' }); mut(d => { d.session = null; }); return; }
  mut(d => { const x = d.users.find(y => y.id === u.id)!; x.sessionVersion = (x.sessionVersion ?? 0) + 1; d.session = null; log(d, x.name, 'Đăng xuất khỏi mọi thiết bị', fmt(x)); });
}

export async function updateProfile(name: string): Promise<string | null> {
  const u = currentUser();
  if (!u) return 'Phiên đăng nhập đã hết.';
  if (!name.trim()) return 'Họ tên không được để trống.';
  if (REMOTE) {
    const { error } = await sb!.from('profiles').update({ name: name.trim() }).eq('id', u.id);
    if (error) return friendlyError(error);
  }
  mut(d => { d.users.find(y => y.id === u.id)!.name = name.trim(); });
  return null;
}

export function changePhone(phoneRaw: string, otp: string): string | null {
  if (REMOTE) return OTP_LATER;
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
  const at = cancel ? undefined : new Date().toISOString();
  if (REMOTE) void sb!.from('profiles').update({ delete_requested_at: at ?? null }).eq('id', u.id);
  mut(d => { const x = d.users.find(y => y.id === u.id)!; x.deleteRequestedAt = at; if (!REMOTE) log(d, x.name, cancel ? 'Hủy yêu cầu xóa tài khoản' : 'Yêu cầu xóa tài khoản', fmt(x)); });
}


/* ---------- Admin ---------- */
/** Chế độ trên máy: tạo tài khoản Admin thử. Trên máy chủ: Admin là tài khoản thường được bật quyền. */
export async function createAdmin(name: string, phoneRaw: string, password: string): Promise<string | null> {
  if (REMOTE) return 'Trên máy chủ, Admin là tài khoản đăng ký bằng số điện thoại rồi được chủ hệ thống bật quyền Admin.';
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
  if (REMOTE) { if (u?.isAdmin) void sb!.rpc('admin_log', { p_action: action, p_target: target, p_detail: detail ?? null }); return; }
  mut(d => log(d, u?.name ?? 'Hệ thống', action, target, detail));
}

export async function setUserLocked(id: string, locked: boolean, reason: string): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.rpc('admin_set_user', { p_uid: id, p_locked: locked, p_note: null, p_reason: reason });
    if (error) return friendlyError(error);
    await refreshAdmin();
    return null;
  }
  const a = currentUser();
  mut(d => { const x = d.users.find(y => y.id === id)!; x.locked = locked; log(d, a?.name ?? 'Admin', locked ? 'Khóa tài khoản' : 'Mở khóa tài khoản', fmt(x), reason); });
  return null;
}
export async function setSupportNote(id: string, note: string) {
  if (REMOTE) await sb!.rpc('admin_set_user', { p_uid: id, p_locked: null, p_note: note, p_reason: null });
  mut(d => { d.users.find(y => y.id === id)!.supportNote = note; });
}

export async function saveProduct(p: Product): Promise<string | null> {
  const next = { ...p, updatedAt: new Date().toISOString() };
  if (REMOTE) {
    const { error } = await sb!.rpc('admin_save_product', { p_id: p.id, p_data: next });
    if (error) return friendlyError(error);
    await refreshAdmin();
    return null;
  }
  const a = currentUser();
  mut(d => {
    const i = d.products.findIndex(x => x.id === p.id), old = d.products[i];
    d.products[i] = next;
    log(d, a?.name ?? 'Admin', 'Sửa gói & giá', p.name, old.price !== p.price ? `Giá ${old.price.toLocaleString('vi-VN')} → ${p.price.toLocaleString('vi-VN')} đ` : undefined);
  });
  return null;
}

export async function saveSettings(s: Settings, what: string): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.rpc('admin_save_settings', { p_data: s, p_what: what });
    if (error) return friendlyError(error);
    await refreshAdmin();
    return null;
  }
  const a = currentUser();
  mut(d => { d.settings = s; log(d, a?.name ?? 'Admin', 'Đổi cài đặt', what); });
  return null;
}

export async function saveVendor(v: DirVendor, isNew: boolean): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.rpc('admin_save_vendor', { p_id: v.id, p_data: v, p_active: v.active });
    if (error) return friendlyError(error);
    await refreshAdmin();
    return null;
  }
  const a = currentUser();
  mut(d => {
    if (isNew) d.directory.push(v); else d.directory[d.directory.findIndex(x => x.id === v.id)] = v;
    log(d, a?.name ?? 'Admin', isNew ? 'Thêm nhà cung cấp' : 'Sửa nhà cung cấp', v.name);
  });
  return null;
}
export async function setVendorActive(id: string, active: boolean): Promise<string | null> {
  const v = state.directory.find(x => x.id === id);
  if (!v) return 'Không tìm thấy nhà cung cấp.';
  const next = { ...v, active, updatedAt: new Date().toISOString() };
  if (REMOTE) return saveVendor(next, false);
  const a = currentUser();
  mut(d => { d.directory[d.directory.findIndex(x => x.id === id)] = next; log(d, a?.name ?? 'Admin', active ? 'Bật nhà cung cấp' : 'Ẩn nhà cung cấp', v.name); });
  return null;
}

/* ---------- Đơn hàng & thanh toán ---------- */
export async function placeOrder(product: ProductId, target: Order['target'], returnTo?: string, until?: string): Promise<{ order?: Order; error?: string }> {
  const u = currentUser();
  if (!u) return { error: 'Cần đăng nhập.' };
  if (REMOTE) {
    const { data, error } = await sb!.rpc('create_order', { p_product: product, p_kind: target.kind, p_target: target.id, p_name: target.name, p_return: returnTo ?? null, p_until: until ?? null });
    if (error) return { error: friendlyError(error) };
    const o = { ...(data as { data: Order }).data, status: (data as { status: Order['status'] }).status };
    mut(d => { d.orders = [o, ...d.orders.filter(x => x.code !== o.code)]; });
    return { order: o };
  }
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
  if (REMOTE || !state.orders.some(o => isExpired(o, now))) return;
  mut(d => { d.orders.forEach(o => { if (isExpired(o, now)) o.status = 'expired'; }); });
}

/** Chế độ trên máy: mở quyền theo đơn đã thanh toán (máy chủ tự làm trong hàm khớp giao dịch) */
async function applyPaid(o: Order) {
  if (o.target.kind === 'case') {
    const c = await repo.get(o.target.id);
    if (c) { normalizeCase(c); grantFull(c, 'payment', o.code); c.history.push({ at: new Date().toISOString(), text: `Mở đầy đủ đám hiếu (đơn ${o.code})` }); await repo.save(c); }
  } else {
    mut(d => { const p = d.preNeeds.find(x => x.id === o.target.id); if (p) { p.paid = true; p.orderId = o.code; } });
  }
}

/**
 * Giả lập ngân hàng báo có giao dịch (chỉ môi trường thử). Trên máy chủ: hàm simulate_bank_tx khớp và mở quyền.
 * Phase 4: webhook SePay đã xác thực thay cho giả lập, luật khớp giữ nguyên.
 */
export async function simulateBankTx(input: { providerTxId: string; amount: number; content: string; account?: string }): Promise<Pick<MatchResult, 'duplicate'> & { tx: Pick<BankTx, 'status' | 'reason'> }> {
  if (REMOTE) {
    const { data, error } = await sb!.rpc('simulate_bank_tx', { p_provider_id: input.providerTxId, p_amount: input.amount, p_content: input.content });
    if (error) return { duplicate: false, tx: { status: 'ignored', reason: friendlyError(error) } };
    const r = data as { duplicate: boolean; status?: BankTx['status']; reason?: string };
    await refreshAdmin();
    return { duplicate: r.duplicate, tx: { status: r.status ?? 'ignored', reason: r.reason ?? undefined } };
  }
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

/** Admin chuyển SePay sang chạy thật: dọn đơn & giao dịch thử (giữ giao dịch thật), tắt giả lập */
export async function goLiveSepay(): Promise<{ error?: string; orders?: number; txs?: number }> {
  if (REMOTE) {
    const { data, error } = await sb!.rpc('admin_sepay_go_live');
    if (error) return { error: friendlyError(error) };
    await refreshAdmin();
    return data as { orders: number; txs: number };
  }
  let orders = 0, txs = 0;
  mut(d => {
    const real = new Set(d.txs.filter(t => t.providerTxId.startsWith('sepay:') && t.status === 'matched').map(t => t.orderId));
    const keep = d.orders.filter(o => real.has(o.code)); orders = d.orders.length - keep.length; d.orders = keep;
    const kt = d.txs.filter(t => t.providerTxId.startsWith('sepay:')); txs = d.txs.length - kt.length; d.txs = kt;
    d.settings.sepay.env = 'live';
    log(d, currentUser()?.name ?? 'Admin', 'Chuyển SePay sang chạy thật', 'SePay', `Dọn ${orders} đơn thử, ${txs} giao dịch thử`);
  });
  return { orders, txs };
}

/** Admin gán giao dịch chưa khớp vào đơn đúng (có nhật ký) */
export async function assignTx(txId: string, orderCode: string, reason: string): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.rpc('admin_assign_tx', { p_tx: txId, p_code: orderCode, p_reason: reason });
    if (error) return friendlyError(error);
    await refreshAdmin();
    return null;
  }
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

export async function refundTx(txId: string, reason: string): Promise<string | null> {
  if (!reason.trim()) return 'Ghi lý do hoàn tiền.';
  if (REMOTE) { const { error } = await sb!.rpc('admin_refund', { p_kind: 'tx', p_id: txId, p_reason: reason }); await refreshAdmin(); return rpcErr(error); }
  const a = currentUser();
  mut(d => { const t = d.txs.find(x => x.id === txId)!; t.status = 'refunded'; t.reason = reason.trim(); log(d, a?.name ?? 'Admin', 'Đánh dấu hoàn tiền', t.providerTxId, reason.trim()); });
  return null;
}

export async function refundOrder(code: string, reason: string): Promise<string | null> {
  if (!reason.trim()) return 'Ghi lý do hoàn tiền.';
  if (REMOTE) { const { error } = await sb!.rpc('admin_refund', { p_kind: 'order', p_id: code, p_reason: reason }); await refreshAdmin(); return rpcErr(error); }
  const a = currentUser();
  mut(d => { const o = d.orders.find(x => x.code === code)!; o.status = 'refunded'; o.note = reason.trim(); log(d, a?.name ?? 'Admin', 'Hoàn tiền đơn (xử lý tay)', code, reason.trim()); });
  return null;
}

/** Admin mở / thu hồi quyền thủ công, có lý do */
export async function setCaseAccess(caseId: string, open: boolean, reason: string): Promise<string | null> {
  if (!reason.trim()) return 'Ghi lý do.';
  if (REMOTE) {
    const { error } = await sb!.rpc('admin_set_case_access', { p_case: caseId, p_open: open, p_reason: reason, p_until: null });
    await refreshAdmin();
    return rpcErr(error);
  }
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
export async function createPreNeed(forSelf: boolean): Promise<PreNeed | null> {
  const u = currentUser();
  if (!u) return null;
  const p = newPreNeed(u.id, forSelf);
  if (forSelf) p.subject.name = u.name;
  if (REMOTE) {
    const { error } = await sb!.from('pre_needs').insert({ id: p.id, owner_id: u.id, data: p });
    if (error) throw new Error(friendlyError(error));
  }
  mut(d => { d.preNeeds.push(p); });
  return p;
}

export async function savePreNeed(p: PreNeed): Promise<string | null> {
  if (REMOTE) {
    const { data, error } = await sb!.from('pre_needs').update({ data: p }).eq('id', p.id).select('id');
    if (error) return friendlyError(error);
    if (!data?.length) return 'Anh/chị không có quyền sửa hồ sơ này, hoặc hồ sơ đã kích hoạt.';
  }
  mut(d => { d.preNeeds[d.preNeeds.findIndex(x => x.id === p.id)] = p; });
  return null;
}

/** Kích hoạt hồ sơ: tạo đám hiếu mở đầy đủ (máy chủ kiểm tra đã mở gói và quyền kích hoạt) */
export async function activatePre(p: PreNeed, c: CaseData, until: string | undefined, byName: string): Promise<string | null> {
  if (REMOTE) {
    const data = structuredClone(c) as CaseData & Record<string, unknown>;
    delete data.access; delete data.ledger; delete data.ownerId;
    const { error } = await sb!.rpc('activate_pre_need', { p_pre: p.id, p_case_id: c.id, p_data: data, p_until: until ?? null });
    if (error) return friendlyError(error);
    await refreshAdmin();
    return null;
  }
  await repo.save(c);
  await savePreNeed({ ...p, caseId: c.id, activatedAt: new Date().toISOString(), activatedBy: byName });
  adminLog('Kích hoạt hồ sơ chuẩn bị', p.subject.name || p.id, `bởi ${byName}`);
  return null;
}

export const myPreNeeds = (list: PreNeed[], uid: string) =>
  list.filter(p => p.ownerId === uid || p.shares.some(x => x.userId === uid));

export function markRead() {
  const at = new Date().toISOString();
  try { localStorage.setItem(READ_KEY, at); } catch { /* bỏ qua */ }
  mut(d => { d.readUntil = at; });
}

/** Chỉ bản chạy thử: xóa toàn bộ dữ liệu trên máy */
export function resetAllLocalData() {
  localStorage.removeItem(KEY);
  state = initial();
  subs.forEach(f => f());
}

/* ---------- Đề xuất nhà cung cấp từ các gia đình (danh bạ tự lớn lên) ---------- */
export async function loadVendorCandidates(): Promise<VendorCandidate[]> {
  let rows: SharedFamilyVendor[];
  if (REMOTE) {
    const { data, error } = await sb!.rpc('admin_shared_family_vendors');
    if (error) throw new Error(friendlyError(error));
    rows = (data as (Omit<SharedFamilyVendor, 'cats'> & { cats: VendorCat[] })[]).map(r => ({ ...r, incidents: Number(r.incidents) }));
  } else {
    rows = sharedFamilyVendors(await repo.listAll());
  }
  return vendorCandidates(rows, state.directory, state.settings.dismissedCandidates ?? []);
}

/** Admin xem rồi bỏ qua một đề xuất (không hiện lại) */
export async function dismissCandidate(phone: string, name: string): Promise<string | null> {
  const s: Settings = { ...state.settings, dismissedCandidates: [...(state.settings.dismissedCandidates ?? []), phone] };
  return saveSettings(s, `Bỏ qua đề xuất nhà cung cấp ${name}`);
}

/* =====================================================================
   Đăng nhập Google · lời mời vào đội · tự đổi số · mật khẩu tạm
   ===================================================================== */
const back = (path: string) => `${window.location.origin}${path}`;

/** Đăng nhập / đăng ký bằng Google (chuyển sang trang Google rồi quay lại) */
export async function signInWithGoogle(next: string): Promise<string | null> {
  if (!REMOTE) return 'Đăng nhập Google chỉ có ở bản thật.';
  const { error } = await sb!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: back(`/dang-nhap?tiep=${encodeURIComponent(next)}`) } });
  return error ? friendlyError(error) : null;
}

/** Liên kết Google vào tài khoản số điện thoại (để quên mật khẩu vẫn vào được) */
export async function linkGoogle(): Promise<string | null> {
  if (!REMOTE) return 'Liên kết Google chỉ có ở bản thật.';
  const { error } = await sb!.auth.linkIdentity({ provider: 'google', options: { redirectTo: back('/tai-khoan?lien-ket=google') } });
  return error ? friendlyError(error) : null;
}

export interface InvitePreview { caseId: string; caseName: string; inviter: string; memberName: string; memberRel: string; access: string; joined: boolean }
export interface PreInvitePreview { preId: string; subject: string; inviter: string; memberName: string; role: string }

export async function invitePreview(token: string): Promise<InvitePreview | null> {
  if (REMOTE) {
    const { data, error } = await sb!.rpc('invite_preview', { p_token: token });
    if (error) throw new Error(friendlyError(error));
    return (data as InvitePreview) ?? null;
  }
  const c = (await repo.listAll()).find(x => x.members.some(m => m.inviteToken === token));
  const m = c?.members.find(x => x.inviteToken === token);
  if (!c || !m) return null;
  const u1 = c.members.find(x => x.id === 'u1');
  return { caseId: c.id, caseName: `${[c.person.title, c.person.name].filter(Boolean).join(' ')}`.trim(), inviter: u1?.name ?? '', memberName: m.name, memberRel: m.rel, access: m.access, joined: false };
}

/** Nhận lời mời: gắn tài khoản đang đăng nhập vào đúng vị trí trong đội; trả mã đám hiếu */
export async function claimInvite(token: string): Promise<{ caseId?: string; error?: string }> {
  const u = currentUser();
  if (!u) return { error: 'Cần đăng nhập.' };
  if (REMOTE) {
    const { data, error } = await sb!.rpc('claim_invite', { p_token: token });
    return error ? { error: friendlyError(error) } : { caseId: data as string };
  }
  const c = (await repo.listAll()).find(x => x.members.some(m => m.inviteToken === token));
  const m = c?.members.find(x => x.inviteToken === token);
  if (!c || !m) return { error: 'Lời mời không còn dùng được.' };
  if (!c.members.some(x => x.userId === u.id)) {
    m.userId = u.id; m.inviteToken = undefined; m.phone ||= u.phone || undefined;
    c.history.push({ at: new Date().toISOString(), text: `${m.name} đã nhận lời mời và tham gia đội (tài khoản ${u.name})` });
    await repo.save(c);
  }
  return { caseId: c.id };
}

export async function preInvitePreview(token: string): Promise<PreInvitePreview | null> {
  if (REMOTE) {
    const { data, error } = await sb!.rpc('pre_invite_preview', { p_token: token });
    if (error) throw new Error(friendlyError(error));
    return (data as PreInvitePreview) ?? null;
  }
  const p = state.preNeeds.find(x => x.shares.some(s => s.inviteToken === token));
  const s = p?.shares.find(x => x.inviteToken === token);
  if (!p || !s) return null;
  return { preId: p.id, subject: p.subject.name, inviter: state.users.find(u => u.id === p.ownerId)?.name ?? '', memberName: s.name, role: s.role };
}

export async function claimPreInvite(token: string): Promise<{ preId?: string; error?: string }> {
  const u = currentUser();
  if (!u) return { error: 'Cần đăng nhập.' };
  if (REMOTE) {
    const { data, error } = await sb!.rpc('claim_pre_invite', { p_token: token });
    if (error) return { error: friendlyError(error) };
    await hydrate(u.id);
    return { preId: data as string };
  }
  const p = state.preNeeds.find(x => x.shares.some(s => s.inviteToken === token));
  if (!p) return { error: 'Lời mời không còn dùng được.' };
  mut(d => { const s = d.preNeeds.find(x => x.id === p.id)!.shares.find(x => x.inviteToken === token)!; s.userId = u.id; s.inviteToken = undefined; });
  return { preId: p.id };
}

/** Tự đổi số điện thoại. Tài khoản đăng nhập bằng số điện thoại cần nhập mật khẩu hiện tại. */
export async function changePhoneSelf(phoneRaw: string, password: string): Promise<string | null> {
  const u = currentUser();
  if (!u) return 'Phiên đăng nhập đã hết.';
  const phone = normalizePhone(phoneRaw);
  if (!phone) return 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 03, 05, 07, 08, 09).';
  if (phone === u.phone) return 'Đây đang là số của anh/chị.';
  if (REMOTE) {
    const a = state.auth;
    if (a?.loginByPhone) {
      const chk = await sb!.auth.signInWithPassword({ email: a.email!, password });
      if (chk.error) return 'Mật khẩu hiện tại chưa đúng.';
      const ch = await sb!.auth.updateUser({ email: phoneEmail(phone) });
      if (ch.error) return /already|registered|exists/i.test(ch.error.message) ? 'Số điện thoại này đã thuộc tài khoản khác.' : friendlyError(ch.error);
    }
    const { error } = await sb!.rpc('set_my_phone', { p_phone: phone });
    if (error) {
      if (a?.loginByPhone) await sb!.auth.updateUser({ email: a.email! });
      return friendlyError(error);
    }
    await hydrate(u.id);
    return null;
  }
  if (state.users.some(x => x.phone === phone && x.id !== u.id)) return 'Số điện thoại này đã thuộc tài khoản khác.';
  if ((await hashPassword(password, u.salt)) !== u.passHash) return 'Mật khẩu hiện tại chưa đúng.';
  mut(d => { d.users.find(y => y.id === u.id)!.phone = phone; log(d, u.name, 'Đổi số điện thoại', `${u.phone} → ${phone}`); });
  return null;
}

/** Hoàn tất hồ sơ sau khi đăng nhập Google lần đầu: họ tên + số điện thoại */
export async function completeProfile(name: string, phoneRaw: string): Promise<string | null> {
  const u = currentUser();
  if (!u) return 'Phiên đăng nhập đã hết.';
  if (!name.trim()) return 'Cần nhập họ tên.';
  const phone = normalizePhone(phoneRaw);
  if (!phone) return 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 03, 05, 07, 08, 09).';
  const e1 = await updateProfile(name);
  if (e1) return e1;
  if (REMOTE) {
    const { error } = await sb!.rpc('set_my_phone', { p_phone: phone });
    if (error) return friendlyError(error);
    await hydrate(u.id);
    return null;
  }
  mut(d => { d.users.find(y => y.id === u.id)!.phone = phone; });
  return null;
}

/** Admin đặt mật khẩu tạm cho người quên mật khẩu (sau khi gọi đúng số của tài khoản để xác nhận) */
export async function adminSetTempPassword(uid: string, password: string): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.rpc('admin_set_temp_password', { p_uid: uid, p_password: password });
    return error ? friendlyError(error) : null;
  }
  const salt = newSalt(), passHash = await hashPassword(password, salt);
  const a = currentUser();
  mut(d => { const x = d.users.find(y => y.id === uid)!; Object.assign(x, { salt, passHash, failed: 0, lockUntil: undefined }); log(d, a?.name ?? 'Admin', 'Đặt mật khẩu tạm (đã gọi xác nhận)', fmt(x)); });
  return null;
}

/* ---------- Admin: yêu cầu xóa đang chờ, dọn tệp của dữ liệu đã xóa ---------- */
export interface PendingDeletion { kind: 'case' | 'user'; id: string; name: string; requested_at: string; delete_at: string }

export async function loadPendingDeletions(): Promise<PendingDeletion[]> {
  if (REMOTE) {
    const { data, error } = await sb!.rpc('admin_pending_deletions');
    if (error) throw new Error(friendlyError(error));
    return data as PendingDeletion[];
  }
  const week = 7 * 86400000;
  const cases = (await repo.listAll()).filter(c => c.deleteRequestedAt)
    .map(c => ({ kind: 'case' as const, id: c.id, name: `${[c.person.title, c.person.name].filter(Boolean).join(' ')}`.trim(), requested_at: c.deleteRequestedAt!, delete_at: new Date(Date.parse(c.deleteRequestedAt!) + week).toISOString() }));
  const users = state.users.filter(u => u.deleteRequestedAt)
    .map(u => ({ kind: 'user' as const, id: u.id, name: `${u.name} · ${u.phone}`, requested_at: u.deleteRequestedAt!, delete_at: new Date(Date.parse(u.deleteRequestedAt!) + week).toISOString() }));
  return [...cases, ...users].sort((a, b) => a.delete_at.localeCompare(b.delete_at));
}

/** Đếm / dọn tệp còn sót của đám hiếu, hồ sơ đã xóa (máy chủ chỉ cho Admin thấy tệp mồ côi) */
export async function orphanFiles(): Promise<{ bucket: 'case-files' | 'pre-files'; path: string }[]> {
  if (!REMOTE) return [];
  const { data, error } = await sb!.rpc('admin_orphan_files');
  if (error) throw new Error(friendlyError(error));
  return data as { bucket: 'case-files' | 'pre-files'; path: string }[];
}

export async function cleanupOrphanFiles(): Promise<{ removed: number; error?: string }> {
  const list = await orphanFiles();
  let removed = 0;
  for (const bucket of ['case-files', 'pre-files'] as const) {
    const paths = list.filter(x => x.bucket === bucket).map(x => x.path);
    if (!paths.length) continue;
    const { data, error } = await sb!.storage.from(bucket).remove(paths);
    if (error) return { removed, error: friendlyError(error) };
    removed += data?.length ?? 0;
  }
  if (removed) adminLog('Dọn tệp của dữ liệu đã xóa', `${removed} tệp`);
  return { removed };
}
