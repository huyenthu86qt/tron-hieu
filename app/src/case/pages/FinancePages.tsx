// S-FIN-01 Tổng quan · S-FIN-02 Ngân sách · S-FIN-03 Đề nghị chi · S-FIN-04 Khoản chi · S-FIN-05 Công nợ · S-FIN-06 Sổ phúng viếng · S-FIN-07 Đối soát & khóa
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Expense, ExpenseStatus, Method, VendorCat } from '../../domain/types';
import {
  addFund, addOrgExpense, attachExpenseEvidence, BANKS, byFund, children, debts, EXP_STATUS, expenseMember, fmtMoneyInput, fundLabel,
  ledgerTotals, lockFinance, METHOD_LABEL, money, moveDebt, parseMoney, reconcile, recordPayment, requestExpense, setBudget, totals,
  type ExpenseForm,
} from '../../domain/finance';
import { catName, catsVisible, findVendor } from '../../domain/vendors';
import { Icon } from '../../ui/Icon';
import { Banner, ErrorBanner, Sheet, useApp } from '../../ui/common';
import { useCase } from '../CaseContext';
import { PaidGate } from '../Paywall';
import { ApprovalSheet } from './DecisionPages';
import { FileName, useUploader } from '../../ui/files';
import { uploadCaseFile } from '../../repo/files';

const fmtAt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '');
const ExpPill = ({ e }: { e: Expense }) => <span className={'pill ' + EXP_STATUS[e.status][0]}>{e.status === 'approved' && e.paid ? 'Đã duyệt · đã trả một phần' : EXP_STATUS[e.status][1]}</span>;

/* ---------- S-FIN-03 ---------- */
export function ExpenseSheet({ onClose, preset }: { onClose: () => void; preset?: Partial<ExpenseForm> }) {
  const { c, update, me, isU1, dir } = useCase();
  const { toast } = useApp();
  const up = useUploader();
  const funds = c.finance!.funds;
  const [f, setF] = useState<ExpenseForm>({ name: '', amount: '', cat: 'khac', payer: me.id, method: 'cash', fund: funds.find(x => x.type === 'cash')?.id ?? '', holder: '', bank: '', acct: '', reason: '', evidence: '', extra: false, ...preset });
  const [err, setErr] = useState<string | null>(null);
  const [fundOpen, setFundOpen] = useState(false);
  const set = <K extends keyof ExpenseForm>(k: K, v: ExpenseForm[K]) => setF(x => ({ ...x, [k]: v }));
  const vis = catsVisible(c.situation);
  const chosen = (k: VendorCat | 'khac') => (k === 'khac' ? undefined : c.vendors?.[k]?.vendorId ?? undefined);
  const send = () => {
    const e = update(d => { requestExpense(d, { ...f, vendorId: chosen(f.cat) }, me.id); });
    if (e) { setErr(e); return; }
    onClose(); toast(isU1 ? 'Đã ghi khoản chi.' : 'Đã gửi đề nghị. Người đại diện nhận ở mục Cần duyệt.');
  };
  const people = c.members.filter(m => m.access !== 'link');
  return (
    <Sheet title={isU1 ? 'Ghi khoản chi' : 'Đề nghị chi'} onClose={onClose} foot={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn primary" onClick={send}>{isU1 ? 'Ghi khoản chi' : 'Gửi đề nghị'}</button></>}>
      <div className="field"><label htmlFor="frName">Khoản chi</label><input className="input" id="frName" value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ví dụ: Thuê loa đài cho lễ viếng" /></div>
      <div className="field"><label htmlFor="frAmt">Số tiền (đồng)</label><input className="input num" id="frAmt" inputMode="numeric" value={f.amount} onChange={e => set('amount', fmtMoneyInput(e.target.value))} placeholder="0" style={{ fontSize: 20, fontWeight: 600 }} /></div>
      <div className="field"><label htmlFor="frCat">Thuộc hạng mục</label><select className="input" id="frCat" value={f.cat} onChange={e => set('cat', e.target.value as VendorCat | 'khac')}>
        {vis.map(k => <option key={k.k} value={k.k}>{k.name}{chosen(k.k) ? ' · ' + (findVendor(c, dir, chosen(k.k))?.name ?? '') : ''}</option>)}<option value="khac">Khác</option></select></div>
      <div className="field"><label htmlFor="frPayer">Người chi</label><select className="input" id="frPayer" value={f.payer} onChange={e => set('payer', e.target.value)}>
        {people.map(m => <option key={m.id} value={m.id}>{m.name} · {m.rel}</option>)}</select></div>
      <div className="field"><label>Hình thức</label><div className="segin">{(['cash', 'bank'] as Method[]).map(k =>
        <button key={k} aria-pressed={f.method === k} onClick={() => setF(x => ({ ...x, method: k, fund: funds.find(y => y.type === k)?.id ?? '' }))}>{METHOD_LABEL[k]}</button>)}</div></div>
      <div className="field"><label htmlFor="frFund">{f.method === 'bank' ? 'Từ tài khoản' : 'Từ quỹ tiền mặt'}</label>
        <select className="input" id="frFund" value={f.fund} onChange={e => set('fund', e.target.value)}><option value="">— Chưa chọn —</option>{funds.filter(x => x.type === f.method).map(x => <option key={x.id} value={x.id}>{fundLabel(x)}</option>)}</select>
        <button className="btn sm ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setFundOpen(true)}><Icon n="plus" c="sm" />Thêm nguồn tiền</button></div>
      {f.method === 'bank' && <div className="card card-pad stack" style={{ gap: 10, background: 'var(--surface-2)' }}><div className="eyebrow">Tài khoản bên nhận</div>
        <div className="field"><label htmlFor="frHolder">Chủ tài khoản</label><input className="input" id="frHolder" value={f.holder} onChange={e => set('holder', e.target.value)} placeholder="Viết như trên tài khoản, ví dụ NGUYEN VAN LOC" style={{ textTransform: 'uppercase' }} /></div>
        <div className="field"><label htmlFor="frBank">Ngân hàng</label><select className="input" id="frBank" value={f.bank} onChange={e => set('bank', e.target.value)}><option value="">Chọn ngân hàng</option>{BANKS.map(b => <option key={b}>{b}</option>)}</select></div>
        <div className="field"><label htmlFor="frAcct">Số tài khoản</label><input className="input num" id="frAcct" inputMode="numeric" value={f.acct} onChange={e => set('acct', e.target.value)} placeholder="Nhập đúng số tài khoản bên nhận" /></div>
        <p className="muted">Người chi kiểm tra lại tên chủ tài khoản hiện trên app ngân hàng trước khi chuyển.</p></div>}
      <div className="field"><label htmlFor="frReason">Lý do</label><textarea className="input" id="frReason" value={f.reason} onChange={e => set('reason', e.target.value)} placeholder="Vì sao cần chi, đã hỏi giá mấy nơi…" /></div>
      <label className="check"><input type="checkbox" checked={f.extra} onChange={e => set('extra', e.target.checked)} /><span>Khoản phát sinh ngoài dự toán</span></label>
      <div className="field"><label>Chứng từ, báo giá (ảnh hoặc tệp)</label><label className="btn file-btn" style={{ justifyContent: 'flex-start' }}><Icon n="doc" c="sm" />{up.busy ? 'Đang tải lên…' : f.evidence || 'Chọn tệp'}<input type="file" disabled={up.busy} onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; const s = await up.run(() => uploadCaseFile(c.id, 'fin', file)); if (s) setF(x => ({ ...x, evidence: s.name, evidencePath: s.path })); }} /></label></div>
      <ErrorBanner err={err} />
      {!isU1 && <p className="muted">Đề nghị sẽ vào mục <b>Cần duyệt</b> của người đại diện gia đình.</p>}
      {fundOpen && <FundSheet onClose={() => setFundOpen(false)} onAdded={(id, type) => setF(x => ({ ...x, method: type, fund: id }))} />}
    </Sheet>
  );
}

