// Phần lõi nghiệp vụ: sinh việc theo hoàn cảnh, phụ thuộc & việc khóa, chặng hiện tại,
// quyết định gốc, tác động khi đổi quyết định, điều kiện khép vòng.
// Hàm thuần — không đụng giao diện hay nơi lưu trữ.
import type {
  Answers, CaseData, Cond, Decision, DecisionKey, Form, Member, OrgModel, OrgType, Person, Rite,
  Situation, TaskInst, TaskKind, TaskStatus, TaskTemplate, Venue, VendorCat,
} from './types';
import { DEFAULT_AREAS, PHASES, TEMPLATES, TEMPLATE_BY_ID } from './templates';
import { resolveText } from './person';

/* ---------- Nhãn ---------- */
export const FORM_LABEL: Record<Form, string> = { cremation: 'Hỏa táng', burial: 'Địa táng' };
export const VENUE_LABEL: Record<Venue, string> = { home: 'Nhà riêng', hall: 'Nhà tang lễ' };
export const PLACE_LABEL = { hospital: 'Mất tại bệnh viện', home: 'Mất tại nhà', other: 'Mất ở nơi khác' } as const;
export const SCALE_LABEL = { small: 'Quy mô nhỏ', medium: 'Quy mô vừa', large: 'Quy mô lớn' } as const;
export const RITE_LABEL: Record<Rite, string> = { traditional: 'Truyền thống / Phật giáo', catholic: 'Công giáo', other: 'Nghi lễ khác', none: 'Không theo nghi lễ tôn giáo' };
export const MODEL_LABEL: Record<OrgModel, string> = { family: 'Gia đình tự tổ chức', community: 'Gia đình chủ trì, phối hợp địa phương', official_rel: 'Tôn giáo kết hợp nghi lễ tang', official: 'Chỉ theo nghi lễ tang' };
export const ORGT: Record<OrgType, { label: string; chip: string; full: string; member: string }> = {
  cadre: { label: 'cán bộ, công chức, viên chức', chip: 'Nghi lễ tang cán bộ, CCVC', full: 'Ban lễ tang cơ quan', member: 'Ban lễ tang — cơ quan cũ của {p}' },
  military: { label: 'quân nhân', chip: 'Nghi lễ tang quân nhân', full: 'Ban lễ tang đơn vị quân đội', member: 'Ban lễ tang — đơn vị quân đội' },
  police: { label: 'công an nhân dân', chip: 'Nghi lễ tang công an', full: 'Ban lễ tang đơn vị công an', member: 'Ban lễ tang — đơn vị công an' },
};
export const STATUS_LABEL: Record<TaskStatus, string> = { todo: 'Cần làm', doing: 'Đang làm', issue: 'Có vấn đề', done: 'Đã xong', skip: 'Không áp dụng' };
export const VENDOR_CAT_LABEL: Record<VendorCat, string> = { xe: 'Xe tang', rap: 'Rạp, bàn ghế', hoa: 'Hoa tươi, vòng hoa', an: 'Nấu cỗ', nhac: 'Đội nhạc lễ', mo: 'Đào huyệt, xây mộ' };

export const hasBLT = (s: Situation) => s.org === 'official_rel' || s.org === 'official';
export const portraitIcon = (r: Rite) => (r === 'catholic' ? 'cross' : r === 'none' ? 'candle' : 'lotus');

/* ---------- Hiện việc theo hoàn cảnh ---------- */
const riteOk = (want: Rite, have: Rite) =>
  want === 'none' ? have === 'none' : want === 'catholic' ? have === 'catholic' : have === 'traditional' || have === 'other';

