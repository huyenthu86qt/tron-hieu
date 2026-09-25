// Admin V1: Tổng quan · Người dùng (+ chi tiết) · Đơn hàng & thanh toán · Quyền truy cập · Gói & giá · SePay · Giao dịch chưa khớp
// · Danh bạ nhà cung cấp (S-ADM-01/02/03) · Nhật ký. Admin không xem nội dung riêng tư của đám hiếu.
import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { CaseData, DirVendor, VendorCat, VendorCond } from '../domain/types';
import { CATS, catName, fmtGeo, parseGeo } from '../domain/vendors';
import { fmtMoneyInput, money, parseMoney } from '../domain/finance';
import { fmtPhone, isFull, ORDER_STATUS_LABEL, type OrderStatus, type Product } from '../domain/platform';
import { DN_TEXT } from '../domain/text';
import { repo } from '../repo/repo';
import { REMOTE } from '../repo/backend';
import {
  assignTx, createAdmin, login, logout, refundOrder, refundTx, saveProduct, saveSettings, saveVendor, setCaseAccess, setSupportNote,
  setUserLocked, setVendorActive, simulateBankTx, usePlatform, useUser,
} from '../repo/platformStore';
import { Icon, type IconName } from '../ui/Icon';
import { Banner, Chips, ErrorBanner, Opts, Sheet, toggleIn, useApp } from '../ui/common';
import { BRAND } from '../ui/brand';
import { SideLogo } from '../ui/brand';

const fmtAt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
const COND: Record<VendorCond, string> = { both: 'Cả mai táng và hỏa táng', burial: 'Chỉ mai táng', cremation: 'Chỉ hỏa táng' };
const OPill = ({ s }: { s: OrderStatus }) => <span className={'pill ' + ORDER_STATUS_LABEL[s][0]}>{ORDER_STATUS_LABEL[s][1]}</span>;

function useAllCases() {
  const [L, setL] = useState<CaseData[]>([]);
  const load = () => (repo.adminCases ?? repo.listAll).call(repo).then(setL);
  useEffect(() => { void load(); }, []);
  return [L, load] as const;
}

const NAVS: [string, IconName, string][] = [
  ['Tổng quan', 'now', '/admin'], ['Người dùng', 'user', '/admin/nguoi-dung'], ['Đơn hàng', 'wallet', '/admin/don-hang'], ['Quyền truy cập', 'lock', '/admin/quyen'],
  ['Gói & giá', 'doc', '/admin/goi-gia'], ['SePay', 'link', '/admin/sepay'], ['Giao dịch chưa khớp', 'alert', '/admin/chua-khop'],
  ['Danh bạ nhà cung cấp', 'vendor', '/admin/nha-cung-cap'], ['Nhật ký', 'refresh', '/admin/nhat-ky'],
];

export function AdminShell({ title, back, children }: { title: string; back?: string; children: ReactNode }) {
  const { mobile } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const user = useUser()!;
  const unmatched = usePlatform(s => s.txs).filter(t => t.status === 'unmatched').length;
  const cur = (to: string) => (to === '/admin' ? loc.pathname === to : loc.pathname.startsWith(to)) ? 'page' : undefined;
  if (mobile) return (
    <div className="shell-m"><header className="top-m">{back && <button className="icon-btn" onClick={() => nav(back)} aria-label="Quay lại"><Icon n="back" /></button>}
      <div className="t"><h2>{title}</h2><p>Quản trị · {BRAND}</p></div>
      <select className="input" style={{ width: 'auto', minHeight: 36 }} value={NAVS.find(n => cur(n[2]))?.[2] ?? '/admin'} onChange={e => nav(e.target.value)} aria-label="Mục quản trị">{NAVS.map(([l, , to]) => <option key={to} value={to}>{l}</option>)}</select></header>
      <main className="content" style={{ paddingBottom: 24 }}>{children}</main></div>
  );
  return (
    <div className="shell-d"><nav className="side" aria-label="Điều hướng quản trị"><SideLogo label="Quản trị" />
      {NAVS.map(([l, i, to]) => <button key={to} className="nav-item" onClick={() => nav(to)} aria-current={cur(to)}><Icon n={i} />{l}{to === '/admin/chua-khop' && unmatched > 0 && <span className="count">{unmatched}</span>}</button>)}
      <div className="sep" /><button className="nav-item" onClick={() => { logout(); nav('/admin/dang-nhap'); }}><Icon n="back" />Đăng xuất</button></nav>
      <div className="main-d"><header className="head-d"><div className="case"><h2>Quản trị hệ thống</h2><p>Chỉ đội vận hành {BRAND} · {user.name}</p></div><div className="tools"><div className="avatar">A</div></div></header>
        <main className="content">{children}</main></div></div>
  );
}

