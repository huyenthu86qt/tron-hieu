// S-HOME-01 Trang chủ · S-X-01 Thông báo · S-ACC-01 Tài khoản
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CaseData } from '../domain/types';
import { findTask, nowTasks, pendingDecisions, visibleTasks, STATUS_LABEL } from '../domain/model';
import { money, METHOD_LABEL, EXP_STATUS } from '../domain/finance';
import { fmtPhone, isFull, SUPPORT, ORDER_STATUS_LABEL, readiness } from '../domain/platform';
import { DN_TEXT } from '../domain/text';
import { repo } from '../repo/repo';
import { REMOTE } from '../repo/backend';
import { BinhAnHomeCard } from './BinhAnPages';
import { bellOn, isMindful, playMindfulBell, setBellOn } from '../ui/bell';
import { milestoneList } from '../domain/aftercare';
import {
  changePassword, changePhoneSelf, linkGoogle, logout, logoutAll, markRead, myPreNeeds, requestDeleteAccount, updateProfile, usePlatform, useUser,
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
  const pres = myPreNeeds(all, user.id);
  return (
    <AccountShell title="Trang chủ">
      <div className="page">
        <div className="page-title"><div><h1>Chào {user.name}</h1><p>Những hồ sơ anh/chị đang có</p></div>
          <div className="actions"><button className="btn primary" onClick={() => nav('/')}><Icon n="plus" c="sm" />Bắt đầu đám hiếu mới</button></div></div>
        {cases && <UpcomingRemembrance cases={cases} />}
        <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Đám hiếu đang lo</h3><span className="muted">{cases?.length ?? 0}</span></div>
          {cases === null ? <p className="muted card-pad">Đang tải…</p> : cases.length ? <div className="list">{cases.map(c => {
            // Chỉ nói việc của lúc này — tổng cả 15 chặng (“49 việc chưa xong”) làm người đang có tang thấy ngợp
            const now = nowTasks(c).filter(t => t.status !== 'done' && t.status !== 'skip').length, dec = pendingDecisions(c).length;
            return (
              <button key={c.id} className="row" onClick={() => nav(`/dh/${c.id}`)}><span className="num-badge"><Icon n="lotus" c="sm" /></span>
                <div className="grow"><div className="title">Đám hiếu {DN_TEXT(c)}</div>
                  <div className="meta">{isFull(c) ? <span className="pill done">Đã mở đầy đủ</span> : <span className="pill soft">Miễn phí</span>}
                    {c.after?.closed ? <span className="pill done">Đã khép phần tức thời</span> : <span>{now ? `Bây giờ: ${now} việc` : 'Không có việc gấp'}{dec ? ` · ${dec} điều cần quyết` : ''}</span>}
                    {c.ownerId !== user.id && <span>Anh/chị là thành viên</span>}</div></div>
                <Icon n="chev" c="chev" /></button>
            );
          })}</div> : <div className="empty"><span>Chưa có đám hiếu nào.</span></div>}</section>
        {/* Đang có tang (đám hiếu chưa khép) thì không mời “chuẩn bị trước” — dễ chạnh lòng; ai đã có hồ sơ vẫn thấy */}
        {(pres.length > 0 || !(cases ?? []).some(c => !c.after?.closed)) && <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Hồ sơ chuẩn bị</h3><button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => nav('/chuan-bi/moi')}><Icon n="plus" c="sm" />Tạo hồ sơ</button></div>
          {pres.length ? <div className="list">{pres.map(p => (
            <button key={p.id} className="row" onClick={() => nav(`/chuan-bi/${p.id}`)}><span className="num-badge"><Icon n="doc" c="sm" /></span>
              <div className="grow"><div className="title">{p.subject.name ? `${[p.subject.title, p.subject.name].filter(Boolean).join(' ')}` : 'Hồ sơ chưa đặt tên'}</div>
                <div className="meta"><span>Sẵn sàng {readiness(p)}%</span>{p.caseId ? <span className="pill done">Đã kích hoạt</span> : p.paid ? <span className="pill doing">Đã mở gói</span> : <span className="pill soft">Miễn phí</span>}</div></div>
              <Icon n="chev" c="chev" /></button>
          ))}</div> : <p className="muted" style={{ padding: '0 16px 14px' }}>Chuẩn bị dần khi còn thời gian — để lúc cần, gia đình không phải quyết lại từ đầu.</p>}</section>}
        <BinhAnHomeCard />
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
          <button key={i} className={isMindful(h) ? 'row mindful' : 'row'} onClick={() => nav(h.taskId ? `/dh/${c.id}/viec/${h.taskId}` : h.path ? `/dh/${c.id}/${h.path}${isMindful(h) ? '?lang=1' : ''}` : `/dh/${c.id}`)}>
            <span className="num-badge" style={!readUntil || h.at > readUntil ? { background: 'var(--accent-soft)', color: 'var(--warning)' } : undefined}><Icon n={isMindful(h) ? 'candle' : 'bell'} c="sm" /></span>
            <div className="grow"><div className="title">{h.text}</div>{h.taskId && findTask(c, h.taskId) && <div className="meta"><span>Việc: {findTask(c, h.taskId)!.title}</span></div>}<div className="meta"><span>Đám hiếu {DN_TEXT(c)}</span><span>{fmtAt(h.at)}</span></div></div></button>
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
function download(name: string, content: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Bảng tính (mở bằng Excel): việc, chi tiêu, sổ phúng viếng. Luôn lấy bản đầy đủ mới nhất. */
export async function exportCase(summary: CaseData) {
  const c = (await repo.get(summary.id)) ?? summary;
  const tasks = visibleTasks(c).map(t => [t.phase, t.title, t.due, STATUS_LABEL[t.status], c.members.find(m => m.id === t.owner)?.name ?? '', t.area]);
  const ex = (c.finance?.expenses ?? []).map(e => [e.name, e.amount, e.paid, EXP_STATUS[e.status][1], e.method ? METHOD_LABEL[e.method] : '', c.members.find(m => m.id === e.payer)?.name ?? '']);
  const led = (c.ledger ?? []).map(g => [g.name, g.group ?? '', g.amount, METHOD_LABEL[g.method], g.gifts.join('; '), g.by, fmtAt(g.at)]);
  const text = '﻿' + [
    `Đám hiếu ${DN_TEXT(c)} — xuất lúc ${fmtAt(new Date().toISOString())}`, '',
    'VIỆC', csv([['Chặng', 'Việc', 'Hạn', 'Trạng thái', 'Người phụ trách', 'Vùng'], ...tasks]), '',
    'CHI TIÊU', csv([['Khoản', 'Số tiền', 'Đã trả', 'Trạng thái', 'Hình thức', 'Người chi'], ...ex]), '',
    'SỔ PHÚNG VIẾNG', csv([['Người / đoàn', 'Nhóm', 'Số tiền', 'Hình thức', 'Lễ vật', 'Người ghi', 'Lúc'], ...led]),
  ].join('\r\n');
  download(`dam-hieu-${c.id}.csv`, text, 'text/csv;charset=utf-8');
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
const table = (head: string[], rows: unknown[][]) => rows.length
  ? `<table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  : '<p class="muted">Không có.</p>';

/** Bản lưu đọc được và in được (mở bằng trình duyệt → In → Lưu PDF): toàn bộ đám hiếu để gia đình giữ lại. */
export async function exportCaseDoc(summary: CaseData) {
  const c = (await repo.get(summary.id)) ?? summary;
  const name = (id: string | null | undefined) => c.members.find(m => m.id === id)?.name ?? '';
  const p = c.person;
  const tasks = visibleTasks(c);
  const exps = c.finance?.expenses ?? [];
  const led = c.ledger ?? [];
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Đám hiếu ${esc(DN_TEXT(c))}</title>
<style>body{font-family:"Be Vietnam Pro",system-ui,sans-serif;color:#2B2622;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.5}
h1{font-family:"Noto Serif",Georgia,serif;font-size:26px;margin:0}h2{font-family:"Noto Serif",Georgia,serif;font-size:19px;border-bottom:2px solid #B8893E;padding-bottom:4px;margin-top:28px}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #E3DBD0;padding:5px 7px;text-align:left;vertical-align:top}th{background:#F1EBE1}
.muted{color:#6E655C}.kv td:first-child{width:180px;color:#6E655C}@media print{h2{break-after:avoid}tr{break-inside:avoid}}</style></head><body>
<p class="muted">TRỌN HIẾU · Bản lưu đám hiếu · xuất lúc ${esc(fmtAt(new Date().toISOString()))}</p>
<h1>Đám hiếu ${esc(DN_TEXT(c))}</h1>
<h2>Người đã khuất</h2>
<table class="kv"><tbody>
<tr><td>Họ tên</td><td>${esc(`${[p.title, p.name].filter(Boolean).join(' ')}`)}${p.saint ? ` (${esc(p.saint)})` : ''}</td></tr>
<tr><td>Năm sinh</td><td>${esc(p.birthYear)}</td></tr><tr><td>Ngày mất</td><td>${esc(p.death)} ${esc(p.time)}</td></tr><tr><td>Quê quán</td><td>${esc(p.hometown)}</td></tr>
</tbody></table>
<h2>Đội đám hiếu</h2>
${table(['Họ tên', 'Quan hệ', 'Vai trò', 'Vùng trách nhiệm'], c.members.map(m => [m.name, m.rel, m.id === 'u1' ? 'Người đại diện gia đình' : m.role, m.areas.join(', ')]))}
<h2>Việc (${tasks.filter(t => t.status === 'done').length}/${tasks.length} đã xong)</h2>
${table(['Chặng', 'Việc', 'Hạn', 'Trạng thái', 'Người phụ trách'], tasks.map(t => [t.phase, t.title, t.due, STATUS_LABEL[t.status], name(t.owner)]))}
<h2>Chi tiêu · tổng ${esc(money(sum(exps.map(e => e.amount))))}, đã trả ${esc(money(sum(exps.map(e => e.paid))))}</h2>
${table(['Khoản', 'Số tiền', 'Đã trả', 'Trạng thái', 'Hình thức', 'Người chi', 'Chứng từ'], exps.map(e => [e.name, money(e.amount), money(e.paid), EXP_STATUS[e.status][1], e.method ? METHOD_LABEL[e.method] : '', name(e.payer), e.evidence ?? '']))}
<h2>Sổ phúng viếng · ${led.length} lượt${led.some(g => g.amount) ? ` · tổng ${esc(money(sum(led.map(g => g.amount))))}` : ''}</h2>
${table(['Người / đoàn', 'Số tiền', 'Hình thức', 'Lễ vật', 'Người ghi', 'Lúc'], led.map(g => [g.name, g.amount ? money(g.amount) : '', METHOD_LABEL[g.method], g.gifts.join('; '), g.by, fmtAt(g.at)]))}
<h2>Tài liệu</h2>
${table(['Tên tệp', 'Nguồn', 'Lúc'], (c.docs ?? []).map(d => [d.name, d.source === 'pre' ? 'Hồ sơ chuẩn bị' : d.source === 'after' ? 'Hậu tang' : 'Gia đình tải lên', fmtAt(d.at)]))}
<p class="muted">Tệp gốc (ảnh, giấy tờ) mở và tải ở mục Tài liệu trong app.</p>
<h2>Lịch sử</h2>
${table(['Lúc', 'Nội dung'], [...c.history].reverse().map(h => [fmtAt(h.at), h.text]))}
</body></html>`;
  download(`ban-luu-dam-hieu-${c.id}.html`, html, 'text/html;charset=utf-8');
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
  const auth = usePlatform(s => s.auth);
  // Tài khoản vào bằng Google (không có mật khẩu) thì không có mục đổi mật khẩu
  const pwAllowed = !REMOTE || !!auth?.loginByPhone;
  const [err, setErr] = useState<Record<string, string | null>>({});
  const [phoneSheet, setPhoneSheet] = useState(false);
  const [delCase, setDelCase] = useState<string | null>(null);
  const [delAcct, setDelAcct] = useState(false);
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
          {REMOTE && <GoogleLink />}
          {pwAllowed && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            <div className="field"><label htmlFor="pwOld">Mật khẩu hiện tại</label><input className="input" id="pwOld" type="password" autoComplete="current-password" value={pw.old} onChange={e => setPw({ ...pw, old: e.target.value })} /></div>
            <div className="field"><label htmlFor="pwNew">Mật khẩu mới</label><input className="input" id="pwNew" type="password" autoComplete="new-password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></div>
          </div>}
          <ErrorBanner err={err.pw} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pwAllowed && <button className="btn" onClick={async () => { const e = await changePassword(pw.old, pw.next); setErr({ ...err, pw: e }); if (!e) { setPw({ old: '', next: '' }); toast('Đã đổi mật khẩu'); } }}>Đổi mật khẩu</button>}
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

        <MindfulSetting />

        <section className="card card-pad stack"><h3>Dữ liệu</h3>
          <p className="muted"><b>Bản lưu</b>: toàn bộ đám hiếu (người đã khuất, đội, việc, chi tiêu, sổ phúng viếng, tài liệu, lịch sử) — mở bằng trình duyệt, bấm In → Lưu PDF để giữ lâu dài. <b>Bảng tính</b>: mở bằng Excel.</p>
          {owned.map(c => <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><span style={{ flex: 1, minWidth: 180 }}>Đám hiếu {DN_TEXT(c)}</span>
            <button className="btn sm" onClick={() => void exportCaseDoc(c)}><Icon n="doc" c="sm" />Tải bản lưu (in được)</button>
            <button className="btn sm ghost" onClick={() => void exportCase(c)}>Bảng tính Excel</button>
            {c.deleteRequestedAt
              ? <button className="btn sm ghost" onClick={async () => { const x = await repo.get(c.id); if (x) { x.deleteRequestedAt = undefined; await repo.save(x); } toast('Đã hủy yêu cầu xóa'); nav(0); }}>Hủy yêu cầu xóa</button>
              : <button className="btn sm ghost" style={{ color: 'var(--danger)' }} onClick={() => setDelCase(c.id)}>Yêu cầu xóa</button>}</div>)}
          {!user.deleteRequestedAt && <button className="btn ghost" style={{ alignSelf: 'flex-start', color: 'var(--danger)' }} onClick={() => setDelAcct(true)}>Yêu cầu xóa tài khoản</button>}
        </section>

        <section className="card card-pad stack"><h3>Hỗ trợ</h3>
          {(() => { const ph = (support.phone || SUPPORT.phone).replace(/\D/g, ''), zl = (support.zalo || support.phone || SUPPORT.phone).replace(/\D/g, ''); return <>
            <p>Liên hệ <b>{SUPPORT.name}</b> — <span className="num">{fmtPhone(ph)}</span></p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><a className="btn primary" href={`tel:${ph}`}>Gọi {SUPPORT.name}</a><a className="btn" href={`https://zalo.me/${zl}`} target="_blank" rel="noreferrer">Nhắn Zalo</a></div></>; })()}
          <p className="muted">Khi cần hỗ trợ về thanh toán, gửi kèm mã đơn (ví dụ DH7KQ2XA).</p>
          <p><Link to="/dieu-khoan">Điều khoản sử dụng</Link> · <Link to="/bao-mat">Chính sách bảo mật</Link></p>
        </section>
      </div>
      {phoneSheet && <PhoneSheet onClose={() => setPhoneSheet(false)} />}
      {delAcct && <DeleteAccountSheet owned={owned} onClose={() => setDelAcct(false)} />}
      {delCase && <Sheet title="Yêu cầu xóa đám hiếu" onClose={() => setDelCase(null)} foot={<><button className="btn" onClick={() => setDelCase(null)}>Hủy</button>
        <button className="btn danger" onClick={async () => { const c = await repo.get(delCase); if (c) { c.deleteRequestedAt = new Date().toISOString(); await repo.save(c); } setDelCase(null); toast('Đã ghi nhận — đám hiếu sẽ bị xóa sau 7 ngày'); nav(0); }}>Yêu cầu xóa</button></>}>
        <Banner kind="warn">Đám hiếu, danh sách việc, chi tiêu, sổ phúng viếng sẽ bị xóa sau 7 ngày. Nên <b>xuất dữ liệu</b> trước. Trong 7 ngày có thể hủy yêu cầu.</Banner>
      </Sheet>}
    </AccountShell>
  );
}