export function condMatches(w: Cond | undefined, s: Situation): boolean {
  if (!w) return true;
  if (w.form && w.form !== s.form) return false;
  if (w.rite && !(Array.isArray(w.rite) ? w.rite.some(r => riteOk(r, s.rite)) : riteOk(w.rite, s.rite))) return false;
  if (w.blt && !hasBLT(s)) return false;
  if (w.comm && s.org !== 'community') return false;
  if (w.noOrg && s.org !== 'family') return false;
  if (w.noBLT && hasBLT(s)) return false;
  if (w.noComm && s.org === 'community') return false;
  if (w.venue && w.venue !== s.venue) return false;
  if (w.place && w.place !== s.place) return false;
  if (w.scale && !w.scale.includes(s.scale)) return false;
  if (w.pre && !s.hasPre) return false;
  return true;
}

/** Việc đã ghép bộ mẫu + trạng thái của đám hiếu, văn bản đã thay token */
export interface TaskView {
  id: string;
  title: string;
  phase: number;
  due: string;
  kind: TaskKind;
  why?: string;
  area: string;
  status: TaskStatus;
  owner: string | null;
  assignNote?: string;
  lock: boolean;
  lockText?: string;
  deps: string[];
  decision?: DecisionKey;
  steps?: string[];
  checks?: string[];
  note?: string;
  urgent: boolean;
  byOrg: boolean;
  unverified: boolean;
  go?: string;
  cat?: VendorCat;
  custom: boolean;
  skipReason?: string;
  issue?: string;
  stepsDone: Record<number, boolean>;
  evidence?: string;
}

const byRite = <T,>(s: Situation, base?: T, c?: T, n?: T): T | undefined =>
  (s.rite === 'catholic' && c) || (s.rite === 'none' && n) || base;

export function taskView(c: CaseData, i: TaskInst): TaskView | null {
  const P = c.person, s = c.situation, r = (x: string) => resolveText(x, P);
  if (i.templateId === null) {
    if (!i.custom) return null;
    return {
      id: i.id, title: i.titleOverride ?? i.custom.title, phase: i.custom.phase, due: i.dueOverride ?? i.custom.due, kind: 'own',
      area: i.area ?? 'Toàn bộ', status: i.status, owner: i.owner, lock: false, deps: [], urgent: false, byOrg: false, unverified: false,
      custom: true, note: i.note, skipReason: i.skipReason, issue: i.issue, stepsDone: i.stepsDone ?? {}, evidence: i.evidence, assignNote: i.assignNote,
    };
  }
  const t: TaskTemplate | undefined = TEMPLATE_BY_ID[i.templateId];
  if (!t) return null;
  const steps = byRite(s, t.steps, t.stepsC, t.stepsN), checks = byRite(s, t.checks, t.checksC, t.checksN);
  const tplNote = byRite(s, t.note, t.noteC, t.noteN);
  return {
    id: i.id, title: i.titleOverride ?? r(t.title), phase: t.phase, due: i.dueOverride ?? r(t.due), kind: t.kind, why: t.why,
    area: i.area ?? t.area, status: i.status, owner: i.owner, lock: !!t.lock, lockText: t.lockText && r(t.lockText),
    deps: t.deps ?? [], decision: t.decision, steps: steps?.map(r), checks: checks?.map(r),
    note: i.note ?? (tplNote && r(tplNote)), urgent: !!t.urgent, byOrg: !!t.byOrg, unverified: !!t.unverified, go: t.go, cat: t.cat,
    custom: false, skipReason: i.skipReason, issue: i.issue, stepsDone: i.stepsDone ?? {}, evidence: i.evidence, assignNote: i.assignNote,
  };
}

export function isVisible(c: CaseData, i: TaskInst, s: Situation = c.situation): boolean {
  if (i.templateId === null) return true;
  const t = TEMPLATE_BY_ID[i.templateId];
  return !!t && condMatches(t.when, s);
}

/** Toàn bộ việc đang hiện theo hoàn cảnh hiện tại, xếp theo chặng */
export function visibleTasks(c: CaseData, s: Situation = c.situation): TaskView[] {
  return c.tasks
    .filter(i => isVisible(c, i, s))
    .map(i => taskView(c, i))
    .filter((x): x is TaskView => !!x)
    .sort((a, b) => a.phase - b.phase);
}

export const findTask = (c: CaseData, id: string) => {
  const i = c.tasks.find(x => x.id === id);
  return i ? taskView(c, i) : null;
};

