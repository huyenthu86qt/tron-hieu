# VISUAL PROTOTYPE PLAN — APP ĐÁM HIẾU

**Nguồn chuẩn:** `Kien-truc-san-pham-cuoi-App-Dam-Hieu.md` — LOCK_PRODUCT_STRUCTURE **v2**
**Ngày:** 2026-09-25 · **Trạng thái:** Kế hoạch, chờ Human Review
**Chính sách:** 100% functional coverage + selective high fidelity.
Mọi chức năng V1 đều có màn hình. Màn nào là **key screen** hoặc có tương tác đặc thù thì làm bản mẫu chi tiết cao. Các màn danh sách/biểu mẫu lặp lại thì dùng lại mẫu đã duyệt.

---

## 1. Prototype Goal

Bản mẫu phải chứng minh 5 điều trước khi xây app:
1. **Người đang rối trong giờ đầu** mở app, chưa đăng ký, vẫn thấy ngay *Việc cần làm ngay*.
2. **U1 chỉ thấy điều cần quyết**. Mọi thay đổi đều hiện rõ tác động trước khi xác nhận.
3. **Người hỗ trợ không cần cài app** vẫn nhận việc và báo xong được.
4. **Nhà cung cấp đúng loại và gần nơi tổ chức nhất** được gợi ý và tự cập nhật. Bên đã cam kết không bị tự thay.
5. **Đi hết vòng tới khi khép vòng**: tài chính, khách viếng, hậu tang, mốc tưởng niệm.

Về cảm giác, bản mẫu phải **trang nghiêm, ấm áp, tĩnh lặng và rõ ràng**. Người dùng đang có tang: không màu mè, không vui nhộn, không lạnh lẽo như phần mềm kế toán.

---

## 2. Desktop Web Shell

**Dùng cho:** U1, các thành viên Full/Limited khi dùng máy tính, và Admin.

```text
┌──────────────────┬───────────────────────────────────────────────────────────┐
│ [hoa sen] Đám Hiếu│  Đám hiếu Cụ ông Nguyễn Văn Hòa · Chặng 4/15: Nhập quan   │
│                  │  [Chế độ tang gia ●]  [🔍 Tìm]  [🔔 3]  [Ảnh đại diện]     │
│ ▸ Bây giờ        ├───────────────────────────────────────────────────────────┤
│ ▸ Bản đồ         │  TIÊU ĐỀ TRANG                       [Hành động chính]     │
│ ▸ Cần quyết (2)  │  mô tả ngắn / bộ lọc                                       │
│ ▸ Đội đám hiếu   │                                                           │
│ ▸ Nhà cung cấp   │  Nội dung: bảng / chia đôi danh sách + chi tiết /          │
│ ▸ Tài chính      │  lưới thẻ nhiều cột                                        │
│ ▸ Khách viếng    │                                                           │
│ ▸ Hậu tang       │                                                           │
│ ▸ Tài liệu       │                                                           │
│ ───────────────  │                                                           │
│ ⇄ Đổi hồ sơ      │                                                           │
│ ⚙ Cài đặt        │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
```

- **Thanh bên trái cố định** (rộng 248px, thu gọn còn 72px chỉ biểu tượng). Mục đang mở có vạch màu đồng bên trái và nền ngà đậm hơn.
- **Header nội dung:** tên đám hiếu, chặng hiện tại, công tắc *Chế độ tang gia*, tìm kiếm (Ctrl/⌘K), thông báo, tài khoản.
- **Cần quyết** luôn có số đếm. Đây là lối vào riêng như đã khóa ở câu Q5.
- **Mục ẩn theo quyền:** người dùng Limited chỉ thấy các mục thuộc vùng trách nhiệm của mình. Mục *Bây giờ* đổi thành *Việc của tôi*.
- **Bố cục rộng:** danh sách + chi tiết chia đôi (Bản đồ, Nhà cung cấp, Cần quyết); bảng (Tài chính, Khách, Admin); dòng thời gian ngang theo chặng (Bản đồ).
- **Cấp tài khoản** (chưa vào đám hiếu nào), thanh bên gồm: Trang chủ · Hồ sơ chuẩn bị · Thông báo · Tài khoản.
- **Admin shell** là thanh bên riêng: Danh bạ nhà cung cấp · (các mục Admin khác sẽ bổ sung ở bước Production Completeness).

---

## 3. Mobile App Shell

Mobile là **app shell**, không phải trang máy tính xếp dọc.

```text
┌─────────────────────────────┐
│ ←  Cụ ông Nguyễn Văn Hòa  🔔 │  ← top bar tối giản theo ngữ cảnh
│    Chặng 4/15 · Nhập quan    │
├─────────────────────────────┤
│                             │
│   Nội dung dạng thẻ,        │
│   danh sách tập trung,      │
│   chi tiết mở toàn màn hình │
│                             │
│        [ Hành động chính ]  │  ← nút chính trong tầm ngón cái
├─────────────────────────────┤
│ Bây giờ  Bản đồ  Cần quyết  Đội  Thêm │ ← bottom navigation 5 mục
└─────────────────────────────┘   + vùng an toàn phía dưới
```

- **Bottom navigation 5 mục cố định:** **Bây giờ · Bản đồ · Cần quyết (số đếm) · Đội · Thêm**.
- **“Thêm”** mở **bottom sheet** gồm: Nhà cung cấp · Tài chính · Khách viếng · Hậu tang · Tài liệu · Cài đặt / Chế độ tang gia · Đổi hồ sơ.
- **Không dùng hamburger** làm điều hướng chính.
- **Top bar:** nút quay lại, tên ngữ cảnh, thông báo. Tìm kiếm mở bằng bottom sheet.
- **Bottom sheet** dùng cho: bộ lọc, giao việc, mời người, đánh dấu xong/bỏ qua, ghi nhanh khách, đề nghị chi, nghiệm thu, chia sẻ link, cảnh báo điểm không thể quay lại.
- **Vùng bấm tối thiểu 44×44px.** Chữ thân tối thiểu 16px vì nhiều người dùng lớn tuổi. Đệm dưới theo safe-area để bottom nav không che nội dung.
- **Bảng trên máy tính chuyển thành thẻ** trên điện thoại (Tài chính, Khách, Nhà cung cấp). Không kéo ngang.
- **Theo quyền:** người Limited có bottom nav **Việc của tôi · Bản đồ · Thêm** (3 mục). Người trực ca Khách viếng có thêm mục **Ghi khách**.
- **Cấp tài khoản:** Trang chủ · Chuẩn bị trước · Thông báo · Tài khoản (4 mục).
- **Shell đặc biệt, không có bottom nav:**
  - **Link User** (`/l/:token`): một trang việc được giao, tên người giao, nút lớn *Nhận việc / Đã xong / Báo vấn đề*.
  - **Trang thông tin công khai** (`/t/:slug`): trang đọc dành cho khách.
  - **Luồng khẩn cấp chưa đăng ký** (`/bat-dau/*`): có thanh tiến trình, không bottom nav cho đến khi có hồ sơ.
- **Admin trên mobile:** NOT_APPLICABLE_WITH_RATIONALE. Admin quản lý danh bạ là việc bàn giấy, nhập nhiều trường và chọn vị trí trên bản đồ. Trên điện thoại chỉ cần màn hình co giãn đọc được và bật/tắt nhà cung cấp; không làm app shell riêng. *(Chờ Human Review xác nhận.)*

---

## 4. Functional Screen Inventory

Chú thích fidelity: **HF** = HIGH_FIDELITY · **WF** = ANNOTATED_WIREFRAME · **RP** = REUSED_PATTERN (ghi mẫu gốc).
Trạng thái: M = mặc định · T = trống · Đ = đang tải · L = lỗi · OK = thành công · Q = không đủ quyền.

### M1 — Chuẩn bị trước & Hồ sơ dự liệu
| Function ID | Chức năng | Screen ID | Route | Trạng thái cần có | Fidelity |
|---|---|---|---|---|---|
| F-M1-01 | Xem danh sách hồ sơ chuẩn bị | S-PRE-01 | /chuan-bi | M, T | RP (P-LIST) |
| F-M1-02 | Tạo hồ sơ cho bản thân / cho người thân | S-PRE-02 | /chuan-bi/moi | M, L | WF |
| F-M1-03 | Xem tổng quan + % sẵn sàng + mục còn thiếu | S-PRE-03 | /chuan-bi/:id | M, T (0%), OK (100%) | **HF — key screen** |
| F-M1-04 | Nhập nguyện vọng hậu sự: mai táng/hỏa táng, nghi lễ, địa điểm, quy mô | S-PRE-04 | /chuan-bi/:id/nguyen-vong | M, L | **HF** |
| F-M1-05 | Người đại diện mong muốn & liên hệ | S-PRE-05 | /chuan-bi/:id/lien-he | M, T | RP (P-FORM) |
| F-M1-06 | Giấy tờ (tải tệp) | S-PRE-06 | /chuan-bi/:id/giay-to | M, T, Đ, L | RP (P-DOCS) |
| F-M1-07 | Ngân sách dự kiến & nhà cung cấp mong muốn | S-PRE-07 | /chuan-bi/:id/ngan-sach | M, T | RP (P-FORM) |
| F-M1-08 | Chia sẻ có kiểm soát (xem/sửa) | S-PRE-08 | /chuan-bi/:id/chia-se | M, Q | WF |
| F-M1-09 | Kích hoạt hồ sơ (xác nhận, audit, thông báo) | S-PRE-09 | /chuan-bi/:id/kich-hoat | M, Q, OK | **HF — key screen** |

