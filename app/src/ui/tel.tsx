// Số điện thoại chạm là gọi — lúc tang gia, gọi điện là việc làm nhiều nhất.
import { fmtPhone } from '../domain/platform';

export function Tel({ phone, empty = '—' }: { phone?: string; empty?: string }) {
  const p = (phone ?? '').trim();
  if (!p) return <span className="num">{empty}</span>;
  return <a className="num tel" href={`tel:${p.replace(/[^\d+]/g, '')}`} onClick={e => e.stopPropagation()} aria-label={`Gọi ${fmtPhone(p)}`}>{fmtPhone(p)}</a>;
}
