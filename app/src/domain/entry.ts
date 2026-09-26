// Câu hỏi hoàn cảnh (S-ENT-02) và việc cần làm ngay (S-ENT-03).
import type { Answers } from './types';

export interface Question {
  k: keyof Answers;
  q: string;
  hint: string;
  o: [string, string][];
  when?: (a: Answers) => boolean;
}

export const QUESTIONS: Question[] = [
  { k: 'place', q: 'Người thân mất ở đâu?', hint: 'Để app biết những việc thủ tục và di chuyển đầu tiên.', o: [['hospital', 'Tại bệnh viện'], ['home', 'Tại nhà'], ['other', 'Nơi khác']] },
  { k: 'venue', q: 'Gia đình dự định làm lễ ở đâu?', hint: 'Chưa chắc cũng không sao, có thể đổi sau.', o: [['home', 'Tại nhà riêng'], ['hall', 'Tại nhà tang lễ'], ['undecided', 'Chưa quyết']] },
  { k: 'form', q: 'Hình thức dự kiến?', hint: 'Ảnh hưởng tới lịch và các việc cần đặt trước.', o: [['cremation', 'Hỏa táng'], ['burial', 'Mai táng (địa táng)'], ['undecided', 'Chưa quyết']] },
  { k: 'org', q: 'Lễ tang được tổ chức theo hình thức nào?', hint: 'Quyết định ai chủ trì, ai hỗ trợ và nghi lễ nào được dùng.', o: [
    ['family', 'Gia đình tự tổ chức theo nghi lễ tôn giáo / truyền thống'],
    ['community', 'Gia đình chủ trì, phối hợp Ban công tác Mặt trận, UBND xã, hội đoàn thể địa phương'],
    ['official_rel', 'Nghi lễ tôn giáo + nghi lễ tang cán bộ, công chức, viên chức hoặc quân nhân'],
    ['official', 'Chỉ theo nghi lễ tang cán bộ, công chức, viên chức hoặc quân nhân']] },
  { k: 'orgType', q: 'Nghi lễ tang của đối tượng nào?', hint: 'Cơ quan hoặc đơn vị sẽ lập Ban lễ tang.', o: [['cadre', 'Cán bộ, công chức, viên chức'], ['military', 'Quân nhân'], ['police', 'Công an nhân dân']], when: a => a.org === 'official_rel' || a.org === 'official' },
  { k: 'rite', q: 'Gia đình làm lễ theo nghi thức nào?', hint: 'Các việc, người cần mời và lịch lễ sẽ theo nghi thức này.', o: [['traditional', 'Truyền thống thờ cúng tổ tiên / Phật giáo'], ['catholic', 'Công giáo'], ['other', 'Khác (Tin Lành, Cao Đài, Hòa Hảo…)']], when: a => a.org !== 'official' },
  { k: 'scale', q: 'Quy mô dự kiến?', hint: 'Giúp ước lượng hậu cần và khách.', o: [['small', 'Nhỏ — gia đình, họ hàng gần'], ['medium', 'Vừa — thêm bạn bè, hàng xóm'], ['large', 'Lớn — nhiều đoàn cơ quan']] },
];

export const DEFAULT_ANSWERS: Answers = { place: 'hospital', venue: 'home', form: 'cremation', org: 'family', orgType: 'cadre', rite: 'traditional', scale: 'medium' };

export const visibleQuestions = (a: Answers) => QUESTIONS.filter(q => !q.when || q.when(a));

export const answerLabel = (k: keyof Answers, v: string) => QUESTIONS.find(q => q.k === k)?.o.find(o => o[0] === v)?.[1] ?? v;

export interface EntryItem {
  key: string;
  title: string;
  hint: string;
  /** Việc trong bản đồ tương ứng — nhận “Tôi làm” sẽ giao các việc này cho người đại diện */
  taskIds: string[];
  groups?: { label: string; taskId: string }[];
}

