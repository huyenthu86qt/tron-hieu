# PRODUCTION COMPLETENESS SPEC — APP CORE — APP ĐÁM HIẾU

**Ngày:** 2026-09-25 · **Nguồn chuẩn:** LOCK_PRODUCT_STRUCTURE v2 · LOCK_PRODUCT_EXPERIENCE (2026-09-25)
**Quyết định của Chủ dự án (2026-09-25):** trả một lần mỗi đám hiếu + gói Chuẩn bị trước bán riêng · miễn phí tới Bản đồ · đăng nhập bằng số điện thoại + mật khẩu, quên mật khẩu lấy lại bằng OTP · giá do Admin nhập, Chủ dự án chốt trước khi mở bán.

```text
SALES_PAGE_BUILD_STATUS: DEFERRED_POST_WORKING_APP
CHECKOUT_BUILD_STATUS: INCLUDED_IN_CORE_APP
```

---

## Applicability Matrix — App Core

| Hệ thống | Disposition | Lý do |
|---|---|---|
| **Auth** | REQUIRED | Dữ liệu gia đình riêng tư, nhiều người cùng dùng, quyền trả phí |
| **Onboarding** | REQUIRED | Cần hoàn cảnh + hồ sơ người mất để ra giá trị đầu tiên (đã khóa ở trải nghiệm: S-ENT-01 → 02 → 03 → 06) |
| **Account** | REQUIRED | Có đăng nhập, có gói trả phí và lịch sử thanh toán |
| **Checkout** | REQUIRED | Bán trực tiếp gói “Mở đầy đủ đám hiếu” và gói “Chuẩn bị trước” |
| **SePay** | REQUIRED | Nhà cung cấp thanh toán đã chọn: chuyển khoản ngân hàng / QR, xác minh qua webhook |
| **Admin** | REQUIRED | Có người dùng, đơn hàng, thanh toán, danh bạ nhà cung cấp, hỗ trợ |
| Sales Page | DEFERRED_POST_WORKING_APP | Làm sau khi app hoạt động được |

## Production Product Map

```text
APP ĐÁM HIẾU — APP CORE
├── LỐI VÀO (không cần đăng nhập)
│   └── S-ENT-01 → S-ENT-02 → S-ENT-03  (miễn phí, giá trị đầu tiên trước khi đăng ký)
├── TÀI KHOẢN
│   ├── S-AUTH-01 Đăng ký · S-AUTH-02 Đăng nhập · S-AUTH-03 Quên mật khẩu (OTP) · S-AUTH-04 Hết phiên
│   └── S-ACC-01 Tài khoản: hồ sơ · mật khẩu · gói & thanh toán · dữ liệu · hỗ trợ
├── ĐÁM HIẾU (9 module đã khóa)
│   ├── MIỄN PHÍ: Hồ sơ người mất · Bây giờ · Bản đồ · Chi tiết việc · Cần quyết
│   └── TRẢ PHÍ (mở đầy đủ cho đám hiếu đó): Đội (mời người, link) · Nhà cung cấp · Tài chính · Khách viếng & cáo phó · Hậu tang & mốc tưởng niệm
├── CHUẨN BỊ TRƯỚC (gói riêng)
├── THANH TOÁN (route độc lập /checkout)
│   └── S-CHK-00 Mở đầy đủ · S-CHK-01 Chọn gói · S-CHK-02 Chuyển khoản / QR · S-CHK-03 Chờ xác nhận · S-CHK-04 Thành công · S-CHK-05 Hết hạn / lỗi
└── ADMIN
    └── Tổng quan · Người dùng · Đám hiếu & hồ sơ chuẩn bị · Đơn hàng & thanh toán · Quyền truy cập · Gói & giá · SePay · Giao dịch chưa khớp · Danh bạ nhà cung cấp · Nhật ký
```

## Authentication and Access

