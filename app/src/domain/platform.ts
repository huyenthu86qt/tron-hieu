// Nền vận hành: tài khoản, gói & giá, đơn hàng, khớp giao dịch SePay, quyền dùng, nhật ký.
// Phase 2 chạy trên máy (giả lập); Phase 3–4 chuyển phần này lên máy chủ — luật khớp giữ nguyên.
import type { CaseAccess, CaseData, OrgModel, OrgType, VendorCat } from './types';
import { lunarAnniversary } from './lunar';
import { parseISODate } from './person';
import { USE_DIRECTORY } from './vendors';

/* ---------- Tài khoản ---------- */
export interface User {
  id: string; name: string; phone: string; passHash: string; salt: string; createdAt: string;
  isAdmin?: boolean; locked?: boolean; failed: number; lockUntil?: string; deleteRequestedAt?: string; supportNote?: string;
  /** Email (tài khoản đăng nhập bằng Google) */
  email?: string;
}

export function normalizePhone(s: string): string | null {
  let d = s.replace(/[\s.\-()]/g, '');
  if (d.startsWith('+84')) d = '0' + d.slice(3);
  else if (d.startsWith('84') && d.length === 11) d = '0' + d.slice(2);
  return /^0[35789]\d{8}$/.test(d) ? d : null;
}
/** Người hỗ trợ khách hàng (Chủ dự án chốt 26/09/2026) */
export const SUPPORT = { name: 'Diệu Tuệ', phone: '0784869988', email: 'huyenthu86.qt@gmail.com' };
export const fmtPhone = (p: string) => p.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');

export const passwordError = (p: string) => (p.length < 8 ? 'Mật khẩu cần tối thiểu 8 ký tự.' : null);

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + ':' + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
export const newSalt = () => Array.from(crypto.getRandomValues(new Uint8Array(12))).map(b => b.toString(16).padStart(2, '0')).join('');

export const MAX_FAILED = 5, LOCK_MIN = 5;

/** Kết quả một lần đăng nhập sai / đúng — khóa tạm sau nhiều lần sai */
export function loginAttempt(u: User, ok: boolean, now = new Date()): { user: User; error: string | null } {
  if (u.locked) return { user: u, error: 'Tài khoản đang bị khóa. Liên hệ hỗ trợ để được mở.' };
  if (u.lockUntil && new Date(u.lockUntil) > now) {
    const m = Math.ceil((new Date(u.lockUntil).getTime() - now.getTime()) / 60000);
    return { user: u, error: `Đăng nhập sai nhiều lần. Thử lại sau ${m} phút hoặc lấy lại mật khẩu.` };
  }
  if (ok) return { user: { ...u, failed: 0, lockUntil: undefined }, error: null };
  const failed = u.failed + 1;
  if (failed >= MAX_FAILED) return { user: { ...u, failed: 0, lockUntil: new Date(now.getTime() + LOCK_MIN * 60000).toISOString() }, error: `Sai mật khẩu ${MAX_FAILED} lần. Tài khoản tạm khóa ${LOCK_MIN} phút.` };
  return { user: { ...u, failed }, error: `Số điện thoại hoặc mật khẩu chưa đúng. Còn ${MAX_FAILED - failed} lần thử.` };
}

/* ---------- OTP (giả lập đến khi có bên gửi OTP ở Phase 3) ---------- */
export interface OtpTicket { phone: string; code: string; purpose: 'register' | 'reset' | 'phone'; expiresAt: string; tries: number; sent: number }
export const OTP_TTL_MIN = 5, OTP_MAX_TRIES = 5, OTP_MAX_SENDS = 3;

export function issueOtp(phone: string, purpose: OtpTicket['purpose'], prev?: OtpTicket | null, now = new Date()): OtpTicket {
  const sent = prev && prev.phone === phone && prev.purpose === purpose ? prev.sent + 1 : 1;
  if (sent > OTP_MAX_SENDS) throw new Error('Đã gửi mã quá nhiều lần. Thử lại sau ít phút.');
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return { phone, code, purpose, expiresAt: new Date(now.getTime() + OTP_TTL_MIN * 60000).toISOString(), tries: 0, sent };
}

