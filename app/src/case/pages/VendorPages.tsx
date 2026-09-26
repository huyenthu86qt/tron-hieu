// S-VEN-01 Nhà cung cấp theo hạng mục · S-VEN-02 Gợi ý đúng + gần nhất · S-VEN-03 Chi tiết · S-VEN-04 NCC gia đình · S-VEN-05 Nghiệm thu · trọn gói
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { GeoPoint, VendorCat } from '../../domain/types';
import {
  acceptVendor, addFamilyVendor, distanceKm, catName, catState, catsVisible, choosePackage, commitVendor, confirmVendor, findVendor, fmtGeo, fmtKm,
  mapsSearchUrl, markUpdated, packageOffers, parseGeo, recordIncident, recordQuote, siteOf, suggestionSnapshot, venueLabel, CATS,
} from '../../domain/vendors';
import { FORM_LABEL } from '../../domain/model';
import { money, parseMoney, fmtMoneyInput } from '../../domain/finance';
import { Icon } from '../../ui/Icon';
import { Banner, Chips, ErrorBanner, Sheet, toggleIn, useApp } from '../../ui/common';
import { AddressFinder } from '../../ui/geo';
import { useCase } from '../CaseContext';
import { PaidGate } from '../Paywall';

const fmtAt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '');

function StatusPillCat({ s }: { s: string }) {
  if (s === 'committed') return <span className="pill done">Đã cam kết</span>;
  if (s === 'confirmed') return <span className="pill doing">Đã chọn · chờ cam kết</span>;
  if (s === 'empty') return <span className="pill issue">Chưa có bên phù hợp</span>;
  return <span className="pill wait">Đang gợi ý · chờ anh xác nhận</span>;
}

