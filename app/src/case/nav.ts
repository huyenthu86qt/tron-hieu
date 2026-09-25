import type { IconName } from '../ui/Icon';

export type NavKey = 'now' | 'map' | 'dec' | 'team' | 'ven' | 'fin' | 'gst' | 'aft' | 'doc';
export const NAV: { k: NavKey; label: string; short?: string; icon: IconName; to: string; paid?: boolean }[] = [
  { k: 'now', label: 'Bây giờ', icon: 'now', to: '' },
  { k: 'map', label: 'Bản đồ', icon: 'map', to: 'ban-do' },
  { k: 'dec', label: 'Cần quyết', icon: 'decide', to: 'can-quyet' },
  { k: 'team', label: 'Đội đám hiếu', short: 'Đội', icon: 'team', to: 'doi' },
  { k: 'ven', label: 'Nhà cung cấp', icon: 'vendor', to: 'nha-cung-cap', paid: true },
  { k: 'fin', label: 'Tài chính', icon: 'wallet', to: 'tai-chinh', paid: true },
  { k: 'gst', label: 'Khách viếng', icon: 'guest', to: 'khach-vieng', paid: true },
  { k: 'aft', label: 'Hậu tang', icon: 'after', to: 'hau-tang', paid: true },
  { k: 'doc', label: 'Tài liệu', icon: 'doc', to: 'tai-lieu' },
];

export interface RouteMeta { nav: NavKey; title: string | null; back?: string }

export function metaOf(rest: string, from?: string): RouteMeta {
  const p = rest.split('/').filter(Boolean);
  switch (p[0]) {
    case undefined: return { nav: 'now', title: null };
    case 'ho-so': return { nav: 'now', title: 'Hồ sơ người đã khuất', back: '' };
    case 'tiep-nhan': return { nav: 'now', title: 'Tiếp nhận hồ sơ chuẩn bị', back: '' };
    case 'viec-cua-toi': return { nav: 'now', title: 'Việc của tôi', back: '' };
    case 'ban-do': return { nav: 'map', title: 'Bản đồ đám hiếu' };
    case 'viec': return { nav: 'map', title: 'Chi tiết việc', back: from ?? 'ban-do' };
    case 'can-quyet': return { nav: 'dec', title: 'Cần quyết' };
    case 'quyet-dinh':
      if (!p[1]) return { nav: 'dec', title: 'Lịch sử quyết định', back: 'can-quyet' };
      return p[2] === 'thay-doi'
        ? { nav: 'dec', title: 'Xác nhận thay đổi', back: `quyet-dinh/${p[1]}` }
        : { nav: 'dec', title: 'Quyết định', back: 'can-quyet' };
    case 'doi': return { nav: 'team', title: 'Đội đám hiếu' };
    case 'nha-cung-cap':
      return p[1] ? { nav: 'ven', title: p[1] === 'goi-y' ? 'Gợi ý nhà cung cấp' : 'Chi tiết nhà cung cấp', back: p[1] === 'goi-y' ? 'nha-cung-cap' : from ?? 'nha-cung-cap' } : { nav: 'ven', title: 'Nhà cung cấp' };
    case 'tai-chinh': {
      const t: Record<string, string> = { 'phung-vieng': 'Sổ phúng viếng', 'doi-soat': 'Đối soát và khóa', 'khoan-chi': 'Khoản chi', 'cong-no': 'Công nợ', 'ngan-sach': 'Ngân sách' };
      return p[1] ? { nav: 'fin', title: t[p[1]] ?? 'Tài chính', back: 'tai-chinh' } : { nav: 'fin', title: 'Tài chính' };
    }
    case 'khach-vieng': {
      const t: Record<string, string> = { 'trang-tin': 'Trang thông tin', 'danh-sach': 'Danh sách khách', 'ban-giao': 'Bàn giao ca' };
      return p[1] ? { nav: 'gst', title: t[p[1]] ?? 'Khách viếng', back: 'khach-vieng' } : { nav: 'gst', title: 'Khách viếng' };
    }
    case 'hau-tang': {
      const t: Record<string, string> = { moc: 'Mốc tưởng niệm', 'cam-on': 'Danh sách cảm ơn', 'khep-vong': 'Khép vòng', 'thu-tuc': 'Thủ tục & quyền lợi' };
      if (p[1] === 'moc' && p[2]) return { nav: 'aft', title: 'Chi tiết mốc', back: 'hau-tang' };
      return p[1] ? { nav: 'aft', title: t[p[1]] ?? 'Hậu tang', back: 'hau-tang' } : { nav: 'aft', title: 'Hậu tang' };
    }
    case 'tai-lieu': return { nav: 'doc', title: 'Tài liệu' };
    case 'lich-su': return { nav: 'doc', title: 'Lịch sử', back: '' };
    case 'cai-dat': return { nav: 'now', title: 'Cài đặt đám hiếu', back: '' };
    default: return { nav: 'now', title: null };
  }
}
