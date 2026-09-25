# PRODUCT EXPERIENCE SPEC — APP ĐÁM HIẾU

**Trạng thái:** **ĐÃ KHÓA** — Chủ dự án gõ `LOCK_PRODUCT_EXPERIENCE` ngày 2026-09-25. Mọi thay đổi sau đây phải hủy khóa và khóa lại rõ ràng.
**Ngày:** 2026-09-25
**Bản mẫu chuẩn:** https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp (phiên bản 21)

---

## Product Structure Lock Reference

- **Khóa cấu trúc:** LOCK_PRODUCT_STRUCTURE **v2** — `Kien-truc-san-pham-cuoi-App-Dam-Hieu.md`, gồm các làm rõ ở mục 1.3 và 6.10.
- **V1:** Chuẩn bị trước · Khởi động & Hồ sơ · Bản đồ · Quyết định & Duyệt · Đội & Điều phối · Nhà cung cấp (gợi ý đúng + gần nhất, trọn gói, nhà cung cấp gia đình) · Tài chính · Khách viếng & Truyền tin · Hậu tang & Khép vòng.
- **Later:** Tưởng niệm nâng cao · booking / so sánh báo giá / đánh giá nhà cung cấp.
- **Out:** Marketplace mở · nhà cung cấp tự đăng ký · app tự gán nhà cung cấp · app nhận hay chuyển tiền · chatbot trung tâm · mạng xã hội tang lễ.
- **Nhật ký duyệt:** `Nhat-ky-duyet-ban-mau-App-Dam-Hieu.md` — không có thay đổi vượt phạm vi.

## Approved Screen Inventory

**102 chức năng trên 72 màn**, chi tiết tại Kế hoạch bản mẫu (mục 4 và 14b). Màn HF đã duyệt trên bản mẫu:

| Nhóm | Màn HF (Screen ID · route) |
|---|---|
| Cửa vào & hồ sơ | S-ENT-01 `/` · S-ENT-02 `/bat-dau/hoan-canh` · S-ENT-03 `/bat-dau/viec-ngay` · S-ENT-06 `/dh/:id/ho-so` · S-ENT-07 `/dh/:id/tiep-nhan` |
| Bản đồ | S-MAP-01 `/dh/:id` · S-MAP-02 `/dh/:id/ban-do` · S-MAP-04 `/dh/:id/viec/:tid` · S-MAP-05 (sheet) · S-MAP-07 (sheet) |
| Quyết định | S-DEC-01 `/dh/:id/can-quyet` · S-DEC-02 `/dh/:id/quyet-dinh/:did` (+ biến thể nhà cung cấp, Ban lễ tang) · S-DEC-03 `…/thay-doi` |
| Đội | S-TEAM-01 `/dh/:id/doi` · S-TEAM-02/03/04/08 (sheet) · S-TEAM-06 `/l/:token` |
| Nhà cung cấp | S-VEN-01 `/dh/:id/nha-cung-cap` · S-VEN-02 `…/goi-y/:hm` · S-VEN-03 `…/:vid` · S-VEN-04 (sheet) · sheet chọn trọn gói |
| Admin | S-ADM-01 `/admin/nha-cung-cap` · S-ADM-02 `/admin/nha-cung-cap/:id` |
| Tài chính | S-FIN-01 `/dh/:id/tai-chinh` · S-FIN-03 (sheet) · S-FIN-06 `…/phung-vieng` · S-FIN-07 `…/doi-soat` |
| Khách viếng | S-GST-01 `/dh/:id/khach-vieng` · S-GST-02 `…/trang-tin` · S-GST-03 `/t/:slug` · S-GST-05 (sheet) |
| Hậu tang | S-AFT-01 `/dh/:id/hau-tang` · S-AFT-03 `…/moc` · S-AFT-05 `…/cam-on` · S-AFT-06 `…/khep-vong` |
| Chuẩn bị trước | S-PRE-03 `/chuan-bi/:id` · S-PRE-04 `…/nguyen-vong` · S-PRE-09 `…/kich-hoat` |

Các màn còn lại build theo pattern gốc (P-LIST, P-TABLE, P-FORM, P-SHEET-FORM, P-DOCS, P-SHARE, P-CONFIRM) và đặc tả trong kế hoạch.

## Flow Map

```text
CỬA VÀO B (đã xảy ra)                       CỬA VÀO A (chuẩn bị trước)
S-ENT-01 → S-ENT-02 (hoàn cảnh)             S-PRE-03 → S-PRE-04 … → S-PRE-09 (kích hoạt)
   → S-ENT-03 (việc ngay)                         → S-ENT-07 (xác nhận dữ liệu)
   → S-ENT-06 (hồ sơ người mất, nếu chưa có) ─┐          │
                                              ▼          ▼
                                   S-MAP-01 BÂY GIỜ (home đám hiếu)
      ┌───────────────┬───────────────┬────────────┼───────────────┬──────────────┐
  S-MAP-02 Bản đồ  S-DEC-01 Cần quyết  S-TEAM-01 Đội  S-VEN-01 NCC   S-FIN-01 Tài chính
  → S-MAP-04 việc  → S-DEC-02 → 03     → mời/giao    → S-VEN-02/03   → S-FIN-06/07
  → S-MAP-07 thêm/sửa  (đổi nơi / hình thức → tác động lan sang việc, NCC, cáo phó)
                                              S-GST-01 → 02 → 03 (cáo phó) · 05 (ghi khách)
                                              S-AFT-01 → 03 (mốc) · 05 (cảm ơn) · 06 (khép vòng)
  Người hỗ trợ qua link: S-TEAM-06 (không cần cài app)
```