export function entryItems(a: Answers): EntryItem[] {
  const L: EntryItem[] = [];
  if (a.place === 'hospital') {
    L.push({ key: 'hosp', title: 'Nhận giấy báo tử và làm thủ tục tại bệnh viện', hint: 'Cần có trước khi đưa người thân về', taskIds: ['t0'] },
      { key: 'car', title: 'Liên hệ xe đưa người thân về nơi làm lễ', hint: 'Bệnh viện thường có danh sách xe; app sẽ gợi ý bên gần nhất sau khi lưu', taskIds: ['m1b'] });
  } else if (a.place === 'home') {
    L.push({ key: 'home', title: 'Báo cho trạm y tế hoặc chính quyền địa phương để được hướng dẫn giấy báo tử', hint: 'Mất tại nhà thì Ủy ban nhân dân xã/phường nơi người mất cấp Giấy báo tử — cần có để làm khai tử (khoản 2 Điều 4 Nghị định 123/2015/NĐ-CP)', taskIds: ['p1a'] });
  } else {
    L.push({ key: 'other', title: 'Liên hệ nơi người thân mất để được hướng dẫn thủ tục', hint: 'Nơi đó sẽ hướng dẫn giấy tờ cần làm', taskIds: ['p1b'] });
  }
  const groups = [
    { label: 'Họ hàng bên nội', taskId: 't3' }, { label: 'Họ hàng bên ngoại', taskId: 't11' },
    { label: 'Cơ quan, đoàn thể nơi người mất từng công tác, sinh hoạt', taskId: 't12' },
  ];
  if (a.org !== 'community') groups.push({ label: 'Tổ dân phố và bà con lối xóm', taskId: 't13' });
  L.push({ key: 'news', title: 'Báo tin', hint: 'Để mọi người kịp về viếng và cùng chia việc — có thể nhờ mỗi người báo một nhóm', taskIds: ['m1c'], groups });
  if (a.org === 'official_rel' || a.org === 'official') L.push({ key: 'blt', title: 'Báo cơ quan, đơn vị để lập Ban lễ tang', hint: a.org === 'official' ? 'Ban lễ tang chủ trì lịch lễ, nghi thức, cáo phó' : 'Ban lễ tang cùng gia đình lo lịch lễ, nghi thức, cáo phó', taskIds: ['o2a'] });
  if (a.org === 'community') L.push({ key: 'comm', title: 'Báo Ban công tác Mặt trận khu dân cư và tổ trưởng dân phố', hint: 'Để địa phương, hội đoàn thể phối hợp cùng gia đình', taskIds: ['k1'] });
  if (a.org !== 'official') L.push(a.rite === 'catholic'
    ? { key: 'rite', title: 'Báo cha xứ và ban hành giáo của giáo xứ', hint: 'Để thống nhất nghi thức tẩm liệm và giờ Thánh lễ', taskIds: ['c1d'] }
    : { key: 'rite', title: 'Mời một người lớn tuổi am hiểu nghi lễ hoặc thầy cúng xem giờ', hint: 'Giờ khâm liệm, nhập quan quyết định nhiều việc sau', taskIds: ['m1d'] });
  if (a.venue !== 'hall') L.push({ key: 'place', title: 'Dọn chỗ đặt linh cữu và bàn thờ tạm', hint: 'Việc gia đình tự làm được ngay', taskIds: ['e1a'] });
  return L.slice(0, 6);
}

/** Quyết định cần chốt sớm hiện ở S-ENT-03 */
export function earlyDecisions(a: Answers) {
  return [
    { label: 'Nơi tổ chức lễ viếng', show: a.venue === 'undecided', lock: false },
    { label: 'Hình thức: hỏa táng hay mai táng', show: a.form === 'undecided', lock: false },
    { label: 'Giờ khâm liệm, nhập quan', show: true, lock: true },
  ].filter(d => d.show);
}