function FundSheet({ onClose, onAdded }: { onClose: () => void; onAdded?: (id: string, type: Method) => void }) {
  const { update } = useCase();
  const [f, setF] = useState({ name: '', type: 'bank' as Method, last4: '' });
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    let id = '';
    const e = update(d => { id = addFund(d, f.name, f.type, f.last4).id; });
    if (e) { setErr(e); return; }
    onAdded?.(id, f.type); onClose();
  };
  return (
    <Sheet title="Thêm nguồn tiền" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn primary" onClick={save}>Thêm</button></>}>
      <div className="field"><label>Loại</label><div className="segin">{(['cash', 'bank'] as Method[]).map(k => <button key={k} aria-pressed={f.type === k} onClick={() => setF({ ...f, type: k })}>{k === 'cash' ? 'Quỹ tiền mặt' : 'Tài khoản ngân hàng'}</button>)}</div></div>
      <div className="field"><label htmlFor="fdName">Tên gợi nhớ</label><input className="input" id="fdName" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder={f.type === 'cash' ? 'Ví dụ: Quỹ tiền mặt — chị Hà giữ' : 'Ví dụ: TK chung gia đình'} /></div>
      {f.type === 'bank' && <div className="field"><label htmlFor="fdL4">4 số cuối tài khoản</label><input className="input num" id="fdL4" inputMode="numeric" maxLength={4} value={f.last4} onChange={e => setF({ ...f, last4: e.target.value.replace(/\D/g, '') })} /></div>}
      <ErrorBanner err={err} />
      <p className="note">App chỉ lưu tên gợi nhớ và 4 số cuối tài khoản của gia đình — không lưu số đầy đủ.</p>
    </Sheet>
  );
}

