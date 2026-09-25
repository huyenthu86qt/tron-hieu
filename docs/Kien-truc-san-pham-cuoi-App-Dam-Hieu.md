# FINAL PRODUCT ARCHITECTURE — APP ĐÁM HIẾU

**Trạng thái:** MODE 2 — Finalize Product · Cấu trúc sản phẩm **ĐÃ KHÓA** (LOCK_PRODUCT_STRUCTURE)
**Kích hoạt bởi:** Chủ dự án tuyên bố “Cấu trúc sản phẩm đã khóa” trên bản `De-xuat-cau-truc-san-pham-App-Dam-Hieu.md` (đã có vòng Human Review: tách hai cửa vào Chuẩn bị trước / Đã xảy ra; mở rộng Module 8 sang Mốc tưởng niệm).
**Nguồn chuẩn:** Master Foundation App Đám Hiếu + bản đề xuất module đã review.
**Ngày khóa:** 2026-09-25
**Phiên bản:** v2 — supersede v1 ở phạm vi Module 6 theo lệnh của Chủ dự án: “KHÓA CẤU TRÚC SẢN PHẨM — cập nhật Nhà cung cấp theo khoảng cách” (2026-09-25). v1 chỉ còn giá trị lịch sử.

> **Thay đổi v1 → v2:** Module 6 thêm *Danh bạ nhà cung cấp do Admin quản lý* và *Gợi ý đúng + gần nhất theo địa chỉ nơi tổ chức, tự cập nhật*. U1 xác nhận trước khi chọn. Thêm tích hợp bản đồ/khoảng cách. Không có thay đổi nào khác về V1/Later/Out.

> **Quy ước mặc định khi khóa.** Các câu hỏi review 1–9 của bản đề xuất chưa có câu trả lời riêng. Vì Chủ dự án đã khóa trên chính bản đề xuất, những điểm còn ngỏ được giải quyết **theo đúng khuyến nghị AI đã ghi trong bản đó**. Bảng ở mục 1.3 liệt kê từng điểm. Muốn đổi điểm nào thì phải **supersede lock** một cách rõ ràng, không sửa ngầm.

---

## 1. Final Locked Module Map

### 1.1 FINAL PRODUCT MAP

| # | Module | Vai trò | V1/Later | Lý do quyết định |
|---:|---|---|---|---|
| 1 | **Chuẩn bị trước & Hồ sơ dự liệu** | Cửa vào A (chưa xảy ra). U0 chuẩn bị dần rồi kích hoạt hồ sơ, không phải nhập lại | **V1 — Basic** | Foundation đã khóa cửa vào và nhóm người dùng U0; đây là journey lõi, không phải tiện ích |
| 2 | **Khởi động khẩn cấp & Hồ sơ đám hiếu** | Cửa vào B (đã xảy ra). Đưa ra việc cần làm ngay và tạo một hồ sơ dùng xuyên suốt | **V1** | Journey A chặng 1–5; không bắt đăng ký trước khi nhận giá trị; mỗi thông tin chỉ nhập một lần |
| 3 | **Bản đồ đám hiếu** | Bộ não vận hành, là một nguồn sự thật cho toàn vòng | **V1** | Khác biệt cốt lõi so với checklist; 15 chặng và 12 cách làm |
| 4 | **Quyết định & Duyệt** | Giữ quyền quyết ở Chủ thể; thay đổi lan tới các module bị ảnh hưởng có kiểm soát | **V1** | Nguyên tắc Chủ thể/Phương tiện; quyết định gốc; điểm không thể quay lại |
| 5 | **Đội đám hiếu & Điều phối** | Biến kế hoạch thành việc có người chịu trách nhiệm; giải phóng U1 | **V1** | U1–U9; Journey B/C; người nhận việc không cần cài app |
| 6 | **Dịch vụ & Nhà cung cấp** | Gợi ý nhà cung cấp đúng loại dịch vụ và gần nơi tổ chức nhất, tự cập nhật; quản lý cam kết, phát sinh, nghiệm thu | **V1 — Basic + Gợi ý theo khoảng cách** | Chủ dự án khóa v2: V1 và thêm phân bổ theo khoảng cách. Danh bạ do Admin quản lý, U1 xác nhận; không marketplace |
| 7 | **Tài chính & Đối soát** | Minh bạch dự kiến / đã chi / còn trả / phát sinh; khép tài chính | **V1 — Basic** | Journey D; là điều kiện để khép vòng |
| 8 | **Khách viếng & Truyền tin** | Một nguồn thông tin đúng cho khách; ghi nhận khách và phúng viếng thật nhanh | **V1 — Basic** | Journey E/G; đau 9, 13, 14 |
| 9 | **Hậu tang, Mốc tưởng niệm, Pháp lý & Khép vòng** | Dẫn từ “tiễn đưa xong” tới khép vòng; lịch các mốc gia đình chọn | **V1 — Basic** | Chặng 13–15; lời hứa “lo trọn”; nội dung pháp lý chỉ phát hành khi có nguồn đã kiểm chứng |
| 10 | Không gian Lưu giữ & Tưởng niệm nâng cao | Lưu giữ ký ức dài hạn | **Later** | Không cần để chứng minh core outcome |
| 11 | Marketplace / tích hợp đặt dịch vụ nhà cung cấp | Tìm, so sánh, đặt dịch vụ nhiều bên | **Later (tích hợp) / Out (marketplace mở)** | Foundation chỉ yêu cầu điều phối; làm marketplace sẽ kéo theo bài toán cung, kiểm duyệt và tranh chấp |

*Đánh số lại theo thứ tự hành trình người dùng. Đối chiếu với số của bản đề xuất: 1 = M9, 2 = M1, 3 = M2, 4 = M3, 5 = M4, 6 = M5, 7 = M6, 8 = M7, 9 = M8.*

### 1.2 FINAL PRODUCT

```text
APP ĐÁM HIẾU
│
├── CỬA VÀO A — CHƯA XẢY RA
│     └── 1. CHUẨN BỊ TRƯỚC & HỒ SƠ DỰ LIỆU (Basic) ──► KÍCH HOẠT
│                                                        │
├── CỬA VÀO B — ĐÃ XẢY RA                               ▼
│     └── 2. KHỞI ĐỘNG KHẨN CẤP & HỒ SƠ ĐÁM HIẾU  ◄──────┘
│
├── LÕI VẬN HÀNH
│     ├── 3. BẢN ĐỒ ĐÁM HIẾU
│     ├── 4. QUYẾT ĐỊNH & DUYỆT
│     └── 5. ĐỘI ĐÁM HIẾU & ĐIỀU PHỐI
│
├── CÁC MIỀN CÔNG VIỆC (Basic)
│     ├── 6. DỊCH VỤ & NHÀ CUNG CẤP
│     ├── 7. TÀI CHÍNH & ĐỐI SOÁT
│     ├── 8. KHÁCH VIẾNG & TRUYỀN TIN
│     └── 9. HẬU TANG, MỐC TƯỞNG NIỆM, PHÁP LÝ & KHÉP VÒNG
│
├── SUPPORTING EXPERIENCES (xuyên module, không phải module)
│     ├── Công cụ điều kiện CORE + CONDITIONAL + OPTIONAL
│     ├── Phân quyền U0–U9 · Full / Limited / Link / No-App User
│     ├── Nhắc việc · cảnh báo · mức khẩn · “Chế độ tang gia”
│     ├── Lan truyền tác động khi có thay đổi
│     ├── Tài liệu/tệp · tìm kiếm · lịch sử · nhật ký xác nhận (audit)
│     ├── Lớp nội dung địa phương / phong tục / pháp lý có nguồn
│     └── Mobile-first · link công khai/riêng tư
│
└── LATER
      ├── Không gian Lưu giữ & Tưởng niệm nâng cao
      └── Tích hợp đặt dịch vụ / nhà cung cấp nâng cao
```

### 1.3 Quyết định mặc định cho các câu hỏi review còn ngỏ