### M2 — Khởi động khẩn cấp & Hồ sơ đám hiếu
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M2-01 | Chọn cửa vào (chưa xảy ra / đã xảy ra) | S-ENT-01 | / | M | **HF** |
| F-M2-02 | Câu hỏi hoàn cảnh từng bước | S-ENT-02 | /bat-dau/hoan-canh | M, L | **HF** |
| F-M2-03 | Việc cần làm ngay (chưa đăng ký) | S-ENT-03 | /bat-dau/viec-ngay | M, Đ | **HF — Core Value** |
| F-M2-04 | Xác lập người đại diện U1 | S-ENT-04 | /bat-dau/dai-dien | M | WF |
| F-M2-05 | Lưu hồ sơ → yêu cầu tài khoản (điểm chạm Auth) | S-ENT-05 | /bat-dau/luu | M, L | WF (chi tiết Auth ở Production) |
| F-M2-06 | Hồ sơ người mất & hoàn cảnh, bổ sung dần | S-ENT-06 | /dh/:id/ho-so | M, T | RP (P-FORM) |
| F-M2-07 | Tiếp nhận dữ liệu từ hồ sơ chuẩn bị đã kích hoạt | S-ENT-07 | /dh/:id/tiep-nhan | M, OK | **HF** |
| F-M2-08 | Trang chủ cấp tài khoản (hồ sơ chuẩn bị + đám hiếu đang lo) | S-HOME-01 | /app | M, T | WF |

### M3 — Bản đồ đám hiếu
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M3-01 | Bây giờ (trang chủ đám hiếu) | S-MAP-01 | /dh/:id | M, T, Đ | **HF — Home** |
| F-M3-02 | Bản đồ theo 15 chặng | S-MAP-02 | /dh/:id/ban-do | M, Đ | **HF — key screen** |
| F-M3-03 | Góc nhìn Sắp tới / Có vấn đề / Đã xong | S-MAP-03 | /dh/:id/ban-do?xem= | M, T | RP (S-MAP-01) |
| F-M3-04 | Chi tiết việc: phụ thuộc, hạn, người, bằng chứng, liên kết | S-MAP-04 | /dh/:id/viec/:tid | M, L, Q | **HF — key screen** |
| F-M3-05 | Cảnh báo trước điểm không thể quay lại | S-MAP-05 | sheet trên S-MAP-04 | M | **HF** |
| F-M3-06 | Đánh dấu xong kèm bằng chứng / Bỏ qua kèm lý do | S-MAP-06 | sheet | M, L, OK | WF |
| F-M3-07 | Thêm việc riêng | S-MAP-07 | sheet | M, L | RP (P-SHEET-FORM) |
| F-M3-08 | Tiến độ khép vòng theo chặng | S-MAP-02 | (khối trong trang) | M | trong HF S-MAP-02 |

### M4 — Quyết định & Duyệt
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M4-01 | Hàng chờ Cần quyết / Cần duyệt | S-DEC-01 | /dh/:id/can-quyet | M, T | **HF — key screen** |
| F-M4-02 | Chọn phương án, xem tác động, đối chiếu nguyện vọng đã chuẩn bị | S-DEC-02 | /dh/:id/quyet-dinh/:did | M, Q | **HF — key screen** |
| F-M4-03 | Xác nhận thay đổi quyết định (xem danh sách tác động) | S-DEC-03 | /dh/:id/quyet-dinh/:did/thay-doi | M, OK | **HF** |
| F-M4-04 | Duyệt / từ chối đề nghị (chi, vượt quyền) | S-DEC-04 | sheet trên S-DEC-01 | M, OK | WF |
| F-M4-05 | Chấp nhận rủi ro có ghi chú | S-DEC-05 | sheet | M | RP (S-MAP-05) |
| F-M4-06 | Lịch sử quyết định | S-DEC-06 | /dh/:id/quyet-dinh | M, T | RP (P-LIST) |

### M5 — Đội đám hiếu & Điều phối
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M5-01 | Thành viên, vai trò, loại truy cập | S-TEAM-01 | /dh/:id/doi | M, T | **HF — key screen** |
| F-M5-02 | Mời người hỗ trợ bằng link (vai trò, quyền) | S-TEAM-02 | sheet | M, OK | **HF** |
| F-M5-03 | Vùng trách nhiệm (thêm/bớt/đổi tên) | S-TEAM-03 | /dh/:id/doi/vung | M | WF |
| F-M5-04 | Giao việc cho người | S-TEAM-04 | sheet trên S-MAP-04 | M, L | **HF** |
| F-M5-05 | Việc của tôi (Full/Limited) | S-TEAM-05 | /dh/:id/viec-cua-toi | M, T | RP (S-MAP-01) |
| F-M5-06 | Link User: nhận / xong / báo vấn đề, không cài app | S-TEAM-06 | /l/:token | M, L (link hết hạn), OK | **HF** |
| F-M5-07 | Báo phát sinh / xin hỗ trợ / chuyển cấp | S-TEAM-07 | sheet | M, OK | WF |
| F-M5-08 | Chế độ “chỉ báo tôi khi cần quyết” | S-X-04 | /dh/:id/cai-dat | M | WF |

### M6 — Dịch vụ & Nhà cung cấp
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M6-01 | Nhà cung cấp theo hạng mục (trạng thái từng hạng mục) | S-VEN-01 | /dh/:id/nha-cung-cap | M, T | **HF** |
| F-M6-02 | **Gợi ý đúng + gần nhất** (xếp hạng, khoảng cách, bản đồ, nhãn ưu tiên, xác nhận) | S-VEN-02 | /dh/:id/nha-cung-cap/goi-y/:hm | M, Đ | **HF — key screen** |
| F-M6-03 | Gợi ý đã tự cập nhật do đổi địa điểm / đổi hình thức | S-VEN-02 | trạng thái “đã cập nhật” | M | **HF (state)** |
| F-M6-04 | Chưa có nhà cung cấp phù hợp gần nơi tổ chức | S-VEN-02 | trạng thái trống | T | **HF (state)** |
| F-M6-05 | Bên đã cam kết cách xa địa điểm mới → Cần quyết | S-DEC-02 | biến thể “nhà cung cấp” | M | **HF (state)** |
| F-M6-06 | Chi tiết nhà cung cấp của vụ việc: yêu cầu, báo giá, cam kết, phát sinh, công nợ | S-VEN-03 | /dh/:id/nha-cung-cap/:vid | M, L | **HF** |
| F-M6-07 | Thêm nhà cung cấp riêng của gia đình | S-VEN-04 | sheet | M, L | RP (P-SHEET-FORM) |
| F-M6-08 | Nghiệm thu | S-VEN-05 | sheet | M, OK | WF |

### Admin — Danh bạ nhà cung cấp (thuộc M6)
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-ADM-01 | **Danh bạ nhà cung cấp**: bảng, lọc theo loại dịch vụ / khu vực / trạng thái | S-ADM-01 | /admin/nha-cung-cap | M, T, Đ, Q | **HF** |
| F-ADM-02 | **Thêm/sửa nhà cung cấp**: loại dịch vụ, địa chỉ + chọn điểm trên bản đồ, khu vực phục vụ, điều kiện áp dụng | S-ADM-02 | /admin/nha-cung-cap/:id | M, L (không tìm được địa chỉ), OK | **HF** |
| F-ADM-03 | Ẩn/bật nhà cung cấp (tự làm các gợi ý liên quan hết hiệu lực) | S-ADM-03 | hộp xác nhận | M, OK | RP (P-CONFIRM) |

### M7 — Tài chính & Đối soát
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M7-01 | Tổng quan: Dự kiến / Đã chi / Còn trả / Phát sinh, cảnh báo vượt | S-FIN-01 | /dh/:id/tai-chinh | M, T | **HF — key screen** |
| F-M7-02 | Lập / sửa ngân sách, dự toán | S-FIN-02 | /dh/:id/tai-chinh/ngan-sach | M | WF |
| F-M7-03 | Đề nghị chi + chứng từ | S-FIN-03 | sheet | M, L, OK | **HF** |
| F-M7-04 | Danh sách khoản chi (lọc theo trạng thái) | S-FIN-04 | /dh/:id/tai-chinh/khoan-chi | M, T | RP (P-TABLE) |
| F-M7-05 | Công nợ | S-FIN-05 | /dh/:id/tai-chinh/cong-no | M, T | RP (P-TABLE) |
| F-M7-06 | Sổ phúng viếng (quyền riêng) | S-FIN-06 | /dh/:id/tai-chinh/phung-vieng | M, T, **Q** | **HF** |
| F-M7-07 | Đối soát & khóa tài chính | S-FIN-07 | /dh/:id/tai-chinh/doi-soat | M, OK (đã khóa) | **HF** |