function PhoneSheet({ onClose }: { onClose: () => void }) {
  const { toast } = useApp();
  const auth = usePlatform(s => s.auth);
  const needPass = !REMOTE || !!auth?.loginByPhone;
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const e = await changePhoneSelf(phone, pass);
    setBusy(false);
    if (e) setErr(e); else { toast('Đã đổi số điện thoại'); onClose(); }
  };
  return (
    <Sheet title="Đổi số điện thoại" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn primary" disabled={busy} onClick={save}>Lưu số mới</button></>}>
      <div className="field"><label htmlFor="npPhone">Số điện thoại mới</label><input className="input num" id="npPhone" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
      {needPass && <div className="field"><label htmlFor="npPass">Mật khẩu hiện tại</label><input className="input" id="npPass" type="password" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} />
        <p className="muted">Từ nay anh/chị đăng nhập bằng số mới với mật khẩu này.</p></div>}
      <ErrorBanner err={err} />
    </Sheet>
  );
}

/** Liên kết Google để lỡ quên mật khẩu vẫn vào lại được */
function GoogleLink() {
  const auth = usePlatform(s => s.auth);
  const user = useUser()!;
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!auth) return null;
  if (!auth.loginByPhone) return <p className="muted"><Icon n="check" c="sm" /> Anh/chị đăng nhập bằng Google{user.email ? <> (<b>{user.email}</b>)</> : null} — không cần nhớ mật khẩu.</p>;
  if (auth.google) return <p className="muted"><Icon n="check" c="sm" /> Đã liên kết Google. Lỡ quên mật khẩu, anh/chị bấm “Tiếp tục với Google” ở màn đăng nhập là vào được.</p>;
  return (
    <div className="stack" style={{ gap: 8 }}>
      <Banner kind="upd" icon="lock"><b>Nên liên kết Google.</b> Lỡ quên mật khẩu, anh/chị bấm “Tiếp tục với Google” là vào lại được ngay, không cần gọi hỗ trợ.</Banner>
      <button className="btn" style={{ alignSelf: 'flex-start' }} disabled={busy} onClick={async () => { setBusy(true); const e = await linkGoogle(); if (e) { setErr(e); setBusy(false); } }}>{busy ? 'Đang mở Google…' : 'Liên kết tài khoản Google'}</button>
      <ErrorBanner err={err} />
    </div>
  );
}