/* ---------- Chi tiết một khoản (S-FIN-04 dòng) ---------- */
function ExpenseDetailSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { c, update, isU1, canFin, dir } = useCase();
  const { toast } = useApp();
  const up = useUploader();
  const e = c.finance!.expenses.find(x => x.id === id);
  const [pay, setPay] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [ap, setAp] = useState(false);
  if (!e) return null;
  const L = c.finance!.locked;
  const fund = c.finance!.funds.find(f => f.id === e.fund);
  return (
    <Sheet title={e.name} onClose={onClose}>
      <section className="card card-pad"><dl className="kv">
        <dt>Trạng thái</dt><dd><ExpPill e={e} />{e.extra && <> <span className="pill issue">Phát sinh</span></>}</dd>
        <dt>Số tiền</dt><dd className="num" style={{ fontWeight: 600 }}>{money(e.amount)}</dd><dt>Đã trả</dt><dd className="num">{money(e.paid)}</dd>
        <dt>Hạng mục</dt><dd>{e.cat === 'khac' ? 'Khác' : catName(e.cat)}{e.vendorId ? ' · ' + (findVendor(c, dir, e.vendorId)?.name ?? '') : ''}</dd>
        <dt>Người chi</dt><dd>{expenseMember(c.members, e.payer)} · {e.method ? METHOD_LABEL[e.method] : '—'}{fund ? ' · ' + fundLabel(fund) : ''}</dd>
        {e.method === 'bank' && <><dt>Bên nhận</dt><dd>{canFin ? (e.payee ? <>{e.payee.holder} · {e.payee.bank} · <span className="num">{e.payee.acct}</span></> : <span style={{ color: 'var(--danger)' }}>Thiếu thông tin</span>) : <span className="muted"><Icon n="lock" c="sm" /> Chỉ người giữ Tài chính xem</span>}</dd></>}
        <dt>Đề nghị bởi</dt><dd>{expenseMember(c.members, e.requestedBy)} · {fmtAt(e.createdAt)}</dd>
        {e.reason && <><dt>Lý do</dt><dd>{e.reason}</dd></>}
        {e.rejectReason && <><dt>Không duyệt vì</dt><dd>{e.rejectReason}</dd></>}
      </dl></section>
      {e.status === 'request' && isU1 && <button className="btn primary" onClick={() => setAp(true)}>Xem và duyệt</button>}
      {(e.status === 'approved' || e.status === 'paid') && e.paid < e.amount && !L && canFin && (
        <div className="card card-pad stack" style={{ gap: 8 }}><div className="field"><label htmlFor="payAmt">Ghi đã trả (đồng)</label><input className="input num" id="payAmt" inputMode="numeric" value={pay} onChange={x => setPay(fmtMoneyInput(x.target.value))} placeholder={(e.amount - e.paid).toLocaleString('vi-VN')} /></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn sm" onClick={() => { const x = update(d => recordPayment(d, e.id, parseMoney(pay) || e.amount - e.paid)); if (x) setErr(x); else { setPay(''); toast('Đã ghi thanh toán'); } }}>Ghi đã trả</button>
            <button className="btn sm ghost" onClick={() => { const x = update(d => recordPayment(d, e.id, e.amount - e.paid)); if (x) setErr(x); else toast('Đã ghi thanh toán đủ ' + money(e.amount)); }}>Đã trả đủ</button></div></div>)}
      <div className="field"><label>Chứng từ</label>{e.evidence ? <span className="pill done" style={{ alignSelf: 'flex-start' }}><Icon n="doc" c="sm" /><FileName name={e.evidence} path={canFin ? e.evidencePath : undefined} /></span> : <span className="muted">Chưa có</span>}
        {!L && <label className="btn sm file-btn" style={{ alignSelf: 'flex-start' }}><Icon n="plus" c="sm" />{up.busy ? 'Đang tải lên…' : e.evidence ? 'Đổi tệp' : 'Đính chứng từ'}<input type="file" disabled={up.busy} onChange={async x => { const file = x.target.files?.[0]; x.target.value = ''; if (!file) return; const s = await up.run(() => uploadCaseFile(c.id, 'fin', file)); if (s) { update(d => attachExpenseEvidence(d, e.id, s.name, s.path)); toast('Đã đính chứng từ: ' + s.name); } }} /></label>}</div>
      <ErrorBanner err={err} />
      {L && <Banner kind="info" icon="lock">Tài chính đã khóa — không sửa được nữa.</Banner>}
      {ap && <ApprovalSheet e={e} onClose={() => setAp(false)} />}
    </Sheet>
  );
}