### M8 — Khách viếng & Truyền tin
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M8-01 | Tổng quan khách viếng & truyền tin | S-GST-01 | /dh/:id/khach-vieng | M, T | WF |
| F-M8-02 | Soạn trang thông tin (+ nháp AI tùy chọn) | S-GST-02 | /dh/:id/khach-vieng/trang-tin | M, Đ (đang nháp), L | **HF** |
| F-M8-03 | Trang thông tin công khai + nhãn “thông tin đã thay đổi” | S-GST-03 | /t/:slug | M, trạng thái đã thay đổi | **HF** |
| F-M8-04 | Chia sẻ link | S-GST-04 | sheet | M, OK | RP (P-SHARE) |
| F-M8-05 | **Ghi nhanh** khách / đoàn / phúng viếng / lễ vật (một tay) | S-GST-05 | sheet /dh/:id/khach-vieng/ghi | M, OK | **HF — key screen** |
| F-M8-06 | Danh sách khách & ghi nhận | S-GST-06 | /dh/:id/khach-vieng/danh-sach | M, T | RP (P-TABLE) |
| F-M8-07 | Bàn giao ca | S-GST-07 | /dh/:id/khach-vieng/ban-giao | M, OK | WF |

### M9 — Hậu tang, Mốc tưởng niệm, Pháp lý & Khép vòng
| Function ID | Chức năng | Screen ID | Route | Trạng thái | Fidelity |
|---|---|---|---|---|---|
| F-M9-01 | Hậu tang tổng quan: checklist + tiến độ khép vòng | S-AFT-01 | /dh/:id/hau-tang | M | **HF — key screen** |
| F-M9-02 | Thủ tục/quyền lợi: có nguồn / “chưa có hướng dẫn đã kiểm chứng” | S-AFT-02 | /dh/:id/hau-tang/thu-tuc | M, T | WF |
| F-M9-03 | Chọn mốc tưởng niệm (49 ngày / 100 ngày / giỗ đầu / mốc riêng / không theo dõi) + cách tính ngày | S-AFT-03 | /dh/:id/hau-tang/moc | M | **HF** |
| F-M9-04 | Chi tiết mốc: lịch, checklist, phân công, ngân sách, nhắc | S-AFT-04 | /dh/:id/hau-tang/moc/:mid | M | RP (S-MAP-04) |
| F-M9-05 | Lời cảm ơn (nháp AI tùy chọn) | S-AFT-05 | /dh/:id/hau-tang/cam-on | M, Đ | WF |
| F-M9-06 | Khép vòng: điều kiện + xác nhận | S-AFT-06 | /dh/:id/hau-tang/khep-vong | M (chưa đủ điều kiện), OK | **HF** |
| F-M9-07 | Theo dõi dài hạn (lịch mốc sau khép vòng) | S-AFT-01 | trạng thái “Đã khép phần tức thời” | OK | trong HF S-AFT-01 |

### Xuyên module
| Function ID | Chức năng | Screen ID | Route | Fidelity |
|---|---|---|---|---|
| F-X-01 | Thông báo | S-X-01 | /thong-bao | RP (P-LIST) |
| F-X-02 | Tài liệu | S-X-02 | /dh/:id/tai-lieu | RP (P-DOCS) |
| F-X-03 | Lịch sử / audit | S-X-03 | /dh/:id/lich-su | RP (P-LIST) |
| F-X-04 | Cài đặt đám hiếu & Chế độ tang gia | S-X-04 | /dh/:id/cai-dat | WF |
| F-X-05 | Tìm kiếm | S-X-05 | Ctrl/⌘K · sheet | WF |
| F-X-06 | Đổi hồ sơ (giữa các đám hiếu / hồ sơ chuẩn bị) | S-X-06 | sheet | RP (P-SHARE) |

**Chờ bổ sung ở bước Production Completeness** (chưa thuộc kế hoạch này nhưng phải vào inventory trước LOCK_PRODUCT_EXPERIENCE): Đăng nhập/đăng ký, quên mật khẩu, Tài khoản, Checkout + thanh toán SePay + trạng thái kích hoạt, các màn Admin còn lại.

---

## 5. Screen Coverage Matrix

| Module V1 | Số chức năng | Số màn riêng | HF | WF | RP | Kết luận |
|---|---:|---:|---:|---:|---:|---|
| M1 Chuẩn bị trước | 9 | 9 | 3 | 2 | 4 | Đủ |
| M2 Khởi động & Hồ sơ | 8 | 8 | 4 | 3 | 1 | Đủ |
| M3 Bản đồ | 8 | 7 | 4 | 1 | 2 | Đủ |
| M4 Quyết định & Duyệt | 6 | 6 | 3 | 1 | 2 | Đủ |
| M5 Đội & Điều phối | 8 | 7 | 4 | 3 | 1 | Đủ |
| M6 Nhà cung cấp + Admin danh bạ | 11 | 8 | 8* | 1 | 2 | Đủ |
| M7 Tài chính | 7 | 7 | 4 | 1 | 2 | Đủ |
| M8 Khách viếng | 7 | 7 | 3 | 2 | 2 | Đủ |
| M9 Hậu tang & Khép vòng | 7 | 6 | 3 | 2 | 1 | Đủ |
| Xuyên module | 6 | 6 | 0 | 2 | 4 | Đủ |
| **Tổng** | **77** | **71** | **36** | **18** | **21** | **100% functional coverage** |

*\*Tính theo chức năng: 3 trạng thái HF của S-VEN-02 và biến thể nhà cung cấp của S-DEC-02 được tính riêng. HF + WF + RP = 75; 2 chức năng còn lại (F-M3-08, F-M9-07) là khối nằm trong màn HF.*

---

## 6. Fidelity Matrix

**Mẫu dùng lại (pattern gốc, mỗi mẫu làm một lần ở HF hoặc WF):**
| Pattern | Mô tả | Mẫu gốc |
|---|---|---|
| P-LIST | Danh sách thẻ có nhãn trạng thái, lọc bằng bottom sheet | từ S-DEC-01 |
| P-TABLE | Bảng trên máy tính → thẻ trên điện thoại | từ S-ADM-01 / S-FIN-01 |
| P-FORM | Biểu mẫu nhóm, lưu từng phần, không bắt điền hết | từ S-PRE-04 |
| P-SHEET-FORM | Biểu mẫu trong bottom sheet / ngăn kéo phải | từ S-FIN-03 |
| P-DOCS | Danh sách tệp + tải lên + xem trước | WF riêng |
| P-SHARE | Sheet chia sẻ / chọn đối tượng | từ S-TEAM-02 |
| P-CONFIRM | Xác nhận hành động quan trọng, ghi audit | từ S-PRE-09 |

**Bộ HF bắt buộc:** Home (S-MAP-01), Core Value (S-ENT-03), 1–3 key screen cho mỗi module V1, mọi tương tác tạo/duyệt/giải quyết đặc thù, các trạng thái trống/lỗi/không đủ quyền đặc thù, và cả hai shell máy tính + điện thoại.

---

## 7. Device Variant Matrix

| Screen | Máy tính (1440×900) | Điện thoại (390×844) | Ghi chú thích ứng |
|---|---|---|---|
| S-ENT-01/02/03 | Cột giữa 640px, không sidebar | Toàn màn, thanh tiến trình, nút chính dính đáy | Luồng khẩn cấp: ưu tiên điện thoại |
| S-MAP-01 Bây giờ | 2 cột: việc bây giờ + khối Cần quyết/Có vấn đề | Thẻ xếp dọc; Cần quyết ở đầu nếu > 0 | HF cả hai |
| S-MAP-02 Bản đồ | Dòng thời gian ngang 15 chặng + danh sách | Chặng dạng accordion dọc, chặng hiện tại mở sẵn | HF cả hai |
| S-MAP-04 Chi tiết việc | Panel phải trong bố cục chia đôi | Trang toàn màn, hành động ở đáy | HF cả hai |
| S-DEC-01/02/03 | Chia đôi hàng chờ + chi tiết | Danh sách → chi tiết toàn màn; tác động dạng danh sách gập | HF cả hai |
| S-TEAM-01/02/04 | Bảng thành viên + ngăn kéo mời | Thẻ người; mời bằng bottom sheet | HF cả hai |
| S-TEAM-06 Link User | Không có (mở trên điện thoại) | Một trang, 3 nút lớn | Chỉ điện thoại |
| S-VEN-01/02/03 | Danh sách xếp hạng + bản đồ bên phải | Danh sách thẻ; nút “Xem bản đồ” mở bottom sheet | HF cả hai |
| S-ADM-01/02 | Bảng + form 2 cột có bản đồ | Chỉ co giãn đọc được (xem mục 3) | Máy tính là chính |
| S-FIN-01/03/06/07 | Thẻ số + bảng | Thẻ số cuộn ngang 2×2, danh sách thẻ | HF cả hai |
| S-GST-03 Trang công khai | Cột đọc 720px | Toàn màn | HF cả hai |
| S-GST-05 Ghi nhanh | Ngăn kéo phải | Bottom sheet, bàn phím số, dùng được một tay | Điện thoại là chính |
| S-AFT-01/03/06 | Checklist + cột tiến độ | Thẻ dọc | HF cả hai |
| S-PRE-03/04/09 | Mục lục nhóm bên trái + nội dung | Danh sách nhóm → trang nhóm | HF cả hai |

**Biến thể giao diện tối “Canh đêm”** (cho người trực ca đêm): làm HF cho S-MAP-01 và S-GST-05 trên điện thoại. Các màn khác dùng cùng token màu.

