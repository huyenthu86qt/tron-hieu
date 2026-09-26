// S-ENT-07 Tiếp nhận hồ sơ chuẩn bị · S-TEAM-05 Việc của tôi · S-X-02 Tài liệu · S-X-03 Lịch sử · S-X-04 Cài đặt · S-MAP-03 Góc nhìn
import { useState } from 'react';
import { xung } from '../../domain/text';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { inviteMember } from '../../domain/actions';
import { issueTasks, soonTasks, visibleTasks } from '../../domain/model';
import { money } from '../../domain/finance';
import { findVendor } from '../../domain/vendors';
import { milestoneList } from '../../domain/aftercare';
import { DN_TEXT } from '../../domain/text';
import { exportCase, exportCaseDoc } from '../../pages/AccountPages';
import { Icon } from '../../ui/Icon';
import { Banner, useApp } from '../../ui/common';
import { inScope, useCase } from '../CaseContext';
import { TaskRow } from '../rows';
import { FileName, useUploader } from '../../ui/files';
import { uploadCaseFile } from '../../repo/files';
import { REMOTE } from '../../repo/backend';

const fmtAt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

/* ---------- S-ENT-07 ---------- */
export function IntakePage() {
  const { c, base, update, dir } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const recv = c.intake ?? {};
  const fd = c.decisions.find(d => d.key === 'form'), vd = c.decisions.find(d => d.key === 'venue');
  const picks = Object.entries(c.familyPick ?? {}).map(([, id]) => findVendor(c, dir, id)?.name).filter(Boolean);
  const ms = milestoneList(c).map(m => m.name);
  const G: [string, string, string, string][] = [
    ['p', 'Thông tin người đã khuất', `${DN_TEXT(c)}${c.person.birthYear ? ' · ' + c.person.birthYear : ''}`, 'ho-so'],
    ['w', 'Nguyện vọng hậu sự', fd?.wish || vd?.wish ? [fd?.wish?.text, vd?.wish?.text].filter(Boolean).join(' ') + ' → hiện là đề xuất trong Cần quyết' : 'Hồ sơ để gia đình quyết hình thức và nơi làm lễ', 'can-quyet'],
    ['c', 'Người liên hệ', `${c.pendingContacts?.length ?? 0} người → mời vào Đội đám hiếu khi sẵn sàng`, 'doi'],
    ['b', 'Ngân sách', c.finance?.budget ? `${money(c.finance.budget)} → Tài chính` : 'Chưa ghi', 'tai-chinh/ngan-sach'],
    ['v', 'Nhà cung cấp mong muốn', picks.length ? `${picks.join(', ')} → ưu tiên khi gợi ý` : 'Không có', 'nha-cung-cap'],
    ['m', 'Mốc tưởng niệm', ms.length ? `${ms.join(', ')} → gợi ý ở Hậu tang` : 'Không có', 'hau-tang/moc'],
  ];
  const n = G.filter(g => recv[g[0]]).length;
  const inviteAll = () => {
    const e = update(d => {
      for (const k of d.pendingContacts ?? []) {
        if (d.members.some(m => m.phone === k.phone)) continue;
        inviteMember(d, { name: k.name, rel: k.rel || 'Người thân', access: 'limited', areas: ['Liên lạc'], phone: k.phone });
      }
      d.pendingContacts = [];
    });
    toast(e ?? 'Đã mời người liên hệ vào Đội — nhớ giao vùng trách nhiệm cho từng người');
  };
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--primary)' }}>Xin chia buồn cùng gia đình.</p>
      <div><h1 style={{ fontSize: 24 }}>Dữ liệu đã có sẵn từ hồ sơ chuẩn bị</h1><p className="muted" style={{ marginTop: 6 }}>Anh xem nhanh và xác nhận từng nhóm. Có thể sửa sau.</p></div>
      <section className="card"><div className="list">{G.map(([k, t, d, to]) => (
        <div key={k} className="row"><span className="num-badge"><Icon n={recv[k] ? 'check' : 'doc'} c="sm" /></span>
          <div className="grow"><div className="title">{t}</div><div className="meta">{d}</div>
            <div className="acts">{recv[k] ? <span className="pill done">Đã xác nhận</span> : <button className="btn sm primary" onClick={() => update(x => { x.intake = { ...(x.intake ?? {}), [k]: true }; })}>Xác nhận</button>}
              <button className="btn sm ghost" onClick={() => nav(`${base}/${to}`)}>Sửa</button>
              {k === 'c' && (c.pendingContacts?.length ?? 0) > 0 && <button className="btn sm" onClick={inviteAll}>Mời vào Đội</button>}</div></div></div>
      ))}</div></section>
      <button className="btn primary block" onClick={() => nav(base)}>Vào đám hiếu · đã xác nhận {n}/{G.length}</button>
    </div>
  );
}

