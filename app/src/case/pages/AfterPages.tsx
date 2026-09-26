// S-AFT-01 Hậu tang tổng quan · S-AFT-02 Thủ tục · S-AFT-03 Chọn mốc · S-AFT-04 Chi tiết mốc · S-AFT-05 Cảm ơn · S-AFT-06 Khép vòng
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CaseData, Milestones } from '../../domain/types';
import { closeCase, closeConds, defaultThanks, draftThanks, emptyMilestones, milestoneDates, milestoneList, saveMilestones, toggleMilestone, burialDate } from '../../domain/aftercare';
import { completeTask, restoreTask } from '../../domain/actions';
import { canClose, visibleTasks } from '../../domain/model';
import { children } from '../../domain/finance';
import { fmtDM, fmtWeekday, parseISODate } from '../../domain/person';
import { formatLunar } from '../../domain/lunar';
import { PHASES } from '../../domain/templates';
import { DN_TEXT } from '../../domain/text';
import { Icon } from '../../ui/Icon';
import { Banner, ErrorBanner, useApp } from '../../ui/common';
import { useCase } from '../CaseContext';
import { OwnerPill } from '../rows';
import { FileName, useUploader } from '../../ui/files';
import { uploadCaseFile } from '../../repo/files';
import { REMOTE } from '../../repo/backend';
import { ArticleSuggestion } from '../../pages/BinhAnPages';
import type { Milestone } from '../../repo/nghiaTinh';

/** Mốc tưởng niệm sắp tới để gợi ý đúng bài ở Góc bình an; không có thì gợi ý bài sau tang lễ */
function nextMilestone(c: CaseData): Milestone {
  if (c.situation.rite === 'catholic') return 'sau-tang';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const next = milestoneList(c).find(m => m.date && m.date >= today && (m.key === 'd49' || m.key === 'd100' || m.key === 'gio'));
  return (next?.key as Milestone | undefined) ?? 'sau-tang';
}
import { PaidGate } from '../Paywall';

const fmtAt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '');
const CLOSE_GO = ['hau-tang', 'tai-chinh/doi-soat', 'nha-cung-cap', 'hau-tang', ''];

