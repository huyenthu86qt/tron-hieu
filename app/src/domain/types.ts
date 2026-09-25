// Kiểu dữ liệu nghiệp vụ — bám Kiến trúc sản phẩm v2 (mục 6, 6.10) và Gói xây app (Data Model).

export type Place = 'hospital' | 'home' | 'other';
export type Venue = 'home' | 'hall';
export type Form = 'cremation' | 'burial';
export type Rite = 'traditional' | 'catholic' | 'other' | 'none';
export type OrgModel = 'family' | 'community' | 'official_rel' | 'official';
export type OrgType = 'cadre' | 'military' | 'police';
export type Scale = 'small' | 'medium' | 'large';
export type VendorCat = 'xe' | 'rap' | 'hoa' | 'an' | 'nhac' | 'mo';
export type Title = 'Cụ ông' | 'Cụ bà' | 'Ông' | 'Bà' | 'Anh' | 'Chị';

export interface Situation {
  place: Place;
  venue: Venue;
  form: Form;
  rite: Rite;
  org: OrgModel;
  orgType: OrgType;
  scale: Scale;
  /** Có hồ sơ chuẩn bị trước đã kích hoạt */
  hasPre: boolean;
}

export interface Person {
  title: Title;
  name: string;
  saint: string;
  birthYear: string;
  /** Ngày mất dạng YYYY-MM-DD */
  death: string;
  time: string;
  hometown: string;
  photo: string | null;
}

export type TaskKind = 'core' | 'cond' | 'opt' | 'own';
export type TaskStatus = 'todo' | 'doing' | 'issue' | 'done' | 'skip';

/** Điều kiện hiện việc theo hoàn cảnh */
export interface Cond {
  form?: Form;
  rite?: Rite | Rite[];
  venue?: Venue;
  place?: Place;
  scale?: Scale[];
  /** Chỉ khi có Ban lễ tang (hình thức 3–4) */
  blt?: boolean;
  /** Chỉ khi hình thức 2 (phối hợp địa phương) */
  comm?: boolean;
  /** Ẩn khi không phải gia đình tự tổ chức */
  noOrg?: boolean;
  /** Ẩn khi có Ban lễ tang */
  noBLT?: boolean;
  /** Ẩn khi hình thức 2 */
  noComm?: boolean;
  /** Chỉ khi có hồ sơ chuẩn bị */
  pre?: boolean;
}

/**
 * Bộ mẫu việc. Chuỗi văn bản dùng token:
 *  {p} / {P}   cách xưng hô người mất (cụ / Cụ, ông / Ông…)
 *  {d+N}       ngày dd/mm tính từ ngày mất
 *  {D+N}       ngày dd/mm/yyyy tính từ ngày mất
 */
export interface TaskTemplate {
  id: string;
  phase: number;
  title: string;
  kind: Exclude<TaskKind, 'own'>;
  why?: string;
  area: string;
  due: string;
  when?: Cond;
  lock?: boolean;
  lockText?: string;
  deps?: string[];
  /** Việc chờ một quyết định gốc */
  decision?: DecisionKey;
  steps?: string[];
  stepsC?: string[];
  stepsN?: string[];
  checks?: string[];
  checksC?: string[];
  checksN?: string[];
  note?: string;
  noteC?: string;
  noteN?: string;
  /** Việc gấp — luôn hiện ở màn Bây giờ khi chưa xong */
  urgent?: boolean;
  /** Do Ban lễ tang phụ trách */
  byOrg?: boolean;
  /** Việc thủ tục chưa có nguồn kiểm chứng */
  unverified?: boolean;
  /** Mở màn liên quan (đường dẫn con trong đám hiếu) */
  go?: string;
  /** Hạng mục nhà cung cấp liên quan */
  cat?: VendorCat;
}

/** Một việc trong đám hiếu: tham chiếu bộ mẫu hoặc việc riêng của gia đình */
export interface TaskInst {
  id: string;
  templateId: string | null;
  custom?: { title: string; phase: number; due: string };
  status: TaskStatus;
  owner: string | null;
  /** Lời nhắn khi giao việc — người nhận (kể cả qua link) thấy */
  assignNote?: string;
  titleOverride?: string;
  dueOverride?: string;
  area?: string;
  note?: string;
  skipReason?: string;
  issue?: string;
  stepsDone?: Record<number, boolean>;
  evidence?: string;
}

export type Access = 'full' | 'limited' | 'link';

export interface Member {
  id: string;
  name: string;
  rel: string;
  role: string;
  access: Access;
  areas: string[];
  /** Thành viên do hệ thống thêm (Ban lễ tang, hỗ trợ địa phương) */
  system?: 'blt' | 'mttq' | 'hnct';
  linkToken?: string;
  /** Tài khoản đã gắn (người có tài khoản) */
  userId?: string;
  /** Số điện thoại mời — khi người đó đăng nhập bằng số này sẽ thấy đám hiếu */
  phone?: string;
}

export type DecisionKey = 'venue' | 'form' | 'time' | 'org' | 'vendor';

export interface Decision {
  id: string;
  key: DecisionKey;
  status: 'pending' | 'decided';
  chosen: string | null;
  /** Chi tiết gia đình ghi thêm, ví dụ giờ cụ thể */
  detail?: string;
  decidedAt?: string;
  /** Nguyện vọng từ hồ sơ chuẩn bị */
  wish?: { text: string; value: string } | null;
  /** Quyết định nhà cung cấp: bên đã cam kết ở xa sau khi đổi nơi tổ chức */
  cat?: VendorCat;
  vendorId?: string;
  alts?: string[];
  oldKm?: number;
  /** Tên + khoảng cách tới nơi mới của từng bên (lưu lúc tạo quyết định) */
  vendorInfo?: Record<string, { name: string; km: number | null }>;
}

