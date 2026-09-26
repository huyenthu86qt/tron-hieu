// Điều khoản sử dụng & Chính sách bảo mật — Chủ dự án duyệt 27/09/2026 (email liên hệ, chính sách hoàn tiền).
// Căn cứ: Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực 01/01/2026), Nghị định 356/2025/NĐ-CP.
// Chỗ ghi OPERATOR / REFUND là quyết định của Chủ dự án — sửa ở hằng số bên dưới.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../ui/common';
import { BrandLine } from '../ui/brand';
import { fmtPhone, SUPPORT } from '../domain/platform';

/** Bản đang hiệu lực: đổi DRAFT = false sau khi Chủ dự án duyệt */
const DRAFT = false;
const UPDATED = '27/09/2026';
/** Người / đơn vị vận hành hiển thị trên trang (Chủ dự án xác nhận) */
const OPERATOR = 'Chủ dự án Trọn Hiếu';

function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bare"><div className="bare-inner" style={{ maxWidth: 760 }}>
      <Link to="/" style={{ textDecoration: 'none' }}><BrandLine /></Link>
      <h1 style={{ fontSize: 26 }}>{title}</h1>
      <p className="muted">Cập nhật ngày {UPDATED}</p>
      {DRAFT && <Banner kind="upd">Bản dự thảo đang chờ duyệt lần cuối trước khi mở bán.</Banner>}
      <div className="stack" style={{ gap: 14, lineHeight: 1.7 }}>{children}</div>
      <p className="muted"><Link to="/dieu-khoan">Điều khoản sử dụng</Link> · <Link to="/bao-mat">Chính sách bảo mật</Link></p>
    </div></div>
  );
}
const S = ({ h, children }: { h: string; children: ReactNode }) => <section className="card card-pad stack" style={{ gap: 8 }}><h3>{h}</h3>{children}</section>;
const Contact = () => <p>Liên hệ hỗ trợ: <b>{SUPPORT.name}</b> — <a href={`tel:${SUPPORT.phone}`}>{fmtPhone(SUPPORT.phone)}</a> (gọi hoặc Zalo) · Email: <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>.</p>;

