# TRẠNG THÁI DỰ ÁN — APP TRỌN HIẾU (trước đây: App Đám Hiếu)

**Cập nhật:** 2026-09-25 · Snapshot v7

## Khóa đang hiệu lực
- LOCK_IDEA
- LOCK_PRODUCT_STRUCTURE **v2** (làm rõ ở mục 1.3 và 6.10) — `docs/Kien-truc-san-pham-cuoi-App-Dam-Hieu.md`
- LOCK_PRODUCT_EXPERIENCE (2026-09-25) — `docs/Dac-ta-trai-nghiem-san-pham-App-Dam-Hieu.md`

## Tài liệu
| Tệp | Vai trò |
|---|---|
| `docs/De-xuat-cau-truc-san-pham-App-Dam-Hieu.md` | Đề xuất module ban đầu (lịch sử) |
| `docs/Kien-truc-san-pham-cuoi-App-Dam-Hieu.md` | Kiến trúc sản phẩm cuối — nguồn chuẩn cấu trúc |
| `docs/Ke-hoach-ban-mau-truc-quan-App-Dam-Hieu.md` | Kế hoạch bản mẫu: 102 chức năng, 72 màn, traceability |
| `docs/Nhat-ky-duyet-ban-mau-App-Dam-Hieu.md` | Nhật ký duyệt bản mẫu |
| `docs/Dac-ta-trai-nghiem-san-pham-App-Dam-Hieu.md` | Đặc tả trải nghiệm — **đã khóa** |
| `docs/Hoan-thien-van-hanh-App-Dam-Hieu.md` | Production Completeness: Auth, Account, Checkout, SePay, Admin |
| `prototype/ban-mau-dam-hieu.html` | Bản mẫu HTML đã duyệt (bản online: https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp) |

## Quyết định vận hành đã chốt
- **Tên thương hiệu: Trọn Hiếu** · câu định vị **“Chu toàn việc hiếu – Trọn vẹn nghĩa tình”** (Chủ dự án chốt 2026-09-25). Danh từ “đám hiếu” trong câu chữ (Đám hiếu Cụ ông…, Đội đám hiếu) giữ nguyên. Nguồn trong code: `app/src/ui/brand.tsx`.
- Thu tiền: trả một lần **mỗi đám hiếu** (dùng đến hết giỗ đầu) + **gói Chuẩn bị trước** (miễn phí tạo hồ sơ; trả phí để lưu giấy tờ, chia sẻ, kích hoạt; kích hoạt thì đám hiếu mở đầy đủ, không thu lần hai).
- Miễn phí tới Bản đồ; trả phí khi mời người hỗ trợ và dùng Nhà cung cấp, Tài chính, Khách viếng, Hậu tang.
- Đăng nhập: số điện thoại + mật khẩu; OTP khi đăng ký và khi quên mật khẩu.
- Giá do Admin nhập; Chủ dự án chốt trước khi mở bán.
- Thanh toán: SePay (chuyển khoản / QR, webhook, tự mở quyền). Hoàn tiền xử lý tay trong Admin.
- **Công cụ xây app: toàn bộ bằng Claude Code** (Chủ dự án chọn, 2026-09-25).
- **Cách làm việc mới (Chủ dự án “làm theo đề xuất”, 2026-09-25):**
  1. Lưu code lên GitHub (kho riêng tư).
  2. Đưa bản xem thử lên Vercel **ngay sau khi Phase 2 được duyệt** (trước đây để tới Phase 4) — xem trên điện thoại, gửi link cho người thử; bản xem thử bật trang `/mau` bằng biến `VITE_DEMO=1`, bản thật cho khách không có.
  3. Chia Phase 3 thành **3a** (tài khoản thật + dữ liệu trên máy chủ, cả nhà dùng chung) · **3b** (lưu tệp, link mời dùng được trên máy khác, bản đồ tìm vị trí từ địa chỉ, gửi OTP thật) · **3c** (kích hoạt hồ sơ trên máy chủ, nhật ký, xuất / xóa dữ liệu) — mỗi phần duyệt riêng.
  4. Góp ý theo mã màn (ví dụ “S-FIN-01: …”), gom nhiều ý một lần; mỗi đợt lưu mốc và cập nhật tệp này.
  - Mật khẩu, khóa bí mật: Chủ dự án tự nhập vào trang cài đặt của dịch vụ (Vercel / Supabase), không gửi qua tin nhắn, không lưu trong dự án.

