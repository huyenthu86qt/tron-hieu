# ĐỀ XUẤT CẤU TRÚC SẢN PHẨM — APP ĐÁM HIẾU

**Trạng thái:** MODE 1 — Module Discovery & Human Review  
**Nguồn chuẩn:** `Master Foundation App Đám Hiếu.md` do Chủ dự án cung cấp  
**Phạm vi:** Đề xuất module ban đầu; chưa phải Product Architecture cuối, chưa phải MVP, chưa phải danh sách màn hình hay Build Brief.

## 1. Research Sufficiency Check

### Kết luận

**Đủ để xây dựng bản đề xuất module ban đầu.** Tài liệu đã xác định rõ bốn yếu tố quyết định cấu trúc sản phẩm:

- **Primary Customer:** Gia đình/thân nhân người mất; người đại diện gia đình là người trực tiếp vận hành.
- **Core Job:** Nhìn toàn bộ, biết đúng việc, ra quyết định, giao việc, duyệt, điều phối, kiểm soát và khép vòng đám hiếu.
- **Core Desired Outcome:** Lo trọn đám hiếu — không bỏ sót — không rối — hạn chế những điều khiến gia đình hối tiếc.
- **Product Concept:** Một “bộ não chung” theo hoàn cảnh, giúp gia đình điều phối toàn bộ vòng đám hiếu nhưng không quyết định thay Chủ thể.

### Non-blocking gaps

Các khoảng trống dưới đây chưa ngăn cản việc đề xuất module, nhưng phải được xử lý trước khi viết nội dung pháp lý chi tiết hoặc chốt mô hình thương mại:

- Chưa có competitor/capability matrix và dữ liệu review thị trường độc lập.
- Chưa có bằng chứng về willingness to pay, mức giá, retention hoặc kênh phân phối.
- Chưa có kiểm chứng người dùng cho mức độ sẵn sàng nhập dữ liệu nhạy cảm như phúng viếng, tài chính, giấy tờ.
- Chưa có bộ nguồn pháp lý/chính quyền hiện hành để xây hướng dẫn thủ tục cụ thể.
- Chưa xác định ranh giới vận hành giữa app và đơn vị tang lễ/nhà cung cấp ở V1.
- Chưa xác định chuẩn bảo mật, thời hạn lưu trữ và quyền xóa dữ liệu nhạy cảm.

Các gap này cần được ghi nhận là rủi ro, không được tự lấp bằng giả định.

## 2. Product Understanding

**PRODUCT IDEA**  
App điều phối toàn vòng đám hiếu tại Việt Nam theo hoàn cảnh thực tế của từng gia đình.

**PRIMARY CUSTOMER**  
Người đại diện gia đình tổ chức đám hiếu trong tình huống đã phát sinh; đồng thời có **U0 — người chuẩn bị trước cho bản thân hoặc người thân** trong tình huống biết trước/chủ động chuẩn bị. Gia đình/thân nhân vẫn là Chủ thể gốc khi đám hiếu được kích hoạt.

**CORE JOB**  
Xác định đúng việc cần làm, đúng thời điểm, đúng người, đúng phương tiện và đúng chi phí; xử lý thay đổi/phát sinh; hoàn tất mọi trách nhiệm cho tới khi khép vòng.

**CORE DESIRED OUTCOME**  
Gia đình lo trọn đám hiếu mà không bị chìm trong hàng trăm đầu việc, giảm bỏ sót, rối loạn và hối tiếc.

**CURRENT SOLUTIONS ĐƯỢC TÀI LIỆU PHẢN ÁNH**  
Hỏi người lớn tuổi/hàng xóm/người làm dịch vụ; điều phối qua gọi điện và nhiều nhóm chat; ghi chép bằng sổ, điện thoại và trí nhớ; giao việc miệng; phụ thuộc nhiều nhà cung cấp rời rạc.

**STRONGEST PAINS**

1. Không biết việc nào phải làm trước/sau trong thời gian rất ngắn.
2. Không có một người hay hệ thống nắm toàn cục.
3. Phân công, thông tin và thay đổi bị phân tán.
4. Chi phí, phúng viếng, nhà cung cấp và trách nhiệm thiếu minh bạch.
5. Sợ bỏ sót điều quan trọng và chỉ phát hiện khi không thể sửa.

**STRONGEST OPPORTUNITIES**

1. Tạo bản đồ công việc động dựa trên hoàn cảnh, không dùng checklist cố định.
2. Chỉ đưa đúng việc/đúng quyết định tới đúng người vào đúng thời điểm.
3. Một thay đổi tự lan tới công việc, người, lịch, nhà cung cấp và khách bị ảnh hưởng.
4. Cho người hỗ trợ/khách/nhà cung cấp tham gia bằng link mà không buộc cài app.
5. Dẫn gia đình qua cả hậu tang, pháp lý và tài chính để thực sự khép vòng.