export function checkOtp(t: OtpTicket, code: string, now = new Date()): { ok: boolean; ticket: OtpTicket; error?: string } {
  if (new Date(t.expiresAt) < now) return { ok: false, ticket: t, error: 'Mã đã hết hạn. Bấm “Gửi lại mã”.' };
  if (t.tries >= OTP_MAX_TRIES) return { ok: false, ticket: t, error: 'Nhập sai quá nhiều lần. Bấm “Gửi lại mã”.' };
  if (code.trim() !== t.code) return { ok: false, ticket: { ...t, tries: t.tries + 1 }, error: 'Mã chưa đúng.' };
  return { ok: true, ticket: t };
}

/* ---------- Gói & giá, đơn hàng ---------- */
export type ProductId = 'full' | 'pre';
export interface Product { id: ProductId; name: string; desc: string; price: number; duration: string; active: boolean; updatedAt: string }

/** Giá thử nghiệm (U1 chưa chốt) — Admin sửa ở Gói & giá trước khi mở bán */
export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'full', name: 'Mở đầy đủ đám hiếu', desc: 'Nhà cung cấp, Tài chính, Khách viếng & cáo phó, Hậu tang & mốc tưởng niệm cho một đám hiếu', price: 499000, duration: 'Đến hết giỗ đầu', active: true, updatedAt: '' },
  { id: 'pre', name: 'Chuẩn bị trước', desc: 'Lưu giấy tờ, chia sẻ có kiểm soát, kích hoạt thành đám hiếu (đám hiếu được mở đầy đủ, không thu lần hai)', price: 199000, duration: 'Đến khi kích hoạt', active: true, updatedAt: '' },
];

export type OrderStatus = 'pending' | 'paid' | 'expired' | 'failed' | 'refunded';
export interface Order {
  id: string; code: string; userId: string; product: ProductId; productName: string; target: { kind: 'case' | 'pre'; id: string; name: string };
  amount: number; status: OrderStatus; createdAt: string; expiresAt: string; paidAt?: string; txId?: string; returnTo?: string; note?: string;
}
export const ORDER_TTL_H = 24;
export const ORDER_STATUS_LABEL: Record<OrderStatus, [string, string]> = {
  pending: ['wait', 'Chờ thanh toán'], paid: ['done', 'Đã thanh toán'], expired: ['skip', 'Hết hạn'], failed: ['issue', 'Lỗi'], refunded: ['skip', 'Đã hoàn tiền'],
};

export function orderCode(existing: Set<string>): string {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    const c = 'DH' + Array.from({ length: 6 }, () => A[Math.floor(Math.random() * A.length)]).join('');
    if (!existing.has(c)) return c;
  }
}

export function createOrder(p: Product, userId: string, target: Order['target'], existing: Set<string>, returnTo?: string, now = new Date()): Order {
  if (!p.active) throw new Error('Gói này đang tạm ngừng bán.');
  if (!(p.price > 0)) throw new Error('Gói chưa có giá. Admin cần nhập giá trước khi bán.');
  const code = orderCode(existing);
  return {
    id: code, code, userId, product: p.id, productName: p.name, target, amount: p.price, status: 'pending',
    createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + ORDER_TTL_H * 3600000).toISOString(), returnTo,
  };
}

export const isExpired = (o: Order, now = new Date()) => o.status === 'pending' && new Date(o.expiresAt) < now;

/* ---------- Giao dịch SePay & khớp đơn ---------- */
export interface BankTx {
  id: string; providerTxId: string; amount: number; content: string; account: string; at: string;
  status: 'matched' | 'unmatched' | 'refunded' | 'ignored'; orderId?: string; reason?: string;
}
export interface ReceiveAccount { bank: string; number: string; holder: string; active: boolean }

export interface MatchResult { tx: BankTx; order?: Order; duplicate: boolean }

/**
 * Xử lý một giao dịch báo về:
 * - trùng mã giao dịch nhà cung cấp → bỏ qua (idempotency, không mở quyền hai lần)
 * - sai tài khoản nhận / tài khoản đang tắt → bỏ qua
 * - có mã đơn + đúng số tiền + đơn đang chờ và còn hạn → khớp, đơn đã thanh toán
 * - còn lại → Giao dịch chưa khớp, chờ Admin
 */
