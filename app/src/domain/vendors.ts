// Nhà cung cấp: gợi ý đúng loại + gần nơi tổ chức nhất. App không bao giờ tự chọn thay gia đình.
import type {
  CaseData, CaseVendor, CatStatus, DirVendor, FamilyVendor, Form, GeoPoint, Situation, VendorCat, Venue, VenueSite,
} from './types';

export const CATS: { k: VendorCat; name: string; task: string; venue?: Venue; form?: Form }[] = [
  { k: 'xe', name: 'Xe tang', task: 'Đặt xe tang' },
  { k: 'rap', name: 'Rạp, bàn ghế', task: 'Thuê rạp, bàn ghế', venue: 'home' },
  { k: 'hoa', name: 'Hoa tươi, vòng hoa', task: 'Đặt hoa và vòng hoa' },
  { k: 'an', name: 'Nấu cỗ', task: 'Đặt cỗ cho khách và họ hàng' },
  { k: 'nhac', name: 'Đội nhạc lễ', task: 'Mời đội nhạc lễ' },
  { k: 'mo', name: 'Đào huyệt, xây mộ', task: 'Đặt thợ đào huyệt, xây mộ tạm', form: 'burial' },
];
export const catName = (k: VendorCat) => CATS.find(c => c.k === k)?.name ?? k;
export const catsVisible = (s: Situation) => CATS.filter(c => (!c.form || c.form === s.form) && (!c.venue || c.venue === s.venue));

/** Khoảng cách đường chim bay (km) — công thức Haversine */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const fmtKm = (d: number | null | undefined) => (typeof d === 'number' && isFinite(d) ? d.toFixed(1).replace('.', ',') + ' km' : 'chưa rõ khoảng cách');

/** Đọc “21.0285, 105.8542” (dán từ bản đồ) thành tọa độ */
export function parseGeo(s: string): GeoPoint | null {
  const m = s.trim().match(/^(-?\d{1,2}(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:[.,]\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1].replace(',', '.')), lng = Number(m[2].replace(',', '.'));
  if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) return null;
  return { lat, lng };
}
export const fmtGeo = (g?: GeoPoint) => (g ? `${g.lat.toFixed(5)}, ${g.lng.toFixed(5)}` : '');

/** Gợi ý từ danh bạ nhà cung cấp do Admin quản lý. Tắt theo quyết định Chủ dự án (26/09/2026): chỉ để nút tìm trên Google Maps.
 *  Bật lại (true) khi danh bạ đủ nhà cung cấp đã xác minh. */
export const USE_DIRECTORY = false;

export const defaultVenues = (): { home: VenueSite; hall: VenueSite } => ({ home: { name: 'Nhà riêng', address: '' }, hall: { name: 'Nhà tang lễ', address: '' } });
export const siteOf = (c: CaseData, v: Venue = c.situation.venue): VenueSite => (c.venues ?? defaultVenues())[v];
export const venueLabel = (c: CaseData, v: Venue = c.situation.venue) => {
  const s = siteOf(c, v);
  return v === 'home' ? 'Nhà riêng' : s.name && s.name !== 'Nhà tang lễ' ? s.name : 'Nhà tang lễ';
};

export const hasCat = (v: { cats: VendorCat[] }, k: VendorCat) => v.cats.includes(k);
const condOk = (v: DirVendor, form: Form) => v.cond === 'both' || v.cond === form;

export interface Ranked { v: DirVendor; d: number | null; prio: boolean; ok: boolean }

/**
 * Xếp hạng bên phù hợp: đúng loại, đang hoạt động, đúng điều kiện (mai táng / hỏa táng),
 * trong bán kính phục vụ; bên gia đình chọn trong hồ sơ chuẩn bị lên đầu, còn lại gần trước xa sau.
 * Chưa có tọa độ nơi tổ chức thì không lọc được theo khu vực — trả về theo tên, không điền sẵn.
 */
