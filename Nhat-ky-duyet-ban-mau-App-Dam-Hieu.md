# VISUAL REVIEW LOG — APP ĐÁM HIẾU

**Bản mẫu:** https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp (phiên bản 21) · file `ban-mau-dot-1.html`
**Nguồn chuẩn:** Kiến trúc sản phẩm v2 (LOCK_PRODUCT_STRUCTURE) · Kế hoạch bản mẫu (mục 14b)
**Người duyệt:** Chủ dự án · **Ngày:** 2026-09-25
**Kết luận:** Đợt 1 đạt · Đợt 2 đạt. Sẵn sàng cho `LOCK_PRODUCT_EXPERIENCE`.

---

## Screen Disposition Table

Chú thích: **Đạt** = duyệt trên bản mẫu bấm thử · **Đạt (đặc tả)** = màn lặp lại / bản phác, duyệt theo mẫu dùng lại và đặc tả trong kế hoạch.

| Screen | Tên | Máy tính | Điện thoại | Disposition | Ghi chú review |
|---|---|---|---|---|---|
| S-ENT-01 | Chọn cửa vào | ✓ | ✓ | Đạt | Thêm lối “Dùng thử với gia đình trống” (chỉ bản mẫu) |
| S-ENT-02 | Câu hỏi hoàn cảnh | ✓ | ✓ | Đạt | Thêm câu hỏi hình thức tổ chức, đối tượng, nghi lễ; câu hỏi có điều kiện |
| S-ENT-03 | Việc cần làm ngay | ✓ | ✓ | Đạt | Báo tin chia 4 nhóm; nút “Lưu và vào đám hiếu” dẫn sang hồ sơ nếu chưa có |
| S-ENT-06 | Hồ sơ người đã khuất | ✓ | ✓ | Đạt | Nâng lên HF theo yêu cầu Chủ dự án |
| S-ENT-07 | Tiếp nhận dữ liệu sau kích hoạt | ✓ | ✓ | Đạt | |
| S-MAP-01 | Bây giờ (Home) | ✓ | ✓ | Đạt | Chỉ hiện việc hôm nay; thẻ người mất có “Sửa hồ sơ” |
| S-MAP-02 | Bản đồ 15 chặng | ✓ | ✓ | Đạt | Sinh việc theo hoàn cảnh; chặng đang xem tô đậm; bộ lọc; điều khiển bản mẫu thu gọn |
| S-MAP-04 | Chi tiết việc | ✓ chia đôi | ✓ toàn màn | Đạt | Làm lại theo Device Variant Matrix |
| S-MAP-05 | Cảnh báo không thể quay lại | ✓ | ✓ | Đạt | Chặn khi việc trước chưa xong |
| S-MAP-07 | Thêm / sửa việc | ✓ | ✓ | Đạt | Nâng lên HF theo yêu cầu Chủ dự án |
| S-DEC-01/02/03 | Cần quyết · Chi tiết · Xác nhận thay đổi | ✓ | ✓ | Đạt | Thêm quyết định Hình thức an táng, quyết định Ban lễ tang |
| S-TEAM-01/02/03/04/08 | Đội · Mời · Vùng · Giao việc · Sửa thành viên | ✓ | ✓ | Đạt | S-TEAM-03, S-TEAM-08 nâng lên HF theo yêu cầu |
| S-TEAM-06 | Link User | — | ✓ | Đạt | Kể cả trạng thái link hết hạn |
| S-VEN-01/02/03/04 | Nhà cung cấp | ✓ | ✓ | Đạt | Trọn gói, nhà cung cấp gia đình, hạng mục theo hoàn cảnh |
| S-ADM-01/02 | Danh bạ nhà cung cấp | ✓ | xem, bật/tắt | Đạt | Admin mobile: NOT_APPLICABLE_WITH_RATIONALE — Chủ dự án chấp nhận |
| S-FIN-01/03/06/07 | Tài chính | ✓ | ✓ | Đạt | Người chi, nguồn tiền, tài khoản bên nhận; phúng viếng tiền mặt / chuyển khoản |
| S-GST-01/02/03/05 | Khách viếng | ✓ | ✓ | Đạt | “Khách của ai”; cáo phó theo nghi lễ |
| S-AFT-01/03/05/06 | Hậu tang | ✓ | ✓ | Đạt | Dùng chung chặng 13–15; ngày âm lịch; danh sách cảm ơn |
| S-PRE-03/04/09 | Chuẩn bị trước | ✓ | ✓ | Đạt | |
| S-ENT-04, S-ENT-05, S-HOME-01, S-PRE-01/02/05–08, S-MAP-03, S-MAP-06, S-DEC-04–06, S-TEAM-05, S-TEAM-07, S-VEN-05, S-ADM-03, S-FIN-02/04/05, S-GST-04/06/07, S-AFT-02/04, S-X-01–06 | Màn lặp lại và bản phác | — | — | Đạt (đặc tả) | Build theo pattern gốc và đặc tả; S-ENT-05 (đăng nhập) chi tiết ở Production Completeness |

## Workflow Findings

