// Lưu đám hiếu trên máy chủ Supabase (Phase 3a). Cùng giao diện CaseRepo với bản lưu trên máy.
// - Phần chung của đám hiếu: bảng cases (cột data), kiểm tra phiên bản để không ghi đè khi hai người cùng sửa.
// - Sổ phúng viếng: bảng condolences (số tiền chỉ người giữ Tài chính đọc được — máy chủ tự ẩn).
// - Tài khoản bên nhận: bảng expense_payees (chỉ người giữ Tài chính đọc được).
// - Trang cáo phó công khai: bảng public_pages (bản rút gọn, không chứa tài chính hay sổ phúng viếng).
import type { CaseData, Condolence, Member, Payee, TaskInst } from '../domain/types';
import { normalizeCase } from '../domain/normalize';
import { U1_ID } from '../domain/model';
import { friendlyError, sb } from './backend';
import type { CaseRepo, CaseSummary } from './repo';

/** Có người khác vừa lưu trước — cần tải lại rồi làm lại thao tác */
export class ConflictError extends Error {
  constructor() { super('Có người vừa cập nhật đám hiếu này. Đã tải lại bản mới nhất.'); }
}

interface Snap { version: number; ledger: Set<string>; payees: Map<string, string>; page: string }
const snaps = new Map<string, Snap>();

type Row = { id: string; owner_id: string; data: CaseData; access: CaseData['access']; version: number; delete_requested_at: string | null };
const COLS = 'id, owner_id, data, access, version, delete_requested_at';

const fromRow = (r: Row): CaseData =>
  normalizeCase({ ...r.data, id: r.id, ownerId: r.owner_id, access: r.access ?? { plan: 'free' }, deleteRequestedAt: r.delete_requested_at ?? undefined });

/** Bản rút gọn cho trang công khai: chỉ những gì khách được xem */
function publicContent(c: CaseData): CaseData {
  const u1 = c.members.find(m => m.id === U1_ID)!;
  const pub: CaseData = {
    id: c.id, createdAt: c.createdAt, situation: c.situation, person: c.person, venues: c.venues,
    members: [{ id: u1.id, name: u1.name, rel: u1.rel, role: u1.role, access: 'full', areas: [] } as Member],
    areas: [], tasks: [], decisions: c.decisions.filter(d => d.key === 'time'), mourning: false, history: [], publicPage: c.publicPage,
  };
  return pub;
}

function stripForServer(c: CaseData) {
  const d = structuredClone(c) as CaseData & Record<string, unknown>;
  delete d.ledger; delete d.access; delete d.ownerId; delete d.deleteRequestedAt;
  d.finance?.expenses.forEach(e => { delete e.payee; });
  return d;
}

async function loadExtras(c: CaseData) {
  const [led, pay] = await Promise.all([
    sb!.rpc('case_ledger', { cid: c.id }),
    sb!.from('expense_payees').select('expense_id, holder, bank, acct').eq('case_id', c.id),
  ]);
  if (led.error) throw led.error;
  c.ledger = (led.data as { id: string; info: Omit<Condolence, 'id' | 'amount' | 'method'>; amount: number | null; method: Condolence['method'] | null }[])
    .map(r => ({ ...r.info, id: r.id, amount: Number(r.amount ?? 0), method: r.method ?? 'cash' }));
  const payees = new Map<string, string>();
  for (const p of (pay.data ?? []) as ({ expense_id: string } & Payee)[]) {
    const e = c.finance?.expenses.find(x => x.id === p.expense_id);
    const v: Payee = { holder: p.holder, bank: p.bank, acct: p.acct };
    if (e) e.payee = v;
    payees.set(p.expense_id, JSON.stringify(v));
  }
  return payees;
}

export class SupabaseRepo implements CaseRepo {
  async list(): Promise<CaseSummary[]> {
    return (await this.listAll()).map(c => ({
      id: c.id, name: c.person.name ? `${c.person.title} ${c.person.name}` : 'Người đã khuất (chưa nhập tên)', createdAt: c.createdAt,
      ownerId: c.ownerId, full: c.access?.plan === 'full', closed: !!c.after?.closed,
    }));
  }

  async listAll(): Promise<CaseData[]> {
    const { data, error } = await sb!.from('cases').select(COLS).order('created_at', { ascending: false });
    if (error) throw new Error(friendlyError(error));
    return (data as Row[]).map(fromRow);
  }

  /** Admin: chỉ tên và trạng thái (máy chủ không trả nội dung) */
  async adminCases(): Promise<CaseData[]> {
    const { data, error } = await sb!.rpc('admin_cases');
    if (error) throw new Error(friendlyError(error));
    return (data as { id: string; owner_id: string; name: string; access: CaseData['access']; closed: boolean; delete_requested_at: string | null; created_at: string }[])
      .map(r => normalizeCase({
        id: r.id, ownerId: r.owner_id, createdAt: r.created_at, access: r.access, deleteRequestedAt: r.delete_requested_at ?? undefined,
        person: { title: '', name: r.name, saint: '', birthYear: '', death: '', time: '', hometown: '', photo: null },
        situation: { place: 'home', venue: 'home', form: 'cremation', rite: 'traditional', org: 'family', orgType: 'cadre', scale: 'medium', hasPre: false },
        members: [], areas: [], tasks: [], decisions: [], mourning: false, history: [], after: { closed: r.closed, thanked: {}, thankText: '', thankAuto: false },
      } as CaseData));
  }