const finished = (t: TaskView) => t.status === 'done' || t.status === 'skip';

/** Chặng hiện tại: chặng đầu tiên còn việc bắt buộc / theo hoàn cảnh chưa xong */
export function currentPhase(c: CaseData): number {
  const open = visibleTasks(c).filter(t => t.kind !== 'opt' && !finished(t));
  return open.length ? Math.min(...open.map(t => t.phase)) : PHASES.length;
}

export function nowTasks(c: CaseData): TaskView[] {
  const cur = currentPhase(c);
  return visibleTasks(c).filter(t => !finished(t) && t.status !== 'issue' &&
    (t.phase <= Math.max(cur, 2) || (t.urgent && t.phase <= cur + 2)));
}
export const issueTasks = (c: CaseData) => visibleTasks(c).filter(t => t.status === 'issue');
export function soonTasks(c: CaseData): TaskView[] {
  const cur = currentPhase(c), now = new Set(nowTasks(c).map(t => t.id));
  return visibleTasks(c).filter(t => !finished(t) && t.status !== 'issue' && !now.has(t.id) && t.phase >= cur && t.phase <= cur + 5);
}

/** Việc phía trước (đang hiện) của một việc, và những việc chưa xong trong số đó */
export function dependencies(c: CaseData, t: TaskView) {
  const vis = new Map(visibleTasks(c).map(x => [x.id, x]));
  const deps = t.deps.map(id => vis.get(id)).filter((x): x is TaskView => !!x);
  return { deps, open: deps.filter(x => !finished(x)) };
}
export const unlocks = (c: CaseData, t: TaskView) => visibleTasks(c).filter(x => x.deps.includes(t.id));

/** Việc khóa chỉ được đánh dấu xong khi mọi việc phía trước đã xong */
export const lockBlocked = (c: CaseData, t: TaskView) => t.lock && dependencies(c, t).open.length > 0;

/* ---------- Tạo đám hiếu ---------- */
export const U1_ID = 'u1';

export function situationFromAnswers(a: Answers, hasPre = false): Situation {
  return {
    place: a.place,
    venue: a.venue === 'undecided' ? 'home' : a.venue,
    form: a.form === 'undecided' ? 'cremation' : a.form,
    rite: a.org === 'official' ? 'none' : a.rite,
    org: a.org, orgType: a.orgType, scale: a.scale, hasPre,
  };
}

export const emptyPerson = (): Person => ({ title: 'Cụ ông', name: '', saint: '', birthYear: '', death: '', time: '', hometown: '', photo: null });

export const newId = (prefix: string) => prefix + Math.random().toString(36).slice(2, 9);

export function systemMembers(s: Situation, p: Person): Member[] {
  if (s.org === 'community') return [
    { id: 'mttq', name: 'Ban công tác Mặt trận khu dân cư', rel: 'Hỗ trợ địa phương', role: 'Hỗ trợ', access: 'link', areas: ['Liên lạc', 'Nghi thức'], system: 'mttq' },
    { id: 'hnct', name: 'Hội Người cao tuổi', rel: 'Hội, đoàn thể', role: 'Hỗ trợ', access: 'link', areas: ['Khách / Phúng viếng'], system: 'hnct' },
  ];
  if (hasBLT(s)) return [{
    id: 'blt', name: resolveText(ORGT[s.orgType].member, p), rel: 'Ban lễ tang', role: s.org === 'official' ? 'Chủ trì' : 'Đồng tổ chức',
    access: 'limited', areas: ['Nghi thức', 'Lịch lễ', 'Cáo phó'], system: 'blt',
  }];
  return [];
}

function baseDecisions(a: Answers, s: Situation): Decision[] {
  const L: Decision[] = [
    { id: 'form', key: 'form', status: a.form === 'undecided' ? 'pending' : 'decided', chosen: a.form === 'undecided' ? null : a.form },
    { id: 'venue', key: 'venue', status: a.venue === 'undecided' ? 'pending' : 'decided', chosen: a.venue === 'undecided' ? null : a.venue },
    { id: 'time', key: 'time', status: 'pending', chosen: null },
  ];
  if (hasBLT(s)) L.push({ id: 'org', key: 'org', status: 'pending', chosen: null });
  return L;
}