| Câu hỏi review | Quyết định khi khóa (theo khuyến nghị AI trong bản đề xuất) |
|---|---|
| Q1 Nhà cung cấp | **Chủ dự án quyết (v2):** module riêng ở V1, có **gợi ý đúng + gần nhất theo địa chỉ nơi tổ chức, tự cập nhật**. Nguồn là danh bạ do Admin quản lý + nhà cung cấp gia đình tự thêm + nhà cung cấp trong hồ sơ chuẩn bị. U1 xác nhận. Không marketplace, không để nhà cung cấp tự đăng ký, không đặt lịch/thanh toán qua app |
| Q2 Phúng viếng | **Thao tác ghi** nằm trong *Khách viếng* (lối vào nhanh riêng); **dữ liệu tiền, đối soát và quyền xem** thuộc *Tài chính*, có sổ quyền truy cập riêng |
| Q3 Hậu tang/Pháp lý | Giữ **V1 Basic**. Mục thủ tục pháp lý chỉ hiển thị nội dung đã có nguồn hiện hành; mục nào chưa có nguồn thì ghi “chưa có hướng dẫn đã kiểm chứng” |
| Q4 Chuẩn bị trước | **Cả hai**: chuẩn bị cho bản thân và cho người thân, vì Module Card đã ghi như vậy |
| Q5 Quyết định & Duyệt | Có **lối vào riêng “Cần quyết”** trên điều hướng; đồng thời quyết định hiển thị ngay trong Bản đồ. Decision/Approval là object riêng |
| Q6 Vùng trách nhiệm | Mặc định: Hậu cần, Tài chính, Khách/Phúng viếng, Liên lạc, Xe cộ, Nhà cung cấp, Hậu tang. U1 **thêm/bớt/đổi tên** được |
| Q7–Q9 | Không có module nào bị gộp, tách hoặc hạ cấp so với bản đề xuất |
| Nghi lễ và tổ chức (Chủ dự án duyệt trong Visual Review, 2026-09-25) | Làm rõ trong phạm vi đã khóa, **không thêm module**. Câu hỏi hoàn cảnh *“Lễ tang được tổ chức theo hình thức nào?”* có **4 hình thức** do Chủ dự án xác định: **(1)** gia đình tự tổ chức theo nghi lễ tôn giáo / truyền thống; **(2)** gia đình chủ trì, phối hợp Ban công tác Mặt trận, UBND cấp xã, hội đoàn thể địa phương theo nếp sống văn minh — địa phương là *người hỗ trợ*, gia đình vẫn quyết; **(3)** nghi lễ tôn giáo kết hợp nghi lễ tang cán bộ, CCVC hoặc quân nhân — **Ban lễ tang đồng tổ chức**, việc của Ban lễ tang ghi “Do Ban lễ tang quyết — gia đình xác nhận”; **(4)** chỉ theo nghi lễ tang cán bộ, CCVC hoặc quân nhân — **Ban lễ tang chủ trì**, gia đình được thông báo và góp ý, không dùng nghi lễ tôn giáo. Hình thức 3–4 hỏi thêm đối tượng (cán bộ, CCVC / quân nhân); hình thức 1–3 hỏi thêm nghi thức tôn giáo (truyền thống / Phật giáo, Công giáo, khác). Gia đình luôn quyết các việc riêng của gia đình; khoản do đơn vị chi trả tách riêng trong Tài chính. Hình thức an táng (hỏa táng / địa táng) cũng sinh lộ trình riêng. |

---

## 2. Product Boundary

### IN V1
1. Chuẩn bị trước & Hồ sơ dự liệu — Basic
2. Khởi động khẩn cấp & Hồ sơ đám hiếu
3. Bản đồ đám hiếu
4. Quyết định & Duyệt
5. Đội đám hiếu & Điều phối
6. Dịch vụ & Nhà cung cấp — Basic + Gợi ý nhà cung cấp đúng và gần nhất theo địa chỉ nơi tổ chức (tự cập nhật, U1 xác nhận) + Danh bạ do Admin quản lý
7. Tài chính & Đối soát — Basic
8. Khách viếng & Truyền tin — Basic
9. Hậu tang, Mốc tưởng niệm, Pháp lý & Khép vòng — Basic
10. Toàn bộ Supporting Experiences ở mục 1.2

### LATER
- Không gian Lưu giữ & Tưởng niệm nâng cao (ảnh, câu chuyện, trang tưởng niệm dài hạn).
- Nhà cung cấp nâng cao: so sánh nhiều báo giá có cấu trúc, đặt lịch/booking tích hợp, đánh giá nhà cung cấp.
- Truyền thông nâng cao: gửi hàng loạt qua SMS/Zalo OA, thiệp mời thiết kế.
- Chuẩn bị trước nâng cao: nhắc định kỳ rà soát hồ sơ, dịch vụ tư vấn, gói trả trước với nhà cung cấp.
- Pháp lý nâng cao: tạo hồ sơ/biểu mẫu tự động, theo dõi quyền lợi chi tiết theo từng cơ quan.
- AI nâng cao (xem mục 10).

### EXPLICITLY OUT
- Marketplace mở nhà cung cấp; nhà cung cấp tự đăng ký vào danh bạ.
- App **tự gán** nhà cung cấp mà không có U1 xác nhận; tự thay nhà cung cấp đã cam kết.
- AI chatbot tổng quát làm trung tâm sản phẩm.
- Mạng xã hội tang lễ.
- Các module độc lập “nhắc việc”, “mobile”, “dashboard”, “tìm kiếm”. Đây là capability xuyên module.
- AI hoặc hệ thống **quyết định thay** Chủ thể; tự áp một chuẩn 49/100 ngày cho mọi gia đình.
- Hướng dẫn pháp lý không có nguồn hiện hành.
- Nhận hoặc chuyển tiền phúng viếng thay gia đình. V1 chỉ **ghi nhận**, không xử lý dòng tiền phúng viếng. *(Thanh toán mua app được xử lý ở bước Production Completeness, không thuộc phạm vi này.)*

---

## 3. Core Experience

```text
USER INPUT
  Chọn hoàn cảnh (chưa xảy ra / đã xảy ra + nơi mất, địa phương, hình thức, quy mô)
  hoặc kích hoạt hồ sơ chuẩn bị sẵn
        ↓
PRODUCT PROCESS
  Công cụ điều kiện CORE + CONDITIONAL + OPTIONAL sinh nhánh việc, mốc, phụ thuộc,
  quyết định gốc và điểm không thể quay lại theo hoàn cảnh
        ↓
VISIBLE VALUE
  Bản đồ đám hiếu: Bây giờ / Sắp tới / Cần quyết / Có vấn đề / Đã xong
  → biết ngay việc đầu tiên, việc gì phải quyết, ai đang làm gì
        ↓
USER ACTION
  U1 quyết/duyệt · giao việc cho người hỗ trợ qua link · người hỗ trợ nhận, làm, báo xong hoặc báo phát sinh
        ↓
STATE UPDATE
  Trạng thái việc, chi phí, cam kết nhà cung cấp và thông tin khách cập nhật;
  thay đổi quyết định lan tới việc/người/lịch/chi phí/khách bị ảnh hưởng;
  tiến độ khép vòng được tính lại
```

---

## 4. 30-60 Second Demo

**USER STARTS WITH** — Một người vừa nhận tin người thân mất tại bệnh viện, đang bối rối, chưa có tài khoản.

**USER DOES**
1. Mở app → chọn **“Người thân vừa mất”** (không phải đăng ký).
2. Trả lời 3–4 câu hỏi thực sự ảnh hưởng hành động: nơi mất, tổ chức tại đâu, dự kiến mai táng hay hỏa táng.
3. Chạm **“Tôi là người đại diện gia đình”**.

**PRODUCT DOES**
- Sinh ngay danh sách **Việc cần làm ngay** theo hoàn cảnh đó.
- Dựng khung Bản đồ đám hiếu với các quyết định gốc đang chờ (hình thức, địa điểm, thời gian) và đánh dấu điểm không thể quay lại.

**USER SEES**
- Màn **Bây giờ**: 3–5 việc đầu tiên, việc nào cũng có nút *Tôi làm* / *Giao cho người khác*.
- Thẻ **Cần quyết**: các quyết định gốc và tác động của từng quyết định.
- Một nút **Mời người hỗ trợ bằng link**.

**WHY VALUE IS OBVIOUS**
Trong chưa đầy một phút, người dùng từ “không biết bắt đầu từ đâu” chuyển sang “biết đúng việc đầu tiên, biết mình phải quyết gì, giao được việc cho người khác”. Họ không phải điền form dài và không phải cài app cho cả nhà.

