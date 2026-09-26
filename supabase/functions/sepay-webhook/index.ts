// Trọn Hiếu · Nhận webhook giao dịch từ SePay (Phase 4).
// SePay gửi POST kèm header “Authorization: Apikey <khóa>”. Khóa đặt trong bí mật SEPAY_WEBHOOK_KEY (Chủ dự án tự dán).
// Hàm này KHÔNG yêu cầu JWT (tắt “Enforce JWT verification” khi triển khai) — thay bằng kiểm khóa API ở dưới.
// Khớp đơn do hàm máy chủ public.sepay_webhook (0009_sepay_live.sql) làm; chỉ service_role gọi được.
import { createClient } from 'npm:@supabase/supabase-js@2';

const KEY = Deno.env.get('SEPAY_WEBHOOK_KEY') ?? '';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Khóa máy chủ: hệ khóa mới SUPABASE_SECRET_KEYS (JSON), dự phòng khóa cũ SUPABASE_SERVICE_ROLE_KEY */
function serverKey(): string {
  try {
    const all = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}') as Record<string, string>;
    const k = all.default ?? Object.values(all)[0];
    if (k) return k;
  } catch { /* dùng khóa cũ */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

/** So sánh không lộ thời gian (tránh dò khóa) */
function same(a: string, b: string) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ success: false, error: 'Chỉ nhận POST' }, 405);
  if (!KEY) return json({ success: false, error: 'Máy chủ chưa cài khóa SEPAY_WEBHOOK_KEY' }, 500);
  const auth = (req.headers.get('authorization') ?? '').trim();
  if (!same(auth, `Apikey ${KEY}`)) return json({ success: false, error: 'Sai khóa' }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ success: false, error: 'Dữ liệu không phải JSON' }, 400); }

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, serverKey(), { auth: { persistSession: false } });
  const { data, error } = await sb.rpc('sepay_webhook', { p: body });
  // Lỗi máy chủ → trả 500 để SePay tự gửi lại (tối đa 7 lần trong 5 giờ)
  if (error) return json({ success: false, error: error.message }, 500);
  return json({ success: true, result: data });
});