---

## 8. Core Value Screen

**S-ENT-03 — Việc cần làm ngay** (`/bat-dau/viec-ngay`, điện thoại là chính, HF)

- **Câu hỏi màn hình trả lời:** “Ngay bây giờ tôi phải làm gì?”
- **Bố cục:**
  1. Câu mở đầu nhẹ nhàng: *“Xin chia buồn cùng gia đình. Đây là những việc cần làm ngay.”*
  2. Tóm tắt hoàn cảnh một dòng: *Mất tại bệnh viện · Tổ chức tại nhà · Dự kiến hỏa táng* [Sửa].
  3. **3–5 thẻ việc ngay**, có số thứ tự, lý do ngắn, nút **Tôi làm** / **Nhờ người khác**.
  4. Khối **Cần quyết sớm** (2–3 quyết định gốc), có nhãn đỏ son nhỏ nếu gắn với điểm không thể quay lại.
  5. Nút chính dính đáy: **Lưu và mời người hỗ trợ**. Nút phụ: *Xem toàn bộ các chặng*.
- **Không được xuất hiện:** yêu cầu đăng ký trước khi thấy việc; quảng cáo; gợi ý mua dịch vụ; biểu tượng vui nhộn.

---

## 9. Critical Interaction Screens

| # | Tương tác | Screen | Vì sao phải HF |
|---|---|---|---|
| 1 | Kích hoạt hồ sơ chuẩn bị | S-PRE-09 → S-ENT-07 | Không đảo ngược được; chuyển dữ liệu giữa hai cửa vào |
| 2 | Quyết định + xem tác động + xác nhận thay đổi | S-DEC-02 → S-DEC-03 | Lõi của nguyên tắc “Chủ thể quyết” |
| 3 | Cảnh báo điểm không thể quay lại | S-MAP-05 | Chống hối tiếc |
| 4 | Giao việc → Link User nhận → báo xong | S-TEAM-04 → S-TEAM-06 | Chứng minh không cần cài app |
| 5 | **Gợi ý nhà cung cấp đúng + gần nhất → xác nhận** | S-VEN-02 | Tính năng mới vừa khóa ở v2 |
| 6 | **Đổi địa điểm → gợi ý tự cập nhật; bên đã cam kết → Cần quyết** | S-VEN-02 (đã cập nhật) + S-DEC-02 (biến thể nhà cung cấp) | Luồng lan tác động qua nhiều module |
| 7 | Admin thêm nhà cung cấp + chọn vị trí trên bản đồ | S-ADM-02 | Nguồn dữ liệu cho luồng 5 |
| 8 | Đề nghị chi → duyệt | S-FIN-03 → S-DEC-04 | Tiền và quyền |
| 9 | Ghi nhanh phúng viếng một tay | S-GST-05 | Dùng trong lúc tiếp khách, đông người |
| 10 | Khóa tài chính / Khép vòng | S-FIN-07, S-AFT-06 | Trạng thái cuối, không đảo ngược dễ dàng |

---

## 10. Screen Briefs

### 10.1 Brief đầy đủ cho key screen

**S-MAP-01 · Bây giờ** · `/dh/:id` · M3 · HF
- **Người dùng / mục đích:** U1 mở app nhiều lần mỗi ngày để biết việc tiếp theo.
- **Câu hỏi:** “Việc gì cần làm ngay, cái gì chờ tôi quyết, có gì đang trục trặc?”
- **Thứ bậc thông tin:** (1) Cần quyết (nếu có) → (2) Việc bây giờ (người phụ trách, hạn) → (3) Có vấn đề → (4) Sắp tới (gập) → (5) Tiến độ chặng.
- **Hành động chính:** mở quyết định; đánh dấu xong. **Hành động phụ:** giao việc, thêm việc.
- **Trạng thái:** trống (“Mọi việc hiện đã có người lo”), đang tải (khung xương), Chế độ tang gia bật (ẩn Sắp tới, chỉ hiện điều cần quyết).
- **Đi từ / đến:** S-ENT-03, S-ENT-07 → S-MAP-04, S-DEC-02.
- **Không được xuất hiện:** biểu đồ trang trí, số liệu tài chính chi tiết, Later/Out.

**S-DEC-02 · Chi tiết quyết định** · `/dh/:id/quyet-dinh/:did` · M4 · HF
- **Câu hỏi:** “Tôi chọn phương án nào, và chọn thì điều gì thay đổi?”
- **Thứ bậc:** tên quyết định + hạn + nhãn điểm không thể quay lại → *Nguyện vọng đã chuẩn bị* (nếu có, kèm nhãn khác biệt so với hoàn cảnh thực tế) → các phương án dạng thẻ chọn → **tác động** (việc / người / chi phí / nhà cung cấp / khách) → nút **Chốt quyết định**.
- **Biến thể nhà cung cấp:** *“Nhà xe Minh An đã cam kết, cách địa điểm mới 18 km (trước đây 3 km). Giữ bên này hay chọn bên gần hơn?”* Kèm 2 gợi ý thay thế và khoảng cách.
- **Trạng thái:** Q (người không phải U1 chỉ thấy nút “Đề xuất lên U1”).
- **Không được xuất hiện:** app tự chọn phương án; ngôn ngữ ép buộc.

**S-VEN-02 · Gợi ý nhà cung cấp** · `/dh/:id/nha-cung-cap/goi-y/:hm` · M6 · HF
- **Câu hỏi:** “Cho hạng mục này, bên nào phù hợp và gần nơi tổ chức nhất?”
- **Thứ bậc:** tên hạng mục + địa chỉ nơi tổ chức [đổi] + tiêu chí đang áp dụng (ví dụ: *Hỏa táng · Trong khu vực phục vụ*) → **bên được điền sẵn** (thẻ nổi bật: tên, khoảng cách, loại dịch vụ, nhãn *Gia đình chỉ định* hoặc *Từ hồ sơ chuẩn bị* nếu có) → các bên tiếp theo xếp theo khoảng cách → bản đồ nhỏ (máy tính) / nút *Xem bản đồ* (điện thoại) → nút **Xác nhận bên này**, phụ: *Chọn bên khác*, *Thêm nhà cung cấp riêng*.
- **Trạng thái:** đang tính (khung xương); **đã cập nhật** (băng thông báo nền vàng đồng nhạt: *“Đã cập nhật theo địa chỉ mới: Nhà tang lễ X, cập nhật lúc 14:05”*); **trống** (*“Chưa có nhà cung cấp phù hợp gần nơi tổ chức. Gia đình có thể thêm bên quen biết.”* + nút thêm); lỗi địa chỉ (*“Chưa xác định được vị trí nơi tổ chức”* + sửa địa chỉ).
- **Không được xuất hiện:** đặt lịch, thanh toán, đánh giá sao, quảng cáo nhà cung cấp, nút “tự động chọn giúp tôi”.

**S-ADM-02 · Thêm/sửa nhà cung cấp** · `/admin/nha-cung-cap/:id` · Admin · HF
- **Câu hỏi:** “Nhà cung cấp này làm gì, ở đâu, phục vụ khu vực nào?”
- **Thứ bậc:** thông tin cơ bản (tên, liên hệ) → loại dịch vụ (chọn nhiều) → địa chỉ + **bản đồ chọn điểm** (tự gợi ý từ địa chỉ, kéo ghim để chỉnh) → khu vực phục vụ (bán kính km hoặc chọn tỉnh/huyện) → điều kiện áp dụng (chỉ mai táng / chỉ hỏa táng / cả hai) → trạng thái hoạt động → Lưu.
- **Trạng thái:** không tìm được địa chỉ; lưu thành công; ẩn nhà cung cấp → thông báo “các gợi ý liên quan sẽ được tính lại”.
- **Không được xuất hiện:** cổng để nhà cung cấp tự đăng ký, gói quảng cáo, đánh giá.

**S-GST-05 · Ghi nhanh khách / phúng viếng** · sheet · M8 · HF (điện thoại)
- **Câu hỏi:** “Ghi lại người vừa đến trong 10 giây mà không nhầm.”
- **Thứ bậc:** tên người/đoàn (gợi ý từ danh sách đã có) → quan hệ/nhóm (chip) → phúng viếng (bàn phím số, nút nhanh theo mệnh giá) → lễ vật (chip + ghi chú) → **Ghi nhận** (nút lớn ở đáy). Sau khi ghi: *“Đã ghi nhận”* + nút *Ghi người tiếp theo*.
- **Trạng thái:** người không có quyền xem sổ tiền vẫn ghi được nhưng **không xem lại** được tổng; giao diện tối “Canh đêm”.
- **Không được xuất hiện:** tổng tiền phúng viếng hiển thị công khai; lời chúc “Tuyệt vời!”.

**S-TEAM-06 · Link User** · `/l/:token` · M5 · HF (điện thoại)
- **Câu hỏi:** “Tôi được nhờ việc gì, lúc nào, báo lại thế nào?”
- **Thứ bậc:** *“Anh Tuấn (con trưởng) nhờ bạn:”* → tên việc, hạn, địa điểm, ghi chú → 3 nút lớn: **Nhận việc** · **Đã xong** (tùy chọn chụp ảnh bằng chứng) · **Báo vấn đề**.
- **Trạng thái:** link hết hạn / bị thu hồi; đã xong.
- **Không được xuất hiện:** yêu cầu cài app hoặc tạo tài khoản; thông tin tài chính và các việc khác.

