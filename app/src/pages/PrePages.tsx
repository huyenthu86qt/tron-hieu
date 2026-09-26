// S-PRE-01 Danh sách · S-PRE-02 Tạo mới · S-PRE-03 Tổng quan · S-PRE-04 Nguyện vọng · S-PRE-05 Người đại diện & liên hệ
// S-PRE-06 Giấy tờ · S-PRE-07 Ngân sách & NCC mong muốn · S-PRE-08 Chia sẻ · S-PRE-09 Kích hoạt · (S-ENT-07 ở case/pages/IntakePage)
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { OrgModel, OrgType, Place, Title } from '../domain/types';
import { QUESTIONS } from '../domain/entry';
import { activatePreNeed, RITE_OF } from '../domain/normalize';
import { fmtMoneyInput, money, parseMoney } from '../domain/finance';
import { shareToken } from '../domain/actions';
import { normalizePhone, preGroups, readiness, type PreNeed } from '../domain/platform';
import { CATS, USE_DIRECTORY } from '../domain/vendors';
import { activatePre, createPreNeed, myPreNeeds, savePreNeed, usePlatform, useUser } from '../repo/platformStore';
import { Icon } from '../ui/Icon';
import { Banner, Chips, ErrorBanner, Opts, useApp } from '../ui/common';
import { TitlePicker } from '../ui/title';
import { AccountShell } from './AccountShell';
import { FileName, useUploader } from '../ui/files';
import { removeStored, uploadPreFile } from '../repo/files';
import { REMOTE } from '../repo/backend';

const STP = { done: ['done', 'Đã xong'], partial: ['doing', 'Còn thiếu'], todo: ['todo', 'Chưa bắt đầu'] } as const;
// Dùng đúng lựa chọn của bộ câu hỏi khi có tang, để nguyện vọng chuyển sang đám hiếu không lệch
const qOpts = (k: 'org' | 'orgType' | 'rite') => QUESTIONS.find(q => q.k === k)!.o.map(([key, title]) => ({ k: key, title }));
const isOfficial = (o?: string) => o === 'official_rel' || o === 'official';

const subjectName = (p: PreNeed) => (p.subject.name ? `${[p.subject.title, p.subject.name].filter(Boolean).join(' ')}` : 'Hồ sơ chưa đặt tên');

/** Hồ sơ theo id + quyền của người đang xem */
function usePre() {
  const { pid = '' } = useParams();
  const user = useUser()!;
  const p = usePlatform(s => s.preNeeds.find(x => x.id === pid));
  const share = p?.shares.find(x => x.userId === user.id);
  const owner = p?.ownerId === user.id;
  return { p, owner, canEdit: owner || share?.role === 'edit' || share?.role === 'activate', canActivate: owner || share?.role === 'activate', locked: !!p?.caseId };
}

function PreFrame({ title, back = '/chuan-bi', children }: { title: string; back?: string; children: ReactNode }) {
  return <AccountShell title={title} back={back}><div className="page" style={{ maxWidth: 780 }}>{children}</div></AccountShell>;
}
function NotFoundPre() { return <PreFrame title="Hồ sơ chuẩn bị"><div className="empty"><span>Không tìm thấy hồ sơ, hoặc anh/chị chưa được chia sẻ.</span><Link className="btn" to="/chuan-bi">Về danh sách</Link></div></PreFrame>; }

/** Nhóm cần gói trả phí: chưa mở thì mời mở gói */
function PaidPre({ p, what, children }: { p: PreNeed; what: string; children: ReactNode }) {
  const nav = useNavigate();
  const prod = usePlatform(s => s.products.find(x => x.id === 'pre'));
  if (p.paid) return <>{children}</>;
  return (
    <section className="card card-pad stack"><Banner kind="info" icon="lock">{what} thuộc gói <b>Chuẩn bị trước</b>. Tạo hồ sơ và ghi nguyện vọng vẫn miễn phí.</Banner>
      {prod && <p className="muted">{prod.desc} · <b className="num">{money(prod.price)}</b>, trả một lần.</p>}
      <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => nav(`/checkout?goi=pre&cb=${p.id}&ve=${encodeURIComponent(location.pathname)}`)}>Mở gói Chuẩn bị trước</button></section>
  );
}

