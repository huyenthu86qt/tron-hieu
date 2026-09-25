import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Access, Member } from '../domain/types';
import {
  addCustomTask, areaUse, initials, assignTask, completeTask, deleteCustomTask, editTask, inviteMember, removeMember, renewLink,
  restoreTask, saveAreas, saveMember, skipTask, type AreaEdit, type TaskForm,
} from '../domain/actions';
import { dependencies, findTask, U1_ID, visibleTasks } from '../domain/model';
import { PHASES } from '../domain/templates';
import { Icon } from '../ui/Icon';
import { Banner, Chips, ErrorBanner, Opts, Sheet, toggleIn, useApp } from '../ui/common';
import { ACCESS_LABEL, memberOf, useCase } from './CaseContext';
import { NAV } from './nav';

export function CaseSheets() {
  const { sheet } = useCase();
  if (!sheet) return null;
  switch (sheet.type) {
    case 'more': return <MoreSheet />;
    case 'lock': return <LockSheet taskId={sheet.taskId} />;
    case 'assign': return <AssignSheet taskId={sheet.taskId} />;
    case 'taskform': return <TaskFormSheet key={sheet.mode === 'edit' ? sheet.id : 'new'} />;
    case 'invite': return <InviteSheet />;
    case 'member': return <MemberSheet key={sheet.id} id={sheet.id} />;
    case 'areas': return <AreasSheet />;
  }
}

export const linkUrl = (token: string) => `${window.location.origin}/l/${token}`;

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

/* ---------- Thêm (điện thoại) ---------- */
function MoreSheet() {
  const { c, base, update, openSheet } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const close = () => openSheet(null);
  return (
    <Sheet title="Thêm" onClose={close}>
      <div className="list card">
        {NAV.slice(4).map(n => n.to === undefined
          ? <button key={n.k} className="row" onClick={() => toast(`${n.label} sẽ mở ở giai đoạn sau`)}><Icon n={n.icon} /><div className="grow"><div className="title">{n.label}</div></div><span className="pill soft">Giai đoạn sau</span></button>
          : <button key={n.k} className="row" onClick={() => { close(); nav(`${base}/${n.to}`); }}><Icon n={n.icon} /><div className="grow"><div className="title">{n.label}</div></div><Icon n="chev" c="chev" /></button>)}
        <button className="row" onClick={() => { update(d => { d.mourning = !d.mourning; }); close(); toast(c.mourning ? 'Đã tắt Chế độ tang gia' : 'Đã bật Chế độ tang gia'); }}>
          <Icon n="settings" /><div className="grow"><div className="title">Chế độ tang gia</div><div className="meta">{c.mourning ? 'Đang bật — chỉ báo điều cần quyết' : 'Đang tắt'}</div></div>
        </button>
        <button className="row" onClick={() => { close(); nav('/app'); }}><Icon n="swap" /><div className="grow"><div className="title">Đổi hồ sơ</div></div></button>
      </div>
    </Sheet>
  );
}

