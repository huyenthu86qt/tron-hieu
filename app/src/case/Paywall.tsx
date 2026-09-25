// S-CHK-00 · Mở đầy đủ — lời lẽ nhẹ nhàng, không đếm ngược, nói rõ gồm gì; phần miễn phí vẫn dùng bình thường.
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { money } from '../domain/finance';
import { usePlatform } from '../repo/platformStore';
import { Icon } from '../ui/Icon';
import { useCase, DN } from './CaseContext';

const INCLUDES = [
  ['team', 'Đội đám hiếu', 'Mời con cháu, họ hàng, hàng xóm; nhờ việc qua link không cần cài app'],
  ['vendor', 'Nhà cung cấp', 'Gợi ý đúng loại, gần nơi tổ chức nhất; báo giá, cam kết, nghiệm thu'],
  ['wallet', 'Tài chính', 'Dự kiến, đã chi, còn trả; đề nghị chi, sổ phúng viếng, đối soát'],
  ['guest', 'Khách viếng & cáo phó', 'Trang thông tin cho khách, ghi nhanh khách viếng'],
  ['after', 'Hậu tang & mốc tưởng niệm', 'Cảm ơn, thủ tục, 49 ngày, 100 ngày, giỗ đầu theo âm lịch'],
] as const;

export function Paywall({ module }: { module: string }) {
  const { c, isU1, me } = useCase();
  const nav = useNavigate();
  const loc = useLocation();
  const p = usePlatform(s => s.products.find(x => x.id === 'full'));
  const canPay = isU1 || me.access === 'full';
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div><div className="eyebrow">{module}</div><h1 style={{ fontSize: 24, marginTop: 4 }}>Mở đầy đủ cho đám hiếu {DN(c)}</h1>
        <p className="muted" style={{ marginTop: 6 }}>Hồ sơ, Bây giờ, Bản đồ, Chi tiết việc và Cần quyết vẫn dùng bình thường. Khi gia đình cần thêm người cùng lo và các phần dưới đây, có thể mở đầy đủ cho riêng đám hiếu này.</p></div>
      <section className="card"><div className="list">{INCLUDES.map(([i, t, d]) => (
        <div key={t} className="row"><span className="num-badge"><Icon n={i} c="sm" /></span><div className="grow"><div className="title">{t}</div><div className="meta">{d}</div></div></div>
      ))}</div></section>
      {p && <section className="card card-pad"><dl className="kv"><dt>Gói</dt><dd>{p.name}</dd><dt>Giá</dt><dd className="num"><b>{money(p.price)}</b> · trả một lần</dd><dt>Thời hạn</dt><dd>{p.duration}</dd><dt>Thanh toán</dt><dd>Chuyển khoản ngân hàng hoặc quét mã QR</dd></dl></section>}
      {canPay
        ? <button className="btn primary block" disabled={!p?.active} onClick={() => nav(`/checkout?goi=full&dh=${c.id}&ve=${encodeURIComponent(loc.pathname)}`)}>{p?.active ? 'Mở đầy đủ' : 'Gói đang tạm ngừng bán'}</button>
        : <p className="muted">Người đại diện gia đình hoặc thành viên Đầy đủ có thể mở gói cho đám hiếu này.</p>}
      <p className="note">Không tự gia hạn. Nếu cần hỗ trợ, liên hệ đội hỗ trợ ở mục Tài khoản.</p>
    </div>
  );
}

/** Bọc module trả phí: chưa mở thì hiện Paywall */
export function PaidGate({ module, children }: { module: string; children: ReactNode }) {
  const { full } = useCase();
  return full ? <>{children}</> : <Paywall module={module} />;
}