/* ---------- Đăng nhập Admin ---------- */
export function AdminLoginPage() {
  const nav = useNavigate();
  const user = useUser();
  const hasAdmin = usePlatform(s => REMOTE || s.users.some(u => u.isAdmin));
  const [f, setF] = useState({ name: '', phone: '', pass: '' });
  const [err, setErr] = useState<string | null>(null);
  if (user?.isAdmin) return <Navigate to="/admin" replace />;
  const go = async () => {
    const e = hasAdmin ? await login(f.phone, f.pass) : await createAdmin(f.name, f.phone, f.pass);
    if (e) { setErr(e); return; }
    nav('/admin', { replace: true });
  };
  return (
    <div className="bare"><div className="bare-inner" style={{ maxWidth: 440 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}><Icon n="lotus" /><b style={{ fontFamily: 'var(--serif)' }}>Quản trị {BRAND}</b></div>
      <h1 style={{ fontSize: 24 }}>{hasAdmin ? 'Đăng nhập quản trị' : 'Tạo tài khoản Admin (bản chạy thử)'}</h1>
      {user && !user.isAdmin && <Banner kind="warn">Tài khoản đang đăng nhập không phải Admin.{REMOTE && ' Chủ hệ thống bật quyền Admin cho số điện thoại này trên máy chủ (Supabase) rồi đăng nhập lại.'}</Banner>}
      {REMOTE && <p className="muted">Admin đăng nhập bằng số điện thoại và mật khẩu của tài khoản đã đăng ký trong app.</p>}
      {!hasAdmin && <Banner kind="upd">Giai đoạn 3 tài khoản Admin do chủ hệ thống tạo trên máy chủ, không tự đăng ký. Ở bản chạy thử trên máy, tạo một tài khoản Admin để thử các màn quản trị.</Banner>}
      <section className="card card-pad stack">
        {!hasAdmin && <div className="field"><label htmlFor="aName">Họ tên</label><input className="input" id="aName" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>}
        <div className="field"><label htmlFor="aPhone">Số điện thoại</label><input className="input num" id="aPhone" inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
        <div className="field"><label htmlFor="aPass">Mật khẩu</label><input className="input" id="aPass" type="password" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') void go(); }} /></div>
        <ErrorBanner err={err} />
        <button className="btn primary block" onClick={go}>{hasAdmin ? 'Đăng nhập' : 'Tạo tài khoản Admin'}</button>
      </section>
      <p className="muted" style={{ textAlign: 'center' }}><Link to="/">Về app gia đình</Link></p>
    </div></div>
  );
}

/* ---------- Tổng quan ---------- */
export function AdminHomePage() {
  const p = usePlatform(s => s);
  const today = new Date().toDateString();
  const paid = p.orders.filter(o => o.status === 'paid');
  const byDay = new Map<string, number>();
  paid.forEach(o => { const d = new Date(o.paidAt!).toLocaleDateString('vi-VN'); byDay.set(d, (byDay.get(d) ?? 0) + o.amount); });
  const lastErr = p.txs.find(t => t.status !== 'matched');
  const tiles: [string, string][] = [
    ['Đăng ký mới hôm nay', String(p.users.filter(u => !u.isAdmin && new Date(u.createdAt).toDateString() === today).length)],
    ['Đơn chờ thanh toán', String(p.orders.filter(o => o.status === 'pending').length)],
    ['Giao dịch chưa khớp', String(p.txs.filter(t => t.status === 'unmatched').length)],
    ['Doanh thu (đã khớp)', money(paid.reduce((s, o) => s + o.amount, 0))],
  ];
  return (
    <AdminShell title="Tổng quan"><div className="page">
      <div className="page-title"><div><h1>Tổng quan</h1><p>Số liệu trên máy này (bản chạy thử)</p></div></div>
      <div className="tiles">{tiles.map(([l, v]) => <div key={l} className="tile"><span className="muted">{l}</span><span className="v">{v}</span></div>)}</div>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Doanh thu theo ngày</h3></div>
        {byDay.size ? <div className="list">{[...byDay].map(([d, v]) => <div key={d} className="row"><div className="grow"><div className="title">{d}</div></div><span className="num">{money(v)}</span></div>)}</div> : <div className="empty"><span>Chưa có doanh thu.</span></div>}</section>
      <section className="card card-pad stack" style={{ gap: 6 }}><h3>Giao dịch lỗi / chưa khớp gần nhất</h3>{lastErr ? <p>{lastErr.providerTxId} · {money(lastErr.amount)} · {lastErr.reason} · {fmtAt(lastErr.at)}</p> : <p className="muted">Không có.</p>}</section>
    </div></AdminShell>
  );
}

/* ---------- Người dùng ---------- */
export function AdminUsersPage() {
  const users = usePlatform(s => s.users);
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const L = users.filter(u => !u.isAdmin && (u.name.toLowerCase().includes(q.toLowerCase()) || u.phone.includes(q.replace(/\D/g, '') || '§')));
  return (
    <AdminShell title="Người dùng"><div className="page">
      <div className="page-title"><div><h1>Người dùng</h1><p>{users.filter(u => !u.isAdmin).length} tài khoản</p></div></div>
      <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên hoặc số điện thoại" aria-label="Tìm người dùng" />
      <section className="card" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Họ tên</th><th>Số điện thoại</th><th>Tạo lúc</th><th>Trạng thái</th><th /></tr></thead>
        <tbody>{L.map(u => <tr key={u.id}><td>{u.name}</td><td className="num">{fmtPhone(u.phone)}</td><td>{fmtAt(u.createdAt)}</td>
          <td>{u.locked ? <span className="pill issue">Đã khóa</span> : u.deleteRequestedAt ? <span className="pill wait">Yêu cầu xóa</span> : <span className="pill done">Hoạt động</span>}</td>
          <td><button className="btn sm" onClick={() => nav(`/admin/nguoi-dung/${u.id}`)}>Chi tiết</button></td></tr>)}
          {!L.length && <tr><td colSpan={5}><div className="empty">Không có người dùng nào khớp.</div></td></tr>}</tbody></table></section>
    </div></AdminShell>
  );
}

export function AdminUserPage() {
  const { uid = '' } = useParams();
  const { toast } = useApp();
  const u = usePlatform(s => s.users.find(x => x.id === uid));
  const orders = usePlatform(s => s.orders).filter(o => o.userId === uid);
  const pres = usePlatform(s => s.preNeeds).filter(p => p.ownerId === uid);
  const [cases] = useAllCases();
  const [note, setNote] = useState(u?.supportNote ?? '');
  const [lock, setLock] = useState<null | boolean>(null);
  const [reason, setReason] = useState('');
  if (!u) return <AdminShell title="Người dùng" back="/admin/nguoi-dung"><div className="page"><div className="empty">Không tìm thấy.</div></div></AdminShell>;
  const mine = cases.filter(c => c.ownerId === uid);
  return (
    <AdminShell title="Chi tiết người dùng" back="/admin/nguoi-dung"><div className="page" style={{ maxWidth: 900 }}>
      <div className="page-title"><div><div className="eyebrow">Người dùng</div><h1 style={{ marginTop: 4 }}>{u.name}</h1><p className="num">{fmtPhone(u.phone)} · tạo lúc {fmtAt(u.createdAt)}</p></div>
        <div className="actions"><button className={'btn ' + (u.locked ? '' : 'danger')} onClick={() => setLock(!u.locked)}>{u.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</button></div></div>
      <Banner kind="info" icon="lock">Admin chỉ thấy tên và trạng thái; không xem nội dung đám hiếu (sổ phúng viếng, tài chính, hồ sơ người mất) trừ khi gia đình cho phép khi cần hỗ trợ.</Banner>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Đám hiếu và hồ sơ chuẩn bị</h3></div><div className="list">
        {mine.map(c => <div key={c.id} className="row"><div className="grow"><div className="title">Đám hiếu {DN_TEXT(c)}</div><div className="meta">{isFull(c) ? <span className="pill done">Đã mở đầy đủ</span> : <span className="pill soft">Miễn phí</span>}{c.after?.closed && <span>Đã khép vòng</span>}{c.deleteRequestedAt && <span className="pill wait">Yêu cầu xóa</span>}</div></div></div>)}
        {pres.map(p => <div key={p.id} className="row"><div className="grow"><div className="title">Hồ sơ chuẩn bị {p.subject.name}</div><div className="meta">{p.caseId ? <span className="pill done">Đã kích hoạt</span> : p.paid ? <span className="pill doing">Đã mở gói</span> : <span className="pill soft">Miễn phí</span>}</div></div></div>)}
        {!mine.length && !pres.length && <div className="empty">Chưa có.</div>}</div></section>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Đơn hàng</h3></div>
        {orders.length ? <div className="list">{orders.map(o => <div key={o.id} className="row"><div className="grow"><div className="title num">{o.code} · {o.productName}</div><div className="meta"><span>{o.target.name}</span><span>{fmtAt(o.createdAt)}</span></div></div><OPill s={o.status} /><span className="num">{money(o.amount)}</span></div>)}</div> : <div className="empty">Chưa có đơn.</div>}</section>
      <section className="card card-pad stack"><h3>Ghi chú hỗ trợ</h3><textarea className="input" value={note} onChange={e => setNote(e.target.value)} aria-label="Ghi chú hỗ trợ" />
        <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={async () => { await setSupportNote(u.id, note); toast('Đã lưu ghi chú'); }}>Lưu ghi chú</button></section>
      {lock !== null && <Sheet title={lock ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} onClose={() => setLock(null)} foot={<><button className="btn" onClick={() => setLock(null)}>Hủy</button>
        <button className={'btn ' + (lock ? 'danger' : 'primary')} disabled={!reason.trim()} onClick={async () => { const e = await setUserLocked(u.id, lock, reason); setLock(null); setReason(''); toast(e ?? (lock ? 'Đã khóa tài khoản' : 'Đã mở khóa')); }}>Xác nhận</button></>}>
        <div className="field"><label htmlFor="lkR">Lý do (ghi vào nhật ký)</label><textarea className="input" id="lkR" value={reason} onChange={e => setReason(e.target.value)} /></div></Sheet>}
    </div></AdminShell>
  );
}

/* ---------- Đơn hàng ---------- */
export function AdminOrdersPage() {
  const orders = usePlatform(s => s.orders);
  const txs = usePlatform(s => s.txs);
  const { toast } = useApp();
  const [F, setF] = useState<OrderStatus | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const o = orders.find(x => x.code === open);
  const L = orders.filter(x => F === 'all' || x.status === F);
  return (
    <AdminShell title="Đơn hàng"><div className="page">
      <div className="page-title"><div><h1>Đơn hàng & thanh toán</h1><p>{orders.length} đơn</p></div></div>
      <div className="segin" role="group" aria-label="Lọc trạng thái">{(['all', 'pending', 'paid', 'expired', 'failed', 'refunded'] as const).map(k => <button key={k} aria-pressed={F === k} onClick={() => setF(k)}>{k === 'all' ? 'Tất cả' : ORDER_STATUS_LABEL[k][1]}</button>)}</div>
      <section className="card" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Mã đơn</th><th>Gói</th><th>Áp dụng cho</th><th className="num">Số tiền</th><th>Trạng thái</th><th>Tạo lúc</th><th /></tr></thead>
        <tbody>{L.map(x => <tr key={x.id}><td className="num">{x.code}</td><td>{x.productName}</td><td>{x.target.name}</td><td className="num">{money(x.amount)}</td><td><OPill s={x.status} /></td><td>{fmtAt(x.createdAt)}</td><td><button className="btn sm" onClick={() => setOpen(x.code)}>Chi tiết</button></td></tr>)}
          {!L.length && <tr><td colSpan={7}><div className="empty">Không có đơn.</div></td></tr>}</tbody></table></section>
      {o && <Sheet title={`Đơn ${o.code}`} onClose={() => { setOpen(null); setReason(''); }}>
        <dl className="kv"><dt>Gói</dt><dd>{o.productName}</dd><dt>Áp dụng cho</dt><dd>{o.target.name}</dd><dt>Số tiền</dt><dd className="num">{money(o.amount)}</dd><dt>Trạng thái</dt><dd><OPill s={o.status} /></dd>
          <dt>Tạo lúc</dt><dd>{fmtAt(o.createdAt)}</dd><dt>Hạn</dt><dd>{fmtAt(o.expiresAt)}</dd>{o.paidAt && <><dt>Thanh toán lúc</dt><dd>{fmtAt(o.paidAt)}</dd></>}{o.note && <><dt>Ghi chú</dt><dd>{o.note}</dd></>}</dl>
        <div className="eyebrow">Giao dịch liên quan</div>
        {txs.filter(t => t.orderId === o.id).map(t => <p key={t.id} className="num">{t.providerTxId} · {money(t.amount)} · {t.status}{t.reason ? ' · ' + t.reason : ''}</p>)}
        {o.status === 'paid' && <div className="stack" style={{ gap: 8 }}><div className="field"><label htmlFor="rfR">Hoàn tiền (xử lý tay) — lý do</label><textarea className="input" id="rfR" value={reason} onChange={e => setReason(e.target.value)} /></div>
          <button className="btn danger" style={{ alignSelf: 'flex-start' }} disabled={!reason.trim()} onClick={async () => { const e = await refundOrder(o.code, reason); toast(e ?? 'Đã đánh dấu hoàn tiền. Nhớ thu hồi quyền nếu cần ở mục Quyền truy cập.'); setReason(''); }}>Đánh dấu đã hoàn tiền</button></div>}
      </Sheet>}
    </div></AdminShell>
  );
}

/* ---------- Quyền truy cập ---------- */
export function AdminAccessPage() {
  const [cases, reload] = useAllCases();
  const { toast } = useApp();
  const [act, setAct] = useState<{ id: string; open: boolean } | null>(null);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  return (
    <AdminShell title="Quyền truy cập"><div className="page">
      <div className="page-title"><div><h1>Quyền truy cập</h1><p>Đám hiếu đã mở / tạm dừng / hết hạn — mở hoặc thu hồi thủ công cần lý do</p></div></div>
      <section className="card" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Đám hiếu</th><th>Trạng thái</th><th>Nguồn</th><th>Đến</th><th /></tr></thead>
        <tbody>{cases.map(c => { const a = c.access, on = isFull(c); return (
          <tr key={c.id}><td>{DN_TEXT(c)}</td><td>{on ? <span className="pill done">Đã mở</span> : a?.plan === 'full' ? <span className="pill skip">Hết hạn</span> : a?.revokedReason ? <span className="pill issue">Đã thu hồi</span> : <span className="pill soft">Miễn phí</span>}</td>
            <td>{a?.source === 'payment' ? `Thanh toán ${a.orderId ?? ''}` : a?.source === 'manual' ? 'Mở tay' : a?.source === 'activation' ? 'Kích hoạt hồ sơ chuẩn bị' : '—'}</td><td>{a?.activeUntil ? new Date(a.activeUntil).toLocaleDateString('vi-VN') : '—'}</td>
            <td><button className={'btn sm ' + (on ? 'danger' : '')} onClick={() => setAct({ id: c.id, open: !on })}>{on ? 'Thu hồi' : 'Mở thủ công'}</button></td></tr>); })}
          {!cases.length && <tr><td colSpan={5}><div className="empty">Chưa có đám hiếu.</div></td></tr>}</tbody></table></section>
      {act && <Sheet title={act.open ? 'Mở quyền thủ công' : 'Thu hồi quyền'} onClose={() => setAct(null)} foot={<><button className="btn" onClick={() => setAct(null)}>Hủy</button>
        <button className={'btn ' + (act.open ? 'primary' : 'danger')} onClick={async () => { const e = await setCaseAccess(act.id, act.open, reason); if (e) { setErr(e); return; } setAct(null); setReason(''); await reload(); toast('Đã cập nhật quyền, ghi vào nhật ký'); }}>Xác nhận</button></>}>
        <div className="field"><label htmlFor="acR">Lý do (ghi vào nhật ký)</label><textarea className="input" id="acR" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ví dụ: khách đã chuyển khoản nhưng sai nội dung, đã đối chiếu sao kê" /></div><ErrorBanner err={err} /></Sheet>}
    </div></AdminShell>
  );
}

/* ---------- Gói & giá ---------- */
export function AdminProductsPage() {
  const products = usePlatform(s => s.products);
  const { toast } = useApp();
  const [edit, setEdit] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  return (
    <AdminShell title="Gói & giá"><div className="page">
      <div className="page-title"><div><h1>Gói & giá</h1><p>Đổi giá không ảnh hưởng đơn đã tạo</p></div></div>
      {products.some(p => !p.updatedAt) && <Banner kind="upd">Đang dùng <b>giá thử nghiệm</b>. Chủ dự án chốt giá trước khi mở bán.</Banner>}
      <section className="card"><div className="list">{products.map(p => (
        <div key={p.id} className="row"><div className="grow"><div className="title">{p.name}</div><div className="meta"><span className="num">{money(p.price)}</span><span>{p.duration}</span>{p.active ? <span className="pill done">Đang bán</span> : <span className="pill skip">Tạm ngừng</span>}{p.updatedAt && <span>Sửa lúc {fmtAt(p.updatedAt)}</span>}</div><div className="meta"><span>{p.desc}</span></div></div>
          <button className="btn sm" onClick={() => { setEdit({ ...p }); setPrice(p.price.toLocaleString('vi-VN')); }}>Sửa</button></div>
      ))}</div></section>
      {edit && <Sheet title={`Sửa gói · ${edit.name}`} onClose={() => setEdit(null)} foot={<><button className="btn" onClick={() => setEdit(null)}>Hủy</button><button className="btn primary" onClick={async () => { const e = await saveProduct({ ...edit, price: parseMoney(price) }); if (e) { toast(e); return; } setEdit(null); toast('Đã lưu gói, ghi vào nhật ký'); }}>Lưu</button></>}>
        <div className="field"><label htmlFor="pN">Tên gói</label><input className="input" id="pN" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="pD">Mô tả ngắn</label><textarea className="input" id="pD" value={edit.desc} onChange={e => setEdit({ ...edit, desc: e.target.value })} /></div>
        <div className="field"><label htmlFor="pP">Giá (đồng)</label><input className="input num" id="pP" inputMode="numeric" value={price} onChange={e => setPrice(fmtMoneyInput(e.target.value))} /></div>
        <div className="field"><label htmlFor="pT">Thời hạn</label><input className="input" id="pT" value={edit.duration} onChange={e => setEdit({ ...edit, duration: e.target.value })} /></div>
        <label className="check"><input type="checkbox" checked={edit.active} onChange={e => setEdit({ ...edit, active: e.target.checked })} /><span>Đang bán</span></label></Sheet>}
    </div></AdminShell>
  );
}

/* ---------- SePay ---------- */
export function AdminSepayPage() {
  const settings = usePlatform(s => s.settings);
  const { toast } = useApp();
  const [s, setS] = useState(() => structuredClone(settings));
  const a = s.sepay.account;
  const check = () => {
    const ok = !!(a.bank && a.number && a.holder);
    const next = { ...s, sepay: { ...s.sepay, lastCheck: { at: new Date().toISOString(), ok, note: ok ? 'Đủ thông tin tài khoản nhận. Kiểm tra kết nối webhook thật ở giai đoạn 4.' : 'Thiếu thông tin tài khoản nhận.' } } };
    setS(next); void saveSettings(next, 'Kiểm tra kết nối SePay').then(e => e && toast(e)); toast(ok ? 'Thông tin đầy đủ' : 'Thiếu thông tin');
  };
  return (
    <AdminShell title="SePay"><div className="page" style={{ maxWidth: 820 }}>
      <div className="page-title"><div><div className="eyebrow">Cài đặt → Thanh toán</div><h1 style={{ marginTop: 4 }}>SePay</h1><p>Tài khoản nhận, quy tắc khớp, kiểm tra kết nối</p></div></div>
      <Banner kind="upd" icon="lock"><b>Khóa bí mật (API key, khóa webhook) không nhập ở đây.</b> Chúng chỉ nằm trong kho bí mật của máy chủ (giai đoạn 4); màn này chỉ hiện 4 ký tự cuối khi đã cài.</Banner>
      <section className="card card-pad stack"><h3>Môi trường</h3><Opts value={s.sepay.env} onChange={v => setS({ ...s, sepay: { ...s.sepay, env: v } })} items={[{ k: 'test', title: 'Thử nghiệm', note: 'Giao dịch thử, không mở quyền thật' }, { k: 'live', title: 'Thật', note: 'Chỉ bật khi đã chốt giá và kiểm thử xong' }]} /></section>
      <section className="card card-pad stack"><h3>Tài khoản ngân hàng nhận</h3>
        <div className="field"><label htmlFor="sB">Ngân hàng (mã theo SePay, ví dụ MBBank, Vietcombank, BIDV)</label><input className="input" id="sB" value={a.bank} onChange={e => setS({ ...s, sepay: { ...s.sepay, account: { ...a, bank: e.target.value } } })} /></div>
        <div className="field"><label htmlFor="sN">Số tài khoản</label><input className="input num" id="sN" value={a.number} onChange={e => setS({ ...s, sepay: { ...s.sepay, account: { ...a, number: e.target.value.replace(/\s/g, '') } } })} /></div>
        <div className="field"><label htmlFor="sH">Chủ tài khoản</label><input className="input" id="sH" style={{ textTransform: 'uppercase' }} value={a.holder} onChange={e => setS({ ...s, sepay: { ...s.sepay, account: { ...a, holder: e.target.value.toUpperCase() } } })} /></div>
        <label className="check"><input type="checkbox" checked={a.active} onChange={e => setS({ ...s, sepay: { ...s.sepay, account: { ...a, active: e.target.checked } } })} /><span>Đang nhận tiền (tắt để tạm dừng nhận)</span></label></section>
      <section className="card card-pad stack"><h3>Webhook & quy tắc khớp</h3><dl className="kv"><dt>Webhook URL</dt><dd className="num">{`${window.location.origin}/api/webhooks/sepay`} <span className="muted">(máy chủ, giai đoạn 4)</span></dd><dt>Quy tắc khớp</dt><dd>{s.sepay.matchRule}</dd><dt>Khóa webhook</dt><dd className="muted">Chưa cài — nằm ở kho bí mật máy chủ</dd>
        <dt>Kiểm tra gần nhất</dt><dd>{s.sepay.lastCheck ? `${fmtAt(s.sepay.lastCheck.at)} · ${s.sepay.lastCheck.note}` : 'Chưa kiểm tra'}</dd></dl></section>
      <section className="card card-pad stack"><h3>Hỗ trợ khách</h3>
        <div className="field"><label htmlFor="spP">Số điện thoại hỗ trợ</label><input className="input num" id="spP" value={s.support.phone} onChange={e => setS({ ...s, support: { ...s.support, phone: e.target.value } })} /></div>
        <div className="field"><label htmlFor="spZ">Zalo hỗ trợ</label><input className="input num" id="spZ" value={s.support.zalo} onChange={e => setS({ ...s, support: { ...s.support, zalo: e.target.value } })} /></div></section>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn primary" style={{ flex: 1 }} onClick={async () => { const e = await saveSettings(s, 'Lưu cài đặt SePay và hỗ trợ'); toast(e ?? 'Đã lưu, ghi vào nhật ký'); }}>Lưu</button><button className="btn" onClick={check}>Kiểm tra kết nối</button></div>
    </div></AdminShell>
  );
}

/* ---------- Giao dịch chưa khớp ---------- */
export function AdminUnmatchedPage() {
  const txs = usePlatform(s => s.txs);
  const { toast } = useApp();
  const [act, setAct] = useState<{ id: string; kind: 'assign' | 'refund' } | null>(null);
  const [code, setCode] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sim, setSim] = useState({ amount: '', content: '' });
  const L = txs.filter(t => t.status === 'unmatched');
  const done = async () => {
    const e = act!.kind === 'assign' ? await assignTx(act!.id, code, reason) : await refundTx(act!.id, reason);
    if (e) { setErr(e); return; }
    setAct(null); setCode(''); setReason(''); setErr(null); toast('Đã xử lý, ghi vào nhật ký');
  };
  return (
    <AdminShell title="Giao dịch chưa khớp"><div className="page">
      <div className="page-title"><div><h1>Giao dịch chưa khớp</h1><p>Thiếu, thừa tiền hoặc sai mã đơn — gán vào đơn đúng hoặc đánh dấu hoàn tiền</p></div></div>
      <section className="card">{L.length ? <div className="list">{L.map(t => (
        <div key={t.id} className="row"><div className="grow"><div className="title num">{money(t.amount)} · “{t.content}”</div><div className="meta"><span className="num">{t.providerTxId}</span><span>{fmtAt(t.at)}</span><span style={{ color: 'var(--danger)' }}>{t.reason}</span></div>
          <div className="acts"><button className="btn sm primary" onClick={() => setAct({ id: t.id, kind: 'assign' })}>Gán vào đơn</button><button className="btn sm" onClick={() => setAct({ id: t.id, kind: 'refund' })}>Đánh dấu hoàn tiền</button></div></div></div>
      ))}</div> : <div className="empty"><Icon n="check" c="lg" /><span>Không có giao dịch chưa khớp.</span></div>}</section>
      <details className="card card-pad"><summary style={{ cursor: 'pointer', fontWeight: 500 }}>Giả lập giao dịch báo về (chỉ bản chạy thử)</summary>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}><input className="input num" style={{ maxWidth: 180 }} inputMode="numeric" value={sim.amount} onChange={e => setSim({ ...sim, amount: fmtMoneyInput(e.target.value) })} placeholder="Số tiền" aria-label="Số tiền" />
          <input className="input" style={{ flex: 1, minWidth: 200 }} value={sim.content} onChange={e => setSim({ ...sim, content: e.target.value })} placeholder="Nội dung chuyển khoản" aria-label="Nội dung" />
          <button className="btn" onClick={async () => { const r = await simulateBankTx({ providerTxId: 'SIM-' + Date.now(), amount: parseMoney(sim.amount), content: sim.content }); toast(r.tx.status === 'matched' ? 'Đã khớp đơn' : `Kết quả: ${r.tx.reason ?? r.tx.status}`); }}>Gửi</button></div></details>
      {act && <Sheet title={act.kind === 'assign' ? 'Gán giao dịch vào đơn' : 'Đánh dấu hoàn tiền'} onClose={() => setAct(null)} foot={<><button className="btn" onClick={() => setAct(null)}>Hủy</button><button className="btn primary" onClick={done}>Xác nhận</button></>}>
        {act.kind === 'assign' && <div className="field"><label htmlFor="uCode">Mã đơn</label><input className="input num" id="uCode" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="DH…" /></div>}
        <div className="field"><label htmlFor="uR">Lý do (ghi vào nhật ký)</label><textarea className="input" id="uR" value={reason} onChange={e => setReason(e.target.value)} /></div><ErrorBanner err={err} /></Sheet>}
    </div></AdminShell>
  );
}

/* ---------- Nhật ký ---------- */
export function AdminAuditPage() {
  const audit = usePlatform(s => s.audit);
  const [q, setQ] = useState('');
  const L = audit.filter(a => `${a.actor} ${a.action} ${a.target} ${a.detail ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <AdminShell title="Nhật ký"><div className="page">
      <div className="page-title"><div><h1>Nhật ký</h1><p>Chỉ ghi thêm, không sửa: thao tác Admin, mở quyền, đổi giá, đổi cài đặt SePay</p></div></div>
      <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm trong nhật ký" aria-label="Tìm trong nhật ký" />
      <section className="card" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Lúc</th><th>Ai</th><th>Việc</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead>
        <tbody>{L.map(a => <tr key={a.id}><td>{fmtAt(a.at)}</td><td>{a.actor}</td><td>{a.action}</td><td>{a.target}</td><td>{a.detail ?? ''}</td></tr>)}{!L.length && <tr><td colSpan={5}><div className="empty">Chưa có.</div></td></tr>}</tbody></table></section>
    </div></AdminShell>
  );
}

/* ---------- S-ADM-01 / S-ADM-03 ---------- */
export function AdminVendorsPage() {
  const dir = usePlatform(s => s.directory);
  const { mobile, toast } = useApp();
  const nav = useNavigate();
  const [F, setF] = useState({ cat: 'all', status: 'all', q: '' });
  const [hide, setHide] = useState<DirVendor | null>(null);
  const L = dir.filter(v => (F.cat === 'all' || v.cats.includes(F.cat as VendorCat)) && (F.status === 'all' || (F.status === 'on' ? v.active : !v.active)) && `${v.name} ${v.address}`.toLowerCase().includes(F.q.toLowerCase()));
  const toggle = (v: DirVendor) => { if (v.active) setHide(v); else { void setVendorActive(v.id, true).then(e => e && toast(e)); toast(`Đã bật ${v.name}. Gợi ý liên quan tính lại khi gia đình mở.`); } };
  return (
    <AdminShell title="Danh bạ nhà cung cấp"><div className="page">
      <div className="page-title"><div><h1>Danh bạ nhà cung cấp</h1><p>Nguồn cho gợi ý “đúng + gần nhất” của mọi gia đình · {dir.filter(v => v.active).length} bên đang hoạt động</p></div>
        <div className="actions"><button className="btn primary" onClick={() => nav('/admin/nha-cung-cap/moi')}><Icon n="plus" c="sm" />Thêm nhà cung cấp</button></div></div>
      {mobile && <Banner kind="info">Trên điện thoại chỉ xem và bật/tắt. Thêm, sửa đầy đủ trên máy tính.</Banner>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="input" style={{ width: 'auto' }} value={F.cat} onChange={e => setF({ ...F, cat: e.target.value })} aria-label="Loại dịch vụ"><option value="all">Mọi loại dịch vụ</option>{CATS.map(k => <option key={k.k} value={k.k}>{k.name}</option>)}</select>
        <select className="input" style={{ width: 'auto' }} value={F.status} onChange={e => setF({ ...F, status: e.target.value })} aria-label="Trạng thái"><option value="all">Mọi trạng thái</option><option value="on">Đang hoạt động</option><option value="off">Đã ẩn</option></select>
        <input className="input" style={{ flex: 1, minWidth: 180 }} value={F.q} onChange={e => setF({ ...F, q: e.target.value })} placeholder="Tìm theo tên hoặc khu vực (địa chỉ)" aria-label="Tìm" /></div>
      {hide && <Banner kind="warn"><b>Ẩn {hide.name}?</b> Bên này sẽ không còn được gợi ý; các gợi ý đang dùng bên này sẽ được tính lại. Bên đã cam kết với gia đình không bị ảnh hưởng.
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><button className="btn sm danger" onClick={() => { void setVendorActive(hide.id, false).then(e => e && toast(e)); setHide(null); toast(`Đã ẩn ${hide.name}. Gợi ý liên quan đã tính lại.`); }}>Ẩn nhà cung cấp</button><button className="btn sm" onClick={() => setHide(null)}>Hủy</button></div></Banner>}
      {mobile ? <section className="card"><div className="list">{L.map(v => <div key={v.id} className="row"><div className="grow"><div className="title">{v.name}</div><div className="meta"><span>{v.cats.map(catName).join(', ')}</span>{v.cats.length > 1 && <span className="pill prio">Trọn gói</span>}{v.active ? <span className="pill done">Hoạt động</span> : <span className="pill skip">Đã ẩn</span>}</div></div><button className="btn sm" onClick={() => toggle(v)}>{v.active ? 'Ẩn' : 'Bật'}</button></div>)}{!L.length && <div className="empty">Chưa có nhà cung cấp.</div>}</div></section>
        : <section className="card" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Nhà cung cấp</th><th>Loại dịch vụ</th><th>Địa chỉ</th><th className="num">Bán kính phục vụ</th><th>Áp dụng</th><th>Trạng thái</th><th /></tr></thead>
          <tbody>{L.map(v => <tr key={v.id}><td><button className="btn ghost sm" style={{ padding: 0, minHeight: 0, fontWeight: 600 }} onClick={() => nav(`/admin/nha-cung-cap/${v.id}`)}>{v.name}</button><div className="muted num">{v.phone}</div></td>
            <td>{v.cats.map(catName).join(', ')}{v.cats.length > 1 && <> <span className="pill prio">Trọn gói</span></>}</td><td>{v.address || '—'}{!v.geo && <div style={{ color: 'var(--danger)' }}>Chưa có vị trí</div>}</td><td className="num">{v.radiusKm} km</td><td>{COND[v.cond]}</td>
            <td>{v.active ? <span className="pill done">Hoạt động</span> : <span className="pill skip">Đã ẩn</span>}</td><td><button className="btn sm" onClick={() => toggle(v)}>{v.active ? 'Ẩn' : 'Bật'}</button></td></tr>)}
            {!L.length && <tr><td colSpan={7}><div className="empty">{dir.length ? 'Không có nhà cung cấp nào khớp bộ lọc.' : 'Chưa có nhà cung cấp. Bấm “Thêm nhà cung cấp”.'}</div></td></tr>}</tbody></table></section>}
      <p className="note">Không có cổng để nhà cung cấp tự đăng ký, không quảng cáo, không đánh giá sao.</p>
    </div></AdminShell>
  );
}

/* ---------- S-ADM-02 ---------- */
export function AdminVendorEditPage() {
  const { vid = 'moi' } = useParams();
  const dir = usePlatform(s => s.directory);
  const nav = useNavigate();
  const { toast } = useApp();
  const orig = dir.find(v => v.id === vid);
  const isNew = vid === 'moi' || !orig;
  const [f, setF] = useState(() => ({ name: orig?.name ?? '', phone: orig?.phone ?? '', cats: orig?.cats ?? [] as VendorCat[], address: orig?.address ?? '', geo: fmtGeo(orig?.geo), radiusKm: orig?.radiusKm ?? 10, cond: orig?.cond ?? 'both' as VendorCond, active: orig?.active ?? true }));
  const [err, setErr] = useState<string | null>(null);
  const g = parseGeo(f.geo);
  const save = async () => {
    if (!f.name.trim()) return setErr('Cần ghi tên nhà cung cấp.');
    if (!f.cats.length) return setErr('Chọn ít nhất một loại dịch vụ.');
    if (!g) return setErr('Chưa có vị trí đúng. Nhập tọa độ “vĩ độ, kinh độ” (dán từ bản đồ).');
    const e = await saveVendor({ id: orig?.id ?? 'v' + Math.random().toString(36).slice(2, 9), name: f.name.trim(), phone: f.phone.trim(), cats: f.cats, address: f.address.trim(), geo: g, radiusKm: f.radiusKm, cond: f.cond, active: f.active, updatedAt: new Date().toISOString() }, isNew);
    if (e) return setErr(e);
    toast('Đã lưu. Gợi ý của các gia đình liên quan tính lại khi mở.'); nav('/admin/nha-cung-cap');
  };
  const form = (
    <section className="card card-pad stack">
      <div className="field"><label htmlFor="vN">Tên nhà cung cấp</label><input className="input" id="vN" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ví dụ: Đội nhạc lễ Hòa Bình" /></div>
      <div className="field"><label htmlFor="vP">Số điện thoại</label><input className="input num" id="vP" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
      <div className="field"><label>Loại dịch vụ (chọn nhiều nếu nhận trọn gói)</label><Chips items={CATS.map(k => k.name)} isOn={n => f.cats.includes(CATS.find(k => k.name === n)!.k)} onToggle={n => setF(x => ({ ...x, cats: toggleIn(x.cats, CATS.find(k => k.name === n)!.k) as VendorCat[] }))} />
        {f.cats.length > 1 && <span className="pill prio" style={{ alignSelf: 'flex-start' }}>Dịch vụ trọn gói · {f.cats.length} hạng mục</span>}</div>
      <div className="field"><label htmlFor="vA">Địa chỉ</label><input className="input" id="vA" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} placeholder="Số nhà, đường, phường/xã, quận/huyện" /></div>
      <div className="field"><label htmlFor="vG">Vị trí (vĩ độ, kinh độ)</label><input className="input num" id="vG" value={f.geo} onChange={e => setF({ ...f, geo: e.target.value })} placeholder="21.0285, 105.8542" />
        <p className="muted">{f.geo && !g ? 'Chưa đúng dạng — ví dụ 21.0285, 105.8542.' : 'Mở bản đồ, nhấn giữ đúng vị trí, sao chép tọa độ rồi dán vào đây. Giai đoạn 3 app tự tìm từ địa chỉ.'}</p></div>
      <div className="field"><label htmlFor="vR">Khu vực phục vụ: bán kính <b className="num">{f.radiusKm} km</b> quanh địa chỉ</label><input type="range" id="vR" min={2} max={40} value={f.radiusKm} onChange={e => setF({ ...f, radiusKm: Number(e.target.value) })} /></div>
      <div className="field"><label>Áp dụng cho</label><Opts value={f.cond} onChange={v => setF({ ...f, cond: v })} items={(Object.keys(COND) as VendorCond[]).map(k => ({ k, title: COND[k] }))} /></div>
      <label className="check"><input type="checkbox" checked={f.active} onChange={e => setF({ ...f, active: e.target.checked })} /><span>Đang hoạt động (được đưa vào gợi ý)</span></label>
      <ErrorBanner err={err} />
      <div style={{ display: 'flex', gap: 10 }}><button className="btn primary" style={{ flex: 1 }} onClick={save}>Lưu</button><button className="btn" onClick={() => nav('/admin/nha-cung-cap')}>Hủy</button></div>
    </section>
  );
  return (
    <AdminShell title="Nhà cung cấp" back="/admin/nha-cung-cap"><div className="page">
      <div className="page-title"><div><div className="eyebrow">Danh bạ nhà cung cấp</div><h1 style={{ marginTop: 4 }}>{isNew ? 'Thêm nhà cung cấp' : orig!.name}</h1></div></div>
      <div className="split">{form}<section className="card card-pad stack" style={{ gap: 8 }}><h3>Vị trí</h3>
        {g ? <><p className="num">{g.lat.toFixed(5)}, {g.lng.toFixed(5)} · bán kính {f.radiusKm} km</p><a className="btn sm" href={`https://www.google.com/maps/search/?api=1&query=${g.lat},${g.lng}`} target="_blank" rel="noreferrer" style={{ alignSelf: 'flex-start' }}><Icon n="pin" c="sm" />Xem trên bản đồ</a></> : <p className="muted">Chưa có vị trí.</p>}
        <p className="note">Bản đồ đặt ghim trực tiếp mở ở giai đoạn 3 khi chốt dịch vụ bản đồ.</p></section></div>
    </div></AdminShell>
  );
}