- **Đăng ký (S-AUTH-01):** họ tên · số điện thoại · mật khẩu (tối thiểu 8 ký tự) · đồng ý điều khoản và chính sách bảo mật. Xác minh số điện thoại bằng **OTP một lần khi đăng ký**.
- **Đăng nhập (S-AUTH-02):** số điện thoại + mật khẩu; khóa tạm sau nhiều lần sai.
- **Quên mật khẩu (S-AUTH-03):** số điện thoại → mã OTP → mật khẩu mới; mã có hạn dùng, giới hạn số lần gửi.
- **Đăng xuất**; **hết phiên (S-AUTH-04):** quay lại đăng nhập rồi về đúng màn đang dở.
- **Thời điểm yêu cầu đăng nhập:** không bắt đăng ký trước khi có giá trị. Người dùng đi hết S-ENT-01 → 03 không cần tài khoản; khi bấm **“Lưu và vào đám hiếu”** thì tạo tài khoản, câu trả lời đã nhập được giữ lại.
- **Người hỗ trợ qua link (Link User):** không cần tài khoản; mở link có mã bí mật, chỉ thấy việc được nhờ; link thu hồi được, có hạn dùng.
- **Quyền:** Full / Limited / Link như trải nghiệm đã khóa; **máy chủ kiểm tra quyền sở hữu** mọi dữ liệu (đám hiếu, sổ phúng viếng, tài khoản bên nhận chỉ quyền Tài chính).
- **Admin tách riêng người dùng**; tài khoản Admin do chủ hệ thống tạo, không tự đăng ký.
- **Trạng thái trả phí** gắn với **từng đám hiếu** (và từng hồ sơ chuẩn bị), không gắn với người.

## Onboarding

Đã khóa ở trải nghiệm, bổ sung phần vận hành:
- Câu hỏi hoàn cảnh (S-ENT-02) → việc cần làm ngay (S-ENT-03) → **tạo tài khoản** → hồ sơ người mất (S-ENT-06) → Bây giờ (S-MAP-01).
- Chỉ hỏi dữ liệu cần cho giá trị đầu tiên; phần còn lại bổ sung sau.
- **Dừng giữa chừng thì làm tiếp được:** câu trả lời lưu tạm trên máy, sau khi đăng ký thì lưu lên máy chủ.
- **Tạo sẵn:** đám hiếu mới **bắt đầu trống**, người đăng ký là người đại diện (U1); việc sinh theo hoàn cảnh.
- **Cửa vào Chuẩn bị trước:** tạo tài khoản → tạo hồ sơ chuẩn bị (S-PRE-02 → 03).

## Account

**S-ACC-01 Tài khoản** gồm:
- Hồ sơ: họ tên, số điện thoại (đổi số cần OTP).
- Bảo mật: đổi mật khẩu, đăng xuất khỏi mọi thiết bị.
- **Gói & thanh toán:** danh sách đám hiếu và hồ sơ chuẩn bị của tôi, trạng thái (Miễn phí / Đã mở đầy đủ / Chờ thanh toán), lịch sử đơn hàng, mã đơn, trạng thái thanh toán.
- **Dữ liệu:** xuất dữ liệu một đám hiếu (danh sách việc, chi tiêu, sổ phúng viếng); yêu cầu xóa đám hiếu / tài khoản có bước xác nhận và thời gian chờ.
- **Hỗ trợ:** số điện thoại / Zalo của đội hỗ trợ (hiển thị để sao chép), gửi yêu cầu kèm mã đơn.
- Trạng thái lỗi và xác nhận cho mọi thao tác.

## Commerce and Access Activation

**Sản phẩm (tên và giá do Admin nhập, Chủ dự án chốt):**
| Gói | Mở gì | Thời hạn |
|---|---|---|
| **Mở đầy đủ đám hiếu** | Đội (mời người, link), Nhà cung cấp, Tài chính, Khách viếng & cáo phó, Hậu tang & mốc tưởng niệm cho **một** đám hiếu | Xem Unresolved Decisions (đề xuất: đến hết giỗ đầu) |
| **Chuẩn bị trước** | Hồ sơ chuẩn bị đầy đủ; phạm vi và việc có gồm “mở đầy đủ khi kích hoạt” hay không — xem Unresolved Decisions | Xem Unresolved Decisions |

