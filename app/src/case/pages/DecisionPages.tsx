// S-DEC-01 Cần quyết / Cần duyệt · S-DEC-02 Chi tiết quyết định · S-DEC-03 Xác nhận thay đổi + tác động
// S-DEC-04 Duyệt / từ chối đề nghị chi · S-DEC-06 Lịch sử quyết định
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Expense, Form, Venue } from '../../domain/types';
import {
  changeDecision, decide, decisionViews, findDecision, FORM_LABEL, impactOfForm, impactOfOrg, impactOfTime, impactOfVenue,
  pendingDecisions, type DecisionView, type Impact,
} from '../../domain/model';
import { afterVenueChange, catName, resolveVendorDecision, suggestionSnapshot, venueLabel } from '../../domain/vendors';
import { decideExpense, expenseMember, METHOD_LABEL, money } from '../../domain/finance';
import { Icon } from '../../ui/Icon';
import { Banner, ErrorBanner, LockPill, Sheet, useApp } from '../../ui/common';
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

/* ---------- S-DEC-04 ---------- */
export function ApprovalSheet({ e, onClose }: { e: Expense; onClose: () => void }) {
  const { c, update, canFin } = useCase();
  const { toast } = useApp();
  const [reason, setReason] = useState('');
  const [no, setNo] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const go = (approve: boolean) => {
    if (!approve && !reason.trim()) { setErr('Ghi lý do để người đề nghị biết.'); return; }
    const x = update(d => decideExpense(d, e.id, approve, reason));
    if (x) { setErr(x); return; }
    onClose(); toast(approve ? `Đã duyệt. ${expenseMember(c.members, e.requestedBy)} nhận thông báo.` : 'Đã gửi phản hồi không duyệt.');
  };
  return (
    <Sheet title="Duyệt đề nghị chi" onClose={onClose} foot={no
      ? <><button className="btn" onClick={() => setNo(false)}>Quay lại</button><button className="btn danger" onClick={() => go(false)}>Không duyệt</button></>
      : <><button className="btn" onClick={() => setNo(true)}>Không duyệt</button><button className="btn primary" onClick={() => go(true)}><Icon n="check" c="sm" />Duyệt</button></>}>
      <section className="card card-pad"><dl className="kv">
        <dt>Khoản chi</dt><dd>{e.name}{e.extra ? <> <span className="pill issue">Phát sinh</span></> : null}</dd>
        <dt>Số tiền</dt><dd className="num" style={{ fontWeight: 600, fontSize: 18 }}>{money(e.amount)}</dd>
        <dt>Người đề nghị</dt><dd>{expenseMember(c.members, e.requestedBy)}</dd>
        <dt>Người chi</dt><dd>{expenseMember(c.members, e.payer)} · {e.method ? METHOD_LABEL[e.method] : '—'}</dd>
        {e.method === 'bank' && e.payee && canFin && <><dt>Bên nhận</dt><dd>{e.payee.holder} · {e.payee.bank} · <span className="num">{e.payee.acct}</span></dd></>}
        {e.reason && <><dt>Lý do</dt><dd>{e.reason}</dd></>}
        <dt>Chứng từ</dt><dd>{e.evidence ? <span className="pill done">{e.evidence}</span> : <span className="muted">Chưa có</span>}</dd>
      </dl></section>
      {no && <div className="field"><label htmlFor="rjReason">Vì sao không duyệt?</label><textarea className="input" id="rjReason" value={reason} onChange={x => setReason(x.target.value)} placeholder="Ví dụ: cơ quan đã gửi hoa, không cần đặt thêm" /></div>}
      <ErrorBanner err={err} />
    </Sheet>
  );
}