/* ---------- S-TEAM-05 ---------- */
export function MyTasksPage() {
  const { c, me } = useCase();
  const mine = visibleTasks(c).filter(t => t.owner === me.id);
  const open = mine.filter(t => t.status !== 'done' && t.status !== 'skip'), done = mine.filter(t => t.status === 'done');
  const areaFree = visibleTasks(c).filter(t => !t.owner && t.status !== 'done' && t.status !== 'skip' && me.areas.includes(t.area));
  return (
    <div className="page"><div className="page-title"><div><h1>Việc của tôi</h1><p>{me.name} · {me.areas.join(', ') || 'Chưa có vùng'}</p></div></div>
      <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Đang giao cho tôi</h3><span className="muted">{open.length}</span></div>
        {open.length ? <div className="list">{open.map(t => <TaskRow key={t.id} t={t} from="viec-cua-toi" />)}</div> : <div className="empty"><Icon n="check" c="lg" /><span>Không có việc nào đang chờ anh/chị.</span></div>}</section>
      {areaFree.length > 0 && <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>Trong vùng của tôi, chưa có người nhận</h3></div><div className="list">{areaFree.map(t => <TaskRow key={t.id} t={t} from="viec-cua-toi" />)}</div></section>}
      {done.length > 0 && <section className="card"><details className="fold" style={{ borderTop: 0 }}><summary><Icon n="chev" c="chev" />Đã xong <span className="muted" style={{ marginLeft: 'auto' }}>{done.length}</span></summary><div className="list">{done.map(t => <TaskRow key={t.id} t={t} acts={false} from="viec-cua-toi" />)}</div></details></section>}
    </div>
  );
}

/* ---------- S-X-02 ---------- */
export function DocsPage() {
  const { c, base, update, me, canFin } = useCase();
  const { toast } = useApp();
  const up = useUploader();
  const ev = visibleTasks(c).filter(t => t.evidence).map(t => ({ id: t.id, name: t.evidence!, path: t.evidencePath, from: `Bằng chứng · ${t.title}`, to: `viec/${t.id}` }));
  const docs = (c.docs ?? []).map(d => ({ id: d.id, name: d.name, path: d.path, source: d.source, from: d.source === 'pre' ? 'Từ hồ sơ chuẩn bị' : d.source === 'after' ? 'Tài liệu kết quả hậu tang' : 'Gia đình tải lên', to: d.source === 'after' ? 'hau-tang' : '' }));
  const exp = (c.finance?.expenses ?? []).filter(e => e.evidence).map(e => ({ id: e.id, name: e.evidence!, path: canFin ? e.evidencePath : undefined, from: `Chứng từ · ${e.name}`, to: 'tai-chinh/khoan-chi' }));
  const all = [...docs, ...ev, ...exp];
  return (
    <div className="page" style={{ maxWidth: 860 }}><div className="page-title"><div><h1>Tài liệu</h1><p>Giấy tờ, bằng chứng, chứng từ của đám hiếu ở một chỗ</p></div>
      <div className="actions"><label className="btn primary file-btn" aria-disabled={up.busy}><Icon n="plus" c="sm" />{up.busy ? 'Đang tải lên…' : 'Thêm tài liệu'}<input type="file" disabled={up.busy} onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const s = await up.run(() => uploadCaseFile(c.id, 'doc', f)); if (s) { update(d => { (d.docs ??= []).push({ id: 'doc' + Date.now(), name: s.name, path: s.path, at: new Date().toISOString(), source: 'other' }); d.history.push({ at: new Date().toISOString(), text: `${me.name} thêm tài liệu: ${s.name}` }); }); toast('Đã thêm tài liệu'); } }} /></label></div></div>
      <section className="card">{all.length ? <div className="list">{all.map(d => (
        <div key={d.id + d.name} className="row"><Icon n="doc" /><div className="grow"><div className="title"><FileName name={d.name} path={d.path} bucket={'source' in d && d.source === 'pre' ? 'pre-files' : 'case-files'} /></div><div className="meta"><span>{d.from}</span></div></div>{d.to && <Link className="btn sm ghost" to={`${base}/${d.to}`}>Mở</Link>}</div>
      ))}</div> : <div className="empty"><Icon n="doc" c="lg" /><span>Chưa có tài liệu nào.</span></div>}</section>
      <p className="note">{REMOTE ? 'Bấm vào tên tệp để mở. Tệp lưu riêng tư — chỉ người trong đội mở được; chứng từ chi tiêu chỉ người giữ Tài chính mở được.' : 'Bản chạy thử trên máy chỉ ghi lại tên tệp; bản thật lưu tệp trên máy chủ.'}</p>
    </div>
  );
}

