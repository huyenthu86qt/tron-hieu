import { describe, expect, it } from 'vitest';
import { canChi, lunarAnniversary, toLunar } from './lunar';
import { displayName, lifeLine, longevityWord, lunarAge, pronoun, resolveText } from './person';
import {
  canClose, chosenLabel, closeConditions, createCase, currentPhase, decide, changeDecision, dependencies, findDecision, findTask,
  impactOfForm, impactOfVenue, lockBlocked, nowTasks, pendingDecisions, visibleTasks,
} from './model';
import {
  addCustomTask, assignTask, completeTask, deleteCustomTask, editTask, inviteMember, removeMember, restoreTask,
  RuleError, saveAreas, savePerson, skipTask,
} from './actions';
import { DEFAULT_ANSWERS, entryItems, visibleQuestions } from './entry';
import { TEMPLATES } from './templates';
import type { Answers, CaseData } from './types';

const A = (x: Partial<Answers> = {}): Answers => ({ ...DEFAULT_ANSWERS, ...x });
const mk = (x: Partial<Answers> = {}) => createCase({ answers: A(x), now: new Date(2026, 8, 24, 22) });
const ids = (c: CaseData) => new Set(visibleTasks(c).map(t => t.id));
const withDeath = (c: CaseData, death = '2026-09-24', title: CaseData['person']['title'] = 'Cụ ông') => {
  savePerson(c, { ...c.person, title, name: 'Nguyễn Văn Hòa', birthYear: '1938', death, time: '21:15', u1name: 'Nguyễn Minh Tuấn', u1rel: 'Con trai trưởng' });
  return c;
};

describe('Lịch âm Việt Nam', () => {
  const L = (y: number, m: number, d: number) => toLunar(new Date(y, m - 1, d));
  it('Tết Bính Ngọ 17/02/2026', () => expect(L(2026, 2, 17)).toEqual({ day: 1, month: 1, year: 2026, leap: false }));
  it('Tết Đinh Mùi 06/02/2027', () => expect(L(2027, 2, 6)).toEqual({ day: 1, month: 1, year: 2027, leap: false }));
  it('Trung thu 25/09/2026 là 15/8', () => expect(L(2026, 9, 25)).toMatchObject({ day: 15, month: 8 }));
  it('Ngày mất mẫu 24/09/2026 là 14/8 năm Bính Ngọ', () => {
    expect(L(2026, 9, 24)).toMatchObject({ day: 14, month: 8, year: 2026 });
    expect(canChi(2026)).toBe('Bính Ngọ');
  });
  it('Giỗ đầu rơi vào cùng ngày âm năm sau', () => {
    const g = lunarAnniversary(new Date(2026, 8, 24))!;
    expect(toLunar(g)).toMatchObject({ day: 14, month: 8, year: 2027 });
  });
});

describe('Người đã khuất', () => {
  const p = { title: 'Cụ ông' as const, name: 'Nguyễn Văn Hòa', saint: 'Giuse', birthYear: '1938', death: '2026-09-24', time: '21:15', hometown: '', photo: null };
  it('tuổi âm = năm mất − năm sinh + 1', () => expect(lunarAge(p)).toBe(89));
  it('hưởng thọ từ 60, dưới 60 hưởng dương', () => {
    expect(longevityWord(60)).toBe('hưởng thọ');
    expect(longevityWord(59)).toBe('hưởng dương');
  });
  it('tên thánh chỉ hiện khi Công giáo', () => {
    expect(displayName(p, true)).toBe('Cụ ông Giuse Nguyễn Văn Hòa');
    expect(displayName(p, false)).toBe('Cụ ông Nguyễn Văn Hòa');
    expect(displayName({ ...p, name: '' }, false)).toBe('Người đã khuất');
  });
  it('dòng đời có ngày âm và tuổi', () => expect(lifeLine(p)).toContain('14/8 năm Bính Ngọ'));
  it('xưng hô theo danh xưng', () => {
    expect(pronoun('Cụ bà')).toBe('cụ');
    expect(pronoun('Bà')).toBe('bà');
    expect(resolveText('Tắm cho {p}. {P} đi thanh thản.', { ...p, title: 'Ông' })).toBe('Tắm cho ông. Ông đi thanh thản.');
  });
  it('hạn tính theo ngày mất, qua tháng và năm', () => {
    expect(resolveText('Trước 12:00 ngày {d+2}', p)).toBe('Trước 12:00 ngày 26/09');
    expect(resolveText('{D+8}', { ...p, death: '2026-12-28' })).toBe('05/01/2027');
    expect(resolveText('{d+1}', { ...p, death: '' })).toBe('—');
  });
});