## Việc Chủ dự án cần chuẩn bị
- [x] Git đã cài lại (2.55)
- [x] Tài khoản **GitHub** (huyenthu86qt) — kho riêng tư tron-hieu
- [x] Tài khoản **Vercel** (nhóm Auto365, gói Hobby) — dự án tron-hieu, Root Directory = app, biến VITE_DEMO=1
- [x] Tài khoản **Supabase** — dự án tron-hieu (Singapore); đã chạy tệp tạo bảng + phân quyền, đã tắt “Confirm email” (25/09/2026)
- [x] **Bản đồ**: Photon / OpenStreetMap (miễn phí) + mở Google Maps. **OTP SMS / Zalo**: hoãn tới khi có hộ kinh doanh (phương án: Zalo ZNS chính + SMS dự phòng); thay bằng đăng nhập Google + mời bằng link
- [ ] Tài khoản **SePay** (thử + thật) và tài khoản ngân hàng nhận — trước Phase 4
- [ ] Chốt giá bán — trước khi mở bán

## Bước hiện tại
- ✓ Ý tưởng · ✓ Nghiên cứu · ✓ Cấu trúc (v2) · ✓ Trải nghiệm · ✓ Hoàn thiện vận hành (đặc tả)
- ✓ **Gói xây app** — `docs/Goi-xay-app-App-Dam-Hieu.md` (4 phase, cả 4 bằng Claude Code)
- ✓ **Xây app — Phase 1: Nền giao diện & phần lõi** — APPROVE 25/09/2026 (mốc caae070)
- ✓ **Xây app — Phase 2: Giao diện phần còn lại** — APPROVE 25/09/2026 (mốc f13fb1f, gồm thanh bên tone nâu, tên Trọn Hiếu, trang /mau)
- ✓ **Bản xem thử online** — https://tron-hieu.vercel.app (xem như khách trả phí: /mau) · code: https://github.com/huyenthu86qt/tron-hieu (riêng tư) · mỗi lần đẩy code lên GitHub, Vercel tự cập nhật
- ✓ **Xây app — Phase 3a: Tài khoản thật + dữ liệu trên máy chủ** — APPROVE 25/09/2026 (mốc dbc7b3f). Supabase (Singapore) đã cài, bản online dùng máy chủ; đăng nhập bằng số điện thoại; Admin: 0784869988. Kèm sửa theo góp ý: lọc Việc của tôi, việc của mình nổi màu, xong việc tự về danh sách, trả lại việc kèm lý do, nhãn Chưa có người nhận màu cam đất
- ✓ **Xây app — Phase 3b: Tệp, link mời, bản đồ, đăng nhập Google** — APPROVE 26/09/2026 (mốc 19fade9). Lưu tệp riêng tư; link nhờ việc trên máy khác; tìm vị trí từ địa chỉ + Google Maps khi danh bạ trống; danh bạ tự lớn lên từ gia đình; mời vào đội bằng link; đăng nhập Google; tự đổi số; Admin cấp mật khẩu tạm. OTP SMS/Zalo hoãn tới khi có hộ kinh doanh
- ✓ **Xây app — Phase 3c: Chuyển quyền, xuất / xóa dữ liệu** — APPROVE 26/09/2026 (mốc b2ec9c2). Chuyển quyền người đại diện; chỉ xóa khi khách yêu cầu, sau 7 ngày (tự chạy 2 giờ sáng); người đại diện xóa tài khoản phải chuyển quyền trước; giữ đơn hàng làm chứng từ; bản lưu đám hiếu in được + bảng tính; Admin xem yêu cầu chờ xóa, dọn tệp
- ● **Phase 3d “Nghĩa tình”** — đã lên bản online (7415a12, 26/09/2026): **Sổ tưởng nhớ** (miễn phí mọi gia đình; chỉ mình tôi / gia đình / công khai; khách gửi lời tưởng nhớ từ trang cáo phó, người đại diện duyệt) và **Góc bình an** (bài viết Admin; 5 bài mẫu dạng nháp chờ Chủ dự án duyệt). Hai phần tách riêng theo ý Chủ dự án. Thêm: báo trong chuông Thông báo, nút Tải Sổ tưởng nhớ, **chuông chánh niệm** (trầm, ngắn ~1,8 giây, Chủ dự án chọn; chỉ cho Sổ tưởng nhớ, lời tưởng nhớ, mốc 49/100 ngày/giỗ; khoảnh khắc dừng lại; bật/tắt trong Tài khoản) (5913261). **Góc Bình An theo cấu trúc của Chủ dự án** (52b3618 + 0008 đã chạy): nằm ở thanh menu chính; hai chuyên mục Nghệ thuật sống / Nghệ thuật chết, bài 01–05, “Một phút nhìn lại” cuối bài, lời mở đầu và Thông điệp; 10 bài của Chủ dự án ở dạng nháp chờ thêm ảnh đại diện và bấm Đăng. Chờ duyệt
  - Chạy thử vai khách hàng 2 lượt (26/09/2026, b4df077 + 8a5958d): sửa 3 lỗi (trả tiền xong bị đưa lại trang mời mua; kẹt ở Báo vấn đề qua link; cáo phó báo “đã thay đổi” sai) và nhiều điểm dễ dùng (xưng anh/chị theo quan hệ, hỏi lại trước khi chốt giờ an táng, số điện thoại chạm là gọi, địa chỉ + Chỉ đường trên cáo phó, ghi chi Đã trả/Chưa trả, trang chủ hiện việc của lúc này). Chờ Chủ dự án quyết: mời người miễn phí hay trả phí; số hỗ trợ; nội dung hướng dẫn khai tử; thêm nhà cung cấp vào danh bạ.
