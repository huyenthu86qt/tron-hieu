# LOVABLE / CODEX BUILD PACKAGE — APP ĐÁM HIẾU

**Ngày:** 2026-09-25 · **Công cụ thực hiện:** **Claude Code cho cả 4 giai đoạn** (Chủ dự án chọn, 2026-09-25). Claude Code giữ vai trò “Codex” trong quy trình.
**Nguồn chuẩn (không được diễn giải lại):**
- `docs/Kien-truc-san-pham-cuoi-App-Dam-Hieu.md` — LOCK_PRODUCT_STRUCTURE v2
- `docs/Dac-ta-trai-nghiem-san-pham-App-Dam-Hieu.md` — LOCK_PRODUCT_EXPERIENCE
- `docs/Ke-hoach-ban-mau-truc-quan-App-Dam-Hieu.md` — 102 chức năng, 72 màn, traceability (mục 12, 14b)
- `docs/Hoan-thien-van-hanh-App-Dam-Hieu.md` — Production Completeness
- `prototype/ban-mau-dam-hieu.html` — bản mẫu đã duyệt (online: https://claude.ai/artifact/EEVYDuFwx3ndNYtTeNUgkp)

```text
SALES_PAGE_BUILD_STATUS: DEFERRED_POST_WORKING_APP
CHECKOUT_BUILD_STATUS: INCLUDED_IN_CORE_APP
```
Public Sales Page is deferred until after WORKING_APP — không xây trong bất kỳ giai đoạn nào dưới đây.

---

## Executive Production Product Map

```text
APP ĐÁM HIẾU (web app, máy tính + điện thoại)
├── Lối vào miễn phí, không cần tài khoản: hoàn cảnh → việc cần làm ngay
├── Tài khoản: SĐT + mật khẩu · OTP khi đăng ký / quên mật khẩu · Tài khoản của tôi
├── Đám hiếu (9 module đã khóa)
│   ├── Miễn phí: Hồ sơ người mất · Bây giờ · Bản đồ · Chi tiết việc · Cần quyết
│   └── Trả phí “Mở đầy đủ” (đến hết giỗ đầu): Đội · Nhà cung cấp · Tài chính · Khách viếng & cáo phó · Hậu tang
├── Chuẩn bị trước (miễn phí tạo hồ sơ; trả phí lưu giấy tờ, chia sẻ, kích hoạt)
├── Thanh toán /checkout: đơn → QR chuyển khoản → SePay webhook → khớp → mở quyền
├── Trang công khai: cáo phó /t/:slug · việc được nhờ /l/:token
└── Admin: tổng quan · người dùng · đơn & thanh toán · quyền · gói & giá · SePay · giao dịch chưa khớp · danh bạ nhà cung cấp · nhật ký
```

## Delivery Architecture

| Lớp | Lựa chọn đề xuất | Ghi chú |
|---|---|---|
| Giao diện | **React + TypeScript + Vite**, React Router | Chuyển thẳng token màu, chữ, khung máy tính / điện thoại từ bản mẫu (CSS thuần, biến CSS) |
| Dữ liệu phía giao diện | Lớp `repository` có kiểu rõ ràng; Phase 1–2 dùng bộ nhớ tạm, Phase 3 đổi sang Supabase | Không có dữ liệu mẫu trong app thật; chỉ có seed cho môi trường phát triển |
| Quy tắc nghiệp vụ dùng chung | Thư mục `src/domain/` (TypeScript thuần, có test): sinh việc theo hoàn cảnh, tác động quyết định, dời ngày theo ngày mất, lịch âm, điều kiện khép vòng, xếp hạng nhà cung cấp | Dùng được cả ở trình duyệt và máy chủ |
| Máy chủ | **Supabase**: Postgres + Row Level Security, Auth (SĐT + mật khẩu), Storage, Edge Functions | Webhook SePay chạy trên Edge Function (HTTPS công khai sẵn) |
| OTP | Auth Hook gửi SMS của Supabase → nhà cung cấp OTP Chủ dự án chọn (U4) | Chỉ khi đăng ký và quên mật khẩu |
| Bản đồ / khoảng cách | Tọa độ lưu sẵn; khoảng cách tính bằng công thức Haversine; chuyển địa chỉ thành tọa độ qua Edge Function gọi dịch vụ bản đồ (chốt trước Phase 3) | Admin vẫn đặt ghim tay được |
| Thanh toán | **SePay**: QR chuyển khoản + webhook, khớp mã đơn / số tiền / tài khoản | Theo SePay rulebook |
| Đưa lên mạng | **Vercel** (giao diện) + Supabase (máy chủ) | Phase 4 |
| Kiểm thử | Vitest (quy tắc nghiệp vụ, khớp giao dịch), Playwright (luồng chính) | |

## Information Architecture

```text
/                         S-ENT-01   (công khai)
/bat-dau/hoan-canh        S-ENT-02   (công khai)
/bat-dau/viec-ngay        S-ENT-03   (công khai)
/dang-ky /dang-nhap /quen-mat-khau              S-AUTH-01..04
/tai-khoan                S-ACC-01
/app                      S-HOME-01  (đám hiếu + hồ sơ chuẩn bị của tôi)
/dh/:id                   S-MAP-01   Bây giờ
/dh/:id/ho-so             S-ENT-06
/dh/:id/ban-do            S-MAP-02   (+ sheet S-MAP-05, S-MAP-07)
/dh/:id/viec/:tid         S-MAP-04
/dh/:id/can-quyet         S-DEC-01 · /quyet-dinh/:did S-DEC-02 · /thay-doi S-DEC-03
/dh/:id/doi               S-TEAM-01 (+ sheet 02/03/04/08)
/dh/:id/nha-cung-cap      S-VEN-01 · /goi-y/:hm S-VEN-02 · /:vid S-VEN-03 (+ sheet S-VEN-04, trọn gói)
/dh/:id/tai-chinh         S-FIN-01 · /phung-vieng S-FIN-06 · /doi-soat S-FIN-07 (+ sheet S-FIN-03)
/dh/:id/khach-vieng       S-GST-01 · /trang-tin S-GST-02 (+ sheet S-GST-05)
/dh/:id/hau-tang          S-AFT-01 · /moc S-AFT-03 · /cam-on S-AFT-05 · /khep-vong S-AFT-06
/dh/:id/tiep-nhan         S-ENT-07
/chuan-bi/:id             S-PRE-03 · /nguyen-vong S-PRE-04 · /kich-hoat S-PRE-09
/checkout                 S-CHK-01..05 (+ S-CHK-00 “Mở đầy đủ”)
/t/:slug                  S-GST-03   (công khai)
/l/:token                 S-TEAM-06  (công khai, có mã bí mật)
/admin/...                Admin (tài khoản Admin)
/dieu-khoan /bao-mat      Trang pháp lý
```

## Complete Screen Inventory

- **72 màn / 102 chức năng** theo Kế hoạch bản mẫu (mục 4 + 14b), gồm màn HF và màn theo mẫu dùng lại.
- **Thêm ở Production Completeness:** S-AUTH-01 Đăng ký · S-AUTH-02 Đăng nhập · S-AUTH-03 Quên mật khẩu · S-AUTH-04 Hết phiên · S-ACC-01 Tài khoản · S-CHK-00 Mở đầy đủ · S-CHK-01 Chọn gói · S-CHK-02 Chuyển khoản / QR · S-CHK-03 Chờ xác nhận · S-CHK-04 Thành công · S-CHK-05 Hết hạn / lỗi · Admin: Tổng quan, Người dùng, Chi tiết người dùng, Đơn hàng, Quyền truy cập, Gói & giá, SePay, Giao dịch chưa khớp, Nhật ký · Trang pháp lý (2).
- **Không xây:** khối “Điều khiển bản mẫu”, nút “Gia đình trống / Dữ liệu mẫu” (chỉ dành cho bản mẫu).

## Module Specification

Đặc tả đầy đủ tại Kiến trúc sản phẩm mục 6 và 6.10. Tóm tắt điểm bắt buộc khi build:

| Module | Bắt buộc |
|---|---|
| Khởi động & Hồ sơ | Hoàn cảnh (nơi mất, nơi làm lễ, hình thức an táng, 4 hình thức tổ chức, đối tượng, nghi lễ, quy mô); hồ sơ người mất với ngày âm, tuổi âm, danh xưng; đám hiếu mới bắt đầu trống |
| Bản đồ | Sinh việc từ bộ mẫu theo điều kiện; nhãn loại + “Vì: …”; phụ thuộc; việc khóa; việc riêng; “Không áp dụng”; hạn tính từ ngày mất |
| Quyết định | Quyết định gốc (nơi làm lễ, hình thức an táng, giờ an táng), tác động trước khi đổi, quyết định Ban lễ tang (đề xuất / chủ trì) |
| Đội | Full / Limited / Link; vùng trách nhiệm sửa được; Ban lễ tang, hỗ trợ địa phương; link có hạn, thu hồi được |
| Nhà cung cấp | Gợi ý đúng + gần nhất, tự tính lại; trọn gói; nhà cung cấp gia đình; không tự gán, không tự thay bên đã cam kết |
| Tài chính | Người chi, hình thức, nguồn tiền, tài khoản bên nhận; theo nguồn tiền; đơn vị chi trả tách riêng; đối soát tiền mặt / chuyển khoản; khóa |
| Khách viếng | Ghi nhanh; khách của ai; hình thức phúng viếng; cáo phó theo nghi lễ; tự cập nhật khi đổi quyết định |
| Hậu tang | Chặng 13–15 dùng chung; mốc tưởng niệm kèm âm lịch; danh sách cảm ơn; khép vòng theo điều kiện |
| Chuẩn bị trước | Hồ sơ theo nhóm, % sẵn sàng, chia sẻ, kích hoạt → tiếp nhận |

## Shared Product Experience

Theo Đặc tả trải nghiệm đã khóa: thanh bên trái trên máy tính; bottom navigation 5 mục + “Thêm” trên điện thoại; bottom sheet (điện thoại) / ngăn kéo phải (máy tính); toast “Đã …”; kính ngữ; mẫu trạng thái chung; Chế độ tang gia; giao diện tối “Canh đêm”.

## Prototype-to-Build Traceability

Dùng nguyên bảng ở **Kế hoạch bản mẫu mục 12** và **Đặc tả trải nghiệm mục “Prototype-to-Build Traceability”**. Mỗi màn khi build phải: mở đúng `#<Screen ID>` trên bản mẫu làm chuẩn; giữ thứ bậc thông tin, nhãn, nút, trạng thái; chỉ thích ứng theo cột “Thích ứng được phép”; không làm điều ở cột “Cấm diễn giải lại”.

## Data and Relationship Model

| Bảng | Trường chính | Quan hệ / quyền (RLS) |
|---|---|---|
| `profiles` | user_id, họ tên, SĐT, is_admin | 1–1 auth.users; chỉ chính chủ |
| `cases` (đám hiếu) | hoàn cảnh (place, venue, form, rite, org_model, org_type, scale), người mất (title, name, saint, birth_year, death_date, death_time, hometown, photo_path), cur_phase, plan (free / full), full_until | Thành viên xem theo quyền |
| `case_members` | case_id, user_id?, tên, quan hệ, access (full/limited/link/org), areas[], role | U1 tạo; Limited chỉ thấy vùng của mình |
| `case_areas` | case_id, tên | |
| `task_templates` (cấu hình) | id, tiêu đề, chặng, kind, why, điều kiện (form/rite/org/venue/place/scale/pre), deps, lock, steps theo nghi lễ, hạn tương đối | Nạp từ tệp cấu hình (U8) |
| `tasks` | case_id, template_id?, custom, tiêu đề, chặng, hạn, owner, area, status (todo/doing/issue/done/skip), skip_reason, note, evidence_path | |
| `decisions` / `decision_options` | case_id, loại (root/approval/vendor/org), trạng thái, lựa chọn, người quyết | Chỉ U1 chốt; Ban lễ tang đề xuất |
| `link_tokens` | case_id, member_id, token_hash, hết hạn, thu hồi | Link User chỉ đọc / cập nhật việc được giao |
| `vendor_directory` | tên, SĐT, categories[], lat, lng, bán kính, điều kiện, hoạt động, is_package | Admin ghi; mọi người đọc |
| `case_vendors` | case_id, vendor_id? hoặc thông tin nhà cung cấp gia đình, category, trạng thái (suggest/confirmed/committed), nghiệm thu | |
| `quotes`, `commitments`, `incidents` | case_vendor_id, … | |
| `funds` | case_id, tên gợi nhớ, loại, 4 số cuối | Quyền Tài chính |
| `expenses` | case_id, khoản, số tiền, đã trả, trạng thái, người chi, hình thức, fund_id, payee (chủ TK, ngân hàng, số TK), chứng từ, extra, org_paid | Quyền Tài chính; payee chỉ Tài chính |
| `condolences` | case_id, tên, nhóm, of_member, số tiền, hình thức, lễ vật, người ghi | Ghi: người trực; xem số tiền: quyền Tài chính |
| `public_pages` | case_id, slug, lời báo tin, hiện SĐT, đã công bố | Trang công khai chỉ đọc |
| `memorial_milestones` | case_id, loại, cách tính, ngày dương, ngày âm | |
| `thanks` | condolence_id, đã cảm ơn | |
| `pre_need_profiles` + `pre_need_groups` | chủ sở hữu, người được chia sẻ, trạng thái, activated_case_id | |
| `documents` | owner (case / pre_need), path | Storage có chính sách theo case |
| `products`, `prices` | loại gói, giá, thời hạn, bật / tắt | Admin |
| `orders` | user_id, product, case_id / pre_need_id, amount, mã đơn, trạng thái, hạn | Chính chủ + Admin |
| `sepay_transactions` | provider_tx_id (UNIQUE), số tiền, nội dung, tài khoản, raw đã lọc, trạng thái khớp | Chỉ máy chủ + Admin |
| `access_grants` | case_id / pre_need_id, order_id, active_until, nguồn (payment / manual / activation) | Máy chủ ghi |
| `audit_log` | ai, việc gì, đối tượng, lúc nào (chỉ ghi thêm) | Admin đọc |

## Authentication and Access

Theo Production Completeness: đăng ký SĐT + mật khẩu + OTP; đăng nhập; quên mật khẩu bằng OTP; khóa tạm khi sai nhiều; không bắt đăng ký trước S-ENT-03; câu trả lời lưu tạm rồi chuyển lên máy chủ khi đăng ký; RLS cho mọi bảng; Link User bằng token băm; Admin tách riêng; trạng thái trả phí theo từng đám hiếu / hồ sơ chuẩn bị, **kiểm tra ở máy chủ**.

## Commerce

- Gói: “Mở đầy đủ đám hiếu” (đến hết giỗ đầu) · “Chuẩn bị trước”. Giá do Admin nhập; môi trường thử dùng giá thử.
- Luồng: S-CHK-00 → `/checkout` → tạo `orders` (mã đơn duy nhất, hạn) → QR + nội dung chuyển khoản → webhook SePay (xác thực) → lưu `sepay_transactions` (UNIQUE provider_tx_id) → khớp mã + số tiền + tài khoản bật → `orders.paid` → `access_grants` → quyền mở.
- Không khớp → Giao dịch chưa khớp; Admin gán tay / hoàn tiền (có lý do, nhật ký).
- Kích hoạt hồ sơ chuẩn bị đã trả phí → đám hiếu mở đầy đủ, không thu lần hai.

## Admin

Tổng quan · Người dùng (không xem nội dung riêng tư) · Đơn hàng & thanh toán · Quyền truy cập (mở / thu hồi tay có lý do) · Gói & giá · Admin → Cài đặt → Thanh toán → SePay (8 phần theo rulebook, kiểm tra kết nối, khóa bí mật chỉ ở máy chủ) · Giao dịch chưa khớp · Danh bạ nhà cung cấp (S-ADM-01/02) · Nhật ký.

## Visual and UX Direction

Chuyển nguyên hệ token của bản mẫu: nền ngà #F7F3EC, nâu trầm hương #7A5A3A, vàng đồng #B8893E, rêu #5E7359, đỏ son #9E4638; giao diện tối “Canh đêm”; Noto Serif + Be Vietnam Pro; ảnh chờ theo nghi lễ (hoa sen / thánh giá / nến); kính ngữ, không emoji, không cảm thán.

## Responsive Behavior

Theo Responsive Navigation Rules đã khóa: máy tính có thanh bên trái, Chi tiết việc chia đôi, bảng cuộn ngang trong khung; điện thoại có bottom nav 5 mục, bottom sheet, thẻ thay bảng, vùng bấm ≥ 44px, chữ ≥ 16px, chừa vùng an toàn. Admin: máy tính là chính.

## System States

Theo System State Patterns đã khóa + trạng thái Auth, trả phí, lưu lỗi, phiên hết hạn, link hết hạn, bảo trì (Production Completeness).

## Repository Collaboration Protocol

- **Một công cụ:** Claude Code làm cả giao diện lẫn máy chủ nên không cần chuyển giao giữa hai công cụ.
- **Git (khuyên dùng):** Git trên máy hiện chạy lỗi. Khuyên Chủ dự án cài lại Git (git-scm.com) **trước Phase 1**; mỗi phase kết thúc bằng một commit và ghi mã commit vào `docs/TRANG-THAI-DU-AN.md`. Nếu chưa có Git: sau mỗi phase Claude Code tạo bản nén thư mục `snapshots/phase-N.zip` làm mốc.
- **GitHub:** không bắt buộc; khi có, đẩy mã lên kho riêng tư để lưu trữ và để Vercel đưa lên mạng.
- **Khóa bí mật** chỉ nằm trong `.env.local` (không đưa vào Git) và kho bí mật của Supabase / Vercel. Claude Code không nhập khóa thay Chủ dự án.

## Do Not Build

- Public Sales Page, trang giới thiệu marketing, lời bán hàng, câu hỏi thường gặp mang tính bán hàng.
- Khối “Điều khiển bản mẫu”, nút “Gia đình trống / Dữ liệu mẫu”, dữ liệu mẫu hư cấu trong app thật.
- Marketplace mở, nhà cung cấp tự đăng ký, đặt lịch / thanh toán cho nhà cung cấp qua app, đánh giá sao.
- App tự gán nhà cung cấp; tự thay bên đã cam kết; AI tự quyết hoặc tự công bố.
- Nhận hoặc chuyển tiền phúng viếng thay gia đình.
- Admin xem nội dung riêng tư của gia đình.
- Tưởng niệm nâng cao, hóa đơn điện tử, Admin chỉnh bộ việc mẫu (Later).
- Hướng dẫn pháp lý không có nguồn đã kiểm chứng.

## Build Complexity Assessment

**Lớn:** 9 module, 72 màn, bộ quy tắc sinh việc nhiều nhánh, phân quyền theo vùng và theo tiền, trang công khai, SePay + đối soát, Admin. → **4 giai đoạn** (mức tối đa cho phép).

## Phased Build Plan

| Phase | Tên | Default Tool | Tool Used | Phạm vi |
|---|---|---|---|---|
| **1** | Nền giao diện & phần lõi | Default Tool: LOVABLE | Claude Code (Chủ dự án chọn) | Khởi tạo dự án, token, khung máy tính / điện thoại, routing, lớp repository bộ nhớ tạm, `src/domain` (sinh việc, dời ngày, âm lịch, tác động) có test; màn S-ENT-01/02/03/06, S-MAP-01/02/04/05/07, S-DEC-01/02/03, S-TEAM-01/02/03/04/06/08 |
| **2** | Giao diện phần còn lại | Default Tool: LOVABLE | Claude Code (Chủ dự án chọn) | Nhà cung cấp (kể cả trọn gói, NCC gia đình), Tài chính, Khách viếng & cáo phó, Hậu tang, Chuẩn bị trước + tiếp nhận, Auth, Tài khoản, Checkout (trạng thái giả lập), Admin (giao diện), trang pháp lý khung |
| **3** | Máy chủ & dữ liệu thật | Default Tool: CODEX | Claude Code | Supabase: bảng, RLS, Auth SĐT + OTP hook, Storage, nối mọi màn vào dữ liệu thật, link token, danh bạ + khoảng cách + chuyển địa chỉ, kích hoạt hồ sơ, nhật ký, xuất / xóa dữ liệu |
| **4** | Thanh toán, vận hành & Working App | Default Tool: CODEX | Claude Code | Gói & giá, đơn, `/checkout` thật, webhook SePay, khớp, idempotency, mở quyền + chặn quyền ở máy chủ, Admin vận hành & đối soát, đưa lên Vercel, test E2E, báo cáo Working App |

**Chuẩn bị của Chủ dự án theo phase:** trước Phase 1: (khuyên) cài Git · trước Phase 3: tài khoản Supabase, bên gửi OTP, chọn dịch vụ bản đồ · trước Phase 4: SePay (thử + thật), tài khoản ngân hàng nhận, Vercel, GitHub (nếu dùng).

## Phase Dependency Map

```text
PHASE 1 (khung + domain + lõi) ──duyệt──► PHASE 2 (giao diện còn lại)
        │                                        │
        └── domain dùng lại ở máy chủ ───────────┴──duyệt──► PHASE 3 (Supabase, RLS, Auth, dữ liệu thật)
                                                                    │
                                                                    └──duyệt──► PHASE 4 (SePay, mở quyền, Admin vận hành, deploy, E2E)
                                                                                     │
                                                                                     └──► WORKING_APP
```
Mỗi phase chỉ bắt đầu khi phase trước được Chủ dự án **APPROVE**.

## Definition of Done for Full V1

- 4 phase đều APPROVE; mỗi phase ghi công cụ gợi ý và công cụ thực dùng.
- 102 chức năng có giao diện đúng bản mẫu và hành vi máy chủ thật; không còn nút chết, không dữ liệu giả.
- Khung máy tính / điện thoại đúng Đặc tả trải nghiệm.
- Lối vào miễn phí → đăng ký → đám hiếu trống → dùng phần miễn phí → S-CHK-00 → `/checkout` → QR → SePay → khớp → quyền mở → dùng phần trả phí: chạy trọn trên môi trường thử.
- RLS chặn truy cập chéo; sổ phúng viếng và tài khoản bên nhận chỉ quyền Tài chính; Link User chỉ thấy việc được nhờ.
- Webhook gọi lại không mở quyền hai lần; giao dịch sai vào hàng chờ, Admin xử lý được.
- Sao lưu, theo dõi lỗi, trang pháp lý có mặt; không lộ khóa bí mật.
- Không có Sales Page.

## Lovable Default Frontend Prompt

> **Không dùng** — Chủ dự án chọn Claude Code cho cả 4 phase. Bản dự phòng nếu sau này muốn giao phần giao diện cho Lovable:
>
> “Xây giao diện App Đám Hiếu đúng theo bản mẫu HTML đính kèm (`prototype/ban-mau-dam-hieu.html`) và các tài liệu đã khóa trong `docs/`. EXECUTE PHASE 1 ONLY: … (dùng nguyên phần ‘Phase 1 Execution Prompt’ bên dưới). Không xây Sales Page. Dùng dữ liệu giả có kiểu rõ ràng, không giả làm hành vi thật. Khi xong, báo cáo và STOP.”

## Codex Default Backend Prompt

> Mẫu dùng cho Phase 3–4 (Claude Code thực hiện):
>
> “Bạn là Claude Code, thực hiện đúng MỘT phase của App Đám Hiếu. Đọc `docs/` (cấu trúc v2, trải nghiệm đã khóa, production completeness, gói xây app) và mã hiện có. EXECUTE PHASE N ONLY. Giữ nguyên giao diện đã duyệt; chỉ nối dữ liệu thật, phân quyền, logic, tích hợp. Khóa bí mật chỉ đọc từ biến môi trường, không ghi vào mã hay tài liệu. Viết migration có thể chạy lại, RLS cho mọi bảng, test cho quy tắc nghiệp vụ và thanh toán. Không xây Sales Page, không thêm phạm vi Later / Out. Kết thúc: tự kiểm theo tiêu chí nghiệm thu, báo cáo thay đổi, ghi mốc commit / snapshot, rồi STOP chờ Chủ dự án APPROVE hoặc NEEDS_FIX.”

## Phase 1 Execution Prompt

```text
EXECUTE PHASE 1 ONLY — Nền giao diện & phần lõi
Default Tool: LOVABLE · Tool Used: Claude Code (Chủ dự án chọn)
SALES_PAGE_BUILD_STATUS: DEFERRED_POST_WORKING_APP
CHECKOUT_BUILD_STATUS: INCLUDED_IN_CORE_APP

Mục tiêu
- Dự án React + TypeScript + Vite trong thư mục `app/` của dự án.
- Chuyển token, chữ, khung máy tính (thanh bên trái) và điện thoại (bottom nav 5 mục + “Thêm”) từ bản mẫu.
- Routing theo Information Architecture.
- Lớp repository có kiểu (bộ nhớ tạm, có thể lưu localStorage cho phát triển) — đổi sang Supabase ở Phase 3 mà không sửa màn.
- `src/domain/` có test: bộ mẫu việc (tệp cấu hình), sinh việc theo hoàn cảnh (form, rite, org_model, org_type, venue, place, scale, pre), phụ thuộc & việc khóa, dời hạn theo ngày mất, lịch âm Việt Nam + tuổi âm, tác động đổi quyết định (nơi làm lễ, hình thức an táng), điều kiện khép vòng.
- Màn: S-ENT-01, 02, 03, 06 · S-MAP-01, 02, 04 (chia đôi trên máy tính), 05, 07 · S-DEC-01, 02, 03 · S-TEAM-01, 02, 03, 04, 06, 08.
- Đám hiếu mới bắt đầu trống. Không có khối “Điều khiển bản mẫu”.

Chuẩn cho từng màn
- Mở `prototype/ban-mau-dam-hieu.html#<Screen ID>` ở cả Máy tính và Điện thoại; giữ thứ bậc, nhãn, nút, trạng thái; theo bảng traceability.

Không làm
- Supabase, đăng nhập thật, thanh toán thật (Phase 3–4). Các module Phase 2. Sales Page. Dữ liệu mẫu hư cấu.

Nghiệm thu
- `npm run dev` chạy; `npm test` xanh (domain).
- Đi hết: hoàn cảnh → việc ngay → hồ sơ người mất → Bây giờ → Bản đồ → chi tiết việc → giao việc → đổi quyết định có tác động → thêm / sửa / không áp dụng việc → sửa đội và vùng.
- Mọi nhánh (hỏa táng / địa táng, 4 hình thức tổ chức, 3 đối tượng, nghi lễ, nơi mất, nơi làm lễ, quy mô) sinh việc đúng như bản mẫu.
- Máy tính và điện thoại đúng khung; không cuộn ngang trang; không lỗi console.

Kết thúc
- Tự kiểm, báo cáo, ghi mốc (commit hoặc snapshot), cập nhật `docs/TRANG-THAI-DU-AN.md`.
- STOP. Không bắt đầu Phase 2 khi chưa có APPROVE.
```

## Continuation Prompts

- **Phase 2:** “EXECUTE PHASE 2 ONLY — Giao diện phần còn lại. Phase 1 đã APPROVE tại mốc <commit/snapshot>. Xây màn Nhà cung cấp, Tài chính, Khách viếng, Hậu tang, Chuẩn bị trước, Auth, Tài khoản, Checkout (trạng thái giả lập, ghi rõ ‘chưa thanh toán thật’), Admin, trang pháp lý khung — đúng bản mẫu. Không nối máy chủ. Không Sales Page. Tự kiểm, báo cáo, STOP.”
- **Phase 3:** “EXECUTE PHASE 3 ONLY — Máy chủ & dữ liệu thật. Phase 2 đã APPROVE tại mốc <…>. Supabase: migration theo Data Model, RLS, Auth SĐT + mật khẩu + OTP hook, Storage, nối repository, link token, danh bạ + khoảng cách + chuyển địa chỉ, kích hoạt hồ sơ, nhật ký, xuất / xóa dữ liệu. Tự kiểm (gồm test phân quyền), báo cáo, STOP.”
- **Phase 4:** “EXECUTE PHASE 4 ONLY — Thanh toán, vận hành & Working App. Phase 3 đã APPROVE tại mốc <…>. Gói & giá, đơn, `/checkout`, webhook SePay (xác thực, idempotency, khớp, chưa khớp), mở quyền + chặn quyền ở máy chủ, Admin vận hành, deploy Vercel, E2E Playwright, báo cáo Working App. Không Sales Page. STOP.”
- **Sửa lỗi trong phase (NEEDS_FIX):** “Phase N được đánh giá NEEDS_FIX với các điểm: <…>. Chỉ sửa các điểm này trong phạm vi Phase N, giữ nguyên phần đã đạt. Tự kiểm lại, báo cáo, STOP.”