## Interaction Patterns

- **Việc sinh theo hoàn cảnh:** nơi mất · nơi làm lễ · hỏa táng / địa táng · nghi lễ (truyền thống / Phật giáo, Công giáo, không tôn giáo) · 4 hình thức tổ chức · đối tượng nghi lễ tang (cán bộ, CCVC / quân nhân / công an) · quy mô. Mỗi việc có nhãn Bắt buộc / Theo hoàn cảnh / Tùy chọn / Việc riêng và “Vì: …”.
- **Quyết định có tác động:** đổi một quyết định gốc thì phải xem trước tác động (việc, người, chi phí, nhà cung cấp, khách, quyết định khác), sau đó mới xác nhận.
- **Việc không thể quay lại:** phải xong việc phía trước, qua bảng kiểm, hoặc ghi lý do chấp nhận rủi ro.
- **Không áp dụng:** việc do app sinh không xóa được; đánh dấu “Không áp dụng” kèm lý do, khôi phục được.
- **App gợi ý, gia đình xác nhận:** nhà cung cấp điền sẵn → gia đình xác nhận; bên đã cam kết không tự thay; trọn gói chỉ áp cho hạng mục chưa chốt.
- **Bảng trượt từ dưới (bottom sheet) trên điện thoại, ngăn kéo bên phải trên máy tính:** giao việc, mời người, sửa thành viên, sửa vùng, thêm / sửa việc, đề nghị chi, ghi khách, thêm nhà cung cấp, cảnh báo khóa.
- **Ghi nhận không nhận tiền:** chi tiêu và phúng viếng chỉ ghi lại; tài khoản gia đình lưu tên gợi nhớ + 4 số cuối; tài khoản bên nhận lưu đủ, chỉ quyền Tài chính xem.
- **AI chỉ soạn nháp:** lời báo tin, lời cảm ơn; luôn có nhãn “Bản nháp do AI soạn” và cần người đọc lại.

## Desktop Web Shell

- **Thanh bên trái cố định:** Bây giờ · Bản đồ · Cần quyết (số đếm) · Đội đám hiếu · Nhà cung cấp · Tài chính · Khách viếng · Hậu tang · Tài liệu · Đổi hồ sơ · Cài đặt.
- **Thanh trên:** tên đám hiếu · “Đang ở chặng x/15” · Chế độ tang gia · tìm kiếm · thông báo · người đại diện.
- **Nội dung cao đúng bằng màn hình, cuộn bên trong.** Danh sách + chi tiết **chia đôi** ở Chi tiết việc; bảng rộng cuộn ngang trong khung riêng.
- **Shell riêng:** tài khoản (hồ sơ chuẩn bị) và Admin.

## Mobile App Shell

- **Bottom navigation 5 mục:** Bây giờ · Bản đồ · Cần quyết · Đội · Thêm. “Thêm” mở bottom sheet: Nhà cung cấp · Tài chính · Khách viếng · Hậu tang · Tài liệu · Chế độ tang gia · Đổi hồ sơ.
- **Không dùng hamburger làm điều hướng chính.** Thanh trên theo ngữ cảnh, có nút quay lại đúng màn trước.
- Vùng bấm ≥ 44px, chữ thân ≥ 16px, chừa khoảng an toàn phía dưới.
- **Shell không có bottom nav:** luồng khẩn cấp ban đầu, trang Link User, trang cáo phó công khai.
- **Tài khoản:** bottom navigation 4 mục (Trang chủ · Chuẩn bị trước · Thông báo · Tài khoản). **Admin:** chỉ xem và bật / tắt trên điện thoại (NOT_APPLICABLE_WITH_RATIONALE, đã được chấp nhận).

## Responsive Navigation Rules

| Máy tính | Điện thoại |
|---|---|
| Thanh bên trái | Bottom navigation 5 mục + “Thêm” |
| Chi tiết việc chia đôi (danh sách trái, chi tiết phải) | Chi tiết việc toàn màn, quay lại đúng màn trước |
| Thanh chặng ngang, tự cuộn tới chặng đang xem | Danh sách chặng gập / mở, giữ chặng đang mở |
| Bảng (khoản chi, danh bạ, thành viên) | Thẻ, thông tin phụ xuống dòng |
| Ngăn kéo bên phải | Bottom sheet |
| Bản đồ nhà cung cấp cạnh danh sách | Nút “Xem bản đồ” mở bottom sheet |

## System State Patterns