/* ---------- Địa điểm tổ chức (tọa độ để tính khoảng cách) ---------- */
function VenueSheet({ onClose }: { onClose: () => void }) {
  const { c, update, dir } = useCase();
  const { toast } = useApp();
  const v = c.situation.venue, s = siteOf(c);
  const [name, setName] = useState(s.name === 'Nhà tang lễ' ? '' : s.name);
  const [addr, setAddr] = useState(s.address);
  const [geo, setGeo] = useState(fmtGeo(s.geo));
  const [err, setErr] = useState<string | null>(null);
  const here = () => {
    if (!navigator.geolocation) { setErr('Trình duyệt không hỗ trợ lấy vị trí.'); return; }
    navigator.geolocation.getCurrentPosition(p => setGeo(`${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`), () => setErr('Chưa lấy được vị trí. Hãy cho phép truy cập vị trí, hoặc dán tọa độ.'), { enableHighAccuracy: true, timeout: 10000 });
  };
  const save = () => {
    const g = geo.trim() ? parseGeo(geo) : null;
    if (geo.trim() && !g) { setErr('Tọa độ chưa đúng dạng “vĩ độ, kinh độ”, ví dụ 21.0285, 105.8542.'); return; }
    update(d => {
      const before = suggestionSnapshot(d, dir);
      d.venues![v] = { name: v === 'hall' ? (name.trim() || 'Nhà tang lễ') : 'Nhà riêng', address: addr.trim(), geo: g ?? undefined };
      markUpdated(d, dir, before);
    });
    onClose(); toast('Đã lưu địa điểm. Gợi ý nhà cung cấp đã tính lại.');
  };
  return (
    <Sheet title="Địa điểm tổ chức lễ viếng" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn primary" onClick={save}>Lưu</button></>}>
      {v === 'hall' && <div className="field"><label htmlFor="vName">Tên nhà tang lễ</label><input className="input" id="vName" value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Nhà tang lễ Bệnh viện …" /></div>}
      <div className="field"><label htmlFor="vAddr">Địa chỉ</label><input className="input" id="vAddr" value={addr} onChange={e => setAddr(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh" />
        <AddressFinder address={addr} onPick={g => { setGeo(fmtGeo(g)); setErr(null); toast('Đã điền vị trí — bấm Lưu để giữ'); }} /></div>
      <div className="field"><label htmlFor="vGeo">Vị trí trên bản đồ (vĩ độ, kinh độ)</label><input className="input num" id="vGeo" value={geo} onChange={e => setGeo(e.target.value)} placeholder="21.0285, 105.8542" />
        <p className="muted">Thường không cần gõ: bấm “Tìm vị trí từ địa chỉ” ở trên, hoặc “Dùng vị trí hiện tại” nếu đang ở nơi tổ chức.</p>
        <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={here}><Icon n="pin" c="sm" />Dùng vị trí hiện tại</button></div>
      <ErrorBanner err={err} />
      <p className="note">Khoảng cách tính theo đường chim bay.</p>
    </Sheet>
  );
}

function VenueCard({ compact }: { compact?: boolean }) {
  const { c, base, isU1 } = useCase();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const s = siteOf(c);
  return <>
    <section className="card card-pad" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Icon n="pin" />
      <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 500 }}>{compact ? 'Tính từ: ' : ''}{venueLabel(c)}</div>
        <div className="muted">{s.address || 'Chưa có địa chỉ'}{s.geo ? '' : ' · chưa có vị trí để tính khoảng cách'}</div></div>
      <button className="btn sm" onClick={() => setOpen(true)}>{s.geo ? 'Sửa địa điểm' : 'Thêm vị trí'}</button>
      {isU1 && <button className="btn sm ghost" onClick={() => nav(`${base}/quyet-dinh/venue`)}>Đổi nơi tổ chức</button>}
    </section>
    {open && <VenueSheet onClose={() => setOpen(false)} />}
  </>;
}

/* ---------- S-VEN-04 ---------- */
export function FamilyVendorSheet({ cat, useNow, onClose }: { cat?: VendorCat; useNow?: boolean; onClose: () => void }) {
  const { c, update } = useCase();
  const { toast } = useApp();
  const vis = catsVisible(c.situation);
  const [f, setF] = useState({ name: '', phone: '', cats: cat ? [cat] : [] as VendorCat[], address: '', note: '', now: !!useNow });
  const [err, setErr] = useState<string | null>(null);
  const committed = cat ? c.vendors?.[cat]?.status === 'committed' : false;
  const save = () => {
    let id = '';
    const e = update(d => {
      id = addFamilyVendor(d, { name: f.name, phone: f.phone, cats: f.cats, address: f.address, note: f.note });
      if (f.now && cat && f.cats.includes(cat) && !committed) confirmVendor(d, cat, id, true);
    });
    if (e) { setErr(e); return; }
    onClose(); toast(`Đã thêm ${f.name.trim()} vào nhà cung cấp của gia đình${f.now && cat ? ' và chọn cho hạng mục này' : ''}`);
  };
  return (
    <Sheet title="Thêm nhà cung cấp của gia đình" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn primary" onClick={save}>Lưu</button></>}>
      <div className="field"><label htmlFor="fvName">Tên nhà cung cấp hoặc người làm</label><input className="input" id="fvName" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ví dụ: Đội kèn bác Tư (người trong họ giới thiệu)" /></div>
      <div className="field"><label htmlFor="fvPhone">Số điện thoại</label><input className="input num" id="fvPhone" inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
      <div className="field"><label>Nhận hạng mục</label><Chips items={vis.map(k => k.name)} isOn={n => f.cats.includes(vis.find(k => k.name === n)!.k)} onToggle={n => setF(x => ({ ...x, cats: toggleIn(x.cats, vis.find(k => k.name === n)!.k) as VendorCat[] }))} /></div>
      <div className="field"><label htmlFor="fvAddr">Địa chỉ (tùy chọn)</label><input className="input" id="fvAddr" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} /></div>
      <div className="field"><label htmlFor="fvNote">Ghi chú (tùy chọn)</label><input className="input" id="fvNote" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Ví dụ: đã làm cho đám nhà bác cả năm ngoái" /></div>
      {cat && !committed && <label className="check"><input type="checkbox" checked={f.now} onChange={e => setF({ ...f, now: e.target.checked })} /><span>Chọn luôn bên này cho hạng mục <b>{catName(cat)}</b></span></label>}
      <ErrorBanner err={err} />
      <p className="note">Nhà cung cấp gia đình tự thêm chỉ nằm trong đám hiếu này, không vào danh bạ chung của Admin.</p>
    </Sheet>
  );
}