- ○ **Phase 4** — sau 3d: thanh toán thật (SePay), vận hành, Working App
- ○ Phase 4 · ○ Working App · ○ Sales Page · ○ Kiểm chứng thị trường

## Mốc các phase
| Phase | Trạng thái | Mốc (commit / snapshot) |
|---|---|---|
| 1 Nền giao diện & phần lõi | APPROVE 25/09/2026 | caae070 |
| 2 Giao diện phần còn lại | APPROVE 25/09/2026 | f13fb1f |
| Bản xem thử online (GitHub + Vercel) | Đã chạy 25/09/2026 — https://tron-hieu.vercel.app | — |
| 3a Tài khoản thật + dữ liệu trên máy chủ | APPROVE 25/09/2026 | dbc7b3f |
| 3b Tệp, link mời, bản đồ, đăng nhập Google | APPROVE 26/09/2026 (OTP hoãn tới khi có hộ kinh doanh) | 19fade9 |
| 3c Chuyển quyền, xuất / xóa dữ liệu | APPROVE 26/09/2026 | b2ec9c2 |
| 4 Thanh toán, vận hành & Working App | Chưa bắt đầu | — |

> Ghi nhớ cho Phase 4 (Chủ dự án chốt 26/09/2026): khi chuyển thanh toán SePay từ **thử** sang **thật**, app tự xóa toàn bộ đơn hàng và giao dịch giả lập của giai đoạn thử (chỉ làm một lần, có ghi nhật ký). Trước lúc đó cứ để nguyên dữ liệu thử.

## Phase 1 — ghi chú bàn giao
- Chạy thử: trong thư mục `app/`: `npm install` (lần đầu) → `npm run dev` → mở http://localhost:5173
- Kiểm thử phần lõi: `npm test` (41 bài, xanh) · `npm run build` sạch · không lỗi console
- Màn đã xây: S-ENT-01/02/03/06 · S-MAP-01/02/04 (máy tính chia đôi)/05/07 · S-DEC-01/02/03 · S-TEAM-01/02/03/04/06/08
- Dữ liệu Phase 1 lưu trên máy (trình duyệt); link mời người hỗ trợ chỉ mở được trên cùng thiết bị cho tới Phase 3
- Mục Nhà cung cấp / Tài chính / Khách viếng / Hậu tang hiện trang “mở ở giai đoạn 2”

## Phase 2 — ghi chú bàn giao
- Đã xây: Nhà cung cấp (gợi ý gần nhất theo tọa độ, trọn gói, NCC gia đình, báo giá / cam kết / phát sinh / nghiệm thu, quyết định khi bên đã cam kết ở xa) · Tài chính (đề nghị chi, duyệt, nguồn tiền 4 số cuối, tài khoản bên nhận chỉ quyền Tài chính, sổ phúng viếng, công nợ, đối soát & khóa) · Khách viếng (ghi nhanh, danh sách, bàn giao ca, trang thông tin công khai tự cập nhật khi đổi quyết định) · Hậu tang (thủ tục, mốc tưởng niệm âm lịch, cảm ơn theo từng người con, khép vòng) · Chuẩn bị trước + kích hoạt + tiếp nhận · Đăng ký / đăng nhập / quên mật khẩu / hết phiên · Tài khoản · Checkout (giả lập) · Admin (tổng quan, người dùng, đơn hàng, quyền, gói & giá, SePay, giao dịch chưa khớp, danh bạ NCC, nhật ký) · Trang pháp lý khung · Việc của tôi, Tài liệu, Lịch sử, Cài đặt, Tìm kiếm, Thông báo
- Giả lập đến Phase 3–4: mã OTP hiện trên màn (chưa có bên gửi tin nhắn); thanh toán giả lập, ghi rõ “chưa thanh toán thật”; dữ liệu vẫn lưu trên trình duyệt; tệp chỉ ghi tên; vị trí nhập bằng tọa độ hoặc “Dùng vị trí hiện tại” (chưa có dịch vụ bản đồ)
- Giá đang là giá thử nghiệm (299.000 đ / 199.000 đ) — chị chốt giá (U1) trước khi mở bán
- Kiểm thử: `npm test` 64 bài xanh · `npm run build` sạch
- Xem như khách trả phí: chạy thử trên máy → mở http://localhost:5180/mau → “Dựng dữ liệu mẫu và vào app”
- Sau Phase 2: thanh điều hướng bên trái đổi sang tone nâu (Chủ dự án yêu cầu) — `app/src/styles/shell-overrides.css`