describe('Sinh việc theo hoàn cảnh', () => {
  it('đám hiếu mới bắt đầu trống: không người nhận, không việc xong ngoài quyết định đã chốt', () => {
    const c = mk();
    expect(c.members.map(m => m.id)).toEqual(['u1']);
    expect(c.tasks.every(t => t.owner === null)).toBe(true);
    expect(c.tasks.filter(t => t.status === 'done').map(t => t.id).sort()).toEqual(['m3a', 'm3b']);
    expect(c.person.name).toBe('');
    expect(currentPhase(c)).toBe(1);
  });
  it('mỗi mẫu việc có id duy nhất, chặng 1–15, phụ thuộc trỏ tới việc có thật', () => {
    const all = new Set(TEMPLATES.map(t => t.id));
    expect(all.size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) {
      expect(t.phase).toBeGreaterThanOrEqual(1);
      expect(t.phase).toBeLessThanOrEqual(15);
      for (const d of t.deps ?? []) expect(all.has(d)).toBe(true);
    }
  });
  it('hỏa táng / địa táng', () => {
    const cre = ids(mk({ form: 'cremation' })), bur = ids(mk({ form: 'burial' }));
    expect(cre.has('t4') && cre.has('m3c') && !cre.has('b12c')).toBe(true);
    expect(bur.has('b12c') && bur.has('b3a') && bur.has('b7a') && !bur.has('t4') && !bur.has('m3c')).toBe(true);
  });
  it('nghi lễ Phật giáo / Công giáo', () => {
    const tr = ids(mk({ rite: 'traditional' })), ca = ids(mk({ rite: 'catholic' }));
    expect(tr.has('m1d') && tr.has('m5b') && !tr.has('c1d')).toBe(true);
    expect(ca.has('c1d') && ca.has('c10a') && ca.has('m9c2') && !ca.has('m1d') && !ca.has('m9c')).toBe(true);
  });
  it('nghi lễ khác đi theo nhánh truyền thống', () => expect(ids(mk({ rite: 'other' })).has('m9c')).toBe(true));
  it('hình thức 1 — gia đình tự tổ chức', () => {
    const s = ids(mk({ org: 'family' }));
    expect(s.has('m10b') && s.has('t13') && !s.has('o2a') && !s.has('k1')).toBe(true);
  });
  it('hình thức 2 — phối hợp địa phương', () => {
    const c = mk({ org: 'community' }), s = ids(c);
    expect(s.has('k1') && s.has('k2') && s.has('k5') && !s.has('t13') && !s.has('m10b') && !s.has('o2a')).toBe(true);
    expect(c.members.map(m => m.system)).toContain('mttq');
    expect(c.decisions.map(d => d.key)).not.toContain('org');
  });
  it('hình thức 3 — tôn giáo + nghi lễ tang: Ban lễ tang đề xuất', () => {
    const c = mk({ org: 'official_rel', orgType: 'military', rite: 'catholic' }), s = ids(c);
    expect(s.has('o2a') && s.has('o10b') && s.has('c1d') && !s.has('m6b') && !s.has('m9a')).toBe(true);
    const blt = c.members.find(m => m.system === 'blt')!;
    expect(blt.name).toBe('Ban lễ tang — đơn vị quân đội');
    expect(blt.role).toBe('Đồng tổ chức');
    expect(findDecision(c, 'org')!.title).toContain('đề xuất');
  });
  it('hình thức 4 — chỉ nghi lễ tang: không nghi lễ tôn giáo, Ban lễ tang chủ trì', () => {
    const c = mk({ org: 'official', orgType: 'police' }), s = ids(c);
    expect(c.situation.rite).toBe('none');
    expect(s.has('n5a') && s.has('n11a') && s.has('m9c2') && !s.has('m1d') && !s.has('c1d')).toBe(true);
    expect(c.members.find(m => m.system === 'blt')!.role).toBe('Chủ trì');
    expect(findDecision(c, 'org')!.title).toContain('chủ trì');
    expect(findTask(c, 't1')!.steps![0]).toContain('Ban lễ tang');
  });
  it('3 đối tượng nghi lễ tang', () => {
    for (const orgType of ['cadre', 'military', 'police'] as const) {
      const c = mk({ org: 'official_rel', orgType });
      expect(c.members.some(m => m.system === 'blt')).toBe(true);
    }
  });
  it('nơi mất', () => {
    expect(ids(mk({ place: 'hospital' })).has('t0')).toBe(true);
    expect(ids(mk({ place: 'home' })).has('p1a')).toBe(true);
    expect(ids(mk({ place: 'other' })).has('p1b')).toBe(true);
    expect(ids(mk({ place: 'home' })).has('t0')).toBe(false);
  });
  it('nơi làm lễ', () => {
    const h = ids(mk({ venue: 'home' })), l = ids(mk({ venue: 'hall' }));
    expect(h.has('t5') && h.has('e1a') && !h.has('h7a')).toBe(true);
    expect(l.has('h7a') && l.has('h13a') && !l.has('t5')).toBe(true);
  });
  it('quy mô', () => {
    expect(ids(mk({ scale: 'small' })).has('m7e')).toBe(false);
    expect(ids(mk({ scale: 'medium' })).has('m7e')).toBe(true);
    expect(ids(mk({ scale: 'large' })).has('l8a')).toBe(true);
    expect(ids(mk({ scale: 'medium' })).has('l8a')).toBe(false);
  });
  it('chưa quyết thì quyết định còn chờ', () => {
    const c = mk({ venue: 'undecided', form: 'undecided' });
    expect(pendingDecisions(c).map(d => d.key).sort()).toEqual(['form', 'time', 'venue']);
    expect(findTask(c, 'm3a')!.status).toBe('todo');
  });
  it('việc hồ sơ chuẩn bị chỉ hiện khi có hồ sơ', () => expect(ids(mk()).has('m4c')).toBe(false));
});