**S-PRE-09 · Kích hoạt hồ sơ** · M1 · HF
- **Câu hỏi:** “Tôi có chắc muốn chuyển hồ sơ chuẩn bị thành đám hiếu đang tổ chức không?”
- **Thứ bậc:** lời chia buồn → tóm tắt những gì sẽ được chuyển sang (nguyện vọng, người liên hệ, ngân sách, nhà cung cấp, mốc) → ghi chú “Nguyện vọng sẽ hiện là đề xuất; người đại diện vẫn xác nhận” → người thực hiện kích hoạt + thông báo tới ai → **Kích hoạt** (nút màu nâu trầm, không dùng đỏ).
- **Trạng thái:** Q (không có quyền → hướng dẫn liên hệ người sở hữu); OK → chuyển đến S-ENT-07.

**S-FIN-01 · Tổng quan tài chính** · M7 · HF — 4 thẻ số (Dự kiến / Đã chi / Còn trả / Phát sinh) → cảnh báo vượt ngân sách → đề nghị chờ duyệt → khoản chi gần nhất → lối vào Sổ phúng viếng (có khóa nếu không đủ quyền). *Không:* biểu đồ tròn trang trí, số phúng viếng hiện chung với chi phí.

**S-AFT-01 · Hậu tang tổng quan** · M9 · HF — tiến độ khép vòng (theo điều kiện dẫn xuất) → checklist hậu tang theo nhóm (thu dọn, hoàn trả, cảm ơn, thủ tục) → khối mốc tưởng niệm đã chọn và ngày dự kiến → nút *Khép phần tức thời* (chỉ bật khi đủ điều kiện). Trạng thái “Đã khép phần tức thời” chuyển sang lịch mốc dài hạn.

**S-AFT-03 · Chọn mốc tưởng niệm** · M9 · HF — lời dẫn: *“Mỗi gia đình, mỗi vùng có cách tính khác nhau. Gia đình chọn mốc muốn theo dõi.”* → thẻ chọn nhiều: 49 ngày · 100 ngày · Giỗ đầu · Mốc riêng · Không theo dõi → cách tính ngày (âm lịch/dương lịch, tính từ ngày mất / ngày an táng) → xem trước ngày dự kiến → Lưu. *Không:* áp một chuẩn cho mọi gia đình.

### 10.2 Brief rút gọn cho các màn còn lại

| Screen | Câu hỏi màn hình trả lời | Hành động chính | Đi đến |
|---|---|---|---|
| S-ENT-01 | Nhà tôi đang ở hoàn cảnh nào? | Chọn 1 trong 2 cửa vào (thẻ lớn) | S-ENT-02 / S-PRE-02 |
| S-ENT-02 | App cần biết gì để chỉ đúng việc? | Trả lời từng câu (1 câu/màn điện thoại) | S-ENT-03 |
| S-ENT-04 | Ai là người đại diện? | “Tôi là người đại diện” / ghi tên người khác | S-ENT-05 |
| S-ENT-05 | Lưu lại để không mất? | Tạo tài khoản / đăng nhập | S-MAP-01 |
| S-ENT-06 | Thông tin người đã khuất & hoàn cảnh | Sửa từng nhóm | — |
| S-ENT-07 | Dữ liệu nào đã có sẵn từ hồ sơ chuẩn bị? | Xác nhận từng nhóm / sửa | S-MAP-01 |
| S-HOME-01 | Tôi đang có những hồ sơ nào? | Mở đám hiếu / hồ sơ chuẩn bị | S-MAP-01 / S-PRE-03 |
| S-PRE-01/02 | Hồ sơ chuẩn bị của tôi; tạo mới cho ai? | Tạo hồ sơ | S-PRE-03 |
| S-PRE-03 | Hồ sơ đã sẵn sàng bao nhiêu, còn thiếu gì? | Mở nhóm còn thiếu | S-PRE-04..08 |
| S-PRE-04 | Nguyện vọng hậu sự | Chọn phương án, ghi mong muốn | S-PRE-03 |
| S-PRE-08 | Ai được xem/sửa hồ sơ? | Mời, đổi quyền | — |
| S-MAP-02 | Cả vòng đang ở đâu? | Mở chặng / việc | S-MAP-04 |
| S-MAP-06 | Xong thật chưa / vì sao bỏ qua? | Xác nhận kèm bằng chứng/lý do | S-MAP-01 |
| S-DEC-01 | Có gì đang chờ tôi? | Mở từng mục | S-DEC-02 / S-DEC-04 |
| S-DEC-03 | Thay đổi sẽ lan tới đâu? | Xác nhận thay đổi | S-MAP-01 |
| S-TEAM-01/03 | Ai đang giúp, lo phần nào? | Mời, gán vùng | S-TEAM-02 |
| S-TEAM-07 | Có trục trặc gì? | Gửi báo cáo → U1 / người phụ trách | S-DEC-01 |
| S-VEN-01 | Hạng mục nào đã có bên lo? | Mở gợi ý / chi tiết | S-VEN-02 / S-VEN-03 |
| S-VEN-03 | Bên này đã hứa gì, phát sinh gì, còn nợ gì? | Ghi báo giá / cam kết / nghiệm thu | S-VEN-05 |
| S-ADM-01 | Danh bạ đang có những ai, ở đâu? | Lọc, thêm, sửa, ẩn | S-ADM-02 |
| S-FIN-03 | Xin chi khoản này | Nhập số tiền, lý do, chứng từ → gửi | S-DEC-01 |
| S-FIN-06 | Ai đã phúng viếng bao nhiêu? | Xem, đối chiếu (chỉ người có quyền) | S-FIN-07 |
| S-FIN-07 | Đã khớp hết chưa? Khóa được chưa? | Đối soát → Khóa | S-AFT-01 |
| S-GST-01/02 | Khách biết thông tin gì; soạn thế nào? | Soạn, nháp AI, công bố | S-GST-03 |
| S-GST-03 | (Khách) Lễ viếng khi nào, ở đâu? | Xem, chỉ đường | — |
| S-GST-07 | Ca trước đã ghi gì, còn gì dở? | Bàn giao / nhận ca | — |
| S-AFT-02 | Còn thủ tục gì? | Theo dõi, đính kết quả | S-AFT-01 |
| S-AFT-05 | Cảm ơn ai, bằng lời nào? | Nháp, sửa, đánh dấu đã cảm ơn | S-AFT-01 |
| S-AFT-06 | Đã đủ điều kiện khép vòng chưa? | Khép phần tức thời | S-AFT-01 |
| S-X-01..06 | Thông báo, tài liệu, lịch sử, cài đặt, tìm kiếm, đổi hồ sơ | Theo mẫu | — |

---

## 11. Shared Design Rules

### 11.1 Tinh thần thị giác: “Trang nghiêm · Ấm áp · Tĩnh lặng · Rõ ràng”
- **Trang nghiêm:** nhiều khoảng trắng, bố cục cân đối, tiêu đề chữ có chân, không hiệu ứng nảy, không emoji.
- **Ấm áp:** nền ngà như giấy dó thay cho trắng lạnh hoặc đen kịt; màu chủ đạo nâu trầm hương và vàng đồng như ánh nến, ánh nhang; lời lẽ chia buồn nhẹ nhàng.
- **Hợp phong tục Việt:** tông trắng ngà gợi tang phục; hoa sen cách điệu nét mảnh làm biểu tượng; khung ảnh thờ bo mảnh cho ảnh người đã khuất; **tiết chế màu đỏ**, chỉ dùng đỏ son trầm cho cảnh báo không thể quay lại.
- **Xu thế hiện nay:** tối giản, thẻ bo mềm, bottom sheet, chữ lớn dễ đọc, trạng thái có chữ đi kèm màu, giao diện tối cho ca đêm.

### 11.2 Màu (token)
| Token | Sáng | Tối “Canh đêm” | Dùng cho |
|---|---|---|---|
| `--bg` | #F7F3EC (ngà giấy dó) | #1C1916 | Nền trang |
| `--surface` | #FFFDF9 | #26221E | Thẻ, sheet |
| `--border` | #E3DBD0 (khói nhang) | #3A342E | Viền, vạch chia |
| `--text` | #2B2622 (than trầm) | #EFE8DE | Chữ chính |
| `--text-muted` | #6E655C | #B3A89B | Chữ phụ |
| `--primary` | #7A5A3A (nâu trầm hương) | #C9A57A | Nút chính, mục đang chọn |
| `--accent` | #B8893E (vàng đồng) | #D4AE67 | Tiến độ, điểm nhấn nhỏ, “đã cập nhật” |
| `--success` | #5E7359 (rêu lá tre) | #8FA887 | Xong, đã ghi nhận |
| `--warning` | #A8742A | #D9A45A | Sắp tới hạn |
| `--danger` | #9E4638 (đỏ son trầm) | #D98476 | Có vấn đề, không thể quay lại, lỗi |
| `--memorial` | #FFFFFF trên viền #D8CCBB | #2E2924 | Khối thông tin người đã khuất |

