// Phase 3d “Nghĩa tình”: Sổ tưởng nhớ (từng gia đình, miễn phí) và Góc bình an (bài viết của Admin).
// Máy chủ: bảng memories / articles (0006_nghia_tinh.sql). Bản chạy thử trên máy: lưu localStorage.
import { friendlyError, REMOTE, sb } from './backend';
import { repo } from './repo';

export type MemoryVisibility = 'private' | 'family' | 'public';
export interface Memory {
  id: string; caseId: string; authorId: string | null; authorName: string; kind: 'family' | 'guest';
  body: string; photoPath?: string; prompt?: string; visibility: MemoryVisibility; status: 'approved' | 'pending' | 'hidden'; createdAt: string;
}
export type Milestone = 'd49' | 'd100' | 'gio' | 'sau-tang';
export interface Article {
  id: string; slug: string; title: string; summary: string; coverUrl?: string; body: string; topics: string[];
  milestone?: Milestone; status: 'draft' | 'published'; publishAt?: string; updatedAt: string;
}

/* ---------- Bản chạy thử trên máy ---------- */
const MK = 'tronhieu.memories.v1', AK = 'tronhieu.articles.v1';
const readL = <T,>(k: string): T[] => { try { return JSON.parse(localStorage.getItem(k) ?? '[]') as T[]; } catch { return []; } };
const writeL = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bộ nhớ đầy */ } };
const rid = (p: string) => p + Math.random().toString(36).slice(2, 12);

type MemRow = { id: string; case_id: string; author_id: string | null; author_name: string; kind: Memory['kind']; body: string; photo_path: string | null; prompt: string | null; visibility: MemoryVisibility; status: Memory['status']; created_at: string };
const toMem = (r: MemRow): Memory => ({ id: r.id, caseId: r.case_id, authorId: r.author_id, authorName: r.author_name, kind: r.kind, body: r.body, photoPath: r.photo_path ?? undefined, prompt: r.prompt ?? undefined, visibility: r.visibility, status: r.status, createdAt: r.created_at });

/* =====================================================================
   Sổ tưởng nhớ
   ===================================================================== */
export async function listMemories(caseId: string): Promise<Memory[]> {
  if (REMOTE) {
    const { data, error } = await sb!.from('memories').select('*').eq('case_id', caseId).order('created_at', { ascending: false });
    if (error) throw new Error(friendlyError(error));
    return (data as MemRow[]).map(toMem);
  }
  return readL<Memory>(MK).filter(m => m.caseId === caseId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addMemory(caseId: string, authorId: string, authorName: string, f: { body: string; visibility: MemoryVisibility; prompt?: string; photoPath?: string }): Promise<string | null> {
  const body = f.body.trim();
  if (!body) return 'Viết vài dòng trước khi lưu.';
  if (body.length > 4000) return 'Mỗi lần viết tối đa 4.000 ký tự.';
  if (REMOTE) {
    const { error } = await sb!.from('memories').insert({ case_id: caseId, author_id: authorId, author_name: authorName, body, visibility: f.visibility, prompt: f.prompt ?? null, photo_path: f.photoPath ?? null });
    return error ? friendlyError(error) : null;
  }
  writeL(MK, [...readL<Memory>(MK), { id: rid('mm'), caseId, authorId, authorName, kind: 'family', body, visibility: f.visibility, prompt: f.prompt, photoPath: f.photoPath, status: 'approved', createdAt: new Date().toISOString() }]);
  if (f.visibility !== 'private') await notifyLocal(caseId, `${authorName} vừa viết vào Sổ tưởng nhớ`);
  return null;
}

export async function updateMemory(id: string, patch: { body?: string; visibility?: MemoryVisibility }): Promise<string | null> {
  if (patch.body !== undefined && !patch.body.trim()) return 'Nội dung không được để trống.';
  if (REMOTE) {
    const { error } = await sb!.from('memories').update({ ...(patch.body !== undefined ? { body: patch.body.trim() } : {}), ...(patch.visibility ? { visibility: patch.visibility } : {}) }).eq('id', id);
    return error ? friendlyError(error) : null;
  }
  writeL(MK, readL<Memory>(MK).map(m => (m.id === id ? { ...m, ...patch, body: patch.body?.trim() ?? m.body } : m)));
  return null;
}

export async function deleteMemory(id: string): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.from('memories').delete().eq('id', id);
    return error ? friendlyError(error) : null;
  }
  writeL(MK, readL<Memory>(MK).filter(m => m.id !== id));
  return null;
}

/** Người đại diện duyệt / ẩn lời tưởng nhớ khách gửi */
export async function moderateMemory(id: string, status: 'approved' | 'hidden'): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.rpc('moderate_memory', { p_id: id, p_status: status });
    return error ? friendlyError(error) : null;
  }
  writeL(MK, readL<Memory>(MK).map(m => (m.id === id ? { ...m, status } : m)));
  return null;
}

/** Khách gửi lời tưởng nhớ từ trang cáo phó (không cần tài khoản) — chờ gia đình duyệt */
export async function submitGuestMemory(slug: string, caseId: string, name: string, body: string): Promise<string | null> {
  if (!name.trim()) return 'Cần ghi tên của anh/chị.';
  if (body.trim().length < 2) return 'Viết vài dòng tưởng nhớ.';
  if (body.length > 1000) return 'Tối đa 1.000 ký tự.';
  if (REMOTE) {
    const { error } = await sb!.rpc('submit_guest_memory', { p_slug: slug, p_name: name.trim(), p_body: body.trim() });
    return error ? friendlyError(error) : null;
  }
  writeL(MK, [...readL<Memory>(MK), { id: rid('mm'), caseId, authorId: null, authorName: name.trim(), kind: 'guest', body: body.trim(), visibility: 'public', status: 'pending', createdAt: new Date().toISOString() }]);
  await notifyLocal(caseId, 'Có lời tưởng nhớ mới từ khách viếng, chờ gia đình xem');
  return null;
}