**Luồng mua (route độc lập `/checkout`, không phụ thuộc Sales Page):**
1. **S-CHK-00 Mở đầy đủ:** hiện khi bấm vào module trả phí. Lời lẽ nhẹ nhàng, không đếm ngược, không ép. Nói rõ gồm gì; phần miễn phí vẫn dùng bình thường.
2. **S-CHK-01 Chọn gói:** gói, giá (từ Admin), đám hiếu áp dụng. Người trả có thể là **bất kỳ thành viên Full** của đám hiếu.
3. **Tạo đơn trước khi thanh toán:** mã đơn duy nhất, số tiền, hạn thanh toán; trạng thái `pending`.
4. **S-CHK-02 Chuyển khoản / QR:** QR ngân hàng + số tài khoản nhận + **nội dung chuyển khoản chứa mã đơn** + số tiền; nút sao chép từng dòng; nhắc ghi đúng nội dung.
5. **S-CHK-03 Chờ xác nhận:** tự cập nhật khi SePay báo có tiền; người dùng rời đi rồi quay lại vẫn thấy trạng thái.
6. **S-CHK-04 Thành công:** **máy chủ mở quyền** cho đám hiếu sau khi khớp giao dịch; quay về đúng module đang muốn dùng.
7. **S-CHK-05 Hết hạn / lỗi / sai số tiền:** hướng dẫn tạo đơn mới hoặc liên hệ hỗ trợ kèm mã đơn.

**SePay (theo SePay rulebook):**
- Webhook `POST /api/webhooks/sepay`, HTTPS công khai, **xác thực webhook**, bỏ qua giao dịch không hợp lệ.
- **Idempotency:** mỗi giao dịch SePay chỉ xử lý một lần; gọi lại webhook không mở quyền hai lần.
- **Khớp giao dịch:** mã đơn trong nội dung + đúng số tiền + đúng tài khoản nhận đang bật. Thiếu, thừa tiền hoặc sai mã → **Giao dịch chưa khớp** chờ Admin xử lý.
- Trạng thái đơn: `pending` → `matched` → `paid` → quyền `active`; `expired`; `failed`; `refunded` (xử lý tay).
- **Nhật ký kiểm toán** nối đơn ↔ giao dịch ↔ người trả ↔ đám hiếu ↔ quyền được mở.
- **Khóa bí mật chỉ ở máy chủ** (kho bí mật); dự án chỉ lưu tên tham chiếu, không lưu giá trị. Môi trường thử và thật tách riêng.

## Minimum Admin V1

| Màn | Nội dung |
|---|---|
| Tổng quan | Đăng ký mới, đơn chờ, doanh thu theo ngày, giao dịch chưa khớp, lỗi webhook gần nhất |
| Người dùng | Tìm theo tên / số điện thoại; trạng thái; khóa / mở tài khoản (có xác nhận) |
| Chi tiết người dùng | Thông tin, đám hiếu và hồ sơ chuẩn bị (chỉ tên, trạng thái — **không xem nội dung riêng tư**), đơn hàng, ghi chú hỗ trợ |
| Đơn hàng & thanh toán | Danh sách, lọc trạng thái, chi tiết đơn, giao dịch SePay đã khớp, lịch sử |
| Quyền truy cập | Đã mở / tạm dừng / hết hạn; **mở hoặc thu hồi thủ công có lý do**, ghi nhật ký |
| **Gói & giá** | Tên gói, mô tả ngắn, **giá**, thời hạn, bật / tắt; đổi giá không ảnh hưởng đơn đã tạo |
| **SePay** | Admin → Cài đặt → Thanh toán → SePay: môi trường, khóa (ẩn, chỉ 4 ký tự cuối), tài khoản ngân hàng nhận, webhook URL, quy tắc khớp, **kiểm tra kết nối**, trạng thái đối soát, nhật ký |
| **Giao dịch chưa khớp** | Gán giao dịch vào đơn đúng, hoặc đánh dấu hoàn tiền; có xác nhận và nhật ký |
| Danh bạ nhà cung cấp | S-ADM-01/02 (đã khóa ở trải nghiệm) |
| Nhật ký | Chỉ ghi thêm, không sửa: thao tác Admin, mở quyền, đổi giá, đổi cài đặt SePay |