function PackageSheet({ vid, onClose }: { vid: string; onClose: () => void }) {
  const { c, update, dir } = useCase();
  const { toast } = useApp();
  const x = packageOffers(c, dir).find(y => y.v.id === vid);
  if (!x) return <Sheet title="Dịch vụ trọn gói" onClose={onClose}><p className="muted">Không còn hạng mục nào để chọn trọn gói.</p></Sheet>;
  const go = () => { update(d => choosePackage(d, x.v, x.open.map(k => k.k))); onClose(); toast(`Đã chọn trọn gói ${x.v.name} cho ${x.open.length} hạng mục`); };
  return (
    <Sheet title="Chọn dịch vụ trọn gói" onClose={onClose} foot={<><button className="btn" onClick={onClose}>Để sau</button><button className="btn primary" onClick={go}>Chọn trọn gói cho {x.open.length} hạng mục</button></>}>
      <div className="card card-pad"><div className="eyebrow">Nhà cung cấp</div><div style={{ fontWeight: 600 }}>{x.v.name}</div><div className="muted num">{x.v.phone} · cách nơi tổ chức {fmtKm(x.d)}</div></div>
      <div><div className="eyebrow" style={{ marginBottom: 6 }}>Sẽ giao cho bên này</div>{x.open.map(k => (
        <div key={k.k} className="check"><Icon n="check" c="sm" /><span>{k.name}{c.familyPick?.[k.k] ? <> <span className="pill prio">Hồ sơ chuẩn bị có bên mong muốn khác</span></> : null}</span></div>))}</div>
      {x.locked.length > 0 && <Banner kind="info" icon="lock">Giữ nguyên: {x.locked.map(k => k.name).join('; ')} (đã chọn hoặc đã cam kết, app không tự thay).</Banner>}
      <p className="muted">Sau khi chọn, người lo Nhà cung cấp liên hệ để nhận một báo giá trọn gói và ghi cam kết cho từng hạng mục.</p>
    </Sheet>
  );
}

/* ---------- S-VEN-01 ---------- */
export function VendorsPage() { return <PaidGate module="Nhà cung cấp"><Vendors /></PaidGate>; }
function Vendors() {
  const { c, base, dir } = useCase();
  const nav = useNavigate();
  const [add, setAdd] = useState(false);
  const [pkg, setPkg] = useState<string | null>(null);
  const offers = packageOffers(c, dir);
  const upd = c.updatedCats ?? [];
  return (
    <div className="page">
      <div className="page-title"><div><h1>Nhà cung cấp</h1><p>Gợi ý đúng loại dịch vụ, gần nơi tổ chức nhất · anh xác nhận trước khi chọn</p></div>
        <div className="actions"><button className="btn" onClick={() => setAdd(true)}><Icon n="plus" c="sm" />Thêm nhà cung cấp của gia đình</button></div></div>
      <VenueCard />
      {upd.length > 0 && <Banner kind="upd" icon="refresh">Gợi ý đã tự cập nhật theo địa điểm mới lúc {fmtAt(c.updatedAt)}. Hạng mục đã cam kết không bị thay.</Banner>}
      {offers[0] && <Banner kind="upd" icon="vendor"><b>Có dịch vụ trọn gói gần nơi tổ chức:</b> {offers[0].v.name} ({fmtKm(offers[0].d)}) nhận được {offers[0].open.length} hạng mục chưa chốt: {offers[0].open.map(k => k.name).join(', ')}.
        <div style={{ marginTop: 8 }}><button className="btn sm" onClick={() => setPkg(offers[0].v.id)}>Xem và chọn trọn gói</button></div></Banner>}
      <section className="card"><div className="list">{catsVisible(c.situation).map(k => {
        const s = catState(c, dir, k.k);
        return (
          <button key={k.k} className="row" onClick={() => nav(`${base}/nha-cung-cap/goi-y/${k.k}`)}><span className="num-badge"><Icon n="vendor" c="sm" /></span>
            <div className="grow"><div className="title">{k.name}</div>
              <div className="meta"><StatusPillCat s={s.status} />{s.vendor && <><span>{s.vendor.name}</span><span className="dist num">{s.vendor.family ? 'gia đình tự thêm' : fmtKm(s.vendor.d)}</span></>}
                {s.vendor && s.vendor.cats.length > 1 && <span className="pill prio">Trọn gói</span>}
                {upd.includes(k.k) && <span className="pill prio"><Icon n="refresh" c="sm" />Đã cập nhật</span>}
                {s.cv?.acceptedAt && <span className="pill done">Đã nghiệm thu</span>}</div></div>
            <Icon n="chev" c="chev" /></button>
        );
      })}</div></section>
      <p className="note">Nguồn: danh bạ do Admin quản lý + nhà cung cấp gia đình tự thêm + nhà cung cấp trong hồ sơ chuẩn bị. Không đặt lịch, không thanh toán qua app.</p>
      {add && <FamilyVendorSheet onClose={() => setAdd(false)} />}
      {pkg && <PackageSheet vid={pkg} onClose={() => setPkg(null)} />}
    </div>
  );
}