export function rank(dir: DirVendor[], cat: VendorCat, site: VenueSite, form: Form, pick?: string) {
  const all: Ranked[] = dir.filter(v => v.active && hasCat(v, cat) && condOk(v, form)).map(v => {
    const d = site.geo && v.geo ? distanceKm(site.geo, v.geo) : null;
    return { v, d, prio: pick === v.id, ok: d !== null && d <= v.radiusKm };
  });
  const ok = all.filter(o => o.ok).sort((a, b) => Number(b.prio) - Number(a.prio) || (a.d! - b.d!));
  const out = all.filter(o => !o.ok && o.prio);
  const unknown = site.geo ? [] : all.sort((a, b) => a.v.name.localeCompare(b.v.name, 'vi'));
  return { ok, out, unknown, hasGeo: !!site.geo };
}

export interface CatState {
  status: CatStatus | 'empty';
  vendor: { id: string; name: string; phone: string; family: boolean; cats: VendorCat[]; d: number | null } | null;
  r: ReturnType<typeof rank>;
  cv?: CaseVendor;
}

export function findVendor(c: CaseData, dir: DirVendor[], id: string | null | undefined) {
  if (!id) return null;
  const f = (c.familyVendors ?? []).find(x => x.id === id);
  if (f) return { id: f.id, name: f.name, phone: f.phone, family: true, cats: f.cats, geo: undefined as GeoPoint | undefined, address: f.address, note: f.note };
  const v = dir.find(x => x.id === id);
  return v ? { id: v.id, name: v.name, phone: v.phone, family: false, cats: v.cats, geo: v.geo, address: v.address, note: '' } : null;
}

export function catState(c: CaseData, dir: DirVendor[], cat: VendorCat): CatState {
  const site = siteOf(c);
  const r = rank(dir, cat, site, c.situation.form, c.familyPick?.[cat]);
  const cv = c.vendors?.[cat];
  if (cv && (cv.status === 'confirmed' || cv.status === 'committed') && cv.vendorId) {
    const v = findVendor(c, dir, cv.vendorId);
    if (v) return { status: cv.status, vendor: { ...v, d: v.geo && site.geo ? distanceKm(site.geo, v.geo) : null }, r, cv };
  }
  const top = r.ok[0];
  return { status: top ? 'suggest' : 'empty', vendor: top ? { id: top.v.id, name: top.v.name, phone: top.v.phone, family: false, cats: top.v.cats, d: top.d } : null, r, cv };
}

/** Bên đang được điền sẵn cho từng hạng mục (để biết cái nào đổi khi đổi địa điểm / danh bạ) */
export function suggestionSnapshot(c: CaseData, dir: DirVendor[]): Partial<Record<VendorCat, string | null>> {
  const out: Partial<Record<VendorCat, string | null>> = {};
  for (const k of catsVisible(c.situation)) {
    const s = catState(c, dir, k.k);
    if (s.status === 'suggest' || s.status === 'empty') out[k.k] = s.vendor?.id ?? null;
  }
  return out;
}

/** Đánh dấu hạng mục có gợi ý thay đổi so với ảnh chụp trước đó */
export function markUpdated(c: CaseData, dir: DirVendor[], before: Partial<Record<VendorCat, string | null>>, now = new Date()) {
  const after = suggestionSnapshot(c, dir);
  const changed = (Object.keys(after) as VendorCat[]).filter(k => k in before && before[k] !== after[k]);
  if (changed.length) {
    c.updatedCats = Array.from(new Set([...(c.updatedCats ?? []), ...changed]));
    c.updatedAt = now.toISOString();
  }
  return changed;
}

/**
 * Sau khi đổi nơi tổ chức: gợi ý tự tính lại; bên xe đã cam kết mà nằm ngoài khu vực phục vụ
 * của địa điểm mới thì tạo mục Cần quyết (không tự thay).
 */