*Biến thể demo cửa vào A:* U0 mở hồ sơ chuẩn bị đã hoàn thiện 70% → bấm **Kích hoạt** → hồ sơ đám hiếu được tạo sẵn nguyện vọng, người liên hệ, ngân sách, nhà cung cấp → U1 chỉ còn phải **xác nhận** thay vì quyết lại từ đầu.

---

## 5. MVP Definition

**MVP = toàn bộ 9 module V1 ở mức Basic.** Đây là phiên bản nhỏ nhất vẫn tạo được Core Outcome “lo trọn — không bỏ sót — không rối”. MVP không âm thầm xóa module nào đã khóa.

Vòng giá trị MVP phải chạy trọn:
**(Chuẩn bị → Kích hoạt) hoặc Khởi động → Bản đồ → Quyết → Giao/Thực hiện → Chi phí/Nhà cung cấp/Khách → Hậu tang → Khép vòng.**

| Module | Basic V1 | Advanced Later |
|---|---|---|
| Chuẩn bị trước | Tạo hồ sơ cho mình hoặc người thân; nguyện vọng; người đại diện; liên hệ; giấy tờ; ngân sách; nhà cung cấp mong muốn; % hoàn thiện; chia sẻ có kiểm soát; kích hoạt | Nhắc rà soát định kỳ, tư vấn, gói trả trước |
| Khởi động | Chọn tình huống; việc khẩn cấp; xác lập U1; hồ sơ người mất; hoàn cảnh; nhận dữ liệu từ hồ sơ chuẩn bị | Nhập bằng ảnh/giấy tờ (AI) |
| Bản đồ | 5 góc nhìn; việc/mốc/phụ thuộc/hạn; điểm không thể quay lại; tiến độ khép vòng | Tùy biến sâu bộ việc theo dòng họ/tôn giáo |
| Quyết định & Duyệt | Quyết định gốc; phương án; tác động; hàng chờ duyệt của U1; xác nhận thay đổi; chấp nhận rủi ro | Quyết định tùy biến không giới hạn, biểu quyết nhiều người |
| Đội & Điều phối | Thêm người qua link; vai trò; vùng trách nhiệm; giao/nhận/xong; báo phát sinh; chuyển cấp | Lịch ca phức tạp, phân quyền chi tiết theo trường |
| Nhà cung cấp | Danh bạ do Admin quản lý; **gợi ý đúng + gần nhất, tự cập nhật**; sổ nhà cung cấp; yêu cầu; báo giá; cam kết; phát sinh; nghiệm thu; liên kết công nợ | So sánh báo giá, booking, đánh giá, nhà cung cấp tự đăng ký, lịch trống thời gian thực |
| Tài chính | Ngân sách; dự toán; đề nghị/duyệt/ghi chi; chứng từ; công nợ; đối soát; khóa tài chính | Chia chi phí giữa các nhánh, xuất báo cáo kế toán |
| Khách viếng | Trang thông tin bằng link; cập nhật thay đổi; ghi khách/đoàn/phúng viếng/lễ vật; bàn giao ca | Gửi hàng loạt, thiệp, sổ tang online |
| Hậu tang | Checklist hậu tang động; thủ tục có nguồn; chọn mốc 49 ngày/100 ngày/giỗ đầu/mốc riêng; lịch, phân công, ngân sách, nhắc cho từng mốc; khép phần việc tức thời | Theo dõi quyền lợi chi tiết, biểu mẫu tự động |

---

## 6. Final Module Specifications

### Module 1 — Chuẩn bị trước & Hồ sơ dự liệu (Basic)
- **Purpose:** Biến thời gian còn chuẩn bị được thành dữ liệu và quyết định dùng được ngay khi sự kiện xảy ra.
- **Jobs:** Chuẩn bị khi còn thời gian; thống nhất trước các quyết định khó; tập hợp giấy tờ; chuyển giao cho người đại diện.
- **User actions:** Tạo hồ sơ (cho mình / cho người thân) · điền dần từng nhóm · chỉ định người đại diện mong muốn · chia sẻ quyền xem/sửa · yêu cầu kích hoạt.
- **Inputs:** Thông tin người được chuẩn bị, liên hệ, giấy tờ (tệp), nguyện vọng, mai táng/hỏa táng, nghi lễ, địa điểm, quy mô, ngân sách, nhà cung cấp, mong muốn đặc biệt.
- **Outputs:** Hồ sơ có % sẵn sàng; danh sách mục còn thiếu; bản đám hiếu được tạo sẵn khi kích hoạt.
- **Core data:** PreNeedProfile, Subject, IntendedRepresentative, Contact, Document, Preference/FuneralWish, BudgetPlan, PreparedVendor, ReadinessProgress, ActivationRequest.
- **States:** Nháp → Đang hoàn thiện (x%) → Đã chia sẻ → **Chờ kích hoạt** → Đã kích hoạt (chỉ đọc, đã chuyển sang FuneralCase).
- **Relationships:** Kích hoạt → tạo FuneralCase (M2); nguyện vọng thành *đề xuất có sẵn* trong Decision (M4); liên hệ thành Participant (M5); ngân sách sang Budget (M7); nhà cung cấp sang Vendor (M6); mốc mong muốn sang Memorial Milestone (M9).
- **Automations:** Tính % sẵn sàng (rule); gợi ý mục còn thiếu (rule); khi kích hoạt thì map dữ liệu một lần, không nhập lại.
- **AI:** Không có ở V1.
- **Basic V1 scope:** Như trên. Quyền kích hoạt V1: người sở hữu hồ sơ hoặc người đại diện được chỉ định; mọi lần kích hoạt đều ghi audit và thông báo cho người sở hữu cùng những người được chia sẻ.
- **Advanced Later:** Nhắc rà soát, tư vấn, gói trả trước, xác minh kích hoạt nhiều lớp.

### Module 2 — Khởi động khẩn cấp & Hồ sơ đám hiếu
- **Purpose:** Tạo giá trị ngay trong phút đầu và hình thành một hồ sơ duy nhất.
- **Jobs:** Biết việc đầu tiên; cá nhân hóa nhánh việc; tránh nhập lại.
- **User actions:** Chọn tình huống · trả lời câu hỏi hoàn cảnh · xác lập U1 · bổ sung dần hồ sơ người mất.
- **Inputs:** Nơi/tình huống mất, địa phương, nơi tổ chức, hình thức, quy mô, tín ngưỡng (tùy chọn), thông tin người mất.
- **Outputs:** Danh sách *Việc cần làm ngay*; FuneralCase; bộ điều kiện sinh Bản đồ.
- **Core data:** FuneralCase, DeceasedProfile, Situation, Location, Representative, KeyPreferences.
- **States:** Khẩn cấp (chưa lưu tài khoản) → Đã lưu → Đang tổ chức.
- **Relationships:** Sinh điều kiện cho M3, M4, M8, M9.
- **Automations:** Luật điều kiện chọn gói việc CORE/CONDITIONAL/OPTIONAL; mỗi câu trả lời chỉ hỏi một lần.
- **AI:** Không.
- **Basic V1 scope:** Dùng được mà không cần đăng ký; chỉ yêu cầu tài khoản khi lưu hồ sơ hoặc mời người khác.
- **Advanced Later:** Nhập từ ảnh giấy tờ.

### Module 3 — Bản đồ đám hiếu
- **Purpose:** Nguồn sự thật duy nhất về toàn vòng đám hiếu.
- **Jobs:** Nhìn toàn cục nhưng chỉ hành động trên phần cần thiết.
- **User actions:** Xem 5 góc nhìn · mở việc · đánh dấu xong có bằng chứng · bỏ qua có lý do · xem theo chặng.
- **Inputs:** Hoàn cảnh (M2), quyết định (M4), trạng thái từ mọi module.
- **Outputs:** Bây giờ / Sắp tới / Cần quyết / Có vấn đề / Đã xong; tiến độ theo chặng; cảnh báo trước điểm không thể quay lại.
- **Core data:** Phase, Task, Milestone, Dependency, Deadline, Condition, Risk, CompletionEvidence.
- **States (Task):** Chưa tới → Cần làm → Đang làm → Chờ duyệt → Có vấn đề → Xong / Bỏ qua (có lý do).
- **Relationships:** Task được giao qua Assignment (M5); Task có thể sinh Expense (M7), ServiceRequest (M6), Announcement (M8), CloseoutTask (M9).
- **Automations:** Tính trạng thái phụ thuộc; mở khóa việc khi việc tiên quyết xong; cảnh báo quá hạn; kiểm tra trước điểm không thể quay lại.
- **AI:** Không. Bản đồ sinh bằng luật xác định.
- **Basic V1 scope:** Bộ việc chuẩn + nhánh điều kiện; U1 thêm được việc riêng.
- **Advanced Later:** Thư viện biến thể theo vùng/dòng họ do cộng đồng đóng góp (cần kiểm duyệt).