/* ---------- S-PRE-01 ---------- */
export function PreListPage() {
  const user = useUser()!;
  const nav = useNavigate();
  const all = usePlatform(s => s.preNeeds);
  const L = myPreNeeds(all, user.id);
  return (
    <AccountShell title="Chuẩn bị trước"><div className="page" style={{ maxWidth: 820 }}>
      <div className="page-title"><div><h1>Hồ sơ chuẩn bị</h1><p>Chuẩn bị dần khi còn thời gian — để lúc cần, gia đình không phải quyết lại từ đầu</p></div>
        <div className="actions"><button className="btn primary" onClick={() => nav('/chuan-bi/moi')}><Icon n="plus" c="sm" />Tạo hồ sơ</button></div></div>
      <section className="card">{L.length ? <div className="list">{L.map(p => (
        <button key={p.id} className="row" onClick={() => nav(`/chuan-bi/${p.id}`)}><span className="num-badge"><Icon n="doc" c="sm" /></span>
          <div className="grow"><div className="title">{subjectName(p)}</div><div className="meta"><span>{p.forSelf ? 'Cho bản thân' : 'Cho người thân'}</span><span>Sẵn sàng {readiness(p)}%</span>
            {p.caseId ? <span className="pill done">Đã kích hoạt</span> : p.paid ? <span className="pill doing">Đã mở gói</span> : <span className="pill soft">Miễn phí</span>}{p.ownerId !== user.id && <span>Được chia sẻ</span>}</div></div>
          <Icon n="chev" c="chev" /></button>
      ))}</div> : <div className="empty"><Icon n="doc" c="lg" /><span>Chưa có hồ sơ nào. Tạo hồ sơ cho bản thân hoặc cho người thân.</span></div>}</section>
    </div></AccountShell>
  );
}

/* ---------- S-PRE-02 ---------- */
export function PreNewPage() {
  const user = useUser()!;
  const nav = useNavigate();
  const all = usePlatform(s => s.preNeeds);
  const [forSelf, setForSelf] = useState<'self' | 'other' | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const owned = all.filter(p => p.ownerId === user.id && !p.paid && !p.caseId).length;
  const go = async () => {
    if (!forSelf) { setErr('Chọn hồ sơ này cho ai.'); return; }
    if (owned >= 1) { setErr('Gói miễn phí tạo được 1 hồ sơ. Mở gói Chuẩn bị trước cho hồ sơ hiện có trước khi tạo thêm.'); return; }
    const p = await createPreNeed(forSelf === 'self').catch((e: Error) => { setErr(e.message); return null; });
    if (p) nav(`/chuan-bi/${p.id}`, { replace: true });
  };
  return (
    <PreFrame title="Tạo hồ sơ chuẩn bị">
      <div><h1 style={{ fontSize: 24 }}>Hồ sơ này chuẩn bị cho ai?</h1><p className="muted" style={{ marginTop: 6 }}>Không cần điền hết một lần. Mỗi nhóm lưu riêng; có thể mời người thân cùng chuẩn bị.</p></div>
      <Opts value={forSelf} onChange={setForSelf} items={[{ k: 'self', title: 'Cho bản thân tôi', note: 'Ghi lại mong muốn của mình để con cháu không phải đoán' }, { k: 'other', title: 'Cho người thân', note: 'Cùng ông bà, cha mẹ chuẩn bị khi còn thời gian' }]} />
      <ErrorBanner err={err} />
      <div style={{ display: 'flex', gap: 10 }}><button className="btn primary" style={{ flex: 1 }} onClick={go}>Tạo hồ sơ</button><button className="btn" onClick={() => nav('/chuan-bi')}>Để sau</button></div>
    </PreFrame>
  );
}

/* ---------- S-PRE-03 ---------- */
export function PreOverviewPage() {
  const { p, owner, canActivate, locked } = usePre();
  const nav = useNavigate();
  if (!p) return <NotFoundPre />;
  const pct = readiness(p);
  return (
    <PreFrame title="Hồ sơ chuẩn bị">
      <div className="page-title"><div><h1>Hồ sơ chuẩn bị</h1><p>Chuẩn bị dần khi còn thời gian — để lúc cần, gia đình không phải quyết lại từ đầu</p></div></div>
      <section className="memorial"><div className="portrait"><Icon n="user" c="lg" /></div><div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow">{p.forSelf ? 'Chuẩn bị cho bản thân' : 'Chuẩn bị cho người thân'}</div><h2>{subjectName(p)}</h2>
        <div className="sub">{p.shares.length ? `Chia sẻ với ${p.shares.map(x => x.name).join(', ')}` : 'Chưa chia sẻ với ai'}{p.paid ? ' · đã mở gói Chuẩn bị trước' : ' · miễn phí'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}><div className={'bar ' + (pct === 100 ? 'ok' : '')} style={{ flex: 1 }}><i style={{ width: `${pct}%` }} /></div><b className="num">{pct}%</b></div></div></section>
      {locked && <Banner kind="info" icon="check"><b>Đã kích hoạt</b>{p.activatedAt ? ` lúc ${new Date(p.activatedAt).toLocaleString('vi-VN')}` : ''}. Hồ sơ chuyển sang chỉ đọc; dữ liệu đã đưa vào đám hiếu. <button className="btn sm ghost" onClick={() => nav(`/dh/${p.caseId}`)}>Mở đám hiếu</button></Banner>}
      <section className="card"><div className="list">{preGroups(p).map(g => (
        <button key={g.k} className="row" onClick={() => nav(`/chuan-bi/${p.id}/${g.path}`)}><span className="num-badge"><Icon n={g.st === 'done' ? 'check' : 'doc'} c="sm" /></span>
          <div className="grow"><div className="title">{g.n}</div><div className="meta"><span className={'pill ' + STP[g.st][0]}>{STP[g.st][1]}</span>{g.note && <span>{g.note}</span>}{g.paid && !p.paid && <span className="pill soft"><Icon n="lock" c="sm" />Gói Chuẩn bị trước</span>}</div></div>
          <Icon n="chev" c="chev" /></button>
      ))}</div></section>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {owner && <button className="btn" onClick={() => nav(`/chuan-bi/${p.id}/chia-se`)}><Icon n="team" c="sm" />Chia sẻ</button>}
        <button className="btn primary" style={{ flex: 1 }} disabled={locked || !canActivate} onClick={() => nav(`/chuan-bi/${p.id}/kich-hoat`)}>Kích hoạt hồ sơ khi sự việc xảy ra</button></div>
    </PreFrame>
  );
}

