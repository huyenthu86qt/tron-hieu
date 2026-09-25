// S-HOME-01 Trang chủ · S-X-01 Thông báo · S-ACC-01 Tài khoản
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CaseData } from '../domain/types';
import { visibleTasks, STATUS_LABEL } from '../domain/model';
import { money, METHOD_LABEL, EXP_STATUS } from '../domain/finance';
import { fmtPhone, isFull, ORDER_STATUS_LABEL, readiness } from '../domain/platform';
import { DN_TEXT } from '../domain/text';
import { repo } from '../repo/repo';
import {
  changePassword, changePhone, logout, logoutAll, markRead, myPreNeeds, requestDeleteAccount, sendOtp, updateProfile, usePlatform, useUser,
} from '../repo/platformStore';
import { Icon } from '../ui/Icon';
import { Banner, ErrorBanner, Sheet, useApp } from '../ui/common';
import { AccountShell, useMyCases } from './AccountShell';

const fmtAt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

export function HomePage() {
  const user = useUser()!;
  const nav = useNavigate();
  const cases = useMyCases();
  const all = usePlatform(s => s.preNeeds);
  const pres = myPreNeeds(all, user.id, user.phone);
  return (
    <AccountShell title="Trang chủ">
      <div className="page">
        <div className="page-title"><div><h1>Chào {user.name}</h1><p>Những hồ sơ anh/chị đang có</p></div>
          <div className="actions"><button className="btn primary" onClick={() => nav('/')}><Icon n="plus" c="sm" />Bắt đầu đám hiếu mới</button></div></div>
        <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Đám hiếu đang lo</h3><span className="muted">{cases?.length ?? 0}</span></div>
          {cases === null ? <p className="muted card-pad">Đang tải…</p> : cases.length ? <div className="list">{cases.map(c => {
            const open = visibleTasks(c).filter(t => t.status !== 'done' && t.status !== 'skip').length;
            return (
              <button key={c.id} className="row" onClick={() => nav(`/dh/${c.id}`)}><span className="num-badge"><Icon n="lotus" c="sm" /></span>
                <div className="grow"><div className="title">Đám hiếu {DN_TEXT(c)}</div>
                  <div className="meta">{isFull(c) ? <span className="pill done">Đã mở đầy đủ</span> : <span className="pill soft">Miễn phí</span>}
                    {c.after?.closed ? <span className="pill done">Đã khép phần tức thời</span> : <span>{open} việc chưa xong</span>}
                    {c.ownerId !== user.id && <span>Anh/chị là thành viên</span>}</div></div>
                <Icon n="chev" c="chev" /></button>
            );
          })}</div> : <div className="empty"><span>Chưa có đám hiếu nào.</span></div>}</section>
        <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Hồ sơ chuẩn bị</h3><button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => nav('/chuan-bi/moi')}><Icon n="plus" c="sm" />Tạo hồ sơ</button></div>
          {pres.length ? <div className="list">{pres.map(p => (
            <button key={p.id} className="row" onClick={() => nav(`/chuan-bi/${p.id}`)}><span className="num-badge"><Icon n="doc" c="sm" /></span>
              <div className="grow"><div className="title">{p.subject.name ? `${p.subject.title} ${p.subject.name}` : 'Hồ sơ chưa đặt tên'}</div>
                <div className="meta"><span>Sẵn sàng {readiness(p)}%</span>{p.caseId ? <span className="pill done">Đã kích hoạt</span> : p.paid ? <span className="pill doing">Đã mở gói</span> : <span className="pill soft">Miễn phí</span>}</div></div>
              <Icon n="chev" c="chev" /></button>
          ))}</div> : <p className="muted" style={{ padding: '0 16px 14px' }}>Chuẩn bị dần khi còn thời gian — để lúc cần, gia đình không phải quyết lại từ đầu.</p>}</section>
      </div>
    </AccountShell>
  );
}