describe('Việc cần làm ngay', () => {
  it('theo hoàn cảnh, tối đa 6 việc, có nhóm báo tin', () => {
    const L = entryItems(A({ org: 'community', place: 'home', rite: 'catholic' }));
    expect(L.length).toBeLessThanOrEqual(6);
    expect(L.map(x => x.key)).toEqual(['home', 'news', 'comm', 'rite', 'place']);
    expect(L[1].groups!.map(g => g.taskId)).toEqual(['t3', 't11', 't12']);
  });
  it('“Tôi làm” và “Đã báo” chuyển vào đám hiếu', () => {
    const c = createCase({ answers: A(), mine: ['t0'], notified: ['t3'] });
    expect(findTask(c, 't0')).toMatchObject({ owner: 'u1', status: 'doing' });
    expect(findTask(c, 't3')!.status).toBe('done');
  });
  it('câu hỏi đối tượng / nghi thức hiện theo hình thức tổ chức', () => {
    expect(visibleQuestions(A({ org: 'family' })).map(q => q.k)).not.toContain('orgType');
    expect(visibleQuestions(A({ org: 'official' })).map(q => q.k)).toEqual(expect.arrayContaining(['orgType']));
    expect(visibleQuestions(A({ org: 'official' })).map(q => q.k)).not.toContain('rite');
  });
});

describe('Phụ thuộc và việc không thể quay lại', () => {
  it('nhập quan bị chặn tới khi việc phía trước xong; bỏ qua việc không hiện', () => {
    const c = mk();
    const t1 = findTask(c, 't1')!;
    expect(dependencies(c, t1).deps.map(d => d.id)).toEqual(['m1d', 'm4a', 'm4b']);
    expect(lockBlocked(c, t1)).toBe(true);
    expect(() => completeTask(c, 't1', { checksOk: true })).toThrow(RuleError);
    for (const id of ['m1d', 'm4a', 'm4b']) completeTask(c, id);
    expect(lockBlocked(c, findTask(c, 't1')!)).toBe(false);
    expect(() => completeTask(c, 't1')).toThrow('Cần kiểm đủ');
    completeTask(c, 't1', { riskNote: 'Chú Út không kịp về, đã gọi video' });
    expect(findTask(c, 't1')!.status).toBe('done');
    expect(c.history.at(-1)!.text).toContain('Chấp nhận rủi ro');
  });
  it('chặng hiện tại tiến lên khi xong việc; việc tùy chọn không giữ chặng', () => {
    const c = mk({ place: 'home', venue: 'hall', rite: 'catholic' });
    for (const t of visibleTasks(c).filter(x => x.phase === 1)) completeTask(c, t.id);
    expect(currentPhase(c)).toBe(2);
    expect(nowTasks(c).some(t => t.phase === 2)).toBe(true);
  });
});