### Module 4 — Quyết định & Duyệt
- **Purpose:** Giữ quyền quyết ở Chủ thể và kiểm soát cách thay đổi lan truyền.
- **Jobs:** Quyết — Duyệt — Kiểm soát.
- **User actions:** Chọn phương án · xem tác động · duyệt/từ chối đề nghị · xác nhận thay đổi · chấp nhận rủi ro.
- **Inputs:** Quyết định gốc, đề nghị từ U2 trở xuống, nguyện vọng đã chuẩn bị (M1).
- **Outputs:** Quyết định đã chốt; tập tác động (việc/người/lịch/chi phí/nhà cung cấp/khách); nhật ký.
- **Core data:** Decision, Option, ApprovalRequest, ImpactSet, Exception, Confirmation.
- **States (Decision):** Chưa quyết → Có đề xuất → Chờ U1 → Đã quyết → Đã thay đổi (bản cũ bị supersede). Có cờ *không thể quay lại*.
- **Relationships:** Cập nhật M3, M5, M6, M7, M8.
- **Automations:** Tính ImpactSet từ phụ thuộc (rule); đối chiếu nguyện vọng chuẩn bị với hoàn cảnh thực tế và nêu điểm khác; đưa việc vượt quyền lên U1.
- **AI:** Không.
- **Basic V1 scope:** Bộ quyết định gốc + quyết định tự thêm dạng đơn giản.
- **Advanced Later:** Biểu quyết nhiều người, quyết định có điều kiện.

### Module 5 — Đội đám hiếu & Điều phối
- **Purpose:** Có người chịu trách nhiệm cho từng việc; U1 chỉ xử lý điều cần quyết.
- **Jobs:** Giao đúng người, điều phối, phát hiện chậm.
- **User actions:** Mời bằng link · gán vai trò/vùng trách nhiệm · giao/nhận/từ chối/xong · báo phát sinh · xin hỗ trợ.
- **Inputs:** Danh bạ (thủ công hoặc từ M1), Task.
- **Outputs:** Ai – việc gì – trạng thái; mỗi người chỉ thấy phần của mình; chế độ “chỉ báo tôi khi cần quyết”.
- **Core data:** Participant, Role (U0–U9), AccessType (Full/Limited/Link/No-App), ResponsibilityArea, Assignment, Issue, Escalation.
- **States (Assignment):** Đã giao → Đã nhận → Đang làm → Xong / Từ chối / Có vấn đề.
- **Relationships:** Assignment ↔ Task (M3); Escalation → ApprovalRequest (M4).
- **Automations:** Nhắc người nhận; cảnh báo việc chưa nhận hoặc quá hạn; chuyển cấp theo quyền.
- **AI:** Không.
- **Basic V1 scope:** Link User thao tác được trên việc của mình mà không cần cài app.
- **Advanced Later:** Lịch ca phức tạp, phân quyền theo trường dữ liệu.

### Module 6 — Dịch vụ & Nhà cung cấp (Basic + Gợi ý theo khoảng cách)
- **Purpose:** Đưa ngay cho gia đình bên phù hợp và gần nhất cho từng hạng mục; kiểm soát cam kết của các bên ngoài mà không bắt họ dùng app.
- **Jobs:** Tìm đúng bên, gần nơi tổ chức; biết bên nào làm gì, lúc nào, chi phí nào, đã đạt chưa.
- **User actions:** Xem gợi ý theo từng hạng mục · xác nhận hoặc đổi sang bên khác · thêm nhà cung cấp riêng · ghi yêu cầu/báo giá · ghi cam kết · ghi phát sinh · nghiệm thu.
- **Admin actions:** Thêm/sửa/ẩn nhà cung cấp trong danh bạ: tên, liên hệ, loại dịch vụ, địa chỉ (tọa độ), khu vực phục vụ, điều kiện áp dụng (ví dụ chỉ mai táng, chỉ hỏa táng), trạng thái hoạt động.
- **Inputs:** Địa chỉ nơi tổ chức (M2/M4), các hạng mục dịch vụ mà Task cần (M3), quyết định đã chốt (M4), danh bạ, nhà cung cấp riêng của gia đình, nhà cung cấp trong hồ sơ chuẩn bị (M1).
- **Outputs:** Với mỗi hạng mục: danh sách xếp hạng **đúng + gần nhất** (kèm khoảng cách) và một bên được điền sẵn chờ U1 xác nhận; danh sách cam kết theo mốc; phát sinh; trạng thái nghiệm thu; công nợ liên kết.
- **Core data:** VendorDirectoryEntry (Admin), ServiceCategory, ServiceArea, GeoLocation, Vendor (theo vụ việc), VendorSuggestion (hạng mục, xếp hạng, khoảng cách, lý do), ServiceRequest, Quote, Commitment, Deliverable, Incident, Acceptance.
- **Quy tắc “đúng”:** (1) cùng loại dịch vụ với hạng mục; (2) khớp quyết định đã chốt (ví dụ mai táng/hỏa táng); (3) nơi tổ chức nằm trong khu vực phục vụ; (4) đang hoạt động, chưa từ chối vụ việc này.
- **Quy tắc “gần nhất”:** xếp theo khoảng cách tới địa chỉ nơi tổ chức. Tính theo đường đi hay đường chim bay sẽ chốt ở bước xây app.
- **Ưu tiên nguồn:** Nhà cung cấp trong hồ sơ chuẩn bị hoặc do gia đình chỉ định được **gắn nhãn ưu tiên** và hiện kèm khoảng cách; app **không tự loại** các bên này dù ở xa hơn.
- **States (Suggestion):** Đang gợi ý → Đã xác nhận (chuyển thành Vendor của vụ việc) / Bị bỏ qua / Hết hiệu lực (khi đầu vào đổi).
- **States (Vendor theo vụ việc):** Yêu cầu → Có báo giá → Đã chọn → Đã cam kết → Đang thực hiện → (Phát sinh) → Đã nghiệm thu → Đã thanh toán.
- **Relationships:** Gợi ý sinh từ Task (M3) + địa chỉ/quyết định (M2/M4); xác nhận do U1 làm (M4); Commitment gắn Task/Milestone (M3); người phụ trách (M5); công nợ/chi (M7).
- **Automations (deterministic):**
  - Tính lại gợi ý khi: đặt/đổi địa chỉ nơi tổ chức · đổi quyết định làm thay đổi hạng mục (ví dụ mai táng ↔ hỏa táng) · có hạng mục mới · nhà cung cấp từ chối hoặc bị Admin ẩn.
  - Hạng mục **chưa có cam kết**: cập nhật gợi ý và bên điền sẵn, thông báo cho người phụ trách.
  - Hạng mục **đã có cam kết**: **không tự thay**. Tạo mục trong **Cần quyết** cho U1, ví dụ “Bên X cách địa điểm mới Y km — giữ hay đổi?”, kèm gợi ý thay thế.
  - Không có bên phù hợp: báo “chưa có nhà cung cấp phù hợp gần nơi tổ chức”, mời gia đình tự thêm.
  - Nhắc trước giờ cam kết; cảnh báo khi phát sinh vượt báo giá.
- **AI:** Không. Xếp hạng bằng luật và khoảng cách.
- **Basic V1 scope:** Như trên.
- **Advanced Later:** So sánh báo giá có cấu trúc, booking tích hợp, lịch trống thời gian thực, đánh giá, nhà cung cấp tự đăng ký hoặc có cổng riêng.