export function matchTransaction(
  input: { providerTxId: string; amount: number; content: string; account: string; at?: string },
  orders: Order[], seen: BankTx[], acct: ReceiveAccount | null, now = new Date(),
): MatchResult {
  const dup = seen.find(t => t.providerTxId === input.providerTxId);
  if (dup) return { tx: dup, duplicate: true };
  const base: BankTx = { id: 'tx' + Math.random().toString(36).slice(2, 9), providerTxId: input.providerTxId, amount: input.amount, content: input.content, account: input.account, at: input.at ?? now.toISOString(), status: 'unmatched' };
  if (!acct || !acct.active || acct.number.replace(/\D/g, '') !== input.account.replace(/\D/g, '')) return { tx: { ...base, status: 'ignored', reason: 'Không phải tài khoản nhận đang bật' }, duplicate: false };
  const code = input.content.toUpperCase().match(/DH[A-Z0-9]{6}/)?.[0];
  const o = code ? orders.find(x => x.code === code) : undefined;
  if (!o) return { tx: { ...base, reason: 'Không tìm thấy mã đơn trong nội dung' }, duplicate: false };
  if (o.status !== 'pending') return { tx: { ...base, orderId: o.id, reason: `Đơn đang ở trạng thái “${ORDER_STATUS_LABEL[o.status][1]}”` }, duplicate: false };
  if (isExpired(o, now)) return { tx: { ...base, orderId: o.id, reason: 'Đơn đã hết hạn' }, duplicate: false };
  if (input.amount !== o.amount) return { tx: { ...base, orderId: o.id, reason: input.amount < o.amount ? 'Thiếu tiền' : 'Thừa tiền' }, duplicate: false };
  return { tx: { ...base, status: 'matched', orderId: o.id }, order: { ...o, status: 'paid', paidAt: base.at, txId: base.id }, duplicate: false };
}

/* ---------- Quyền dùng đám hiếu ---------- */
export const FREE_ACCESS: CaseAccess = { plan: 'free' };

/** Gói Mở đầy đủ dùng đến hết giỗ đầu (âm lịch) của đám hiếu đó */
export function fullUntil(c: CaseData): string | undefined {
  const d = parseISODate(c.person.death);
  const g = d ? lunarAnniversary(d) : null;
  if (!g) return undefined;
  g.setHours(23, 59, 59, 0);
  return g.toISOString();
}

export function isFull(c: CaseData, now = new Date()) {
  const a = c.access;
  if (!a || a.plan !== 'full') return false;
  return !a.activeUntil || new Date(a.activeUntil) >= now;
}

export function grantFull(c: CaseData, source: CaseAccess['source'], orderId?: string) {
  c.access = { plan: 'full', source, orderId, activeUntil: fullUntil(c) };
}
export function revokeAccess(c: CaseData, reason: string) {
  c.access = { plan: 'free', revokedReason: reason };
}

/* ---------- Nhật ký (chỉ ghi thêm) ---------- */
export interface AuditEntry { id: string; at: string; actor: string; action: string; target: string; detail?: string }
export const auditEntry = (actor: string, action: string, target: string, detail?: string, now = new Date()): AuditEntry =>
  ({ id: 'a' + Math.random().toString(36).slice(2, 10), at: now.toISOString(), actor, action, target, detail });

/* ---------- Cài đặt vận hành ---------- */
export interface Settings {
  sepay: { env: 'test' | 'live'; account: ReceiveAccount; matchRule: string; lastCheck?: { at: string; ok: boolean; note: string } };
  support: { phone: string; zalo: string };
  /** Số điện thoại các đề xuất nhà cung cấp Admin đã xem và bỏ qua */
  dismissedCandidates?: string[];
}
export const DEFAULT_SETTINGS: Settings = {
  sepay: { env: 'test', account: { bank: '', number: '', holder: '', active: false }, matchRule: 'Mã đơn trong nội dung + đúng số tiền + đúng tài khoản nhận' },
  support: { phone: SUPPORT.phone, zalo: SUPPORT.phone },
};