### 11.3 Chữ
- **Tiêu đề:** *Noto Serif* (dấu tiếng Việt chuẩn, cảm giác trang nghiêm), đậm 600.
- **Thân chữ và giao diện:** *Be Vietnam Pro*, 400/500/600.
- Cỡ chữ: thân 16px (điện thoại) / 15–16px (máy tính); tiêu đề trang 24–28px; số tiền dùng chữ số đều hàng.

### 11.4 Hình dạng, biểu tượng, chuyển động
- Bo góc 12px (thẻ), 16px (sheet), 10px (nút). Bóng rất nhẹ, ưu tiên viền.
- Biểu tượng nét mảnh 1.5px (bộ Lucide/Phosphor Light), không biểu tượng hoạt hình.
- Chuyển động 150–200ms, dạng mờ dần/trượt nhẹ, không nảy, không pháo giấy.
- Ảnh người đã khuất: khung chữ nhật bo 8px, viền mảnh màu đồng. Không có ảnh thì dùng biểu tượng hoa sen nét mảnh trên nền ngà.

### 11.5 Ngôn ngữ trạng thái (dùng chung toàn app, luôn có chữ đi kèm màu)
| Trạng thái | Nhãn | Màu |
|---|---|---|
| Cần làm | Cần làm | primary (viền) |
| Đang làm | Đang làm | accent |
| Chờ duyệt | Chờ duyệt | primary (nền nhạt) |
| Có vấn đề | Có vấn đề | danger |
| Xong | Đã xong | success |
| Bỏ qua | Bỏ qua (có lý do) | text-muted |
| Không thể quay lại | Không thể quay lại | danger + biểu tượng khóa |

### 11.6 Giọng văn
- Kính ngữ, nhẹ nhàng: “người đã khuất”, “cụ ông / cụ bà”, “thành kính”, “gia đình”, “phúng viếng”.
- Không dùng: “khách hàng”, “đơn hàng”, “Tuyệt vời!”, “Chúc mừng”, câu cảm thán, emoji.
- Thông báo thành công: “Đã ghi nhận”, “Đã lưu”, “Đã gửi tới anh Tuấn”.
- Nút hành động là động từ rõ ràng: *Tôi làm*, *Nhờ người khác*, *Chốt quyết định*, *Xác nhận bên này*.

### 11.7 Dữ liệu mẫu dùng trong mọi bản mẫu (hư cấu)
- Người đã khuất: **Cụ ông Nguyễn Văn Hòa** (1938–2026). Người đại diện: **anh Nguyễn Minh Tuấn** (con trưởng).
- Nơi tổ chức: nhà riêng, *số 12 ngõ 45 đường Hoa Sen, quận Mẫu, Hà Nội* (địa chỉ hư cấu). Hình thức: hỏa táng. Chặng hiện tại: 4/15.
- Nhà cung cấp mẫu: *Nhà xe Minh An (3,2 km)*, *Rạp bàn ghế Phúc Lộc (1,1 km)*, *Hoa tươi Thanh Tâm (2,4 km)*. Tên hư cấu, dùng cho bản mẫu.

### 11.8 Quy tắc nhất quán
Một hệ thiết kế duy nhất. Máy tính và điện thoại khác shell nhưng giữ nguyên ý nghĩa route và thứ tự ưu tiên hành động. Cùng một đối tượng (việc, người, nhà cung cấp, khoản chi) thì giữ cùng trường và cùng nhãn ở mọi nơi. Không có nội dung Later/Out trong bất kỳ bản mẫu nào.

---

## 12. Prototype-to-Build Traceability Matrix

*(Asset ID sẽ được gắn file khi tạo. Đợt 1 = shell + luồng lõi; Đợt 2 = các miền công việc.)*