**IMPORTANT CONTRADICTORY EVIDENCE / UNCERTAINTY**  
Tài liệu là nền tảng sản phẩm đã khóa, không phải nghiên cứu thị trường độc lập. Vì vậy mức độ đau và logic sản phẩm rất rõ, nhưng chưa có bằng chứng để kết luận mọi nhóm người dùng sẽ chấp nhận cùng một độ sâu tính năng, đặc biệt với tài chính, phúng viếng, nhà cung cấp và thủ tục pháp lý.

## 3. Module Possibility Map

### Core outcome modules

- Khởi động & Hồ sơ đám hiếu.
- Chuẩn bị trước & Hồ sơ dự liệu.
- Bản đồ đám hiếu.
- Quyết định & Duyệt.
- Đội đám hiếu & Điều phối.

### Domain foundation modules

- Dịch vụ & Nhà cung cấp.
- Tài chính & Đối soát.
- Khách viếng & Truyền tin.
- Hậu tang, Pháp lý & Khép vòng.

### Later modules

- Không gian Lưu giữ & Tưởng niệm nâng cao.
- Mạng lưới/marketplace nhà cung cấp nâng cao.

### Cross-module capabilities — không tách thành module riêng

- Công cụ điều kiện theo **CORE + CONDITIONAL + OPTIONAL**.
- Nhắc việc, cảnh báo, mức độ khẩn và “Chế độ tang gia”.
- Phân quyền U0–U9, Full/Limited/Link/No-App User.
- Thông báo và đồng bộ thay đổi xuyên module.
- Tài liệu/tệp, tìm kiếm, lịch sử thay đổi và nhật ký xác nhận.
- Giao diện mobile-first, liên kết công khai/riêng tư, hỗ trợ truy cập nhanh.
- Lớp nội dung theo địa phương, tín ngưỡng, phong tục và nguồn pháp lý đã kiểm chứng.
- AI chỉ hỗ trợ khi tốt hơn luật xác định; AI không quyết định thay Chủ thể.

### Reject as standalone direction

- AI chatbot tổng quát như trung tâm sản phẩm.
- Marketplace mở ở V1.
- Mạng xã hội tang lễ.
- Module “nhắc việc”, “mobile”, “dashboard” hoặc “tìm kiếm” độc lập.

## 4. Module Proposal Table

| # | Module đề xuất | Người dùng làm gì trong đây? | Đầu ra / Giá trị nhận được | Evidence từ Foundation | AI đề xuất |
|---:|---|---|---|---|---|
| 1 | **Khởi động & Hồ sơ đám hiếu** | Chọn tình huống, xử lý khẩn cấp, xác lập người đại diện, nhập dần hồ sơ người mất và hoàn cảnh | Nhận việc phải làm ngay; tạo một hồ sơ dùng xuyên suốt; không phải nhập lại | Journey A chặng 1–5; “nhập ít nhất”; một thông tin chỉ nhập một lần | **V1** |
| 2 | **Bản đồ đám hiếu** | Xem Bây giờ/Sắp tới/Cần quyết/Có vấn đề/Đã xong; theo dõi trình tự, phụ thuộc, thời hạn và điểm không thể quay lại | Một nguồn sự thật về toàn vòng; biết đang ở đâu và việc gì tiếp theo | Toàn giác 15 chặng; 12 cách làm; Journey A chặng 6; khép vòng | **V1** |
| 3 | **Quyết định & Duyệt** | Chọn phương án gốc, xem tác động, duyệt/không duyệt các đề nghị và xác nhận thay đổi | Quyền quyết định ở đúng Chủ thể; thay đổi có kiểm soát; giảm mâu thuẫn và sửa rời rạc | Chủ thể quyết định; quyết định gốc; Journey thay đổi quyết định; U2 chuyển việc vượt quyền lên U1 | **V1** |
| 4 | **Đội đám hiếu & Điều phối** | Thêm người hỗ trợ, chia vùng trách nhiệm, giao/nhận/hoàn thành việc, báo phát sinh | Rõ người — rõ việc — rõ trạng thái; U1 chỉ xử lý điều cần quyết | Journey B/C; U1–U9; lập Đội Đám Hiếu; “người nhận việc không nhất thiết cài App” | **V1** |
| 5 | **Dịch vụ & Nhà cung cấp** | Gửi yêu cầu, ghi báo giá, chọn nhà cung cấp, theo dõi cam kết, phát sinh, nghiệm thu và công nợ | Kiểm soát nhiều bên ngoài mà không phụ thuộc họ phải dùng app | Journey F; đau số 10; vòng thông tin → dịch vụ → nghiệm thu | **Cân nhắc V1 — Basic** |
| 6 | **Tài chính & Đối soát** | Lập ngân sách, ghi dự toán/chi/phát sinh, đề nghị và duyệt chi, theo dõi công nợ, khóa tài chính | Biết dự kiến, đã chi, còn trả, phát sinh; minh bạch và khép tài chính | Journey D; đau 6, 12, 20; điều kiện khép vòng | **V1 — Basic** |
| 7 | **Khách viếng & Truyền tin** | Tạo thông tin lễ tang/cáo phó, chia sẻ link, cập nhật thay đổi, ghi nhận khách/phúng viếng/lễ vật và bàn giao ca | Một nguồn thông tin đúng cho khách; tiếp đón và ghi nhận nhanh, giảm thất lạc | Journey E/G; đau 9, 13, 14; chặng thông báo và tiếp khách | **V1 — Basic** |
| 8 | **Hậu tang, Mốc tưởng niệm, Pháp lý & Khép vòng** | Theo dõi thu dọn, hoàn trả, cảm ơn, giấy tờ, quyền lợi, nghĩa vụ; chọn và chuẩn bị các mốc 49 ngày, 100 ngày, giỗ đầu hoặc mốc khác theo gia đình | Không dừng ở an táng/hỏa táng; không quên mốc gia đình lựa chọn; biết khi nào phần việc tức thời đã khép và việc dài hạn đã được chuyển sang lịch | Chặng 13–15; Journey 6.16–6.18; đau số 23; tiêu chí Khép vòng | **V1 — Basic** |
| 9 | **Chuẩn bị trước & Hồ sơ dự liệu** | Người còn sống hoặc người thân chuẩn bị dần thông tin, nguyện vọng, người đại diện, liên hệ, giấy tờ, phương án mai táng/hỏa táng, nghi lễ, địa điểm, quy mô, ngân sách và nhà cung cấp; kích hoạt hồ sơ khi sự kiện xảy ra | Giảm số quyết định trong lúc tang gia; giữ nguyện vọng rõ ràng; chuyển dữ liệu sang hồ sơ đám hiếu mà không nhập lại | Cửa vào A; Journey 6.18; U0; nguyên tắc một thông tin chỉ nhập một lần | **V1 — Basic** |
| 10 | **Không gian Lưu giữ & Tưởng niệm nâng cao** | Lưu tư liệu, ảnh, câu chuyện và không gian tưởng niệm dài hạn | Chuyển từ công cụ vận hành sang không gian lưu giữ ký ức | Điểm kết thúc Journey; các việc sau tang | **Later** |
| 11 | **Marketplace nhà cung cấp mở** | Tìm/so sánh/đặt dịch vụ trong hệ sinh thái nhiều bên | Có thể giảm công tìm kiếm nhưng làm tăng mạnh bài toán cung, kiểm duyệt, tranh chấp và tích hợp | Foundation chỉ yêu cầu điều phối nhà cung cấp, chưa có evidence cho marketplace | **Reject V1** |

