// Sổ tưởng nhớ — miễn phí cho mọi gia đình. Kỷ niệm của người trong đội và lời tưởng nhớ khách gửi (người đại diện duyệt).
// Giọng trầm, ấm: không “thích”, không bình luận, không bài viết của app ở đây.
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { markBellSeen, playMindfulBell } from '../../ui/bell';
import type { CaseData } from '../../domain/types';
import { U1_ID } from '../../domain/model';
import { lifeSpan } from '../../domain/person';
import { useUser } from '../../repo/platformStore';
import { REMOTE } from '../../repo/backend';
import { uploadCaseFile } from '../../repo/files';
import {
  addMemory, deleteMemory, listMemories, moderateMemory, signedPhotoUrl, updateMemory, type Memory, type MemoryVisibility,
} from '../../repo/nghiaTinh';
import { Icon } from '../../ui/Icon';
import { Banner, ErrorBanner, Opts, useApp } from '../../ui/common';
import { useUploader } from '../../ui/files';
import { DN, useCase } from '../CaseContext';

const PROMPTS = [
  'Điều cụ hay dặn con cháu là gì?',
  'Món ăn cụ thích nhất, ai nấu cho cụ?',
  'Một kỷ niệm làm anh/chị mỉm cười khi nhớ lại?',
  'Cụ đã dạy anh/chị điều gì mà đến giờ vẫn nhớ?',
  'Nơi cụ thích ngồi nhất trong nhà?',
  'Câu nói quen thuộc của cụ?',
  'Lần cuối anh/chị trò chuyện với cụ?',
  'Điều anh/chị muốn nói với cụ hôm nay?',
];
const VIS: { k: MemoryVisibility; title: string; note: string }[] = [
  { k: 'family', title: 'Gia đình', note: 'Người trong đội đám hiếu đọc được' },
  { k: 'private', title: 'Chỉ mình tôi', note: 'Như một lá thư riêng gửi người đã khuất' },
  { k: 'public', title: 'Công khai', note: 'Hiện cả trên trang thông tin (cáo phó) khi trang đang mở' },
];
const VIS_LABEL: Record<MemoryVisibility, string> = { family: 'Gia đình', private: 'Chỉ mình tôi', public: 'Công khai' };
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

function Photo({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { void signedPhotoUrl(path).then(setUrl); }, [path]);
  if (!url) return null;
  return <img src={url} alt="Ảnh kỷ niệm" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 10 }} />;
}