Thao tác nguy hiểm đều phải xác nhận và ghi nhật ký. Admin không xem nội dung đám hiếu (sổ phúng viếng, tài chính, hồ sơ người mất) trừ khi gia đình cho phép khi cần hỗ trợ.

## System States

Áp dụng mẫu trạng thái đã khóa ở trải nghiệm, thêm cho phần vận hành:
- **Auth:** sai mật khẩu · khóa tạm · OTP sai / hết hạn / gửi quá nhiều · số điện thoại đã đăng ký · mất mạng.
- **Trả phí:** module khóa (S-CHK-00) · đơn chờ · đã thanh toán nhưng chưa khớp (hướng dẫn liên hệ, kèm mã đơn) · thành công · hết hạn · tài khoản nhận tạm dừng.
- **Chung:** lần đầu trống · đang tải · đang lưu · lỗi lưu (thử lại, không mất dữ liệu đang nhập) · không đủ quyền · link hết hạn · phiên hết hạn · bảo trì.

## Responsive Behavior

Theo shell đã khóa (máy tính: thanh bên trái; điện thoại: bottom navigation 5 mục). Màn Auth, Checkout: một cột, chữ lớn, nút to; **QR hiện rõ trên điện thoại để chụp màn hình hoặc mở app ngân hàng**; nội dung chuyển khoản có nút sao chép. Admin: làm trên máy tính; điện thoại chỉ xem và thao tác nhanh (khớp giao dịch, khóa tài khoản).

## Operational Readiness

- **Tên miền + HTTPS** cho app và webhook.
- **Sao lưu dữ liệu hằng ngày**, thử khôi phục định kỳ.
- **Theo dõi lỗi** (máy chủ, webhook SePay, gửi OTP) và cảnh báo cho đội vận hành.
- **Nhà cung cấp OTP** (SMS hoặc Zalo) — xem Unresolved Decisions.
- **Trang pháp lý tối thiểu:** Điều khoản sử dụng, Chính sách bảo mật (dữ liệu nhạy cảm: phúng viếng, tài chính, tài khoản ngân hàng bên nhận, giấy tờ). Cần rà soát theo quy định bảo vệ dữ liệu cá nhân hiện hành của Việt Nam. *Đây không phải nội dung bán hàng.*
- **Kênh hỗ trợ** và quy trình xử lý giao dịch chưa khớp.
- **Nội dung Bản đồ** (bộ việc theo hoàn cảnh, 15 chặng, nghi lễ): V1 do đội phát triển cập nhật qua tệp cấu hình — xem Unresolved Decisions.

## Sales Page Deferral Boundary

- **Không xây trong app core:** trang bán hàng công khai, trang giới thiệu marketing, tiêu đề / câu chuyện / câu hỏi thường gặp mang tính bán hàng, bảng giá kiểu marketing, lời cam kết hoàn tiền dạng bán hàng.
- **Vẫn xây:** trang thanh toán độc lập `/checkout`, màn S-CHK-00 “Mở đầy đủ” (mô tả thực tế gói gồm gì), đăng nhập, trang pháp lý.
- Sales Page làm sau Working App và sẽ dẫn nút mua vào đúng `/checkout` này, không tạo luồng thanh toán thứ hai.

```text
SALES_PAGE_BUILD_STATUS: DEFERRED_POST_WORKING_APP
CHECKOUT_BUILD_STATUS: INCLUDED_IN_CORE_APP
```

## Unresolved Decisions

