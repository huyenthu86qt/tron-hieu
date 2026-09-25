// Điền mặc định cho các phần mới — đám hiếu tạo ở Phase 1 vẫn mở được.
// Kích hoạt hồ sơ chuẩn bị thành đám hiếu.
import type { Answers, CaseData, Form, OrgModel, Place, Venue } from './types';
import { emptyFinance } from './finance';
import { emptyAfter, emptyMilestones } from './aftercare';
import { defaultVenues } from './vendors';
import { createCase, U1_ID } from './model';
import { FREE_ACCESS, grantFull, type PreNeed } from './platform';

export function normalizeCase(c: CaseData): CaseData {
  c.access ??= { ...FREE_ACCESS };
  c.venues ??= defaultVenues();
  c.familyPick ??= {};
  c.familyVendors ??= [];
  c.vendors ??= {};
  c.updatedCats ??= [];
  c.finance ??= emptyFinance();
  c.ledger ??= [];
  c.shifts ??= [];
  c.milestones ??= emptyMilestones();
  c.after ??= emptyAfter();
  c.docs ??= [];
  return c;
}

const RITE_OF: Record<string, 'traditional' | 'catholic' | 'other'> = { 'Phật giáo': 'traditional', 'Công giáo': 'catholic', 'Truyền thống gia đình': 'traditional', 'Đơn giản, không nghi lễ': 'other' };

export interface ActivateInput { death: string; place: Place; org: OrgModel }

/** Kích hoạt: hồ sơ thành đám hiếu mở đầy đủ (không thu lần hai); nguyện vọng hiện là đề xuất, người đại diện vẫn xác nhận */
export function activatePreNeed(p: PreNeed, x: ActivateInput, byUserId: string, byName: string, now = new Date()): CaseData {
  if (p.caseId) throw new Error('Hồ sơ đã được kích hoạt.');
  if (!x.death) throw new Error('Cần nhập ngày mất.');
  const w = p.wish;
  const answers: Answers = {
    place: x.place,
    venue: (w.venue === 'family' ? 'undecided' : w.venue) as Venue | 'undecided',
    form: (w.form === 'family' ? 'undecided' : w.form) as Form | 'undecided',
    org: x.org, orgType: 'cadre', rite: RITE_OF[w.rite] ?? 'traditional', scale: w.scale,
  };
  const c = normalizeCase(createCase({ answers, now }));
  // Nguyện vọng là đề xuất: quyết định hình thức / nơi làm lễ để chờ người đại diện xác nhận
  c.decisions.forEach(d => {
    if (d.key === 'form' && w.form !== 'family') { d.status = 'pending'; d.chosen = null; d.wish = { text: `Mong được ${w.form === 'cremation' ? 'hỏa táng' : 'mai táng (địa táng)'}.`, value: w.form }; }
    if (d.key === 'venue' && w.venue !== 'family') { d.status = 'pending'; d.chosen = null; d.wish = { text: w.venue === 'home' ? 'Mong được làm lễ tại nhà.' : 'Mong được làm lễ tại nhà tang lễ.', value: w.venue }; }
  });
  for (const id of ['m3a', 'm3b']) { const t = c.tasks.find(y => y.id === id); if (t) t.status = 'todo'; }
  c.situation.hasPre = true;
  c.ownerId = byUserId;
  c.preNeedId = p.id;
  c.person = { ...c.person, title: (p.subject.title as CaseData['person']['title']) || 'Cụ ông', name: p.subject.name, birthYear: p.subject.birthYear, hometown: p.subject.hometown, death: x.death };
  const u1 = c.members.find(m => m.id === U1_ID)!;
  u1.name = byName; u1.userId = byUserId;
  c.pendingContacts = p.contacts.map(k => ({ ...k }));
  c.finance!.budget = p.budget.amount; c.finance!.budgetFromPre = p.budget.amount > 0;
  c.familyPick = { ...p.budget.vendors };
  c.docs = p.docs.map(d => ({ id: d.id, name: d.name, at: d.at, source: 'pre' as const, path: d.path }));
  const ms = c.milestones!;
  ms.sel = { d49: p.wish.milestones.includes('d49'), d100: p.wish.milestones.includes('d100'), gio: p.wish.milestones.includes('gio'), custom: false, none: false };
  const note = c.tasks.find(t => t.id === 'm4c');
  if (note && w.items.trim()) note.note = `Theo hồ sơ chuẩn bị: ${w.items.trim()}`;
  grantFull(c, 'activation');
  c.intake = {};
  c.history.push({ at: now.toISOString(), text: `Kích hoạt từ hồ sơ chuẩn bị bởi ${byName}` });
  return c;
}
