// S-MAP-01 · Bây giờ
import { useNavigate } from 'react-router-dom';
import { currentPhase, FORM_LABEL, issueTasks, nowTasks, pendingDecisions, portraitIcon, soonTasks } from '../../domain/model';
import { venueLabel } from '../../domain/vendors';
import { lifeSpan } from '../../domain/person';
import { PHASES } from '../../domain/templates';
import { Icon } from '../../ui/Icon';
import { Banner, useApp } from '../../ui/common';
import { DN, inScope, useCase } from '../CaseContext';
import { DecRow, TaskRow } from '../rows';

export function Memorial() {
  const { c, base, isU1 } = useCase();
  const nav = useNavigate();
  const cur = currentPhase(c);
  return (
    <section className="memorial">
      {c.person.photo
        ? <div className="portrait" style={{ padding: 0, overflow: 'hidden' }}><img src={c.person.photo} alt="Ảnh thờ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
        : <div className="portrait"><Icon n={portraitIcon(c.situation.rite)} c="lg" /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div className="eyebrow" style={{ flex: 1 }}>Thành kính tưởng nhớ</div>
          {isU1 && <button className="btn sm ghost" onClick={() => nav(`${base}/ho-so`)}>{c.person.name ? 'Sửa hồ sơ' : 'Nhập hồ sơ'}</button>}</div>
        <h2>{DN(c)}</h2>
        <div className="sub num">{lifeSpan(c.person)} · {venueLabel(c)} · {FORM_LABEL[c.situation.form]}</div>
        <div className="phase-bar" aria-label="Tiến độ chặng">{PHASES.map((_, i) => <i key={i} className={i + 1 < cur ? 'done' : i + 1 === cur ? 'cur' : ''} />)}</div>
        <div className="muted" style={{ marginTop: 4 }}>Chặng {cur}/15 · {PHASES[cur - 1]}</div>
      </div>
    </section>
  );
}

export function NowPage() {
  const { c, me, base, isU1 } = useCase();
  const { mobile } = useApp();
  const nav = useNavigate();
  const pd = pendingDecisions(c);
  const scope = nowTasks(c).filter(t => inScope(me, t));
  const nt = c.mourning ? scope.filter(t => t.owner === me.id || !t.owner) : scope;
  const it = issueTasks(c).filter(t => inScope(me, t)), st = soonTasks(c).filter(t => inScope(me, t));

  const decBlock = (
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>{isU1 ? 'Cần anh quyết' : 'Đang chờ người đại diện quyết'}</h3><span className="muted">{pd.length} mục</span></div>
      {pd.length ? <div className="list">{pd.map(d => <DecRow key={d.id} d={d} />)}</div> : <div className="empty"><Icon n="check" c="lg" /><span>Không có gì đang chờ anh quyết.</span></div>}</section>
  );
  const nowBlock = (
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>Bây giờ</h3><span className="muted">{c.mourning ? 'Chỉ việc của anh và việc chưa có người nhận' : nt.length + ' việc'}</span></div>
      {nt.length ? <div className="list">{nt.map(t => <TaskRow key={t.id} t={t} from="" />)}</div> : <div className="empty"><Icon n="check" c="lg" /><span>Mọi việc hiện đã có người lo.</span></div>}</section>
  );
  const issBlock = it.length > 0 && (
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3 style={{ color: 'var(--danger)' }}>Có vấn đề</h3></div>
      <div className="list">{it.map(t => <TaskRow key={t.id} t={t} from="" />)}</div></section>
  );
  const soon = c.mourning
    ? <Banner kind="info" icon="bell"><b>Chế độ tang gia đang bật.</b> App chỉ báo anh điều cần quyết; việc sắp tới do mọi người tự theo dõi.</Banner>
    : <section className="card"><details className="fold" style={{ borderTop: 0 }}><summary><Icon n="chev" c="chev" />Sắp tới <span className="muted" style={{ marginLeft: 'auto' }}>{st.length} việc</span></summary>
        <div className="list">{st.map(t => <TaskRow key={t.id} t={t} acts={false} from="" />)}</div>
        <div className="card-pad" style={{ paddingTop: 6 }}><button className="btn sm ghost" onClick={() => nav(`${base}/ban-do?xem=sap-toi`)}>Xem theo góc nhìn: Sắp tới · Có vấn đề · Đã xong</button></div></details></section>;

  if (mobile) return <div className="page"><Memorial />{pd.length > 0 && decBlock}{nowBlock}{issBlock}{soon}</div>;
  return (
    <div className="page"><Memorial />
      <div className="grid-2"><div className="stack">{nowBlock}{issBlock}</div><div className="stack">{decBlock}{soon}</div></div>
    </div>
  );
}