export function afterVenueChange(c: CaseData, dir: DirVendor[], before: Partial<Record<VendorCat, string | null>>, from: Venue, now = new Date()) {
  markUpdated(c, dir, before, now);
  c.decisions = c.decisions.filter(d => !(d.key === 'vendor' && d.status === 'pending'));
  const site = siteOf(c), oldSite = siteOf(c, from);
  for (const k of catsVisible(c.situation)) {
    const cv = c.vendors?.[k.k];
    if (!cv || cv.status !== 'committed' || !cv.vendorId) continue;
    const v = dir.find(x => x.id === cv.vendorId);
    if (!v?.geo || !site.geo) continue;
    const d = distanceKm(site.geo, v.geo);
    if (d <= v.radiusKm) continue;
    const altR = rank(dir, k.k, site, c.situation.form).ok.filter(o => o.v.id !== v.id).slice(0, 2);
    const vendorInfo: Record<string, { name: string; km: number | null }> = { [v.id]: { name: v.name, km: d } };
    altR.forEach(o => { vendorInfo[o.v.id] = { name: o.v.name, km: o.d }; });
    c.decisions.push({
      id: `vendor-${k.k}`, key: 'vendor', status: 'pending', chosen: null, cat: k.k, vendorId: v.id, alts: altR.map(o => o.v.id),
      oldKm: oldSite.geo ? distanceKm(oldSite.geo, v.geo) : undefined, vendorInfo,
    });
  }
}

/* ---------- Thao tác của gia đình ---------- */
const ensure = (c: CaseData) => (c.vendors ??= {});

export function confirmVendor(c: CaseData, cat: VendorCat, vendorId: string, family: boolean, now = new Date()) {
  const cur = ensure(c)[cat];
  if (cur?.status === 'committed') throw new Error('Hạng mục đã cam kết — không tự thay.');
  ensure(c)[cat] = { vendorId, family, status: 'confirmed', incidents: [] };
  c.updatedCats = (c.updatedCats ?? []).filter(x => x !== cat);
  c.history.push({ at: now.toISOString(), text: `Chọn nhà cung cấp cho ${catName(cat).toLowerCase()}` });
}

export function commitVendor(c: CaseData, cat: VendorCat, what: string, when: string, now = new Date()) {
  const cv = c.vendors?.[cat];
  if (!cv || !cv.vendorId) return;
  cv.status = 'committed';
  cv.commitment = { what: what.trim(), when: when.trim(), at: now.toISOString() };
  c.history.push({ at: now.toISOString(), text: `Ghi cam kết với nhà cung cấp — ${catName(cat).toLowerCase()}` });
}

export function recordQuote(c: CaseData, cat: VendorCat, text: string, amount: number | undefined, by: string, now = new Date()) {
  const cv = c.vendors?.[cat];
  if (!cv) return;
  cv.quote = { text: text.trim(), amount, at: now.toISOString(), by };
}

export function recordIncident(c: CaseData, cat: VendorCat, text: string, amount: number | undefined, by: string, now = new Date()) {
  const cv = c.vendors?.[cat];
  if (!cv) return;
  cv.incidents.push({ text: text.trim(), amount, at: now.toISOString(), by });
}

export function acceptVendor(c: CaseData, vendorId: string, by: string, now = new Date()) {
  for (const cv of Object.values(c.vendors ?? {})) {
    if (cv && cv.vendorId === vendorId && (cv.status === 'confirmed' || cv.status === 'committed')) { cv.acceptedAt = now.toISOString(); cv.acceptedBy = by; }
  }
  c.history.push({ at: now.toISOString(), text: 'Nghiệm thu nhà cung cấp' });
}

/** Mọi bên đã chọn / cam kết đều đã nghiệm thu (điều kiện khép vòng) */
export function allAccepted(c: CaseData) {
  const used = catsVisible(c.situation).map(k => c.vendors?.[k.k]).filter(cv => cv && cv.vendorId && cv.status !== 'suggest');
  return used.every(cv => !!cv!.acceptedAt);
}