export function DecisionsPage() {
  const { c, base, isU1 } = useCase();
  const { mobile } = useApp();
  const nav = useNavigate();
  const [ap, setAp] = useState<Expense | null>(null);
  const pd = pendingDecisions(c), recent = decisionViews(c).filter(d => d.status === 'decided');
  const reqs = (c.finance?.expenses ?? []).filter(e => e.status === 'request');
  const main = <>
    {!isU1 && <Banner kind="info" icon="lock">Chỉ người đại diện gia đình chốt quyết định và duyệt chi. Anh/chị xem để nắm tình hình.</Banner>}
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>Cần anh quyết</h3><span className="muted">{pd.length}</span></div>
      {pd.length ? <div className="list">{pd.map(d => <DecRow key={d.id} d={d} />)}</div> : <div className="empty"><Icon n="check" c="lg" /><span>Không có quyết định nào đang chờ.</span></div>}</section>
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>Cần anh duyệt</h3><span className="muted">{reqs.length}</span></div>
      {reqs.length ? <div className="list">{reqs.map(e => (
        <div key={e.id} className="row"><span className="num-badge"><Icon n="wallet" c="sm" /></span>
          <div className="grow"><div className="title">Đề nghị chi {money(e.amount)} — {e.name}</div>
            <div className="meta"><span>Từ: {expenseMember(c.members, e.requestedBy)}</span>{e.evidence ? <span>Kèm chứng từ</span> : <span>Chưa có chứng từ</span>}</div>
            {isU1 && <div className="acts"><button className="btn sm primary" onClick={() => setAp(e)}>Xem và duyệt</button></div>}</div></div>
      ))}</div> : <div className="empty"><span>Không có đề nghị nào đang chờ.</span></div>}</section>
  </>;
  const side = <>
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 6 }}><h3>Đã quyết gần đây</h3><button className="btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => nav(`${base}/quyet-dinh`)}>Lịch sử</button></div>
      {recent.length ? <div className="list">{recent.map(d => <DecRow key={d.id} d={d} />)}</div> : <div className="empty"><span>Chưa có quyết định nào được chốt.</span></div>}</section>
    <Banner kind="info" icon="lock">Mục có nhãn <b>Không thể quay lại</b> cần chốt trước hạn; sau đó app không cho sửa.</Banner>
  </>;
  return (
    <div className="page"><div className="page-title"><div><h1>Cần quyết</h1><p>Những điều chỉ người đại diện gia đình mới quyết</p></div></div>
      {mobile ? <>{main}{side}</> : <div className="grid-2"><div className="stack">{main}</div><div className="stack">{side}</div></div>}
      {ap && <ApprovalSheet e={ap} onClose={() => setAp(null)} />}</div>
  );
}

/* ---------- S-DEC-06 ---------- */
export function DecisionHistoryPage() {
  const { c } = useCase();
  const L = c.history.filter(h => /^(Chốt|Đổi|Duyệt|Không duyệt|Chọn|Kích hoạt|Khóa)/.test(h.text)).slice().reverse();
  return (
    <div className="page" style={{ maxWidth: 820 }}><div className="page-title"><div><h1>Lịch sử quyết định</h1><p>Ai đã chốt gì, lúc nào — để cả nhà cùng rõ</p></div></div>
      <section className="card">{L.length ? <div className="list">{L.map((h, i) => (
        <div key={i} className="row"><span className="num-badge"><Icon n="decide" c="sm" /></span><div className="grow"><div className="title">{h.text}</div><div className="meta"><span>{new Date(h.at).toLocaleString('vi-VN')}</span></div></div></div>
      ))}</div> : <div className="empty"><span>Chưa có quyết định nào.</span></div>}</section></div>
  );
}

function impactFor(c: Parameters<typeof impactOfForm>[0], d: DecisionView, pick: string | null, changing: boolean): Impact | null {
  if (!pick) return null;
  if (d.key === 'venue') return changing ? impactOfVenue(c, pick as Venue) : null;
  if (d.key === 'form') return changing ? impactOfForm(c, pick as Form) : null;
  if (d.key === 'time') return impactOfTime(c);
  if (d.key === 'vendor') {
    const cur = d.vendorInfo?.[d.vendorId ?? '']?.name ?? 'bên đã cam kết';
    return pick === 'keep'
      ? { ncc: [`Giữ ${cur} — người lo Xe cộ báo nhà xe địa chỉ đón mới`], chiphi: ['Nhà xe có thể tính thêm phí quãng đường — chưa có báo giá'] }
      : { ncc: [`Chọn ${d.vendorInfo?.[pick]?.name ?? pick} — chờ cam kết`, `${cur}: thêm việc “Báo hủy và thỏa thuận phí”`], chiphi: [`Có thể mất cọc với ${cur} — chưa rõ`] };
  }
  return impactOfOrg(pick);
}