function ExpenseTable({ list, onOpen }: { list: Expense[]; onOpen: (id: string) => void }) {
  const { c, canFin, dir } = useCase();
  const { mobile } = useApp();
  const vname = (e: Expense) => (e.vendorId ? findVendor(c, dir, e.vendorId)?.name ?? '—' : '—');
  const fund = (e: Expense) => { const f = c.finance!.funds.find(x => x.id === e.fund); return f ? fundLabel(f) : '—'; };
  const plan = (e: Expense, s: string) => (!e.paid && s !== '—' ? <span className="muted">Dự kiến: {s}</span> : s);
  if (!list.length) return <div className="empty"><span>Chưa có khoản chi nào.</span></div>;
  if (mobile) return (
    <div className="list">{list.map(e => (
      <button key={e.id} className="row" onClick={() => onOpen(e.id)}><div className="grow"><div className="title">{e.name}</div>
        <div className="meta"><ExpPill e={e} />{e.extra && <span className="pill issue">Phát sinh</span>}<span>{vname(e)}</span>{!e.evidence && e.paid > 0 && <span style={{ color: 'var(--danger)' }}>Thiếu chứng từ</span>}</div>
        <div className="meta"><span>{e.paid ? '' : 'Dự kiến · '}{expenseMember(c.members, e.payer)}</span><span>{e.method ? METHOD_LABEL[e.method] : '—'}</span><span>{fund(e)}</span></div>
        {e.method === 'bank' && canFin && <div className="meta">{e.payee ? <><span>Bên nhận: <b>{e.payee.holder}</b></span><span>{e.payee.bank}</span><span className="num">{e.payee.acct}</span></> : <span style={{ color: 'var(--danger)' }}>Thiếu tài khoản bên nhận</span>}</div>}</div>
        <div className="num" style={{ textAlign: 'right', fontWeight: 600 }}>{money(e.amount)}{e.paid > 0 && e.paid < e.amount && <div className="muted" style={{ fontWeight: 400 }}>đã trả {money(e.paid)}</div>}</div></button>
    ))}</div>
  );
  return (
    <div style={{ overflowX: 'auto' }}><table className="tbl" style={{ minWidth: canFin ? 1480 : 1060 }}><thead>
      <tr><th rowSpan={2}>Khoản</th><th rowSpan={2}>Nhà cung cấp</th><th rowSpan={2} className="num" style={{ textAlign: 'right' }}>Số tiền</th><th rowSpan={2} className="num" style={{ textAlign: 'right' }}>Đã trả</th><th rowSpan={2}>Người chi</th><th rowSpan={2}>Hình thức</th><th rowSpan={2}>Từ nguồn</th>
        {canFin && <th colSpan={3} style={{ textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Tài khoản bên nhận (chuyển khoản)</th>}<th rowSpan={2}>Trạng thái</th><th rowSpan={2}>Chứng từ</th></tr>
      {canFin && <tr><th>Chủ tài khoản</th><th>Ngân hàng</th><th>Số tài khoản</th></tr>}</thead>
      <tbody>{list.map(e => (
        <tr key={e.id} onClick={() => onOpen(e.id)} style={{ cursor: 'pointer' }}>
          <td>{e.name}{e.extra && <> <span className="pill issue">Phát sinh</span></>}</td><td>{vname(e)}</td><td className="num" style={{ textAlign: 'right' }}>{money(e.amount)}</td><td className="num" style={{ textAlign: 'right' }}>{money(e.paid)}</td>
          <td>{plan(e, expenseMember(c.members, e.payer))}</td><td>{plan(e, e.method ? METHOD_LABEL[e.method] : '—')}</td><td>{plan(e, fund(e))}</td>
          {canFin && (e.method === 'bank' ? e.payee ? <><td>{e.payee.holder}</td><td>{e.payee.bank}</td><td className="num" style={{ whiteSpace: 'nowrap' }}>{e.payee.acct}</td></> : <td colSpan={3} style={{ color: 'var(--danger)' }}>Thiếu thông tin</td> : <td colSpan={3} className="muted">{e.method === 'cash' ? 'Trả tiền mặt' : '—'}</td>)}
          <td><ExpPill e={e} /></td><td>{e.evidence ? <span className="pill done">Có</span> : <span className="pill issue">Thiếu</span>}</td>
        </tr>
      ))}</tbody></table></div>
  );
}

/* ---------- S-FIN-01 ---------- */
export function FinancePage() { return <PaidGate module="Tài chính"><Finance /></PaidGate>; }
function Finance() {
  const { c, base, canFin, isU1 } = useCase();
  const nav = useNavigate();
  const [req, setReq] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [ap, setAp] = useState<Expense | null>(null);
  const f = c.finance!, T = totals(f), L = f.locked, bud = f.budget, pct = bud ? Math.round(T.plan / bud * 100) : 0;
  const reqs = f.expenses.filter(e => e.status === 'request');
  const tiles: [string, number, string][] = [['Dự kiến', T.plan, 'Tổng dự toán các khoản'], ['Đã chi', T.paid, 'Đã trả, kể cả tiền cọc'], ['Còn trả', T.owe, f.debtMoved ? 'Đã chuyển sang theo dõi hậu tang' : 'Khoản đã duyệt chưa trả hết'], ['Phát sinh', T.extra, 'Ngoài dự toán ban đầu']];
  return (
    <div className="page">
      <div className="page-title"><div><h1>Tài chính</h1><p>Mọi người cùng nhìn một con số: dự kiến, đã chi, còn trả, phát sinh</p></div>
        <div className="actions"><button className="btn primary" disabled={L} onClick={() => setReq(true)}><Icon n="plus" c="sm" />{isU1 ? 'Ghi khoản chi' : 'Đề nghị chi'}</button>
          <button className="btn" onClick={() => nav(`${base}/tai-chinh/doi-soat`)}><Icon n="lock" c="sm" />Đối soát và khóa</button></div></div>
      {L && <Banner kind="info" icon="lock"><b>Tài chính đã khóa</b> lúc {fmtAt(f.lockedAt)} bởi {expenseMember(c.members, f.lockedBy ?? null)}. Không thêm, sửa khoản chi được nữa.</Banner>}
      <div className="tiles">{tiles.map(([l, v, s]) => <div key={l} className="tile"><span className="muted">{l}</span><span className="v">{money(v)}</span><span className="muted" style={{ fontSize: 12 }}>{s}</span></div>)}</div>
      {bud ? <section className="card card-pad stack" style={{ gap: 8 }}><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}><b>Ngân sách {money(bud)}</b><span className="muted">{f.budgetFromPre ? 'từ hồ sơ chuẩn bị · ' : ''}đã dự kiến dùng {pct}%</span>
        <button className="btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => nav(`${base}/tai-chinh/ngan-sach`)}>Sửa</button></div>
        <div className={'bar ' + (pct < 85 ? 'ok' : '')}><i style={{ width: `${Math.min(pct, 100)}%` }} /></div>
        {pct >= 85 && <p style={{ color: 'var(--danger)' }}><Icon n="alert" c="sm" /> {pct > 100 ? 'Đã vượt ngân sách.' : 'Sắp vượt ngân sách.'}</p>}</section>
        : <section className="card card-pad" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><div style={{ flex: 1 }}><b>Chưa lập ngân sách</b><p className="muted">Lập ngân sách để app cảnh báo khi chi phí sắp vượt.</p></div><button className="btn" onClick={() => nav(`${base}/tai-chinh/ngan-sach`)}>Lập ngân sách</button></section>}
      {reqs.length > 0 && <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Đề nghị chờ duyệt</h3></div>
        <div className="list">{reqs.map(e => <button key={e.id} className="row" onClick={() => isU1 ? setAp(e) : setOpen(e.id)}><span className="num-badge"><Icon n="wallet" c="sm" /></span><div className="grow"><div className="title">Đề nghị chi {money(e.amount)} — {e.name}</div><div className="meta"><span className="pill wait">Chờ duyệt</span><span>Từ: {expenseMember(c.members, e.requestedBy)}</span></div></div><Icon n="chev" c="chev" /></button>)}</div></section>}
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Các khoản chi</h3><span className="muted">{f.expenses.length} khoản</span>
        <button className="btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => nav(`${base}/tai-chinh/khoan-chi`)}>Lọc, xem tất cả</button></div>
        <ExpenseTable list={f.expenses.slice(-8).reverse()} onOpen={setOpen} /></section>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Theo nguồn tiền</h3><span className="muted">Để đối chiếu với quỹ tiền mặt và sao kê</span></div>
        <div className="list">{byFund(f).map(x => <div key={x.f.id} className="row"><span className="num-badge"><Icon n={x.f.type === 'cash' ? 'wallet' : 'link'} c="sm" /></span><div className="grow"><div className="title">{fundLabel(x.f)}</div><div className="meta"><span>{METHOD_LABEL[x.f.type]}</span>{x.plan > 0 && <span>Dự kiến chi thêm <span className="num">{money(x.plan)}</span></span>}</div></div><div className="num" style={{ fontWeight: 600, textAlign: 'right' }}>{money(x.paid)}<div className="muted" style={{ fontWeight: 400 }}>đã chi</div></div></div>)}</div>
        <p className="note" style={{ margin: '0 16px 14px' }}>App chỉ ghi nhận, không kết nối hay chuyển tiền. Tài khoản của gia đình chỉ lưu tên gợi nhớ và 4 số cuối. Tài khoản bên nhận lưu đầy đủ để chuyển khoản, chỉ người có quyền Tài chính xem được.</p></section>
      {f.orgExpenses.length > 0 && <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Do Ban lễ tang, đơn vị chi trả</h3><span className="muted">Tách riêng, không tính vào chi phí gia đình</span></div>
        <div className="list">{f.orgExpenses.map(x => <div key={x.id} className="row"><span className="num-badge"><Icon n="team" c="sm" /></span><div className="grow"><div className="title">{x.name}</div><div className="meta"><span>{x.note}</span></div></div><span className="num" style={{ fontWeight: 600 }}>{x.amount ? money(x.amount) : <span className="pill soft">Chờ xác nhận</span>}</span></div>)}</div></section>}
      <button className="card card-pad row" style={{ border: '1px solid var(--border)', borderRadius: 12 }} onClick={() => nav(`${base}/tai-chinh/phung-vieng`)}><Icon n="lock" />
        <div className="grow"><div className="title">Sổ phúng viếng</div><div className="meta">{canFin ? `${c.ledger?.length ?? 0} lượt ghi · tách riêng với chi phí` : 'Chỉ người đại diện và người giữ Tài chính xem được'}</div></div><Icon n="chev" c="chev" /></button>
      <button className="card card-pad row" style={{ border: '1px solid var(--border)', borderRadius: 12 }} onClick={() => nav(`${base}/tai-chinh/cong-no`)}><Icon n="wallet" />
        <div className="grow"><div className="title">Công nợ</div><div className="meta">{debts(f).length} khoản còn phải trả</div></div><Icon n="chev" c="chev" /></button>
      {req && <ExpenseSheet onClose={() => setReq(false)} />}
      {open && <ExpenseDetailSheet id={open} onClose={() => setOpen(null)} />}
      {ap && <ApprovalSheet e={ap} onClose={() => setAp(null)} />}
    </div>
  );
}

/* ---------- S-FIN-02 ---------- */
export function BudgetPage() { return <PaidGate module="Tài chính"><Budget /></PaidGate>; }
function Budget() {
  const { c, update, base, isU1 } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const f = c.finance!;
  const [b, setB] = useState(f.budget ? f.budget.toLocaleString('vi-VN') : '');
  const [org, setOrg] = useState({ name: '', amount: '', note: '' });
  const [fund, setFund] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const T = totals(f);
  const byCat = [...catsVisible(c.situation).map(k => ({ k: k.k as VendorCat | 'khac', n: k.name })), { k: 'khac' as const, n: 'Khác' }]
    .map(x => ({ ...x, sum: f.expenses.filter(e => e.cat === x.k && e.status !== 'rejected').reduce((s, e) => s + e.amount, 0) }));
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="page-title"><div><div className="eyebrow">Tài chính</div><h1 style={{ marginTop: 4 }}>Ngân sách và dự toán</h1><p>Ngân sách giúp app cảnh báo khi chi phí sắp vượt</p></div></div>
      <section className="card card-pad stack">
        <div className="field"><label htmlFor="bud">Ngân sách gia đình dự kiến (đồng)</label><input className="input num" id="bud" inputMode="numeric" value={b} disabled={!isU1 || f.locked} onChange={e => setB(fmtMoneyInput(e.target.value))} style={{ fontSize: 20, fontWeight: 600 }} /></div>
        {isU1 && !f.locked && <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => { const e = update(d => setBudget(d, parseMoney(b))); if (e) setErr(e); else { toast('Đã lưu ngân sách'); nav(`${base}/tai-chinh`); } }}>Lưu ngân sách</button>}
        {!isU1 && <p className="muted">Người đại diện gia đình lập ngân sách.</p>}
        <ErrorBanner err={err} />
      </section>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Dự toán theo hạng mục</h3><span className="muted">Tổng {money(T.plan)}</span></div>
        <div className="list">{byCat.map(x => <div key={x.k} className="row"><div className="grow"><div className="title">{x.n}</div></div><span className="num">{money(x.sum)}</span></div>)}</div></section>
      <section className="card card-pad stack"><div style={{ display: 'flex', alignItems: 'center' }}><h3 style={{ flex: 1 }}>Nguồn tiền của gia đình</h3><button className="btn sm" onClick={() => setFund(true)}><Icon n="plus" c="sm" />Thêm</button></div>
        <div className="list">{f.funds.map(x => <div key={x.id} className="row" style={{ padding: '8px 0' }}><Icon n={x.type === 'cash' ? 'wallet' : 'link'} /><div className="grow"><div className="title">{fundLabel(x)}</div></div><span className="muted">{METHOD_LABEL[x.type]}</span></div>)}</div></section>
      <section className="card card-pad stack"><h3>Khoản do Ban lễ tang, đơn vị chi trả</h3>
        <p className="muted">Ghi riêng để không tính vào chi phí gia đình (vòng hoa, xe đưa đoàn đại biểu, hỗ trợ mai táng phí…).</p>
        {f.orgExpenses.map(x => <div key={x.id} className="row" style={{ padding: '6px 0' }}><div className="grow"><div className="title">{x.name}</div><div className="meta"><span>{x.note}</span></div></div><span className="num">{x.amount ? money(x.amount) : 'Chờ xác nhận'}</span></div>)}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8 }}>
          <input className="input" value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} placeholder="Tên khoản" aria-label="Tên khoản" />
          <input className="input num" inputMode="numeric" value={org.amount} onChange={e => setOrg({ ...org, amount: fmtMoneyInput(e.target.value) })} placeholder="Số tiền (nếu biết)" aria-label="Số tiền" />
          <input className="input" value={org.note} onChange={e => setOrg({ ...org, note: e.target.value })} placeholder="Ghi chú" aria-label="Ghi chú" /></div>
        <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => { const e = update(d => addOrgExpense(d, org.name, parseMoney(org.amount) || null, org.note)); if (e) setErr(e); else setOrg({ name: '', amount: '', note: '' }); }}><Icon n="plus" c="sm" />Thêm khoản</button>
      </section>
      {fund && <FundSheet onClose={() => setFund(false)} />}
    </div>
  );
}

