// Tài chính: mọi người nhìn cùng một con số. App chỉ ghi nhận — không nhận, không chuyển tiền.
import type { CaseData, Condolence, Expense, ExpenseStatus, Finance, Fund, Member, Method, Payee, VendorCat } from './types';
import { U1_ID } from './model';

export const emptyFinance = (): Finance => ({
  budget: 0, funds: [{ id: 'cash-1', name: 'Quỹ tiền mặt gia đình', type: 'cash' }], expenses: [], orgExpenses: [],
  locked: false, debtMoved: false, counted: '', bankOk: false,
});

export const money = (n: number) => n.toLocaleString('vi-VN') + ' đ';
export const parseMoney = (s: string | number) => Number(String(s).replace(/[^\d]/g, '')) || 0;
export const fmtMoneyInput = (s: string) => { const n = parseMoney(s); return n ? n.toLocaleString('vi-VN') : ''; };
const sum = <T,>(a: T[], f: (x: T) => number) => a.reduce((s, x) => s + f(x), 0);

export const EXP_STATUS: Record<ExpenseStatus, [string, string]> = {
  estimate: ['skip', 'Dự toán'], request: ['wait', 'Chờ duyệt'], approved: ['doing', 'Đã duyệt'], paid: ['done', 'Đã chi'], rejected: ['issue', 'Không duyệt'],
};
export const METHOD_LABEL: Record<Method, string> = { cash: 'Tiền mặt', bank: 'Chuyển khoản' };
export const BANKS = ['Agribank', 'BIDV', 'Vietcombank', 'VietinBank', 'Techcombank', 'MB Bank', 'ACB', 'VPBank', 'Sacombank', 'TPBank', 'HDBank', 'VIB', 'Khác'];

const fin = (c: CaseData) => (c.finance ??= emptyFinance());
const assertOpen = (c: CaseData) => { if (fin(c).locked) throw new Error('Tài chính đã khóa — không thêm, sửa khoản chi được nữa.'); };

export function totals(f: Finance) {
  const ex = f.expenses.filter(e => e.status !== 'rejected');
  return {
    plan: sum(ex, e => e.amount),
    paid: sum(ex, e => e.paid),
    owe: f.debtMoved ? 0 : sum(ex.filter(e => e.status === 'approved' || e.status === 'paid'), e => e.amount - e.paid),
    extra: sum(ex.filter(e => e.extra), e => e.amount),
  };
}

export const byFund = (f: Finance) => f.funds.map(fd => {
  const ex = f.expenses.filter(e => e.fund === fd.id && e.status !== 'rejected');
  return { f: fd, paid: sum(ex, e => e.paid), plan: sum(ex, e => e.amount - e.paid) };
});

export const debts = (f: Finance) => f.expenses.filter(e => (e.status === 'approved' || e.status === 'paid') && e.amount > e.paid);

/** Người xem được sổ phúng viếng và tài khoản bên nhận: người đại diện, người giữ vùng Tài chính */
export const canFinance = (m: Member | null | undefined) => !!m && (m.id === U1_ID || m.areas.includes('Toàn bộ') || m.areas.includes('Tài chính'));

export interface ExpenseForm {
  name: string; amount: string; cat: VendorCat | 'khac'; vendorId?: string; payer: string; method: Method; fund: string;
  holder: string; bank: string; acct: string; reason: string; evidence: string; evidencePath?: string; extra: boolean;
}

export function validateExpense(f: ExpenseForm): string | null {
  if (!f.name.trim() || !parseMoney(f.amount)) return 'Cần ghi tên khoản chi và số tiền.';
  if (f.method === 'bank' && (!f.holder.trim() || !f.bank || !f.acct.replace(/\D/g, ''))) return 'Chi chuyển khoản cần đủ chủ tài khoản, ngân hàng và số tài khoản bên nhận.';
  return null;
}

/** Người đại diện ghi thì khoản chi được duyệt ngay; người khác gửi đề nghị vào mục Cần duyệt */
export function requestExpense(c: CaseData, f: ExpenseForm, by: string, now = new Date()): Expense {
  assertOpen(c);
  const err = validateExpense(f);
  if (err) throw new Error(err);
  const payee: Payee | undefined = f.method === 'bank' ? { holder: f.holder.trim().toUpperCase(), bank: f.bank, acct: f.acct.trim() } : undefined;
  const e: Expense = {
    id: 'e' + Math.random().toString(36).slice(2, 9), name: f.name.trim(), cat: f.cat, vendorId: f.vendorId, amount: parseMoney(f.amount), paid: 0,
    status: by === U1_ID ? 'approved' : 'request', evidence: f.evidence || undefined, evidencePath: f.evidence ? f.evidencePath : undefined, payer: f.payer || null, method: f.method, fund: f.fund || null,
    payee, extra: f.extra, reason: f.reason.trim() || undefined, requestedBy: by, createdAt: now.toISOString(),
    decidedAt: by === U1_ID ? now.toISOString() : undefined,
  };
  fin(c).expenses.push(e);
  c.history.push({ at: now.toISOString(), text: `${by === U1_ID ? 'Ghi khoản chi' : 'Đề nghị chi'} ${money(e.amount)} — ${e.name}` });
  return e;
}