/* ---------- S-AFT-01 ---------- */
export function AfterPage() { return <PaidGate module="Hậu tang"><After /></PaidGate>; }
function After() {
  const { c, base, update, me } = useCase();
  const up = useUploader();
  const { toast } = useApp();
  const nav = useNavigate();
  const cc = closeConds(c), okN = cc.filter(k => k.ok).length, closed = !!c.after?.closed;
  const at = visibleTasks(c).filter(t => t.phase >= 13 && t.id !== 'm15d');
  const groups = [13, 14, 15].filter(n => at.some(t => t.phase === n));
  const ms = milestoneList(c), docs = (c.docs ?? []).filter(d => d.source === 'after');
  const toggle = (id: string, on: boolean) => update(d => { if (on) completeTask(d, id); else { const t = d.tasks.find(x => x.id === id); if (t) { t.status = 'todo'; if (t.skipReason) restoreTask(d, id); } } });
  return (
    <div className="page"><div className="page-title"><div><h1>Hậu tang và khép vòng</h1><p>Tiễn đưa xong chưa phải là hết việc — app giữ giúp gia đình phần còn lại</p></div></div>
      {closed && <Banner kind="info" icon="check"><b>Đã khép phần tức thời</b> lúc {fmtAt(c.after?.closedAt)}. Các mốc tưởng niệm dưới đây vẫn được nhắc theo lịch.</Banner>}
      <div className="grid-2"><div className="stack">
        {groups.map(g => (
          <section key={g} className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Chặng {g} · {PHASES[g - 1]}</h3></div>
            <div className="list">{at.filter(t => t.phase === g).map(t => (
              <div key={t.id} className="row">
                <input type="checkbox" checked={t.status === 'done'} disabled={closed || t.lock} onChange={e => toggle(t.id, e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--primary)', marginTop: 2 }} aria-label={`Đánh dấu xong: ${t.title}`} />
                <div className="grow"><Link className="title" to={`${base}/viec/${t.id}`} state={{ from: 'hau-tang' }} style={{ color: 'inherit', textDecoration: 'none' }}>{t.title}</Link>
                  <div className="meta">{t.status === 'done' ? <span className="pill done">Đã xong</span> : t.kind === 'opt' ? <span>Tùy chọn</span> : <span>Cần xong để khép vòng</span>}{t.status === 'skip' && <span className="pill skip">Không áp dụng</span>}{t.why && <span>Vì: {t.why}</span>}{t.unverified && <span className="pill soft">Hướng dẫn chi tiết đang bổ sung</span>}</div></div>
                {t.go && <button className="btn sm ghost" onClick={() => nav(`${base}/${t.go}`)}>Mở</button>}</div>
            ))}</div></section>
        ))}
        <p className="note">Cùng một danh sách với chặng 13–15 trên Bản đồ: đánh dấu ở đây thì Bản đồ cập nhật theo.</p>
        <ArticleSuggestion milestone={nextMilestone(c)} />
        <section className="card card-pad stack" style={{ gap: 8 }}><h3>Tài liệu kết quả</h3><p className="muted">Lưu bản chụp giấy tờ sau khi làm thủ tục (trích lục khai tử, quyết định chế độ…) để gia đình tìm lại khi cần.</p>
          {docs.map(d => <span key={d.id} className="pill done" style={{ alignSelf: 'flex-start' }}><Icon n="doc" c="sm" /><FileName name={d.name} path={d.path} /></span>)}
          <label className="btn file-btn" style={{ alignSelf: 'flex-start' }} aria-disabled={up.busy}><Icon n="doc" c="sm" />{up.busy ? 'Đang tải lên…' : 'Tải tệp lên'}<input type="file" disabled={up.busy} onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const s = await up.run(() => uploadCaseFile(c.id, 'after', f)); if (s) { update(d => { (d.docs ??= []).push({ id: 'doc' + Date.now(), name: s.name, path: s.path, at: new Date().toISOString(), source: 'after' }); d.history.push({ at: new Date().toISOString(), text: `${me.name} lưu tài liệu kết quả: ${s.name}` }); }); toast('Đã lưu tài liệu'); } }} /></label>
          {!REMOTE && <p className="note">Bản chạy thử trên máy chỉ ghi lại tên tệp; bản thật lưu tệp trên máy chủ.</p>}</section>
      </div><div className="stack">
        <section className="card card-pad stack" style={{ gap: 10 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h3 style={{ flex: 1 }}>Tiến độ khép vòng</h3><span className="muted">{okN}/{cc.length}</span></div>
          <div className={'bar ' + (okN === cc.length ? 'ok' : '')}><i style={{ width: `${okN / cc.length * 100}%` }} /></div>
          <button className="btn" onClick={() => nav(`${base}/hau-tang/khep-vong`)}>Xem điều kiện khép vòng</button></section>
        <section className="card card-pad stack" style={{ gap: 8 }}><h3>Cảm ơn khách</h3><p className="muted">Danh sách lấy từ Sổ phúng viếng, chia theo từng người con.</p><button className="btn" onClick={() => nav(`${base}/hau-tang/cam-on`)}>Mở danh sách cảm ơn</button></section>
        <section className="card card-pad stack" style={{ gap: 8 }}><h3>Thủ tục và quyền lợi</h3><p className="muted">Khai tử, chế độ, quyền lợi — kèm kết quả.</p><button className="btn" onClick={() => nav(`${base}/hau-tang/thu-tuc`)}>Mở thủ tục</button></section>
        <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Mốc tưởng niệm</h3><button className="btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => nav(`${base}/hau-tang/moc`)}>{c.milestones?.saved ? 'Sửa' : 'Chọn mốc'}</button></div>
          {c.milestones?.saved ? (ms.length ? <div className="list">{ms.map(m => (
            <button key={m.key} className="row" onClick={() => nav(`${base}/hau-tang/moc/${m.key}`)}><span className="num-badge"><Icon n="after" c="sm" /></span><div className="grow"><div className="title">{m.name}</div><div className="meta"><span className="num">{m.solar}</span>{m.lunar && <span>{m.lunar}</span>}</div></div><Icon n="chev" c="chev" /></button>
          ))}</div> : <p className="muted" style={{ padding: '0 16px 16px' }}>Gia đình chọn không theo dõi mốc nào.</p>)
            : <p className="muted" style={{ padding: '0 16px 16px' }}>Gia đình chưa chọn.{c.situation.hasPre && (c.milestones?.sel.d49 || c.milestones?.sel.gio) ? ' Hồ sơ chuẩn bị có ghi mong muốn — đã chọn sẵn, gia đình xác nhận.' : ''}</p>}</section>
      </div></div>
    </div>
  );
}

/* ---------- S-AFT-02 ---------- */
export function ProceduresPage() { return <PaidGate module="Hậu tang"><Procedures /></PaidGate>; }
function Procedures() {
  const { c, base } = useCase();
  const nav = useNavigate();
  const L = visibleTasks(c).filter(t => t.phase === 14);
  return (
    <div className="page" style={{ maxWidth: 820 }}><div className="page-title"><div><div className="eyebrow">Hậu tang</div><h1 style={{ marginTop: 4 }}>Thủ tục và quyền lợi</h1><p>Theo dõi từng thủ tục, đính kết quả vào từng việc</p></div></div>
      <Banner kind="info"><b>Đăng ký khai tử</b> có hướng dẫn theo quy định hiện hành, kèm điều khoản — bấm vào việc để xem. Thủ tục khác: hướng dẫn chỉ hiện khi có nguồn đã kiểm chứng; app giúp gia đình theo dõi ai làm, đã xong chưa và lưu kết quả.</Banner>
      <section className="card"><div className="list">{L.map(t => (
        <button key={t.id} className="row" onClick={() => nav(`${base}/viec/${t.id}`, { state: { from: 'hau-tang/thu-tuc' } })}><div className="grow"><div className="title">{t.title}</div>
          <div className="meta"><span className={'pill ' + t.status}>{t.status === 'done' ? 'Đã xong' : t.status === 'skip' ? 'Không áp dụng' : t.status === 'doing' ? 'Đang làm' : 'Cần làm'}</span>{t.unverified && <span className="pill soft">Hướng dẫn chi tiết đang bổ sung</span>}{t.evidence && <span><Icon n="doc" c="sm" /> {t.evidence}</span>}{(c.members.find(m => m.id === t.owner)?.name ?? (t.status === 'done' || t.status === 'skip' ? '' : 'Chưa có người nhận')) && <span>{c.members.find(m => m.id === t.owner)?.name ?? 'Chưa có người nhận'}</span>}</div></div>
          <Icon n="chev" c="chev" /></button>
      ))}</div></section></div>
  );
}

/* ---------- S-AFT-03 ---------- */
export function MilestonesPage() { return <PaidGate module="Hậu tang"><MilestonesEdit /></PaidGate>; }
function MilestonesEdit() {
  const { c, base, update } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const [m, setM] = useState<Milestones>(() => ({ ...(c.milestones ?? emptyMilestones()) }));
  const [err, setErr] = useState<string | null>(null);
  const D = milestoneDates(c, m), death = parseISODate(c.person.death), bur = burialDate(c);
  if (!D || !death) return <div className="page"><Banner kind="info">Nhập ngày mất ở hồ sơ người đã khuất để app tính các mốc. <Link to={`${base}/ho-so`}>Mở hồ sơ</Link></Banner></div>;
  const cath = c.situation.rite === 'catholic';
  const seg = <K extends 'base' | 'count' | 'gioCal'>(k: K, opts: [Milestones[K], string][]) => <div className="segin">{opts.map(([v, l]) => <button key={String(v)} aria-pressed={m[k] === v} onClick={() => setM({ ...m, [k]: v })}>{l}</button>)}</div>;
  const opt = (k: keyof Milestones['sel'], l: string, d?: string) => (
    <button className="opt" role="checkbox" aria-checked={m.sel[k]} onClick={() => setM(toggleMilestone(m, k))}><span className="radio" style={{ borderRadius: 6 }} /><span style={{ flex: 1 }}><span className="title">{l}</span>{d && <><br /><span className="muted num">{d}</span></>}</span></button>
  );
  const L = (d: Date) => `${fmtWeekday(d)} · ${formatLunar(d)} âm lịch`;
  return (
    <div className="page" style={{ maxWidth: 760 }}><div><div className="eyebrow">Hậu tang</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Chọn mốc tưởng niệm</h1>
      <p className="muted" style={{ marginTop: 6, maxWidth: '60ch' }}>Mỗi gia đình, mỗi vùng có cách tính khác nhau. Gia đình chọn mốc muốn theo dõi; app nhắc việc, phân công và dự trù chi phí cho từng mốc.</p></div>
      <section className="card card-pad stack" style={{ gap: 14 }}>
        <div className="field"><label>Tính từ</label>{seg('base', [['death', `Ngày mất (${fmtDM(death)})`], ['burial', `${c.situation.form === 'burial' ? 'Ngày an táng' : 'Ngày hỏa táng'} (${bur ? fmtDM(bur) : '—'})`]])}</div>
        <div className="field"><label>Cách đếm ngày</label>{seg('count', [['incl', 'Tính cả ngày đầu là ngày thứ nhất'], ['excl', 'Không tính ngày đầu']])}</div>
        <div className="field"><label>Giỗ đầu theo</label>{seg('gioCal', [['lunar', 'Âm lịch'], ['solar', 'Dương lịch']])}</div></section>
      <div className="opts">
        {opt('d49', cath ? 'Lễ cầu hồn 7 ngày' : 'Lễ 49 ngày', L(D.d49))}
        {opt('d100', cath ? 'Lễ cầu hồn 30 ngày' : 'Lễ 100 ngày', L(D.d100))}
        {opt('gio', 'Giỗ đầu', D.gio ? L(D.gio) : undefined)}
        {opt('custom', 'Mốc riêng của gia đình')}
        {m.sel.custom && <div className="card card-pad" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: 2, minWidth: 180 }}><label htmlFor="msName">Tên mốc</label><input className="input" id="msName" value={m.customName} onChange={e => setM({ ...m, customName: e.target.value })} placeholder="Ví dụ: Lễ cầu siêu tại chùa làng" /></div>
          <div className="field" style={{ flex: 1, minWidth: 150 }}><label htmlFor="msDate">Ngày</label><input className="input" type="date" id="msDate" value={m.customDate} onChange={e => setM({ ...m, customDate: e.target.value })} /></div></div>}
        {opt('none', 'Không theo dõi mốc nào')}
      </div>
      <ErrorBanner err={err} />
      <p className="note">Ngày âm lịch tính theo thuật toán lịch âm Việt Nam (múi giờ +7).</p>
      <div style={{ display: 'flex', gap: 10 }}><button className="btn primary" style={{ flex: 1 }} onClick={() => { const e = update(d => saveMilestones(d, m)); if (e) setErr(e); else { toast('Đã lưu mốc tưởng niệm. App sẽ nhắc trước mỗi mốc.'); nav(`${base}/hau-tang`); } }}>Lưu mốc tưởng niệm</button>
        <button className="btn" onClick={() => nav(`${base}/hau-tang`)}>Để sau</button></div>
    </div>
  );
}

