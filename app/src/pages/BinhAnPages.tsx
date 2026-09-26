// Góc bình an — bài viết của Admin về phong tục, người ở lại, sống trọn nghĩa tình.
// Ai cũng đọc được (không cần đăng nhập), chia sẻ được qua Zalo / Facebook. Không bình luận, không “thích”.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteArticle, getArticle, isLive, listArticles, newArticle, saveArticle, slugify, uploadArticleCover, type Article, type Milestone,
} from '../repo/nghiaTinh';
import { adminLog } from '../repo/platformStore';
import { Icon } from '../ui/Icon';
import { Banner, Chips, ErrorBanner, useApp } from '../ui/common';
import { BrandLine } from '../ui/brand';
import { Markdown } from '../ui/markdown';
import { AdminShell } from './AdminPages';

export const BINH_AN = 'Góc bình an';
const TOPICS = ['Phong tục', 'Người ở lại', 'Thủ tục', 'Sống trọn nghĩa tình'];
const MILESTONE: Record<Milestone, string> = { 'sau-tang': 'Sau tang lễ', d49: 'Lễ 49 ngày', d100: 'Lễ 100 ngày', gio: 'Giỗ đầu' };
const fmtDay = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="bare"><div className="bare-inner" style={{ maxWidth: 720 }}><Link to="/" style={{ textDecoration: 'none' }}><BrandLine /></Link>{children}</div></div>;
}

function Card({ a }: { a: Article }) {
  return (
    <Link to={`/goc-binh-an/${a.slug}`} className="card article-card" style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
      {a.coverUrl && <img src={a.coverUrl} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
      <div className="card-pad stack" style={{ gap: 6 }}>
        <div className="eyebrow">{a.topics.join(' · ') || BINH_AN}</div>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{a.title}</h3>
        {a.summary && <p className="muted">{a.summary}</p>}
      </div>
    </Link>
  );
}

/** Danh sách bài đã đăng */
export function BinhAnListPage() {
  const [L, setL] = useState<Article[] | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  useEffect(() => { listArticles().then(x => setL(x.filter(a => isLive(a)))).catch(() => setL([])); }, []);
  const shown = (L ?? []).filter(a => !topic || a.topics.includes(topic));
  return (
    <Frame>
      <div><h1 style={{ fontSize: 28, fontFamily: 'var(--serif)' }}>{BINH_AN}</h1>
        <p className="muted" style={{ marginTop: 6 }}>Những bài viết nhẹ nhàng về phong tục, về người ở lại và sống trọn nghĩa tình.</p></div>
      <Chips items={TOPICS} isOn={t => topic === t} onToggle={t => setTopic(topic === t ? null : t)} />
      {L === null ? <p className="muted">Đang tải…</p> : shown.length ? <div className="stack" style={{ gap: 14 }}>{shown.map(a => <Card key={a.id} a={a} />)}</div>
        : <div className="empty"><Icon n="lotus" c="lg" /><span>Chưa có bài viết.</span></div>}
    </Frame>
  );
}

/** Đọc một bài */
export function ArticlePage() {
  const { slug = '' } = useParams();
  const { toast } = useApp();
  const [a, setA] = useState<Article | null | undefined>(undefined);
  const [more, setMore] = useState<Article[]>([]);
  useEffect(() => {
    getArticle(slug).then(x => setA(x && (isLive(x) ? x : null))).catch(() => setA(null));
    listArticles().then(x => setMore(x.filter(y => isLive(y) && y.slug !== slug).slice(0, 3))).catch(() => undefined);
  }, [slug]);
  if (a === undefined) return <Frame><p className="muted">Đang tải…</p></Frame>;
  if (!a) return <Frame><div className="empty"><Icon n="lotus" c="lg" /><span>Không tìm thấy bài viết.</span><Link className="btn" to="/goc-binh-an">Về {BINH_AN}</Link></div></Frame>;
  const url = `${window.location.origin}/goc-binh-an/${a.slug}`;
  const share = async () => {
    if (typeof navigator.share === 'function') { try { await navigator.share({ title: a.title, url }); return; } catch { return; } }
    try { await navigator.clipboard.writeText(url); toast('Đã sao chép đường dẫn bài viết'); } catch { toast(url); }
  };
  return (
    <Frame>
      <Link to="/goc-binh-an" className="muted" style={{ textDecoration: 'none' }}><Icon n="back" c="sm" /> {BINH_AN}</Link>
      <article className="stack" style={{ gap: 14 }}>
        {a.coverUrl && <img src={a.coverUrl} alt="" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', borderRadius: 12 }} />}
        <div><div className="eyebrow">{a.topics.join(' · ')}</div><h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.3, marginTop: 6 }}>{a.title}</h1>
          <p className="muted" style={{ marginTop: 6 }}>{fmtDay(a.publishAt)}</p></div>
        <Markdown text={a.body} />
        <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => void share()}><Icon n="link" c="sm" />Chia sẻ bài viết</button>
      </article>
      {more.length > 0 && <section className="stack" style={{ gap: 12 }}><h3>Đọc thêm</h3>{more.map(x => <Card key={x.id} a={x} />)}</section>}
    </Frame>
  );
}