export function decideExpense(c: CaseData, id: string, approve: boolean, reason = '', now = new Date()) {
  assertOpen(c);
  const e = fin(c).expenses.find(x => x.id === id);
  if (!e || e.status !== 'request') return;
  e.status = approve ? 'approved' : 'rejected';
  e.decidedAt = now.toISOString();
  if (!approve) e.rejectReason = reason.trim() || undefined;
  c.history.push({ at: now.toISOString(), text: `${approve ? 'Duyệt' : 'Không duyệt'} đề nghị chi ${money(e.amount)} — ${e.name}${reason.trim() ? ' · ' + reason.trim() : ''}` });
}

export function recordPayment(c: CaseData, id: string, amount: number, now = new Date()) {
  assertOpen(c);
  const e = fin(c).expenses.find(x => x.id === id);
  if (!e || (e.status !== 'approved' && e.status !== 'paid')) throw new Error('Chỉ ghi thanh toán cho khoản đã duyệt.');
  if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0.');
  e.paid = Math.min(e.amount, e.paid + amount);
  if (e.paid >= e.amount) e.status = 'paid';
  c.history.push({ at: now.toISOString(), text: `Ghi đã trả ${money(amount)} — ${e.name}` });
}

export function attachExpenseEvidence(c: CaseData, id: string, name: string, path?: string) {
  const e = fin(c).expenses.find(x => x.id === id);
  if (e) { e.evidence = name; e.evidencePath = path; }
}

export function addFund(c: CaseData, name: string, type: Method, last4: string): Fund {
  if (!name.trim()) throw new Error('Cần tên gợi nhớ cho nguồn tiền.');
  const l4 = last4.replace(/\D/g, '');
  if (type === 'bank' && l4.length !== 4) throw new Error('Nhập đúng 4 số cuối tài khoản — app không lưu số tài khoản đầy đủ của gia đình.');
  const f: Fund = { id: 'fd' + Math.random().toString(36).slice(2, 8), name: name.trim(), type, last4: type === 'bank' ? l4 : undefined };
  fin(c).funds.push(f);
  return f;
}
export const fundLabel = (f: Fund) => f.type === 'bank' && f.last4 ? `${f.name} ···${f.last4}` : f.name;

export function setBudget(c: CaseData, amount: number) {
  assertOpen(c);
  fin(c).budget = Math.max(0, amount);
}

export function addOrgExpense(c: CaseData, name: string, amount: number | null, note: string) {
  if (!name.trim()) throw new Error('Cần tên khoản.');
  fin(c).orgExpenses.push({ id: 'o' + Math.random().toString(36).slice(2, 8), name: name.trim(), amount, note: note.trim() });
}

/* ---------- Sổ phúng viếng ---------- */
const ledgerCash = (L: Condolence[]) => sum(L.filter(x => x.method === 'cash'), x => x.amount);
const ledgerBank = (L: Condolence[]) => sum(L.filter(x => x.method === 'bank'), x => x.amount);
export const ledgerTotals = (L: Condolence[]) => ({ total: sum(L, x => x.amount), cash: ledgerCash(L), bank: ledgerBank(L) });

/** Các con (để chia khách “bạn của ai”) — lấy từ thành viên có quan hệ bắt đầu bằng “Con” */
export function children(members: Member[]) {
  return members.filter(m => /^Con /i.test(m.rel)).map(m => {
    const last = m.name.trim().split(/\s+/).pop() ?? m.name;
    const male = /trai|rể/i.test(m.rel);
    return { id: m.id, short: (male ? 'anh ' : 'chị ') + last, rel: m.rel.toLowerCase().replace(/ trưởng| út| cả/g, '') };
  });
}

/* ---------- Đối soát & khóa ---------- */
export function reconcile(c: CaseData) {
  const f = fin(c), L = c.ledger ?? [], T = totals(f);
  const missing = f.expenses.filter(e => e.paid > 0 && !e.evidence);
  const pending = f.expenses.filter(e => e.status === 'request');
  const cash = ledgerCash(L), bank = ledgerBank(L), counted = parseMoney(f.counted);
  return {
    missing, pending, cash, bank, counted, owe: T.owe,
    conds: [
      { key: 'evidence', ok: !missing.length, label: 'Mọi khoản đã chi có chứng từ' },
      { key: 'pending', ok: !pending.length, label: 'Không còn đề nghị chi chờ duyệt' },
      { key: 'cash', ok: (cash === 0 && f.counted === '') || (f.counted !== '' && counted === cash), label: 'Tiền mặt phúng viếng khớp với tiền đã kiểm đếm' },
      { key: 'bank', ok: !bank || f.bankOk, label: 'Phúng viếng chuyển khoản đã đối chiếu với sao kê' },
      { key: 'owe', ok: T.owe === 0, label: 'Không còn khoản phải trả, hoặc đã chuyển sang công nợ hậu tang' },
    ],
  };
}

export function lockFinance(c: CaseData, by: string, now = new Date()) {
  const r = reconcile(c);
  if (!r.conds.every(x => x.ok)) throw new Error('Còn điều kiện đối soát chưa đạt.');
  const f = fin(c);
  f.locked = true; f.lockedAt = now.toISOString(); f.lockedBy = by;
  c.history.push({ at: now.toISOString(), text: 'Khóa tài chính sau đối soát' });
}

export function moveDebt(c: CaseData, now = new Date()) {
  const f = fin(c), owe = totals(f).owe;
  f.debtMoved = true;
  c.history.push({ at: now.toISOString(), text: `Chuyển ${money(owe)} còn phải trả sang theo dõi ở Hậu tang` });
}

export const expenseMember = (members: Member[], id: string | null) => (id ? members.find(m => m.id === id)?.name ?? '—' : '—');