export function MemoryPage() {
  const { c, me } = useCase();
  const user = useUser()!;
  const { toast } = useApp();
  const up = useUploader();
  const isRep = me.id === U1_ID;
  const [L, setL] = useState<Memory[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({ body: '', visibility: 'family' as MemoryVisibility, prompt: '' as string, photoPath: undefined as string | undefined, photoName: '' });
  const [edit, setEdit] = useState<{ id: string; body: string } | null>(null);
  const [dl, setDl] = useState(false);
  const [params] = useSearchParams();
  // Mở từ chuông chánh niệm: dừng lại vài giây trước khi đọc sổ
  const [pause, setPause] = useState(params.get('lang') === '1');
  useEffect(() => { markBellSeen(); }, []);
  useEffect(() => {
    if (!pause) return;
    playMindfulBell();
    const t = setTimeout(() => setPause(false), 4500);
    return () => clearTimeout(t);
  }, [pause]);
  const [prompts] = useState(() => [...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 4));

  const load = useCallback(() => listMemories(c.id).then(setL).catch(e => setErr((e as Error).message)), [c.id]);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    const e = await addMemory(c.id, user.id, me.name || user.name, { body: f.body, visibility: f.visibility, prompt: f.prompt || undefined, photoPath: f.photoPath });
    if (e) { setErr(e); return; }
    setErr(null); setF({ body: '', visibility: f.visibility, prompt: '', photoPath: undefined, photoName: '' });
    toast('Đã lưu vào Sổ tưởng nhớ'); void load();
  };
  const pending = (L ?? []).filter(m => m.kind === 'guest' && m.status === 'pending');
  const shown = (L ?? []).filter(m => m.status === 'approved');

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      {pause && (
        <div className="mindful-pause" role="dialog" aria-label="Dừng lại một chút" onClick={() => setPause(false)}>
          <Icon n="candle" c="lg" />
          <p className="mp-1">Dừng lại một chút.</p>
          <p className="mp-2">Hít thở. Nhớ về {DN(c)}.</p>
          <p className="mp-3">Chạm để vào sổ</p>
        </div>
      )}
      <section className="memorial" style={{ alignItems: 'center' }}>
        {c.person.photo ? <div className="portrait" style={{ padding: 0, overflow: 'hidden' }}><img src={c.person.photo} alt="Ảnh thờ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          : <div className="portrait"><Icon n="candle" c="lg" /></div>}
        <div style={{ flex: 1 }}><div className="eyebrow">Sổ tưởng nhớ</div><h2>{DN(c)}</h2><div className="sub num">{lifeSpan(c.person)}</div>
          <p className="muted" style={{ marginTop: 6 }}>Nơi con cháu và người thân lưu lại kỷ niệm, lời dặn, những điều muốn nói. Cuốn sổ này ở lại với gia đình.</p></div>
        {shown.length > 0 && <button className="btn sm" style={{ alignSelf: 'flex-start' }} disabled={dl} onClick={async () => { setDl(true); await downloadMemoryBook(c, L ?? []); setDl(false); }}><Icon n="doc" c="sm" />{dl ? 'Đang chuẩn bị…' : 'Tải Sổ tưởng nhớ'}</button>}
      </section>

      <section className="card card-pad stack">
        <h3>Viết vào sổ</h3>
        <div className="chips">{prompts.map(p => <button key={p} type="button" className="chip" aria-pressed={f.prompt === p} onClick={() => setF({ ...f, prompt: f.prompt === p ? '' : p })}>{p}</button>)}</div>
        <textarea className="input" rows={5} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} aria-label="Nội dung kỷ niệm"
          placeholder={f.prompt || 'Một kỷ niệm, một lời dặn, một điều muốn nói…'} />
        <div className="field"><label>Ai đọc được</label><Opts value={f.visibility} onChange={v => setF({ ...f, visibility: v })} items={VIS} /></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label className="btn sm file-btn" aria-disabled={up.busy}><Icon n="plus" c="sm" />{up.busy ? 'Đang tải ảnh…' : f.photoName ? 'Đổi ảnh' : 'Thêm ảnh'}
            <input type="file" accept="image/*" disabled={up.busy} onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; const s = await up.run(() => uploadCaseFile(c.id, 'memory', file)); if (s) setF(x => ({ ...x, photoPath: s.path, photoName: s.name })); }} /></label>
          {f.photoName && <span className="muted">{f.photoName}</span>}
          <button className="btn primary" style={{ marginLeft: 'auto' }} disabled={!f.body.trim()} onClick={() => void save()}>Lưu vào sổ</button>
        </div>
        {!REMOTE && f.photoName && <p className="note">Bản chạy thử chỉ ghi tên ảnh.</p>}
        <ErrorBanner err={err} />
      </section>

      {isRep && pending.length > 0 && (
        <section className="card card-pad stack">
          <h3>Lời tưởng nhớ khách gửi · chờ gia đình xem</h3>
          <p className="muted">Khách gửi từ trang thông tin (cáo phó). Chỉ hiện công khai sau khi anh/chị đồng ý.</p>
          {pending.map(m => (
            <div key={m.id} className="row" style={{ alignItems: 'flex-start' }}><div className="grow">
              <div className="title">{m.authorName}</div><p style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{m.body}</p><div className="meta"><span>{fmtDay(m.createdAt)}</span></div></div>
              <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                <button className="btn sm primary" onClick={async () => { const e = await moderateMemory(m.id, 'approved'); toast(e ?? 'Đã cho hiện trên trang thông tin'); void load(); }}>Cho hiện</button>
                <button className="btn sm ghost" onClick={async () => { const e = await moderateMemory(m.id, 'hidden'); toast(e ?? 'Đã ẩn'); void load(); }}>Không hiện</button></div>
            </div>
          ))}
        </section>
      )}

      <section className="stack" style={{ gap: 12 }}>
        {L === null ? <p className="muted">Đang mở sổ…</p> : shown.length === 0
          ? <div className="empty"><Icon n="candle" c="lg" /><span>Sổ còn trống. Dòng đầu tiên có thể chỉ là một câu nói quen của người đã khuất.</span></div>
          : shown.map(m => (
            <article key={m.id} className="card card-pad stack memory-entry" style={{ gap: 8 }}>
              {m.prompt && <div className="eyebrow">{m.prompt}</div>}
              {edit?.id === m.id
                ? <textarea className="input" rows={4} value={edit.body} onChange={e => setEdit({ ...edit, body: e.target.value })} aria-label="Sửa nội dung" />
                : <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.6 }}>{m.body}</p>}
              {m.photoPath && <Photo path={m.photoPath} />}
              <div className="meta"><span>{m.kind === 'guest' ? `${m.authorName} (khách viếng)` : m.authorName}</span><span>{fmtDay(m.createdAt)}</span>
                <span className="pill soft">{m.kind === 'guest' ? 'Công khai' : VIS_LABEL[m.visibility]}</span></div>
              {(m.authorId === user.id || isRep) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {m.authorId === user.id && (edit?.id === m.id
                    ? <><button className="btn sm primary" onClick={async () => { const e = await updateMemory(m.id, { body: edit.body }); if (e) toast(e); else { setEdit(null); void load(); } }}>Lưu</button><button className="btn sm ghost" onClick={() => setEdit(null)}>Thôi</button></>
                    : <button className="btn sm ghost" onClick={() => setEdit({ id: m.id, body: m.body })}>Sửa</button>)}
                  {m.authorId === user.id && m.kind === 'family' && <select className="input" style={{ width: 'auto', minHeight: 32, fontSize: 13 }} value={m.visibility} aria-label="Ai đọc được"
                    onChange={async e => { const x = await updateMemory(m.id, { visibility: e.target.value as MemoryVisibility }); if (x) toast(x); else void load(); }}>{VIS.map(v => <option key={v.k} value={v.k}>{v.title}</option>)}</select>}
                  <button className="btn sm ghost" style={{ color: 'var(--danger)' }} onClick={async () => { if (!window.confirm('Bỏ dòng này khỏi sổ?')) return; const e = await deleteMemory(m.id); toast(e ?? 'Đã bỏ'); void load(); }}>Bỏ</button>
                </div>
              )}
            </article>
          ))}
      </section>
      {shown.some(m => m.visibility === 'public') && <Banner kind="info" icon="lotus">Những dòng “Công khai” hiện trên trang thông tin (cáo phó) khi trang đang mở.</Banner>}
    </div>
  );
}