## 5. Human-readable Product Map

### Kiến trúc cấp cao đã sửa sau Human Review

Sản phẩm **không bắt đầu bằng một danh sách module phẳng**. Nó bắt đầu bằng hai hoàn cảnh sử dụng ngang hàng:

1. **Chưa xảy ra — muốn chuẩn bị trước.**
2. **Đã xảy ra — cần tổ chức ngay.**

Hai hành trình hội tụ khi hồ sơ chuẩn bị được kích hoạt. Từ đó cả hai cùng sử dụng một lõi vận hành đám hiếu.

```text
APP ĐÁM HIẾU
│
├── CỬA VÀO A — CHƯA XẢY RA: CHUẨN BỊ TRƯỚC
│     │
│     └── MODULE: CHUẨN BỊ TRƯỚC & HỒ SƠ DỰ LIỆU
│           ├── Chuẩn bị cho bản thân hoặc người thân
│           ├── Người đại diện và người cần liên hệ
│           ├── Giấy tờ, nguyện vọng và mong muốn hậu sự
│           ├── Mai táng/hỏa táng, nghi lễ, địa điểm, quy mô, ngân sách
│           ├── Tiến độ hoàn thiện và chia sẻ có kiểm soát
│           └── KÍCH HOẠT HỒ SƠ khi sự kiện xảy ra
│                         │
│                         ▼
├── CỬA VÀO B — ĐÃ XẢY RA: NGƯỜI THÂN VỪA MẤT
│     │
│     └── MODULE: KHỞI ĐỘNG KHẨN CẤP & HỒ SƠ ĐÁM HIẾU
│           ├── Việc khẩn cấp theo nơi/tình huống mất
│           ├── Nhận dữ liệu từ hồ sơ chuẩn bị, nếu có
│           ├── Xác lập người đại diện gia đình
│           ├── Hồ sơ người mất
│           └── Hoàn cảnh: địa phương, nơi tổ chức, hình thức, quy mô
│
├── LÕI VẬN HÀNH CHUNG SAU KHI ĐÁM HIẾU ĐƯỢC KÍCH HOẠT
│
├── BẢN ĐỒ ĐÁM HIẾU
│     ├── Bây giờ / Sắp tới / Cần quyết / Có vấn đề / Đã xong
│     ├── Việc, mốc, phụ thuộc và trạng thái
│     ├── Kiểm tra trước điểm không thể quay lại
│     └── Tiến độ khép vòng
│
├── QUYẾT ĐỊNH & DUYỆT
│     ├── Quyết định gốc
│     ├── Đối chiếu nguyện vọng đã chuẩn bị với hoàn cảnh thực tế
│     ├── Tác động tới việc, người, chi phí, nhà cung cấp, khách
│     ├── Hàng chờ cần U1 duyệt
│     └── Xác nhận thay đổi
│
├── ĐỘI ĐÁM HIẾU & ĐIỀU PHỐI
│     ├── Người và vai trò U1–U9
│     ├── Nhóm trách nhiệm
│     ├── Giao / nhận / hoàn thành việc
│     └── Báo phát sinh, cần hỗ trợ, chuyển cấp
│
├── DỊCH VỤ & NHÀ CUNG CẤP
│     ├── Yêu cầu và báo giá
│     ├── Cam kết thời gian/hạng mục
│     ├── Phát sinh và nghiệm thu
│     └── Công nợ/thanh toán liên kết
│
├── TÀI CHÍNH & ĐỐI SOÁT
│     ├── Ngân sách và dự toán
│     ├── Đề nghị/duyệt/ghi nhận chi
│     ├── Phát sinh và cảnh báo vượt
│     └── Công nợ, đối soát, khóa tài chính
│
├── KHÁCH VIẾNG & TRUYỀN TIN
│     ├── Cáo phó/trang thông tin bằng link
│     ├── Thông báo thay đổi
│     ├── Ghi khách/phúng viếng/lễ vật
│     └── Ca trực và bàn giao
│
├── HẬU TANG, MỐC TƯỞNG NIỆM, PHÁP LÝ & KHÉP VÒNG
│     ├── Thu dọn, trả đồ, cảm ơn
│     ├── Thủ tục/quyền lợi/nghĩa vụ theo hoàn cảnh
│     ├── 49 ngày / 100 ngày / giỗ đầu / mốc gia đình lựa chọn
│     ├── Lịch, checklist, phân công, ngân sách và nhắc việc cho từng mốc
│     ├── Lưu kết quả và tài liệu
│     └── Khép phần việc tức thời, chuyển việc dài hạn sang lịch hậu tang
│
├── LATER
│     └── Không gian Lưu giữ & Tưởng niệm nâng cao
│
└── NỀN TẢNG XUYÊN MODULE
      ├── CORE + CONDITIONAL + OPTIONAL
      ├── Phân quyền và truy cập bằng link
      ├── Cảnh báo / Chế độ tang gia
      ├── Đồng bộ tác động khi có thay đổi
      ├── Nội dung địa phương, phong tục, pháp lý có nguồn
      └── Bảo mật, lịch sử, tài liệu và audit
```