/* ---------- Bản đồ vị trí tương đối quanh nơi tổ chức ---------- */
const project = (o: GeoPoint, p: GeoPoint) => ({ x: (p.lng - o.lng) * Math.cos(o.lat * Math.PI / 180) * 111.32, y: (p.lat - o.lat) * 110.57 });
function MapSvg({ cat }: { cat: VendorCat }) {
  const { c, dir } = useCase();
  const site = siteOf(c), s = catState(c, dir, cat);
  if (!site.geo) return <div className="empty"><Icon n="map" c="lg" /><span>Thêm vị trí nơi tổ chức để xem bản đồ và khoảng cách.</span></div>;
  const all = dir.filter(v => v.active && v.cats.includes(cat) && v.geo);
  const pts = all.map(v => ({ v, ...project(site.geo!, v.geo!) }));
  const maxD = Math.max(3, ...pts.map(p => Math.hypot(p.x, p.y)));
  const sc = 90 / maxD, cx = 150, cy = 110, ring = Math.max(1, Math.round(maxD / 2));
  const okIds = s.r.ok.map(o => o.v.id), top = s.r.ok[0]?.v.id;
  return (
    <svg className="map-svg" viewBox="0 0 300 220" role="img" aria-label="Bản đồ vị trí nhà cung cấp quanh nơi tổ chức">
      <circle className="ring" cx={cx} cy={cy} r={ring * sc} /><text className="ltxt" x={cx + ring * sc + 3} y={cy - 2}>{ring} km</text>
      {pts.map(p => {
        const x = cx + p.x * sc, y = cy - p.y * sc, i = okIds.indexOf(p.v.id);
        return <g key={p.v.id}><circle className={p.v.id === top ? 'v-top' : i >= 0 ? 'v-ok' : 'v-out'} cx={x} cy={y} r={p.v.id === top ? 7 : 5} />
          <text x={x + 9} y={y + 3}>{i >= 0 ? `${i + 1}. ` : ''}{p.v.name.length > 22 ? p.v.name.slice(0, 21) + '…' : p.v.name}</text></g>;
      })}
      <circle className="venue" cx={cx} cy={cy} r={8} /><text x={cx - 30} y={cy + 22} style={{ fontWeight: 600 }}>{venueLabel(c)}</text>
    </svg>
  );
}