/** Tải Sổ tưởng nhớ: các dòng “Gia đình” + “Công khai” (không có dòng “Chỉ mình tôi”), ảnh nhúng sẵn để giữ lâu dài */
async function downloadMemoryBook(c: CaseData, entries: Memory[]) {
  const esc = (s: string) => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
  const list = entries.filter(m => m.status === 'approved' && m.visibility !== 'private').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const photo = async (path?: string) => {
    if (!path) return '';
    try {
      const url = await signedPhotoUrl(path);
      if (!url) return '';
      const blob = await (await fetch(url)).blob();
      const data = await new Promise<string>(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(blob); });
      return `<img src="${data}" alt="">`;
    } catch { return ''; }
  };
  const items = await Promise.all(list.map(async m => `<article>${m.prompt ? `<div class="q">${esc(m.prompt)}</div>` : ''}<p>${esc(m.body).replace(/\n/g, '<br>')}</p>${await photo(m.photoPath)}
    <div class="by">— ${esc(m.kind === 'guest' ? `${m.authorName} (khách viếng)` : m.authorName)} · ${new Date(m.createdAt).toLocaleDateString('vi-VN')}</div></article>`));
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Sổ tưởng nhớ ${esc(DN(c))}</title>
<style>body{font-family:"Noto Serif",Georgia,serif;color:#2B2622;max-width:720px;margin:32px auto;padding:0 18px;line-height:1.7;background:#FFFDF9}
h1{text-align:center;font-size:30px;margin:8px 0 0}.sub{text-align:center;color:#6E655C;font-family:system-ui,sans-serif}
.orn{text-align:center;color:#B8893E;font-size:22px;margin:18px 0}article{border-top:1px solid #E3DBD0;padding:18px 0;break-inside:avoid}
.q{font-family:system-ui,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#B8893E}p{font-size:18px;margin:6px 0}
img{max-width:100%;border-radius:8px;margin:8px 0}.by{color:#6E655C;font-family:system-ui,sans-serif;font-size:14px}</style></head><body>
<div class="orn">❦</div><h1>Sổ tưởng nhớ</h1><p class="sub">${esc(DN(c))} · ${esc(lifeSpan(c.person))}</p><div class="orn">❦</div>
${items.join('\n') || '<p class="sub">Sổ còn trống.</p>'}
<p class="sub" style="margin-top:32px">Trọn Hiếu · Chu toàn việc hiếu – Trọn vẹn nghĩa tình</p></body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  a.download = `so-tuong-nho-${c.id}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