| Screen ID | Route | Device | Function IDs | Asset ID | Quyết định thị giác bắt buộc | Thích ứng được phép | Cấm diễn giải lại | Build owner | Disposition |
|---|---|---|---|---|---|---|---|---|---|
| SHELL-D | (mọi route /dh/*) | Desktop | toàn bộ | A-SHELL-D | Thanh bên trái 9 mục + Cần quyết có số đếm; header có Chế độ tang gia | Thu gọn sidebar | Đổi sang menu trên cùng | Lovable | Chờ |
| SHELL-M | (mọi route /dh/*) | Mobile | toàn bộ | A-SHELL-M | Bottom navigation 5 mục; “Thêm” mở bottom sheet | Ẩn mục theo quyền | Dùng hamburger làm điều hướng chính | Lovable | Chờ |
| S-ENT-01 | / | Mobile, Desktop | F-M2-01 | A-ENT-01-M / -D | 2 thẻ lớn ngang hàng | Xếp dọc/ngang | Bắt đăng nhập trước | Lovable | Chờ |
| S-ENT-02 | /bat-dau/hoan-canh | Mobile | F-M2-02 | A-ENT-02-M | 1 câu/màn, thanh tiến trình | — | Form dài một trang | Lovable | Chờ |
| S-ENT-03 | /bat-dau/viec-ngay | Mobile, Desktop | F-M2-03 | A-ENT-03-M / -D | Lời chia buồn; 3–5 thẻ việc; khối Cần quyết sớm; nút dính đáy | Cột giữa trên máy tính | Checklist dài cố định | Lovable | Chờ |
| S-ENT-07 | /dh/:id/tiep-nhan | Mobile | F-M2-07 | A-ENT-07-M | Nhóm dữ liệu có nút xác nhận | — | Tự áp nguyện vọng không hỏi | Lovable | Chờ |
| S-MAP-01 | /dh/:id | Mobile, Desktop, Mobile-dark | F-M3-01 | A-MAP-01-M / -D / -MN | Thứ tự: Cần quyết → Bây giờ → Có vấn đề | Cột ↔ xếp dọc | Dashboard biểu đồ | Lovable | Chờ |
| S-MAP-02 | /dh/:id/ban-do | Mobile, Desktop | F-M3-02, F-M3-08 | A-MAP-02-M / -D | 15 chặng, chặng hiện tại nổi bật | Ngang ↔ accordion | Gantt phức tạp | Lovable | Chờ |
| S-MAP-04 | /dh/:id/viec/:tid | Mobile, Desktop | F-M3-04 | A-MAP-04-M / -D | Phụ thuộc, hạn, người, bằng chứng, liên kết | Panel ↔ toàn màn | — | Lovable | Chờ |
| S-MAP-05 | sheet | Mobile | F-M3-05 | A-MAP-05-M | Nhãn khóa đỏ son, liệt kê hệ quả | — | Hộp thoại chung chung | Lovable | Chờ |
| S-DEC-01 | /dh/:id/can-quyet | Mobile, Desktop | F-M4-01 | A-DEC-01-M / -D | Nhóm Cần quyết / Cần duyệt | Chia đôi ↔ danh sách | — | Lovable | Chờ |
| S-DEC-02 | /dh/:id/quyet-dinh/:did | Mobile, Desktop | F-M4-02, F-M6-05 | A-DEC-02-M / -D / -VEN | Nguyện vọng đã chuẩn bị + tác động + phương án | — | App tự chọn phương án | Lovable+Codex | Chờ |
| S-DEC-03 | …/thay-doi | Mobile | F-M4-03 | A-DEC-03-M | Danh sách tác động theo module | — | Bỏ bước xem tác động | Lovable+Codex | Chờ |
| S-TEAM-01 | /dh/:id/doi | Desktop | F-M5-01 | A-TEAM-01-D | Vai trò + loại truy cập + vùng | Bảng ↔ thẻ | — | Lovable | Chờ |
| S-TEAM-02 | sheet | Mobile | F-M5-02 | A-TEAM-02-M | Chọn vai trò, quyền, tạo link | — | — | Lovable | Chờ |
| S-TEAM-04 | sheet | Mobile | F-M5-04 | A-TEAM-04-M | Chọn người, hạn, ghi chú | — | — | Lovable | Chờ |
| S-TEAM-06 | /l/:token | Mobile | F-M5-06 | A-TEAM-06-M | 3 nút lớn, tên người nhờ | — | Bắt cài app/đăng ký | Lovable+Codex | Chờ |
| S-VEN-01 | /dh/:id/nha-cung-cap | Mobile, Desktop | F-M6-01 | A-VEN-01-M / -D | Hạng mục + trạng thái + bên đã chọn | — | Danh mục kiểu chợ | Lovable | Chờ |
| S-VEN-02 | …/goi-y/:hm | Mobile, Desktop (+ đã cập nhật, trống) | F-M6-02..04 | A-VEN-02-M / -D / -UPD / -EMPTY | Bên điền sẵn + khoảng cách + tiêu chí + nút Xác nhận | Bản đồ cạnh ↔ bottom sheet | Tự chốt không có xác nhận; đánh giá sao; đặt lịch | Lovable+Codex | Chờ |
| S-VEN-03 | …/:vid | Desktop | F-M6-06 | A-VEN-03-D | Tab: Báo giá · Cam kết · Phát sinh · Nghiệm thu · Công nợ | Tab ↔ khối dọc | — | Lovable | Chờ |
| S-ADM-01 | /admin/nha-cung-cap | Desktop | F-ADM-01 | A-ADM-01-D | Bảng + bộ lọc loại / khu vực / trạng thái | — | Cổng tự đăng ký | Lovable+Codex | Chờ |
| S-ADM-02 | /admin/nha-cung-cap/:id | Desktop | F-ADM-02 | A-ADM-02-D | Form 2 cột + bản đồ ghim + khu vực phục vụ | — | — | Lovable+Codex | Chờ |
| S-FIN-01 | /dh/:id/tai-chinh | Mobile, Desktop | F-M7-01 | A-FIN-01-M / -D | 4 thẻ số, cảnh báo vượt | 4 cột ↔ 2×2 | Biểu đồ trang trí | Lovable | Chờ |
| S-FIN-03 | sheet | Mobile | F-M7-03 | A-FIN-03-M | Số tiền, lý do, chứng từ | — | — | Lovable | Chờ |
| S-FIN-06 | …/phung-vieng | Mobile (+ Q) | F-M7-06 | A-FIN-06-M / -Q | Khóa quyền rõ ràng | — | Hiện tổng cho mọi người | Lovable+Codex | Chờ |
| S-FIN-07 | …/doi-soat | Desktop | F-M7-07 | A-FIN-07-D | Danh sách khớp/lệch + Khóa | — | — | Lovable+Codex | Chờ |
| S-GST-02 | …/trang-tin | Desktop | F-M8-02 | A-GST-02-D | Soạn + xem trước + nháp AI (tùy chọn) | — | Tự công bố bản nháp AI | Lovable | Chờ |
| S-GST-03 | /t/:slug | Mobile, Desktop | F-M8-03 | A-GST-03-M / -D | Ảnh thờ, thông tin lễ, nhãn “đã thay đổi” | — | Bình luận/mạng xã hội | Lovable | Chờ |
| S-GST-05 | sheet | Mobile, Mobile-dark | F-M8-05 | A-GST-05-M / -MN | Một tay, bàn phím số, ghi nối tiếp | — | — | Lovable | Chờ |
| S-AFT-01 | /dh/:id/hau-tang | Mobile, Desktop | F-M9-01, F-M9-07 | A-AFT-01-M / -D | Tiến độ khép vòng + mốc | — | — | Lovable | Chờ |
| S-AFT-03 | …/moc | Mobile | F-M9-03 | A-AFT-03-M | Chọn nhiều + cách tính + xem trước ngày | — | Áp chuẩn 49/100 ngày cho mọi nhà | Lovable+Codex | Chờ |
| S-AFT-06 | …/khep-vong | Desktop | F-M9-06 | A-AFT-06-D | Danh sách điều kiện đạt/chưa đạt | — | Cho khép khi chưa đủ | Lovable+Codex | Chờ |
| S-PRE-03 | /chuan-bi/:id | Mobile, Desktop | F-M1-03 | A-PRE-03-M / -D | % sẵn sàng + nhóm còn thiếu | — | — | Lovable | Chờ |
| S-PRE-04 | …/nguyen-vong | Mobile | F-M1-04 | A-PRE-04-M | Nhóm lựa chọn, lưu từng phần | — | Bắt điền hết | Lovable | Chờ |
| S-PRE-09 | …/kich-hoat | Mobile | F-M1-09 | A-PRE-09-M | Tóm tắt dữ liệu chuyển + người được thông báo | — | Kích hoạt một chạm không xác nhận | Lovable+Codex | Chờ |

Màn WF/RP: dùng đặc tả viết ở mục 4 + 10.2 và pattern gốc ở mục 6; builder không được tự nghĩ trải nghiệm khác.

---

## 13. Asset Index

| Đợt | Asset ID | Screen | Thiết bị / trạng thái | File | Trạng thái |
|---|---|---|---|---|---|
| 1 | A-SHELL-D, A-SHELL-M | Shell | Desktop / Mobile | ban-mau-dot-1.html (HTML) | ĐÃ DUYỆT 2026-09-25 |
| 1 | A-ENT-01-M/-D, A-ENT-02-M, A-ENT-03-M/-D | Cửa vào + Core Value | | ban-mau-dot-1.html (HTML) | ĐÃ DUYỆT 2026-09-25 |
| 1 | A-MAP-01-M/-D/-MN, A-MAP-02-M/-D, A-MAP-04-M/-D, A-MAP-05-M | Bản đồ | | ban-mau-dot-1.html (HTML) | ĐÃ DUYỆT 2026-09-25 |
| 1 | A-DEC-01-M/-D, A-DEC-02-M/-D/-VEN, A-DEC-03-M | Quyết định | | ban-mau-dot-1.html (HTML) | ĐÃ DUYỆT 2026-09-25 |
| 1 | A-TEAM-01-D, A-TEAM-02-M, A-TEAM-04-M, A-TEAM-06-M | Đội | | ban-mau-dot-1.html (HTML) | ĐÃ DUYỆT 2026-09-25 |
| 1 | A-VEN-01-M/-D, A-VEN-02-M/-D/-UPD/-EMPTY | Nhà cung cấp | | ban-mau-dot-1.html (HTML) | ĐÃ DUYỆT 2026-09-25 |
| 2 | A-VEN-03-D, A-ADM-01-D, A-ADM-02-D | Nhà cung cấp + Admin | | ban-mau-dot-1.html (HTML) | ĐÃ DỰNG — CHỜ REVIEW |
| 2 | A-FIN-01-M/-D, A-FIN-03-M, A-FIN-06-M/-Q, A-FIN-07-D | Tài chính | | ban-mau-dot-1.html (HTML) | ĐÃ DỰNG — CHỜ REVIEW |
| 2 | A-GST-02-D, A-GST-03-M/-D, A-GST-05-M/-MN | Khách viếng | | ban-mau-dot-1.html (HTML) | ĐÃ DỰNG — CHỜ REVIEW |
| 2 | A-AFT-01-M/-D, A-AFT-03-M, A-AFT-06-D | Hậu tang | | ban-mau-dot-1.html (HTML) | ĐÃ DỰNG — CHỜ REVIEW |
| 2 | A-PRE-03-M/-D, A-PRE-04-M, A-PRE-09-M, A-ENT-07-M | Chuẩn bị trước | | ban-mau-dot-1.html (HTML) | ĐÃ DỰNG — CHỜ REVIEW |

Bản mẫu HTML bấm thử: https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp — chọn màn ở thanh công cụ; Asset ID hiện theo thiết bị/trạng thái. Visual Review: Đợt 1 đạt (có bổ sung 4 nhóm báo tin ở S-ENT-03 và chặng 6).

Mỗi asset khi tạo xong phải gắn đường dẫn file hoặc URL truy cập được. Asset không mở được thì không được dùng làm căn cứ cho độ trung thực khi build.

---

## 14. Coverage Audit

- ✓ 77/77 chức năng V1 (9 module + Admin danh bạ + xuyên module) có màn hình hoặc luồng → **100% functional coverage**.
- ✓ Không module nào chỉ xuất hiện dưới dạng nhãn điều hướng hay thẻ dashboard.
- ✓ Mỗi module V1 có từ 1 đến 3 key screen ở mức HF.
- ✓ Màn Gợi ý nhà cung cấp (S-VEN-02) có đủ các trạng thái: mặc định, đang tính, đã cập nhật, trống, lỗi địa chỉ. Biến thể Cần quyết của nhà cung cấp nằm ở S-DEC-02.
- ✓ Màn Admin danh bạ (S-ADM-01, S-ADM-02) ở mức HF.
- ✓ Có đặc tả Desktop Web Shell và Mobile App Shell; bottom navigation 5 mục; bottom sheet cho mục phụ.
- ✓ Không có Later/Out: không đặt lịch, không đánh giá, không nhà cung cấp tự đăng ký, không marketplace, không mạng xã hội, không chatbot trung tâm.
- ⚠ Auth, Account, Checkout/SePay và các màn Admin khác **chưa có** → bổ sung sau Production Completeness, trước LOCK_PRODUCT_EXPERIENCE.
- ⚠ Admin trên điện thoại đang ở trạng thái NOT_APPLICABLE_WITH_RATIONALE → chờ chị xác nhận.

---

## 14b. Cập nhật sau Visual Review (2026-09-25)

Các thay đổi dưới đây đã được Chủ dự án duyệt trong lúc review bản mẫu HTML (https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp). Tất cả là **làm rõ trong phạm vi đã khóa**, không thêm module.

### Chức năng bổ sung vào Functional Screen Inventory

| Function ID | Chức năng | Screen | Fidelity |
|---|---|---|---|
| F-M2-09 | Câu hỏi hoàn cảnh: hình thức tổ chức (4 hình thức), đối tượng nghi lễ tang (cán bộ, CCVC / quân nhân / công an), nghi lễ tôn giáo | S-ENT-02 | HF |
| F-M2-10 | **Hồ sơ người đã khuất**: danh xưng, họ tên, tên thánh (Công giáo), năm sinh, ngày giờ mất, quê quán, ảnh thờ; tự tính ngày âm và tuổi âm (“hưởng thọ” từ 60 tuổi, dưới 60 “hưởng dương”); người đại diện (tang chủ). Sửa thì màn Bây giờ, cáo phó, lịch lễ, hạn việc, mốc tưởng niệm, lời cảm ơn cập nhật theo; cách xưng hô trong việc đổi theo danh xưng (cụ / ông / bà…) | S-ENT-06 (nâng từ mẫu dùng lại lên HF) | HF |
| F-M3-09 | Bản đồ sinh việc theo: nơi mất · nơi làm lễ (nhà riêng / nhà tang lễ) · hỏa táng / địa táng · nghi lễ · hình thức tổ chức · quy mô. Có nhãn Bắt buộc / Theo hoàn cảnh / Tùy chọn và “Vì: …” | S-MAP-02 | HF |
| F-M3-10 | Bộ lọc việc; nút Chặng trước / Chặng sau; chặng đang xem tô đậm, chặng gia đình đang ở gắn nhãn riêng | S-MAP-02 | HF |
| F-M3-11 | Chi tiết việc: vì sao có việc này, cần xong trước, việc tiếp theo chờ việc này, cần chuẩn bị, bằng chứng, lịch sử; **máy tính chia đôi** (danh sách trái, chi tiết phải), điện thoại toàn màn | S-MAP-04 | HF |
| F-M3-13 | **Thêm việc riêng của gia đình** (tên, chặng, hạn, người phụ trách, vùng, ghi chú) và **sửa việc** (việc do app sinh giữ nguyên chặng); **xóa** việc riêng; **đánh dấu “Không áp dụng cho gia đình”** kèm lý do cho việc do app sinh, khôi phục được (tính là đã xử lý khi khép vòng) | S-MAP-07 (sheet, nâng lên HF), S-MAP-04, S-MAP-02 | HF |
| F-M3-12 | Cảnh báo không thể quay lại dùng chung cho mọi việc bị khóa; bị chặn khi việc phía trước chưa xong | S-MAP-05 | HF |
| F-M4-07 | Quyết định **Hình thức an táng** + xác nhận thay đổi và tác động | S-DEC-02, S-DEC-03 | HF |
| F-M4-08 | Quyết định của Ban lễ tang: “đề xuất — gia đình xác nhận” (hình thức 3) hoặc “chủ trì — gia đình được thông báo, góp ý” (hình thức 4) | S-DEC-01, S-DEC-02 | HF |
| F-M5-09 | Đội có **Ban lễ tang** (đồng tổ chức / chủ trì) hoặc **hỗ trợ địa phương** (Ban công tác Mặt trận, Hội Người cao tuổi) | S-TEAM-01 | RP |
| F-M5-10 | **Sửa thành viên**: họ tên, quan hệ, cách tham gia, vùng trách nhiệm; bỏ khỏi đội (việc đang giao trở về “Chưa có người nhận”); người đại diện U1 luôn Full và không bỏ được | S-TEAM-08 (sheet mới) | HF |
| F-M5-11 | **Sửa danh sách vùng trách nhiệm**: đổi tên (lan sang người và việc), thêm, xóa (gỡ khỏi người giữ, việc chuyển về “Toàn bộ”) | S-TEAM-03 (nâng từ bản phác lên HF) | HF |
| F-M6-09 | Hạng mục **Đào huyệt, xây mộ** khi địa táng | S-VEN-01, S-VEN-02 | RP |
| F-M6-10 | **Dịch vụ trọn gói**: một nhà cung cấp nhận nhiều hạng mục; gợi ý và chọn trọn gói, giữ nguyên bên đã cam kết, nhắc mong muốn trong hồ sơ chuẩn bị | S-VEN-01 (+ sheet), S-VEN-02, S-VEN-03, S-ADM-01, S-ADM-02 | HF |
| F-M6-11 | **Nhà cung cấp của gia đình**: tên, số điện thoại, hạng mục, địa chỉ, ghi chú; chọn luôn cho hạng mục đang xem; chỉ thuộc đám hiếu này, không vào danh bạ Admin | S-VEN-04 (sheet, nâng từ mẫu dùng lại lên HF), S-VEN-02, S-VEN-01 | HF |
| F-M7-08 | Khoản chi có **người chi · hình thức · nguồn tiền · tài khoản bên nhận** (chủ TK, ngân hàng, số TK) | S-FIN-01, S-FIN-03 | HF |
| F-M7-09 | Tổng hợp **Theo nguồn tiền** | S-FIN-01 | HF |
| F-M7-10 | Khoản **do Ban lễ tang, đơn vị chi trả** tách riêng | S-FIN-01 | RP |
| F-M7-11 | Đối soát phúng viếng **tiền mặt** (kiểm đếm) và **chuyển khoản** (đối chiếu sao kê) | S-FIN-07 | HF |
| F-M8-08 | **Khách của** ai (bạn của từng người con / của cụ); lọc và tổng hợp theo người | S-GST-05, S-FIN-06 | HF |
| F-M8-09 | **Hình thức phúng viếng**: tiền mặt / chuyển khoản (chỉ ghi nhận) | S-GST-05, S-FIN-06 | HF |
| F-M8-10 | Cáo phó theo nghi lễ và hình thức tổ chức (tên thánh, Ban lễ tang, nếp sống văn minh) | S-GST-03 | HF |
| F-M9-08 | Hậu tang **dùng chung danh sách chặng 13–15** với Bản đồ | S-AFT-01 | HF |
| F-M9-09 | **Ngày âm lịch** cho mọi mốc tưởng niệm (thuật toán lịch âm Việt Nam, múi giờ +7) | S-AFT-03, S-AFT-01 | HF |
| F-M9-10 | **Danh sách cảm ơn theo từng người con**, lấy từ Sổ phúng viếng; nháp lời cảm ơn bằng AI (tùy chọn) | S-AFT-05 (nâng từ WF lên HF) | HF |

**Tổng sau cập nhật:** 77 + 25 = **102 chức năng** trên 72 màn (thêm sheet S-TEAM-08; S-AFT-05, S-TEAM-03, S-ENT-06, S-VEN-04, S-MAP-07 nâng lên HF).

**Quy tắc dữ liệu cho app thật:** một đám hiếu mới **bắt đầu trống** — chỉ có người đại diện, việc sinh theo hoàn cảnh, và (nếu kích hoạt từ hồ sơ chuẩn bị) dữ liệu đã chuẩn bị. Không có khoản chi, khách, nhà cung cấp mẫu. Mọi mốc ngày (lịch lễ, hạn việc, giờ an táng, mốc tưởng niệm) tính từ ngày mất gia đình nhập. Bản mẫu có nút **“Gia đình trống”** để thử đúng trải nghiệm này; nút **“Dữ liệu mẫu”** để quay lại bộ dữ liệu hư cấu.

### Quyết định thị giác bổ sung (đưa vào Prototype-to-Build Traceability)
- **Ảnh chờ người mất theo nghi lễ:** hoa sen (truyền thống / Phật giáo), thánh giá (Công giáo), cây nến (không theo nghi lễ tôn giáo).
- **Chi tiết việc trên máy tính** là bố cục chia đôi; *không* mở thành trang riêng.
- **Bảng khoản chi trên máy tính** có nhóm cột “Tài khoản bên nhận”, cuộn ngang trong khung; trên điện thoại chuyển thành dòng phụ dưới mỗi khoản.
- **Số tài khoản của gia đình** chỉ hiện tên gợi nhớ và 4 số cuối; **tài khoản bên nhận** hiện đầy đủ, chỉ người có quyền Tài chính xem.
- **Khối “Điều khiển bản mẫu”** trên màn Bản đồ **chỉ có trong bản mẫu**, không xây trong app thật.

### Còn mở
- Tên 15 chặng và nội dung việc theo từng nhánh là **dữ liệu mẫu**; nội dung thật lấy từ Master Foundation và nguồn phong tục, quy định đã kiểm chứng.
- Auth, Account, Checkout / SePay và các màn Admin còn lại bổ sung ở bước Production Completeness.

## 15. Human Review Checklist

Chị xem kế hoạch và trả lời các điểm sau (có thể chỉ trả lời điểm muốn đổi):

1. **Bottom navigation điện thoại:** *Bây giờ · Bản đồ · Cần quyết · Đội · Thêm* đã đúng 5 mục chị muốn chưa? Có muốn thay *Đội* bằng *Khách viếng* không?
2. **Phong cách:** Nền ngà + nâu trầm hương + vàng đồng + hoa sen nét mảnh có đúng “trang nghiêm mà ấm áp” chị hình dung chưa?
3. **Giao diện tối “Canh đêm”** cho người trực đêm: giữ hay bỏ?
4. **Admin chỉ làm trên máy tính:** chị đồng ý chứ?
5. **Lời chia buồn mở đầu** ở màn Việc cần làm ngay: giữ hay bỏ?
6. **Đợt 1** (shell, cửa vào, Bản đồ, Quyết định, Đội, Gợi ý nhà cung cấp) có đúng thứ tự ưu tiên chị muốn xem trước không?
7. Có màn nào chị thấy thiếu so với cách gia đình Việt thực sự lo đám hiếu không?

Với mỗi key screen khi đã có bản mẫu, câu hỏi review sẽ là: hiểu ngay mục đích không · thiếu gì · thừa gì · bước tiếp có tự nhiên không · trạng thái có rõ không · máy tính có ra máy tính, điện thoại có ra app không · có lệch cấu trúc đã khóa không.

**Chỉ khi chị gõ `LOCK_PRODUCT_EXPERIENCE` sau khi duyệt bản mẫu thì Trải nghiệm sản phẩm mới được khóa.**