### Module 7 — Tài chính & Đối soát (Basic)
- **Purpose:** Minh bạch tiền, giảm nghi ngờ và bất đồng.
- **Jobs:** Đúng chi phí, rõ trách nhiệm, khép tài chính.
- **User actions:** Lập ngân sách · ghi dự toán/chi · đề nghị chi · duyệt · đính chứng từ · đối soát · khóa.
- **Inputs:** Ngân sách (có thể từ M1), chi phí từ Task/Vendor, phúng viếng từ M8.
- **Outputs:** Dự kiến / Đã chi / Còn trả / Phát sinh; cảnh báo vượt; báo cáo đối soát.
- **Core data:** Budget, Estimate, Expense, ExpenseApproval, Payee, Evidence, Debt, CondolenceLedger (sổ phúng viếng, quyền riêng), Reconciliation.
- **States (Expense):** Dự toán → Đề nghị → Đã duyệt → Đã chi → Đã đối soát. Tài chính: Mở → Đang đối soát → Đã khóa.
- **Relationships:** Nhận từ M3, M4, M6, M8; quyền U4/U1.
- **Automations:** Tổng hợp số liệu; cảnh báo vượt ngân sách; khóa khi đối soát xong.
- **AI:** Không.
- **Basic V1 scope:** Như trên; sổ phúng viếng tách quyền xem.
- **Advanced Later:** Chia chi phí theo nhánh gia đình, xuất báo cáo.

### Module 8 — Khách viếng & Truyền tin (Basic)
- **Purpose:** Một nguồn thông tin đúng cho khách; ghi nhận nhanh cho gia đình.
- **Jobs:** Thông báo nhất quán, tiếp khách, ghi nhận, cập nhật thay đổi.
- **User actions:** Soạn và công bố trang thông tin · chia sẻ link · cập nhật · ghi khách/đoàn/phúng viếng/lễ vật · bàn giao ca.
- **Inputs:** Hồ sơ (M2), quyết định lịch (M4), mốc (M3).
- **Outputs:** Trang thông tin công khai bằng link; danh sách khách; dữ liệu cảm ơn; biên bản bàn giao ca.
- **Core data:** PublicFuneralInfo, Announcement, Guest/Delegation, Visit, CondolenceEntry, GiftEntry, ShiftHandover.
- **States:** Trang: Nháp → Đã công bố → Đã cập nhật. Ca: Đang trực → Đã bàn giao.
- **Relationships:** Số tiền phúng viếng ghi vào CondolenceLedger (M7); danh sách cảm ơn sang M9.
- **Automations:** Quyết định thay đổi lịch/địa điểm → cập nhật trang và đánh dấu “thông tin đã thay đổi”.
- **AI:** Nháp cáo phó/trang thông tin từ hồ sơ (tùy chọn, xem mục 10).
- **Basic V1 scope:** Như trên; ghi nhanh một tay trên điện thoại.
- **Advanced Later:** Gửi hàng loạt, thiệp, sổ tang online.

### Module 9 — Hậu tang, Mốc tưởng niệm, Pháp lý & Khép vòng (Basic)
- **Purpose:** Đi từ “tiễn đưa xong” tới khép vòng; không quên các mốc gia đình chọn.
- **Jobs:** Hoàn tất trách nhiệm với người mất, người sống, pháp lý và tài chính.
- **User actions:** Làm checklist hậu tang · theo dõi thủ tục · chọn mốc (49 ngày / 100 ngày / giỗ đầu / mốc riêng / không theo dõi) · lập lịch, phân công, ngân sách cho mốc · xác nhận hoàn thành · khép vòng.
- **Inputs:** Hồ sơ, quyết định, danh sách cảm ơn, tài chính.
- **Outputs:** Tiến độ khép vòng; lịch hậu tang; tài liệu kết quả; trạng thái “Đã khép phần tức thời”.
- **Core data:** CloseoutTask, LegalBenefitCase, Requirement, Document, Result, MemorialMilestone, FollowUpPlan, ClosureState.
- **States:** Hậu tang đang mở → Chờ điều kiện khép → **Đã khép phần tức thời** → Theo dõi dài hạn (lịch các mốc).
- **Relationships:** Kế thừa M2; task M3; quyết định M4; giao việc M5; ngân sách M7; cảm ơn M8.
- **Automations:** Tính ngày mốc theo cách tính gia đình chọn (không áp chuẩn chung); điều kiện khép vòng dẫn xuất (mục 8).
- **AI:** Nháp lời cảm ơn (tùy chọn). Pháp lý: **không dùng AI**.
- **Basic V1 scope:** Như trên; mục pháp lý chỉ hiện nội dung đã có nguồn.
- **Advanced Later:** Theo dõi quyền lợi chi tiết, biểu mẫu tự động.

---

### 6.10 Bổ sung đặc tả sau Visual Review (2026-09-25)

Làm rõ trong phạm vi đã khóa, **không thêm module, không đổi V1 / Later / Out**. Nguồn: các nhận xét của Chủ dự án khi review bản mẫu HTML.

**Module 2 — Khởi động & Hồ sơ.** Câu hỏi hoàn cảnh gồm: nơi mất (bệnh viện / tại nhà / nơi khác), nơi làm lễ, hỏa táng / địa táng, **hình thức tổ chức** (1 gia đình tự tổ chức · 2 gia đình chủ trì, phối hợp Mặt trận, UBND xã, hội đoàn thể · 3 tôn giáo kết hợp nghi lễ tang · 4 chỉ nghi lễ tang), **đối tượng nghi lễ tang** (cán bộ, CCVC / quân nhân / công an nhân dân — hỏi khi chọn 3 hoặc 4), **nghi lễ tôn giáo** (truyền thống / Phật giáo, Công giáo, khác — không hỏi khi chọn 4), quy mô.

**Module 3 — Bản đồ.** Quy tắc hiển thị việc: mỗi việc có thể gắn điều kiện theo *nơi mất, nơi làm lễ, hình thức an táng, nghi lễ, hình thức tổ chức, quy mô*; việc chỉ hiện khi mọi điều kiện khớp. Việc có thể bị ẩn khi đã có bên khác làm thay (Ban lễ tang, Mặt trận). Ghi chú, danh sách chuẩn bị và danh sách kiểm trước việc khóa có biến thể theo nghi lễ. Một việc không thể quay lại chỉ được xác nhận khi các việc phía trước đã xong.

**Module 4 — Quyết định & Duyệt.** Thêm quyết định gốc *Hình thức an táng* (đổi → hiện tác động: thêm / bỏ việc, đổi quyết định giờ, hạng mục nhà cung cấp, báo nhà xe, cáo phó). Khi có Ban lễ tang: quyết định lịch lễ, nghi thức thuộc Ban lễ tang — hình thức 3 “gia đình xác nhận”, hình thức 4 “gia đình được thông báo, góp ý”. Gia đình luôn quyết việc riêng của gia đình, gồm hình thức và nơi an táng.

**Module 5 — Đội.** Thêm loại thành viên: *Ban lễ tang* (đồng tổ chức / chủ trì) và *hỗ trợ địa phương* (Ban công tác Mặt trận khu dân cư, hội đoàn thể).

**Module 6 — Nhà cung cấp.** Một nhà cung cấp có thể nhận **nhiều hạng mục (trọn gói)**; dữ liệu `categories[]` thay cho một loại duy nhất. Gợi ý trọn gói chỉ áp cho hạng mục chưa chọn / chưa cam kết; nhắc khi hạng mục có mong muốn riêng trong hồ sơ chuẩn bị. Hạng mục có điều kiện theo hoàn cảnh (ví dụ rạp chỉ khi làm lễ tại nhà; đào huyệt, xây mộ chỉ khi địa táng).

**Module 7 — Tài chính.** Khoản chi thêm: người chi, hình thức (tiền mặt / chuyển khoản), nguồn tiền (quỹ tiền mặt / tài khoản gia đình — chỉ lưu tên gợi nhớ và 4 số cuối), tài khoản bên nhận (chủ TK, ngân hàng, số TK — lưu đầy đủ, chỉ quyền Tài chính xem). Tổng hợp theo nguồn tiền. Khoản do Ban lễ tang, đơn vị chi trả tách riêng, không tính vào chi phí gia đình. Đối soát phúng viếng tách tiền mặt (kiểm đếm) và chuyển khoản (đối chiếu sao kê). App **chỉ ghi nhận**, không nhận hay chuyển tiền.