/* ---------- Hồ sơ chuẩn bị trước ---------- */
export interface PreNeed {
  id: string; ownerId: string; createdAt: string; forSelf: boolean;
  subject: { title: string; name: string; birthYear: string; hometown: string; idNote: string };
  rep: { name: string; phone: string; rel: string };
  contacts: { name: string; phone: string; rel: string }[];
  docs: { id: string; name: string; at: string; path?: string }[];
  /** org/orgType: hình thức tổ chức lễ tang ('' = để gia đình quyết); rite: 'traditional' | 'catholic' | 'other' | '' (hồ sơ cũ có thể là chữ, xem RITE_OF) */
  wish: { form: 'cremation' | 'burial' | 'family'; venue: 'home' | 'hall' | 'family'; org?: OrgModel | ''; orgType?: OrgType; rite: string; items: string; scale: 'small' | 'medium' | 'large'; msg: string; milestones: string[] };
  budget: { amount: number; vendors: Partial<Record<VendorCat, string>> };
  special: string;
  shares: { id: string; name: string; phone: string; role: 'view' | 'edit' | 'activate'; inviteToken?: string; userId?: string }[];
  paid: boolean; orderId?: string;
  activatedAt?: string; activatedBy?: string; caseId?: string;
}

export function preGroups(p: PreNeed) {
  const st = (done: boolean, partial: boolean) => (done ? 'done' : partial ? 'partial' : 'todo') as 'done' | 'partial' | 'todo';
  const s = p.subject, w = p.wish;
  return [
    { k: 'info', n: 'Thông tin cá nhân', path: 'thong-tin', st: st(!!(s.name && s.birthYear), !!s.name), note: s.name ? `${[s.title, s.name].filter(Boolean).join(' ')}${s.birthYear ? ' · ' + s.birthYear : ''}` : '' },
    { k: 'rep', n: 'Người đại diện và người liên hệ', path: 'lien-he', st: st(!!p.rep.name && p.contacts.length > 0, !!p.rep.name || p.contacts.length > 0), note: p.rep.name ? `${p.rep.name} · ${p.contacts.length} người liên hệ` : '' },
    { k: 'docs', n: 'Giấy tờ', path: 'giay-to', st: st(p.docs.length >= 2, p.docs.length > 0), note: p.docs.length ? `${p.docs.length} tệp đã ghi` : '', paid: true },
    { k: 'wish', n: 'Nguyện vọng hậu sự', path: 'nguyen-vong', st: st((!!w.rite || w.org === 'official') && !!w.msg.trim(), !!w.rite || !!w.org || w.form !== 'family'), note: (w.rite || w.org) && !w.msg.trim() ? 'Còn thiếu: lời nhắn cho con cháu' : '' },
    { k: 'budget', n: USE_DIRECTORY ? 'Ngân sách và nhà cung cấp mong muốn' : 'Ngân sách dự kiến', path: 'ngan-sach', st: st(p.budget.amount > 0, Object.keys(p.budget.vendors).length > 0), note: p.budget.amount ? p.budget.amount.toLocaleString('vi-VN') + ' đ' : '' },
    { k: 'special', n: 'Mong muốn đặc biệt', path: 'nguyen-vong', st: st(!!p.special.trim(), false), note: '' },
  ];
}
export function readiness(p: PreNeed) {
  const g = preGroups(p), sc = { done: 1, partial: 0.5, todo: 0 };
  return Math.round(g.reduce((s, x) => s + sc[x.st], 0) / g.length * 100);
}

export function newPreNeed(ownerId: string, forSelf: boolean, now = new Date()): PreNeed {
  return {
    id: 'cb' + Math.random().toString(36).slice(2, 9), ownerId, createdAt: now.toISOString(), forSelf,
    subject: { title: '', name: '', birthYear: '', hometown: '', idNote: '' },
    rep: { name: '', phone: '', rel: '' }, contacts: [], docs: [],
    wish: { form: 'family', venue: 'family', org: '', rite: '', items: '', scale: 'medium', msg: '', milestones: [] },
    budget: { amount: 0, vendors: {} }, special: '', shares: [], paid: false,
  };
}
