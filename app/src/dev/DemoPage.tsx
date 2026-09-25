// /mau — CHỈ KHI CHẠY THỬ: dựng hoặc xóa khách hàng trả phí mẫu trên trình duyệt đang mở.
// Dữ liệu mẫu luôn nằm trên máy (không ghi lên máy chủ); khi bản build có máy chủ, trình duyệt này chuyển sang chế độ xem mẫu.
import { useEffect, useRef, useState } from 'react';
import { Banner } from '../ui/common';
import { BrandLine } from '../ui/brand';
import { HAS_SERVER, REMOTE, setLocalDemoMode } from '../repo/backend';

export default function DemoPage() {
  const [busy, setBusy] = useState(false);
  const once = useRef(false);
  const make = async () => {
    setBusy(true);
    if (REMOTE) {
      // Chuyển trình duyệt này sang dữ liệu trên máy rồi mở lại trang để dựng mẫu
      setLocalDemoMode(true);
      window.location.href = '/mau?dung=1';
      return;
    }
    const { seedDemo } = await import('./demoSeed');
    const id = seedDemo();
    window.location.href = `/dh/${id}`;
  };
  useEffect(() => {
    if (!once.current && !REMOTE && new URLSearchParams(window.location.search).has('dung')) { once.current = true; void make(); }
  });
  const clear = () => { localStorage.clear(); window.location.href = '/'; };
  return (
    <div className="bare"><div className="bare-inner" style={{ maxWidth: 560, justifyContent: 'center' }}>
      <BrandLine extra="Bản chạy thử" />
      <h1 style={{ fontSize: 24 }}>Xem như khách hàng trả phí</h1>
      <p className="muted">Dựng sẵn một đám hiếu mẫu đã <b>Mở đầy đủ</b> (có đội, nhà cung cấp, tài chính, khách viếng, trang cáo phó) và một hồ sơ Chuẩn bị trước đã trả phí. Mọi tên có chữ “(mẫu)”.</p>
      {HAS_SERVER
        ? <Banner kind="warn">Dữ liệu mẫu chỉ nằm trên trình duyệt này, không lên máy chủ. Trong lúc xem mẫu, trình duyệt này không dùng tài khoản thật — bấm “Thoát chế độ xem mẫu” để quay lại.</Banner>
        : <Banner kind="warn">Dữ liệu đang có trên trình duyệt này sẽ được thay bằng dữ liệu mẫu.</Banner>}
      <button className="btn primary block" disabled={busy} onClick={make}>{busy ? 'Đang dựng…' : 'Dựng dữ liệu mẫu và vào app'}</button>
      <button className="btn block" onClick={clear}>{HAS_SERVER ? 'Thoát chế độ xem mẫu (xóa dữ liệu mẫu)' : 'Xóa hết dữ liệu trên trình duyệt này'}</button>
      <p className="note">Trang này chỉ có ở bản chạy thử và bản xem thử online, không có trong app thật cho khách.</p>
    </div></div>
  );
}
