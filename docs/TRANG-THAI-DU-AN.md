# TRẠNG THÁI DỰ ÁN — APP ĐÁM HIẾU

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
- [ ] Tài khoản **GitHub** — ngay bây giờ (lưu code, điều kiện để đưa lên mạng)
- [ ] Tài khoản **Vercel** (đăng nhập bằng GitHub) — ngay sau khi Phase 2 được duyệt
- [ ] Tài khoản **Supabase** — trước Phase 3a
- [ ] Chọn **bên gửi OTP** (SMS / Zalo) và **dịch vụ bản đồ** — trước Phase 3b (em so sánh lựa chọn khi tới đó)
- [ ] Tài khoản **SePay** (thử + thật) và tài khoản ngân hàng nhận — trước Phase 4
- [ ] Chốt giá bán — trước khi mở bán

## Bước hiện tại
- ✓ Ý tưởng · ✓ Nghiên cứu · ✓ Cấu trúc (v2) · ✓ Trải nghiệm · ✓ Hoàn thiện vận hành (đặc tả)
- ✓ **Gói xây app** — `docs/Goi-xay-app-App-Dam-Hieu.md` (4 phase, cả 4 bằng Claude Code)
- ✓ **Xây app — Phase 1: Nền giao diện & phần lõi** — APPROVE 25/09/2026 (mốc caae070)
- ● **Xây app — Phase 2: Giao diện phần còn lại** — đã xây xong, **chờ Chủ dự án duyệt (APPROVE / NEEDS_FIX)**
- ○ Đưa bản xem thử lên mạng (GitHub + Vercel) · ○ Phase 3a · ○ 3b · ○ 3c · ○ Phase 4 · ○ Working App · ○ Sales Page · ○ Kiểm chứng thị trường

## Mốc các phase
| Phase | Trạng thái | Mốc (commit / snapshot) |
|---|---|---|
| 1 Nền giao diện & phần lõi | APPROVE 25/09/2026 | caae070 |
| 2 Giao diện phần còn lại | Xong — chờ duyệt | commit “Phase 2 (8/8)” (xem git log) |
| Bản xem thử online (GitHub + Vercel) | Chờ tài khoản của Chủ dự án | — |
| 3a Tài khoản thật + dữ liệu trên máy chủ | Chưa bắt đầu | — |
| 3b Tệp, link mời, bản đồ, OTP thật | Chưa bắt đầu | — |
| 3c Kích hoạt, nhật ký, xuất / xóa dữ liệu | Chưa bắt đầu | — |
| 4 Thanh toán, vận hành & Working App | Chưa bắt đầu | — |

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