## 6. Module Detail Cards

### Module 1 — Khởi động & Hồ sơ đám hiếu

**Vai trò:** Cửa vào tạo giá trị ngay, đồng thời hình thành dữ liệu nền cho toàn vòng.  
**User làm gì:** Chọn tình huống; trả lời câu hỏi thật sự ảnh hưởng hành động; xác lập U1; bổ sung dần hồ sơ người mất và hoàn cảnh.  
**User nhận được gì:** Việc cần làm ngay và một hồ sơ duy nhất dùng cho mọi module.  
**Jobs served:** Biết việc đầu tiên; tránh nhập lại; cá nhân hóa nhánh việc.  
**Evidence:** Journey A chặng 1–5; luật “không bắt đăng ký trước khi nhận giá trị”; “một thông tin chỉ nhập một lần”.  
**Dữ liệu chính:** Funeral Case, Deceased Profile, Situation, Location, Representative, Key Preferences.  
**Liên kết:** Sinh điều kiện cho Bản đồ, Quyết định, Hậu tang/Pháp lý và Khách viếng.  
**Nếu bỏ:** App trở thành checklist chung, đi ngược nguyên tắc hoàn cảnh đứng trước nhánh việc.  
**AI recommendation:** **V1.**  
**Điều chưa chắc:** Mức dữ liệu tối thiểu trước khi yêu cầu tạo tài khoản/lưu hồ sơ dài hạn.

### Module 2 — Bản đồ đám hiếu

**Vai trò:** Bộ não vận hành của sản phẩm.  
**User làm gì:** Xem đúng phần cần xử lý theo thời điểm; theo dõi mốc, phụ thuộc, vấn đề và trạng thái khép vòng.  
**User nhận được gì:** Một nguồn sự thật, ưu tiên rõ, giảm nhớ và giảm hỏi.  
**Jobs served:** Nhìn toàn cục nhưng chỉ hành động trên phần cần thiết.  
**Evidence:** Toàn giác 15 chặng; 12 cách làm; Journey chặng 6, 11–16 và 21.  
**Dữ liệu chính:** Phase, Task, Milestone, Dependency, Deadline, Condition, Risk, Completion Evidence.  
**Liên kết:** Nhận hoàn cảnh từ M1; nhận quyết định từ M3; giao việc qua M4; phản ánh chi phí, vendor, khách và hậu tang.  
**Nếu bỏ:** Không còn khác biệt cốt lõi giữa app và một bộ checklist/tài liệu hướng dẫn.  
**AI recommendation:** **V1.**  
**Điều chưa chắc:** Độ chi tiết bộ việc theo vùng/phong tục và cách quản trị nội dung đáng tin cậy.