/* ---------- S-FIN-04 ---------- */
export function ExpensesPage() { return <PaidGate module="Tài chính"><Expenses /></PaidGate>; }
function Expenses() {
  const { c } = useCase();
  const [F, setF] = useState<ExpenseStatus | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const list = c.finance!.expenses.filter(e => F === 'all' || e.status === F).slice().reverse();
  return (
    <div className="page"><div className="page-title"><div><div className="eyebrow">Tài chính</div><h1 style={{ marginTop: 4 }}>Khoản chi</h1></div></div>
      <div className="segin" role="group" aria-label="Lọc theo trạng thái">{([['all', 'Tất cả'], ...Object.entries(EXP_STATUS).map(([k, v]) => [k, v[1]])] as [string, string][]).map(([k, l]) =>
        <button key={k} aria-pressed={F === k} onClick={() => setF(k as ExpenseStatus | 'all')}>{l}</button>)}</div>
      <section className="card"><ExpenseTable list={list} onOpen={setOpen} /></section>
      {open && <ExpenseDetailSheet id={open} onClose={() => setOpen(null)} />}</div>
  );
}

/* ---------- S-FIN-05 ---------- */
export function DebtsPage() { return <PaidGate module="Tài chính"><Debts /></PaidGate>; }
function Debts() {
  const { c, dir } = useCase();
  const [open, setOpen] = useState<string | null>(null);
  const L = debts(c.finance!);
  return (
    <div className="page" style={{ maxWidth: 820 }}><div className="page-title"><div><div className="eyebrow">Tài chính</div><h1 style={{ marginTop: 4 }}>Công nợ</h1><p>Khoản đã duyệt còn phải trả{c.finance!.debtMoved ? ' · đã chuyển sang theo dõi ở Hậu tang' : ''}</p></div></div>
      <section className="card">{L.length ? <div className="list">{L.map(e => (
        <button key={e.id} className="row" onClick={() => setOpen(e.id)}><div className="grow"><div className="title">{e.name}</div><div className="meta"><span>{e.vendorId ? findVendor(c, dir, e.vendorId)?.name : '—'}</span><span>Đã trả {money(e.paid)}</span></div></div>
          <div className="num" style={{ fontWeight: 600 }}>{money(e.amount - e.paid)}</div></button>
      ))}</div> : <div className="empty"><Icon n="check" c="lg" /><span>Không còn khoản nào phải trả.</span></div>}</section>
      {open && <ExpenseDetailSheet id={open} onClose={() => setOpen(null)} />}</div>
  );
}

