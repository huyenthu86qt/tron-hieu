// Lưu tệp (Phase 3b): kho riêng tư trên máy chủ Supabase. Bản chạy thử trên máy chỉ ghi tên tệp.
// Đường dẫn: case-files/<mã đám hiếu>/<loại>/<tệp> · pre-files/<mã hồ sơ>/<tệp>
// Loại 'fin' (chứng từ chi tiêu) chỉ người giữ Tài chính mở được — máy chủ kiểm tra.
import { friendlyError, REMOTE, sb } from './backend';

export type Bucket = 'case-files' | 'pre-files';
export type CaseFileKind = 'doc' | 'task' | 'fin' | 'after';
export interface Stored { name: string; path?: string }

export const MAX_FILE_MB = 15;

/** Tên tệp an toàn cho đường dẫn: bỏ dấu tiếng Việt, ký tự lạ */
function safeName(n: string) {
  const s = n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-');
  return s.slice(-80) || 'tep';
}

async function put(bucket: Bucket, folder: string, file: File): Promise<Stored> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`Tệp lớn hơn ${MAX_FILE_MB} MB. Chụp lại ảnh nhỏ hơn hoặc chọn tệp khác.`);
  if (!REMOTE) return { name: file.name };
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName(file.name)}`;
  const { error } = await sb!.storage.from(bucket).upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(friendlyError(error));
  return { name: file.name, path };
}

export const uploadCaseFile = (caseId: string, kind: CaseFileKind, file: File) => put('case-files', `${caseId}/${kind}`, file);
export const uploadPreFile = (preId: string, file: File) => put('pre-files', preId, file);

/** Mở tệp bằng link ký tạm 5 phút (không có đường dẫn công khai) */
export async function openStored(bucket: Bucket, path: string) {
  // Mở thẻ mới ngay khi bấm để trình duyệt không chặn cửa sổ bật lên, rồi mới gắn link
  const w = window.open('', '_blank');
  const { data, error } = await sb!.storage.from(bucket).createSignedUrl(path, 300);
  if (error || !data) {
    w?.close();
    throw new Error(error ? friendlyError(error) : 'Không mở được tệp.');
  }
  if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
}

/** Bỏ tệp khỏi kho (khi xóa tài liệu). Lỗi không chặn thao tác của người dùng. */
export async function removeStored(bucket: Bucket, path?: string) {
  if (!REMOTE || !path) return;
  await sb!.storage.from(bucket).remove([path]).catch(() => undefined);
}