/* ---------- S-X-03 ---------- */
export function HistoryPage() {
  const { c, base } = useCase();
  const [q, setQ] = useState('');
  const L = c.history.filter(h => h.text.toLowerCase().includes(q.trim().toLowerCase())).slice().reverse();
  return (
    <div className="page" style={{ maxWidth: 860 }}><div className="page-title"><div><h1>Lịch sử</h1><p>Mọi thay đổi trong đám hiếu, để cả nhà cùng rõ</p></div></div>
      <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm trong lịch sử" aria-label="Tìm trong lịch sử" />
      <section className="card">{L.length ? <div className="list">{L.map((h, i) => (
        <div key={i} className="row"><div className="grow"><div className="title">{h.text}</div><div className="meta"><span>{fmtAt(h.at)}</span>{h.taskId && <Link to={`${base}/viec/${h.taskId}`}>Mở việc</Link>}</div></div></div>
      ))}</div> : <div className="empty"><span>Chưa có gì.</span></div>}</section>
    </div>
  );
}

/* ---------- S-X-04 ---------- */
export function SettingsPage() {
  const { c, update, isU1, full, me } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  return (
    <div className="page" style={{ maxWidth: 760 }}><div className="page-title"><div><h1>Cài đặt đám hiếu</h1><p>Đám hiếu {DN_TEXT(c)}</p></div></div>
      <section className="card card-pad stack"><h3>Chế độ tang gia</h3>
        <p className="muted">Khi bật, màn Bây giờ chỉ hiện điều cần {xung(me.rel)} quyết, việc của {xung(me.rel)} và việc chưa có người nhận — để người đại diện được nghỉ.</p>
        <button className="switch" style={{ alignSelf: 'flex-start' }} aria-pressed={c.mourning} onClick={() => { update(d => { d.mourning = !d.mourning; }); toast(c.mourning ? 'Đã tắt Chế độ tang gia' : 'Đã bật Chế độ tang gia'); }}><span className="knob" />{c.mourning ? 'Đang bật' : 'Đang tắt'}</button></section>
      <section className="card card-pad stack"><h3>Gói</h3>
        <p>{full ? <>Đã mở đầy đủ{c.access?.activeUntil ? ` · dùng đến ${new Date(c.access.activeUntil).toLocaleDateString('vi-VN')}` : ''}</> : 'Miễn phí: Hồ sơ, Bây giờ, Bản đồ, Chi tiết việc, Cần quyết.'}</p>
        {!full && <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => nav(`/checkout?goi=full&dh=${c.id}&ve=${encodeURIComponent(location.pathname)}`)}>Mở đầy đủ</button>}</section>
      {isU1 && <section className="card card-pad stack"><h3>Dữ liệu</h3><p className="muted">Xuất danh sách việc, chi tiêu, sổ phúng viếng (CSV). Yêu cầu xóa đám hiếu ở Tài khoản → Dữ liệu.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn" onClick={() => void exportCaseDoc(c)}><Icon n="doc" c="sm" />Tải bản lưu (in được)</button><button className="btn ghost" onClick={() => void exportCase(c)}>Bảng tính Excel</button><button className="btn ghost" onClick={() => nav('/tai-khoan')}>Mở Tài khoản</button></div></section>}
      <Banner kind="info">Hoàn cảnh (nơi làm lễ, hình thức an táng) đổi ở mục Cần quyết để thấy tác động trước khi đổi.</Banner>
    </div>
  );
}

/* ---------- S-MAP-03 — dùng trong Bản đồ khi có ?xem= ---------- */
export function MapView() {
  const [q] = useSearchParams();
  const { c, me, base } = useCase();
  const xem = q.get('xem') ?? 'sap-toi';
  const vis = visibleTasks(c).filter(t => inScope(me, t));
  const L = xem === 'van-de' ? issueTasks(c).filter(t => inScope(me, t)) : xem === 'da-xong' ? vis.filter(t => t.status === 'done' || t.status === 'skip') : soonTasks(c).filter(t => inScope(me, t));
  const T = { 'sap-toi': 'Sắp tới', 'van-de': 'Có vấn đề', 'da-xong': 'Đã xong' }[xem] ?? 'Sắp tới';
  return (
    <div className="page"><div className="page-title"><div><h1>{T}</h1><p>{L.length} việc</p></div></div>
      <div className="segin" role="group" aria-label="Góc nhìn">{[['sap-toi', 'Sắp tới'], ['van-de', 'Có vấn đề'], ['da-xong', 'Đã xong']].map(([k, l]) => <Link key={k} className="btn sm" style={xem === k ? { background: 'var(--primary-soft)' } : undefined} to={`${base}/ban-do?xem=${k}`}>{l}</Link>)}
        <Link className="btn sm ghost" to={`${base}/ban-do`}>Bản đồ đầy đủ</Link></div>
      <section className="card">{L.length ? <div className="list">{L.map(t => <TaskRow key={t.id} t={t} why from={`ban-do?xem=${xem}`} />)}</div> : <div className="empty"><span>Không có việc nào.</span></div>}</section>
    </div>
  );
}