/**
 * Yêu cầu xóa tài khoản (xóa sau 7 ngày, hủy được).
 * Đám hiếu anh/chị đứng tên mà còn người thân khác trong đội: phải chuyển quyền người đại diện trước.
 * Đám hiếu chỉ có một mình anh/chị: xóa cùng tài khoản (nên tải bản lưu trước).
 */
function DeleteAccountSheet({ owned, onClose }: { owned: CaseData[]; onClose: () => void }) {
  const { toast } = useApp();
  const others = (c: CaseData) => c.members.filter(m => m.id !== 'u1' && m.userId && m.access !== 'link');
  const blockers = owned.filter(c => others(c).length > 0);
  const alone = owned.filter(c => others(c).length === 0);
  return (
    <Sheet title="Yêu cầu xóa tài khoản" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Để sau</button>
      <button className="btn danger" disabled={blockers.length > 0} onClick={() => { requestDeleteAccount(); toast('Đã ghi nhận — tài khoản sẽ được xóa sau 7 ngày. Trong thời gian này có thể hủy.'); onClose(); }}>Yêu cầu xóa tài khoản</button></>}>
      {blockers.length > 0 ? <>
        <Banner kind="warn"><b>Cần chuyển quyền người đại diện trước.</b> Các đám hiếu dưới đây còn người thân khác trong đội — giao lại cho một người để gia đình vẫn dùng tiếp.</Banner>
        {blockers.map(c => (
          <div key={c.id} className="row" style={{ padding: '8px 0' }}><div className="grow"><div className="title">Đám hiếu {DN_TEXT(c)}</div>
            <div className="meta"><span>Trong đội: {others(c).map(m => m.name).join(', ')}</span></div></div>
            <Link className="btn sm" to={`/dh/${c.id}/doi`}>Mở Đội để chuyển quyền</Link></div>
        ))}
        <p className="muted">Trong Đội, bấm “Sửa” ở người sẽ nhận quyền → “Chuyển quyền người đại diện”.</p>
      </> : <>
        <p>Tài khoản sẽ được <b>xóa sau 7 ngày</b>. Trong 7 ngày, anh/chị đăng nhập và bấm “Hủy yêu cầu” là giữ lại.</p>
        {alone.length > 0 && <Banner kind="warn">Các đám hiếu chỉ có anh/chị sẽ bị xóa cùng tài khoản: {alone.map(c => DN_TEXT(c)).join('; ')}. Nên <b>tải bản lưu</b> ở mục Dữ liệu trước.</Banner>}
        <p className="muted">Đơn hàng đã thanh toán được giữ lại làm chứng từ (không còn gắn với tài khoản). Anh/chị vẫn ở trong đội của gia đình khác cho tới khi tài khoản bị xóa.</p>
      </>}
    </Sheet>
  );
}

