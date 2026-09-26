// S-GST-01 Tổng quan · S-GST-02 Soạn trang thông tin · S-GST-03 Trang công khai · S-GST-04 Chia sẻ · S-GST-05 Ghi nhanh · S-GST-06 Danh sách · S-GST-07 Bàn giao ca
import { Fragment, useEffect, useState } from 'react';
import { Tel } from '../../ui/tel';
import { xung } from '../../domain/text';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CaseData, Condolence, GuestGroup, Method } from '../../domain/types';
import { addGuest, addGuestHost, announcer, hostOf, hostPhrase, hostsOf, defaultNotice, draftNotice, emptyPage, GIFTS, GROUPS, organizerLine, publish, removeGuest, schedule, tangChu } from '../../domain/guests';
import { fmtMoneyInput, ledgerTotals, METHOD_LABEL, money, parseMoney } from '../../domain/finance';
import { lifeLine } from '../../domain/person';
import { portraitIcon } from '../../domain/model';
import { defaultVenues, siteOf, venueLabel } from '../../domain/vendors';
import { DN_TEXT } from '../../domain/text';
import { repo } from '../../repo/repo';
import { Icon } from '../../ui/Icon';
import { Banner, Chips, ErrorBanner, Sheet, toggleIn, useApp } from '../../ui/common';
import { REMOTE } from '../../repo/backend';
import { listMemories, publicMemories, submitGuestMemory, type Memory } from '../../repo/nghiaTinh';
import { useCase } from '../CaseContext';
import { PaidGate } from '../Paywall';
import { AccountCard, AccountInline } from '../CondolenceAccount';
import { BRAND } from '../../ui/brand';

const fmtAt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '');
export const pageUrl = (slug: string) => `${window.location.origin}/t/${slug}`;

function groupLabel(c: CaseData, x: Condolence) {
  return `${x.group ?? 'Khác'} · ${hostPhrase(c, hostOf(x))}`;
}

/* ---------- S-GST-05 ---------- */
export function GuestSheet({ onClose }: { onClose: () => void }) {
  const { c, update, me } = useCase();
  const { toast } = useApp();
  const empty = { name: '', group: null as GuestGroup | null, of: null as string | null, amount: '', method: 'cash' as Method, gifts: [] as string[], note: '' };
  const [g, setG] = useState(empty);
  const [err, setErr] = useState<string | null>(null);
  const hosts = hostsOf(c);
  const [newHost, setNewHost] = useState<string | null>(null);
  const addHost = () => {
    let id = '';
    const e = update(d => { id = addGuestHost(d, newHost ?? ''); });
    if (e) { setErr(e); return; }
    setG(x => ({ ...x, of: id })); setNewHost(null); setErr(null);
  };
  const save = () => {
    const e = update(d => { addGuest(d, { ...g, amount: parseMoney(g.amount) }, me.name); });
    if (e) { setErr(e); return; }
    setG(empty); setErr(null); toast('Đã ghi nhận. Mời ghi người tiếp theo.');
    document.getElementById('gName')?.focus();
  };
  return (
    <Sheet title="Ghi nhanh khách viếng" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Xong</button><button className="btn primary" style={{ flex: 2 }} onClick={save}><Icon n="check" c="sm" />Ghi nhận</button></>}>
      <div className="field"><label htmlFor="gName">Người / đoàn đến viếng</label><input className="input" id="gName" autoComplete="off" value={g.name} onChange={e => setG({ ...g, name: e.target.value })} placeholder="Ví dụ: Gia đình bác Tư (xóm trên)" /></div>
      <div className="field"><label>Khách của ai? <span className="muted" style={{ fontWeight: 400 }}>— để sau này người đó đáp lễ</span></label><div className="chips">
        {hosts.map(h => <button key={h.id} className="chip" aria-pressed={g.of === h.id} onClick={() => setG({ ...g, of: h.id })}>{h.label}</button>)}
        {newHost === null && <button className="chip" onClick={() => setNewHost('')}><Icon n="plus" c="sm" />Thêm người</button>}</div>
        {newHost !== null && <div style={{ display: 'flex', gap: 8 }}><input className="input" autoFocus value={newHost} maxLength={50} onChange={e => setNewHost(e.target.value)} placeholder="Ví dụ: Anh Bình (con trai thứ), Cháu Minh" aria-label="Tên người nhận khách" />
          <button className="btn sm" onClick={addHost}>Thêm</button><button className="btn sm ghost" onClick={() => setNewHost(null)}>Hủy</button></div>}</div>
      <div className="field"><label>Nhóm</label><Chips items={GROUPS} isOn={x => g.group === x} onToggle={x => setG({ ...g, group: g.group === x ? null : x as GuestGroup })} /></div>
      <div className="field"><label htmlFor="gAmt">Phúng viếng (đồng) — ghi vào sổ riêng</label><input className="input num" id="gAmt" inputMode="numeric" value={g.amount} onChange={e => setG({ ...g, amount: fmtMoneyInput(e.target.value) })} placeholder="0" style={{ fontSize: 20, fontWeight: 600 }} />
        <div className="chips">{[200000, 500000, 1000000, 2000000].map(a => <button key={a} className="chip num" onClick={() => setG({ ...g, amount: a.toLocaleString('vi-VN') })}>{a.toLocaleString('vi-VN')}</button>)}</div></div>
      <div className="field"><label>Hình thức phúng viếng</label><div className="segin">{(['cash', 'bank'] as Method[]).map(k => <button key={k} aria-pressed={g.method === k} onClick={() => setG({ ...g, method: k })}>{METHOD_LABEL[k]}</button>)}</div>
        {g.method === 'bank' && <AccountInline />}
        <p className="muted">App chỉ ghi lại để đối chiếu với sao kê; không nhận tiền thay gia đình.</p></div>
      <div className="field"><label>Lễ vật</label><Chips items={GIFTS} isOn={x => g.gifts.includes(x)} onToggle={x => setG(y => ({ ...y, gifts: toggleIn(y.gifts, x) }))} /></div>
      <ErrorBanner err={err} />
    </Sheet>
  );
}

