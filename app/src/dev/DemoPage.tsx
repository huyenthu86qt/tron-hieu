// /mau — CHỈ KHI CHẠY THỬ: dựng hoặc xóa khách hàng trả phí mẫu trên trình duyệt đang mở.
import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Banner } from '../ui/common';

export default function DemoPage() {
  const [busy, setBusy] = useState(false);
  const make = async () => {
    setBusy(true);
    const { seedDemo } = await import('./demoSeed');
    const id = seedDemo();
    window.location.href = `/dh/${id}`;
  };
  const clear = () => { localStorage.clear(); window.location.href = '/'; };
  return (
    <div className="bare"><div className="bare-inner" style={{ maxWidth: 560, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}><Icon n="lotus" /><b style={{ fontFamily: 'var(--serif)' }}>Đám Hiếu · Bản chạy thử</b></div>
      <h1 style={{ fontSize: 24 }}>Xem như khách hàng trả phí</h1>
      <p className="muted">Dựng sẵn một đám hiếu mẫu đã <b>Mở đầy đủ</b> (có đội, nhà cung cấp, tài chính, khách viếng, trang cáo phó) và một hồ sơ Chuẩn bị trước đã trả phí. Mọi tên có chữ “(mẫu)”.</p>
      <Banner kind="warn">Dữ liệu đang có trên trình duyệt này sẽ được thay bằng dữ liệu mẫu.</Banner>
      <button className="btn primary block" disabled={busy} onClick={make}>{busy ? 'Đang dựng…' : 'Dựng dữ liệu mẫu và vào app'}</button>
      <button className="btn block" onClick={clear}>Xóa hết dữ liệu trên trình duyệt này</button>
      <p className="note">Trang này chỉ có ở bản chạy thử và bản xem thử online, không có trong app thật cho khách.</p>
    </div></div>
  );
}