describe('Quyết định và tác động', () => {
  it('đổi hình thức an táng: xem tác động trước, giờ đã chốt phải chốt lại', () => {
    const c = withDeath(mk());
    decide(c, 'time', 'a');
    expect(findTask(c, 'm3c')!.status).toBe('done');
    const L = impactOfForm(c, 'burial');
    expect(L.viec!.join(' ')).toContain('Thêm');
    expect(L.quyet![0]).toContain('phải chốt lại');
    changeDecision(c, 'form', 'burial', 'Họ hàng muốn an táng ở khu mộ dòng họ');
    expect(c.situation.form).toBe('burial');
    expect(findDecision(c, 'time')).toMatchObject({ status: 'pending', title: 'Giờ hạ huyệt' });
    expect(findTask(c, 'm3c')!.status).toBe('todo');
    expect(ids(c).has('b12c')).toBe(true);
    expect(c.history.at(-1)!.text).toContain('Lý do');
  });
  it('đổi nơi tổ chức: tác động liệt kê việc thêm / bỏ và người nhận thông báo', () => {
    const c = mk({ venue: 'home' });
    inviteMember(c, { name: 'Trần Văn Hùng', rel: 'Con rể', access: 'limited', areas: ['Nhà cung cấp'], phone: '0912345671' });
    const L = impactOfVenue(c, 'hall');
    expect(L.viec!.join(' ')).toContain('Đặt phòng lễ');
    expect(L.viec!.join(' ')).toContain('Thuê rạp');
    expect(L.nguoi![0]).toContain('Trần Văn Hùng');
    changeDecision(c, 'venue', 'hall', '');
    expect(ids(c).has('h7a')).toBe(true);
    expect(findDecision(c, 'venue')!.chosen).toBe('hall');
  });
  it('giờ an táng do gia đình tự điền; hạn chốt tính theo ngày mất', () => {
    const c = withDeath(mk(), '2026-12-30');
    const d = findDecision(c, 'time')!;
    expect(d.options.map(o => o.k)).toEqual(['c']);
    expect(d.due).toBe('Cần chốt trước 12:00 ngày 01/01');
    decide(c, 'time', 'c', '6 giờ 30, ngày 04/01/2027');
    expect(findDecision(c, 'time')!.detail).toBe('6 giờ 30, ngày 04/01/2027');
    expect(chosenLabel(findDecision(c, 'time')!)).toBe('6 giờ 30, ngày 04/01/2027');
  });
  it('Ban lễ tang: xác nhận thì việc chốt lịch xong, đề nghị điều chỉnh thì chưa', () => {
    const c = mk({ org: 'official_rel' });
    decide(c, 'org', 'adjust');
    expect(findTask(c, 'o3a')!.status).toBe('todo');
    const c2 = mk({ org: 'official_rel' });
    decide(c2, 'org', 'ok');
    expect(findTask(c2, 'o3a')!.status).toBe('done');
  });
});