/* ---------- S-MAP-05 · Cảnh báo không thể quay lại ---------- */
function LockSheet({ taskId }: { taskId: string }) {
  const { c, update, openSheet } = useCase();
  const { toast } = useApp();
  const t = findTask(c, taskId);
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState('');
  const [err, setErr] = useState<string | null>(null);
  if (!t) return null;
  const list = t.checks ?? ['Gia đình đã thống nhất việc này'];
  const all = list.every((_, i) => checks[i]);
  const open = dependencies(c, t).open;
  const close = () => openSheet(null);
  const done = () => {
    const e = update(d => completeTask(d, t.id, { checksOk: all, riskNote: all ? '' : note }));
    if (e) { setErr(e); return; }
    close();
    toast(`Đã ghi nhận: ${t.title} xong. Việc đã khóa.`);
  };
  return (
    <Sheet title="Trước khi đánh dấu xong" onClose={close} foot={<>
      <button className="btn" onClick={close}>Để sau</button>
      <button className="btn primary" onClick={done} disabled={open.length > 0 || !(all || note.trim())}>{all ? 'Xác nhận đã xong' : 'Chấp nhận rủi ro và đánh dấu xong'}</button>
    </>}>
      <div className="card card-pad" style={{ background: 'var(--surface-2)' }}><div className="eyebrow">Việc</div><div style={{ fontWeight: 500 }}>{t.title}</div></div>
      <Banner kind="warn" icon="lock"><b>Việc này không thể quay lại.</b> {t.lockText ?? 'Sau khi xác nhận, việc sẽ bị khóa.'}</Banner>
      {open.length > 0 && <Banner kind="info">Còn {open.length} việc phía trước chưa xong: {open.map(x => x.title).join('; ')}. Hoàn tất các việc này trước khi xác nhận.</Banner>}
      <p className="muted">Anh kiểm lại giúp gia đình:</p>
      <div>{list.map((l, i) => (
        <label key={i} className="check"><input type="checkbox" checked={!!checks[i]} onChange={e => setChecks({ ...checks, [i]: e.target.checked })} /><span>{l}</span></label>
      ))}</div>
      <div className="field"><label htmlFor="riskNote">Nếu chưa đủ mà vẫn phải tiến hành, ghi lý do (sẽ lưu vào lịch sử)</label>
        <textarea className="input" id="riskNote" value={note} onChange={e => setNote(e.target.value)} placeholder="Ví dụ: Chú Út ở nước ngoài không kịp về, gia đình đã gọi video." /></div>
      <ErrorBanner err={err} />
    </Sheet>
  );
}

/* ---------- S-TEAM-04 · Giao việc ---------- */
function AssignSheet({ taskId }: { taskId: string }) {
  const { c, update, openSheet } = useCase();
  const { toast } = useApp();
  const t = findTask(c, taskId);
  const [to, setTo] = useState<string | null>(null);
  const [note, setNote] = useState('');
  if (!t) return null;
  const close = () => openSheet(null);
  const others = c.members.filter(m => m.id !== U1_ID);
  const go = () => {
    const m = memberOf(c, to);
    if (!m) return;
    update(d => assignTask(d, t.id, m.id, note));
    close();
    toast('Đã giao cho ' + m.name + (m.access === 'link' ? ' — gửi kèm link' : ''));
  };
  return (
    <Sheet title="Giao việc" onClose={close} foot={<><button className="btn" onClick={close}>Hủy</button><button className="btn primary" onClick={go} disabled={!to}>Giao việc</button></>}>
      <div className="card card-pad"><div className="eyebrow">Việc</div><div style={{ fontWeight: 500, marginTop: 2 }}>{t.title}</div><div className="muted">Chặng {t.phase} · {t.due}</div></div>
      <div className="field"><label>Giao cho</label>
        {others.length ? (
          <div className="opts">{others.map(m => (
            <button key={m.id} className="opt" role="radio" aria-checked={to === m.id} onClick={() => setTo(m.id)}>
              <span className="radio" />
              <span className="who" style={{ flex: 1 }}><span className="av">{initials(m.name)}</span>
                <span><span className="title">{m.name}</span><br /><span className="muted">{m.rel} · {m.areas.join(', ')}{m.access === 'link' ? ' · qua link' : ''}</span></span></span>
            </button>
          ))}</div>
        ) : (
          <div className="empty"><Icon n="team" c="lg" /><span>Chưa có ai trong đội. Mời người hỗ trợ trước, rồi giao việc.</span>
            <button className="btn" onClick={() => openSheet({ type: 'invite' })}><Icon n="plus" c="sm" />Mời người hỗ trợ</button></div>
        )}
      </div>
      <div className="field"><label htmlFor="asgNote">Lời nhắn (tùy chọn)</label>
        <textarea className="input" id="asgNote" value={note} onChange={e => setNote(e.target.value)} placeholder="Ví dụ: Danh sách họ hàng bên nội ở trong sổ của bố, ngăn kéo bàn thờ." /></div>
    </Sheet>
  );
}