export function TermsPage() {
  return (
    <Legal title="Điều khoản sử dụng">
      <S h="1. Giới thiệu">
        <p>Trọn Hiếu là ứng dụng giúp gia đình cùng nhau tổ chức việc tang: biết việc gì cần làm trước, ai lo phần nào, chốt các quyết định, theo dõi chi tiêu, khách viếng và các mốc tưởng niệm. Trọn Hiếu do {OPERATOR} vận hành.</p>
        <p>Khi tạo tài khoản hoặc sử dụng Trọn Hiếu, anh/chị đồng ý với Điều khoản này và <Link to="/bao-mat">Chính sách bảo mật</Link>.</p>
      </S>
      <S h="2. Trọn Hiếu làm gì và không làm gì">
        <ul>
          <li>Trọn Hiếu là công cụ ghi chép, nhắc việc và phối hợp cho gia đình. Mọi quyết định về nghi lễ, hình thức an táng, chi tiêu do gia đình tự quyết.</li>
          <li>Trọn Hiếu <b>không</b> thay thế tư vấn pháp lý, y tế hay hướng dẫn nghi lễ của người có chuyên môn và cơ quan có thẩm quyền.</li>
          <li>Hướng dẫn thủ tục trong app (ví dụ đăng ký khai tử) là thông tin tham khảo, có ghi văn bản pháp luật làm căn cứ và ngày rà soát. Khi làm thủ tục, gia đình làm theo hướng dẫn của cơ quan tiếp nhận hồ sơ.</li>
        </ul>
      </S>
      <S h="3. Tài khoản">
        <ul>
          <li>Anh/chị đăng ký bằng số điện thoại và mật khẩu, hoặc bằng tài khoản Google. Thông tin đăng ký cần chính xác.</li>
          <li>Anh/chị tự giữ bí mật mật khẩu và chịu trách nhiệm với hoạt động trên tài khoản của mình. Khi quên mật khẩu hoặc nghi bị lộ, liên hệ hỗ trợ.</li>
          <li>Người nhận việc qua đường link không cần tài khoản; người đó chỉ thấy đúng việc được nhờ.</li>
        </ul>
      </S>
      <S h="4. Vai trò trong một đám hiếu">
        <ul>
          <li><b>Người đại diện gia đình</b> tạo đám hiếu, mời người cùng lo, giao quyền, chốt các quyết định và duyệt nội dung công khai (cáo phó, lời tưởng nhớ của khách).</li>
          <li>Người đại diện có thể chuyển vai trò cho người khác trong đội. Mỗi người chỉ thấy phần được giao theo quyền của mình; số tiền phúng viếng và tài chính chỉ người đại diện và người được giao Tài chính thấy.</li>
        </ul>
      </S>
      <S h="5. Phần miễn phí và các gói trả phí">
        <ul>
          <li><b>Miễn phí:</b> hồ sơ người đã khuất, Bây giờ, Bản đồ việc, Cần quyết, Đội đám hiếu (mời người, nhờ việc qua link), Sổ tưởng nhớ, Tài liệu, Góc Bình An, tạo hồ sơ chuẩn bị và ghi nguyện vọng.</li>
          <li><b>Mở đầy đủ đám hiếu — 499.000 đ</b>, trả một lần cho <b>một</b> đám hiếu, dùng đến hết giỗ đầu, không tự gia hạn. Gồm: Nhà cung cấp, Tài chính và Sổ phúng viếng, Khách viếng và trang cáo phó, Hậu tang và mốc tưởng niệm.</li>
          <li><b>Chuẩn bị trước — 199.000 đ</b>, trả một lần cho <b>một</b> hồ sơ chuẩn bị. Gồm: lưu giấy tờ, chia sẻ có kiểm soát, kích hoạt thành đám hiếu. Khi kích hoạt, đám hiếu được mở đầy đủ, không thu lần hai.</li>
          <li>Giá áp dụng là giá hiển thị tại thời điểm tạo đơn. Nếu giá thay đổi, đơn đã tạo giữ nguyên giá cũ.</li>
        </ul>
      </S>
      <S h="6. Thanh toán">
        <ul>
          <li>Thanh toán bằng chuyển khoản ngân hàng hoặc quét mã QR vào tài khoản hiển thị ở màn thanh toán. Ghi đúng <b>nội dung chuyển khoản (mã đơn)</b> và đúng số tiền để app tự mở gói.</li>
          <li>Việc xác nhận thanh toán được thực hiện tự động qua dịch vụ đối soát giao dịch ngân hàng. Trọn Hiếu không lưu thông tin thẻ hay mật khẩu ngân hàng của khách.</li>
          <li>Đơn được giữ trong 24 giờ. Nếu chuyển thiếu, thừa hoặc sai nội dung, đội hỗ trợ đối chiếu và xử lý thủ công.</li>
        </ul>
      </S>
      <S h="7. Hoàn tiền">
        <ul>
          <li>Hoàn <b>toàn bộ</b> số tiền khi: chuyển trùng hoặc chuyển thừa; chuyển nhầm mà không khớp đơn nào; hoặc do lỗi hệ thống mà gói không mở được và đội hỗ trợ không khắc phục được trong 2 ngày làm việc.</li>
          <li>Yêu cầu hoàn tiền gửi qua hỗ trợ trong vòng <b>7 ngày</b> kể từ ngày thanh toán, kèm mã đơn. Tiền được hoàn về đúng tài khoản đã chuyển trong vòng 5 ngày làm việc kể từ khi xác nhận.</li>
          <li>Gói đã mở và đã dùng bình thường không được hoàn, trừ các trường hợp nêu trên. Mọi yêu cầu hoàn tiền đều được ghi lý do và lưu vết.</li>
        </ul>
      </S>
      <S h="8. Tiền phúng viếng và chi tiêu của gia đình">
        <p>Trọn Hiếu chỉ giúp gia đình <b>ghi nhận và đối chiếu</b>. Trọn Hiếu <b>không nhận, không giữ, không chuyển</b> tiền phúng viếng hay tiền chi tiêu thay gia đình. Số tài khoản nhận phúng viếng do gia đình tự ghi và chỉ người trong đội thấy.</p>
      </S>
      <S h="9. Nhà cung cấp dịch vụ tang lễ">
        <p>App giúp gia đình tìm nhà cung cấp trên Google Maps và ghi lại bên gia đình đã chọn. Trọn Hiếu không phải là bên cung cấp dịch vụ tang lễ, không đặt lịch hay thanh toán thay. Gia đình tự thỏa thuận và chịu trách nhiệm với nhà cung cấp mình chọn.</p>
      </S>
      <S h="10. Nội dung gia đình đăng">
        <ul>
          <li>Gia đình chịu trách nhiệm về nội dung mình nhập và công bố (cáo phó, ảnh, lời tưởng nhớ, tài liệu) và bảo đảm có quyền đăng các nội dung đó.</li>
          <li>Lời tưởng nhớ khách gửi từ trang cáo phó chỉ hiện công khai khi người đại diện đồng ý.</li>
          <li>Không đăng nội dung vi phạm pháp luật, xúc phạm danh dự người khác. Trọn Hiếu có thể gỡ nội dung vi phạm và thông báo cho người đại diện.</li>
        </ul>
      </S>
      <S h="11. Xóa tài khoản, xóa đám hiếu">
        <p>Người dùng tự yêu cầu xóa trong mục Tài khoản. Dữ liệu được xóa sau <b>7 ngày</b> chờ để tránh xóa nhầm; trong thời gian này có thể hủy yêu cầu. Người đại diện cần chuyển vai trò cho người khác trước khi xóa tài khoản nếu đám hiếu vẫn đang được dùng. Nên tải bản lưu trước khi xóa.</p>
      </S>
      <S h="12. Giới hạn trách nhiệm">
        <p>Trọn Hiếu nỗ lực để app hoạt động ổn định và chính xác, nhưng không chịu trách nhiệm về quyết định của gia đình, về dịch vụ của nhà cung cấp do gia đình chọn, hay về gián đoạn do sự cố ngoài tầm kiểm soát (mạng, ngân hàng, nhà cung cấp hạ tầng).</p>
      </S>
      <S h="13. Thay đổi điều khoản">
        <p>Khi Điều khoản thay đổi, Trọn Hiếu cập nhật ngày ở đầu trang và thông báo trong app. Tiếp tục sử dụng sau khi thay đổi nghĩa là anh/chị đồng ý với nội dung mới.</p>
      </S>
      <S h="14. Liên hệ và giải quyết tranh chấp">
        <Contact />
        <p>Mọi vướng mắc được ưu tiên giải quyết bằng trao đổi, thương lượng. Nếu không thống nhất được, tranh chấp được giải quyết theo pháp luật Việt Nam.</p>
      </S>
    </Legal>
  );
}