export function addFamilyVendor(c: CaseData, f: Omit<FamilyVendor, 'id'>): string {
  if (!f.name.trim()) throw new Error('Cần nhập tên nhà cung cấp.');
  if (!f.cats.length) throw new Error('Chọn ít nhất một hạng mục.');
  const id = 'f' + Math.random().toString(36).slice(2, 9);
  (c.familyVendors ??= []).push({ ...f, id, name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(), note: f.note.trim() });
  return id;
}

/** Dịch vụ trọn gói gần nơi tổ chức nhận được các hạng mục chưa chốt */
export function packageOffers(c: CaseData, dir: DirVendor[]) {
  const site = siteOf(c);
  if (!site.geo) return [];
  const vis = catsVisible(c.situation);
  return dir
    .filter(v => v.active && v.cats.length > 1 && condOk(v, c.situation.form) && v.geo && distanceKm(site.geo!, v.geo) <= v.radiusKm)
    .map(v => {
      const open = vis.filter(k => hasCat(v, k.k) && !['committed', 'confirmed'].includes(c.vendors?.[k.k]?.status ?? ''));
      const locked = vis.filter(k => hasCat(v, k.k) && ['committed', 'confirmed'].includes(c.vendors?.[k.k]?.status ?? '') && c.vendors?.[k.k]?.vendorId !== v.id);
      return { v, d: distanceKm(site.geo!, v.geo!), open, locked };
    })
    .filter(x => x.open.length)
    .sort((a, b) => a.d - b.d);
}

export function choosePackage(c: CaseData, v: DirVendor, cats: VendorCat[], now = new Date()) {
  for (const k of cats) ensure(c)[k] = { vendorId: v.id, status: 'confirmed', incidents: [] };
  c.updatedCats = (c.updatedCats ?? []).filter(x => !cats.includes(x));
  c.history.push({ at: now.toISOString(), text: `Chọn trọn gói ${v.name} cho ${cats.length} hạng mục` });
}

/** Chốt quyết định nhà cung cấp ở xa: giữ bên cũ, hoặc đổi sang bên gần */
export function resolveVendorDecision(c: CaseData, id: string, pick: string, now = new Date()) {
  const d = c.decisions.find(x => x.id === id);
  if (!d || d.key !== 'vendor' || !d.cat) return;
  d.status = 'decided'; d.chosen = pick; d.decidedAt = now.toISOString();
  if (pick !== 'keep') {
    ensure(c)[d.cat] = { vendorId: pick, status: 'confirmed', incidents: [] };
    c.tasks.push({ id: 'u' + Math.random().toString(36).slice(2, 9), templateId: null, custom: { title: 'Báo hủy và thỏa thuận phí với nhà cung cấp cũ', phase: 7, due: 'Trong hôm nay' }, status: 'todo', owner: null, area: 'Nhà cung cấp' });
  }
}

/* ---------- Tìm quanh nơi tổ chức trên Google Maps (khi danh bạ chưa có bên phù hợp) ---------- */
const MAPS_QUERY: Record<VendorCat, string> = {
  xe: 'xe tang',
  rap: 'cho thuê rạp đám hiếu bàn ghế',
  hoa: 'vòng hoa viếng',
  an: 'nấu cỗ đám hiếu',
  nhac: 'đội nhạc tang lễ',
  mo: 'xây mộ đào huyệt',
};

/** Link mở Google Maps tìm đúng loại dịch vụ quanh nơi tổ chức; chưa có vị trí lẫn địa chỉ thì tìm “gần đây” (theo vị trí điện thoại) */
export function mapsSearchUrl(cat: VendorCat, site: VenueSite): string {
  return mapsQueryUrl(MAPS_QUERY[cat], site);
}

/** Dịch vụ tang lễ trọn gói: một đơn vị lo nhiều hạng mục (xe, rạp, hoa, nhạc, cỗ…) */
export const PACKAGE_QUERY = 'dịch vụ tang lễ trọn gói';