/* ---------- S-AFT-04 ---------- */
const MS_TASK: Record<string, string[]> = { d49: ['m15b', 'c15a'], d100: ['m15c', 'c15a'], gio: [], custom: [] };
export function MilestonePage() { return <PaidGate module="Hậu tang"><Milestone /></PaidGate>; }
function Milestone() {
  const { mid = '' } = useParams();
  const { c, base, openSheet } = useCase();
  const nav = useNavigate();
  const m = milestoneList(c).find(x => x.key === mid);
  if (!m) return <div className="page"><div className="empty"><span>Không tìm thấy mốc này.</span><Link className="btn" to={`${base}/hau-tang`}>Về Hậu tang</Link></div></div>;
  const vis = visibleTasks(c);
  const related = vis.filter(t => MS_TASK[mid]?.includes(t.id) || (t.kind === 'own' && t.phase === 15 && t.title.toLowerCase().includes(m.name.toLowerCase().replace(/^lễ /, ''))));
  const daysLeft = m.date ? Math.ceil((m.date.getTime() - Date.now()) / 86400000) : null;
  return (
    <div className="page" style={{ maxWidth: 760 }}><div><div className="eyebrow">Mốc tưởng niệm</div><h1 style={{ fontSize: 24, marginTop: 4 }}>{m.name}</h1></div>
      <section className="card card-pad"><dl className="kv"><dt>Ngày</dt><dd className="num">{m.solar}</dd>{m.lunar && <><dt>Âm lịch</dt><dd>{m.lunar}</dd></>}
        {daysLeft !== null && <><dt>Còn</dt><dd>{daysLeft > 0 ? `${daysLeft} ngày` : daysLeft === 0 ? 'Hôm nay' : 'Đã qua'}</dd></>}</dl></section>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Việc cho mốc này</h3>
        <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => openSheet({ type: 'taskform', mode: 'new', phase: 15 })}><Icon n="plus" c="sm" />Thêm việc</button></div>
        {related.length ? <div className="list">{related.map(t => <button key={t.id} className="row" onClick={() => nav(`${base}/viec/${t.id}`, { state: { from: `hau-tang/moc/${mid}` } })}><div className="grow"><div className="title">{t.title}</div>
          <div className="meta"><OwnerPill owner={t.owner} status={t.status} /><span>{t.due}</span></div></div><Icon n="chev" c="chev" /></button>)}</div>
          : <p className="muted" style={{ padding: '0 16px 14px' }}>Thêm việc như mời thầy, đặt cỗ, báo họ hàng — đặt tên có chữ “{m.name}” để việc hiện ở đây.</p>}</section>
      <p className="note">App nhắc trong mục Thông báo trước mỗi mốc. Nhắc qua tin nhắn mở ở giai đoạn sau.</p>
    </div>
  );
}