export interface CreateCaseInput {
  answers: Answers;
  /** Việc ở bước “Việc cần làm ngay” mà người đại diện đã nhận */
  mine?: string[];
  /** Việc báo tin đã đánh dấu đã báo */
  notified?: string[];
  now?: Date;
}

export function createCase({ answers, mine = [], notified = [], now = new Date() }: CreateCaseInput): CaseData {
  const s = situationFromAnswers(answers);
  const person = emptyPerson();
  const at = now.toISOString();
  const tasks: TaskInst[] = TEMPLATES.map(t => ({ id: t.id, templateId: t.id, status: 'todo', owner: null }));
  const decisions = baseDecisions(answers, s);
  const c: CaseData = {
    id: newId('dh'), createdAt: at, situation: s, person,
    members: [{ id: U1_ID, name: 'Người đại diện', rel: 'Người đại diện gia đình', role: 'Người đại diện', access: 'full', areas: ['Toàn bộ'] }, ...systemMembers(s, person)],
    areas: [...DEFAULT_AREAS, ...(hasBLT(s) || s.org === 'community' ? ['Nghi thức'] : [])],
    tasks, decisions, mourning: false, history: [],
  };
  for (const d of decisions) if (d.status === 'decided') completeDecisionTasks(c, d.key, d.chosen);
  for (const id of mine) { const t = c.tasks.find(x => x.id === id); if (t && t.status === 'todo') { t.owner = U1_ID; t.status = 'doing'; } }
  for (const id of notified) { const t = c.tasks.find(x => x.id === id); if (t) t.status = 'done'; }
  c.history.push({ at, text: 'Tạo đám hiếu từ câu hỏi hoàn cảnh' });
  return c;
}

/* ---------- Quyết định gốc ---------- */
export interface DecisionOption { k: string; label: string; note: string }
export interface DecisionView extends Decision {
  title: string;
  kind: 'root' | 'org';
  lock: boolean;
  due?: string;
  from?: string;
  lead?: boolean;
  options: DecisionOption[];
}

export function decisionView(c: CaseData, d: Decision): DecisionView {
  const s = c.situation, r = (x: string) => resolveText(x, c.person);
  switch (d.key) {
    case 'form': return { ...d, kind: 'root', lock: false, title: 'Hình thức an táng', options: [
      { k: 'cremation', label: 'Hỏa táng', note: 'Tại đài hóa thân; nhận tro cốt về thờ hoặc gửi chùa' },
      { k: 'burial', label: 'Địa táng (mai táng)', note: 'Chôn cất tại nghĩa trang, đất gia đình hoặc khu mộ dòng họ' }] };
    case 'venue': return { ...d, kind: 'root', lock: false, title: 'Nơi tổ chức lễ viếng', options: [
      { k: 'home', label: 'Tại nhà riêng', note: 'Cần dựng rạp, bàn ghế; hàng xóm thường sang giúp' },
      { k: 'hall', label: 'Tại nhà tang lễ', note: 'Thuê phòng lễ theo giờ; theo quy định của nhà tang lễ' }] };
    case 'time': {
      const cre = s.form === 'cremation';
      return { ...d, kind: 'root', lock: true, title: cre ? 'Giờ hỏa táng' : 'Giờ hạ huyệt', due: r('Cần chốt trước 12:00 ngày {d+2}'), options: [
        { k: 'a', label: r('Sáng {d+4}'), note: cre ? 'Theo giờ còn chỗ tại đài hóa thân' : 'Theo giờ thầy cúng xem' },
        { k: 'b', label: r('Chiều {d+4}'), note: 'Họ hàng ở xa kịp về hơn' },
        { k: 'c', label: 'Ngày giờ khác', note: 'Ghi cụ thể ở ô bên dưới' }] };
    }
    case 'org': {
      const lead = s.org === 'official';
      return { ...d, kind: 'org', lead, lock: false, from: ORGT[s.orgType].full, due: r('Cần xác nhận trước 12:00 ngày {d+2}'),
        title: lead ? 'Lịch lễ, nghi thức do Ban lễ tang chủ trì' : 'Lịch lễ và nghi thức do Ban lễ tang đề xuất',
        options: lead
          ? [{ k: 'ok', label: 'Gia đình đã được thông báo và thống nhất', note: 'Lịch viếng, lễ truy điệu, đội danh dự theo thông báo của Ban lễ tang' },
            { k: 'adjust', label: 'Gia đình có ý kiến', note: 'Ví dụ về nơi an táng, hoặc giờ để con cháu ở xa kịp về' }]
          : [{ k: 'ok', label: 'Gia đình xác nhận', note: 'Lịch viếng, lễ truy điệu do đơn vị chủ trì, đội danh dự theo đề xuất của Ban lễ tang' },
            { k: 'adjust', label: 'Đề nghị điều chỉnh', note: 'Ví dụ: xin giữ nghi lễ tôn giáo của gia đình trước giờ truy điệu' }] };
    }
  }
}