/* ---------- S-VEN-02 ---------- */
export function SuggestPage() { return <PaidGate module="Nhà cung cấp"><Suggest /></PaidGate>; }
function Suggest() {
  const { hm = 'xe' } = useParams();
  const cat = (CATS.some(k => k.k === hm) ? hm : 'xe') as VendorCat;
  const { c, base, update, dir, isU1 } = useCase();
  const { mobile, toast } = useApp();
  const nav = useNavigate();
  const [add, setAdd] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const s = catState(c, dir, cat), r = s.r, upd = (c.updatedCats ?? []).includes(cat);
  const maps = mapsSearchUrl(cat, siteOf(c));
  const confirm = (id: string, family = false) => {
    const e = update(d => confirmVendor(d, cat, id, family));
    toast(e ?? 'Đã chọn. Người lo Nhà cung cấp liên hệ để chốt cam kết.');
  };
  const crit = <div className="chips" style={{ gap: 6 }}><span className="pill soft">Loại: {catName(cat)}</span><span className="pill soft">{FORM_LABEL[c.situation.form]}</span><span className="pill soft">Trong khu vực phục vụ</span><span className="pill soft">Xếp theo khoảng cách</span></div>;
  let top, rest: typeof r.ok = [];
  if ((s.status === 'committed' || s.status === 'confirmed') && s.vendor) {
    top = <section className="vend-top"><div className="eyebrow">{s.status === 'committed' ? 'Đã cam kết' : 'Đã chọn · chờ cam kết'}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><h3 style={{ fontSize: 19, flex: 1 }}>{s.vendor.name}</h3><span className="dist num">{s.vendor.family ? 'gia đình tự thêm' : fmtKm(s.vendor.d)}</span></div>
      <div className="muted num">{s.vendor.phone || '—'}</div>
      {s.status === 'committed' && <p className="muted"><Icon n="lock" c="sm" /> Bên đã cam kết thì app không tự thay. Nếu nơi tổ chức đổi, app sẽ hỏi anh trong mục Cần quyết.</p>}
      <div><button className="btn" onClick={() => nav(`${base}/nha-cung-cap/${s.vendor!.id}`, { state: { from: `nha-cung-cap/goi-y/${cat}` } })}>Xem báo giá, cam kết, nghiệm thu</button></div></section>;
    rest = r.ok.filter(o => o.v.id !== s.vendor!.id);
  } else if (s.status === 'empty') {
    top = <section className="card"><div className="empty"><Icon n="pin" c="lg" />
      <h3 style={{ color: 'var(--text)' }}>{r.hasGeo ? `Chưa có ${catName(cat).toLowerCase()} phù hợp gần nơi tổ chức` : 'Chưa có vị trí nơi tổ chức'}</h3>
      <p>{r.hasGeo ? `Danh bạ chưa có bên nào phục vụ khu vực ${venueLabel(c)}. Tìm các bên gần nhất trên Google Maps, gọi hỏi giá, rồi thêm bên gia đình chọn vào đây.` : 'Thêm vị trí ở thẻ “Tính từ” phía trên để app gợi ý bên gần nhất.'}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {maps && <a className="btn primary" href={maps} target="_blank" rel="noreferrer"><Icon n="pin" c="sm" />Tìm quanh đây trên Google Maps</a>}
        <button className={maps ? 'btn' : 'btn primary'} onClick={() => setAdd(true)}><Icon n="plus" c="sm" />Thêm nhà cung cấp của gia đình</button></div></div></section>;
  } else {
    const o = r.ok[0];
    top = <section className="vend-top"><div className="eyebrow">App điền sẵn · chờ anh xác nhận</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><span className="rank" style={{ background: 'var(--primary)', color: 'var(--primary-ink)' }}>1</span><h3 style={{ fontSize: 19, flex: 1 }}>{o.v.name}</h3><span className="dist num">{fmtKm(o.d)}</span></div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{o.v.cats.length > 1 && <span className="pill prio">Trọn gói · {o.v.cats.length} hạng mục</span>}{o.prio && <span className="pill prio">Từ hồ sơ chuẩn bị</span>}<span className="pill done">Đúng loại dịch vụ</span><span className="pill done">Phục vụ khu vực này</span></div>
      <div className="muted num">{o.v.phone}{o.prio ? ' · Ưu tiên vì gia đình đã chọn trong hồ sơ chuẩn bị, dù không phải bên gần nhất.' : ''}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn primary" onClick={() => confirm(o.v.id)}><Icon n="check" c="sm" />Xác nhận bên này</button>
        <a className="btn" href={`tel:${o.v.phone.replace(/\s/g, '')}`}>Gọi hỏi giá</a></div></section>;
    rest = r.ok.slice(1);
  }
  const restHTML = rest.length > 0 && (
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Các bên khác phù hợp</h3></div>
      <div className="list">{rest.map((o, i) => (
        <div key={o.v.id} className="row"><span className="rank">{s.status === 'suggest' ? i + 2 : i + 1}</span>
          <div className="grow"><div className="title">{o.v.name}</div><div className="meta"><span className="dist num">{fmtKm(o.d)}</span><span className="num">{o.v.phone}</span>{o.v.cats.length > 1 && <span className="pill prio">Trọn gói: {o.v.cats.map(catName).join(', ')}</span>}</div></div>
          {s.status !== 'committed' && <button className="btn sm" onClick={() => confirm(o.v.id)}>Chọn bên này</button>}</div>))}</div></section>
  );
  const outHTML = r.out[0] && <Banner kind="info"><b>{r.out[0].v.name}</b> (gia đình chỉ định) cách nơi tổ chức {fmtKm(r.out[0].d)} — <b>ngoài khu vực phục vụ</b> nên không được điền sẵn. Anh vẫn có thể liên hệ riêng.</Banner>;
  const noGeoList = !r.hasGeo && r.unknown.length > 0 && (
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Trong danh bạ (chưa tính được khoảng cách)</h3></div>
      <div className="list">{r.unknown.map(o => <div key={o.v.id} className="row"><div className="grow"><div className="title">{o.v.name}</div><div className="meta"><span className="num">{o.v.phone}</span><span>Phục vụ bán kính {o.v.radiusKm} km</span></div></div>
        <button className="btn sm" onClick={() => confirm(o.v.id)}>Chọn bên này</button></div>)}</div></section>
  );
  const fam = (c.familyVendors ?? []).filter(v => v.cats.includes(cat));
  const famHTML = (
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Nhà cung cấp của gia đình</h3><button className="btn sm" onClick={() => setAdd(true)} style={{ marginLeft: 'auto' }}><Icon n="plus" c="sm" />Thêm</button></div>
      {fam.length ? <div className="list">{fam.map(v => (
        <div key={v.id} className="row"><span className="num-badge"><Icon n="user" c="sm" /></span><div className="grow"><div className="title">{v.name}</div><div className="meta"><span className="num">{v.phone || '—'}</span><span>{v.cats.map(catName).join(', ')}</span>{v.note && <span>{v.note}</span>}</div></div>
          {s.cv?.vendorId === v.id ? <span className="pill done">Đang chọn</span> : s.status !== 'committed' && <button className="btn sm" onClick={() => confirm(v.id, true)}>Chọn bên này</button>}</div>))}</div>
        : <p className="muted" style={{ padding: '0 16px 14px' }}>Bên quen biết, người trong họ giới thiệu… gia đình tự thêm. Chỉ gia đình này thấy.</p>}
      {maps && s.status !== 'empty' && <p className="muted" style={{ padding: '0 16px 14px' }}>Muốn so sánh thêm? <a href={maps} target="_blank" rel="noreferrer">Tìm quanh nơi tổ chức trên Google Maps</a>, gọi hỏi giá rồi thêm bên gia đình chọn.</p>}</section>
  );
  const head = <>
    <div className="page-title"><div><div className="eyebrow">Gợi ý nhà cung cấp</div><h1 style={{ marginTop: 4 }}>{catName(cat)}</h1></div></div>
    <VenueCard compact />
    {upd && <Banner kind="upd" icon="refresh"><b>Đã cập nhật theo địa điểm mới</b>: {venueLabel(c)}, lúc {fmtAt(c.updatedAt)}. Bên điền sẵn trước đây không còn phù hợp.</Banner>}
    {crit}
    {!isU1 && <p className="muted">Người đại diện gia đình xác nhận lựa chọn cuối cùng.</p>}
  </>;
  if (mobile) return <div className="page">{head}{top}{outHTML}{restHTML}{noGeoList}{famHTML}
    {s.status !== 'empty' && r.hasGeo && <button className="btn" onClick={() => setShowMap(true)}><Icon n="map" c="sm" />Xem bản đồ</button>}
    {add && <FamilyVendorSheet cat={cat} useNow onClose={() => setAdd(false)} />}
    {showMap && <Sheet title="Bản đồ nhà cung cấp" onClose={() => setShowMap(false)}><MapSvg cat={cat} /><p className="note">Khoảng cách đường chim bay từ nơi tổ chức.</p></Sheet>}</div>;
  return (
    <div className="page">{head}
      <div className="grid-2"><div className="stack">{top}{outHTML}{restHTML}{noGeoList}{famHTML}</div>
        <div className="stack"><section className="card card-pad"><MapSvg cat={cat} /><p className="note" style={{ marginTop: 8 }}>Khoảng cách đường chim bay từ nơi tổ chức; vòng đứt nét là mốc bán kính.</p></section></div></div>
      {add && <FamilyVendorSheet cat={cat} useNow onClose={() => setAdd(false)} />}
    </div>
  );
}