export async function publicMemories(slug: string, caseId: string): Promise<{ authorName: string; body: string; createdAt: string }[]> {
  if (REMOTE) {
    const { data, error } = await sb!.rpc('public_memories', { p_slug: slug });
    if (error) return [];
    return (data as { author_name: string; body: string; created_at: string }[]).map(r => ({ authorName: r.author_name, body: r.body, createdAt: r.created_at }));
  }
  return readL<Memory>(MK).filter(m => m.caseId === caseId && m.visibility === 'public' && m.status === 'approved')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(m => ({ authorName: m.authorName, body: m.body, createdAt: m.createdAt }));
}

/** Ảnh trong Sổ tưởng nhớ: link ký tạm để hiện (tệp riêng tư của đám hiếu) */
export async function signedPhotoUrl(path: string): Promise<string | null> {
  if (!REMOTE) return null;
  const { data } = await sb!.storage.from('case-files').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/* =====================================================================
   Góc bình an
   ===================================================================== */
type ArtRow = { id: string; slug: string; title: string; summary: string; cover_url: string | null; body: string; topics: string[]; milestone: Milestone | null; status: Article['status']; publish_at: string | null; updated_at: string };
const toArt = (r: ArtRow): Article => ({ id: r.id, slug: r.slug, title: r.title, summary: r.summary, coverUrl: r.cover_url ?? undefined, body: r.body, topics: r.topics ?? [], milestone: r.milestone ?? undefined, status: r.status, publishAt: r.publish_at ?? undefined, updatedAt: r.updated_at });
export const isLive = (a: Article, now = new Date()) => a.status === 'published' && (!a.publishAt || new Date(a.publishAt) <= now);

/** Bài đã đăng (khách) hoặc mọi bài (Admin — máy chủ tự phân quyền) */
export async function listArticles(): Promise<Article[]> {
  if (REMOTE) {
    const { data, error } = await sb!.from('articles').select('*').order('publish_at', { ascending: false, nullsFirst: true });
    if (error) throw new Error(friendlyError(error));
    return (data as ArtRow[]).map(toArt);
  }
  return readL<Article>(AK).sort((a, b) => (b.publishAt ?? b.updatedAt).localeCompare(a.publishAt ?? a.updatedAt));
}

export async function getArticle(slugOrId: string): Promise<Article | null> {
  const all = await listArticles();
  return all.find(a => a.slug === slugOrId || a.id === slugOrId) ?? null;
}

/** Đường dẫn bài viết từ tiêu đề: bỏ dấu, chữ thường, gạch nối */
export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'bai-viet';

export async function saveArticle(a: Article): Promise<string | null> {
  if (!a.title.trim()) return 'Cần tiêu đề.';
  if (!a.slug.trim()) return 'Cần đường dẫn bài viết.';
  const row = { id: a.id, slug: a.slug, title: a.title.trim(), summary: a.summary.trim(), cover_url: a.coverUrl ?? null, body: a.body, topics: a.topics, milestone: a.milestone ?? null, status: a.status, publish_at: a.status === 'published' ? (a.publishAt ?? new Date().toISOString()) : (a.publishAt ?? null), updated_at: new Date().toISOString() };
  if (REMOTE) {
    const { error } = await sb!.from('articles').upsert(row);
    if (error) return /duplicate|unique/i.test(error.message) ? 'Đường dẫn này đã có bài khác dùng — đổi đường dẫn.' : friendlyError(error);
    return null;
  }
  const L = readL<Article>(AK);
  if (L.some(x => x.slug === a.slug && x.id !== a.id)) return 'Đường dẫn này đã có bài khác dùng — đổi đường dẫn.';
  writeL(AK, [...L.filter(x => x.id !== a.id), { ...a, publishAt: row.publish_at ?? undefined, updatedAt: row.updated_at }]);
  return null;
}

export async function deleteArticle(id: string): Promise<string | null> {
  if (REMOTE) {
    const { error } = await sb!.from('articles').delete().eq('id', id);
    return error ? friendlyError(error) : null;
  }
  writeL(AK, readL<Article>(AK).filter(x => x.id !== id));
  return null;
}

/** Ảnh bìa: kho công khai, trả về đường dẫn ảnh */
export async function uploadArticleCover(file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > 5 * 1024 * 1024) return { error: 'Ảnh bìa tối đa 5 MB.' };
  if (!REMOTE) return { error: 'Tải ảnh bìa chỉ có ở bản thật.' };
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${(file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const { error } = await sb!.storage.from('article-images').upload(path, file, { contentType: file.type || undefined });
  if (error) return { error: friendlyError(error) };
  return { url: sb!.storage.from('article-images').getPublicUrl(path).data.publicUrl };
}

export const newArticle = (): Article => ({ id: rid('a-'), slug: '', title: '', summary: '', body: '', topics: [], status: 'draft', updatedAt: new Date().toISOString() });

/** Bản chạy thử: ghi thông báo vào lịch sử đám hiếu (bản thật do máy chủ tự ghi) */
async function notifyLocal(caseId: string, text: string) {
  const c = await repo.get(caseId);
  if (!c) return;
  c.history.push({ at: new Date().toISOString(), text, path: 'so-tuong-nho' });
  await repo.save(c);
}