> **Cập nhật 2026-09-25:** Chủ dự án “đồng ý đề xuất” cho U2–U6. Đã chốt: **U2** gói Mở đầy đủ dùng đến hết giỗ đầu · **U3** Chuẩn bị trước: miễn phí tạo 1 hồ sơ và nhập nguyện vọng; trả phí để lưu giấy tờ, chia sẻ, kích hoạt; kích hoạt thì đám hiếu mở đầy đủ, không thu lần hai · **U6** hoàn tiền xử lý tay trong Admin, có lý do và nhật ký. **Việc chuẩn bị của Chủ dự án:** U4 chọn bên gửi OTP; U5 tài khoản SePay (thử + thật) và tài khoản ngân hàng nhận — phải xong **trước Phase 3**. Còn mở: **U1 giá** (không chặn xây app), U7, U8 (không chặn).

| # | Cần Chủ dự án quyết | Đề xuất của em | Chặn bước nào |
|---|---|---|---|
| U1 | **Giá** gói Mở đầy đủ và gói Chuẩn bị trước | Admin nhập; chị chốt trước khi mở bán. Build dùng giá thử nghiệm | Mở bán thật (không chặn xây app) |
| U2 | **Thời hạn** gói Mở đầy đủ | Đến hết **giỗ đầu** của đám hiếu đó (đủ để theo dõi các mốc) | Checkout |
| U3 | **Gói Chuẩn bị trước** gồm gì, miễn phí gì | Miễn phí tạo 1 hồ sơ và nhập nguyện vọng; trả phí để lưu giấy tờ, chia sẻ, kích hoạt; **khi kích hoạt thì đám hiếu được mở đầy đủ, không thu lần hai** | Checkout |
| U4 | **Nhà cung cấp OTP** (SMS / Zalo ZNS) | Chọn một bên có mẫu tin OTP đã duyệt; chỉ gửi OTP khi đăng ký và quên mật khẩu | Auth |
| U5 | **Tài khoản SePay và tài khoản ngân hàng nhận** | Chị chuẩn bị tài khoản SePay (môi trường thử + thật) trước giai đoạn xây backend | Phase thanh toán |
| U6 | **Hoàn tiền** | Xử lý tay trong Admin, có lý do và nhật ký; chính sách hoàn tiền nêu trong điều khoản | Mở bán |
| U7 | **Hóa đơn điện tử** | Chưa làm ở V1; ghi nhận nhu cầu nếu khách doanh nghiệp / cơ quan yêu cầu | Không chặn |
| U8 | **Cập nhật nội dung Bản đồ** | V1 qua tệp cấu hình do đội phát triển cập nhật; Admin chỉnh nội dung để Later | Không chặn |

## Production Definition of Done

- [ ] Đi hết S-ENT-01 → 03 **không cần tài khoản**; đăng ký bằng số điện thoại + OTP giữ nguyên câu trả lời; đăng nhập, đăng xuất, quên mật khẩu bằng OTP chạy thật.
- [ ] Máy chủ chặn truy cập đám hiếu của người khác; Link User chỉ thấy việc được nhờ; sổ phúng viếng và tài khoản bên nhận chỉ quyền Tài chính.
- [ ] Đám hiếu mới bắt đầu trống; phần miễn phí dùng được đầy đủ; bấm module trả phí hiện S-CHK-00.
- [ ] **`/checkout` → tạo đơn → chuyển khoản / QR có mã đơn → webhook SePay đã xác thực → khớp giao dịch → đơn `paid` → quyền đám hiếu `active`** chạy trọn trên môi trường thử.
- [ ] Gọi lại webhook không mở quyền hai lần; sai số tiền / sai mã vào Giao dịch chưa khớp; Admin gán tay được, có nhật ký.
- [ ] Admin: Gói & giá, SePay (kiểm tra kết nối), Đơn hàng, Quyền truy cập, Người dùng, Nhật ký, Danh bạ nhà cung cấp hoạt động.
- [ ] Không có khóa bí mật trong mã phía trình duyệt, nhật ký hay dữ liệu dự án.
- [ ] Tài khoản: xem gói, lịch sử thanh toán, xuất dữ liệu, yêu cầu xóa.
- [ ] Sao lưu, theo dõi lỗi, trang Điều khoản và Chính sách bảo mật có sẵn.
- [ ] **Không có Sales Page** trong app core.