/* ---------- S-FIN-06 ---------- */
export function LedgerPage() { return <PaidGate module="Tài chính"><Ledger /></PaidGate>; }
function Ledger() {
  const { c, base, canFin } = useCase();
  const { mobile } = useApp();
  const nav = useNavigate();
  const [F, setF] = useState('all');
  if (!canFin) return (
    <div className="page"><section className="card"><div className="empty"><Icon n="lock" c="lg" /><h2 style={{ color: 'var(--text)' }}>Sổ phúng viếng được giới hạn</h2>
      <p style={{ maxWidth: '44ch' }}>Chỉ người được gia đình giao quyền mới xem được tổng và từng khoản. Anh/chị vẫn ghi nhận khách viếng bình thường ở mục Khách viếng.</p>
      <button className="btn" onClick={() => nav(`${base}/khach-vieng`)}>Về Khách viếng</button></div></section></div>
  );
  const L = c.ledger ?? [], T = ledgerTotals(L), kids = children(c.members);
  const label = (of: string | null) => of === 'cu' ? 'Bạn của người đã khuất' : kids.find(k => k.id === of) ? `Bạn ${kids.find(k => k.id === of)!.short} (${kids.find(k => k.id === of)!.rel})` : 'Bạn bè';
  const grp = (x: typeof L[number]) => (x.group === 'Bạn bè' ? label(x.of) : x.group ?? 'Khác');
  const friends = L.filter(x => x.group === 'Bạn bè');
  const rows = F === 'all' ? L : L.filter(x => x.group === 'Bạn bè' && x.of === F);
  const stats = [...kids.map(k => k.id), 'cu'].map(id => ({ id, label: label(id), n: friends.filter(x => x.of === id).length, s: friends.filter(x => x.of === id).reduce((a, x) => a + x.amount, 0) })).filter(k => k.n || k.id !== 'cu');
  return (
    <div className="page"><div className="page-title"><div><h1>Sổ phúng viếng</h1><p>Tách riêng với chi phí · không hiện trên trang công khai</p></div></div>
      <div className="tiles">
        <div className="tile"><span className="muted">Tổng phúng viếng</span><span className="v">{money(T.total)}</span><span className="muted" style={{ fontSize: 12 }}>Tiền mặt {money(T.cash)} · Chuyển khoản {money(T.bank)}</span></div>
        <div className="tile"><span className="muted">Lượt ghi</span><span className="v">{L.length}</span></div>
        <div className="tile"><span className="muted">Khách là bạn các con</span><span className="v">{friends.filter(x => x.of !== 'cu').length}</span></div>
        <div className="tile"><span className="muted">Khách chung gia đình</span><span className="v">{L.length - friends.length}</span></div></div>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Bạn bè theo từng người con</h3><span className="muted">Để mỗi người biết mà cảm ơn, đi lại</span></div>
        {stats.length ? <div className="list">{stats.map(k => <button key={k.id} className="row" onClick={() => setF(k.id)}><span className="num-badge"><Icon n="user" c="sm" /></span><div className="grow"><div className="title">{k.label}</div><div className="meta"><span>{k.n} lượt</span></div></div><span className="num" style={{ fontWeight: 600 }}>{money(k.s)}</span></button>)}</div>
          : <p className="muted" style={{ padding: '0 16px 14px' }}>Thêm các con vào Đội (quan hệ “Con trai / Con gái / Con dâu / Con rể”) để chia khách theo từng người.</p>}</section>
      <section className="card"><div className="card-pad" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', paddingBottom: 8 }}><h3 style={{ flex: 1, minWidth: 140 }}>{F === 'all' ? 'Tất cả lượt ghi' : label(F)}</h3>
        <div className="segin" role="group" aria-label="Lọc theo khách của">{[['all', 'Tất cả'], ...kids.map(k => [k.id, 'Bạn ' + k.short])].map(([k, l]) => <button key={k} aria-pressed={F === k} onClick={() => setF(k)}>{l}</button>)}</div></div>
        {rows.length ? (mobile ? <div className="list">{rows.map(x => <div key={x.id} className="row"><div className="grow"><div className="title">{x.name}</div><div className="meta"><span style={x.group === 'Bạn bè' ? { color: 'var(--primary)', fontWeight: 500 } : undefined}>{grp(x)}</span>{x.gifts.length > 0 && <span>{x.gifts.join(', ')}</span>}<span>{METHOD_LABEL[x.method]}</span><span>{x.by} · {fmtAt(x.at)}</span></div></div><div className="num" style={{ fontWeight: 600 }}>{money(x.amount)}</div></div>)}</div>
          : <div style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Người / đoàn</th><th>Nhóm</th><th>Khách của</th><th className="num" style={{ textAlign: 'right' }}>Phúng viếng</th><th>Hình thức</th><th>Lễ vật</th><th>Người ghi</th></tr></thead>
            <tbody>{rows.map(x => <tr key={x.id}><td>{x.name}</td><td>{x.group ?? 'Khác'}</td><td>{x.group === 'Bạn bè' ? <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{label(x.of).replace(/^Bạn /, '')}</span> : <span className="muted">Chung gia đình</span>}</td>
              <td className="num" style={{ textAlign: 'right' }}>{money(x.amount)}</td><td>{METHOD_LABEL[x.method]}</td><td>{x.gifts.join(', ') || '—'}</td><td>{x.by} · {fmtAt(x.at)}</td></tr>)}</tbody></table></div>)
          : <div className="empty">{L.length ? 'Chưa có khách nào là bạn của người này.' : 'Chưa có lượt ghi nào. Ghi ở Khách viếng → Ghi khách viếng.'}</div>}</section>
      <p className="note">Dữ liệu dùng để đối soát khi khóa tài chính và làm danh sách cảm ơn ở Hậu tang — mỗi người con nhận danh sách bạn của mình.</p>
    </div>
  );
}