export const decisionViews = (c: CaseData) => c.decisions.map(d => decisionView(c, d));
export const pendingDecisions = (c: CaseData) => decisionViews(c).filter(d => d.status === 'pending');
export const findDecision = (c: CaseData, id: string) => {
  const d = c.decisions.find(x => x.id === id);
  return d ? decisionView(c, d) : null;
};

export function chosenLabel(d: DecisionView): string {
  if (!d.chosen) return '';
  const o = d.options.find(x => x.k === d.chosen);
  return (o ? o.label : d.chosen) + (d.detail ? ' · ' + d.detail : '');
}

const COMPLETES: Record<DecisionKey, string[]> = { venue: ['m3a'], form: ['m3b'], time: ['m3c', 'b3c'], org: ['o3a'] };

function completeDecisionTasks(c: CaseData, key: DecisionKey, chosen: string | null) {
  if (key === 'org' && chosen !== 'ok') return;
  for (const id of COMPLETES[key]) { const t = c.tasks.find(x => x.id === id); if (t) t.status = 'done'; }
}

/** Chốt quyết định chưa có (không phải đổi quyết định đã chốt) — sửa trực tiếp `c` */
export function decide(c: CaseData, id: string, chosen: string, detail?: string, now = new Date()) {
  const d = c.decisions.find(x => x.id === id);
  if (!d) return;
  if (d.key === 'form' && chosen !== c.situation.form) setForm(c, chosen as Form);
  if (d.key === 'venue') setVenue(c, chosen as Venue);
  d.status = 'decided'; d.chosen = chosen; d.detail = detail?.trim() || undefined; d.decidedAt = now.toISOString();
  completeDecisionTasks(c, d.key, chosen);
  const v = decisionView(c, d);
  c.history.push({ at: now.toISOString(), text: `Chốt ${v.title.toLowerCase()}: ${chosenLabel(v)}` });
}

/** Đổi nơi tổ chức — sửa trực tiếp `c` */
export function setVenue(c: CaseData, to: Venue) {
  c.situation.venue = to;
  const d = c.decisions.find(x => x.key === 'venue');
  if (d && d.status === 'decided') d.chosen = to;
}

/** Đổi hình thức an táng: giờ đã chốt phải chốt lại — sửa trực tiếp `c` */
export function setForm(c: CaseData, to: Form) {
  c.situation.form = to;
  const d0 = c.decisions.find(x => x.key === 'form');
  if (d0 && d0.status === 'decided') d0.chosen = to;
  const d2 = c.decisions.find(x => x.key === 'time');
  if (d2 && d2.status === 'decided') { d2.status = 'pending'; d2.chosen = null; d2.detail = undefined; }
  for (const id of ['m3c', 'b3c']) { const t = c.tasks.find(x => x.id === id); if (t && t.status === 'done') t.status = 'todo'; }
}