| Trạng thái | Cách hiện |
|---|---|
| Việc | Cần làm · Đang làm · Chờ duyệt · Có vấn đề · Đã xong · Bỏ qua (có lý do) · Không thể quay lại (khóa) |
| Trống | Câu gợi ý hành động (ví dụ “Chưa lập ngân sách”, “Chưa có bên phù hợp — thêm bên quen biết”) |
| Đang tính | Khung xương |
| Đã tự cập nhật | Băng vàng đồng “Đã cập nhật theo …” |
| Không đủ quyền | Thẻ khóa, giải thích ai được xem, lối quay lại |
| Lỗi nhập | Banner đỏ son ngay trong form, nói rõ cần sửa gì |
| Thành công | Toast ngắn “Đã …”, không cảm thán |
| Gia đình trống | Lịch lễ “Gia đình sẽ thông báo” khi chưa có ngày mất; không có dữ liệu mẫu |

## Visual Direction

- **Tinh thần:** trang nghiêm · ấm áp · tĩnh lặng · rõ ràng.
- **Màu:** nền ngà #F7F3EC · nâu trầm hương #7A5A3A · vàng đồng #B8893E · rêu #5E7359 · đỏ son #9E4638 (chỉ cho cảnh báo) · giao diện tối “Canh đêm”.
- **Chữ:** Noto Serif (tiêu đề) + Be Vietnam Pro (giao diện).
- **Ảnh chờ người mất theo nghi lễ:** hoa sen (truyền thống / Phật giáo), thánh giá (Công giáo), cây nến (không tôn giáo); ảnh thờ thật thay khi gia đình tải lên.
- **Giọng văn:** kính ngữ; cách xưng hô theo danh xưng người mất (cụ / ông / bà…); “hưởng thọ” từ 60 tuổi, dưới 60 “hưởng dương”; ngày âm lịch đi kèm ngày dương.

## Prototype-to-Build Traceability

Bảng chính: **Kế hoạch bản mẫu mục 12 và mục 14b**. Quy tắc bắt buộc khi build:

| Quyết định thị giác bắt buộc | Thích ứng được phép | Cấm diễn giải lại |
|---|---|---|
| Thanh bên trái (máy tính) / bottom nav 5 mục (điện thoại) | Ẩn mục theo quyền | Dùng hamburger; menu trên cùng |
| Chi tiết việc chia đôi trên máy tính | Đổi độ rộng cột | Mở thành trang riêng |
| Việc có nhãn loại + “Vì: …” | Rút gọn trên điện thoại | Checklist cố định không theo hoàn cảnh |
| Xem tác động trước khi đổi quyết định | Gộp nhóm tác động | Đổi thẳng không hiện tác động |
| Nhà cung cấp: điền sẵn + gia đình xác nhận | Bố cục thẻ | Tự gán; tự thay bên đã cam kết |
| Hậu tang = chặng 13–15 | Nhóm theo chặng | Danh sách riêng tách khỏi Bản đồ |
| Mọi ngày tính từ ngày mất, kèm âm lịch | Định dạng ngày | Ngày gõ cứng |
| Đám hiếu mới bắt đầu trống | — | Hiện dữ liệu mẫu cho khách thật |
| Khối “Điều khiển bản mẫu”, nút “Gia đình trống / Dữ liệu mẫu” | — | Xây vào app thật (chỉ dành cho bản mẫu) |

## Asset References

- **Bản mẫu HTML:** https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp · file `ban-mau-dot-1.html` (phiên bản 21).
- **Mở từng màn:** thêm `#<Screen ID>` vào link (ví dụ `#S-FIN-01`); chọn Máy tính / Điện thoại; Asset ID hiện trên thanh công cụ.
- **Tài liệu:** Kế hoạch bản mẫu · Nhật ký duyệt bản mẫu · Kiến trúc sản phẩm v2.

## Rejected Alternatives

| Phương án bị loại | Lý do |
|---|---|
| Hamburger làm điều hướng chính trên điện thoại | Người dùng lớn tuổi khó tìm; vi phạm quy tắc app shell |
| Chi tiết việc là trang riêng trên máy tính | Phải bấm qua lại; trái Device Variant Matrix |
| Danh sách việc cố định (một lộ trình hỏa táng) | Không đúng hoàn cảnh; Chủ dự án yêu cầu nhánh địa táng, nghi lễ, hình thức tổ chức |
| Hậu tang là danh sách riêng | Hai nguồn dữ liệu lệch nhau |
| Xóa việc do app sinh | Mất dấu điều kiện khép vòng → thay bằng “Không áp dụng” |
| Hoa sen cho mọi ảnh chờ | Không hợp gia đình Công giáo / nghi lễ tang |
| App tự gán nhà cung cấp, marketplace, nhà cung cấp tự đăng ký | Trái phạm vi đã khóa |
| Lưu số tài khoản gia đình đầy đủ | Không cần; tăng rủi ro dữ liệu |
| Hiển thị số tiền phúng viếng trên danh sách cảm ơn / cáo phó | Nhạy cảm; chỉ trong sổ riêng có phân quyền |

---

**Để khóa trải nghiệm sản phẩm, Chủ dự án gõ đúng lệnh:** `LOCK_PRODUCT_EXPERIENCE`
