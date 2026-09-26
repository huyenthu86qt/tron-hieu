// Hướng dẫn thủ tục có căn cứ pháp lý (Chủ dự án yêu cầu bám chặt văn bản hiện hành, có trích dẫn).
// Rà soát ngày 26/09/2026. Khi văn bản thay đổi: sửa ở đây và cập nhật REVIEWED.

export interface LegalPoint { text: string; cite: string }
export interface LegalSource { label: string; url: string }
export interface LegalGuide {
  title: string;
  reviewed: string;
  points: LegalPoint[];
  steps: string[];
  upcoming?: string;
  sources: LegalSource[];
}

export const KHAI_TU: LegalGuide = {
  title: 'Đăng ký khai tử',
  reviewed: '26/09/2026',
  points: [
    { text: 'Người đi khai tử: vợ, chồng hoặc con, cha, mẹ hoặc người thân thích khác của người mất.', cite: 'Điều 33 Luật Hộ tịch 2014 (Luật số 60/2014/QH13)' },
    { text: 'Thời hạn: trong 15 ngày kể từ ngày có người mất.', cite: 'Điều 33 Luật Hộ tịch 2014' },
    { text: 'Nơi đăng ký: Ủy ban nhân dân cấp xã (xã, phường, đặc khu) nơi cư trú cuối cùng của người mất. Nếu không xác định được nơi cư trú cuối cùng thì Ủy ban nhân dân cấp xã nơi người đó mất hoặc nơi phát hiện thi thể.', cite: 'Điều 32 Luật Hộ tịch 2014' },
    { text: 'Từ 01/7/2025, người dân có thể nộp tại Ủy ban nhân dân cấp xã khác; nơi tiếp nhận có trách nhiệm hỗ trợ nộp hồ sơ trực tuyến tới đúng cơ quan có thẩm quyền.', cite: 'Nghị định 120/2025/NĐ-CP (hiệu lực 01/7/2025)' },
    { text: 'Giấy tờ nộp: Tờ khai theo mẫu và Giấy báo tử hoặc giấy tờ khác thay Giấy báo tử.', cite: 'Điều 34 Luật Hộ tịch 2014' },
    { text: 'Ai cấp Giấy báo tử: mất tại cơ sở y tế — Thủ trưởng cơ sở y tế cấp; mất trên phương tiện giao thông, do tai nạn, bị giết, đột ngột hoặc có nghi vấn — văn bản xác nhận của cơ quan công an hoặc kết quả giám định pháp y thay Giấy báo tử; các trường hợp khác (như mất tại nhà) — Ủy ban nhân dân cấp xã nơi người đó mất cấp Giấy báo tử.', cite: 'Khoản 2 Điều 4 Nghị định 123/2015/NĐ-CP (điểm a, d, đ)' },
    { text: 'Kết quả: nếu việc khai tử đúng, công chức tư pháp – hộ tịch ghi vào Sổ hộ tịch, cùng người đi khai ký tên, và Chủ tịch Ủy ban nhân dân cấp xã cấp Trích lục khai tử cho người đi khai.', cite: 'Điều 34 Luật Hộ tịch 2014' },
    { text: 'Lệ phí: miễn lệ phí khi đăng ký khai tử đúng hạn. Yêu cầu cấp bản sao trích lục hộ tịch thì phải nộp phí.', cite: 'Điều 11 Luật Hộ tịch 2014' },
    { text: 'Có thể làm trực tuyến trên Cổng Dịch vụ công quốc gia hoặc ứng dụng VNeID theo nhóm liên thông: đăng ký khai tử – xóa đăng ký thường trú – giải quyết mai táng phí, tử tuất.', cite: 'Nghị định 63/2024/NĐ-CP (hiệu lực 01/7/2024)' },
  ],
  steps: [
    'Nhận Giấy báo tử (bệnh viện cấp nếu mất tại cơ sở y tế; mất tại nhà thì Ủy ban nhân dân xã/phường nơi người mất cấp)',
    'Mang Giấy báo tử và căn cước của người đi khai tới Ủy ban nhân dân xã/phường nơi người mất cư trú cuối cùng — hoặc nộp trực tuyến trên Cổng Dịch vụ công / VNeID',
    'Điền Tờ khai đăng ký khai tử, ký vào Sổ hộ tịch cùng cán bộ tư pháp – hộ tịch',
    'Nhận Trích lục khai tử; xin thêm bản sao nếu cần cho thừa kế, ngân hàng, bảo hiểm xã hội',
    'Chụp Trích lục khai tử, lưu vào mục “Tài liệu kết quả” của Hậu tang',
  ],
  upcoming: 'Luật Hộ tịch số 03/2026/QH16 có hiệu lực từ 01/3/2027: đăng ký hộ tịch không phụ thuộc nơi cư trú; khai tử “chủ động” từ dữ liệu y tế theo lộ trình, chậm nhất từ 01/01/2031. Trọn Hiếu sẽ cập nhật hướng dẫn khi luật mới có hiệu lực.',
  sources: [
    { label: 'Luật Hộ tịch 2014 (60/2014/QH13) — Cơ sở dữ liệu quốc gia về văn bản pháp luật', url: 'https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=46746' },
    { label: 'Nghị định 123/2015/NĐ-CP — Cổng Thông tin điện tử Chính phủ', url: 'https://vanban.chinhphu.vn/?pageid=27160&docid=182158' },
    { label: 'Nghị định 120/2025/NĐ-CP — Xây dựng chính sách, pháp luật (Chính phủ)', url: 'https://xaydungchinhsach.chinhphu.vn/nghi-dinh-120-2025-nd-cp-trinh-tu-thu-tuc-dang-ky-ho-tich-tai-ubnd-cap-xa-119250612132316605.htm' },
    { label: 'Nghị định 63/2024/NĐ-CP — Cổng Thông tin điện tử Chính phủ', url: 'https://vanban.chinhphu.vn/?docid=210359&pageid=27160' },
    { label: 'Luật Hộ tịch số 03/2026/QH16 (toàn văn) — Xây dựng chính sách, pháp luật', url: 'https://xaydungchinhsach.chinhphu.vn/toan-van-luat-ho-tich-so-03-2026-qh16-119260527163142286.htm' },
  ],
};

export const GUIDES = { 'khai-tu': KHAI_TU } as const;
export type GuideKey = keyof typeof GUIDES;