export function NotificationsPage() {
  const cases = useMyCases();
  const readUntil = usePlatform(s => s.readUntil);
  const nav = useNavigate();
  const items = (cases ?? []).flatMap(c => c.history.map(h => ({ c, h }))).sort((a, b) => b.h.at.localeCompare(a.h.at)).slice(0, 40);
  useEffect(() => () => markRead(), []);
  return (
    <AccountShell title="Thông báo">
      <div className="page" style={{ maxWidth: 820 }}>
        <div className="page-title"><div><h1>Thông báo</h1><p>Việc mới giao, quyết định đã chốt, thay đổi trong các đám hiếu của anh/chị</p></div></div>
        <section className="card">{items.length ? <div className="list">{items.map(({ c, h }, i) => (
          <button key={i} className="row" onClick={() => nav(h.taskId ? `/dh/${c.id}/viec/${h.taskId}` : `/dh/${c.id}`)}>
            <span className="num-badge" style={!readUntil || h.at > readUntil ? { background: 'var(--accent-soft)', color: 'var(--warning)' } : undefined}><Icon n="bell" c="sm" /></span>
            <div className="grow"><div className="title">{h.text}</div><div className="meta"><span>Đám hiếu {DN_TEXT(c)}</span><span>{fmtAt(h.at)}</span></div></div></button>
        ))}</div> : <div className="empty"><Icon n="bell" c="lg" /><span>Chưa có thông báo.</span></div>}</section>
        <p className="note">Giai đoạn này thông báo hiện trong app. Gửi qua tin nhắn / Zalo mở ở giai đoạn sau.</p>
      </div>
    </AccountShell>
  );
}