  async get(id: string): Promise<CaseData | null> {
    const { data, error } = await sb!.from('cases').select(COLS).eq('id', id).maybeSingle();
    if (error) throw new Error(friendlyError(error));
    if (!data) return null;
    const c = fromRow(data as Row);
    const payees = await loadExtras(c);
    snaps.set(id, { version: (data as Row).version, ledger: new Set(c.ledger!.map(x => x.id)), payees, page: c.publicPage ? JSON.stringify(publicContent(c)) : '' });
    return c;
  }

  async save(c: CaseData): Promise<void> {
    const snap = snaps.get(c.id);
    const body = stripForServer(c);
    if (!snap) {
      const { error } = await sb!.from('cases').insert({ id: c.id, owner_id: c.ownerId, data: body });
      if (error) throw new Error(friendlyError(error));
      snaps.set(c.id, { version: 1, ledger: new Set(), payees: new Map(), page: '' });
    } else {
      const { data, error } = await sb!.from('cases')
        .update({ data: body, version: snap.version + 1, delete_requested_at: c.deleteRequestedAt ?? null })
        .eq('id', c.id).eq('version', snap.version).select('version');
      if (error) throw new Error(friendlyError(error));
      if (!data?.length) throw new ConflictError();
      snap.version += 1;
    }
    const s = snaps.get(c.id)!;

    // Sổ phúng viếng: thêm lượt mới, xóa lượt đã bỏ
    const ids = new Set((c.ledger ?? []).map(x => x.id));
    const added = (c.ledger ?? []).filter(x => !s.ledger.has(x.id));
    const removed = [...s.ledger].filter(id => !ids.has(id));
    if (added.length) {
      const { error } = await sb!.from('condolences').insert(added.map(({ id, amount, method, ...info }) => ({ id, case_id: c.id, info, amount, method })));
      if (error) throw new Error(friendlyError(error));
    }
    if (removed.length) await sb!.from('condolences').delete().eq('case_id', c.id).in('id', removed);
    s.ledger = ids;

    // Tài khoản bên nhận
    for (const e of c.finance?.expenses ?? []) {
      if (!e.payee) continue;
      const v = JSON.stringify(e.payee);
      if (s.payees.get(e.id) === v) continue;
      const { error } = await sb!.from('expense_payees').upsert({ case_id: c.id, expense_id: e.id, ...e.payee }, { onConflict: 'case_id,expense_id' });
      if (error) throw new Error(friendlyError(error));
      s.payees.set(e.id, v);
    }

    // Trang công khai: cập nhật bản rút gọn khi thông tin cho khách thay đổi
    if (c.publicPage?.slug) {
      const content = publicContent(c), json = JSON.stringify(content);
      if (json !== s.page) {
        const { error } = await sb!.from('public_pages').upsert({ slug: c.publicPage.slug, case_id: c.id, content, published: c.publicPage.published }, { onConflict: 'slug' });
        if (error) throw new Error(friendlyError(error));
        s.page = json;
      }
    }
  }

  async remove(): Promise<void> {
    throw new Error('Xóa đám hiếu thực hiện qua yêu cầu xóa trong mục Tài khoản.');
  }

  async findBySlug(slug: string): Promise<CaseData | null> {
    const { data } = await sb!.from('public_pages').select('content, published').eq('slug', slug).maybeSingle();
    if (!data || !(data as { published: boolean }).published) return null;
    return normalizeCase((data as { content: CaseData }).content);
  }

  /** Link nhờ việc (Phase 3b): máy chủ trả bản rút gọn — chỉ việc được nhờ, không số điện thoại, không tài chính */
  async findByLinkToken(token: string): Promise<{ c: CaseData; member: Member } | null> {
    const { data, error } = await sb!.rpc('link_view', { p_token: token });
    if (error) throw new Error(friendlyError(error));
    if (!data) return null;
    const r = data as { memberId: string; case: CaseData };
    const c = normalizeCase(r.case);
    const member = c.members.find(m => m.id === r.memberId);
    return member ? { c, member } : null;
  }

  async transferOwner(c: CaseData, newUser: string): Promise<void> {
    const snap = snaps.get(c.id);
    if (!snap) throw new Error('Tải lại đám hiếu rồi thử lại.');
    const { error } = await sb!.rpc('transfer_owner', { p_case: c.id, p_new_user: newUser, p_data: stripForServer(c), p_version: snap.version });
    if (error) throw new Error(friendlyError(error));
    snaps.delete(c.id);
  }

  async linkAct(token: string, task: TaskInst, log: string): Promise<void> {
    const { error } = await sb!.rpc('link_act', { p_token: token, p_task: task, p_log: log });
    if (error) throw new Error(friendlyError(error));
  }

  /** Báo khi có người khác cập nhật đám hiếu (thời gian thực) */
  subscribe(id: string, onChange: () => void): () => void {
    const ch = sb!.channel('case-' + id)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cases', filter: `id=eq.${id}` }, payload => {
        const v = (payload.new as { version?: number }).version ?? 0;
        if (v > (snaps.get(id)?.version ?? 0)) onChange();
      })
      .subscribe();
    return () => { void sb!.removeChannel(ch); };
  }
}