describe('Việc riêng, không áp dụng, đội và vùng', () => {
  it('thêm / sửa / xóa việc riêng', () => {
    const c = mk();
    const id = addCustomTask(c, { title: 'Mời đội múa lân của làng', phase: 11, due: '', owner: '', area: 'Toàn bộ', note: '' });
    expect(findTask(c, id)).toMatchObject({ kind: 'own', phase: 11, due: 'Chưa đặt hạn' });
    editTask(c, id, { title: 'Mời đội lân', phase: 10, due: 'Sáng {d+4}', owner: 'u1', area: 'Liên lạc', note: 'x' });
    expect(findTask(c, id)).toMatchObject({ title: 'Mời đội lân', phase: 10, owner: 'u1' });
    deleteCustomTask(c, id);
    expect(findTask(c, id)).toBeNull();
    expect(() => deleteCustomTask(c, 't1')).toThrow(RuleError);
  });
  it('việc do app sinh: sửa tên / hạn, không áp dụng cần lý do, khôi phục được', () => {
    const c = mk();
    editTask(c, 'm6b', { title: 'Đăng cáo phó trên đài phường', phase: 6, due: 'Tối {d+1}', owner: '', area: 'Liên lạc', note: '' });
    expect(findTask(c, 'm6b')!.title).toBe('Đăng cáo phó trên đài phường');
    expect(() => skipTask(c, 'm6b', ' ')).toThrow(RuleError);
    skipTask(c, 'm6b', 'Gia đình không đăng');
    expect(findTask(c, 'm6b')!.status).toBe('skip');
    restoreTask(c, 'm6b');
    expect(findTask(c, 'm6b')!.status).toBe('todo');
  });
  it('bỏ thành viên trả việc về “chưa có người nhận”; đổi tên vùng cập nhật người và việc', () => {
    const c = mk();
    const m = inviteMember(c, { name: 'Chú Bảy', rel: 'Hàng xóm', access: 'link', areas: ['Liên lạc'] });
    expect(m.linkToken).toMatch(/^[A-Z0-9]{20}$/);
    // Đầy đủ / Giới hạn: không bắt buộc số điện thoại, vào đội bằng link mời
    const ha = inviteMember(c, { name: 'Hà', rel: 'Con dâu', access: 'full', areas: ['Tài chính'] });
    expect(ha.inviteToken).toMatch(/^[A-Z0-9]{20}$/);
    expect(ha.phone).toBeUndefined();
    expect(() => inviteMember(c, { name: 'Tư', rel: 'Cháu', access: 'full', areas: ['Tài chính'], phone: '12345' })).toThrow('Số điện thoại chưa đúng');
    assignTask(c, 't3', m.id);
    removeMember(c, m.id);
    expect(findTask(c, 't3')!.owner).toBeNull();
    inviteMember(c, { name: 'Lan', rel: 'Con gái', access: 'limited', areas: ['Liên lạc'], phone: '0912345672' });
    saveAreas(c, c.areas.map(a => ({ name: a === 'Liên lạc' ? 'Báo tin' : a, orig: a })));
    expect(c.members.find(x => x.name === 'Lan')!.areas).toEqual(['Báo tin']);
    expect(findTask(c, 't3')!.area).toBe('Báo tin');
    saveAreas(c, c.areas.map(a => ({ name: a, orig: a, del: a === 'Báo tin' })));
    expect(findTask(c, 't3')!.area).toBe('Toàn bộ');
    expect(() => saveAreas(c, [{ name: 'A', orig: null }, { name: 'a', orig: null }])).toThrow('trùng');
  });
  it('hồ sơ người mất: kiểm năm sinh, đổi tên Ban lễ tang theo xưng hô', () => {
    const c = mk({ org: 'official_rel', orgType: 'cadre' });
    expect(() => savePerson(c, { ...c.person, name: 'A', death: '2026-09-24', birthYear: '2030', u1name: '', u1rel: '' })).toThrow('Năm sinh');
    withDeath(c, '2026-09-24', 'Bà');
    expect(c.members.find(m => m.system === 'blt')!.name).toBe('Ban lễ tang — cơ quan cũ của bà');
    expect(c.members[0].name).toBe('Nguyễn Minh Tuấn');
    expect(findTask(c, 'm4a')!.title).toBe('Tắm rửa, thay áo cho bà (mộc dục)');
  });
});

describe('Điều kiện khép vòng', () => {
  it('chưa đủ khi còn việc hậu tang và chưa khóa tài chính', () => {
    const c = mk();
    const k = closeConditions(c, { financeLocked: false, vendorsAccepted: true, resultDocSaved: true });
    expect(canClose(k)).toBe(false);
    expect(k[0].ok).toBe(false);
  });
  it('đủ khi việc hậu tang xong / không áp dụng, không còn vấn đề', () => {
    const c = mk();
    for (const t of visibleTasks(c).filter(x => x.phase >= 13 && x.kind !== 'opt' && x.id !== 'm15d')) {
      if (t.id === 'm14a') skipTask(c, t.id, 'Đã làm ở phường'); else completeTask(c, t.id);
    }
    expect(canClose(closeConditions(c, { financeLocked: true, vendorsAccepted: true, resultDocSaved: true }))).toBe(true);
  });
});