/* ---------- S-MAP-07 · Thêm / sửa việc ---------- */
function TaskFormSheet() {
  const { c, update, sheet, openSheet } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const { base } = useCase();
  const isNew = sheet?.type === 'taskform' && sheet.mode === 'new';
  const t = sheet?.type === 'taskform' && sheet.mode === 'edit' ? findTask(c, sheet.id) : null;
  const [f, setF] = useState<TaskForm>(() => t
    ? { title: t.title, phase: t.phase, due: t.due, owner: t.owner ?? '', area: t.area, note: t.note ?? '' }
    : { title: '', phase: sheet?.type === 'taskform' && sheet.mode === 'new' ? sheet.phase : 1, due: '', owner: '', area: 'Toàn bộ', note: '' });
  const [err, setErr] = useState<string | null>(null);
  const [askSkip, setAskSkip] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const close = () => openSheet(null);
  const gen = !!t && !t.custom;
  const areas = ['Toàn bộ', ...c.areas, ...(f.area && f.area !== 'Toàn bộ' && !c.areas.includes(f.area) ? [f.area] : [])];
  const set = <K extends keyof TaskForm>(k: K, v: TaskForm[K]) => setF({ ...f, [k]: v });

  const save = () => {
    const e = update(d => { if (isNew) addCustomTask(d, f); else if (t) editTask(d, t.id, f); });
    if (e) { setErr(e); return; }
    close();
    toast(isNew ? `Đã thêm việc riêng vào chặng ${f.phase}` : 'Đã lưu việc');
  };
  const skip = () => {
    if (!t) return;
    const e = update(d => skipTask(d, t.id, skipReason));
    if (e) { setErr(e); return; }
    close(); toast('Đã đánh dấu không áp dụng');
  };
  const restore = () => { if (!t) return; update(d => restoreTask(d, t.id)); close(); toast('Đã khôi phục việc'); };
  const del = () => {
    if (!t) return;
    update(d => deleteCustomTask(d, t.id));
    close();
    if (window.location.pathname.includes(`/viec/${t.id}`)) nav(`${base}/ban-do`);
    toast(`Đã xóa việc “${t.title}”`);
  };

  return (
    <Sheet title={isNew ? 'Thêm việc riêng' : 'Sửa việc'} onClose={close} foot={<><button className="btn" onClick={close}>Hủy</button><button className="btn primary" onClick={save}>{isNew ? 'Thêm việc' : 'Lưu'}</button></>}>
      {gen && <Banner kind="info" icon="lotus">Việc này do app sinh theo hoàn cảnh{t.why ? ` (vì: ${t.why})` : ''}. Gia đình sửa được tên, hạn, người phụ trách; nếu nhà mình không làm, đánh dấu “Không áp dụng”.</Banner>}
      <div className="field"><label htmlFor="tfTitle">Tên việc</label><input className="input" id="tfTitle" value={f.title} onChange={e => set('title', e.target.value)} placeholder="Ví dụ: Mời đội múa lân của làng đưa tiễn" /></div>
      <div className="field"><label htmlFor="tfPhase">Thuộc chặng</label>
        <select className="input" id="tfPhase" value={f.phase} disabled={gen} onChange={e => set('phase', Number(e.target.value))}>
          {PHASES.map((p, i) => <option key={p} value={i + 1}>Chặng {i + 1} · {p}</option>)}
        </select>{gen && <p className="muted">Việc do app sinh giữ nguyên chặng.</p>}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <div className="field"><label htmlFor="tfDue">Hạn</label><input className="input" id="tfDue" value={f.due} onChange={e => set('due', e.target.value)} placeholder="Ví dụ: Trước 17:00 ngày 26/09" /></div>
        <div className="field"><label htmlFor="tfOwner">Người phụ trách</label>
          <select className="input" id="tfOwner" value={f.owner} onChange={e => set('owner', e.target.value)}>
            <option value="">Chưa có người nhận</option>
            {c.members.map(m => <option key={m.id} value={m.id}>{m.name} · {m.rel}</option>)}
          </select></div>
      </div>
      <div className="field"><label htmlFor="tfArea">Vùng trách nhiệm</label>
        <select className="input" id="tfArea" value={f.area} onChange={e => set('area', e.target.value)}>{areas.map(a => <option key={a}>{a}</option>)}</select></div>
      <div className="field"><label htmlFor="tfNote">Ghi chú (tùy chọn)</label>
        <textarea className="input" id="tfNote" value={f.note} onChange={e => set('note', e.target.value)} placeholder="Ví dụ: liên hệ bác trưởng họ để mượn đồ thờ" /></div>
      <ErrorBanner err={err} />
      {gen && (t.status === 'skip'
        ? <Banner kind="info"><b>Đang đánh dấu không áp dụng</b>{t.skipReason ? ': ' + t.skipReason : ''}<div style={{ marginTop: 8 }}><button className="btn sm" onClick={restore}>Khôi phục việc này</button></div></Banner>
        : askSkip
          ? <div className="card card-pad stack" style={{ gap: 8, background: 'var(--surface-2)' }}>
              <div className="field"><label htmlFor="tfSkip">Vì sao nhà mình không làm việc này?</label>
                <input className="input" id="tfSkip" value={skipReason} onChange={e => setSkipReason(e.target.value)} placeholder="Ví dụ: gia đình không làm lễ này theo nếp nhà" /></div>
              <div style={{ display: 'flex', gap: 8 }}><button className="btn sm" onClick={skip}>Đánh dấu không áp dụng</button><button className="btn sm ghost" onClick={() => setAskSkip(false)}>Hủy</button></div>
            </div>
          : <button className="btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setAskSkip(true)}>Không áp dụng cho gia đình…</button>)}
      {t?.custom && (confirmDel
        ? <Banner kind="warn"><b>Xóa việc “{t.title}”?</b><div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button className="btn sm danger" onClick={del}>Xóa việc</button><button className="btn sm" onClick={() => setConfirmDel(false)}>Hủy</button></div></Banner>
        : <button className="btn ghost" style={{ alignSelf: 'flex-start', color: 'var(--danger)' }} onClick={() => setConfirmDel(true)}>Xóa việc riêng này</button>)}
    </Sheet>
  );
}

/* ---------- S-TEAM-02 · Mời người hỗ trợ ---------- */
const ACCESS_OPTS: { k: Access; title: string; note: string }[] = [
  { k: 'full', title: 'Đầy đủ (Full)', note: 'Thấy toàn bộ đám hiếu, cần tài khoản' },
  { k: 'limited', title: 'Giới hạn (Limited)', note: 'Chỉ thấy các vùng trách nhiệm được giao' },
  { k: 'link', title: 'Chỉ qua link', note: 'Không cần cài app — chỉ thấy việc được nhờ' },
];
const RELS = ['Con trai trưởng', 'Con trai', 'Con gái', 'Con dâu', 'Con rể', 'Cháu', 'Họ hàng', 'Hàng xóm', 'Bạn của gia đình'];

function InviteSheet() {
  const { c, update, openSheet } = useCase();
  const { toast } = useApp();
  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  const [access, setAccess] = useState<Access>('link');
  const [areas, setAreas] = useState<string[]>([]);
  const [made, setMade] = useState<Member | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const close = () => openSheet(null);
  const make = () => {
    let m: Member | null = null;
    const e = update(d => { m = inviteMember(d, { name, rel, access, areas }); });
    if (e) { setErr(e); return; }
    setMade(m);
  };
  if (made) {
    const url = made.linkToken ? linkUrl(made.linkToken) : '';
    return (
      <Sheet title="Mời người hỗ trợ" onClose={close} foot={<button className="btn primary" onClick={close}>Xong</button>}>
        {made.access === 'link' ? <>
          <Banner kind="info" icon="check">Đã tạo link cho <b>{made.name}</b>. Người nhận mở link là thấy đúng việc của mình, không cần cài app.</Banner>
          <div className="link-box"><span>{url}</span><button className="btn sm" onClick={async () => toast(await copyText(url) ? 'Đã sao chép link' : 'Không sao chép được — chọn và sao chép thủ công')}><Icon n="copy" c="sm" />Sao chép</button></div>
          <p className="note">Link chỉ mở được trên thiết bị này cho tới khi có máy chủ (giai đoạn 3).</p>
          <a className="btn" href={url} target="_blank" rel="noreferrer"><Icon n="user" />Xem như người nhận</a>
        </> : <Banner kind="info" icon="check">Đã thêm <b>{made.name}</b> vào đội. Lời mời đăng nhập sẽ gửi qua số điện thoại khi có tài khoản (giai đoạn 3).</Banner>}
        {c.tasks.length > 0 && <p className="muted">Giao việc cho {made.name} ở nút “Nhờ người khác” của từng việc.</p>}
      </Sheet>
    );
  }
  return (
    <Sheet title="Mời người hỗ trợ" onClose={close} foot={<><button className="btn" onClick={close}>Hủy</button><button className="btn primary" onClick={make}><Icon n="link" c="sm" />{access === 'link' ? 'Tạo link mời' : 'Thêm vào đội'}</button></>}>
      <div className="field"><label htmlFor="invName">Tên người hỗ trợ</label><input className="input" id="invName" value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Chú Bảy" /></div>
      <div className="field"><label htmlFor="invRel">Quan hệ với gia đình</label><input className="input" id="invRel" value={rel} onChange={e => setRel(e.target.value)} />
        <Chips items={RELS} isOn={x => rel === x} onToggle={setRel} /></div>
      <div className="field"><label>Cách tham gia</label><Opts value={access} onChange={setAccess} items={ACCESS_OPTS} /></div>
      <div className="field"><label>Vùng trách nhiệm</label><Chips items={c.areas} isOn={a => areas.includes(a)} onToggle={a => setAreas(toggleIn(areas, a))} /></div>
      <ErrorBanner err={err} />
    </Sheet>
  );
}

/* ---------- S-TEAM-08 · Sửa thành viên ---------- */
function MemberSheet({ id }: { id: string }) {
  const { c, update, openSheet } = useCase();
  const { toast } = useApp();
  const m = memberOf(c, id);
  const [f, setF] = useState(() => ({ name: m?.name ?? '', rel: m?.rel ?? '', access: m?.access ?? 'limited' as Access, areas: m?.areas ?? [] }));
  const [err, setErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  if (!m) return null;
  const isU1 = id === U1_ID, isOrg = !!m.system;
  const open = visibleTasks(c).filter(x => x.owner === id && x.status !== 'done').length;
  const close = () => openSheet(null);
  const save = () => {
    const e = update(d => saveMember(d, id, f));
    if (e) { setErr(e); return; }
    close(); toast('Đã lưu thông tin ' + f.name.trim());
  };
  const del = () => { update(d => removeMember(d, id)); close(); toast('Đã bỏ ' + m.name + ' khỏi đội'); };
  const areaItems = [...(isU1 ? ['Toàn bộ'] : []), ...c.areas, ...f.areas.filter(a => a !== 'Toàn bộ' && !c.areas.includes(a))];
  return (
    <Sheet title="Sửa thành viên" onClose={close} foot={<><button className="btn" onClick={close}>Hủy</button><button className="btn primary" onClick={save}>Lưu</button></>}>
      <div className="field"><label htmlFor="mName">Họ tên</label><input className="input" id="mName" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
      <div className="field"><label htmlFor="mRel">Quan hệ với người đã khuất / gia đình</label>
        <input className="input" id="mRel" value={f.rel} disabled={isOrg} onChange={e => setF({ ...f, rel: e.target.value })} />
        {!isOrg && <Chips items={RELS} isOn={x => f.rel === x} onToggle={x => setF({ ...f, rel: x })} />}</div>
      <div className="field"><label>Cách tham gia</label>
        <Opts value={f.access} onChange={a => setF({ ...f, access: a })} items={ACCESS_OPTS} disabled={isU1} />
        {isU1 && <p className="muted">Người đại diện gia đình luôn có quyền đầy đủ.</p>}
        {m.access === 'link' && m.linkToken && (
          <div className="link-box"><span>{linkUrl(m.linkToken)}</span>
            <button className="btn sm" onClick={async () => toast(await copyText(linkUrl(m.linkToken!)) ? 'Đã sao chép link' : 'Không sao chép được')}><Icon n="copy" c="sm" />Sao chép</button>
            <button className="btn sm ghost" onClick={() => { update(d => renewLink(d, id)); toast('Đã thu hồi link cũ và tạo link mới'); }}><Icon n="refresh" c="sm" />Cấp link mới</button></div>
        )}</div>
      <div className="field"><label>Vùng trách nhiệm</label>
        <Chips items={areaItems} isOn={a => f.areas.includes(a)} onToggle={a => setF({ ...f, areas: toggleIn(f.areas, a) })} />
        <button className="btn sm ghost" style={{ alignSelf: 'flex-start' }} onClick={() => openSheet({ type: 'areas', back: { type: 'member', id } })}><Icon n="settings" c="sm" />Sửa danh sách vùng</button></div>
      <ErrorBanner err={err} />
      {!isU1 && (confirmDel
        ? <Banner kind="warn"><b>Bỏ {m.name} khỏi đội?</b> {open ? `${open} việc đang giao cho người này sẽ trở về “Chưa có người nhận”.` : 'Người này không còn việc nào đang mở.'}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><button className="btn sm danger" onClick={del}>Bỏ khỏi đội</button><button className="btn sm" onClick={() => setConfirmDel(false)}>Hủy</button></div></Banner>
        : <button className="btn ghost" style={{ alignSelf: 'flex-start', color: 'var(--danger)' }} onClick={() => setConfirmDel(true)}>Bỏ khỏi đội</button>)}
      <p className="note">Tham gia: {ACCESS_LABEL[f.access]}.</p>
    </Sheet>
  );
}

/* ---------- S-TEAM-03 · Sửa vùng trách nhiệm ---------- */
function AreasSheet() {
  const { c, update, sheet, openSheet } = useCase();
  const { toast } = useApp();
  const [list, setList] = useState<AreaEdit[]>(() => c.areas.map(a => ({ name: a, orig: a })));
  const [add, setAdd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const back = sheet?.type === 'areas' ? sheet.back : undefined;
  const close = () => openSheet(back ?? null);
  const addOne = () => {
    const n = add.trim();
    if (!n) { setErr('Nhập tên vùng mới.'); return; }
    if (list.some(x => !x.del && x.name.trim().toLowerCase() === n.toLowerCase())) { setErr('Vùng này đã có.'); return; }
    setList([...list, { name: n, orig: null }]); setAdd(''); setErr(null);
  };
  const save = () => {
    const e = update(d => { saveAreas(d, list); });
    if (e) { setErr(e); return; }
    close(); toast('Đã lưu vùng trách nhiệm');
  };
  return (
    <Sheet title="Sửa vùng trách nhiệm" onClose={close} foot={<><button className="btn" onClick={close}>Hủy</button><button className="btn primary" onClick={save}>Lưu</button></>}>
      <p className="muted">Đổi tên thì mọi người và mọi việc đang dùng vùng đó được cập nhật theo.</p>
      <div className="stack" style={{ gap: 8 }}>{list.map((x, i) => x.del ? null : (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="input" value={x.name} aria-label="Tên vùng" onChange={e => setList(list.map((y, j) => j === i ? { ...y, name: e.target.value } : y))} />
          <span className="muted num" style={{ whiteSpace: 'nowrap' }}>{x.orig ? areaUse(c, x.orig) : 0} nơi dùng</span>
          <button className="icon-btn" aria-label="Xóa vùng" onClick={() => setList(list.map((y, j) => j === i ? { ...y, del: true } : y))}><Icon n="x" c="sm" /></button>
        </div>))}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="input" value={add} onChange={e => setAdd(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addOne(); }} placeholder="Thêm vùng mới, ví dụ: Nghi lễ tôn giáo" />
        <button className="btn" onClick={addOne}><Icon n="plus" c="sm" />Thêm</button></div>
      <ErrorBanner err={err} />
      <p className="note">Xóa một vùng đang dùng thì vùng đó được gỡ khỏi những người đang giữ; các việc thuộc vùng đó chuyển về “Toàn bộ”.</p>
    </Sheet>
  );
}