**Module 8 — Khách viếng.** Mỗi lượt phúng viếng thêm: *khách của ai* (bạn của từng người con / của cụ) và *hình thức* (tiền mặt / chuyển khoản). Cáo phó đổi theo nghi lễ (tên thánh) và hình thức tổ chức (Ban lễ tang, nếp sống văn minh).

**Module 9 — Hậu tang.** Danh sách việc hậu tang **là chặng 13–15 của Bản đồ** (một nguồn dữ liệu). Mọi mốc tưởng niệm hiện kèm ngày âm lịch; mốc theo nghi lễ (49 / 100 ngày hoặc lễ cầu hồn 7 / 30 ngày). **Danh sách cảm ơn theo từng người con**, lấy từ Sổ phúng viếng, chỉ hiện tên, nhóm, lễ vật (không hiện số tiền).

## 7. User Journey

| Bước | User Goal | User Action | System Response | Output | Next Step |
|---|---|---|---|---|---|
| **ENTRY** | Bắt đầu đúng cửa | Chọn “Chuẩn bị trước” hoặc “Người thân vừa mất” | Chuyển vào luồng tương ứng, không bắt đăng ký | Luồng phù hợp | Onboarding |
| **ONBOARDING** | Cho app biết hoàn cảnh với ít thao tác nhất | Trả lời vài câu hỏi hoàn cảnh; xác lập U1 (hoặc kích hoạt hồ sơ chuẩn bị) | Chạy luật điều kiện; nhận dữ liệu từ hồ sơ chuẩn bị nếu có | FuneralCase + điều kiện | First Value |
| **FIRST VALUE** | Biết ngay phải làm gì | Mở màn “Bây giờ” | Hiện việc khẩn cấp + quyết định gốc + điểm không thể quay lại | Danh sách việc đầu tiên | Core Loop |
| **CORE LOOP** | Điều phối mà không bị chìm | Quyết/duyệt · giao việc qua link · người hỗ trợ báo xong/phát sinh · ghi chi, nhà cung cấp, khách | Cập nhật trạng thái; lan tác động; nhắc và cảnh báo | Bản đồ luôn đúng | Progress |
| **PROGRESS** | Biết đang ở đâu | Xem tiến độ theo chặng, Có vấn đề, tài chính | Tổng hợp từ mọi module | Tiến độ + cảnh báo | Outcome |
| **OUTCOME** | Lo trọn và khép vòng | Hoàn tất hậu tang, đối soát, chọn mốc tưởng niệm | Kiểm tra điều kiện khép; chuyển việc dài hạn sang lịch | “Đã khép phần tức thời” + lịch mốc | Theo dõi các mốc |

*Journey cửa vào A:* Tạo hồ sơ chuẩn bị → hoàn thiện dần → chia sẻ → (khi sự kiện xảy ra) kích hoạt → nhập vào ONBOARDING ở trên với dữ liệu đã có.

---

## 8. Data and State Logic

**Core Entities:** PreNeedProfile · FuneralCase · DeceasedProfile · Situation · Participant · Role · ResponsibilityArea · Phase · Task · Milestone · Dependency · Decision · Option · ApprovalRequest · ImpactSet · Assignment · Issue · VendorDirectoryEntry · ServiceCategory · ServiceArea · GeoLocation · VendorSuggestion · Vendor · ServiceRequest · Quote · Commitment · Acceptance · Budget · Expense · Debt · CondolenceLedger · Reconciliation · PublicFuneralInfo · Announcement · Guest · CondolenceEntry · ShiftHandover · CloseoutTask · LegalBenefitCase · MemorialMilestone · Document · AuditLog · Notification.

**Relationships (ngữ nghĩa):**
- PreNeedProfile —kích hoạt→ FuneralCase (1:1, dữ liệu được map một lần).
- FuneralCase 1—n Phase 1—n Task; Task n—n Dependency; Task 1—n Assignment → Participant.
- Decision —sinh→ ImpactSet → {Task, Assignment, Expense, Commitment, Announcement}.
- Task (hạng mục dịch vụ) + địa chỉ nơi tổ chức + Decision —sinh→ VendorSuggestion (xếp hạng từ VendorDirectoryEntry + nhà cung cấp riêng của gia đình) —U1 xác nhận→ Vendor.
- Vendor 1—n Commitment —sinh→ Debt/Expense.
- CondolenceEntry (ghi ở Khách viếng) → CondolenceLedger (thuộc Tài chính, quyền riêng).
- Mọi entity → Document, AuditLog.

**State:** trạng thái của từng entity như đã nêu ở mục 6.

**Derived State:**
- *Bây giờ / Sắp tới / Cần quyết / Có vấn đề / Đã xong*: tính từ Task, Deadline, Dependency và Decision.
- *Tiến độ khép vòng*: tính từ tỷ lệ việc bắt buộc đã xong.
- **Khép vòng (phần tức thời)** = mọi CloseoutTask bắt buộc đã xong hoặc bỏ qua có lý do ∧ Tài chính ở trạng thái *Đã khóa* ∧ mọi Commitment đã nghiệm thu và thanh toán ∧ tài liệu kết quả đã lưu ∧ không còn việc quá hạn chưa xử lý. Việc dài hạn được chuyển sang lịch MemorialMilestone.

*Gợi ý nhà cung cấp hiện hành*: tính từ hạng mục, địa chỉ, quyết định và trạng thái danh bạ; hết hiệu lực khi một đầu vào thay đổi.

**Dependencies:** Địa chỉ nơi tổ chức → gợi ý nhà cung cấp; Hoàn cảnh → gói việc; Decision gốc → nhánh việc; điểm không thể quay lại phải được kiểm tra trước khi Task liên quan chuyển sang *Xong*.

---

## 9. Automation

| Loại | Nội dung |
|---|---|
| **DETERMINISTIC** | Sinh bản đồ theo luật CORE/CONDITIONAL/OPTIONAL · tính phụ thuộc và mở khóa việc · hạn và quá hạn · cảnh báo trước điểm không thể quay lại · tính ImpactSet khi đổi quyết định · % sẵn sàng hồ sơ chuẩn bị · map dữ liệu khi kích hoạt · tổng hợp tài chính và cảnh báo vượt · **xếp hạng nhà cung cấp đúng + gần nhất và tính lại khi địa chỉ/quyết định/danh bạ thay đổi; bên đã cam kết thì chuyển thành mục Cần quyết** · nhắc cam kết nhà cung cấp · tính ngày mốc theo cách tính gia đình chọn · điều kiện khép vòng · Chế độ tang gia (giảm thông báo, chỉ báo khi cần quyết) |
| **AI** | Chỉ nháp văn bản (mục 10) |
| **MANUAL** | Mọi quyết định gốc · duyệt chi · xác nhận nhà cung cấp được gợi ý · giữ/đổi nhà cung cấp đã cam kết khi đổi địa điểm · Admin quản lý danh bạ · nghiệm thu · chấp nhận rủi ro · kích hoạt hồ sơ · chọn có theo dõi mốc tưởng niệm hay không · công bố thông tin ra bên ngoài · khóa tài chính |

---

## 10. AI Role

Nguyên tắc: AI không quyết định thay Chủ thể. Nếu luật xác định làm tốt hơn thì **NO AI**.

| AI capability | Job | Input | Output | Benefit | Failure Risk | Human Review | V1/Later |
|---|---|---|---|---|---|---|---|
| Nháp cáo phó / trang thông tin | Soạn nhanh lời lẽ trang trọng | Hồ sơ người mất, lịch đã quyết | Bản nháp | Đỡ gánh viết lúc tang gia | Sai thông tin, lời lẽ không hợp phong tục | **Bắt buộc**: không tự công bố | **V1 (tùy chọn)** |
| Nháp lời cảm ơn | Soạn lời cảm ơn khách/đoàn | Danh sách khách | Bản nháp | Giảm việc hậu tang | Sai tên, sai vai vế | Bắt buộc | **V1 (tùy chọn)** |
| Sinh bản đồ việc | — | — | — | — | — | — | **NO AI** (luật) |
| Phân tích tác động thay đổi | — | — | — | — | — | — | **NO AI** (đồ thị phụ thuộc) |
| Gợi ý nhà cung cấp gần nhất | — | — | — | — | — | — | **NO AI** (luật + khoảng cách) |
| Hướng dẫn pháp lý | — | — | — | — | — | — | **NO AI** (chỉ dùng nội dung có nguồn) |
| Nhập hồ sơ từ ảnh giấy tờ | Giảm gõ tay | Ảnh | Trường dữ liệu | Nhanh hơn | Đọc sai dữ liệu nhạy cảm | Bắt buộc | Later |
| Ghi khách bằng giọng nói | Ghi nhanh khi đang tiếp khách | Giọng nói | Entry | Rảnh tay | Sai tên, sai số tiền | Bắt buộc | Later |