### Module 3 — Quyết định & Duyệt

**Vai trò:** Giữ quyền quyết định ở Chủ thể và làm thay đổi lan truyền có kiểm soát.  
**User làm gì:** Chọn phương án, xem tác động, duyệt yêu cầu, xác nhận thay đổi hoặc chấp nhận rủi ro.  
**User nhận được gì:** Biết mình thực sự phải quyết gì; tránh việc người khác quyết thay; giảm sửa từng nơi.  
**Jobs served:** Quyết — Duyệt — Kiểm soát.  
**Evidence:** Phân biệt Chủ thể/Phương tiện; quyết định gốc; Journey thay đổi quyết định; điểm không thể quay lại.  
**Dữ liệu chính:** Decision, Option, Approval Request, Impact Set, Exception, Confirmation.  
**Liên kết:** Cập nhật Bản đồ, Đội, Nhà cung cấp, Tài chính và Truyền tin.  
**Nếu bỏ:** App giao việc được nhưng không bảo vệ quyền quyết định hay xử lý tác động xuyên vòng.  
**AI recommendation:** **V1.**  
**Điều chưa chắc:** V1 nên cho phép bao nhiêu loại quyết định tùy biến ngoài bộ quyết định gốc.

### Module 4 — Đội đám hiếu & Điều phối

**Vai trò:** Biến kế hoạch thành công việc có chủ sở hữu, không đẩy mọi việc lên U1.  
**User làm gì:** Thêm người, phân vai, giao/nhận/hoàn thành, báo phát sinh, chuyển việc cần duyệt.  
**User nhận được gì:** Rõ trách nhiệm và tiến độ; mỗi người chỉ thấy phần của mình.  
**Jobs served:** Giao đúng người, điều phối, phát hiện chậm và giải phóng U1.  
**Evidence:** U1–U9; Journey B/C; lập Đội Đám Hiếu; chế độ “chỉ báo tôi khi cần quyết”.  
**Dữ liệu chính:** Participant, Role, Responsibility Area, Assignment, Status, Issue, Escalation.  
**Liên kết:** Thực thi task từ M2; xin duyệt ở M3; cập nhật vendor, finance, guest và hậu tang.  
**Nếu bỏ:** “Bộ não chung” không có tay chân thực thi, người đại diện vẫn thành người chạy việc.  
**AI recommendation:** **V1.**  
**Điều chưa chắc:** Cơ chế xác thực tối giản nhưng an toàn cho Link User.

### Module 5 — Dịch vụ & Nhà cung cấp

**Vai trò:** Quản lý cam kết của các phương tiện bên ngoài.  
**User làm gì:** Ghi yêu cầu, báo giá, lựa chọn, lịch cam kết, phát sinh, nghiệm thu và thanh toán liên quan.  
**User nhận được gì:** Biết bên nào phải làm gì, lúc nào, chi phí nào và đã đạt chưa.  
**Jobs served:** Kiểm soát nhà cung cấp; giảm thiếu hạng mục và phát sinh không rõ.  
**Evidence:** Journey F; đau số 10; vòng vận hành có nhiều nhà cung cấp.  
**Dữ liệu chính:** Vendor, Service Request, Quote, Commitment, Deliverable, Incident, Acceptance.  
**Liên kết:** Task/mốc ở M2; duyệt ở M3; người phụ trách ở M4; chi/công nợ ở M6.  
**Nếu bỏ:** Một phần lớn phương tiện của đám hiếu vẫn bị quản lý ngoài hệ thống, làm giảm tính toàn vòng.  
**AI recommendation:** **Cân nhắc V1 — Basic.** Giữ sổ nhà cung cấp + cam kết + nghiệm thu; chưa làm marketplace/booking tự động.  
**Điều chưa chắc:** Người dùng có cần so sánh nhiều báo giá trong tình huống khẩn hay chủ yếu ghi lại thỏa thuận đã có.

### Module 6 — Tài chính & Đối soát

