// S-DEC-01 · Cần quyết · S-DEC-02 · Chi tiết quyết định · S-DEC-03 · Xác nhận thay đổi + tác động
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Form, Venue } from '../../domain/types';
import {
  changeDecision, decide, decisionViews, findDecision, FORM_LABEL, impactOfForm, impactOfOrg, impactOfTime, impactOfVenue,
  pendingDecisions, VENUE_LABEL, type DecisionView, type Impact,
} from '../../domain/model';
import { Icon } from '../../ui/Icon';
import { Banner, LockPill, useApp } from '../../ui/common';
import { useCase } from '../CaseContext';
import { DecRow } from '../rows';

export function ImpactList({ L }: { L: Impact }) {
  const map: [keyof Impact, string][] = [['viec', 'Việc'], ['quyet', 'Quyết định'], ['nguoi', 'Người'], ['chiphi', 'Chi phí'], ['ncc', 'Nhà cung cấp'], ['khach', 'Khách']];
  return (
    <div className="impact">{map.filter(([k]) => L[k]?.length).map(([k, l]) => (
      <div key={k} className="grp"><div className="lbl">{l}</div><ul>{L[k]!.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
    ))}</div>
  );
}

export function DecisionsPage() {
  const { c } = useCase();
  const { mobile } = useApp();
  const pd = pendingDecisions(c), recent = decisionViews(c).filter(d => d.status === 'decided');
  const main = <>
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>Cần anh quyết</h3><span className="muted">{pd.length}</span></div>
      {pd.length ? <div className="list">{pd.map(d => <DecRow key={d.id} d={d} />)}</div> : <div className="empty"><Icon n="check" c="lg" /><span>Không có quyết định nào đang chờ.</span></div>}</section>
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>Cần anh duyệt</h3><span className="muted">0</span></div>
      <div className="empty"><span>Không có đề nghị nào đang chờ.</span></div></section>
  </>;
  const side = <>
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>Đã quyết gần đây</h3></div>
      {recent.length ? <div className="list">{recent.map(d => <DecRow key={d.id} d={d} />)}</div> : <div className="empty"><span>Chưa có quyết định nào được chốt.</span></div>}</section>
    <Banner kind="info" icon="lock">Mục có nhãn <b>Không thể quay lại</b> cần chốt trước hạn; sau đó app không cho sửa.</Banner>
  </>;
  return (
    <div className="page"><div className="page-title"><div><h1>Cần quyết</h1><p>Những điều chỉ người đại diện gia đình mới quyết</p></div></div>
      {mobile ? <>{main}{side}</> : <div className="grid-2"><div className="stack">{main}</div><div className="stack">{side}</div></div>}</div>
  );
}

function impactFor(c: Parameters<typeof impactOfForm>[0], d: DecisionView, pick: string | null, changing: boolean): Impact | null {
  if (!pick) return null;
  if (d.key === 'venue') return changing ? impactOfVenue(c, pick as Venue) : null;
  if (d.key === 'form') return changing ? impactOfForm(c, pick as Form) : null;
  if (d.key === 'time') return impactOfTime(c);
  return impactOfOrg(pick);
}

export function DecisionPage() {
  const { did = '' } = useParams();
  const { c, base, update } = useCase();
  const { mobile, toast } = useApp();
  const nav = useNavigate();
  const d = findDecision(c, did);
  const [pickState, setPick] = useState<string | null>(null);
  const [detail, setDetail] = useState(d?.detail ?? '');
  if (!d) return <div className="page"><div className="empty"><span>Không tìm thấy quyết định này.</span><Link className="btn" to={`${base}/can-quyet`}>Về Cần quyết</Link></div></div>;

  const pick = pickState ?? (d.status === 'decided' ? d.chosen : null);
  const changing = d.status === 'decided' && !!pick && pick !== d.chosen;
  const L = impactFor(c, d, pick, changing);
  const lockedTime = d.key === 'time' && d.status === 'decided';

  const go = () => {
    if (!pick) return;
    if (changing && (d.key === 'venue' || d.key === 'form')) { nav(`${base}/quyet-dinh/${d.id}/thay-doi?chon=${pick}`); return; }
    if (d.key === 'time' && pick === 'c' && !detail.trim()) { toast('Ghi ngày giờ cụ thể cho phương án “Ngày giờ khác”'); return; }
    if (changing) update(x => changeDecision(x, d.id, pick, ''));
    else update(x => decide(x, d.id, pick, d.key === 'time' ? detail : undefined));
    toast(d.key === 'org' ? (pick === 'ok' ? 'Đã xác nhận lịch lễ với Ban lễ tang' : 'Đã gửi đề nghị điều chỉnh tới Ban lễ tang') : `Đã chốt ${d.title.toLowerCase()}: ${d.options.find(o => o.k === pick)?.label}`);
    nav(`${base}/can-quyet`);
  };

  const eyebrow = d.kind === 'org' ? (d.lead ? 'Ban lễ tang chủ trì — gia đình được thông báo, góp ý' : 'Do Ban lễ tang quyết — gia đình xác nhận') : d.status === 'decided' ? (lockedTime ? 'Đã chốt · không thể quay lại' : 'Đã quyết · có thể thay đổi') : 'Cần anh quyết';
  const detailView = (
    <div className="stack">
      <div><div className="eyebrow">{eyebrow}</div><h1 style={{ fontSize: 24, marginTop: 4 }}>{d.title}</h1>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>{d.lock && <LockPill />}{d.due && d.status === 'pending' && <span className="pill soft">{d.due}</span>}</div></div>
      <div className="opts" role="radiogroup">{d.options.map(o => (
        <button key={o.k} className="opt" role="radio" aria-checked={pick === o.k} disabled={lockedTime} onClick={() => setPick(o.k)}>
          <span className="radio" /><span><span className="title">{o.label}</span>{d.chosen === o.k && d.status === 'decided' && <> <span className="pill done">Hiện tại</span></>}<br /><span className="muted">{o.note}</span></span>
        </button>
      ))}</div>
      {d.key === 'time' && !lockedTime && (
        <div className="field"><label htmlFor="decDetail">Giờ cụ thể{pick === 'c' ? ' (bắt buộc)' : ' (nếu đã có)'}</label>
          <input className="input" id="decDetail" value={detail} onChange={e => setDetail(e.target.value)} placeholder="Ví dụ: 8:00 — theo giờ còn chỗ đã đăng ký" /></div>
      )}
      {lockedTime && d.detail && <p className="muted">Giờ cụ thể: <b style={{ color: 'var(--text)' }}>{d.detail}</b></p>}
      {L && <section className="card card-pad"><div className="sec-h" style={{ marginBottom: 4 }}><h3>Nếu chọn phương án này</h3></div><ImpactList L={L} /></section>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {lockedTime ? <p className="muted">Giờ đã chốt và khóa. Nếu buộc phải đổi, đổi hình thức an táng hoặc liên hệ trực tiếp nơi đã đăng ký.</p>
          : d.status === 'decided' && !changing ? <p className="muted">Chọn phương án khác để xem tác động trước khi đổi.</p>
          : <button className="btn primary" onClick={go} disabled={!pick} style={{ flex: 1 }}>{changing ? 'Tiếp tục — xem lại thay đổi' : 'Chốt quyết định'}</button>}
        <button className="btn" onClick={() => nav(`${base}/can-quyet`)}>Để sau</button>
      </div>
      {d.lock && !lockedTime && <p className="note">Sau khi chốt, quyết định này không sửa được nữa.</p>}
    </div>
  );
  if (mobile) return <div className="page">{detailView}</div>;
  const all = [...pendingDecisions(c), ...decisionViews(c).filter(x => x.status === 'decided')];
  return (
    <div className="page"><div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,340px) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>
      <section className="card"><div className="list">{all.map(x => <DecRow key={x.id} d={x} current={x.id === d.id} />)}</div></section>
      {detailView}
    </div></div>
  );
}

export function ChangePage() {
  const { did = '' } = useParams();
  const [params] = useSearchParams();
  const { c, base, update } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const d = findDecision(c, did);
  const [note, setNote] = useState('');
  if (!d || (d.key !== 'venue' && d.key !== 'form') || !d.chosen) return <div className="page"><div className="empty"><span>Không có thay đổi nào để xác nhận.</span><Link className="btn" to={`${base}/can-quyet`}>Về Cần quyết</Link></div></div>;
  const isForm = d.key === 'form';
  const to = params.get('chon') ?? (isForm ? (d.chosen === 'cremation' ? 'burial' : 'cremation') : (d.chosen === 'home' ? 'hall' : 'home'));
  const L = isForm ? impactOfForm(c, to as Form) : impactOfVenue(c, to as Venue);
  const label = (k: string) => isForm ? FORM_LABEL[k as Form] : VENUE_LABEL[k as Venue];
  const apply = () => {
    update(x => changeDecision(x, d.id, to, note));
    if (isForm) { nav(`${base}/ban-do`); toast(`Đã đổi sang ${FORM_LABEL[to as Form].toLowerCase()}. Bản đồ đã sinh lại việc theo hình thức mới.`); }
    else { nav(`${base}/can-quyet`); toast('Đã đổi nơi tổ chức. Bản đồ đã sinh lại việc theo nơi mới.'); }
  };
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div><div className="eyebrow">Xác nhận thay đổi</div><h1 style={{ fontSize: 24, marginTop: 4 }}>{isForm ? 'Đổi hình thức an táng' : 'Đổi nơi tổ chức lễ viếng'}</h1></div>
      <section className="card card-pad" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><span><s className="muted">{label(d.chosen)}</s></span><Icon n="chev" /><b>{label(to)}</b></section>
      <section className="card card-pad"><div className="sec-h"><h3>Thay đổi này sẽ lan tới</h3></div><ImpactList L={L} /></section>
      <div className="field"><label htmlFor="chgNote">Lý do thay đổi (lưu vào lịch sử, mọi người cùng thấy)</label>
        <textarea className="input" id="chgNote" value={note} onChange={e => setNote(e.target.value)} placeholder={isForm ? 'Ví dụ: Họ hàng bên nội mong muốn an táng tại khu mộ dòng họ; gia đình đã thống nhất.' : 'Ví dụ: Nhà chật, dự kiến đông khách; gia đình đã thống nhất.'} /></div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={apply} style={{ flex: 1 }}>Xác nhận thay đổi</button>
        <button className="btn" onClick={() => nav(`${base}/quyet-dinh/${d.id}`)}>Quay lại</button></div>
    </div>
  );
}
