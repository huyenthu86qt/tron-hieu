// Lịch âm Việt Nam (thuật toán Hồ Ngọc Đức), múi giờ +7.
// Đã đối chiếu: Tết Bính Ngọ 17/02/2026, Tết Đinh Mùi 06/02/2027, Trung thu 25/09/2026 (15/8).

const TZ = 7;

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  return jd;
}

function newMoon(k: number): number {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = Math.PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let c1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  c1 = c1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  c1 = c1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  c1 = c1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  c1 = c1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  c1 = c1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  c1 = c1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const dt = T < -11
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Math.floor(jd1 + c1 - dt + 0.5 + TZ / 24);
}

function sunLong(jdn: number): number {
  const T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = Math.PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor(L / Math.PI * 6);
}

function month11(yy: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = newMoon(k);
  if (sunLong(nm) >= 9) nm = newMoon(k - 1);
  return nm;
}

function leapOffset(a11: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0, i = 1, arc = sunLong(newMoon(k + i));
  do { last = arc; i++; arc = sunLong(newMoon(k + i)); } while (arc !== last && i < 14);
  return i - 1;
}

export interface LunarDate { day: number; month: number; year: number; leap: boolean }

export function toLunar(date: Date): LunarDate {
  const dd = date.getDate(), mm = date.getMonth() + 1, yy = date.getFullYear();
  const dn = jdFromDate(dd, mm, yy);
  const k = Math.floor((dn - 2415021.076998695) / 29.530588853);
  let ms = newMoon(k + 1);
  if (ms > dn) ms = newMoon(k);
  let a11 = month11(yy), b11 = a11, ly: number;
  if (a11 >= ms) { ly = yy; a11 = month11(yy - 1); } else { ly = yy + 1; b11 = month11(yy + 1); }
  const day = dn - ms + 1, diff = Math.floor((ms - a11) / 29);
  let leap = false, month = diff + 11;
  if (b11 - a11 > 365) {
    const lo = leapOffset(a11);
    if (diff >= lo) { month = diff + 10; if (diff === lo) leap = true; }
  }
  if (month > 12) month -= 12;
  if (month >= 11 && diff < 4) ly -= 1;
  return { day, month, year: ly, leap };
}

const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

export const canChi = (year: number): string => `${CAN[year % 10]} ${CHI[year % 12]}`;

/** Ngày dương của cùng ngày/tháng âm vào năm âm kế tiếp (giỗ đầu) */
export function lunarAnniversary(date: Date): Date | null {
  const L = toLunar(date);
  for (let i = 330; i <= 400; i++) {
    const x = new Date(date);
    x.setDate(x.getDate() + i);
    const M = toLunar(x);
    if (M.year === L.year + 1 && M.month === L.month && M.day === L.day && !M.leap) return x;
  }
  return null;
}

export const formatLunar = (d: Date, withYear = false): string => {
  const L = toLunar(d);
  return `${L.day}/${L.month}${L.leap ? ' nhuận' : ''}${withYear ? ' năm ' + canChi(L.year) : ''}`;
};