export function DecisionPage() {
  const { did = '' } = useParams();
  const { c, base, update, isU1 } = useCase();
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
  const readOnly = !isU1 || lockedTime || (d.key === 'vendor' && d.status === 'decided');

  const go = () => {
    if (!pick) return;
    if (changing && (d.key === 'venue' || d.key === 'form')) { nav(`${base}/quyet-dinh/${d.id}/thay-doi?chon=${pick}`); return; }
    if (d.key === 'venue' && pick !== c.situation.venue) { nav(`${base}/quyet-dinh/${d.id}/thay-doi?chon=${pick}`); return; }
    if (d.key === 'time' && pick === 'c' && !detail.trim()) { toast('Ghi ngày giờ cụ thể cho phương án “Ngày giờ khác”'); return; }
    if (d.key === 'vendor') update(x => resolveVendorDecision(x, d.id, pick));
    else if (changing) update(x => changeDecision(x, d.id, pick, ''));
    else update(x => decide(x, d.id, pick, d.key === 'time' ? detail : undefined));
    toast(d.key === 'org' ? (pick === 'ok' ? 'Đã xác nhận lịch lễ với Ban lễ tang' : 'Đã gửi đề nghị điều chỉnh tới Ban lễ tang')
      : d.key === 'vendor' ? (pick === 'keep' ? 'Giữ bên đã cam kết. Người lo Xe cộ báo địa chỉ đón mới.' : 'Đã chọn bên mới. Đã tạo việc báo hủy với bên cũ.')
      : `Đã chốt ${d.title.toLowerCase()}: ${d.options.find(o => o.k === pick)?.label}`);
    nav(`${base}/can-quyet`);
  };

  const eyebrow = d.kind === 'org' ? (d.lead ? 'Ban lễ tang chủ trì — gia đình được thông báo, góp ý' : 'Do Ban lễ tang quyết — gia đình xác nhận')
    : d.kind === 'vendor' ? 'Nhà cung cấp · tự tạo khi đổi nơi tổ chức'
    : d.status === 'decided' ? (lockedTime ? 'Đã chốt · không thể quay lại' : 'Đã quyết · có thể thay đổi') : 'Cần anh quyết';
  const wishDiff = d.wish && pick && pick !== d.wish.value;
  const detailView = (
    <div className="stack">
      <div><div className="eyebrow">{eyebrow}</div><h1 style={{ fontSize: 24, marginTop: 4 }}>{d.title}</h1>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>{d.lock && <LockPill />}{d.due && d.status === 'pending' && <span className="pill soft">{d.due}</span>}</div></div>
      {d.wish && <section className="card card-pad" style={{ background: 'var(--memorial)', borderColor: 'var(--memorial-edge)' }}><div className="eyebrow">Nguyện vọng đã chuẩn bị</div>
        <p style={{ marginTop: 4, fontFamily: 'var(--serif)' }}>“{d.wish.text}”</p>
        {wishDiff && <p className="muted" style={{ marginTop: 6, color: 'var(--warning)' }}><Icon n="alert" c="sm" /> Phương án đang chọn khác với nguyện vọng đã chuẩn bị.</p>}</section>}
      {d.kind === 'vendor' && <Banner kind="upd" icon="pin">Nơi tổ chức đã đổi sang <b>{venueLabel(c)}</b>. {catName(d.cat!)} đã cam kết nên app <b>không tự thay</b> — anh quyết giữ hay đổi.</Banner>}
      {!isU1 && <Banner kind="info" icon="lock">Chỉ người đại diện gia đình chốt quyết định này.</Banner>}
      <div className="opts" role="radiogroup">{d.options.map(o => (
        <button key={o.k} className="opt" role="radio" aria-checked={pick === o.k} disabled={readOnly} onClick={() => setPick(o.k)}>
          <span className="radio" /><span><span className="title">{o.label}</span>{d.chosen === o.k && d.status === 'decided' && <> <span className="pill done">Hiện tại</span></>}<br /><span className="muted">{o.note}</span></span>
        </button>
      ))}</div>
      {d.key === 'time' && !lockedTime && isU1 && (
        <div className="field"><label htmlFor="decDetail">Giờ cụ thể{pick === 'c' ? ' (bắt buộc)' : ' (nếu đã có)'}</label>
          <input className="input" id="decDetail" value={detail} onChange={e => setDetail(e.target.value)} placeholder="Ví dụ: 8:00 — theo giờ còn chỗ đã đăng ký" /></div>
      )}
      {lockedTime && d.detail && <p className="muted">Giờ cụ thể: <b style={{ color: 'var(--text)' }}>{d.detail}</b></p>}
      {L && isU1 && <section className="card card-pad"><div className="sec-h" style={{ marginBottom: 4 }}><h3>Nếu chọn phương án này</h3></div><ImpactList L={L} /></section>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {lockedTime ? <p className="muted">Giờ đã chốt và khóa. Nếu buộc phải đổi, đổi hình thức an táng hoặc liên hệ trực tiếp nơi đã đăng ký.</p>
          : readOnly ? null
          : d.status === 'decided' && !changing ? <p className="muted">Chọn phương án khác để xem tác động trước khi đổi.</p>
          : <button className="btn primary" onClick={go} disabled={!pick} style={{ flex: 1 }}>{changing || (d.key === 'venue' && pick && pick !== c.situation.venue) ? 'Tiếp tục — xem lại thay đổi' : 'Chốt quyết định'}</button>}
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
  const { c, base, update, dir, isU1 } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const d = findDecision(c, did);
  const [note, setNote] = useState('');
  if (!isU1 || !d || (d.key !== 'venue' && d.key !== 'form')) return <div className="page"><div className="empty"><span>Không có thay đổi nào để xác nhận.</span><Link className="btn" to={`${base}/can-quyet`}>Về Cần quyết</Link></div></div>;
  const isForm = d.key === 'form';
  const cur = isForm ? c.situation.form : c.situation.venue;
  const to = params.get('chon') ?? (isForm ? (cur === 'cremation' ? 'burial' : 'cremation') : (cur === 'home' ? 'hall' : 'home'));
  const L = isForm ? impactOfForm(c, to as Form) : impactOfVenue(c, to as Venue);
  const label = (k: string) => isForm ? FORM_LABEL[k as Form] : venueLabel(c, k as Venue);
  const apply = () => {
    update(x => {
      const before = suggestionSnapshot(x, dir), from = x.situation.venue;
      if (x.decisions.find(y => y.id === d.id)?.status === 'pending') decide(x, d.id, to);
      else changeDecision(x, d.id, to, note);
      if (!isForm) afterVenueChange(x, dir, before, from);
    });
    if (isForm) { nav(`${base}/ban-do`); toast(`Đã đổi sang ${FORM_LABEL[to as Form].toLowerCase()}. Bản đồ đã sinh lại việc theo hình thức mới.`); }
    else { nav(`${base}/can-quyet`); toast('Đã đổi nơi tổ chức. Gợi ý nhà cung cấp đã tính lại theo địa điểm mới.'); }
  };
  const site = c.venues?.[to as Venue];
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div><div className="eyebrow">Xác nhận thay đổi</div><h1 style={{ fontSize: 24, marginTop: 4 }}>{isForm ? 'Đổi hình thức an táng' : 'Đổi nơi tổ chức lễ viếng'}</h1></div>
      <section className="card card-pad" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><span><s className="muted">{label(cur)}</s></span><Icon n="chev" /><b>{label(to)}</b>
        {!isForm && site?.address && <span className="muted" style={{ flexBasis: '100%' }}>{site.address}{site.geo ? '' : ' · chưa có vị trí'}</span>}</section>
      {d.wish && to !== d.wish.value && <section className="card card-pad" style={{ background: 'var(--memorial)', borderColor: 'var(--memorial-edge)' }}><div className="eyebrow">Nguyện vọng đã chuẩn bị</div><p style={{ marginTop: 4, fontFamily: 'var(--serif)' }}>“{d.wish.text}”</p><p className="muted" style={{ marginTop: 6, color: 'var(--warning)' }}><Icon n="alert" c="sm" /> Phương án mới khác với nguyện vọng đã chuẩn bị.</p></section>}
      <section className="card card-pad"><div className="sec-h"><h3>Thay đổi này sẽ lan tới</h3></div><ImpactList L={L} /></section>
      <div className="field"><label htmlFor="chgNote">Lý do thay đổi (lưu vào lịch sử, mọi người cùng thấy)</label>
        <textarea className="input" id="chgNote" value={note} onChange={e => setNote(e.target.value)} placeholder={isForm ? 'Ví dụ: Họ hàng bên nội mong muốn an táng tại khu mộ dòng họ; gia đình đã thống nhất.' : 'Ví dụ: Nhà chật, dự kiến đông khách; gia đình đã thống nhất.'} /></div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={apply} style={{ flex: 1 }}>Xác nhận thay đổi</button>
        <button className="btn" onClick={() => nav(`${base}/quyet-dinh/${d.id}`)}>Quay lại</button></div>
      {!isForm && <p className="note">Khoảng cách tới nhà cung cấp tính lại theo vị trí của nơi mới; nếu nơi mới chưa có vị trí, thêm ở mục Nhà cung cấp.</p>}
    </div>
  );
}