| # | Phát hiện | Xử lý |
|---|---|---|
| W1 | Bản đồ chỉ có lộ trình hỏa táng | Thêm lộ trình địa táng; đổi hình thức qua Cần quyết có tác động |
| W2 | Chưa phân biệt nghi lễ và hình thức tổ chức | 4 hình thức tổ chức + nghi lễ Phật giáo / Công giáo / không tôn giáo + đối tượng cán bộ, CCVC / quân nhân / công an |
| W3 | Đổi nơi tổ chức, nơi mất, quy mô không đổi việc | Việc có điều kiện theo nơi làm lễ, nơi mất, quy mô |
| W4 | Hậu tang có danh sách riêng với Bản đồ | Dùng chung chặng 13–15 |
| W5 | Chi tiết việc: phụ thuộc sai, lịch sử sai, thiếu nút trạng thái | Sửa phụ thuộc, lịch sử “app tự sinh”, thêm Nhận việc / Bắt đầu làm / Mở quyết định |
| W6 | Không thêm được việc riêng, không sửa được việc, thành viên, vùng | Thêm S-MAP-07, S-TEAM-03, S-TEAM-08 |
| W7 | Không sửa được người mất, không thêm được nhà cung cấp gia đình | Thêm S-ENT-06, S-VEN-04; mọi chỗ dùng tên và ngày cập nhật theo |
| W8 | Việc trùng khi có Ban lễ tang / Mặt trận | Ẩn việc bị làm thay |

## State Findings

| # | Trạng thái | Xử lý |
|---|---|---|
| ST1 | Việc không thể quay lại khi việc trước chưa xong | Nút khóa kèm lý do; cảnh báo cũng chặn |
| ST2 | Việc “Không áp dụng cho gia đình” | Trạng thái Bỏ qua kèm lý do, khôi phục được, tính là đã xử lý khi khép vòng |
| ST3 | Gia đình trống | Tài chính “Chưa lập ngân sách”; lịch lễ “Gia đình sẽ thông báo” khi chưa có ngày mất |
| ST4 | Không đủ quyền | Sổ phúng viếng, Kích hoạt hồ sơ có trạng thái giới hạn |
| ST5 | Gợi ý nhà cung cấp | Đang gợi ý / Đã cập nhật / Chưa có bên phù hợp / Đã chọn / Đã cam kết / Trọn gói |

## Responsive Findings

| # | Phát hiện | Xử lý |
|---|---|---|
| R1 | Khung hẹp không xem được giao diện máy tính | Chế độ Máy tính thu nhỏ theo tỉ lệ; ô “Đang xem” |
| R2 | Màn dài trên máy tính không cuộn được | Cố định chiều cao vùng nội dung; cuộn bên trong |
| R3 | Thanh chặng nhảy về chặng 4 | Giữ vị trí cuộn, tự cuộn tới chặng đang xem; điện thoại giữ chặng đang mở |
| R4 | Chi tiết việc trên máy tính mở trang riêng | Chia đôi theo kế hoạch |
| R5 | Bảng khoản chi rộng | Máy tính cuộn ngang trong khung; điện thoại chuyển thành dòng phụ |

## Approved Changes

Toàn bộ thay đổi đã được Chủ dự án duyệt trong lúc review và ghi tại **Kế hoạch bản mẫu mục 14b** (102 chức năng, 72 màn) và **Kiến trúc sản phẩm mục 1.3, 6.10**. Gồm: nhóm báo tin; người chi, nguồn tiền, tài khoản bên nhận; “khách của ai”; lộ trình địa táng; 4 hình thức tổ chức, nghi lễ, đối tượng (có công an); nơi mất, nơi làm lễ, quy mô; dịch vụ trọn gói; phúng viếng chuyển khoản; ngày âm lịch; danh sách cảm ơn; sửa đội, vùng, việc, hồ sơ người mất; nhà cung cấp gia đình; ảnh chờ theo nghi lễ; đám hiếu mới bắt đầu trống.

## Product Scope Escalations

**Không có thay đổi nào vượt phạm vi đã khóa.** Mọi bổ sung là làm rõ trong module đã khóa (không thêm module, không đổi V1 / Later / Out), đã ghi ở Kiến trúc sản phẩm 1.3 và 6.10. Ranh giới vẫn giữ: không marketplace mở, nhà cung cấp không tự đăng ký, app không tự gán nhà cung cấp, app không nhận hay chuyển tiền phúng viếng.

## Remaining Blockers

**Không có blocker cho `LOCK_PRODUCT_EXPERIENCE`.** Còn mở, không chặn khóa:
- Logo hoa sen có thể chưa hợp với gia đình Công giáo hoặc lễ tang theo nghi thức cơ quan — quyết định nhận diện thương hiệu (trước Sales Page).
- Tên 15 chặng và nội dung việc từng nhánh là dữ liệu mẫu — thay bằng Master Foundation và nguồn kiểm chứng khi build.
- Auth, Account, Checkout / SePay, Admin còn lại — bước Production Completeness (sau khóa trải nghiệm).

## Revised Asset Index

| Asset | Nội dung | Truy cập |
|---|---|---|
| HTML prototype | Toàn bộ màn HF, cả máy tính và điện thoại, dữ liệu mẫu và gia đình trống | https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp · file `ban-mau-dot-1.html` |
| Asset theo màn | Mỗi màn có Asset ID hiện trên thanh công cụ (`A-<SCREEN>-D` / `-M` / `-MN` / `-UPD` / `-EMPTY` / `-VEN` / `-Q` / `-EXP`) | Mở link + `#<Screen ID>` (ví dụ `#S-MAP-04`), chọn Máy tính / Điện thoại |
| Kế hoạch bản mẫu | Inventory, briefs, traceability, mục 14b | `Ke-hoach-ban-mau-truc-quan-App-Dam-Hieu.md` |

Chỉ khi Chủ dự án gõ **`LOCK_PRODUCT_EXPERIENCE`** thì trải nghiệm sản phẩm mới được khóa.