/* ---------- Xuất dữ liệu một đám hiếu (việc, chi tiêu, sổ phúng viếng) ---------- */
function csv(rows: (string | number)[][]) {
  return rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
}
export function exportCase(c: CaseData) {
  const tasks = visibleTasks(c).map(t => [t.phase, t.title, t.due, STATUS_LABEL[t.status], c.members.find(m => m.id === t.owner)?.name ?? '', t.area]);
  const ex = (c.finance?.expenses ?? []).map(e => [e.name, e.amount, e.paid, EXP_STATUS[e.status][1], e.method ? METHOD_LABEL[e.method] : '', c.members.find(m => m.id === e.payer)?.name ?? '']);
  const led = (c.ledger ?? []).map(g => [g.name, g.group ?? '', g.amount, METHOD_LABEL[g.method], g.gifts.join('; '), g.by, fmtAt(g.at)]);
  const text = '﻿' + [
    `Đám hiếu ${DN_TEXT(c)} — xuất lúc ${fmtAt(new Date().toISOString())}`, '',
    'VIỆC', csv([['Chặng', 'Việc', 'Hạn', 'Trạng thái', 'Người phụ trách', 'Vùng'], ...tasks]), '',
    'CHI TIÊU', csv([['Khoản', 'Số tiền', 'Đã trả', 'Trạng thái', 'Hình thức', 'Người chi'], ...ex]), '',
    'SỔ PHÚNG VIẾNG', csv([['Người / đoàn', 'Nhóm', 'Số tiền', 'Hình thức', 'Lễ vật', 'Người ghi', 'Lúc'], ...led]),
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  a.download = `dam-hieu-${c.id}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function AccountPage() {
  const user = useUser()!;
  const nav = useNavigate();
  const { toast } = useApp();
  const cases = useMyCases();
  const orders = usePlatform(s => s.orders);
  const support = usePlatform(s => s.settings.support);
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ old: '', next: '' });
  const [err, setErr] = useState<Record<string, string | null>>({});
  const [phoneSheet, setPhoneSheet] = useState(false);
  const [delCase, setDelCase] = useState<string | null>(null);
  const mine = orders.filter(o => o.userId === user.id);
  const owned = (cases ?? []).filter(c => c.ownerId === user.id);

  return (
    <AccountShell title="Tài khoản">
      <div className="page" style={{ maxWidth: 860 }}>
        <div className="page-title"><div><h1>Tài khoản</h1><p>Hồ sơ, bảo mật, gói & thanh toán, dữ liệu, hỗ trợ</p></div></div>
        {user.deleteRequestedAt && <Banner kind="warn">Đã yêu cầu xóa tài khoản lúc {fmtAt(user.deleteRequestedAt)}. Tài khoản sẽ được xóa sau 7 ngày. <button className="btn sm" onClick={() => { requestDeleteAccount(true); toast('Đã hủy yêu cầu xóa tài khoản'); }}>Hủy yêu cầu</button></Banner>}

        <section className="card card-pad stack"><h3>Hồ sơ</h3>
          <div className="field"><label htmlFor="accName">Họ tên</label><div style={{ display: 'flex', gap: 8 }}><input className="input" id="accName" value={name} onChange={e => setName(e.target.value)} />
            <button className="btn" onClick={async () => { const e = await updateProfile(name); setErr({ ...err, name: e }); if (!e) toast('Đã lưu họ tên'); }}>Lưu</button></div></div>
          <ErrorBanner err={err.name} />
          <dl className="kv"><dt>Số điện thoại</dt><dd className="num">{fmtPhone(user.phone)} <button className="btn sm ghost" onClick={() => setPhoneSheet(true)}>Đổi số</button></dd><dt>Tạo lúc</dt><dd>{fmtAt(user.createdAt)}</dd></dl>
        </section>

        <section className="card card-pad stack"><h3>Bảo mật</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            <div className="field"><label htmlFor="pwOld">Mật khẩu hiện tại</label><input className="input" id="pwOld" type="password" autoComplete="current-password" value={pw.old} onChange={e => setPw({ ...pw, old: e.target.value })} /></div>
            <div className="field"><label htmlFor="pwNew">Mật khẩu mới</label><input className="input" id="pwNew" type="password" autoComplete="new-password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></div>
          </div>
          <ErrorBanner err={err.pw} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={async () => { const e = await changePassword(pw.old, pw.next); setErr({ ...err, pw: e }); if (!e) { setPw({ old: '', next: '' }); toast('Đã đổi mật khẩu'); } }}>Đổi mật khẩu</button>
            <button className="btn ghost" onClick={() => { logout(); nav('/'); }}>Đăng xuất</button>
            <button className="btn ghost" onClick={() => { logoutAll(); nav('/dang-nhap'); }}>Đăng xuất khỏi mọi thiết bị</button>
          </div>
        </section>

        <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Gói & thanh toán</h3></div>
          <div className="list">{owned.map(c => (
            <div key={c.id} className="row"><div className="grow"><div className="title">Đám hiếu {DN_TEXT(c)}</div>
              <div className="meta">{isFull(c) ? <span className="pill done">Đã mở đầy đủ{c.access?.activeUntil ? ' · đến ' + new Date(c.access.activeUntil).toLocaleDateString('vi-VN') : ''}</span>
                : mine.some(o => o.target.id === c.id && o.status === 'pending') ? <span className="pill wait">Chờ thanh toán</span> : <span className="pill soft">Miễn phí</span>}</div></div>
              {!isFull(c) && <button className="btn sm" onClick={() => nav(`/checkout?goi=full&dh=${c.id}&ve=${encodeURIComponent('/dh/' + c.id)}`)}>Mở đầy đủ</button>}</div>
          ))}</div>
          <div className="card-pad" style={{ paddingTop: 8 }}><div className="eyebrow" style={{ marginBottom: 6 }}>Lịch sử đơn hàng</div>
            {mine.length ? <div style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Mã đơn</th><th>Gói</th><th>Áp dụng cho</th><th className="num">Số tiền</th><th>Trạng thái</th><th>Lúc tạo</th></tr></thead>
              <tbody>{mine.map(o => <tr key={o.id}><td className="num"><Link to={`/checkout/don/${o.code}`}>{o.code}</Link></td><td>{o.productName}</td><td>{o.target.name}</td><td className="num">{money(o.amount)}</td>
                <td><span className={'pill ' + ORDER_STATUS_LABEL[o.status][0]}>{ORDER_STATUS_LABEL[o.status][1]}</span></td><td>{fmtAt(o.createdAt)}</td></tr>)}</tbody></table></div>
              : <p className="muted">Chưa có đơn hàng.</p>}</div>
        </section>

        <section className="card card-pad stack"><h3>Dữ liệu</h3>
          <p className="muted">Xuất danh sách việc, chi tiêu và sổ phúng viếng của một đám hiếu (tệp CSV mở được bằng Excel).</p>
          {owned.map(c => <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><span style={{ flex: 1, minWidth: 180 }}>Đám hiếu {DN_TEXT(c)}</span>
            <button className="btn sm" onClick={() => exportCase(c)}><Icon n="doc" c="sm" />Xuất dữ liệu</button>
            {c.deleteRequestedAt
              ? <button className="btn sm ghost" onClick={async () => { const x = await repo.get(c.id); if (x) { x.deleteRequestedAt = undefined; await repo.save(x); } toast('Đã hủy yêu cầu xóa'); nav(0); }}>Hủy yêu cầu xóa</button>
              : <button className="btn sm ghost" style={{ color: 'var(--danger)' }} onClick={() => setDelCase(c.id)}>Yêu cầu xóa</button>}</div>)}
          {!user.deleteRequestedAt && <button className="btn ghost" style={{ alignSelf: 'flex-start', color: 'var(--danger)' }} onClick={() => { if (window.confirm('Yêu cầu xóa tài khoản? Tài khoản và dữ liệu sẽ bị xóa sau 7 ngày; trong thời gian này anh/chị có thể hủy.')) { requestDeleteAccount(); toast('Đã ghi nhận yêu cầu xóa tài khoản'); } }}>Yêu cầu xóa tài khoản</button>}
        </section>

        <section className="card card-pad stack"><h3>Hỗ trợ</h3>
          {support.phone || support.zalo ? <dl className="kv">{support.phone && <><dt>Điện thoại</dt><dd className="num">{support.phone}</dd></>}{support.zalo && <><dt>Zalo</dt><dd className="num">{support.zalo}</dd></>}</dl>
            : <p className="muted">Số hỗ trợ sẽ được đội vận hành cập nhật.</p>}
          <p className="muted">Khi cần hỗ trợ về thanh toán, gửi kèm mã đơn (ví dụ DH7KQ2XA).</p>
          <p><Link to="/dieu-khoan">Điều khoản sử dụng</Link> · <Link to="/bao-mat">Chính sách bảo mật</Link></p>
        </section>
      </div>
      {phoneSheet && <PhoneSheet onClose={() => setPhoneSheet(false)} />}
      {delCase && <Sheet title="Yêu cầu xóa đám hiếu" onClose={() => setDelCase(null)} foot={<><button className="btn" onClick={() => setDelCase(null)}>Hủy</button>
        <button className="btn danger" onClick={async () => { const c = await repo.get(delCase); if (c) { c.deleteRequestedAt = new Date().toISOString(); await repo.save(c); } setDelCase(null); toast('Đã ghi nhận — đám hiếu sẽ bị xóa sau 7 ngày'); nav(0); }}>Yêu cầu xóa</button></>}>
        <Banner kind="warn">Đám hiếu, danh sách việc, chi tiêu, sổ phúng viếng sẽ bị xóa sau 7 ngày. Nên <b>xuất dữ liệu</b> trước. Trong 7 ngày có thể hủy yêu cầu.</Banner>
      </Sheet>}
    </AccountShell>
  );
}

function PhoneSheet({ onClose }: { onClose: () => void }) {
  const { toast } = useApp();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const otp = usePlatform(s => s.otp);
  return (
    <Sheet title="Đổi số điện thoại" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Hủy</button>
      {sent ? <button className="btn primary" onClick={() => { const e = changePhone(phone, code); if (e) setErr(e); else { toast('Đã đổi số điện thoại'); onClose(); } }}>Xác nhận</button>
        : <button className="btn primary" onClick={() => { const r = sendOtp(phone, 'phone'); if (r.error) setErr(r.error); else { setErr(null); setSent(true); } }}>Gửi mã</button>}</>}>
      <div className="field"><label htmlFor="npPhone">Số điện thoại mới</label><input className="input num" id="npPhone" inputMode="tel" value={phone} disabled={sent} onChange={e => setPhone(e.target.value)} /></div>
      {sent && <>
        {otp && <div className="banner upd"><Icon n="alert" /><div><b>Bản chạy thử:</b> mã là <b className="num">{otp.code}</b>.</div></div>}
        <div className="field"><label htmlFor="npCode">Mã xác minh</label><input className="input num" id="npCode" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></div>
      </>}
      <ErrorBanner err={err} />
    </Sheet>
  );
}