/** Công tắc chuông chánh niệm (lưu trên máy này) + nghe thử */
function MindfulSetting() {
  const [on, setOn] = useState(bellOn());
  return (
    <section className="card card-pad stack"><h3>Chuông chánh niệm</h3>
      <p className="muted">Một tiếng chuông nhẹ khi người thân viết vào Sổ tưởng nhớ, khi có lời tưởng nhớ mới, và khi sắp đến lễ 49 ngày, 100 ngày, giỗ. Việc lo toan hằng ngày không dùng chuông này.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={on ? 'btn primary' : 'btn'} aria-pressed={on} onClick={() => { setBellOn(!on); setOn(!on); }}>Tiếng chuông: {on ? 'Đang bật' : 'Đang tắt'}</button>
        <button className="btn ghost" onClick={() => playMindfulBell(true)}><Icon n="candle" c="sm" />Nghe thử</button>
      </div>
    </section>
  );
}

/** Sắp đến mốc tưởng niệm (trong 3 ngày): nhắc nhẹ ở trang chủ, ngân chuông một lần mỗi mốc */
function UpcomingRemembrance({ cases }: { cases: CaseData[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const soon = cases.flatMap(c => milestoneList(c).filter(m => m.key !== 'custom' && m.date && m.date >= today && (m.date.getTime() - today.getTime()) <= 3 * 86400000).map(m => ({ c, m })));
  useEffect(() => {
    for (const { c, m } of soon) {
      const k = `tronhieu.bell.ms.${c.id}.${m.key}`;
      try { if (localStorage.getItem(k)) continue; localStorage.setItem(k, '1'); } catch { continue; }
      playMindfulBell();
      break;
    }
  }, [soon]);
  if (!soon.length) return null;
  return (
    <section className="card card-pad stack mindful-card" style={{ gap: 8 }}>
      {soon.map(({ c, m }) => {
        const days = Math.round((m.date!.getTime() - today.getTime()) / 86400000);
        return (
          <Link key={c.id + m.key} to={`/dh/${c.id}/hau-tang/moc`} style={{ display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Icon n="candle" /><div style={{ flex: 1 }}><div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{days === 0 ? 'Hôm nay' : `Còn ${days} ngày`} là {m.name.toLowerCase()} của {DN_TEXT(c)}</div>
              <div className="muted">{m.solar}{m.lunar ? ` · ${m.lunar}` : ''}</div></div><Icon n="chev" c="chev" />
          </Link>
        );
      })}
    </section>
  );
}