/** Đổi quyết định đã chốt (sau khi đã xem tác động) */
export function changeDecision(c: CaseData, id: string, to: string, reason: string, now = new Date()) {
  const d = c.decisions.find(x => x.id === id);
  if (!d) return;
  const before = decisionView(c, d);
  const from = chosenLabel(before);
  if (d.key === 'form') setForm(c, to as Form);
  else if (d.key === 'venue') setVenue(c, to as Venue);
  else { d.chosen = to; completeDecisionTasks(c, d.key, to); }
  d.decidedAt = now.toISOString();
  const after = decisionView(c, d);
  c.history.push({ at: now.toISOString(), text: `Đổi ${after.title.toLowerCase()}: ${from} → ${chosenLabel(after)}${reason.trim() ? ' · Lý do: ' + reason.trim() : ''}` });
}

/* ---------- Tác động ---------- */
export interface Impact { viec?: string[]; quyet?: string[]; nguoi?: string[]; chiphi?: string[]; ncc?: string[]; khach?: string[] }

const list = (ts: TaskView[], n: number) => ts.slice(0, n).map(t => t.title).join('; ') + (ts.length > n ? '…' : '');

function peopleFor(c: CaseData, areas: string[]): string[] {
  const hit = c.members.filter(m => m.id !== U1_ID && !m.system && m.areas.some(a => areas.includes(a)));
  return hit.length
    ? [hit.map(m => `${m.name} (${m.areas.filter(a => areas.includes(a)).join(', ')})`).join(', ') + ' nhận thông báo thay đổi']
    : ['Chưa có ai giữ vùng ' + areas.join(', ') + ' — người đại diện gia đình nhận thông báo'];
}

function taskDiff(c: CaseData, next: Situation) {
  const before = new Set(visibleTasks(c).map(t => t.id));
  const after = visibleTasks(c, next);
  const afterIds = new Set(after.map(t => t.id));
  const add = after.filter(t => !before.has(t.id));
  const rem = visibleTasks(c).filter(t => !afterIds.has(t.id));
  const lostWork = rem.filter(t => t.status !== 'todo' || t.owner);
  return { add, rem, lostWork };
}

export function impactOfForm(c: CaseData, to: Form): Impact {
  const next = { ...c.situation, form: to };
  const { add, rem, lostWork } = taskDiff(c, next);
  const d2 = c.decisions.find(x => x.key === 'time');
  const oldT = to === 'burial' ? 'Giờ hỏa táng' : 'Giờ hạ huyệt', newT = to === 'burial' ? 'Giờ hạ huyệt' : 'Giờ hỏa táng';
  const viec = [];
  if (add.length) viec.push(`Thêm ${add.length} việc: ${list(add, 4)}`);
  if (rem.length) viec.push(`Bỏ ${rem.length} việc: ${list(rem, 3)}`);
  if (lostWork.length) viec.push(`${lostWork.length} việc đang có người lo sẽ ẩn đi (vẫn giữ trạng thái nếu đổi lại)`);
  return {
    viec,
    quyet: [`“${oldT}” đổi thành “${newT}”${d2 && d2.status === 'decided' ? ' — giờ đã chốt sẽ phải chốt lại' : ''}`],
    ncc: [to === 'burial' ? 'Thêm hạng mục “Đào huyệt, xây mộ” — app gợi ý bên gần nơi tổ chức nhất' : 'Bỏ hạng mục “Đào huyệt, xây mộ”',
      'Xe tang cần báo lại điểm đến mới (' + (to === 'burial' ? 'nơi an táng' : 'nơi hỏa táng') + ')'],
    chiphi: ['Dự trù chi phí thay đổi (' + (to === 'burial' ? 'đất mộ, đào huyệt, xây mộ tạm' : 'phí hỏa táng, hũ tro cốt') + ') — chưa có báo giá'],
    nguoi: peopleFor(c, ['Nhà cung cấp', 'Xe cộ', 'Tài chính']),
    khach: ['Trang thông tin cho khách đổi mục “' + (to === 'burial' ? 'Hỏa táng” thành “Hạ huyệt' : 'Hạ huyệt” thành “Hỏa táng') + '”'],
  };
}

