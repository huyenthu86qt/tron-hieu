// Bộ mẫu việc — chuyển từ bản mẫu đã khóa (prototype/ban-mau-dam-hieu.html).
// Không có người nhận, trạng thái hay dữ liệu hư cấu: đám hiếu mới bắt đầu trống.
// Hạn viết tương đối theo ngày mất: {d+N}. Xưng hô người mất: {p} / {P}.
// Nội dung phong tục, thủ tục sẽ được thay bằng nguồn đã kiểm chứng (U8) mà không đổi cấu trúc.
import type { TaskTemplate } from './types';

export const PHASES = [
  'Tiếp nhận tin & việc khẩn cấp', 'Lập đội & phân công', 'Quyết định gốc', 'Khâm liệm & nhập quan',
  'Lập bàn thờ & phát tang', 'Báo tin & cáo phó', 'Nhà cung cấp & hậu cần', 'Tiếp khách viếng', 'Lễ viếng',
  'Lễ truy điệu', 'Đưa tang', 'Hỏa táng / an táng', 'Thu dọn & hoàn trả', 'Thủ tục & quyền lợi',
  'Mốc tưởng niệm & khép vòng',
] as const;

const W_HOSP = 'Mất tại bệnh viện', W_CATH = 'Nghi lễ Công giáo', W_BUD = 'Nghi lễ Phật giáo', W_HOME = 'Làm lễ tại nhà riêng';
const W_BUR = 'Địa táng', W_CRE = 'Hỏa táng', W_HALL = 'Làm lễ tại nhà tang lễ';
const W_ORG = 'Có cơ quan, đơn vị đứng ra tổ chức', W_ORGR = 'Lễ tang theo nghi thức tổ chức', W_NONE = 'Không theo nghi lễ tôn giáo';
const W_COMM = 'Phối hợp địa phương tổ chức', W_COMMH = 'Phối hợp hội, đoàn thể địa phương';

