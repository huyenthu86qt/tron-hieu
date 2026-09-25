// Chọn nơi lưu dữ liệu: máy chủ Supabase (khi có cấu hình) hoặc trên máy (bản chạy thử, trang /mau).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const MODE_KEY = 'tronhieu.mode';

/** Có cấu hình máy chủ trong bản build này (bài kiểm tra tự động không bao giờ dùng máy chủ thật) */
export const HAS_SERVER = !!(URL && KEY) && import.meta.env.MODE !== 'test';

/** Trình duyệt này đang ở chế độ xem dữ liệu mẫu trên máy (bật từ trang /mau) */
export const FORCED_LOCAL = (() => { try { return localStorage.getItem(MODE_KEY) === 'local'; } catch { return false; } })();

export function setLocalDemoMode(on: boolean) {
  try { if (on) localStorage.setItem(MODE_KEY, 'local'); else localStorage.removeItem(MODE_KEY); } catch { /* bỏ qua */ }
}

/** Dữ liệu đang lưu trên máy chủ */
export const REMOTE = HAS_SERVER && !FORCED_LOCAL;

export const sb: SupabaseClient | null = REMOTE ? createClient(URL!, KEY!, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

/** Mỗi số điện thoại ứng với một địa chỉ đăng nhập nội bộ (không gửi thư tới địa chỉ này) */
export const phoneEmail = (phone: string) => `${phone}@sdt.tronhieu.app`;

/** Đổi lỗi kỹ thuật của máy chủ thành câu dễ hiểu */
export function friendlyError(e: unknown): string {
  const m = (e as { message?: string })?.message ?? String(e);
  if (/Invalid login credentials/i.test(m)) return 'Số điện thoại hoặc mật khẩu chưa đúng.';
  if (/already registered|already been registered/i.test(m)) return 'Số điện thoại này đã đăng ký. Vui lòng đăng nhập.';
  if (/Email not confirmed/i.test(m)) return 'Máy chủ đang bật “xác nhận email”. Người quản trị cần tắt mục này trong Supabase (Authentication → Sign In / Providers → Email → Confirm email).';
  if (/rate limit|too many/i.test(m)) return 'Thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.';
  if (/Failed to fetch|NetworkError|network/i.test(m)) return 'Mất kết nối mạng. Kiểm tra mạng rồi thử lại — những gì đang nhập vẫn còn.';
  if (/permission denied|row-level security/i.test(m)) return 'Anh/chị không có quyền thực hiện thao tác này.';
  return m;
}