---

## 11. Product Blueprint

- **Product:** App Đám Hiếu — “bộ não chung” điều phối toàn vòng đám hiếu theo hoàn cảnh.
- **Primary Customer:** Người đại diện gia đình (U1) tổ chức đám hiếu; và U0, người chuẩn bị trước cho mình hoặc người thân.
- **Core Job:** Biết đúng việc, đúng thời điểm, đúng người, đúng phương tiện, đúng chi phí; xử lý thay đổi; hoàn tất tới khi khép vòng.
- **Core Desired Outcome:** Lo trọn — không bỏ sót — không rối — hạn chế hối tiếc.
- **Product Promise:** *Một nơi cho cả gia đình biết phải làm gì tiếp theo, ai đang làm, cái gì cần mình quyết, từ phút đầu tới khi khép vòng, mà không quyết định thay gia đình.*
- **Final Product Map:** mục 1.
- **Product Boundary:** mục 2.
- **Core Experience:** mục 3.
- **Core Modules:** Khởi động · Bản đồ · Quyết định & Duyệt · Đội & Điều phối.
- **Domain modules (Basic V1):** Chuẩn bị trước · Nhà cung cấp · Tài chính · Khách viếng · Hậu tang.
- **Supporting Experiences:** mục 1.2.
- **Later Modules:** Tưởng niệm nâng cao; nhà cung cấp và tích hợp nâng cao.
- **Explicitly Rejected:** Marketplace mở; chatbot trung tâm; mạng xã hội tang lễ; module capability độc lập.
- **Module Relationships:** mục 12, phần 15.
- **Core Entities:** mục 8.
- **Automation:** mục 9.
- **AI Role:** mục 10.
- **User Journey:** mục 7.
- **Time To First Value:** Mục tiêu thiết kế là chưa tới 1 phút từ lúc mở app tới danh sách *Việc cần làm ngay*, không cần đăng ký. *(Đây là mục tiêu, chưa có số đo.)*
- **Key Risks:** Dữ liệu nhạy cảm (phúng viếng, tài chính, giấy tờ) · độ đúng của nội dung phong tục/pháp lý theo vùng · xung đột giữa nguyện vọng đã chuẩn bị và quyết định thực tế · bảo mật Link User · **độ phủ và độ đúng của danh bạ nhà cung cấp theo khu vực (danh bạ trống thì gợi ý rỗng); chất lượng chuyển địa chỉ Việt Nam thành tọa độ; chi phí dịch vụ bản đồ** · phạm vi V1 rộng (9 module Basic) nên build lâu.
- **Remaining Research Gaps:** mục 14.

---

## 12. MVP Build Brief

1. **MVP Objective:** Chứng minh vòng *(Chuẩn bị → Kích hoạt) / Khởi động → Bản đồ → Quyết → Giao → Theo dõi chi phí/nhà cung cấp/khách → Hậu tang → Khép vòng* chạy trọn cho một đám hiếu thật.
2. **Primary User:** U1 người đại diện gia đình; U0 người chuẩn bị trước; người hỗ trợ (Link User).
3. **Core Outcome:** U1 biết việc tiếp theo, quyết điều cần quyết, giao được việc, và tới lúc khép vòng không còn việc bắt buộc nào bị bỏ sót.
4. **V1 Module Map:** 9 module ở mục 1.
5. **Features by Module:** cột Basic V1 ở mục 5 và mục 6.
6. **User Flow:** mục 7.
7. **Core Data Objects:** mục 8.
8. **State:** mục 6 (theo module) và mục 8 (dẫn xuất).
9. **Product Logic:** Hoàn cảnh sinh nhánh việc · quyết định gốc sinh tác động · điểm không thể quay lại được kiểm tra trước · mỗi thông tin chỉ nhập một lần · Chủ thể quyết, người khác thực hiện · khép vòng là trạng thái dẫn xuất.
10. **Automations:** mục 9.
11. **AI Actions:** Nháp cáo phó, nháp lời cảm ơn; cả hai tùy chọn và có người duyệt.
12. **Inputs:** Hoàn cảnh, hồ sơ, quyết định, người, việc, chi phí, nhà cung cấp, khách, tài liệu.
13. **Outputs:** Bản đồ 5 góc nhìn, hàng chờ quyết, phân công, báo cáo tài chính/đối soát, trang thông tin công khai, danh sách khách/cảm ơn, lịch hậu tang, trạng thái khép vòng.
14. **Required Screens / Views (mức module; Visual Prototype sẽ lập inventory 100%):**
    - Cửa vào: Chọn cửa vào · Câu hỏi hoàn cảnh · Việc cần làm ngay · Xác lập U1.
    - Chuẩn bị trước: Danh sách hồ sơ · Chi tiết hồ sơ theo nhóm (% sẵn sàng) · Chia sẻ quyền · Kích hoạt.
    - Bản đồ: Bây giờ · Sắp tới · Cần quyết · Có vấn đề · Đã xong · Theo chặng · Chi tiết việc.
    - Quyết định: Hàng chờ quyết/duyệt · Chi tiết quyết định + tác động · Xác nhận thay đổi.
    - Đội: Thành viên & vai trò · Vùng trách nhiệm · Giao việc · Màn hình Link User (việc của tôi).
    - Nhà cung cấp: Gợi ý theo hạng mục (xếp hạng + khoảng cách + xác nhận) · Danh sách nhà cung cấp của vụ việc · Chi tiết (báo giá, cam kết, phát sinh, nghiệm thu) · Mục Cần quyết “nhà cung cấp cách xa địa điểm mới”.
    - Admin: Quản lý danh bạ nhà cung cấp (danh sách, thêm/sửa, loại dịch vụ, địa chỉ trên bản đồ, khu vực phục vụ, bật/tắt).
    - Tài chính: Tổng quan · Chi tiêu/đề nghị · Duyệt chi · Công nợ · Sổ phúng viếng (quyền riêng) · Đối soát/khóa.
    - Khách viếng: Soạn trang thông tin · Trang công khai (link) · Ghi nhanh khách/phúng viếng · Bàn giao ca.
    - Hậu tang: Checklist hậu tang · Thủ tục · Chọn và lập mốc tưởng niệm · Khép vòng.
    - Chung: Thông báo · Tài liệu · Lịch sử/audit · Cài đặt Chế độ tang gia.
    - *Auth, Onboarding tài khoản, Account, Checkout/SePay, Admin sẽ được đánh giá ở bước Production Completeness.*
15. **Module Relationships:**
    ```text
    CHUẨN BỊ TRƯỚC ──kích hoạt──► KHỞI ĐỘNG & HỒ SƠ ──► BẢN ĐỒ ◄── trạng thái từ mọi module
                                                           │
                                   QUYẾT ĐỊNH & DUYỆT ◄────┤──► ĐỘI & ĐIỀU PHỐI
                                          │ tác động          │
                          ┌───────────────┼──────────────┐    │
                          ▼               ▼              ▼    ▼
                    NHÀ CUNG CẤP ──► TÀI CHÍNH ◄── KHÁCH VIẾNG (phúng viếng → sổ riêng)
                                          │              │
                                          └──► HẬU TANG & KHÉP VÒNG ◄──┘ (cảm ơn)
    ```