export const TEMPLATES: TaskTemplate[] = [
  /* Chặng 1 — Tiếp nhận tin & việc khẩn cấp */
  { id: 't0', phase: 1, title: 'Nhận giấy báo tử tại bệnh viện', kind: 'cond', why: W_HOSP, area: 'Toàn bộ', due: '{d+0}', when: { place: 'hospital' }, unverified: true, urgent: true },
  { id: 'm1b', phase: 1, title: 'Liên hệ xe đưa {p} từ bệnh viện về nơi làm lễ', kind: 'cond', why: W_HOSP, area: 'Xe cộ', due: '{d+0}', when: { place: 'hospital' }, urgent: true },
  { id: 'p1a', phase: 1, title: 'Báo trạm y tế hoặc chính quyền địa phương để được hướng dẫn giấy báo tử', kind: 'cond', why: 'Mất tại nhà', area: 'Toàn bộ', due: '{d+0}', when: { place: 'home' }, unverified: true, urgent: true },
  { id: 'p1b', phase: 1, title: 'Liên hệ nơi {p} mất để được hướng dẫn thủ tục và đưa {p} về nơi làm lễ', kind: 'cond', why: 'Mất ở nơi khác', area: 'Toàn bộ', due: '{d+0}', when: { place: 'other' }, unverified: true, urgent: true },
  { id: 'm1c', phase: 1, title: 'Báo tin cho người thân gần nhất', kind: 'core', area: 'Liên lạc', due: '{d+0}', urgent: true },
  { id: 'm1d', phase: 1, title: 'Mời thầy cúng xem giờ khâm liệm, nhập quan', kind: 'core', area: 'Toàn bộ', due: '{d+0}', when: { rite: 'traditional' }, urgent: true },
  { id: 'c1d', phase: 1, title: 'Báo cha xứ và ban hành giáo của giáo xứ', kind: 'cond', why: W_CATH, area: 'Liên lạc', due: '{d+0}', when: { rite: 'catholic' }, urgent: true },
  { id: 'e1a', phase: 1, title: 'Dọn chỗ đặt linh cữu và bàn thờ tạm', kind: 'cond', why: W_HOME, area: 'Hậu cần', due: '{d+0}', when: { venue: 'home' }, urgent: true },
  { id: 'k1', phase: 1, title: 'Báo Ban công tác Mặt trận khu dân cư, tổ trưởng dân phố và bà con lối xóm', kind: 'cond', why: W_COMM, area: 'Liên lạc', due: '{d+0}', when: { comm: true }, urgent: true },

  /* Chặng 2 — Lập đội & phân công */
  { id: 'm2a', phase: 2, title: 'Xác lập người đại diện gia đình', kind: 'core', area: 'Toàn bộ', due: '{d+0}', go: 'ho-so' },
  { id: 'm2b', phase: 2, title: 'Chia vùng trách nhiệm cho các con', kind: 'core', area: 'Toàn bộ', due: '{d+0}', go: 'doi' },
  { id: 'm2c', phase: 2, title: 'Nhờ tổ dân phố, hàng xóm hỗ trợ dựng rạp, tiếp khách', kind: 'cond', why: W_HOME, area: 'Hậu cần', due: 'Sáng {d+1}', when: { venue: 'home' } },
  { id: 'o2a', phase: 2, title: 'Liên hệ cơ quan, đơn vị để lập Ban lễ tang', kind: 'cond', why: W_ORG, area: 'Liên lạc', due: '{d+0}', when: { blt: true }, urgent: true },
  { id: 'o2b', phase: 2, title: 'Thống nhất phân việc giữa gia đình và Ban lễ tang', kind: 'cond', why: W_ORG, area: 'Toàn bộ', due: 'Trong ngày {d+1}', when: { blt: true }, urgent: true },
  { id: 'k2', phase: 2, title: 'Thống nhất với Ban công tác Mặt trận, UBND xã về thời gian, địa điểm, quy mô', kind: 'cond', why: W_COMM, area: 'Toàn bộ', due: 'Trong ngày {d+1}', when: { comm: true }, unverified: true, urgent: true },

  /* Chặng 3 — Quyết định gốc */
  { id: 'm3a', phase: 3, title: 'Chốt nơi tổ chức lễ viếng', kind: 'core', area: 'Toàn bộ', due: '{d+0}', decision: 'venue', go: 'can-quyet' },
  { id: 'm3b', phase: 3, title: 'Chốt hình thức an táng', kind: 'core', area: 'Toàn bộ', due: '{d+0}', decision: 'form', go: 'can-quyet' },
  { id: 'b3a', phase: 3, title: 'Chọn nơi an táng: nghĩa trang, đất gia đình hoặc khu mộ dòng họ', kind: 'cond', why: W_BUR, area: 'Toàn bộ', due: 'Trước 12:00 ngày {d+2}', when: { form: 'burial' }, urgent: true },
  { id: 'm3c', phase: 3, title: 'Chốt giờ hỏa táng', kind: 'cond', why: W_CRE, area: 'Toàn bộ', due: 'Trước 12:00 ngày {d+2}', lock: true, decision: 'time', when: { form: 'cremation' }, urgent: true },
  { id: 'b3c', phase: 3, title: 'Chốt giờ hạ huyệt', kind: 'cond', why: W_BUR, area: 'Toàn bộ', due: 'Trước 12:00 ngày {d+2}', lock: true, decision: 'time', when: { form: 'burial' }, urgent: true },
  { id: 'm3d', phase: 3, title: 'Dự trù ngân sách', kind: 'core', area: 'Tài chính', due: '{d+1}' },
  { id: 'c3a', phase: 3, title: 'Thống nhất với cha xứ giờ Thánh lễ an táng', kind: 'cond', why: W_CATH, area: 'Liên lạc', due: 'Trước 12:00 ngày {d+2}', when: { rite: 'catholic' }, urgent: true },
  { id: 'o3a', phase: 3, title: 'Ban lễ tang chốt lịch lễ và nghi thức', kind: 'cond', why: W_ORGR, area: 'Nghi thức', due: 'Trước 12:00 ngày {d+2}', when: { blt: true }, byOrg: true, decision: 'org' },

  /* Chặng 4 — Khâm liệm & nhập quan */
  { id: 'm4a', phase: 4, title: 'Tắm rửa, thay áo cho {p} (mộc dục)', kind: 'core', area: 'Toàn bộ', due: 'Sáng {d+1}' },
  { id: 'm4b', phase: 4, title: 'Chuẩn bị áo quan và đồ khâm liệm', kind: 'core', area: 'Nhà cung cấp', due: 'Trưa {d+1}' },
  { id: 'm4c', phase: 4, title: 'Đặt đồ tùy táng theo nguyện vọng', kind: 'cond', why: 'Có nguyện vọng trong hồ sơ chuẩn bị', area: 'Hậu cần', due: 'Trước giờ nhập quan', when: { pre: true } },
  {
    id: 't1', phase: 4, title: 'Nhập quan (khâm liệm, đóng nắp quan)', kind: 'core', area: 'Toàn bộ', due: 'Theo giờ đã xem, ngày {d+1}',
    lock: true, deps: ['m1d', 'c1d', 'm4a', 'm4b', 'm4c'], urgent: true,
    note: 'Giờ nhập quan theo giờ đã xem với thầy cúng.', noteC: 'Giờ nhập quan theo giờ đã thống nhất với cha xứ.', noteN: 'Giờ nhập quan do Ban lễ tang thông báo.',
    steps: ['Thầy cúng có mặt trước giờ nhập quan', 'Con cháu có mặt đủ để nhìn mặt {p} lần cuối', 'Đồ tùy táng đã đặt đủ theo nguyện vọng', 'Chuẩn bị hương, nến, đèn dầu cho lễ nhập quan'],
    stepsC: ['Ban hành giáo có mặt đọc kinh trước khi nhập quan', 'Con cháu có mặt đủ để nhìn mặt {p} lần cuối', 'Đặt thánh giá, tràng hạt theo nguyện vọng', 'Chuẩn bị nến, hoa trên bàn thờ Chúa'],
    stepsN: ['Đại diện Ban lễ tang có mặt dự lễ nhập quan', 'Con cháu có mặt đủ để nhìn mặt {p} lần cuối', 'Đồ theo nguyện vọng đã đặt đủ', 'Chuẩn bị hoa, nến'],
    lockText: 'Sau khi đóng nắp quan, gia đình không còn nhìn mặt, thay áo hay đặt thêm đồ cho {p} được nữa.',
    checks: ['Người thân ở xa đã kịp về nhìn mặt {p} lần cuối', 'Đồ tùy táng theo nguyện vọng đã đặt đủ', 'Ảnh tư liệu gia đình muốn giữ đã chụp'],
  },

  /* Chặng 5 — Lập bàn thờ & phát tang */
  { id: 't2', phase: 5, title: 'Chuẩn bị ảnh thờ và bàn thờ', kind: 'core', area: 'Hậu cần', due: 'Trước 18:00 ngày {d+1}', urgent: true },
  { id: 't8', phase: 5, title: 'Chuẩn bị tang phục, khăn tang cho con cháu', kind: 'core', area: 'Hậu cần', due: 'Trước lễ phát tang tối {d+1}', urgent: true },
  { id: 'm5b', phase: 5, title: 'Lễ thành phục (phát tang) — mời thầy cúng làm lễ', kind: 'core', area: 'Toàn bộ', due: 'Sau nhập quan, tối {d+1}', deps: ['t1', 't8'], when: { rite: 'traditional' } },
  { id: 'c5b', phase: 5, title: 'Lập bàn thờ Chúa, đọc kinh cầu hồn đầu tiên', kind: 'cond', why: W_CATH, area: 'Toàn bộ', due: 'Sau nhập quan, tối {d+1}', deps: ['t1'], when: { rite: 'catholic' } },
  { id: 'n5a', phase: 5, title: 'Lễ phát tang theo nghi lễ do Ban lễ tang chủ trì', kind: 'cond', why: W_NONE, area: 'Nghi thức', due: 'Sau nhập quan, tối {d+1}', deps: ['t1'], when: { rite: 'none' }, byOrg: true },
  { id: 'm5d', phase: 5, title: 'Mời sư thầy tụng kinh cầu siêu', kind: 'cond', why: W_BUD, area: 'Liên lạc', due: 'Ngày {d+2}', when: { rite: 'traditional' } },
  { id: 'c5d', phase: 5, title: 'Đăng ký với giáo xứ: hội đoàn, ca đoàn đọc kinh luân phiên', kind: 'cond', why: W_CATH, area: 'Liên lạc', due: 'Ngày {d+2}', when: { rite: 'catholic' } },

  /* Chặng 6 — Báo tin & cáo phó */
  { id: 't3', phase: 6, title: 'Báo tin cho họ hàng bên nội', kind: 'core', area: 'Liên lạc', due: 'Trong ngày {d+1}', urgent: true },
  { id: 't11', phase: 6, title: 'Báo tin cho họ hàng bên ngoại', kind: 'core', area: 'Liên lạc', due: 'Trong ngày {d+1}', urgent: true },
  { id: 't12', phase: 6, title: 'Báo tin cho cơ quan, đoàn thể nơi {p} từng công tác, sinh hoạt', kind: 'core', area: 'Liên lạc', due: 'Trong ngày {d+1}', note: 'Để cơ quan, đoàn thể kịp cử đoàn đến viếng và gửi vòng hoa.', urgent: true },
  { id: 't13', phase: 6, title: 'Báo tin cho tổ dân phố và bà con lối xóm', kind: 'core', area: 'Liên lạc', due: 'Trong ngày {d+1}', note: 'Nhờ tổ trưởng thông báo giúp; bà con lối xóm thường sang giúp dựng rạp, tiếp khách.', when: { noComm: true }, urgent: true },
  { id: 'm6a', phase: 6, title: 'Soạn và công bố trang thông tin cho khách', kind: 'core', area: 'Liên lạc', due: 'Trong ngày {d+1}', go: 'khach-vieng/trang-tin' },
  { id: 'm6b', phase: 6, title: 'Đăng cáo phó trên báo hoặc đài phát thanh phường', kind: 'opt', area: 'Liên lạc', due: 'Ngày {d+2}', when: { noBLT: true } },
  { id: 'o6a', phase: 6, title: 'Ban lễ tang phát hành cáo phó, thông báo chính thức', kind: 'cond', why: W_ORGR, area: 'Cáo phó', due: 'Ngày {d+2}', when: { blt: true }, byOrg: true },
  { id: 'k3', phase: 6, title: 'Mời Hội Người cao tuổi, Hội Cựu chiến binh (nếu {p} là hội viên) cử đại diện viếng, tiễn đưa', kind: 'cond', why: W_COMMH, area: 'Liên lạc', due: 'Ngày {d+2}', when: { comm: true } },

  /* Chặng 7 — Nhà cung cấp & hậu cần */
  { id: 'h7a', phase: 7, title: 'Đặt phòng lễ và giờ thuê tại nhà tang lễ', kind: 'cond', why: W_HALL, area: 'Nhà cung cấp', due: 'Trong ngày {d+1}', when: { venue: 'hall' }, urgent: true },
  { id: 'h7b', phase: 7, title: 'Nắm quy định của nhà tang lễ: giờ viếng, âm nhạc, vòng hoa, đồ cúng', kind: 'cond', why: W_HALL, area: 'Hậu cần', due: 'Ngày {d+2}', when: { venue: 'hall' }, unverified: true },
  { id: 't5', phase: 7, title: 'Thuê rạp, bàn ghế', kind: 'cond', why: W_HOME, area: 'Nhà cung cấp', due: 'Dựng xong trước 17:00 ngày {d+1}', when: { venue: 'home' }, cat: 'rap' },
  { id: 't6', phase: 7, title: 'Đặt xe tang', kind: 'core', area: 'Xe cộ', due: 'Trong ngày {d+1}', cat: 'xe' },
  { id: 't9', phase: 7, title: 'Mượn thêm ghế ở nhà văn hóa tổ dân phố', kind: 'cond', why: 'Quy mô vừa trở lên, làm lễ tại nhà', area: 'Hậu cần', due: '17:00 ngày {d+1}', when: { venue: 'home', scale: ['medium', 'large'] } },
  { id: 'm7d', phase: 7, title: 'Đặt hoa và vòng hoa', kind: 'core', area: 'Nhà cung cấp', due: 'Trước 8:00 ngày {d+2}', cat: 'hoa' },
  { id: 'm7e', phase: 7, title: 'Đặt cỗ cho họ hàng và người giúp việc tang', kind: 'cond', why: 'Quy mô vừa trở lên', area: 'Nhà cung cấp', due: 'Ngày {d+2}', when: { scale: ['medium', 'large'] }, cat: 'an' },
  { id: 'b7a', phase: 7, title: 'Đặt thợ đào huyệt, xây mộ tạm', kind: 'cond', why: W_BUR, area: 'Nhà cung cấp', due: 'Trước {d+3}', when: { form: 'burial' }, cat: 'mo' },
  { id: 'm7f', phase: 7, title: 'Thuê loa đài, đèn chiếu sáng cho rạp', kind: 'opt', area: 'Hậu cần', due: 'Ngày {d+2}', when: { venue: 'home' } },
  { id: 'k4', phase: 7, title: 'Thực hiện theo quy ước nếp sống văn minh của địa phương: giờ nhạc tang, dựng rạp, vệ sinh', kind: 'cond', why: 'Tổ chức theo nếp sống văn minh', area: 'Hậu cần', due: 'Trong suốt tang lễ', when: { comm: true }, unverified: true },

  /* Chặng 8 — Tiếp khách viếng */
  { id: 't7', phase: 8, title: 'Mời đội nhạc lễ', kind: 'opt', area: 'Nhà cung cấp', due: 'Trước lễ viếng', cat: 'nhac' },
  { id: 'm8b', phase: 8, title: 'Phân ca trực tiếp khách và ghi sổ phúng viếng', kind: 'core', area: 'Khách / Phúng viếng', due: 'Trước 8:00 ngày {d+2}', go: 'khach-vieng' },
  { id: 'm8c', phase: 8, title: 'Chuẩn bị nước, trà, trầu cau tiếp khách', kind: 'core', area: 'Hậu cần', due: 'Ngày {d+2}' },
  { id: 'm8d', phase: 8, title: 'Chuẩn bị khăn tang cho khách là họ hàng thân', kind: 'opt', area: 'Hậu cần', due: 'Ngày {d+2}' },
  { id: 'l8a', phase: 8, title: 'Bố trí người đón tiếp, hướng dẫn đoàn đông và chỗ gửi xe', kind: 'cond', why: 'Quy mô lớn', area: 'Khách / Phúng viếng', due: 'Ngày {d+2}', when: { scale: ['large'] } },

  /* Chặng 9 — Lễ viếng */
  { id: 'm9a', phase: 9, title: 'Sắp xếp thứ tự đoàn viếng của cơ quan, đoàn thể', kind: 'cond', why: 'Có đoàn cơ quan, đoàn thể', area: 'Khách / Phúng viếng', due: '{d+2} – {d+3}', when: { noBLT: true } },
  { id: 'm9b', phase: 9, title: 'Cử người đứng chịu tang, đáp lễ khách', kind: 'core', area: 'Toàn bộ', due: '{d+2} – {d+3}' },
  { id: 'm9c', phase: 9, title: 'Trực đêm canh linh cữu, giữ hương đèn', kind: 'core', area: 'Hậu cần', due: 'Đêm {d+2} và {d+3}', when: { rite: 'traditional' } },
  { id: 'm9c2', phase: 9, title: 'Trực đêm canh linh cữu, giữ nến sáng', kind: 'core', area: 'Hậu cần', due: 'Đêm {d+2} và {d+3}', when: { rite: ['catholic', 'none'] } },
  { id: 'o9a', phase: 9, title: 'Đón đoàn viếng của cơ quan, đơn vị theo thứ tự Ban lễ tang sắp xếp', kind: 'cond', why: W_ORGR, area: 'Nghi thức', due: '{d+2} – {d+3}', when: { blt: true }, byOrg: true },
  { id: 'o9b', phase: 9, title: 'Đội túc trực bên linh cữu do cơ quan, đơn vị cử', kind: 'cond', why: 'Lễ tang theo nghi lễ cán bộ / quân nhân', area: 'Nghi thức', due: '{d+2} – {d+3}', when: { blt: true }, byOrg: true },

  /* Chặng 10 — Lễ truy điệu */
  { id: 'm10a', phase: 10, title: 'Soạn tiểu sử của {p} (gửi người đọc điếu văn)', kind: 'core', area: 'Toàn bộ', due: 'Trước {d+3}' },
  { id: 'm10b', phase: 10, title: 'Mời người đọc điếu văn', kind: 'core', area: 'Liên lạc', due: 'Trước {d+3}', when: { noOrg: true } },
  { id: 'k5', phase: 10, title: 'Mời đại diện hội, đoàn thể đọc lời tiễn biệt, điếu văn', kind: 'cond', why: W_COMMH, area: 'Liên lạc', due: 'Trước {d+3}', when: { comm: true } },
  { id: 'm10c', phase: 10, title: 'Chuẩn bị lễ vật cúng trước giờ đưa tang', kind: 'core', area: 'Hậu cần', due: 'Sáng {d+4}', when: { rite: 'traditional' } },
  { id: 'c10a', phase: 10, title: 'Thánh lễ an táng tại nhà thờ giáo xứ', kind: 'cond', why: W_CATH, area: 'Toàn bộ', due: 'Sáng {d+4}', deps: ['c3a'], when: { rite: 'catholic' } },
  { id: 'o10a', phase: 10, title: 'Điếu văn do đại diện đơn vị đọc', kind: 'cond', why: W_ORGR, area: 'Nghi thức', due: 'Lễ truy điệu', when: { blt: true }, byOrg: true },
  { id: 'o10b', phase: 10, title: 'Nghi thức của đơn vị: đội danh dự; phủ quốc kỳ nếu thuộc đối tượng theo quy định', kind: 'cond', why: W_ORGR, area: 'Nghi thức', due: 'Lễ truy điệu', when: { blt: true }, byOrg: true, unverified: true },

  /* Chặng 11 — Đưa tang */
  { id: 'm11a', phase: 11, title: 'Xếp thứ tự đoàn đưa tang: người bưng ảnh, bát hương, con cháu', kind: 'core', area: 'Toàn bộ', due: 'Sáng {d+4}', when: { rite: 'traditional' } },
  { id: 'c11a', phase: 11, title: 'Xếp đoàn đưa tang: thánh giá dẫn đầu, ảnh, con cháu, ca đoàn', kind: 'cond', why: W_CATH, area: 'Toàn bộ', due: 'Sáng {d+4}', when: { rite: 'catholic' } },
  { id: 'n11a', phase: 11, title: 'Xếp đoàn đưa tang theo nghi thức: đội danh dự, di ảnh, huân huy chương (nếu có), gia đình', kind: 'cond', why: W_NONE, area: 'Nghi thức', due: 'Sáng {d+4}', when: { rite: 'none' }, byOrg: true },
  { id: 'm11b', phase: 11, title: 'Bố trí xe đưa gia đình và khách thân', kind: 'core', area: 'Xe cộ', due: 'Sáng {d+4}', cat: 'xe' },
  { id: 'b11a', phase: 11, title: 'Bố trí người khiêng linh cữu ra huyệt', kind: 'cond', why: W_BUR, area: 'Hậu cần', due: 'Sáng {d+4}', when: { form: 'burial' } },

  /* Chặng 12 — Hỏa táng / an táng */
  {
    id: 't4', phase: 12, title: 'Đăng ký giờ hỏa táng', kind: 'cond', why: W_CRE, area: 'Nhà cung cấp', due: 'Trước 12:00 ngày {d+2}', lock: true, decision: 'time', when: { form: 'cremation' },
    lockText: 'Sau khi đăng ký, đổi giờ hỏa táng có thể không còn chỗ và kéo theo đổi lịch đưa tang, xe, thông báo cho khách.',
    checks: ['Đã đối chiếu giờ với nhà xe và thầy cúng', 'Giấy tờ mang theo đã chuẩn bị đủ', 'Gia đình đã thống nhất giờ'],
  },
  { id: 'm12b', phase: 12, title: 'Chuẩn bị giấy tờ mang theo khi hỏa táng', kind: 'cond', why: W_CRE, area: 'Xe cộ', due: 'Trước {d+4}', when: { form: 'cremation' }, unverified: true },
  { id: 'm12c', phase: 12, title: 'Nhận tro cốt, đưa về nơi thờ hoặc nơi lưu tro', kind: 'cond', why: W_CRE, area: 'Toàn bộ', due: '{d+4}', deps: ['t4'], when: { form: 'cremation' } },
  { id: 'b12a', phase: 12, title: 'Làm thủ tục chôn cất với ban quản lý nghĩa trang', kind: 'cond', why: W_BUR, area: 'Nhà cung cấp', due: 'Trước 12:00 ngày {d+2}', decision: 'time', deps: ['b3a'], when: { form: 'burial' }, unverified: true },
  { id: 'b12b', phase: 12, title: 'Đào huyệt theo vị trí và giờ đã thống nhất', kind: 'cond', why: W_BUR, area: 'Hậu cần', due: 'Chiều {d+3}', deps: ['b12a', 'b7a'], when: { form: 'burial' }, cat: 'mo' },
  {
    id: 'b12c', phase: 12, title: 'Lễ hạ huyệt', kind: 'cond', why: W_BUR, area: 'Toàn bộ', due: 'Theo giờ đã chốt', lock: true, deps: ['b12b'], when: { form: 'burial' },
    lockText: 'Sau khi hạ huyệt và lấp đất, không thể mở lại.',
    checks: ['Đúng giờ và hướng thầy cúng đã xem', 'Con cháu có mặt đủ để tiễn đưa', 'Đồ theo nguyện vọng đã đặt đủ'],
    checksC: ['Đúng giờ đã thống nhất với cha xứ', 'Con cháu có mặt đủ để tiễn đưa', 'Thánh giá, bia tạm đã chuẩn bị'],
    checksN: ['Đúng giờ Ban lễ tang đã thông báo', 'Con cháu có mặt đủ để tiễn đưa', 'Bia tạm đã chuẩn bị'],
    steps: ['Thầy cúng làm lễ trước khi hạ huyệt', 'Con cháu mỗi người bỏ một nắm đất', 'Chuẩn bị hương, hoa, đèn tại mộ'],
    stepsC: ['Linh mục hoặc ban hành giáo làm phép huyệt, đọc kinh', 'Con cháu mỗi người bỏ một nắm đất', 'Chuẩn bị nến, hoa tại mộ'],
    stepsN: ['Ban lễ tang chủ trì lễ hạ huyệt', 'Con cháu mỗi người bỏ một nắm đất', 'Đặt vòng hoa của đơn vị, gia đình'],
  },
  { id: 'b12d', phase: 12, title: 'Đắp mộ, xây mộ tạm, dựng bia tạm', kind: 'cond', why: W_BUR, area: 'Hậu cần', due: '{d+4}', deps: ['b12c'], when: { form: 'burial' }, cat: 'mo' },

  /* Chặng 13 — Thu dọn & hoàn trả */
  { id: 'm13a', phase: 13, title: 'Trả rạp, bàn ghế và đồ đã mượn', kind: 'cond', why: W_HOME, area: 'Hậu cần', due: '{d+5}', when: { venue: 'home' } },
  { id: 'h13a', phase: 13, title: 'Thanh toán, trả phòng lễ và nhận lại đồ tại nhà tang lễ', kind: 'cond', why: W_HALL, area: 'Hậu cần', due: '{d+4}', when: { venue: 'hall' } },
  { id: 'm13b', phase: 13, title: 'Cảm ơn khách đã đến viếng — theo danh sách của từng người', kind: 'core', area: 'Hậu tang', due: 'Tuần đầu sau tang', go: 'hau-tang/cam-on' },
  { id: 'm13c', phase: 13, title: 'Lễ cúng ba ngày', kind: 'opt', area: 'Hậu tang', due: 'Theo giờ thầy cúng xem', when: { form: 'cremation', rite: 'traditional' } },
  { id: 'b13c', phase: 13, title: 'Lễ viếng mộ ba ngày (mở cửa mả)', kind: 'cond', why: W_BUR, area: 'Hậu tang', due: 'Ngày thứ ba sau an táng', when: { form: 'burial', rite: 'traditional' } },
  { id: 'c13a', phase: 13, title: 'Xin lễ cầu hồn và đọc kinh cầu nguyện sau an táng', kind: 'cond', why: W_CATH, area: 'Hậu tang', due: 'Tuần đầu sau tang', when: { rite: 'catholic' } },
  { id: 'm13d', phase: 13, title: 'Chuyển bàn thờ tạm sang bàn thờ vong theo nghi lễ gia đình', kind: 'core', area: 'Hậu tang', due: 'Sau an táng', when: { rite: 'traditional' } },
  { id: 'c13b', phase: 13, title: 'Sắp xếp lại bàn thờ Chúa và di ảnh tại nhà', kind: 'cond', why: W_CATH, area: 'Hậu tang', due: 'Sau an táng', when: { rite: 'catholic' } },
  { id: 'n13b', phase: 13, title: 'Đặt di ảnh, bàn thờ tại nhà theo nếp gia đình', kind: 'core', area: 'Hậu tang', due: 'Sau an táng', when: { rite: 'none' } },
  { id: 'm13e', phase: 13, title: 'Đăng lời cảm ơn trên trang thông tin cho khách', kind: 'opt', area: 'Liên lạc', due: 'Tuần đầu sau tang', go: 'khach-vieng/trang-tin' },

  /* Chặng 14 — Thủ tục & quyền lợi */
  { id: 'm14a', phase: 14, title: 'Đăng ký khai tử', kind: 'core', area: 'Hậu tang', due: 'Sau tang', unverified: true },
  { id: 'm14b', phase: 14, title: 'Chế độ, quyền lợi liên quan (nếu có)', kind: 'opt', area: 'Hậu tang', due: 'Sau tang', unverified: true },
  { id: 'o14a', phase: 14, title: 'Làm hồ sơ chế độ tử tuất, mai táng phí với cơ quan, đơn vị', kind: 'cond', why: W_ORG, area: 'Tài chính', due: 'Sau tang', when: { blt: true }, unverified: true },
  { id: 'm14c', phase: 14, title: 'Đối soát và khóa tài chính', kind: 'core', area: 'Tài chính', due: 'Trước {d+11}', go: 'tai-chinh/doi-soat' },

  /* Chặng 15 — Mốc tưởng niệm & khép vòng */
  { id: 'm15a', phase: 15, title: 'Chọn mốc tưởng niệm gia đình muốn theo dõi', kind: 'core', area: 'Hậu tang', due: 'Sau tang', go: 'hau-tang/moc' },
  { id: 'm15b', phase: 15, title: 'Chuẩn bị lễ 49 ngày', kind: 'opt', area: 'Hậu tang', due: 'Theo mốc đã chọn', when: { rite: 'traditional' } },
  { id: 'm15c', phase: 15, title: 'Chuẩn bị lễ 100 ngày', kind: 'opt', area: 'Hậu tang', due: 'Theo mốc đã chọn', when: { rite: 'traditional' } },
  { id: 'c15a', phase: 15, title: 'Lễ cầu hồn theo nếp giáo xứ (7 ngày, 30 ngày…)', kind: 'opt', area: 'Hậu tang', due: 'Theo mốc đã chọn', when: { rite: 'catholic' } },
  { id: 'b15a', phase: 15, title: 'Dự trù xây mộ kiên cố', kind: 'opt', area: 'Hậu tang', due: 'Theo thời điểm gia đình chọn', when: { form: 'burial' } },
  { id: 'b15b', phase: 15, title: 'Cải táng (sang cát) — tùy phong tục vùng miền', kind: 'opt', area: 'Hậu tang', due: 'Chuyển sang lịch dài hạn', when: { form: 'burial' } },
  { id: 'm15d', phase: 15, title: 'Khép phần tức thời', kind: 'core', area: 'Toàn bộ', due: 'Khi đủ điều kiện', go: 'hau-tang/khep-vong' },
];

export const TEMPLATE_BY_ID: Record<string, TaskTemplate> = Object.fromEntries(TEMPLATES.map(t => [t.id, t]));

export const DEFAULT_AREAS = ['Hậu cần', 'Tài chính', 'Khách / Phúng viếng', 'Liên lạc', 'Xe cộ', 'Nhà cung cấp', 'Hậu tang'];