function SaveBar({ onSave, id }: { onSave: () => string | null | Promise<string | null>; id: string }) {
  const nav = useNavigate();
  const { toast } = useApp();
  const [err, setErr] = useState<string | null>(null);
  return <>
    <ErrorBanner err={err} />
    <div style={{ display: 'flex', gap: 10 }}><button className="btn primary" style={{ flex: 1 }} onClick={async () => { const e = await onSave(); if (e) setErr(e); else { toast('Đã lưu nhóm này'); nav(`/chuan-bi/${id}`); } }}>Lưu nhóm này</button>
      <button className="btn" onClick={() => nav(`/chuan-bi/${id}`)}>Để sau</button></div>
  </>;
}

/* ---------- Thông tin cá nhân (thuộc S-PRE-03 nhóm 1) ---------- */
export function PreInfoPage() {
  const { p, canEdit, locked } = usePre();
  const [s, setS] = useState(() => p?.subject);
  if (!p || !s) return <NotFoundPre />;
  const ro = !canEdit || locked;
  return (
    <PreFrame title="Thông tin cá nhân" back={`/chuan-bi/${p.id}`}>
      <div><div className="eyebrow">Hồ sơ chuẩn bị</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Thông tin cá nhân</h1></div>
      <section className="card card-pad stack">
        <div className="field"><label>Danh xưng</label><TitlePicker value={s.title} disabled={ro} onChange={t => setS({ ...s, title: t })} /></div>
        <div className="field"><label htmlFor="piName">Họ và tên</label><input className="input" id="piName" disabled={ro} value={s.name} onChange={e => setS({ ...s, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="piBirth">Năm sinh</label><input className="input num" id="piBirth" disabled={ro} inputMode="numeric" maxLength={4} value={s.birthYear} onChange={e => setS({ ...s, birthYear: e.target.value.replace(/\D/g, '') })} /></div>
        <div className="field"><label htmlFor="piHome">Quê quán</label><input className="input" id="piHome" disabled={ro} value={s.hometown} onChange={e => setS({ ...s, hometown: e.target.value })} /></div>
        <div className="field"><label htmlFor="piId">Ghi chú giấy tờ tùy thân (không ghi số đầy đủ)</label><input className="input" id="piId" disabled={ro} value={s.idNote} onChange={e => setS({ ...s, idNote: e.target.value })} placeholder="Ví dụ: CCCD để trong ngăn kéo tủ thờ" /></div>
      </section>
      {!ro && <SaveBar id={p.id} onSave={() => { if (!s.name.trim()) return 'Cần nhập họ tên.'; return savePreNeed({ ...p, subject: { ...s, name: s.name.trim(), title: s.title as Title } }); }} />}
    </PreFrame>
  );
}

/* ---------- S-PRE-04 ---------- */
export function PreWishPage() {
  const { p, canEdit, locked } = usePre();
  const [w, setW] = useState(() => p?.wish);
  const [special, setSpecial] = useState(p?.special ?? '');
  if (!p || !w) return <NotFoundPre />;
  const ro = !canEdit || locked;
  const o = <K extends 'form' | 'venue'>(k: K, items: { k: PreNeed['wish'][K]; title: string; note?: string }[]) => <Opts value={w[k]} disabled={ro} onChange={v => setW({ ...w, [k]: v })} items={items} />;
  return (
    <PreFrame title="Nguyện vọng hậu sự" back={`/chuan-bi/${p.id}`}>
      <div><div className="eyebrow">Hồ sơ chuẩn bị · {subjectName(p)}</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Nguyện vọng hậu sự</h1>
        <p className="muted" style={{ marginTop: 6 }}>Không cần điền hết một lần. Mỗi nhóm lưu riêng. Khi kích hoạt, nguyện vọng hiện là đề xuất — người đại diện vẫn xác nhận.</p></div>
      <section className="card card-pad stack"><h3>Hình thức</h3>{o('form', [{ k: 'cremation', title: 'Hỏa táng' }, { k: 'burial', title: 'Mai táng (địa táng)' }, { k: 'family', title: 'Để gia đình quyết' }])}</section>
      <section className="card card-pad stack"><h3>Nơi làm lễ mong muốn</h3>{o('venue', [{ k: 'home', title: 'Tại nhà' }, { k: 'hall', title: 'Tại nhà tang lễ' }, { k: 'family', title: 'Để gia đình quyết' }])}</section>
      <section className="card card-pad stack"><h3>Hình thức tổ chức lễ tang</h3>
        <Opts value={w.org ?? ''} disabled={ro} onChange={v => setW({ ...w, org: v as OrgModel | '', orgType: isOfficial(v) ? (w.orgType ?? 'cadre') : undefined, rite: v === 'official' ? '' : w.rite })}
          items={[...qOpts('org'), { k: '', title: 'Để gia đình quyết' }]} />
        {isOfficial(w.org) && <div className="field"><label>Nghi lễ tang của đối tượng nào?</label>
          <Opts value={w.orgType ?? 'cadre'} disabled={ro} onChange={v => setW({ ...w, orgType: v as OrgType })} items={qOpts('orgType')} /></div>}</section>
      {w.org !== 'official' && <section className="card card-pad stack"><h3>Nghi lễ</h3>
        <Opts value={(RITE_OF[w.rite] ?? '') as string} disabled={ro} onChange={v => setW({ ...w, rite: v })} items={[...qOpts('rite'), { k: '', title: 'Để gia đình quyết' }]} /></section>}
      <section className="card card-pad stack"><h3>Đồ tùy táng</h3>
        <div className="field"><label htmlFor="pItems">Đồ tùy táng mong muốn</label><input className="input" id="pItems" disabled={ro} value={w.items} onChange={e => setW({ ...w, items: e.target.value })} placeholder="Ví dụ: tràng hạt, bộ áo the" /></div></section>
      <section className="card card-pad stack"><h3>Quy mô</h3><div className="chips">{([['small', 'Nhỏ — gia đình, họ hàng gần'], ['medium', 'Vừa'], ['large', 'Lớn']] as const).map(([k, l]) => <button key={k} className="chip" disabled={ro} aria-pressed={w.scale === k} onClick={() => setW({ ...w, scale: k })}>{l}</button>)}</div></section>
      <section className="card card-pad stack"><h3>Mốc tưởng niệm mong muốn</h3><Chips items={['49 ngày', '100 ngày', 'Giỗ đầu']} isOn={x => w.milestones.includes({ '49 ngày': 'd49', '100 ngày': 'd100', 'Giỗ đầu': 'gio' }[x]!)} onToggle={x => { if (ro) return; const k = { '49 ngày': 'd49', '100 ngày': 'd100', 'Giỗ đầu': 'gio' }[x]!; setW({ ...w, milestones: w.milestones.includes(k) ? w.milestones.filter(y => y !== k) : [...w.milestones, k] }); }} /></section>
      <section className="card card-pad stack"><h3>Lời nhắn cho con cháu <span className="muted" style={{ fontFamily: 'var(--sans)', fontWeight: 400 }}>(tùy chọn)</span></h3>
        <textarea className="input" disabled={ro} value={w.msg} onChange={e => setW({ ...w, msg: e.target.value })} placeholder="Điều muốn con cháu biết khi lo việc…" aria-label="Lời nhắn cho con cháu" /></section>
      <section className="card card-pad stack"><h3>Mong muốn đặc biệt</h3>
        <textarea className="input" disabled={ro} value={special} onChange={e => setSpecial(e.target.value)} placeholder="Ví dụ: bài hát muốn được mở, người muốn mời đọc điếu văn, ảnh thờ đã chọn…" aria-label="Mong muốn đặc biệt" /></section>
      {!ro && <SaveBar id={p.id} onSave={() => savePreNeed({ ...p, wish: w, special })} />}
    </PreFrame>
  );
}

/* ---------- S-PRE-05 ---------- */
export function PreContactsPage() {
  const { p, canEdit, locked } = usePre();
  const [rep, setRep] = useState(() => p?.rep);
  const [list, setList] = useState(() => p?.contacts ?? []);
  const [n, setN] = useState({ name: '', phone: '', rel: '' });
  const [err, setErr] = useState<string | null>(null);
  if (!p || !rep) return <NotFoundPre />;
  const ro = !canEdit || locked;
  const add = () => {
    const ph = normalizePhone(n.phone);
    if (!n.name.trim() || !ph) { setErr('Cần tên và số điện thoại đúng.'); return; }
    setList([...list, { name: n.name.trim(), phone: ph, rel: n.rel.trim() }]); setN({ name: '', phone: '', rel: '' }); setErr(null);
  };
  return (
    <PreFrame title="Người đại diện và liên hệ" back={`/chuan-bi/${p.id}`}>
      <div><div className="eyebrow">Hồ sơ chuẩn bị</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Người đại diện và người liên hệ</h1><p className="muted" style={{ marginTop: 6 }}>Khi kích hoạt, người liên hệ thành danh sách mời vào Đội đám hiếu.</p></div>
      <section className="card card-pad stack"><h3>Người đại diện mong muốn</h3>
        <div className="field"><label htmlFor="rName">Họ tên</label><input className="input" id="rName" disabled={ro} value={rep.name} onChange={e => setRep({ ...rep, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="rPhone">Số điện thoại</label><input className="input num" id="rPhone" disabled={ro} inputMode="tel" value={rep.phone} onChange={e => setRep({ ...rep, phone: e.target.value })} /></div>
        <div className="field"><label htmlFor="rRel">Quan hệ</label><input className="input" id="rRel" disabled={ro} value={rep.rel} onChange={e => setRep({ ...rep, rel: e.target.value })} placeholder="Ví dụ: Con trai trưởng" /></div></section>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Người liên hệ</h3><span className="muted">{list.length}</span></div>
        {list.length ? <div className="list">{list.map((x, i) => <div key={i} className="row"><div className="grow"><div className="title">{x.name}</div><div className="meta"><span className="num">{x.phone}</span>{x.rel && <span>{x.rel}</span>}</div></div>
          {!ro && <button className="icon-btn" aria-label="Bỏ người này" onClick={() => setList(list.filter((_, j) => j !== i))}><Icon n="x" c="sm" /></button>}</div>)}</div> : <p className="muted" style={{ padding: '0 16px 12px' }}>Chưa có ai.</p>}
        {!ro && <div className="card-pad" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
          <input className="input" value={n.name} onChange={e => setN({ ...n, name: e.target.value })} placeholder="Họ tên" aria-label="Họ tên người liên hệ" />
          <input className="input num" inputMode="tel" value={n.phone} onChange={e => setN({ ...n, phone: e.target.value })} placeholder="Số điện thoại" aria-label="Số điện thoại người liên hệ" />
          <input className="input" value={n.rel} onChange={e => setN({ ...n, rel: e.target.value })} placeholder="Quan hệ" aria-label="Quan hệ" />
          <button className="btn" onClick={add}><Icon n="plus" c="sm" />Thêm</button></div>}</section>
      <ErrorBanner err={err} />
      {!ro && <SaveBar id={p.id} onSave={() => { const ph = rep.phone.trim() ? normalizePhone(rep.phone) : ''; if (ph === null) return 'Số điện thoại người đại diện chưa đúng.'; return savePreNeed({ ...p, rep: { ...rep, phone: ph }, contacts: list }); }} />}
    </PreFrame>
  );
}

/* ---------- S-PRE-06 ---------- */
export function PreDocsPage() {
  const { p, canEdit, locked } = usePre();
  const { toast } = useApp();
  const up = useUploader();
  if (!p) return <NotFoundPre />;
  const ro = !canEdit || locked;
  return (
    <PreFrame title="Giấy tờ" back={`/chuan-bi/${p.id}`}>
      <div><div className="eyebrow">Hồ sơ chuẩn bị</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Giấy tờ</h1><p className="muted" style={{ marginTop: 6 }}>Bản chụp CCCD, sổ hộ khẩu, giấy tờ đất mộ, di chúc… Khi kích hoạt, chuyển vào Tài liệu của đám hiếu.</p></div>
      <PaidPre p={p} what="Lưu giấy tờ">
        <section className="card">{p.docs.length ? <div className="list">{p.docs.map(d => <div key={d.id} className="row"><Icon n="doc" /><div className="grow"><div className="title"><FileName name={d.name} path={d.path} bucket="pre-files" /></div><div className="meta"><span>{new Date(d.at).toLocaleString('vi-VN')}</span></div></div>
          {!ro && <button className="icon-btn" aria-label="Xóa tệp" onClick={async () => { const e = await savePreNeed({ ...p, docs: p.docs.filter(x => x.id !== d.id) }); if (e) toast(e); else void removeStored('pre-files', d.path); }}><Icon n="x" c="sm" /></button>}</div>)}</div>
          : <div className="empty"><span>Chưa có giấy tờ.</span></div>}</section>
        {!ro && <label className="btn file-btn" style={{ alignSelf: 'flex-start' }}><Icon n="plus" c="sm" />{up.busy ? 'Đang tải lên…' : 'Tải giấy tờ lên'}<input type="file" disabled={up.busy} onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const s = await up.run(() => uploadPreFile(p.id, f)); if (!s) return; const err = await savePreNeed({ ...p, docs: [...p.docs, { id: 'd' + Date.now(), name: s.name, path: s.path, at: new Date().toISOString() }] }); toast(err ?? 'Đã lưu giấy tờ ' + s.name); }} /></label>}
        <p className="note">{REMOTE ? 'Giấy tờ lưu riêng tư trên máy chủ — chỉ người được chia sẻ hồ sơ mở được. Bấm vào tên để mở.' : 'Bản chạy thử trên máy chỉ ghi lại tên tệp; bản thật lưu tệp trên máy chủ.'}</p>
      </PaidPre>
    </PreFrame>
  );
}

/* ---------- S-PRE-07 ---------- */
export function PreBudgetPage() {
  const { p, canEdit, locked } = usePre();
  const dir = usePlatform(s => s.directory);
  const [amount, setAmount] = useState(() => (p?.budget.amount ? p.budget.amount.toLocaleString('vi-VN') : ''));
  const [vendors, setVendors] = useState(() => ({ ...(p?.budget.vendors ?? {}) }));
  if (!p) return <NotFoundPre />;
  const ro = !canEdit || locked;
  return (
    <PreFrame title="Ngân sách" back={`/chuan-bi/${p.id}`}>
      <div><div className="eyebrow">Hồ sơ chuẩn bị</div><h1 style={{ fontSize: 24, marginTop: 4 }}>{USE_DIRECTORY ? 'Ngân sách và nhà cung cấp mong muốn' : 'Ngân sách dự kiến'}</h1><p className="muted" style={{ marginTop: 6 }}>Khi kích hoạt: ngân sách thành ngân sách ở Tài chính; bên mong muốn được ưu tiên khi gợi ý (nếu phục vụ khu vực nơi tổ chức).</p></div>
      <section className="card card-pad stack"><div className="field"><label htmlFor="pbAmt">Ngân sách dự kiến (đồng)</label><input className="input num" id="pbAmt" inputMode="numeric" disabled={ro} value={amount} onChange={e => setAmount(fmtMoneyInput(e.target.value))} style={{ fontSize: 20, fontWeight: 600 }} /></div></section>
      {USE_DIRECTORY && <section className="card card-pad stack"><h3>Nhà cung cấp mong muốn</h3>
        {CATS.map(k => { const opts = dir.filter(v => v.active && v.cats.includes(k.k)); return (
          <div key={k.k} className="field"><label htmlFor={'pv-' + k.k}>{k.name}</label><select className="input" id={'pv-' + k.k} disabled={ro} value={vendors[k.k] ?? ''} onChange={e => setVendors({ ...vendors, [k.k]: e.target.value || undefined })}>
            <option value="">Không có mong muốn riêng</option>{opts.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>); })}
        {!dir.length && <p className="muted">Danh bạ nhà cung cấp chưa có bên nào.</p>}</section>}
      {!ro && <SaveBar id={p.id} onSave={() => savePreNeed({ ...p, budget: { amount: parseMoney(amount), vendors: Object.fromEntries(Object.entries(vendors).filter(([, v]) => v)) } })} />}
    </PreFrame>
  );
}

/* ---------- S-PRE-08 ---------- */
export function PreSharePage() {
  const { p, owner } = usePre();
  const { toast } = useApp();
  const [n, setN] = useState({ name: '', phone: '', role: 'view' as PreNeed['shares'][number]['role'] });
  const [err, setErr] = useState<string | null>(null);
  if (!p) return <NotFoundPre />;
  const ROLE = { view: 'Chỉ xem', edit: 'Xem và sửa', activate: 'Xem, sửa và kích hoạt' };
  if (!owner) return <PreFrame title="Chia sẻ" back={`/chuan-bi/${p.id}`}><section className="card"><div className="empty"><Icon n="lock" c="lg" /><h2 style={{ color: 'var(--text)' }}>Chỉ người lập hồ sơ quản lý chia sẻ</h2></div></section></PreFrame>;
  const add = async () => {
    const ph = n.phone.trim() ? normalizePhone(n.phone) : '';
    if (!n.name.trim()) { setErr('Cần nhập họ tên.'); return; }
    if (ph === null) { setErr('Số điện thoại chưa đúng.'); return; }
    const e = await savePreNeed({ ...p, shares: [...p.shares, { id: 'sh' + Date.now(), name: n.name.trim(), phone: ph, role: n.role, inviteToken: shareToken() }] });
    if (e) { setErr(e); return; }
    setN({ name: '', phone: '', role: 'view' }); setErr(null); toast('Đã tạo link mời — bấm “Sao chép lời mời” rồi gửi qua Zalo.');
  };
  const copyInvite = async (x: PreNeed['shares'][number]) => {
    const url = `${window.location.origin}/moi-cb/${x.inviteToken}`;
    const text = `Mời ${x.name} ${ROLE[x.role].toLowerCase()} hồ sơ chuẩn bị trên Trọn Hiếu. Mở link để nhận: ${url}`;
    try { await navigator.clipboard.writeText(text); toast('Đã sao chép lời mời — dán vào Zalo gửi đi'); } catch { toast(url); }
  };
  return (
    <PreFrame title="Chia sẻ" back={`/chuan-bi/${p.id}`}>
      <div><div className="eyebrow">Hồ sơ chuẩn bị</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Ai được xem, sửa hồ sơ?</h1></div>
      <PaidPre p={p} what="Chia sẻ có kiểm soát">
        <section className="card">{p.shares.length ? <div className="list">{p.shares.map(x => (
          <div key={x.id} className="row"><div className="grow"><div className="title">{x.name}</div><div className="meta">{x.phone && <span className="num">{x.phone}</span>}{x.userId ? <span className="pill done">Đã nhận lời mời</span> : x.inviteToken ? <span className="pill wait">Chờ nhận lời mời</span> : null}</div>
              {x.inviteToken && !x.userId && <button className="btn sm" style={{ marginTop: 6 }} onClick={() => void copyInvite(x)}><Icon n="copy" c="sm" />Sao chép lời mời</button>}</div>
            <select className="input" style={{ width: 'auto' }} value={x.role} aria-label={`Quyền của ${x.name}`} onChange={e => savePreNeed({ ...p, shares: p.shares.map(y => y.id === x.id ? { ...y, role: e.target.value as typeof y.role } : y) })}>{Object.entries(ROLE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <button className="icon-btn" aria-label={`Bỏ chia sẻ với ${x.name}`} onClick={() => savePreNeed({ ...p, shares: p.shares.filter(y => y.id !== x.id) })}><Icon n="x" c="sm" /></button></div>
        ))}</div> : <div className="empty"><span>Chưa chia sẻ với ai.</span></div>}</section>
        <section className="card card-pad stack"><h3>Mời người thân</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8 }}>
            <input className="input" value={n.name} onChange={e => setN({ ...n, name: e.target.value })} placeholder="Họ tên" aria-label="Họ tên" />
            <input className="input num" inputMode="tel" value={n.phone} onChange={e => setN({ ...n, phone: e.target.value })} placeholder="Số điện thoại (tùy chọn)" aria-label="Số điện thoại" />
            <select className="input" value={n.role} onChange={e => setN({ ...n, role: e.target.value as typeof n.role })} aria-label="Quyền">{Object.entries(ROLE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <ErrorBanner err={err} /><button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => void add()}>Tạo link mời</button>
          <p className="note">Người được quyền “kích hoạt” có thể chuyển hồ sơ thành đám hiếu khi sự việc xảy ra.</p></section>
      </PaidPre>
    </PreFrame>
  );
}

/* ---------- S-PRE-09 ---------- */
export function PreActivatePage() {
  const { p, canActivate, locked } = usePre();
  const user = useUser()!;
  const nav = useNavigate();
  // Điền sẵn theo nguyện vọng đã chuẩn bị (nếu có)
  const [x, setX] = useState({ death: '', place: '' as Place | '', org: (p?.wish.org || 'family') as OrgModel, orgType: (p?.wish.orgType ?? 'cadre') as OrgType });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!p) return <NotFoundPre />;
  if (!canActivate) return <PreFrame title="Kích hoạt" back={`/chuan-bi/${p.id}`}><section className="card"><div className="empty"><Icon n="lock" c="lg" /><h2 style={{ color: 'var(--text)' }}>Anh/chị chưa có quyền kích hoạt hồ sơ này</h2><p style={{ maxWidth: '46ch' }}>Chỉ người lập hồ sơ hoặc người được giao quyền kích hoạt mới kích hoạt được.</p></div></section></PreFrame>;
  if (locked) return <PreFrame title="Kích hoạt" back={`/chuan-bi/${p.id}`}><Banner kind="info" icon="check">Hồ sơ đã được kích hoạt. <Link to={`/dh/${p.caseId}`}>Mở đám hiếu</Link></Banner></PreFrame>;
  const moves: [string, string][] = [
    ['Nguyện vọng hậu sự', 'Hiện là đề xuất trong Cần quyết — người đại diện vẫn xác nhận'],
    [`${p.contacts.length} người liên hệ`, 'Thành danh sách mời vào Đội đám hiếu'],
    [p.budget.amount ? `Ngân sách ${money(p.budget.amount)}` : 'Ngân sách', 'Thành ngân sách ở Tài chính'],
    ...(USE_DIRECTORY ? [['Nhà cung cấp mong muốn', 'Được ưu tiên khi gợi ý nhà cung cấp'] as [string, string]] : []),
    ['Mốc tưởng niệm mong muốn', 'Gợi ý sẵn ở Hậu tang'],
    [`${p.docs.length} giấy tờ`, 'Chuyển vào Tài liệu'],
  ];
  const go = async () => {
    setBusy(true);
    try {
      if (!x.place) { setErr('Chọn nơi người thân mất.'); setBusy(false); return; }
      const c = activatePreNeed(p, { ...x, place: x.place }, user.id, user.name);
      c.members[0].phone = user.phone;
      const e = await activatePre(p, c, c.access?.activeUntil, user.name);
      if (e) { setErr(e); setBusy(false); return; }
      nav(`/dh/${c.id}/tiep-nhan`, { replace: true });
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };
  return (
    <PreFrame title="Kích hoạt hồ sơ" back={`/chuan-bi/${p.id}`}>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--primary)' }}>Xin chia buồn cùng gia đình.</p>
      <div><h1 style={{ fontSize: 24 }}>Kích hoạt hồ sơ chuẩn bị</h1><p className="muted" style={{ marginTop: 6 }}>Hồ sơ của {subjectName(p)} sẽ chuyển thành đám hiếu đang tổ chức. Anh/chị không phải nhập lại những gì đã chuẩn bị.</p></div>
      <PaidPre p={p} what="Kích hoạt hồ sơ">
        <section className="card card-pad stack"><h3>Vài thông tin cần ngay</h3>
          <div className="field"><label htmlFor="acDeath">Ngày mất</label><input className="input" type="date" id="acDeath" value={x.death} onChange={e => setX({ ...x, death: e.target.value })} /></div>
          <div className="field"><label>Người thân mất ở đâu?</label><Opts value={x.place} onChange={v => setX({ ...x, place: v })} items={[{ k: 'hospital', title: 'Tại bệnh viện' }, { k: 'home', title: 'Tại nhà' }, { k: 'other', title: 'Nơi khác' }]} /></div>
          <div className="field"><label>Lễ tang được tổ chức theo hình thức nào?</label><Opts value={x.org} onChange={v => setX({ ...x, org: v as OrgModel })} items={qOpts('org')} />
            {p.wish.org && <p className="muted">Điền sẵn theo nguyện vọng đã chuẩn bị — có thể đổi.</p>}</div>
          {isOfficial(x.org) && <div className="field"><label>Nghi lễ tang của đối tượng nào?</label><Opts value={x.orgType} onChange={v => setX({ ...x, orgType: v as OrgType })} items={qOpts('orgType')} /></div>}</section>
        <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Những gì sẽ được chuyển sang</h3></div>
          <div className="list">{moves.map(([a, b]) => <div key={a} className="row"><span className="num-badge"><Icon n="check" c="sm" /></span><div className="grow"><div className="title">{a}</div><div className="meta">{b}</div></div></div>)}</div></section>
        <section className="card card-pad"><dl className="kv"><dt>Người kích hoạt</dt><dd>{user.name}</dd><dt>Sẽ báo cho</dt><dd>{p.shares.map(s => s.name).join(', ') || 'Không có người được chia sẻ'}</dd><dt>Lưu vết</dt><dd>Thời điểm và người kích hoạt được ghi vào lịch sử</dd><dt>Gói</dt><dd>Đám hiếu được mở đầy đủ, không thu lần hai</dd></dl></section>
        <ErrorBanner err={err} />
        <Banner kind="warn" icon="lock">Kích hoạt không đảo ngược được: hồ sơ chuyển sang chỉ đọc.</Banner>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn primary" style={{ flex: 1 }} disabled={busy || !x.death || !x.place} onClick={go}>Kích hoạt hồ sơ</button><button className="btn" onClick={() => nav(`/chuan-bi/${p.id}`)}>Chưa phải lúc này</button></div>
      </PaidPre>
    </PreFrame>
  );
}
