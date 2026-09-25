// Tên và câu định vị thương hiệu — Chủ dự án chốt 2026-09-25.
import { Icon } from './Icon';

export const BRAND = 'Trọn Hiếu';
export const TAGLINE = 'Chu toàn việc hiếu – Trọn vẹn nghĩa tình';

/** Logo trên thanh điều hướng bên trái: tên + câu định vị nhỏ */
export function SideLogo({ label = BRAND }: { label?: string }) {
  return (
    <div className="logo"><Icon n="lotus" c="lg" />
      <span><span className="brand-name">{label}</span><span className="brand-tag">{TAGLINE.split(' – ').map(x => <span key={x} style={{ display: 'block' }}>{x}</span>)}</span></span>
    </div>
  );
}

/** Dòng thương hiệu nhỏ ở đầu các trang một cột (đăng nhập, thanh toán, pháp lý) */
export function BrandLine({ extra }: { extra?: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}><Icon n="lotus" />
      <span><b style={{ fontFamily: 'var(--serif)' }}>{BRAND}</b><span className="muted" style={{ display: 'block', fontSize: 12, lineHeight: 1.3 }}>{TAGLINE}</span></span>
      {extra && <span className="muted" style={{ marginLeft: 'auto' }}>{extra}</span>}
    </span>
  );
}
