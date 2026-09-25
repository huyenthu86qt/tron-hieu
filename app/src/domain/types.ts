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
}

export type DecisionKey = 'venue' | 'form' | 'time' | 'org';

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
}

export interface Answers {
  place: Place;
  venue: Venue | 'undecided';
  form: Form | 'undecided';
  org: OrgModel;
  orgType: OrgType;
  rite: Exclude<Rite, 'none'>;
  scale: Scale;
}