**Vai trò:** Tạo minh bạch về ngân sách, chi phí, công nợ và phê duyệt tiền.  
**User làm gì:** Lập ngân sách, ghi dự toán/chi, gửi đề nghị, duyệt, đính chứng từ, đối soát và khóa tài chính.  
**User nhận được gì:** Bức tranh dự kiến/đã chi/còn trả/phát sinh; giảm nghi ngờ và bất đồng.  
**Jobs served:** Đúng chi phí, rõ trách nhiệm, khép vòng tài chính.  
**Evidence:** Journey D; đau 6, 12, 20; tiêu chí khép vòng.  
**Dữ liệu chính:** Budget, Estimate, Expense, Approval, Payee, Evidence, Debt, Reconciliation.  
**Liên kết:** Chi phí từ task, quyết định, vendor; quyền U4/U1; phúng viếng có thể đối soát nhưng phải tách sổ quyền truy cập.  
**Nếu bỏ:** Sản phẩm không đạt lời hứa “đúng chi phí” và không thể tuyên bố khép vòng đầy đủ.  
**AI recommendation:** **V1 — Basic.**  
**Điều chưa chắc:** Phúng viếng nên nằm trong M6 hay M7 về mặt điều hướng; đề xuất dữ liệu tài chính thuộc M6 nhưng thao tác ghi nhanh nằm ở M7.

### Module 7 — Khách viếng & Truyền tin

**Vai trò:** Tạo một nguồn thông tin đúng cho bên ngoài và một luồng tiếp khách/ghi nhận thật nhanh cho gia đình.  
**User làm gì:** Công bố thông tin được phép chia sẻ, gửi link, cập nhật thay đổi, ghi khách/phúng viếng/lễ vật, bàn giao ca.  
**User nhận được gì:** Khách đến đúng thông tin; gia đình không thất lạc ghi nhận và có dữ liệu cảm ơn/đối chiếu.  
**Jobs served:** Thông báo nhất quán, tiếp khách, ghi nhận, cập nhật thay đổi.  
**Evidence:** Chặng 8–9; Journey E/G; đau 9, 13, 14.  
**Dữ liệu chính:** Public Funeral Info, Announcement, Guest/Delegation, Visit, Condolence Entry, Shift Handover.  
**Liên kết:** Nhận thông tin từ M1/M3; lịch từ M2; quyền công khai; số tiền liên kết sổ tài chính M6.  
**Nếu bỏ:** Truyền tin và tiếp khách tiếp tục nằm trong nhóm chat/sổ giấy, tạo đúng các lỗi tài liệu muốn giải quyết.  
**AI recommendation:** **V1 — Basic.** Link thông tin + cập nhật + ghi nhận nhanh; tính năng truyền thông nâng cao để Later.  
**Điều chưa chắc:** Mức nhạy cảm văn hóa và quyền riêng tư khi ghi số tiền phúng viếng ở các vùng/nhóm gia đình khác nhau.

### Module 8 — Hậu tang, Mốc tưởng niệm, Pháp lý & Khép vòng

**Vai trò:** Dẫn gia đình từ “phần tiễn đưa đã xong” tới khi phần việc tức thời được khép, đồng thời không bỏ quên các mốc hậu tang mà gia đình lựa chọn.  
**User làm gì:** Hoàn trả, thanh toán, cảm ơn, làm thủ tục phù hợp hoàn cảnh; chọn có/không theo dõi 49 ngày, 100 ngày, giỗ đầu hoặc mốc riêng; nhận checklist, lập lịch, phân công, dự trù chi phí và xác nhận hoàn thành từng mốc.  
**User nhận được gì:** Không nhầm an táng/hỏa táng là kết thúc; biết còn gì; không quên mốc quan trọng; các việc dài hạn được chuyển sang lịch rõ ràng thay vì giữ đám hiếu ở trạng thái “chưa xong” vô thời hạn.  
**Jobs served:** Hoàn tất trách nhiệm với người mất, người sống, pháp lý và tài chính.  
**Evidence:** Chặng 13–15; Journey 6.16–6.17 và 6.21; cách làm số 12.  
**Dữ liệu chính:** Closeout Task, Legal/Benefit Case, Requirement, Document, Result, Memorial Milestone, Follow-up Plan, Closure State.  
**Liên kết:** Kế thừa hồ sơ M1; task/mốc M2; quyết định gia đình M3; giao U9/người thân qua M4; ngân sách M6; cảm ơn từ M7.  
**Nếu bỏ:** Sản phẩm tự mâu thuẫn với tư tưởng “trọn vẹn” và “khép vòng”.  
**AI recommendation:** **V1 — Basic.** Checklist động + lịch hậu tang + chọn mốc theo gia đình + phân công/nhắc việc/chi phí cơ bản + lưu trạng thái/tài liệu. Nội dung pháp lý chỉ phát hành khi có nguồn hiện hành.  
**Điều chưa chắc:** Tên gọi, cách tính ngày và nội dung chuẩn bị có thể khác theo vùng, tín ngưỡng và gia phong; hệ thống không được áp một chuẩn 49/100 ngày cho tất cả gia đình.

### Module 9 — Chuẩn bị trước & Hồ sơ dự liệu

