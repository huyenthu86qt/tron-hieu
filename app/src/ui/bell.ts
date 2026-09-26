// Chuông chánh niệm — tiếng chuông nhẹ, ngân ngắn (~3 giây), tự tạo bằng Web Audio (không dùng tệp âm thanh của ai).
// Chỉ dùng cho những điều thuộc về tình: Sổ tưởng nhớ, lời tưởng nhớ, mốc 49 ngày / 100 ngày / giỗ.
const ON_KEY = 'tronhieu.bell.on';
const LAST_KEY = 'tronhieu.bell.last';

export const bellOn = () => { try { return localStorage.getItem(ON_KEY) !== '0'; } catch { return true; } };
export const setBellOn = (on: boolean) => { try { localStorage.setItem(ON_KEY, on ? '1' : '0'); } catch { /* bỏ qua */ } };

let ctx: AudioContext | null = null;

/** Ngân một tiếng chuông nhẹ. force = nghe thử (bỏ qua công tắc tắt chuông). */
export function playMindfulBell(force = false) {
  if (!force && !bellOn()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 0.12; // nhỏ, êm
    out.connect(ctx.destination);
    // Âm cơ bản + các họa âm của chuông, họa âm cao tắt nhanh hơn
    const partials: [number, number, number][] = [[396, 1, 3.0], [396 * 2.01, 0.35, 2.0], [396 * 2.76, 0.25, 1.4], [396 * 5.4, 0.08, 0.7]];
    for (const [f, amp, dur] of partials) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(amp, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g).connect(out);
      o.start(now);
      o.stop(now + dur + 0.05);
    }
  } catch { /* trình duyệt không cho phát âm thanh — bỏ qua */ }
}

/** Thông báo thuộc về tình (Sổ tưởng nhớ, lời tưởng nhớ) */
export const isMindful = (h: { path?: string }) => h.path === 'so-tuong-nho';

/**
 * Ngân chuông một lần cho các tin mới thuộc về tình (chưa ngân trước đó trên máy này).
 * Bỏ qua tin do chính mình viết.
 */
export function ringForNew(entries: { at: string; text: string; path?: string }[], myName?: string) {
  let last = '';
  try { last = localStorage.getItem(LAST_KEY) ?? ''; } catch { /* bỏ qua */ }
  const fresh = entries.filter(h => isMindful(h) && h.at > last && !(myName && h.text.startsWith(myName + ' ')));
  if (!fresh.length) return;
  const newest = fresh.map(h => h.at).sort().at(-1)!;
  try { localStorage.setItem(LAST_KEY, newest); } catch { /* bỏ qua */ }
  // Lần đầu dùng máy này: chỉ ghi mốc, không ngân cho tin cũ
  if (!last) return;
  playMindfulBell();
}

/** Đánh dấu đã ngân tới thời điểm hiện tại (khi chính mình vừa đọc sổ) */
export function markBellSeen() { try { localStorage.setItem(LAST_KEY, new Date().toISOString()); } catch { /* bỏ qua */ } }