export interface HistoryEntry {
  at: string;
  text: string;
  taskId?: string;
}

export interface CaseData {
  id: string;
  createdAt: string;
  situation: Situation;
  person: Person;
  members: Member[];
  areas: string[];
  tasks: TaskInst[];
  decisions: Decision[];
  mourning: boolean;
  history: HistoryEntry[];
  /* ----- Phase 2 (tùy chọn để đọc được dữ liệu cũ; normalizeCase điền mặc định) ----- */
  ownerId?: string;
  access?: CaseAccess;
  venues?: { home: VenueSite; hall: VenueSite };
  familyPick?: Partial<Record<VendorCat, string>>;
  familyVendors?: FamilyVendor[];
  vendors?: Partial<Record<VendorCat, CaseVendor>>;
  updatedCats?: VendorCat[];
  updatedAt?: string;
  finance?: Finance;
  ledger?: Condolence[];
  publicPage?: PublicPage;
  shifts?: Shift[];
  milestones?: Milestones;
  after?: AfterCare;
  docs?: CaseDoc[];
  preNeedId?: string;
  intake?: Record<string, boolean>;
  pendingContacts?: { name: string; phone: string; rel: string }[];
  deleteRequestedAt?: string;
}

/* ---------- Địa điểm & nhà cung cấp ---------- */
export interface GeoPoint { lat: number; lng: number }
export interface VenueSite { name: string; address: string; geo?: GeoPoint }
export type VendorCond = 'both' | 'burial' | 'cremation';

/** Nhà cung cấp trong danh bạ do Admin quản lý */
export interface DirVendor {
  id: string; name: string; phone: string; cats: VendorCat[]; address: string; geo?: GeoPoint;
  radiusKm: number; cond: VendorCond; active: boolean; updatedAt: string;
}
/** Nhà cung cấp gia đình tự thêm — chỉ thuộc đám hiếu này */
export interface FamilyVendor { id: string; name: string; phone: string; cats: VendorCat[]; address: string; note: string }
export type CatStatus = 'suggest' | 'confirmed' | 'committed';
export interface VendorLog { text: string; amount?: number; at: string; by?: string }
export interface CaseVendor {
  vendorId: string | null;
  family?: boolean;
  status: CatStatus;
  quote?: VendorLog;
  commitment?: { what: string; when: string; at: string };
  incidents: VendorLog[];
  acceptedAt?: string;
  acceptedBy?: string;
}

/* ---------- Tài chính ---------- */
export type Method = 'cash' | 'bank';
export interface Fund { id: string; name: string; type: Method; last4?: string }
export interface Payee { holder: string; bank: string; acct: string }
export type ExpenseStatus = 'estimate' | 'request' | 'approved' | 'paid' | 'rejected';
export interface Expense {
  id: string; name: string; cat: VendorCat | 'khac'; vendorId?: string; amount: number; paid: number; status: ExpenseStatus;
  evidence?: string; payer: string | null; method: Method | null; fund: string | null; payee?: Payee;
  extra?: boolean; reason?: string; requestedBy: string; createdAt: string; decidedAt?: string; rejectReason?: string;
}
export interface OrgExpense { id: string; name: string; amount: number | null; note: string }
export interface Finance {
  budget: number; budgetFromPre?: boolean; funds: Fund[]; expenses: Expense[]; orgExpenses: OrgExpense[];
  locked: boolean; lockedAt?: string; lockedBy?: string; debtMoved: boolean; counted: string; bankOk: boolean;
}

/* ---------- Khách viếng ---------- */
export type GuestGroup = 'Họ nội' | 'Họ ngoại' | 'Cơ quan, đoàn thể' | 'Tổ dân phố, lối xóm' | 'Bạn bè' | 'Khác';
export interface Condolence {
  id: string; name: string; group: GuestGroup | null; of: string | null; amount: number; method: Method;
  gifts: string[]; note?: string; by: string; at: string;
}
export interface PublicPage {
  slug: string; published: boolean; text: string; auto: boolean; showPhone: boolean; phone: string;
  publishedAt?: string; snapshot?: string; changedAt?: string;
  /** Dòng lịch lễ gia đình tự ghi đè: nq (nhập quan), vieng, dua */
  sched?: Record<string, string>;
}
export interface Shift { id: string; memberId: string; from: string; note: string; handedTo?: string; at: string }

/* ---------- Hậu tang ---------- */
export interface Milestones {
  sel: { d49: boolean; d100: boolean; gio: boolean; custom: boolean; none: boolean };
  customName: string; customDate: string; base: 'death' | 'burial'; count: 'incl' | 'excl'; gioCal: 'lunar' | 'solar'; saved: boolean;
}
export interface AfterCare { closed: boolean; closedAt?: string; thanked: Record<string, boolean>; thankText: string; thankAuto: boolean }
export interface CaseDoc { id: string; name: string; at: string; source: 'after' | 'task' | 'pre' | 'other' }

/* ---------- Quyền dùng ---------- */
export interface CaseAccess { plan: 'free' | 'full'; activeUntil?: string; source?: 'payment' | 'manual' | 'activation'; orderId?: string; revokedReason?: string }

export interface Answers {
  place: Place;
  venue: Venue | 'undecided';
  form: Form | 'undecided';
  org: OrgModel;
  orgType: OrgType;
  rite: Exclude<Rite, 'none'>;
  scale: Scale;
}