**Vai trò:** Phục vụ U0 khi người nhà chưa mất hoặc một người muốn chủ động chuẩn bị cho chính mình; biến thời gian chuẩn bị thành dữ liệu và quyết định có thể sử dụng ngay về sau.  
**User làm gì:** Tạo hồ sơ cho bản thân/người thân; chỉ định người đại diện mong muốn; lưu liên hệ, giấy tờ, nguyện vọng, lựa chọn mai táng/hỏa táng, nghi lễ, địa điểm, quy mô, ngân sách, nhà cung cấp, ảnh/tư liệu và mong muốn đặc biệt; hoàn thiện dần; chia sẻ quyền phù hợp; kích hoạt khi sự kiện xảy ra.  
**User nhận được gì:** Hồ sơ chuẩn bị có tiến độ rõ; giảm quyết định khẩn; nguyện vọng không bị thất lạc; gia đình không nhập lại dữ liệu.  
**Jobs served:** Chuẩn bị khi còn thời gian; thống nhất trước các quyết định khó; tập hợp giấy tờ/thông tin; chuyển giao cho người đại diện.  
**Evidence:** Cửa vào B; U0; Journey 6.18; “một thông tin chỉ nhập một lần”; “kích hoạt hồ sơ”.  
**Dữ liệu chính:** Pre-need Profile, Subject, Intended Representative, Contact, Document, Preference, Funeral Wish, Budget Plan, Prepared Vendor, Readiness Progress, Activation State.  
**Liên kết:** Khi kích hoạt, dữ liệu chuyển sang M1; quyết định đã chuẩn bị đi vào M3 nhưng U1 vẫn xác nhận; nhiệm vụ sinh vào M2; người liên hệ sang M4; ngân sách sang M6; mốc hậu tang sang M8.  
**Nếu bỏ khỏi V1:** Một đối tượng và cửa vào đã khóa trong Foundation không được phục vụ; người đã chuẩn bị vẫn phải bắt đầu lại khi sự kiện xảy ra.  
**AI recommendation:** **V1 — Basic.** Tạo/lưu/chia sẻ có kiểm soát/kích hoạt hồ sơ; các dịch vụ tư vấn, marketplace hoặc nhắc kiểm tra hồ sơ nâng cao để Later.  
**Điều chưa chắc:** Cơ chế xác minh quyền kích hoạt và xử lý trường hợp nguyện vọng đã lưu xung đột với quyết định hợp pháp/thực tế của gia đình.

### Module 10 — Không gian Lưu giữ & Tưởng niệm nâng cao

**Vai trò:** Trải nghiệm lưu giữ ký ức dài hạn sau giai đoạn vận hành; không sở hữu lịch/checklist các mốc hậu tang cơ bản vì phần đó đã thuộc Module 8.  
**User làm gì:** Lưu ảnh, tư liệu, câu chuyện và tạo không gian tưởng niệm riêng nếu gia đình muốn.  
**User nhận được gì:** Không gian tiếp nối sau khi các trách nhiệm vận hành đã được xử lý.  
**Evidence:** Các việc sau tang và chuyển trạng thái sau khi khép vòng.  
**Nếu bỏ khỏi V1:** Không làm hỏng core job; có thể dùng lịch hậu tang cơ bản trong M8.  
**AI recommendation:** **Later.**  
**Điều chưa chắc:** Gia đình có muốn dùng cùng sản phẩm cho tưởng niệm lâu dài hay không.

## 7. AI Recommended V1

### AI RECOMMENDED V1

1. Chuẩn bị trước & Hồ sơ dự liệu — bản Basic.
2. Khởi động khẩn cấp & Hồ sơ đám hiếu.
3. Bản đồ đám hiếu.
4. Quyết định & Duyệt.
5. Đội đám hiếu & Điều phối.
6. Tài chính & Đối soát — bản Basic.
7. Khách viếng & Truyền tin — bản Basic.
8. Hậu tang, Mốc tưởng niệm, Pháp lý & Khép vòng — bản Basic.

### CÂN NHẮC V1

9. Dịch vụ & Nhà cung cấp — bản Basic.

AI nghiêng về **giữ bản Basic trong V1**, vì nhà cung cấp là một phương tiện lớn trong vòng vận hành. Tuy nhiên cần human judgment về cách gia đình Việt Nam thực sự chọn/điều phối dịch vụ trong tình huống khẩn. Bản Basic chỉ gồm danh bạ vụ việc, yêu cầu, cam kết, phát sinh và nghiệm thu; không gồm marketplace hay tích hợp đặt dịch vụ.

### LATER

10. Không gian Lưu giữ & Tưởng niệm nâng cao.
11. Marketplace/tích hợp nhà cung cấp nâng cao.

### Vì sao đây là “smallest coherent product” đề xuất

- Bốn module đầu tạo vòng giá trị cốt lõi: **hiểu hoàn cảnh → sinh bản đồ → Chủ thể quyết → người khác thực hiện**.
- Tài chính, khách viếng và hậu tang không phải “feature cộng thêm”; chúng là các miền công việc mà Foundation coi là điều kiện để lo trọn và khép vòng. V1 nên giữ bản Basic thay vì loại cả module.
- Nhà cung cấp rất quan trọng về domain completeness, nhưng có thể thu hẹp V1 để tránh biến app thành marketplace.
- Chuẩn bị trước là một core journey đã khóa, không phải tiện ích phụ. V1 Basic phải chứng minh được vòng **chuẩn bị dần → chia sẻ/ủy quyền phù hợp → kích hoạt → không nhập lại**.
- Không gian tưởng niệm nâng cao có giá trị nhưng chưa cần để chứng minh core outcome vận hành.