/** Gợi ý một bài đúng mốc (dùng ở trang chủ, Hậu tang) — nhẹ nhàng, bỏ qua được */
export function ArticleSuggestion({ milestone }: { milestone: Milestone }) {
  const [a, setA] = useState<Article | null>(null);
  useEffect(() => { listArticles().then(L => setA(L.find(x => isLive(x) && x.milestone === milestone) ?? null)).catch(() => undefined); }, [milestone]);
  if (!a) return null;
  return (
    <Link to={`/goc-binh-an/${a.slug}`} className="card card-pad" style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
      <Icon n="lotus" /><div style={{ flex: 1 }}><div className="eyebrow">{BINH_AN} · {MILESTONE[milestone]}</div><div style={{ fontWeight: 600 }}>{a.title}</div></div><Icon n="chev" c="chev" />
    </Link>
  );
}

/** Trang chủ: 2–3 bài mới nhất */
export function BinhAnHomeCard() {
  const [L, setL] = useState<Article[]>([]);
  useEffect(() => { listArticles().then(x => setL(x.filter(a => isLive(a)).slice(0, 3))).catch(() => undefined); }, []);
  if (!L.length) return null;
  return (
    <section className="card"><div className="sec-h card-pad" style={{ margin: 0, paddingBottom: 4 }}><h3>{BINH_AN}</h3><Link className="btn sm ghost" to="/goc-binh-an" style={{ marginLeft: 'auto' }}>Xem tất cả</Link></div>
      <div className="list">{L.map(a => <Link key={a.id} to={`/goc-binh-an/${a.slug}`} className="row" style={{ textDecoration: 'none', color: 'inherit' }}><Icon n="lotus" c="sm" /><div className="grow"><div className="title">{a.title}</div>{a.summary && <div className="meta"><span>{a.summary}</span></div>}</div><Icon n="chev" c="chev" /></Link>)}</div>
    </section>
  );
}

/* =====================================================================
   Admin
   ===================================================================== */
const stateOf = (a: Article) => (a.status === 'draft' ? ['soft', 'Nháp'] : isLive(a) ? ['done', 'Đã đăng'] : ['wait', `Hẹn ${fmtDay(a.publishAt)}`]);