export function mapsQueryUrl(q: string, site: VenueSite): string {
  if (site.geo) return `https://www.google.com/maps/search/${encodeURIComponent(q)}/@${site.geo.lat},${site.geo.lng},14z`;
  if (site.address.trim()) return `https://www.google.com/maps/search/${encodeURIComponent(`${q} gần ${site.address.trim()}`)}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(`${q} gần đây`)}`;
}

/* ---------- Danh bạ tự lớn lên từ các gia đình (lớp 3) ---------- */
/** Một lượt gia đình tự thêm nhà cung cấp và đồng ý giới thiệu. Không kèm thông tin gia đình, không kèm ghi chú riêng. */
export interface SharedFamilyVendor {
  name: string; phone: string; cats: VendorCat[]; address: string;
  used: boolean; committed: boolean; accepted: boolean; incidents: number; at: string;
}

/** Tổng hợp của một nhà cung cấp (nhận ra theo số điện thoại) qua nhiều gia đình */
export interface VendorCandidate {
  phone: string; names: string[]; cats: VendorCat[]; addresses: string[];
  families: number; used: number; committed: number; accepted: number; incidents: number; lastAt: string;
}

export const phoneKey = (p: string) => p.replace(/\D/g, '').replace(/^84/, '0');

/** Lấy các lượt “đồng ý giới thiệu” từ đám hiếu (bản chạy thử trên máy; máy chủ có hàm tương đương) */
export function sharedFamilyVendors(cases: CaseData[]): SharedFamilyVendor[] {
  const out: SharedFamilyVendor[] = [];
  for (const c of cases) {
    for (const v of c.familyVendors ?? []) {
      if (!v.share || phoneKey(v.phone).length < 9) continue;
      const uses = Object.values(c.vendors ?? {}).filter(x => x?.family && x.vendorId === v.id);
      out.push({
        name: v.name, phone: v.phone, cats: v.cats, address: v.address,
        used: uses.length > 0, committed: uses.some(x => x!.status === 'committed'), accepted: uses.some(x => !!x!.acceptedAt),
        incidents: uses.reduce((n, x) => n + (x!.incidents?.length ?? 0), 0), at: c.updatedAt ?? c.createdAt,
      });
    }
  }
  return out;
}

/**
 * Gom theo số điện thoại, bỏ bên đã có trong danh bạ chung và bên Admin đã bỏ qua.
 * Xếp: nhiều gia đình dùng thật (đã cam kết / nghiệm thu) lên trước; bên có sự cố xuống sau.
 */
export function vendorCandidates(rows: SharedFamilyVendor[], dir: DirVendor[], dismissed: string[] = []): VendorCandidate[] {
  const known = new Set([...dir.map(v => phoneKey(v.phone)), ...dismissed.map(phoneKey)]);
  const by = new Map<string, VendorCandidate>();
  for (const r of rows) {
    const k = phoneKey(r.phone);
    if (known.has(k)) continue;
    const x = by.get(k) ?? { phone: r.phone, names: [], cats: [], addresses: [], families: 0, used: 0, committed: 0, accepted: 0, incidents: 0, lastAt: r.at };
    if (!x.names.includes(r.name)) x.names.push(r.name);
    for (const ca of r.cats) if (!x.cats.includes(ca)) x.cats.push(ca);
    if (r.address && !x.addresses.includes(r.address)) x.addresses.push(r.address);
    x.families += 1; x.used += +r.used; x.committed += +r.committed; x.accepted += +r.accepted; x.incidents += r.incidents;
    if (r.at > x.lastAt) x.lastAt = r.at;
    by.set(k, x);
  }
  const score = (x: VendorCandidate) => x.accepted * 3 + x.committed * 2 + x.used + x.families - x.incidents * 2;
  return [...by.values()].sort((a, b) => score(b) - score(a) || b.lastAt.localeCompare(a.lastAt));
}