## 8. Module Relationship Map

```text
CHUẨN BỊ TRƯỚC & HỒ SƠ DỰ LIỆU
               │
               │ KÍCH HOẠT HỒ SƠ
               ▼
HOÀN CẢNH + HỒ SƠ NGƯỜI MẤT
               │
               ▼
      BẢN ĐỒ ĐÁM HIẾU
       │       │       │
       │       │       └──────────────► HẬU TANG / MỐC TƯỞNG NIỆM / PHÁP LÝ / KHÉP VÒNG
       │       │
       │       └──► QUYẾT ĐỊNH & DUYỆT
       │                    │
       │                    ├── tác động lịch/việc ───────┐
       │                    ├── tác động chi phí ─────────┤
       │                    ├── tác động nhà cung cấp ────┤
       │                    └── tác động thông báo ───────┤
       │                                                   │
       └──► ĐỘI ĐÁM HIẾU & ĐIỀU PHỐI ◄────────────────────┘
                    │
          ┌─────────┼──────────────┐
          ▼         ▼              ▼
   NHÀ CUNG CẤP   TÀI CHÍNH   KHÁCH VIẾNG & TRUYỀN TIN
          │         ▲              │
          └─────────┴──────────────┘
                 đối soát

MỌI MODULE
   └──► trạng thái, cảnh báo, vấn đề, tài liệu và kết quả
            └──► BẢN ĐỒ ĐÁM HIẾU cập nhật
```

Các quan hệ quyết định:

- **Hoàn cảnh** sinh nhánh việc; không để người dùng chọn một checklist chung.
- **Quyết định** là object riêng vì một quyết định có thể tác động nhiều module.
- **Task** thuộc Bản đồ; **Assignment** thuộc Điều phối; hai khái niệm liên kết nhưng không trộn.
- **Ghi phúng viếng** thao tác ở module Khách viếng; dữ liệu tiền và đối soát thuộc Tài chính, với quyền truy cập riêng.
- **Nhà cung cấp** tạo cam kết và công nợ; task thực thi vẫn xuất hiện trong Bản đồ.
- **Khép vòng** là trạng thái dẫn xuất từ hoàn thành việc bắt buộc, đối soát tài chính/vendor, lưu tài liệu và xử lý việc quá hạn.

## 9. Human Review Questions

1. **Dịch vụ & Nhà cung cấp:** Chị muốn bản Basic nằm chắc trong V1, hay V1 chỉ cho phép ghi nhà cung cấp ngay trên từng công việc rồi tách module này sau?
2. **Tài chính và phúng viếng:** Chị muốn “Phúng viếng” hiện như một khu vực riêng dễ truy cập, hay nằm trong “Khách viếng” nhưng sổ tiền được quản trị và phân quyền bởi “Tài chính” như đề xuất?
3. **Hậu tang/Pháp lý:** Với lời hứa “lo trọn”, chị có đồng ý giữ bản Basic trong V1, dù dữ liệu thủ tục chi tiết phải giới hạn theo nguồn pháp lý đã kiểm chứng?
4. **Chuẩn bị trước:** Với bản Basic đã đưa vào V1, chị muốn ưu tiên chuẩn bị cho chính người dùng, chuẩn bị cho người thân, hay cả hai ngay từ lần ra mắt đầu tiên?
5. **Quyết định & Duyệt:** Chị muốn nó là một module rõ trên điều hướng, hay là lớp workflow nằm trong Bản đồ nhưng vẫn giữ Decision/Approval là object riêng?
6. Trong vận hành thực tế, có vùng trách nhiệm nào ngoài Hậu cần, Tài chính, Khách/Phúng viếng, Liên lạc, Xe cộ, Nhà cung cấp và Hậu tang mà gia đình mặc định phải có?
7. Có module nào trong 8 module AI đề xuất V1 chị thấy không đủ quan trọng, nên chỉ giữ như capability nằm trong module khác?
8. Có module nào chị muốn gộp hoặc tách vì ngôn ngữ/module hiện tại chưa đúng với cách gia đình Việt Nam hình dung một đám hiếu?
9. Workflow thực tế nào trong Foundation đã nêu nhưng bản đồ module trên vẫn chưa sở hữu rõ ràng?

---

Đây là bản đề xuất module ban đầu, chưa phải cấu trúc sản phẩm cuối cùng. Hãy phản biện bất kỳ module nào anh/chị muốn thêm, bỏ, gộp, tách hoặc chuyển giữa V1/Later. Tôi sẽ phản biện lại dựa trên research và product logic. Chỉ khi anh/chị nói “KHÓA CẤU TRÚC SẢN PHẨM”, tôi mới chuyển sang Final Product Architecture và MVP.