export function AdminArticlesPage() {
  const nav = useNavigate();
  const [L, setL] = useState<Article[] | null>(null);
  useEffect(() => { listArticles().then(setL).catch(() => setL([])); }, []);
  return (
    <AdminShell title={BINH_AN}><div className="page">
      <div className="page-title"><div><h1>{BINH_AN}</h1><p>Bài viết cho mọi người đọc · không bình luận, không quảng cáo</p></div>
        <div className="actions"><button className="btn primary" onClick={() => nav('/admin/goc-binh-an/moi')}><Icon n="plus" c="sm" />Viết bài mới</button>
          <Link className="btn" to="/goc-binh-an" target="_blank">Xem trang đọc</Link></div></div>
      <Banner kind="info" icon="alert">Chỉ đăng bài chị tự viết hoặc được phép dùng (cả ảnh bìa). Bài về thủ tục nên ghi “thông tin tham khảo”. Khoảng 2–4 bài mỗi tháng là đủ.</Banner>
      <section className="card">{L === null ? <div className="empty">Đang tải…</div> : L.length ? <div className="list">{L.map(a => {
        const [k, l] = stateOf(a);
        return <button key={a.id} className="row" style={{ textAlign: 'left' }} onClick={() => nav(`/admin/goc-binh-an/${a.id}`)}><div className="grow"><div className="title">{a.title}</div>
          <div className="meta"><span className={`pill ${k}`}>{l}</span>{a.milestone && <span>Gợi ý dịp: {MILESTONE[a.milestone]}</span>}<span>Sửa {fmtDay(a.updatedAt)}</span></div></div><Icon n="chev" c="chev" /></button>;
      })}</div> : <div className="empty"><span>Chưa có bài viết.</span></div>}</section>
    </div></AdminShell>
  );
}