export function PrivacyPage() {
  return (
    <Legal title="Chính sách bảo mật">
      <S h="1. Ai xử lý dữ liệu của anh/chị">
        <p>Trọn Hiếu do {OPERATOR} vận hành, là bên quyết định mục đích và cách xử lý dữ liệu cá nhân trong app. Chính sách này được xây dựng theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và các văn bản hướng dẫn.</p>
      </S>
      <S h="2. Dữ liệu Trọn Hiếu thu thập">
        <ul>
          <li><b>Tài khoản:</b> họ tên, số điện thoại; địa chỉ email nếu đăng nhập bằng Google.</li>
          <li><b>Đám hiếu:</b> thông tin người đã khuất (danh xưng, họ tên, năm sinh, ngày giờ mất, quê quán, ảnh thờ), hình thức tổ chức và nghi thức, địa chỉ nơi tổ chức, thành viên đội (tên, quan hệ, số điện thoại), việc, quyết định, lịch sử thay đổi.</li>
          <li><b>Tài chính:</b> khoản chi, tài khoản ngân hàng bên nhận tiền, tài khoản nhận phúng viếng của gia đình (tài khoản của gia đình ở mục nguồn tiền chỉ lưu tên gợi nhớ và 4 số cuối), sổ phúng viếng.</li>
          <li><b>Khách viếng:</b> tên người/đoàn, nhóm, lễ vật, số tiền phúng viếng do gia đình ghi; lời tưởng nhớ khách gửi.</li>
          <li><b>Tài liệu và ảnh</b> gia đình tải lên; <b>Sổ tưởng nhớ</b>; <b>hồ sơ chuẩn bị trước</b> và nguyện vọng.</li>
          <li><b>Đơn hàng:</b> mã đơn, gói, số tiền, trạng thái, thời điểm thanh toán.</li>
        </ul>
      </S>
      <S h="3. Dữ liệu nhạy cảm">
        <p>Một số dữ liệu là <b>dữ liệu cá nhân nhạy cảm</b>: nghi thức tôn giáo của gia đình, dữ liệu tài chính (tài khoản ngân hàng, tiền phúng viếng, chi tiêu). Các dữ liệu này chỉ được thu thập khi gia đình tự nhập, chỉ dùng cho đúng việc lo tang của gia đình, và được giới hạn quyền xem: tài chính, số tiền phúng viếng, tài khoản bên nhận chỉ người đại diện và người được giao Tài chính xem.</p>
      </S>
      <S h="4. Mục đích sử dụng">
        <ul>
          <li>Cung cấp các chức năng của app cho gia đình: phân công, nhắc việc, đối soát, trang thông tin cho khách khi gia đình bấm công bố, nhắc mốc tưởng niệm.</li>
          <li>Xác nhận thanh toán và hỗ trợ khi khách liên hệ.</li>
          <li>Trọn Hiếu <b>không bán dữ liệu</b>, không dùng dữ liệu của gia đình để quảng cáo hay chuyển cho bên thứ ba vì mục đích tiếp thị.</li>
        </ul>
      </S>
      <S h="5. Sự đồng ý">
        <p>Khi tạo tài khoản, anh/chị đồng ý cho Trọn Hiếu xử lý dữ liệu theo Chính sách này, kể cả dữ liệu nhạy cảm nêu ở mục 3 khi anh/chị tự nhập. Anh/chị có thể rút lại sự đồng ý bằng cách yêu cầu xóa tài khoản. Khi nhập thông tin của người khác (người thân, thành viên đội, khách viếng), anh/chị bảo đảm việc cung cấp thông tin đó là phù hợp và được người liên quan đồng ý khi cần.</p>
      </S>
      <S h="6. Ai được xem dữ liệu">
        <ul>
          <li>Chỉ những người gia đình mời vào đội, theo quyền được giao. Người nhận việc qua link chỉ thấy việc được nhờ.</li>
          <li>Trang cáo phó chỉ công khai khi người đại diện bấm công bố, và chỉ gồm thông tin cho khách (không có tài chính, số tiền phúng viếng hay số tài khoản).</li>
          <li>Đội vận hành không xem nội dung đám hiếu; trang quản trị chỉ thấy tên đám hiếu, trạng thái gói và đơn hàng.</li>
        </ul>
      </S>
      <S h="7. Bên cung cấp dịch vụ cho Trọn Hiếu">
        <p>Để app hoạt động, dữ liệu được lưu và truyền qua các nhà cung cấp hạ tầng, ở mức cần thiết:</p>
        <ul>
          <li><b>Supabase</b> — lưu trữ dữ liệu và tệp (máy chủ tại Singapore).</li>
          <li><b>Vercel</b> — cung cấp trang web của app.</li>
          <li><b>Google</b> — đăng nhập bằng tài khoản Google (khi anh/chị chọn); Google Maps khi anh/chị bấm tìm đường hoặc tìm nhà cung cấp.</li>
          <li><b>Dịch vụ đối soát giao dịch ngân hàng</b> — xác nhận thanh toán theo mã đơn.</li>
          <li><b>Dịch vụ tìm vị trí từ địa chỉ</b> — khi anh/chị tìm vị trí nơi tổ chức, nội dung địa chỉ gõ vào được gửi đi để tìm.</li>
        </ul>
      </S>
      <S h="8. Bảo mật và lưu trữ">
        <ul>
          <li>Dữ liệu được truyền qua kết nối mã hóa (HTTPS); quyền xem được kiểm soát theo từng người, từng đám hiếu ngay trên máy chủ.</li>
          <li>Tệp và giấy tờ lưu riêng tư, chỉ người trong đội mở được; chứng từ chi tiêu chỉ người giữ Tài chính mở được.</li>
          <li>Dữ liệu được lưu đến khi anh/chị yêu cầu xóa. Anh/chị nên tải bản lưu về máy để giữ lâu dài.</li>
        </ul>
      </S>
      <S h="9. Quyền của anh/chị">
        <p>Theo Điều 4 Luật Bảo vệ dữ liệu cá nhân 2025, anh/chị có quyền:</p>
        <ul>
          <li>Được biết về hoạt động xử lý dữ liệu của mình;</li>
          <li>Đồng ý hoặc không đồng ý, yêu cầu rút lại sự đồng ý;</li>
          <li>Xem, chỉnh sửa hoặc yêu cầu chỉnh sửa dữ liệu;</li>
          <li>Yêu cầu cung cấp và yêu cầu xóa dữ liệu;</li>
          <li>Khiếu nại, tố cáo, khởi kiện và yêu cầu bồi thường theo quy định;</li>
          <li>Yêu cầu cơ quan có thẩm quyền bảo vệ dữ liệu của mình.</li>
        </ul>
        <p>Cách thực hiện ngay trong app: sửa thông tin trong Hồ sơ và Tài khoản; <b>tải bản lưu</b> đám hiếu (in được, bảng tính) trong Tài khoản → Dữ liệu; <b>yêu cầu xóa</b> đám hiếu hoặc tài khoản trong Tài khoản. Các yêu cầu khác về dữ liệu cá nhân, gửi email tới <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a> hoặc liên hệ hỗ trợ.</p>
      </S>
      <S h="10. Thông tin của người đã khuất">
        <p>Thông tin của người đã khuất do gia đình nhập và quản lý, người đại diện gia đình quyết định việc công bố hoặc xóa. Trọn Hiếu tôn trọng danh dự, nhân phẩm của người đã khuất và chỉ công khai những gì gia đình chọn công bố.</p>
      </S>
      <S h="11. Liên hệ">
        <Contact />
        <p>Khi thay đổi Chính sách, Trọn Hiếu cập nhật ngày ở đầu trang và thông báo trong app.</p>
      </S>
    </Legal>
  );
}
