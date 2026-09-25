# TRẠNG THÁI DỰ ÁN — APP ĐÁM HIẾU

**Cập nhật:** 2026-09-25 · Snapshot v6

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

## Việc Chủ dự án cần chuẩn bị
- [ ] Bên gửi OTP (SMS / Zalo) — trước Giai đoạn 3
- [ ] Tài khoản Supabase — trước Giai đoạn 3
- [ ] Tài khoản SePay (thử + thật) và tài khoản ngân hàng nhận — trước Giai đoạn 3–4
- [ ] Tài khoản Vercel (hoặc tương tự) để đưa app lên mạng — trước Giai đoạn 4
- [x] Git đã cài lại (2.55) — [ ] GitHub (khuyên có) nếu muốn lưu bản sao trên mạng
- [ ] Chốt giá bán — trước khi mở bán

## Bước hiện tại
- ✓ Ý tưởng · ✓ Nghiên cứu · ✓ Cấu trúc (v2) · ✓ Trải nghiệm · ✓ Hoàn thiện vận hành (đặc tả)
- ✓ **Gói xây app** — `docs/Goi-xay-app-App-Dam-Hieu.md` (4 phase, cả 4 bằng Claude Code)
- ✓ **Xây app — Phase 1: Nền giao diện & phần lõi** — APPROVE 25/09/2026 (mốc caae070)
- ● **Xây app — Phase 2: Giao diện phần còn lại** — đang xây
- ○ Phase 3 · ○ Phase 4 · ○ Working App · ○ Sales Page · ○ Kiểm chứng thị trường

## Mốc các phase
| Phase | Trạng thái | Mốc (commit / snapshot) |
|---|---|---|
| 1 Nền giao diện & phần lõi | APPROVE 25/09/2026 | caae070 |
| 2 Giao diện phần còn lại | Đang xây | — |
| 3 Máy chủ & dữ liệu thật | Chưa bắt đầu | — |
| 4 Thanh toán, vận hành & Working App | Chưa bắt đầu | — |

## Phase 1 — ghi chú bàn giao
- Chạy thử: trong thư mục `app/`: `npm install` (lần đầu) → `npm run dev` → mở http://localhost:5173
- Kiểm thử phần lõi: `npm test` (41 bài, xanh) · `npm run build` sạch · không lỗi console
- Màn đã xây: S-ENT-01/02/03/06 · S-MAP-01/02/04 (máy tính chia đôi)/05/07 · S-DEC-01/02/03 · S-TEAM-01/02/03/04/06/08
- Dữ liệu Phase 1 lưu trên máy (trình duyệt); link mời người hỗ trợ chỉ mở được trên cùng thiết bị cho tới Phase 3
- Mục Nhà cung cấp / Tài chính / Khách viếng / Hậu tang hiện trang “mở ở giai đoạn 2”

