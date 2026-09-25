// Trang pháp lý khung — CHƯA phải bản chính thức. Cần rà soát theo quy định bảo vệ dữ liệu cá nhân hiện hành của Việt Nam trước khi mở bán.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Banner } from '../ui/common';

function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bare"><div className="bare-inner" style={{ maxWidth: 760 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', textDecoration: 'none' }}><Icon n="lotus" /><b style={{ fontFamily: 'var(--serif)' }}>Đám Hiếu</b></Link>
      <h1 style={{ fontSize: 26 }}>{title}</h1>
      <Banner kind="upd">Bản khung. Nội dung chính thức cần được rà soát pháp lý trước khi mở bán.</Banner>
      <div className="stack" style={{ gap: 14, lineHeight: 1.7 }}>{children}</div>
      <p className="muted"><Link to="/dieu-khoan">Điều khoản sử dụng</Link> · <Link to="/bao-mat">Chính sách bảo mật</Link></p>
    </div></div>
  );
}
const S = ({ h, children }: { h: string; children: ReactNode }) => <section className="card card-pad stack" style={{ gap: 8 }}><h3>{h}</h3>{children}</section>;

export function TermsPage() {
  return (
    <Legal title="Điều khoản sử dụng">
      <S h="1. Dịch vụ">Đám Hiếu là công cụ giúp gia đình tổ chức việc tang: bản đồ việc, phân công, quyết định, nhà cung cấp, tài chính, khách viếng, hậu tang. App không thay thế tư vấn pháp lý, y tế hay nghi lễ của người có thẩm quyền.</S>
      <S h="2. Tài khoản">Đăng ký bằng số điện thoại và mật khẩu; xác minh bằng mã OTP. Người dùng giữ bí mật mật khẩu và chịu trách nhiệm với hoạt động trên tài khoản của mình.</S>
      <S h="3. Gói trả phí">Phần miễn phí: hồ sơ người mất, Bây giờ, Bản đồ, Chi tiết việc, Cần quyết. Gói “Mở đầy đủ” áp dụng cho một đám hiếu, trả một lần, dùng đến hết giỗ đầu. Gói “Chuẩn bị trước” áp dụng cho một hồ sơ chuẩn bị; khi kích hoạt, đám hiếu được mở đầy đủ, không thu lần hai. Giá hiển thị tại thời điểm tạo đơn.</S>
      <S h="4. Thanh toán và hoàn tiền">Thanh toán bằng chuyển khoản ngân hàng hoặc mã QR, xác nhận tự động qua đối tác thanh toán. Yêu cầu hoàn tiền được xử lý thủ công, có ghi lý do và lưu vết. [Chính sách hoàn tiền chi tiết — cần bổ sung]</S>
      <S h="5. Tiền phúng viếng và chi tiêu">App chỉ ghi nhận để gia đình đối chiếu. App không nhận, giữ hay chuyển tiền phúng viếng hoặc tiền chi tiêu thay gia đình.</S>
      <S h="6. Nhà cung cấp">Danh bạ nhà cung cấp do đội vận hành quản lý; app gợi ý theo loại dịch vụ và khoảng cách, không đặt lịch hay thanh toán thay. Gia đình tự thỏa thuận và chịu trách nhiệm với nhà cung cấp đã chọn.</S>
      <S h="7. Liên hệ">[Tên đơn vị vận hành, địa chỉ, số điện thoại hỗ trợ — cần bổ sung]</S>
    </Legal>
  );
}

export function PrivacyPage() {
  return (
    <Legal title="Chính sách bảo mật">
      <S h="1. Dữ liệu thu thập">Số điện thoại, họ tên tài khoản; thông tin người đã khuất; thành viên đội; danh sách việc; khoản chi và tài khoản ngân hàng bên nhận; sổ phúng viếng; giấy tờ gia đình tải lên; hồ sơ chuẩn bị trước.</S>
      <S h="2. Dữ liệu nhạy cảm">Sổ phúng viếng, tài chính, tài khoản ngân hàng bên nhận và giấy tờ chỉ người có quyền trong đám hiếu xem được. Tài khoản ngân hàng của gia đình chỉ lưu tên gợi nhớ và 4 số cuối. Đội vận hành không xem nội dung đám hiếu, trừ khi gia đình cho phép khi cần hỗ trợ.</S>
      <S h="3. Mục đích">Chỉ dùng để cung cấp dịch vụ cho gia đình: phân công, nhắc việc, đối soát, trang thông tin cho khách khi gia đình công bố.</S>
      <S h="4. Chia sẻ">Không bán dữ liệu. Chia sẻ với đối tác gửi OTP và đối tác thanh toán ở mức cần thiết. Trang thông tin cho khách chỉ công khai khi gia đình bấm công bố.</S>
      <S h="5. Lưu trữ, xuất và xóa">Người dùng xuất dữ liệu một đám hiếu và yêu cầu xóa đám hiếu / tài khoản trong mục Tài khoản; yêu cầu xóa có thời gian chờ để tránh xóa nhầm. Dữ liệu được sao lưu hằng ngày.</S>
      <S h="6. Quyền của chủ thể dữ liệu">[Theo quy định bảo vệ dữ liệu cá nhân hiện hành — cần rà soát và bổ sung]</S>
      <S h="7. Liên hệ">[Đầu mối bảo vệ dữ liệu — cần bổ sung]</S>
    </Legal>
  );
}