16. **Required Integrations:** Chia sẻ link (copy / share sheet của điện thoại) · **dịch vụ bản đồ: chuyển địa chỉ thành tọa độ, tính khoảng cách, chọn điểm trên bản đồ; nhà cung cấp cụ thể chốt ở bước xây app** · lưu trữ tệp · thông báo trong app và thông báo đẩy/email cho tài khoản. Thanh toán mua app (SePay) sẽ được xác định ở bước Production Completeness.
17. **Deferred Integrations:** SMS/Zalo OA gửi hàng loạt · booking nhà cung cấp · OCR/AI đọc giấy tờ · đồng bộ lịch ngoài · xuất báo cáo kế toán.
18. **Explicitly Not in V1:** mục 2, phần EXPLICITLY OUT và LATER.
19. **Demo Flow:** mục 4.
20. **Definition of Done:**
    - Chạy trọn cả hai cửa vào; kích hoạt hồ sơ chuẩn bị không phải nhập lại dữ liệu.
    - Bản đồ sinh đúng theo ít nhất các biến thể hoàn cảnh chính (nơi mất × hình thức) bằng luật.
    - Thay đổi một quyết định gốc thì hiện ImpactSet và cập nhật việc, người, chi phí, nhà cung cấp, trang thông tin.
    - Link User nhận việc và báo xong mà không cần cài app.
    - Nhập địa chỉ nơi tổ chức → mỗi hạng mục dịch vụ có danh sách **đúng + gần nhất** kèm khoảng cách. Đổi địa chỉ hoặc đổi mai táng/hỏa táng thì gợi ý tự tính lại. Hạng mục đã cam kết không bị tự thay mà sinh mục Cần quyết. Không có bên phù hợp thì báo rõ. Admin thêm/sửa/ẩn được nhà cung cấp.
    - Tài chính ra được số Dự kiến/Đã chi/Còn trả/Phát sinh và khóa được; sổ phúng viếng bị giới hạn quyền.
    - Trang thông tin công khai cập nhật khi quyết định lịch thay đổi.
    - Hậu tang: chọn mốc (hoặc không theo dõi), lập lịch và phân công; đạt trạng thái “Đã khép phần tức thời” theo điều kiện dẫn xuất.
    - Mục pháp lý không hiển thị hướng dẫn nào chưa có nguồn.
    - Mọi thay đổi quan trọng đều có audit log.

---

## 13. Traceability Matrix

| Module | Job | Desired Outcome | Research Evidence | Human Decision | V1? |
|---|---|---|---|---|---|
| Chuẩn bị trước | Chuẩn bị khi còn thời gian; chuyển giao | Giảm quyết định khẩn; không mất nguyện vọng | Cửa vào A/B; U0; Journey 6.18 | Human Review nâng lên thành cửa vào ngang hàng; khóa | V1 Basic |
| Khởi động & Hồ sơ | Biết việc đầu tiên | Không rối trong giờ đầu | Journey A 1–5 | Khóa theo đề xuất | V1 |
| Bản đồ | Nhìn toàn cục | Không bỏ sót | 15 chặng; 12 cách làm | Khóa theo đề xuất | V1 |
| Quyết định & Duyệt | Quyết — Duyệt — Kiểm soát | Hạn chế hối tiếc; giảm mâu thuẫn | Chủ thể/Phương tiện; điểm không thể quay lại | Khóa; có lối vào riêng (mặc định Q5) | V1 |
| Đội & Điều phối | Giao đúng người | Không rối; U1 không thành người chạy việc | U1–U9; Journey B/C | Khóa theo đề xuất | V1 |
| Nhà cung cấp | Tìm đúng bên gần nơi tổ chức; kiểm soát bên ngoài | Đúng phương tiện, đúng chi phí; không thiếu hạng mục | Journey F; đau 10; cơ hội 3 (thay đổi lan tới nhà cung cấp). *Phân bổ theo khoảng cách: quyết định của Chủ dự án, research chưa kiểm chứng* | Chủ dự án khóa v2: V1 + gợi ý đúng/gần nhất tự cập nhật; AI phản biện → U1 xác nhận, danh bạ do Admin quản lý | V1 Basic + Gợi ý |
| Tài chính | Minh bạch tiền | Đúng chi phí; khép tài chính | Journey D; đau 6, 12, 20 | Khóa; sổ phúng viếng thuộc đây (Q2) | V1 Basic |
| Khách viếng | Thông báo, tiếp khách | Không thất lạc ghi nhận | Journey E/G; đau 9, 13, 14 | Khóa; thao tác phúng viếng ở đây (Q2) | V1 Basic |
| Hậu tang & Khép vòng | Hoàn tất trách nhiệm | Lo trọn; khép vòng | Chặng 13–15; đau 23 | Human Review mở rộng sang mốc tưởng niệm; khóa | V1 Basic |
| Tưởng niệm nâng cao | Lưu giữ ký ức | Tiếp nối sau vận hành | Các việc sau tang | Khóa Later | Later |
| Marketplace mở | Tìm/đặt dịch vụ | — | Chưa có evidence | Khóa Out | Out |

**Chuỗi truy vết:** MARKET EVIDENCE (Foundation) → AI PROPOSAL (bản đề xuất) → HUMAN REVIEW (hai cửa vào, mốc tưởng niệm) → FINAL PRODUCT DECISION (tài liệu này).

---

## 14. Remaining Research Gaps

Các gap này **không chặn** việc làm bản mẫu trực quan, nhưng phải được xử lý đúng thời điểm:

| Gap | Chặn bước nào |
|---|---|
| Nguồn pháp lý/thủ tục hiện hành theo địa phương | Phát hành nội dung mục Pháp lý (Module 9) |
| Nội dung phong tục/mốc theo vùng và tín ngưỡng | Bộ luật điều kiện của Bản đồ và cách tính mốc |
| Mức sẵn sàng nhập dữ liệu nhạy cảm (phúng viếng, tài chính, giấy tờ) | Kiểm chứng thị trường; thiết kế quyền riêng tư |
| Chuẩn bảo mật, thời hạn lưu trữ, quyền xóa dữ liệu | Production Completeness |
| Cơ chế xác thực an toàn cho Link User | Production Completeness |
| Xác minh quyền kích hoạt hồ sơ chuẩn bị; xử lý xung đột nguyện vọng và quyết định thực tế | Production Completeness |
| Willingness to pay, giá, kênh phân phối, retention | Checkout/giá bán (Production) và Sales Page — hiện **CHƯA XÁC ĐỊNH** |
| Competitor/capability matrix độc lập | Sales Angle |
| Ranh giới vận hành giữa app và đơn vị tang lễ | Nhà cung cấp Advanced (Later) |
| Gia đình có thực sự chọn nhà cung cấp theo khoảng cách không; nguồn dữ liệu ban đầu và cách duy trì danh bạ theo khu vực | Nạp dữ liệu danh bạ trước khi ra mắt; Kiểm chứng thị trường |
| Chọn dịch vụ bản đồ và cách tính khoảng cách (đường đi hay đường chim bay) | Bước xây app (phase backend) |
| Quy định hiện hành về lễ tang cán bộ, quân đội, công an, người có công (nghi thức, đối tượng, chế độ chi trả) | Nội dung nhánh “nghi thức tổ chức” |
| Nghi thức Công giáo theo từng giáo phận; nghi lễ Tin Lành, Cao Đài, Hòa Hảo và khác biệt vùng miền | Nội dung các nhánh tín ngưỡng |
| Kiểm thử thuật toán lịch âm Việt Nam (múi giờ +7), đặc biệt tháng nhuận | Bước xây app |
| Mức độ gia đình chấp nhận ghi phúng viếng chuyển khoản; cách bảo vệ dữ liệu tài khoản bên nhận | Kiểm chứng thị trường; Production (bảo mật) |

---

## FINAL QUALITY CHECK

- **Product clarity:** Nhìn sơ đồ mục 1.2 hiểu được app gồm 2 cửa vào, 3 module lõi và 4 miền công việc. ✓
- **Human decision:** Đã phản ánh cả hai thay đổi từ Human Review; các câu hỏi còn ngỏ đi theo khuyến nghị đã có trong bản đề xuất và được ghi rõ ở 1.3. ✓
- **Domain completeness:** Không loại module nền tảng nào chỉ vì build khó; các module lớn được giữ ở mức Basic. ✓
- **Feature bloat / Module vs capability:** Reminder, AI, mobile, tìm kiếm, dashboard là capability xuyên module, không thành module. ✓
- **MVP:** 9 module Basic là phạm vi rộng. Rủi ro build được ghi ở Key Risks; không cắt ngầm module đã khóa. ✓
- **Evidence:** Phân biệt evidence (Foundation) với quyết định human và với mặc định AI. ✓
