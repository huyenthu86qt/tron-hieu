// S-MAP-04 · Chi tiết việc (máy tính: chia đôi danh sách | chi tiết)
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  attachEvidence, completeTask, reportIssue, resolveIssue, startTask, takeTask, toggleStep,
} from '../../domain/actions';
import {
  dependencies, findDecision, findTask, issueTasks, lockBlocked, nowTasks, unlocks, VENDOR_CAT_LABEL, visibleTasks, type TaskView,
} from '../../domain/model';
import { PHASES } from '../../domain/templates';
import { Icon } from '../../ui/Icon';
import { Banner, KindPill, LockPill, StatusPill, useApp } from '../../ui/common';
import { memberOf, useCase } from '../CaseContext';
import { OwnerPill, useBackToList, useOpenTask } from '../rows';

const fmtAt = (iso: string) => {
  const d = new Date(iso), p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function TaskPage() {
  const { tid = '' } = useParams();
  const { c, base, me } = useCase();
  const { mobile } = useApp();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? `ban-do`;
  const t = findTask(c, tid);
  const [phaseSel, setPhaseSel] = useState<number | null>(null);
  const open = useOpenTask();

  if (!t) return (
    <div className="page"><div className="empty"><Icon n="alert" c="lg" /><span>Không tìm thấy việc này — có thể đã bị xóa.</span>
      <Link className="btn" to={`${base}/ban-do`}>Về bản đồ</Link></div></div>
  );

  const head = (
    <div><div className="eyebrow">Chặng {t.phase} · {PHASES[t.phase - 1]}</div>
      <h1 style={{ marginTop: 4, fontSize: 24 }}>{t.title}</h1>
      <div className="meta" style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}><StatusPill s={t.status} />{t.lock && <LockPill />}</div></div>
  );

  if (mobile) return <div className="page">{head}<div className="stack"><Detail t={t} /><Actions t={t} /><History t={t} /></div></div>;

  const ctxNow = from === '';
  const ph = phaseSel ?? t.phase;
  const list = ctxNow ? [...issueTasks(c), ...nowTasks(c)] : visibleTasks(c).filter(x => x.phase === ph);
  const pane = (
    <section className="card" style={{ position: 'sticky', top: 0, alignSelf: 'start', maxHeight: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="card-pad" style={{ borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ctxNow ? <><div className="eyebrow">Việc hôm nay</div><h3>Bây giờ</h3></> : <>
          <label className="eyebrow" htmlFor="phSel">Chặng</label>
          <select className="input" id="phSel" value={ph} onChange={e => setPhaseSel(Number(e.target.value))}>
            {PHASES.map((p, i) => <option key={p} value={i + 1}>Chặng {i + 1} · {p}</option>)}
          </select></>}
      </div>
      <div className="list" style={{ overflowY: 'auto' }}>
        {list.length ? list.map(x => {
          const on = x.id === t.id, mine = !!x.owner && x.owner === me.id;
          return (
            <button key={x.id} className={mine && !on ? 'row mine' : 'row'} onClick={() => open(x.id, ctxNow ? '' : `ban-do?chang=${x.phase}`)} aria-current={on ? 'true' : undefined}
              style={on ? { background: 'var(--primary-soft)', boxShadow: 'inset 3px 0 0 var(--accent)' } : undefined}>
              <div className="grow"><div className="title" style={on ? { color: 'var(--primary)', fontWeight: 600 } : undefined}>{x.title}</div>
                <div className="meta"><StatusPill s={x.status} />{x.lock && <Icon n="lock" c="sm" />}<OwnerPill owner={x.owner} /></div></div>
            </button>
          );
        }) : <div className="empty">Không có việc.</div>}
      </div>
      <div className="card-pad" style={{ borderTop: '1px solid var(--border)', paddingBlock: 10 }}>
        <Link className="btn sm ghost" to={ctxNow ? base : `${base}/ban-do?chang=${ph}`}><Icon n="back" c="sm" />{ctxNow ? 'Về màn Bây giờ' : 'Về bản đồ đầy đủ'}</Link>
      </div>
    </section>
  );
  return (
    <div className="page" style={{ maxWidth: 1280 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,360px) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>
        {pane}
        <div className="stack" style={{ minWidth: 0 }}>{head}<Actions t={t} /><Detail t={t} /><History t={t} /></div>
      </div>
    </div>
  );
}

function Detail({ t }: { t: TaskView }) {
  const { c, base, update } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const open = useOpenTask();
  const o = memberOf(c, t.owner);
  const d = t.decision ? findDecision(c, t.decision) : null;
  const decPending = !!d && d.status !== 'decided';
  const { deps, open: openDeps } = dependencies(c, t);
  const next = unlocks(c, t);
  const stepsDone = !t.steps ? 0 : t.status === 'done' ? t.steps.length : t.steps.filter((_, i) => t.stepsDone[i]).length;
  const miniRow = (x: TaskView) => (
    <button key={x.id} className="row" onClick={() => open(x.id, `ban-do?chang=${x.phase}`)} style={{ padding: '10px 0' }}>
      <div className="grow"><div className="title">{x.title}</div>
        <div className="meta"><StatusPill s={x.status} /><span>Chặng {x.phase}</span><OwnerPill owner={x.owner} /></div></div>
      <Icon n="chev" c="chev" />
    </button>
  );
  return <>
    {t.byOrg && <Banner kind="info" icon="team"><b>Do Ban lễ tang phụ trách.</b> Gia đình được thông báo và xác nhận; việc riêng của gia đình vẫn do gia đình quyết.</Banner>}
    <section className="card card-pad stack" style={{ gap: 8 }}><div className="eyebrow">Vì sao có việc này</div>
      <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <KindPill k={t.kind} />{t.why ? <span>Vì: <b>{t.why}</b></span> : <span className="muted">{t.kind === 'opt' ? 'Gia đình tự chọn thêm' : t.kind === 'own' ? 'Gia đình tự thêm' : 'Ai lo đám hiếu cũng cần'}</span>}</div>
      {t.unverified && <p className="muted"><Icon n="alert" c="sm" /> Đây là việc thủ tục. Hướng dẫn chi tiết chỉ hiện khi có nguồn hiện hành đã kiểm chứng.</p>}
    </section>
    <section className="card card-pad"><dl className="kv">
      <dt>Hạn</dt><dd>{t.due}</dd>
      <dt>Người phụ trách</dt><dd>{o ? `${o.name} · ${o.rel}${o.access === 'link' ? ' · nhận qua link' : ''}` : <OwnerPill owner={null} />}</dd>
      {t.assignNote && <><dt>Lời nhắn khi giao</dt><dd>{t.assignNote}</dd></>}
      {t.area && <><dt>Vùng trách nhiệm</dt><dd>{t.area}</dd></>}
      {t.cat && <><dt>Nhà cung cấp</dt><dd>{VENDOR_CAT_LABEL[t.cat]} · <span className="muted">gợi ý bên gần nhất mở ở giai đoạn 2</span></dd></>}
      {t.note && <><dt>Ghi chú</dt><dd>{t.note}</dd></>}
    </dl></section>
    {(d || deps.length > 0) && (
      <section className="card card-pad"><div className="sec-h" style={{ marginBottom: 0 }}><h3>Cần xong trước</h3>{deps.length > 0 && <span className="muted">{deps.length - openDeps.length}/{deps.length} đã xong</span>}</div>
        {d && <div className="row" style={{ padding: '10px 0' }}><div className="grow"><div className="title">Quyết định: {d.title}</div>
          <div className="meta">{decPending ? <span className="pill wait">Chưa quyết</span> : <span className="pill done">Đã quyết</span>}{d.lock && <LockPill />}</div></div>
          {decPending && <button className="btn sm" onClick={() => nav(`${base}/quyet-dinh/${d.id}`)}>Mở quyết định</button>}</div>}
        <div className="list">{deps.map(miniRow)}</div></section>
    )}
    {next.length > 0 && <section className="card card-pad"><div className="sec-h" style={{ marginBottom: 0 }}><h3>Việc tiếp theo chờ việc này</h3></div><div className="list">{next.map(miniRow)}</div></section>}
    {t.steps && (
      <section className="card card-pad"><div className="sec-h" style={{ marginBottom: 4 }}><h3>Cần chuẩn bị</h3><span className="muted">{stepsDone}/{t.steps.length}</span></div>
        {t.steps.map((s, i) => (
          <label key={i} className="check"><input type="checkbox" checked={!!t.stepsDone[i] || t.status === 'done'} disabled={t.status === 'done'}
            onChange={e => update(dr => toggleStep(dr, t.id, i, e.target.checked))} /><span>{s}</span></label>
        ))}</section>
    )}
    <section className="card card-pad stack" style={{ gap: 8 }}><h3>Bằng chứng</h3>
      {t.evidence ? <span className="pill done" style={{ alignSelf: 'flex-start' }}><Icon n="doc" c="sm" />{t.evidence}</span> : <p className="muted">Ảnh, giấy tờ hoặc ghi chú để cả nhà biết việc đã làm thế nào.</p>}
      {(t.status !== 'done' || !t.evidence) && (
        <label className="btn sm file-btn" style={{ alignSelf: 'flex-start' }}><Icon n="plus" c="sm" />{t.evidence ? 'Đổi tệp' : 'Đính ảnh, giấy tờ'}
          <input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) { update(dr => attachEvidence(dr, t.id, f.name)); toast('Đã ghi tên tệp: ' + f.name); } }} /></label>
      )}
      <p className="note">Giai đoạn này app ghi lại tên tệp; lưu tệp lên máy chủ mở ở giai đoạn 3.</p>
    </section>
    {t.status === 'skip' && <Banner kind="info"><b>Không áp dụng cho gia đình</b>{t.skipReason ? ': ' + t.skipReason : ''}.</Banner>}
    {t.status === 'issue' && t.issue && <Banner kind="warn"><b>Có vấn đề:</b> {t.issue} <button className="btn sm" style={{ marginLeft: 8 }} onClick={() => { update(dr => resolveIssue(dr, t.id)); toast('Đã ghi nhận vấn đề đã xử lý'); }}>Đã xử lý</button></Banner>}
  </>;
}

function Actions({ t }: { t: TaskView }) {
  const { c, base, update, openSheet, me } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const back = useBackToList();
  const [issueOpen, setIssueOpen] = useState(false);
  const [issue, setIssue] = useState('');
  const d = t.decision ? findDecision(c, t.decision) : null;
  const decPending = !!d && d.status !== 'decided';
  const blocked = lockBlocked(c, t);
  const openDeps = dependencies(c, t).open;

  let acts;
  if (t.status === 'done') acts = <Banner kind="info" icon="check">Việc đã xong{t.lock ? ' và đã khóa — không mở lại được' : ''}.</Banner>;
  else if (t.status === 'skip') acts = <p className="muted">Việc đang đánh dấu không áp dụng. Mở “Sửa việc” để khôi phục.</p>;
  else if (decPending && d) acts = <>
    <p className="muted">Việc này làm được sau khi anh chốt <b>{d.title}</b>.</p>
    <button className="btn primary block" onClick={() => nav(`${base}/quyet-dinh/${d.id}`)}><Icon n="decide" c="sm" />Mở quyết định</button>
    <button className="btn block" onClick={() => openSheet({ type: 'assign', taskId: t.id })}><Icon n="team" c="sm" />{t.owner ? 'Giao lại' : 'Giao việc'}</button>
  </>;
  else acts = <>
    {!t.owner
      ? <button className="btn block" onClick={() => { update(dr => takeTask(dr, t.id, me.id)); toast('Đã nhận: ' + t.title); }}>Tôi nhận việc</button>
      : t.status === 'todo' && <button className="btn block" onClick={() => { update(dr => startTask(dr, t.id)); toast('Đã chuyển sang Đang làm'); }}>Bắt đầu làm</button>}
    <button className="btn primary block" disabled={blocked} onClick={() => {
      if (t.lock) { openSheet({ type: 'lock', taskId: t.id }); return; }
      const e = update(dr => completeTask(dr, t.id));
      toast(e ?? `Đã xong: ${t.title}. Đây là các việc tiếp theo.`);
      if (!e) back();
    }}><Icon n="check" c="sm" />{t.byOrg ? 'Xác nhận Ban lễ tang đã làm xong' : 'Đánh dấu xong'}</button>
    {blocked
      ? <p className="muted" style={{ color: 'var(--danger)' }}><Icon n="lock" c="sm" /> Việc không thể quay lại: cần xong {openDeps.length} việc phía trước mới được đánh dấu xong.</p>
      : openDeps.length > 0 && <p className="muted"><Icon n="alert" c="sm" /> Còn {openDeps.length} việc phía trước chưa xong.</p>}
    <button className="btn block" onClick={() => openSheet({ type: 'assign', taskId: t.id })}><Icon n="team" c="sm" />{t.owner ? 'Giao lại' : 'Giao việc'}</button>
    {t.owner === me.id && <button className="btn block ghost" onClick={() => openSheet({ type: 'return', taskId: t.id })}><Icon n="back" c="sm" />Trả lại việc — tôi không làm được</button>}
    {t.status !== 'issue' && (issueOpen
      ? <div className="stack" style={{ gap: 8 }}>
          <div className="field"><label htmlFor="issueTxt">Gặp vấn đề gì?</label><textarea className="input" id="issueTxt" value={issue} onChange={e => setIssue(e.target.value)} placeholder="Ví dụ: Rạp chưa xác nhận giờ dựng" /></div>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn sm primary" disabled={!issue.trim()} onClick={() => { update(dr => reportIssue(dr, t.id, issue)); setIssueOpen(false); setIssue(''); toast('Đã báo vấn đề — hiện ở mục Có vấn đề'); }}>Gửi</button>
            <button className="btn sm ghost" onClick={() => setIssueOpen(false)}>Hủy</button></div></div>
      : <button className="btn block ghost" onClick={() => setIssueOpen(true)}><Icon n="alert" c="sm" />Báo vấn đề</button>)}
  </>;
  return (
    <section className="card card-pad stack" style={{ gap: 10 }}>{acts}
      <button className="btn block ghost" onClick={() => openSheet({ type: 'taskform', mode: 'edit', id: t.id })}><Icon n="settings" c="sm" />Sửa việc</button>
    </section>
  );
}

function History({ t }: { t: TaskView }) {
  const { c } = useCase();
  const own = c.history.filter(h => h.taskId === t.id);
  const first = t.kind === 'own' ? null : `App tự sinh việc này ${t.kind === 'cond' && t.why ? 'vì: ' + t.why : t.kind === 'opt' ? '(gia đình chọn thêm)' : '(việc bắt buộc)'}`;
  return (
    <section className="card card-pad"><div className="eyebrow" style={{ marginBottom: 6 }}>Lịch sử</div>
      <div className="muted" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {first && <span>{fmtAt(c.createdAt)} · {first}</span>}
        {own.map((h, i) => <span key={i}>{fmtAt(h.at)} · {h.text}</span>)}
      </div>
    </section>
  );
}