/* ---------- S-VEN-03 + S-VEN-05 ---------- */
type Tab = 'quote' | 'commit' | 'inc' | 'accept' | 'debt';
export function VendorDetailPage() { return <PaidGate module="Nhà cung cấp"><VendorDetail /></PaidGate>; }
function VendorDetail() {
  const { vid = '' } = useParams();
  const { c, base, update, dir, me } = useCase();
  const { mobile, toast } = useApp();
  const [tab, setTab] = useState<Tab>('quote');
  const [form, setForm] = useState<null | 'quote' | 'commit' | 'inc' | 'accept'>(null);
  const v = findVendor(c, dir, vid);
  if (!v) return <div className="page"><div className="empty"><span>Không tìm thấy nhà cung cấp.</span><Link className="btn" to={`${base}/nha-cung-cap`}>Về Nhà cung cấp</Link></div></div>;
  const cats = catsVisible(c.situation).filter(k => c.vendors?.[k.k]?.vendorId === vid);
  const cvs = cats.map(k => ({ k: k.k, cv: c.vendors![k.k]! }));
  const st = cvs.some(x => x.cv.status === 'committed') ? 'committed' : cvs.length ? 'confirmed' : 'none';
  const main = cvs[0];
  const accepted = cvs.length > 0 && cvs.every(x => x.cv.acceptedAt);
  const site = siteOf(c);
  const dist = v.geo && site.geo ? distanceKm(site.geo, v.geo) : null;
  const exps = (c.finance?.expenses ?? []).filter(e => e.vendorId === vid && e.status !== 'rejected');
  const owe = exps.reduce((s2, e) => s2 + (e.amount - e.paid), 0);
  const needPick = !main && <p className="muted" style={{ padding: 16 }}>Chưa chọn bên này cho hạng mục nào.</p>;
  const secs: Record<Tab, ReactNode> = {
    quote: needPick || <div className="card-pad stack" style={{ gap: 8 }}>{main.cv.quote ? <div className="row" style={{ padding: 0 }}><div className="grow"><div className="title">{main.cv.quote.text}</div><div className="meta"><span>Ghi lúc {fmtAt(main.cv.quote.at)}{main.cv.quote.by ? ' · ' + main.cv.quote.by : ''}</span></div></div>{main.cv.quote.amount ? <span className="num" style={{ fontWeight: 600 }}>{money(main.cv.quote.amount)}</span> : null}</div> : <p className="muted">Chưa có báo giá. Người lo Nhà cung cấp liên hệ và ghi lại.</p>}
      <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => setForm('quote')}><Icon n="plus" c="sm" />{main.cv.quote ? 'Ghi báo giá mới' : 'Ghi báo giá'}</button></div>,
    commit: needPick || (main.cv.commitment ? <dl className="kv" style={{ padding: 16 }}><dt>Việc</dt><dd>{main.cv.commitment.what}</dd><dt>Thời gian</dt><dd>{main.cv.commitment.when}</dd><dt>Ghi lúc</dt><dd>{fmtAt(main.cv.commitment.at)}</dd></dl>
      : <div className="card-pad stack" style={{ gap: 8 }}><p className="muted">Chưa có cam kết. Sau khi thống nhất, ghi lại giờ, việc và điều kiện.</p><button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => setForm('commit')}>Ghi cam kết</button></div>),
    inc: needPick || <div className="card-pad stack" style={{ gap: 8 }}>{main.cv.incidents.length ? <div className="list">{main.cv.incidents.map((x, i) => <div key={i} className="row" style={{ padding: '8px 0' }}><div className="grow"><div className="title">{x.text}</div><div className="meta"><span>{fmtAt(x.at)}</span></div></div>{x.amount ? <span className="num">{money(x.amount)}</span> : null}</div>)}</div> : <p className="muted">Chưa có phát sinh.</p>}
      <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => setForm('inc')}><Icon n="plus" c="sm" />Ghi phát sinh</button></div>,
    accept: needPick || (accepted ? <Banner kind="info" icon="check">Đã nghiệm thu lúc {fmtAt(main.cv.acceptedAt)}.</Banner>
      : <div style={{ padding: 16 }} className="stack"><p className="muted">Sau khi xong việc, người phụ trách xác nhận nhà cung cấp làm đúng cam kết.</p><button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => setForm('accept')}><Icon n="check" c="sm" />Nghiệm thu</button></div>),
    debt: exps.length ? <dl className="kv" style={{ padding: 16 }}><dt>Tổng</dt><dd className="num">{money(exps.reduce((s2, e) => s2 + e.amount, 0))}</dd><dt>Đã trả</dt><dd className="num">{money(exps.reduce((s2, e) => s2 + e.paid, 0))}</dd><dt>Còn trả</dt><dd className="num" style={{ fontWeight: 600 }}>{money(owe)}</dd><dt>Khoản chi</dt><dd>{exps.map(e => e.name).join('; ')}</dd></dl>
      : <p className="muted" style={{ padding: 16 }}>Chưa có khoản chi gắn với bên này. Ghi ở Tài chính → Đề nghị chi.</p>,
  };
  const T: [Tab, string][] = [['quote', 'Báo giá'], ['commit', 'Cam kết'], ['inc', 'Phát sinh'], ['accept', 'Nghiệm thu'], ['debt', 'Công nợ']];
  const head = (
    <div className="page-title"><div><div className="eyebrow">{v.cats.length > 1 ? 'Dịch vụ trọn gói · ' + v.cats.map(catName).join(', ') : catName(v.cats[0])}{v.family ? ' · nhà cung cấp của gia đình' : ''}</div><h1 style={{ marginTop: 4 }}>{v.name}</h1>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>{st === 'committed' ? <span className="pill done">Đã cam kết</span> : st === 'confirmed' ? <span className="pill doing">Đã chọn · chờ cam kết</span> : <span className="pill soft">Chưa chọn</span>}
        {accepted && <span className="pill done">Đã nghiệm thu</span>}{dist !== null && <span className="pill soft num">{fmtKm(dist)} tới nơi tổ chức</span>}<span className="pill soft num">{v.phone || '—'}</span></div></div></div>
  );
  return (
    <div className="page">{head}
      {mobile ? T.map(([k, l]) => <section key={k} className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 0 }}><h3>{l}</h3></div>{secs[k]}</section>)
        : <section className="card"><div className="tabs" role="tablist" style={{ padding: '0 8px' }}>{T.map(([k, l]) => <button key={k} className="tab" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>{secs[tab]}</section>}
      {form && main && <VendorLogSheet kind={form} name={v.name} onClose={() => setForm(null)} onSave={(text, amount, when) => {
        const e = update(d => {
          for (const x of cvs) {
            if (form === 'quote') recordQuote(d, x.k, text, amount, me.name);
            if (form === 'inc') { recordIncident(d, x.k, text, amount, me.name); break; }
            if (form === 'commit') commitVendor(d, x.k, text, when);
          }
          if (form === 'accept') acceptVendor(d, vid, me.name);
        });
        if (e) return e;
        toast(form === 'accept' ? 'Đã ghi nghiệm thu' : form === 'commit' ? 'Đã ghi cam kết' : form === 'quote' ? 'Đã ghi báo giá' : 'Đã ghi phát sinh');
        return null;
      }} />}
    </div>
  );
}