/* ---------- S-AFT-05 ---------- */
export function ThanksPage() { return <PaidGate module="Hậu tang"><Thanks /></PaidGate>; }
function Thanks() {
  const { c, base, update } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const [F, setF] = useState('all');
  const kids = children(c.members), dn = DN_TEXT(c), after = c.after!;
  const who = (x: { group: string | null; of: string | null }) => (x.group === 'Bạn bè' && x.of && x.of !== 'cu' ? x.of : 'family');
  const L = (c.ledger ?? []).filter(x => F === 'all' || who(x) === F);
  const done = L.filter(x => after.thanked[x.id]).length;
  const order = [...kids.map(k => k.id), 'family'].filter(w => L.some(x => who(x) === w));
  const head = (w: string) => { if (w === 'family') return `Khách chung gia đình · ${c.members[0].name} thay mặt gia đình cảm ơn`; const k = kids.find(y => y.id === w)!; return `Khách của ${k.short} (${k.rel}) · ${k.short} cảm ơn`; };
  const txt = after.thankText || defaultThanks(dn);
  const copy = async () => { try { await navigator.clipboard.writeText(L.map(x => `- ${x.name} (${x.group ?? 'Khác'})`).join('\n')); toast('Đã sao chép danh sách'); } catch { toast('Không sao chép được'); } };
  return (
    <div className="page"><div className="page-title"><div><div className="eyebrow">Hậu tang</div><h1 style={{ marginTop: 4 }}>Danh sách cảm ơn</h1><p>Lấy từ Sổ phúng viếng · mỗi người con cảm ơn khách của mình</p></div>
      <div className="actions"><button className="btn" onClick={copy}><Icon n="copy" c="sm" />Sao chép danh sách</button></div></div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><div className="segin" role="group" aria-label="Lọc theo người">
        {[['all', 'Tất cả'], ...kids.map(k => [k.id, k.short[0].toUpperCase() + k.short.slice(1)]), ['family', 'Chung gia đình']].map(([k, l]) => <button key={k} aria-pressed={F === k} onClick={() => setF(k)}>{l}</button>)}</div>
        <span className="muted num">Đã cảm ơn {done}/{L.length}</span></div>
      <div className="grid-2"><div className="stack">{order.length ? order.map(w => (
        <section key={w} className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>{head(w)}</h3></div>
          <div className="list">{L.filter(x => who(x) === w).map(x => (
            <label key={x.id} className="row" style={{ cursor: 'pointer' }}><input type="checkbox" checked={!!after.thanked[x.id]} onChange={e => update(d => { d.after!.thanked[x.id] = e.target.checked; })} style={{ width: 20, height: 20, accentColor: 'var(--primary)', marginTop: 2 }} />
              <div className="grow"><div className="title">{x.name}</div><div className="meta"><span>{x.group ?? 'Khác'}</span>{x.gifts.length > 0 && <span>{x.gifts.join(', ')}</span>}</div></div>{after.thanked[x.id] && <span className="pill done">Đã cảm ơn</span>}</label>
          ))}</div></section>
      )) : <div className="empty">{c.ledger?.length ? 'Chưa có khách nào trong danh sách này.' : 'Chưa có khách nào được ghi ở Khách viếng.'}</div>}</div>
        <div className="stack"><section className="card card-pad stack" style={{ gap: 10 }}><h3>Lời cảm ơn</h3>
          <textarea className="input" value={txt} onChange={e => update(d => { d.after!.thankText = e.target.value; })} style={{ minHeight: 150 }} aria-label="Lời cảm ơn" />
          {after.thankAuto && <p className="muted" style={{ color: 'var(--warning)' }}><Icon n="alert" c="sm" /> Bản nháp soạn tự động — đọc lại trước khi gửi.</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn sm" onClick={() => update(d => { d.after!.thankText = draftThanks(dn); d.after!.thankAuto = true; })}>Soạn nháp tự động</button>
            <button className="btn sm" onClick={() => nav(`${base}/khach-vieng/trang-tin`)}>Đăng lên trang thông tin</button></div>
          <p className="note">Danh sách chỉ hiện tên, nhóm và lễ vật; số tiền phúng viếng vẫn nằm trong sổ riêng.</p></section></div></div>
    </div>
  );
}

/* ---------- S-AFT-06 ---------- */
export function ClosePage() { return <PaidGate module="Hậu tang"><Close /></PaidGate>; }
function Close() {
  const { c, base, update, isU1 } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  const cc = closeConds(c), all = canClose(cc);
  if (c.after?.closed) return (
    <div className="page" style={{ maxWidth: 760 }}><section className="card"><div className="empty"><Icon n="lotus" c="lg" /><h2 style={{ color: 'var(--text)' }}>Đã khép phần tức thời</h2>
      <p style={{ maxWidth: '48ch' }}>Gia đình đã lo trọn phần việc tang lễ. Các mốc tưởng niệm tiếp tục được nhắc theo lịch.</p><button className="btn primary" onClick={() => nav(`${base}/hau-tang`)}>Xem lịch mốc tưởng niệm</button></div></section></div>
  );
  return (
    <div className="page" style={{ maxWidth: 760 }}><div><div className="eyebrow">Hậu tang</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Khép vòng</h1><p className="muted" style={{ marginTop: 6 }}>Chỉ khép khi mọi điều kiện đã đạt. Việc dài hạn chuyển sang lịch mốc tưởng niệm.</p></div>
      <section className="card">{cc.map((k, i) => (
        <div key={k.label} className={'cond ' + (k.ok ? 'ok' : '')}><span className="mark"><Icon n={k.ok ? 'check' : 'alert'} c="sm" /></span>
          <div className="grow"><div className="title">{k.label}</div>{k.detail && <div className="muted">{k.detail}</div>}</div>
          {!k.ok && <button className="btn sm" onClick={() => nav(`${base}/${CLOSE_GO[i]}`)}>Mở</button>}</div>
      ))}</section>
      <ErrorBanner err={err} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn primary" disabled={!all || !isU1} style={{ flex: 1 }} onClick={() => { const e = update(d => closeCase(d)); if (e) setErr(e); else toast('Đã khép phần tức thời'); }}>Khép phần tức thời</button>
        <button className="btn" onClick={() => nav(`${base}/hau-tang`)}>Về hậu tang</button></div>
      {!isU1 && <p className="muted">Người đại diện gia đình bấm khép vòng.</p>}
    </div>
  );
}