/* ---------- S-GST-04 ---------- */
function ShareSheet({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { toast } = useApp();
  const url = pageUrl(slug);
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast('Đã sao chép link'); } catch { toast('Không sao chép được — chọn và sao chép thủ công'); } };
  const share = async () => { try { await navigator.share({ title: 'Cáo phó', url }); } catch { /* người dùng hủy */ } };
  return (
    <Sheet title="Chia sẻ trang thông tin" onClose={onClose} foot={<button className="btn primary" onClick={onClose}>Xong</button>}>
      <div className="link-box"><span>{url}</span><button className="btn sm" onClick={copy}><Icon n="copy" c="sm" />Sao chép</button></div>
      {'share' in navigator && <button className="btn" onClick={share}><Icon n="link" c="sm" />Gửi qua ứng dụng khác (Zalo, Messenger…)</button>}
      {!REMOTE && <p className="note">Bản chạy thử: trang chỉ mở được trên thiết bị này. Bản thật mở được trên mọi máy.</p>}
    </Sheet>
  );
}

/* ---------- S-GST-01 ---------- */
export function GuestsPage() { return <PaidGate module="Khách viếng"><Guests /></PaidGate>; }
function Guests() {
  const { c, base, me } = useCase();
  const nav = useNavigate();
  const [add, setAdd] = useState(false);
  const [share, setShare] = useState(false);
  const p = c.publicPage, L = (c.ledger ?? []).slice().reverse();
  const shift = (c.shifts ?? []).at(-1);
  return (
    <div className="page"><div className="page-title"><div><h1>Khách viếng và truyền tin</h1><p>Một nguồn thông tin đúng cho khách · ghi nhận nhanh cho gia đình</p></div>
      <div className="actions"><button className="btn primary" onClick={() => setAdd(true)}><Icon n="plus" c="sm" />Ghi khách viếng</button></div></div>
      <div className="grid-2"><div className="stack">
        <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Sổ phúng viếng · mới ghi gần đây</h3><span className="muted">{L.length} lượt</span>
          <button className="btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => nav(`${base}/so-phung-vieng`)}>Mở Sổ phúng viếng</button></div>
          {L.length ? <div className="list">{L.slice(0, 10).map(x => <div key={x.id} className="row"><div className="grow"><div className="title">{x.name}</div>
            <div className="meta"><span>{groupLabel(c, x)}</span>{x.gifts.length > 0 && <span>{x.gifts.join(', ')}</span>}<span><Icon n="lock" c="sm" /> Phúng viếng ghi vào sổ riêng</span><span>{x.by} · {fmtAt(x.at)}</span></div></div></div>)}</div>
            : <div className="empty"><span>Chưa ghi khách nào. Bấm “Ghi khách viếng” khi có người đến.</span></div>}
          <p className="note" style={{ padding: '0 16px 12px' }}>Ghi ở đây hay ở Sổ phúng viếng đều vào cùng một sổ — không bị trùng.</p></section>
        <AccountCard />
      </div><div className="stack">
        <section className="card card-pad stack" style={{ gap: 10 }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><h3 style={{ flex: 1 }}>Trang thông tin cho khách</h3>{p?.published ? <span className="pill done">Đã công bố</span> : <span className="pill soft">Nháp</span>}</div>
          {p?.changedAt && <Banner kind="upd" icon="refresh">Đã tự cập nhật theo thay đổi của gia đình lúc {fmtAt(p.changedAt)} và gắn nhãn “Thông tin đã thay đổi” cho khách.</Banner>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn" onClick={() => nav(`${base}/khach-vieng/trang-tin`)}>Soạn, sửa</button>
            {p?.published && <><a className="btn" href={`/t/${p.slug}`} target="_blank" rel="noreferrer">Xem như khách</a><button className="btn" onClick={() => setShare(true)}><Icon n="link" c="sm" />Chia sẻ</button></>}</div></section>
        <section className="card card-pad stack" style={{ gap: 8 }}><h3>Ca trực</h3>
          <p className="muted">{shift ? `${c.members.find(m => m.id === shift.memberId)?.name ?? '—'} đang trực từ ${fmtAt(shift.at)}.` : 'Chưa có ca trực nào được ghi.'}{shift?.note ? ` Ghi chú: ${shift.note}` : ''}</p>
          <button className="btn" onClick={() => nav(`${base}/khach-vieng/ban-giao`)}>{shift?.memberId === me.id ? 'Bàn giao ca' : 'Nhận ca, bàn giao'}</button></section>
      </div></div>
      {add && <GuestSheet onClose={() => setAdd(false)} />}
      {share && p && <ShareSheet slug={p.slug} onClose={() => setShare(false)} />}
    </div>
  );
}

/* ---------- Nội dung cáo phó (dùng cho xem trước và trang công khai) ---------- */
export function ObitBody({ c, preview }: { c: CaseData; preview?: boolean }) {
  const p = c.publicPage ?? emptyPage(), site = siteOf(c), u1 = tangChu(c), org = organizerLine(c);
  return (
    <div className="obit">
      {p.changedAt && <div className="banner upd" style={{ textAlign: 'left', width: '100%' }}><Icon n="refresh" /><div><b>Thông tin đã thay đổi</b> lúc {fmtAt(p.changedAt)}. Lịch và địa điểm dưới đây là mới nhất.</div></div>}
      {!p.published && !preview && <div className="banner info" style={{ textAlign: 'left', width: '100%' }}><Icon n="alert" /><div>Bản xem trước — trang chưa được công bố.</div></div>}
      <div className="eyebrow">Cáo phó</div>
      {c.person.photo ? <div className="portrait" style={{ padding: 0, overflow: 'hidden' }}><img src={c.person.photo} alt="Ảnh thờ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
        : <div className="portrait"><Icon n={portraitIcon(c.situation.rite)} c="lg" /></div>}
      <p style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{announcer(c)} vô cùng thương tiếc báo tin</p>
      <div className="name">{DN_TEXT(c)}</div>{org && <p className="muted">{org}</p>}
      <p className="muted num">{lifeLine(c.person)}</p>{c.person.hometown && <p className="muted">Quê quán: {c.person.hometown}</p>}
      <p style={{ maxWidth: '56ch' }}>{p.text || defaultNotice(c)}</p>
      <section className="card card-pad sched"><dl className="kv">{schedule(c).map(([a, b]) => <Fragment key={a}><dt>{a}</dt><dd>{b}</dd></Fragment>)}
        <dt>Địa điểm</dt><dd><b>{venueLabel(c)}</b>{site.address && <><br />{site.address}</>}{(site.geo || site.address) && <><br /><a className="btn sm" style={{ marginTop: 6 }} href={`https://www.google.com/maps/search/?api=1&query=${site.geo ? `${site.geo.lat},${site.geo.lng}` : encodeURIComponent(site.address)}`} target="_blank" rel="noreferrer"><Icon n="map" c="sm" />Chỉ đường</a></>}</dd></dl></section>
      <p className="muted">Tang chủ: {u1.name} ({u1.rel.toLowerCase()}){p.showPhone && p.phone ? <> · <Tel phone={p.phone} /></> : null}</p>
      <p className="muted" style={{ fontSize: 12 }}>Trang do gia đình đăng qua {BRAND}</p>
    </div>
  );
}

/* ---------- S-GST-02 ---------- */
export function ComposePage() { return <PaidGate module="Khách viếng"><Compose /></PaidGate>; }
function Compose() {
  const { c, update, isU1, me } = useCase();
  const { mobile, toast } = useApp();
  const p = c.publicPage ?? emptyPage();
  const [f, setF] = useState({ text: p.text || defaultNotice(c), auto: p.auto, showPhone: p.showPhone, phone: p.phone || me.phone || '', addr: siteOf(c).address, nq: p.sched?.nq ?? '', vieng: p.sched?.vieng ?? '', dua: p.sched?.dua ?? '' });
  const [share, setShare] = useState(false);
  const draft = { ...c, venues: { ...(c.venues ?? defaultVenues()), [c.situation.venue]: { ...siteOf(c), address: f.addr } }, publicPage: { ...p, text: f.text, showPhone: f.showPhone, phone: f.phone, sched: { nq: f.nq, vieng: f.vieng, dua: f.dua } } };
  const go = () => { update(d => { const v = d.venues ?? defaultVenues(); v[d.situation.venue] = { ...v[d.situation.venue], address: f.addr.trim() }; d.venues = v; publish(d, { text: f.text, auto: f.auto, showPhone: f.showPhone, phone: f.phone, sched: { nq: f.nq.trim(), vieng: f.vieng.trim(), dua: f.dua.trim() } }); }); toast('Đã công bố. Khi gia đình đổi lịch hoặc nơi tổ chức, trang tự cập nhật.'); };
  const sch = schedule(c);
  const form = (
    <section className="card card-pad stack">
      <div className="field"><label htmlFor="infoText">Lời báo tin</label><textarea className="input" id="infoText" value={f.text} onChange={e => setF({ ...f, text: e.target.value })} style={{ minHeight: 140 }} />
        {f.auto && <p className="muted" style={{ color: 'var(--warning)' }}><Icon n="alert" c="sm" /> Bản nháp soạn tự động — {xung(me.rel)} đọc lại, sửa tên tuổi, giờ trước khi công bố.</p>}
        <div><button className="btn sm" onClick={() => setF({ ...f, text: draftNotice(draft), auto: true })}>Soạn nháp tự động</button></div></div>
      <div><div className="eyebrow" style={{ marginBottom: 6 }}>Lịch lễ · giờ an táng lấy từ quyết định đã chốt</div>
        <div className="stack" style={{ gap: 8 }}>
          <div className="field"><label htmlFor="sNq">{sch[0]?.[0]}</label><input className="input" id="sNq" value={f.nq} onChange={e => setF({ ...f, nq: e.target.value })} placeholder={sch[0]?.[1]} /></div>
          {sch.length > 1 && <div className="field"><label htmlFor="sVieng">Lễ viếng</label><input className="input" id="sVieng" value={f.vieng} onChange={e => setF({ ...f, vieng: e.target.value })} placeholder={sch[1][1]} /></div>}
          {sch.length > 2 && <div className="field"><label htmlFor="sDua">{sch[2][0]}</label><input className="input" id="sDua" value={f.dua} onChange={e => setF({ ...f, dua: e.target.value })} placeholder={sch[2][1]} /></div>}
          {sch.length > 3 && <p className="muted">{sch[3][0]}: <b style={{ color: 'var(--text)' }}>{sch[3][1]}</b></p>}
          <div className="field"><label htmlFor="sAddr">Địa chỉ {venueLabel(c).toLowerCase()}</label><input className="input" id="sAddr" value={f.addr} onChange={e => setF({ ...f, addr: e.target.value })} placeholder="Số nhà, ngõ/xóm, phường/xã, tỉnh" />
            {!f.addr.trim() && <p className="muted" style={{ color: 'var(--warning)' }}><Icon n="alert" c="sm" /> Khách cần địa chỉ để đến viếng — trang sẽ có nút “Chỉ đường”.</p>}</div></div></div>
      <label className="check"><input type="checkbox" checked={f.showPhone} onChange={e => setF({ ...f, showPhone: e.target.checked })} /><span>Hiện số điện thoại của tang chủ</span></label>
      {f.showPhone && <input className="input num" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="Số điện thoại" aria-label="Số điện thoại tang chủ" />}
      {isU1 ? <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn primary" onClick={go} style={{ flex: 1 }}>{p.published ? 'Cập nhật trang' : 'Công bố trang thông tin'}</button>
        {p.published && <button className="btn" onClick={() => setShare(true)}><Icon n="link" c="sm" />Chia sẻ</button>}</div>
        : <p className="muted">Người đại diện gia đình công bố trang.</p>}
      {p.published && <div className="link-box"><span>{pageUrl(p.slug)}</span><a className="btn sm" href={`/t/${p.slug}`} target="_blank" rel="noreferrer">Xem như khách</a></div>}
    </section>
  );
  return (
    <div className="page"><div className="page-title"><div><div className="eyebrow">Khách viếng và truyền tin</div><h1 style={{ marginTop: 4 }}>Trang thông tin cho khách</h1>
      <p>Khách mở link là thấy đúng giờ, đúng nơi. Khi gia đình đổi quyết định, trang tự cập nhật.</p></div></div>
      {mobile ? form : <div className="split">{form}<section className="card" style={{ overflow: 'hidden' }}><div className="eyebrow" style={{ padding: '12px 16px 0' }}>Xem trước</div>
        <div style={{ transform: 'scale(.86)', transformOrigin: 'top center' }}><ObitBody c={draft} preview /><MemoriesPreview caseId={c.id} /></div></section></div>}
      {share && <ShareSheet slug={p.slug} onClose={() => setShare(false)} />}
    </div>
  );
}

/* ---------- S-GST-03 (công khai, không cần đăng nhập) ---------- */
export function PublicPage() {
  const { slug = '' } = useParams();
  const [c, setC] = useState<CaseData | null | undefined>(undefined);
  useEffect(() => { repo.findBySlug(slug).then(setC); }, [slug]);
  if (c === undefined) return <div className="bare"><p className="muted" style={{ textAlign: 'center', padding: 40 }}>Đang mở…</p></div>;
  if (!c || !c.publicPage?.published) return <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><div className="empty"><Icon n="lotus" c="lg" /><h2 style={{ color: 'var(--text)' }}>Trang chưa được công bố hoặc không còn</h2><p>Liên hệ gia đình để có đường dẫn đúng.</p></div></div></div>;
  return <div className="bare" style={{ maxWidth: 720, margin: '0 auto' }}><ObitBody c={c} /><PublicMemories slug={slug} caseId={c.id} /></div>;
}

/* ---------- S-GST-06 ---------- */
export function GuestListPage() { return <PaidGate module="Sổ phúng viếng"><GuestList /></PaidGate>; }
const escH = (t: string) => t.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]!));
/** Sổ phúng viếng in được: chia theo “khách của ai”; mặc định không có số tiền, người giữ Tài chính tải được bản kèm số tiền */
function downloadSoTang(c: CaseData, withMoney = false) {
  const L = c.ledger ?? [];
  const vnd = (n: number) => n.toLocaleString('vi-VN') + ' đ';
  const parts = hostsOf(c).filter(h => L.some(x => hostOf(x) === h.id)).map(h => {
    const mine = L.filter(x => hostOf(x) === h.id), sub = mine.reduce((a, x) => a + x.amount, 0);
    const rows = mine.map((x, i) => `<tr><td>${i + 1}</td><td>${escH(x.name)}</td><td>${escH(x.group ?? 'Khác')}</td><td>${escH(x.gifts.join(', ') || '—')}</td>${withMoney ? `<td class="r">${x.amount ? vnd(x.amount) + ' · ' + escH(METHOD_LABEL[x.method]) : '—'}</td>` : ''}<td>${escH(fmtAt(x.at))}</td></tr>`).join('');
    return `<h2>${escH(hostPhrase(c, h.id))} <small>(${mine.length} lượt${withMoney ? ' · ' + vnd(sub) : ''})</small></h2><table><thead><tr><th>STT</th><th>Người / đoàn đến viếng</th><th>Nhóm</th><th>Lễ vật</th>${withMoney ? '<th>Phúng viếng</th>' : ''}<th>Thời gian</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Sổ phúng viếng ${escH(DN_TEXT(c))}</title><style>body{font-family:Georgia,serif;max-width:860px;margin:32px auto;padding:0 16px;color:#2b241d}h1{text-align:center}h2{margin-top:28px;font-size:18px}small{color:#7a6c5d;font-weight:normal}table{width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px}th,td{border:1px solid #d9cfc2;padding:6px 8px;text-align:left}td.r{text-align:right;white-space:nowrap}th{background:#f3ece3}p.n{text-align:center;color:#7a6c5d}@media print{h2{break-after:avoid}}</style></head><body><h1>Sổ phúng viếng</h1><p class="n">${escH(DN_TEXT(c))} · ${L.length} lượt khách${withMoney ? ' · Tổng phúng viếng ' + vnd(L.reduce((a, x) => a + x.amount, 0)) : ''}</p>${parts || '<p>Chưa có khách nào.</p>'}<p class="n">In hoặc lưu PDF từ trình duyệt để giữ lâu dài.</p></body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  a.download = `So-phung-vieng-${withMoney ? 'kem-so-tien-' : ''}${slugifyName(DN_TEXT(c))}.html`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const slugifyName = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
function GuestList() {
  const { c, update, canFin } = useCase();
  const [q, setQ] = useState('');
  const [host, setHost] = useState<string>('all');
  const [add, setAdd] = useState(false);
  const all = c.ledger ?? [];
  const hosts = hostsOf(c).map(h => ({ ...h, n: all.filter(x => hostOf(x) === h.id).length })).filter(h => h.n > 0);
  const L = all.filter(x => (host === 'all' || hostOf(x) === host) && x.name.toLowerCase().includes(q.trim().toLowerCase())).slice().reverse();
  // Tổng phúng viếng: chỉ người đại diện / người giữ Tài chính thấy
  const T = ledgerTotals(all);
  const sumOf = (id: string) => all.filter(x => hostOf(x) === id).reduce((a, x) => a + x.amount, 0);
  return (
    <div className="page"><div className="page-title"><div><div className="eyebrow">Khách viếng</div><h1 style={{ marginTop: 4 }}>Sổ phúng viếng</h1><p>{all.length} lượt khách · chia theo khách của từng người để sau này đáp lễ</p></div>
      <div className="actions"><button className="btn primary" onClick={() => setAdd(true)}><Icon n="plus" c="sm" />Ghi khách viếng</button>
        <button className="btn" disabled={!all.length} onClick={() => downloadSoTang(c)}><Icon n="doc" c="sm" />Tải / in Sổ phúng viếng</button>
        {canFin && <button className="btn ghost" disabled={!all.length} onClick={() => downloadSoTang(c, true)}><Icon n="doc" c="sm" />Tải kèm số tiền</button>}</div></div>
      {canFin && all.length > 0 && <section className="card card-pad stack" style={{ gap: 10 }}>
        <div><div className="eyebrow">Tổng phúng viếng cả gia đình</div><div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600 }} className="num">{money(T.total)}</div>
          <div className="muted num">Tiền mặt {money(T.cash)} · Chuyển khoản {money(T.bank)}</div></div>
        <div className="list">{hosts.map(h => (
          <button key={h.id} className="row" style={{ padding: '10px 0', textAlign: 'left' }} onClick={() => setHost(host === h.id ? 'all' : h.id)} aria-pressed={host === h.id}>
            <div className="grow"><div className="title">{hostPhrase(c, h.id)}</div><div className="meta"><span>{h.n} lượt</span></div></div>
            <b className="num">{money(sumOf(h.id))}</b></button>))}</div>
        <p className="note">Chỉ người đại diện và người giữ Tài chính thấy số tiền. Bấm từng dòng để xem danh sách khách của người đó.</p>
      </section>}
      {hosts.length > 0 && <div className="chips">
        <button className="chip" aria-pressed={host === 'all'} onClick={() => setHost('all')}>Tất cả · {all.length}</button>
        {hosts.map(h => <button key={h.id} className="chip" aria-pressed={host === h.id} onClick={() => setHost(h.id)}>{h.label} · {h.n}</button>)}</div>}
      <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên" aria-label="Tìm theo tên" />
      <section className="card">{L.length ? <div className="list">{L.map(x => (
        <div key={x.id} className="row"><div className="grow"><div className="title">{x.name}</div><div className="meta"><span>{groupLabel(c, x)}</span>{x.gifts.length > 0 && <span>{x.gifts.join(', ')}</span>}<span>{x.by} · {fmtAt(x.at)}</span>{canFin && x.amount > 0 && <span className="num">{x.amount.toLocaleString('vi-VN')} đ · {METHOD_LABEL[x.method]}</span>}</div></div>
          {canFin && !c.finance?.locked && <button className="icon-btn" aria-label="Xóa lượt ghi" onClick={() => { if (window.confirm(`Xóa lượt ghi “${x.name}”?`)) update(d => removeGuest(d, x.id)); }}><Icon n="x" c="sm" /></button>}</div>
      ))}</div> : <div className="empty"><span>{all.length ? 'Không có lượt ghi nào khớp.' : 'Sổ phúng viếng còn trống. Bấm “Ghi khách viếng” khi có người đến.'}</span></div>}</section>
      {canFin && host !== 'all' && <p className="muted">{hostPhrase(c, host)} · tổng phúng viếng: <b className="num" style={{ color: 'var(--text)' }}>{money(sumOf(host))}</b></p>}
      {!canFin && <p className="note">Số tiền phúng viếng chỉ người đại diện và người giữ Tài chính xem. Bản tải về không có số tiền.</p>}
      {add && <GuestSheet onClose={() => setAdd(false)} />}
    </div>
  );
}

/* ---------- S-GST-07 ---------- */
export function ShiftPage() { return <PaidGate module="Khách viếng"><Shifts /></PaidGate>; }
function Shifts() {
  const { c, update, me, base } = useCase();
  const { toast } = useApp();
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const S = c.shifts ?? [], cur = S.at(-1);
  const since = cur ? (c.ledger ?? []).filter(x => x.at >= cur.at) : [];
  const people = c.members.filter(m => !m.system);
  const start = (memberId: string) => {
    update(d => { (d.shifts ??= []).push({ id: 's' + Date.now(), memberId, from: new Date().toISOString(), note: note.trim(), at: new Date().toISOString() }); if (cur) d.shifts[d.shifts.length - 2].handedTo = memberId; });
    setNote(''); setTo(''); toast('Đã ghi nhận ca trực');
  };
  return (
    <div className="page" style={{ maxWidth: 760 }}><div className="page-title"><div><div className="eyebrow">Khách viếng</div><h1 style={{ marginTop: 4 }}>Bàn giao ca</h1><p>Ca trước đã ghi gì, còn gì dở</p></div></div>
      <section className="card card-pad stack" style={{ gap: 8 }}><h3>Ca hiện tại</h3>
        {cur ? <><p><b>{c.members.find(m => m.id === cur.memberId)?.name ?? '—'}</b> trực từ {fmtAt(cur.at)}</p>
          <p className="muted">Trong ca đã ghi {since.length} lượt khách{since.length ? ': ' + since.slice(-5).map(x => x.name).join('; ') : ''}.</p>{cur.note && <p className="muted">Ghi chú nhận ca: {cur.note}</p>}</>
          : <p className="muted">Chưa có ca trực. Người đang tiếp khách bấm “Tôi nhận ca”.</p>}</section>
      <section className="card card-pad stack">
        <div className="field"><label htmlFor="shNote">Ghi chú bàn giao (việc còn dở, đoàn sắp đến…)</label><textarea className="input" id="shNote" value={note} onChange={e => setNote(e.target.value)} placeholder="Ví dụ: Đoàn Hội Cựu chiến binh hẹn 15:00; còn 2 vòng hoa chưa ghi tên" /></div>
        <div className="field"><label htmlFor="shTo">Giao cho</label><select className="input" id="shTo" value={to} onChange={e => setTo(e.target.value)}><option value="">— Chọn người nhận ca —</option>{people.filter(m => m.id !== cur?.memberId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn primary" disabled={!to} onClick={() => start(to)}>Bàn giao ca</button>
          {cur?.memberId !== me.id && <button className="btn" onClick={() => start(me.id)}>Tôi nhận ca</button>}</div></section>
      {S.length > 1 && <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Các ca trước</h3></div><div className="list">{S.slice(0, -1).reverse().map(s => (
        <div key={s.id} className="row"><div className="grow"><div className="title">{c.members.find(m => m.id === s.memberId)?.name ?? '—'}</div><div className="meta"><span>Từ {fmtAt(s.at)}</span>{s.handedTo && <span>Giao cho {c.members.find(m => m.id === s.handedTo)?.name}</span>}{s.note && <span>{s.note}</span>}</div></div></div>
      ))}</div></section>}
      <p className="muted"><Link to={base + '/khach-vieng'}>Về Khách viếng</Link></p>
    </div>
  );
}

/** Trang thông tin công khai: lời tưởng nhớ đã được gia đình duyệt + ô để khách gửi lời tưởng nhớ */
function PublicMemories({ slug, caseId }: { slug: string; caseId: string }) {
  const [L, setL] = useState<{ authorName: string; body: string; createdAt: string }[]>([]);
  const [f, setF] = useState({ name: '', body: '' });
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { void publicMemories(slug, caseId).then(setL); }, [slug, caseId]);
  const send = async () => {
    setBusy(true);
    const e = await submitGuestMemory(slug, caseId, f.name, f.body);
    setBusy(false);
    if (e) { setErr(e); return; }
    setSent(true); setErr(null);
  };
  return (
    <section className="stack" style={{ gap: 12, padding: '8px 16px 32px' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, textAlign: 'center' }}>Lời tưởng nhớ</h2>
      {L.map((m, i) => (
        <article key={i} className="card card-pad" style={{ gap: 6 }}>
          <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.6 }}>{m.body}</p>
          <p className="muted" style={{ marginTop: 6 }}>— {m.authorName}</p>
        </article>
      ))}
      {sent ? <Banner kind="info" icon="check">Cảm ơn anh/chị. Lời tưởng nhớ đã được gửi tới gia đình; gia đình sẽ xem trước khi hiển thị.</Banner> : (
        <section className="card card-pad stack">
          <h3>Gửi lời tưởng nhớ</h3>
          <p className="muted">Một lời chia buồn, một kỷ niệm với người đã khuất. Gia đình sẽ xem trước khi hiển thị ở đây.</p>
          <div className="field"><label htmlFor="gmName">Tên của anh/chị</label><input className="input" id="gmName" value={f.name} maxLength={80} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ví dụ: Bác Tư, hàng xóm" /></div>
          <div className="field"><label htmlFor="gmBody">Lời tưởng nhớ</label><textarea className="input" id="gmBody" rows={4} value={f.body} maxLength={1000} onChange={e => setF({ ...f, body: e.target.value })} /></div>
          <ErrorBanner err={err} />
          <button className="btn primary" style={{ alignSelf: 'flex-start' }} disabled={busy || !f.name.trim() || !f.body.trim()} onClick={() => void send()}>{busy ? 'Đang gửi…' : 'Gửi tới gia đình'}</button>
        </section>
      )}
    </section>
  );
}

/** Xem trước phần “Lời tưởng nhớ” trên trang thông tin: dòng Công khai của gia đình + lời khách đã được cho hiện */
function MemoriesPreview({ caseId }: { caseId: string }) {
  const [L, setL] = useState<Memory[]>([]);
  useEffect(() => { listMemories(caseId).then(x => setL(x.filter(m => m.visibility === 'public' && m.status === 'approved').reverse())).catch(() => undefined); }, [caseId]);
  return (
    <section className="stack" style={{ gap: 10, padding: '8px 16px 24px' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, textAlign: 'center' }}>Lời tưởng nhớ</h2>
      {L.length ? L.map(m => (
        <article key={m.id} className="card card-pad"><p style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.6 }}>{m.body}</p>
          <p className="muted" style={{ marginTop: 6 }}>— {m.authorName}</p></article>
      )) : <p className="muted" style={{ textAlign: 'center' }}>Chưa có. Dòng “Công khai” trong Sổ tưởng nhớ và lời khách được gia đình cho hiện sẽ ở đây.</p>}
      <p className="muted" style={{ textAlign: 'center' }}>Khách có ô “Gửi lời tưởng nhớ” ở cuối trang.</p>
    </section>
  );
}