export function impactOfVenue(c: CaseData, to: Venue): Impact {
  const next = { ...c.situation, venue: to };
  const { add, rem, lostWork } = taskDiff(c, next);
  const viec = [];
  if (add.length) viec.push(`Thêm ${add.length} việc: ${list(add, 4)}`);
  if (rem.length) viec.push(`Bỏ ${rem.length} việc: ${list(rem, 3)}`);
  if (lostWork.length) viec.push(`${lostWork.length} việc đang có người lo sẽ ẩn đi — người phụ trách xem lại`);
  return {
    viec,
    nguoi: peopleFor(c, ['Nhà cung cấp', 'Hậu cần']),
    chiphi: [to === 'hall' ? 'Có thể phát sinh phí phòng lễ — chưa có báo giá' : 'Có thể phát sinh phí thuê rạp, bàn ghế — chưa có báo giá'],
    ncc: ['Hạng mục chưa cam kết sẽ được gợi ý lại theo địa chỉ mới', 'Bên đã cam kết: app không tự thay; sẽ tạo mục Cần quyết nếu ở xa'],
    khach: ['Trang thông tin cho khách sẽ cập nhật địa điểm và gắn nhãn “Thông tin đã thay đổi”'],
  };
}

export function impactOfTime(c: CaseData): Impact {
  const bur = c.situation.form === 'burial';
  return {
    viec: [bur ? 'Mở việc “Làm thủ tục chôn cất với ban quản lý nghĩa trang” và lịch đào huyệt' : 'Mở việc “Đăng ký giờ hỏa táng”',
      'Lịch đưa tang và lễ truy điệu tính theo giờ đã chọn'],
    khach: ['Trang thông tin cho khách cập nhật giờ đưa tang'],
    ncc: ['Nhà xe nhận giờ đón (người lo Xe cộ báo)'],
  };
}

export function impactOfOrg(pick: string): Impact {
  return pick === 'ok'
    ? { viec: ['Lịch lễ, nghi thức được chốt; các việc của Ban lễ tang được mở'], khach: ['Cáo phó chính thức do Ban lễ tang phát hành; trang thông tin cập nhật lịch'] }
    : { viec: ['Gửi đề nghị điều chỉnh tới Ban lễ tang; lịch chưa chốt'], nguoi: ['Người đại diện gia đình trao đổi trực tiếp với Ban lễ tang'] };
}

/* ---------- Khép vòng ---------- */
export interface CloseInput { financeLocked: boolean; vendorsAccepted: boolean; resultDocSaved: boolean }
export interface CloseCond { label: string; ok: boolean; detail?: string }

export function closeConditions(c: CaseData, x: CloseInput): CloseCond[] {
  const vis = visibleTasks(c);
  const after = vis.filter(t => t.phase >= 13 && t.kind !== 'opt' && t.id !== 'm15d');
  const openAfter = after.filter(t => !finished(t));
  const issues = vis.filter(t => t.status === 'issue');
  return [
    { label: 'Việc hậu tang bắt buộc đã xong hoặc ghi rõ không áp dụng', ok: openAfter.length === 0, detail: openAfter.length ? `Còn ${openAfter.length} việc: ${list(openAfter, 3)}` : undefined },
    { label: 'Tài chính đã đối soát và khóa', ok: x.financeLocked },
    { label: 'Nhà cung cấp đã nghiệm thu', ok: x.vendorsAccepted },
    { label: 'Đã lưu tài liệu kết quả', ok: x.resultDocSaved },
    { label: 'Không còn việc có vấn đề', ok: issues.length === 0, detail: issues.length ? `${issues.length} việc có vấn đề` : undefined },
  ];
}
export const canClose = (conds: CloseCond[]) => conds.every(k => k.ok);