function VendorLogSheet({ kind, name, onClose, onSave }: { kind: 'quote' | 'commit' | 'inc' | 'accept'; name: string; onClose: () => void; onSave: (text: string, amount: number | undefined, when: string) => string | null }) {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [when, setWhen] = useState('');
  const [checks, setChecks] = useState({ a: false, b: false });
  const [err, setErr] = useState<string | null>(null);
  const title = { quote: 'Ghi báo giá', commit: 'Ghi cam kết', inc: 'Ghi phát sinh', accept: 'Nghiệm thu' }[kind];
  const save = () => {
    if (kind !== 'accept' && !text.trim()) { setErr('Cần ghi nội dung.'); return; }
    if (kind === 'commit' && !when.trim()) { setErr('Cần ghi thời gian đã thống nhất.'); return; }
    if (kind === 'accept' && !(checks.a && checks.b)) { setErr('Kiểm đủ hai mục trước khi nghiệm thu.'); return; }
    const e = onSave(text, parseMoney(amount) || undefined, when);
    if (e) setErr(e); else onClose();
  };
  return (
    <Sheet title={`${title} · ${name}`} onClose={onClose} foot={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn primary" onClick={save}>{kind === 'accept' ? 'Xác nhận nghiệm thu' : 'Lưu'}</button></>}>
      {kind === 'accept' ? <>
        <label className="check"><input type="checkbox" checked={checks.a} onChange={e => setChecks({ ...checks, a: e.target.checked })} /><span>Đã làm đúng việc và đúng giờ như cam kết</span></label>
        <label className="check"><input type="checkbox" checked={checks.b} onChange={e => setChecks({ ...checks, b: e.target.checked })} /><span>Phát sinh (nếu có) đã được ghi lại</span></label>
      </> : <>
        <div className="field"><label htmlFor="vlText">{kind === 'commit' ? 'Việc đã thống nhất' : kind === 'quote' ? 'Nội dung báo giá' : 'Phát sinh'}</label>
          <textarea className="input" id="vlText" value={text} onChange={e => setText(e.target.value)} placeholder={kind === 'commit' ? 'Ví dụ: Đón linh cữu tại nhà, đưa tới nơi an táng; 1 xe 16 chỗ cho gia đình' : kind === 'quote' ? 'Ví dụ: Xe tang và 1 xe 16 chỗ' : 'Ví dụ: Thêm 2 giờ nhạc lễ'} /></div>
        {kind === 'commit' ? <div className="field"><label htmlFor="vlWhen">Thời gian</label><input className="input" id="vlWhen" value={when} onChange={e => setWhen(e.target.value)} placeholder="Ví dụ: 7:00 sáng ngày đưa tang" /></div>
          : <div className="field"><label htmlFor="vlAmt">Số tiền (đồng, nếu có)</label><input className="input num" id="vlAmt" inputMode="numeric" value={amount} onChange={e => setAmount(fmtMoneyInput(e.target.value))} placeholder="0" /></div>}
      </>}
      <ErrorBanner err={err} />
    </Sheet>
  );
}