export function AdminArticleEditPage() {
  const { id = 'moi' } = useParams();
  const nav = useNavigate();
  const { toast } = useApp();
  const [a, setA] = useState<Article | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [when, setWhen] = useState('');
  useEffect(() => {
    if (id === 'moi') { setA(newArticle()); return; }
    getArticle(id).then(x => { setA(x); setSlugTouched(true); }).catch(e => setErr((e as Error).message));
  }, [id]);
  if (!a) return <AdminShell title={BINH_AN} back="/admin/goc-binh-an"><div className="page"><p className="muted">Đang tải…</p><ErrorBanner err={err} /></div></AdminShell>;
  const set = (p: Partial<Article>) => setA({ ...a, ...p });
  const save = async (next: Partial<Article>, msg: string) => {
    setBusy(true);
    const x = { ...a, ...next, slug: a.slug || slugify(a.title) };
    const e = await saveArticle(x);
    setBusy(false);
    if (e) { setErr(e); return; }
    setErr(null); setA(x); toast(msg);
    adminLog(msg, x.title);
    if (id === 'moi') nav(`/admin/goc-binh-an/${x.id}`, { replace: true });
  };
  const [k, l] = stateOf(a);
  return (
    <AdminShell title={BINH_AN} back="/admin/goc-binh-an"><div className="page" style={{ maxWidth: 860 }}>
      <div className="page-title"><div><div className="eyebrow">{BINH_AN}</div><h1 style={{ marginTop: 4 }}>{id === 'moi' ? 'Viết bài mới' : 'Sửa bài'}</h1>
        <p><span className={`pill ${k}`}>{l}</span></p></div>
        <div className="actions"><button className="btn" onClick={() => setPreview(!preview)}>{preview ? 'Soạn tiếp' : 'Xem trước'}</button></div></div>
      {preview ? (
        <section className="card card-pad stack" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <p className="note">Xem trước trên điện thoại</p>
          {a.coverUrl && <img src={a.coverUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10 }} />}
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{a.title || '(Chưa có tiêu đề)'}</h1>
          <Markdown text={a.body} />
        </section>
      ) : (
        <section className="card card-pad stack">
          <div className="field"><label htmlFor="arTitle">Tiêu đề</label><input className="input" id="arTitle" value={a.title} onChange={e => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} /></div>
          <div className="field"><label htmlFor="arSlug">Đường dẫn</label><input className="input num" id="arSlug" value={a.slug} onChange={e => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} />
            <p className="muted">{window.location.origin}/goc-binh-an/{a.slug || '…'}</p></div>
          <div className="field"><label htmlFor="arSum">Tóm tắt (1–2 câu, hiện ở danh sách)</label><textarea className="input" id="arSum" rows={2} value={a.summary} onChange={e => set({ summary: e.target.value })} /></div>
          <div className="field"><label>Ảnh bìa (tùy chọn)</label>
            {a.coverUrl && <img src={a.coverUrl} alt="" style={{ width: 240, maxHeight: 140, objectFit: 'cover', borderRadius: 8 }} />}
            <div style={{ display: 'flex', gap: 8 }}>
              <label className="btn sm file-btn"><Icon n="plus" c="sm" />{a.coverUrl ? 'Đổi ảnh' : 'Chọn ảnh'}<input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const r = await uploadArticleCover(f); if (r.error) toast(r.error); else set({ coverUrl: r.url }); }} /></label>
              {a.coverUrl && <button className="btn sm ghost" onClick={() => set({ coverUrl: undefined })}>Bỏ ảnh</button>}</div></div>
          <div className="field"><label htmlFor="arBody">Nội dung</label>
            <textarea className="input" id="arBody" rows={18} value={a.body} onChange={e => set({ body: e.target.value })} style={{ fontFamily: 'var(--sans)', lineHeight: 1.6 }} />
            <p className="muted">Cách trình bày: dòng trống để tách đoạn · “## ” đầu dòng cho tiêu đề phụ · “- ” đầu dòng cho danh sách · **chữ đậm** · *chữ nghiêng*.</p></div>
          <div className="field"><label>Chủ đề</label><Chips items={TOPICS} isOn={t => a.topics.includes(t)} onToggle={t => set({ topics: a.topics.includes(t) ? a.topics.filter(x => x !== t) : [...a.topics, t] })} /></div>
          <div className="field"><label htmlFor="arMs">Gợi ý cho gia đình vào dịp</label>
            <select className="input" id="arMs" style={{ width: 'auto' }} value={a.milestone ?? ''} onChange={e => set({ milestone: (e.target.value || undefined) as Milestone | undefined })}>
              <option value="">Không gắn dịp nào</option>{(Object.keys(MILESTONE) as Milestone[]).map(m => <option key={m} value={m}>{MILESTONE[m]}</option>)}</select>
            <p className="muted">App gợi ý nhẹ nhàng bài này ở trang chủ / Hậu tang khi gia đình sắp tới dịp đó. Không gợi ý trong những ngày tang lễ.</p></div>
        </section>
      )}
      <ErrorBanner err={err} />
      <section className="card card-pad stack" style={{ gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" disabled={busy} onClick={() => void save({ status: a.status }, a.status === 'draft' ? 'Đã lưu nháp' : 'Đã lưu bài')}>{a.status === 'draft' ? 'Lưu nháp' : 'Lưu thay đổi'}</button>
          {a.status === 'draft' || !isLive(a)
            ? <button className="btn primary" disabled={busy || !a.title.trim() || !a.body.trim()} onClick={() => void save({ status: 'published', publishAt: new Date().toISOString() }, 'Đã đăng bài')}>Đăng ngay</button>
            : <button className="btn" disabled={busy} onClick={() => void save({ status: 'draft', publishAt: undefined }, 'Đã gỡ bài xuống (thành nháp)')}>Gỡ xuống</button>}
          {isLive(a) && <Link className="btn ghost" to={`/goc-binh-an/${a.slug}`} target="_blank">Xem bài</Link>}
        </div>
        {a.status === 'draft' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label htmlFor="arWhen" className="muted">Hẹn giờ đăng</label>
          <input className="input" id="arWhen" type="datetime-local" style={{ width: 'auto' }} value={when} onChange={e => setWhen(e.target.value)} />
          <button className="btn sm" disabled={busy || !when || !a.title.trim() || !a.body.trim()} onClick={() => void save({ status: 'published', publishAt: new Date(when).toISOString() }, 'Đã hẹn giờ đăng')}>Hẹn giờ</button></div>}
        {id !== 'moi' && <button className="btn sm ghost" style={{ alignSelf: 'flex-start', color: 'var(--danger)' }} onClick={async () => {
          if (!window.confirm('Xóa hẳn bài viết này?')) return;
          const e = await deleteArticle(a.id); if (e) { setErr(e); return; } adminLog('Xóa bài viết', a.title); toast('Đã xóa bài'); nav('/admin/goc-binh-an');
        }}>Xóa bài</button>}
      </section>
    </div></AdminShell>
  );
}