/* ---------- S-FIN-07 ---------- */
export function ReconcilePage() { return <PaidGate module="Tài chính"><Reconcile /></PaidGate>; }
function Reconcile() {
  const { c, base, update, isU1, me } = useCase();
  const { toast } = useApp();
  const up = useUploader();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const f = c.finance!, r = reconcile(c), L = f.locked;
  const detail: Record<string, ReactNode> = {
    evidence: r.missing.map(e => <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}><span style={{ flex: 1 }}>{e.name} · <span className="num">{money(e.paid)}</span></span>
      <label className="btn sm file-btn"><Icon n="doc" c="sm" />{up.busy ? 'Đang tải lên…' : 'Đính chứng từ'}<input type="file" disabled={L || up.busy} onChange={async x => { const file = x.target.files?.[0]; x.target.value = ''; if (!file) return; const s = await up.run(() => uploadCaseFile(c.id, 'fin', file)); if (s) { update(d => attachExpenseEvidence(d, e.id, s.name, s.path)); toast('Đã đính chứng từ: ' + s.name); } }} /></label></div>),
    pending: r.pending.length > 0 && <button className="btn sm" style={{ marginTop: 8 }} onClick={() => nav(`${base}/can-quyet`)}>Mở {r.pending.length} đề nghị</button>,
    cash: <><div className="field" style={{ maxWidth: 340, marginTop: 8 }}><label htmlFor="counted">Tiền mặt đã kiểm đếm (sổ ghi tiền mặt <span className="num">{money(r.cash)}</span>)</label>
      <input className="input num" id="counted" inputMode="numeric" value={f.counted} disabled={L} onChange={e => update(d => { d.finance!.counted = fmtMoneyInput(e.target.value); })} placeholder="Nhập số tiền" /></div>
      {f.counted && r.counted !== r.cash && <p style={{ color: 'var(--danger)', marginTop: 6 }}>Lệch <span className="num">{money(Math.abs(r.counted - r.cash))}</span> — kiểm lại sổ hoặc tiền.</p>}</>,
    bank: <label className="check" style={{ marginTop: 6 }}><input type="checkbox" checked={f.bankOk} disabled={L} onChange={e => update(d => { d.finance!.bankOk = e.target.checked; })} /><span>Đã đối chiếu <span className="num">{money(r.bank)}</span> chuyển khoản với sao kê tài khoản nhận</span></label>,
    owe: r.owe > 0 && <button className="btn sm" style={{ marginTop: 8 }} disabled={L} onClick={() => { update(d => moveDebt(d)); toast('Đã chuyển khoản còn trả sang theo dõi ở Hậu tang'); }}>Chuyển <span className="num">{money(r.owe)}</span> sang theo dõi hậu tang</button>,
  };
  const all = r.conds.every(x => x.ok);
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="page-title"><div><div className="eyebrow">Tài chính</div><h1 style={{ marginTop: 4 }}>Đối soát và khóa tài chính</h1><p>Khóa khi mọi con số đã khớp. Sau khi khóa, không thêm, sửa khoản chi.</p></div></div>
      {L && <Banner kind="info" icon="lock"><b>Đã khóa</b> lúc {fmtAt(f.lockedAt)} bởi {expenseMember(c.members, f.lockedBy ?? null)} · lưu vào lịch sử.</Banner>}
      <section className="card">{r.conds.map(k => (
        <div key={k.key} className={'cond ' + (k.ok ? 'ok' : '')}><span className="mark"><Icon n={k.ok ? 'check' : 'alert'} c="sm" /></span><div className="grow"><div className="title">{k.label}</div>{!k.ok && detail[k.key]}</div></div>
      ))}</section>
      <ErrorBanner err={err} />
      {!L && (confirm
        ? <Banner kind="warn" icon="lock"><b>Khóa tài chính?</b> Mở lại cần người đại diện xác nhận và được ghi vào lịch sử.
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><button className="btn sm primary" onClick={() => { const e = update(d => lockFinance(d, me.id)); if (e) setErr(e); else { setConfirm(false); toast('Đã khóa tài chính'); } }}>Khóa tài chính</button><button className="btn sm" onClick={() => setConfirm(false)}>Hủy</button></div></Banner>
        : <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn primary" disabled={!all || !isU1} onClick={() => setConfirm(true)} style={{ flex: 1 }}><Icon n="lock" c="sm" />Khóa tài chính</button><button className="btn" onClick={() => nav(`${base}/tai-chinh`)}>Về tổng quan</button></div>)}
      {!L && !all && <p className="muted">Còn {r.conds.filter(k => !k.ok).length} điều kiện chưa đạt.</p>}
      {!isU1 && <p className="muted">Người đại diện gia đình bấm khóa.</p>}
    </div>
  );
}
