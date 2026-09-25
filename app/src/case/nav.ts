import type { IconName } from '../ui/Icon';

export type NavKey = 'now' | 'map' | 'dec' | 'team' | 'ven' | 'fin' | 'gst' | 'aft' | 'doc';
export const NAV: { k: NavKey; label: string; short?: string; icon: IconName; to?: string }[] = [
  { k: 'now', label: 'Bây giờ', icon: 'now', to: '' },
  { k: 'map', label: 'Bản đồ', icon: 'map', to: 'ban-do' },
  { k: 'dec', label: 'Cần quyết', icon: 'decide', to: 'can-quyet' },
  { k: 'team', label: 'Đội đám hiếu', short: 'Đội', icon: 'team', to: 'doi' },
  { k: 'ven', label: 'Nhà cung cấp', icon: 'vendor', to: 'nha-cung-cap' },
  { k: 'fin', label: 'Tài chính', icon: 'wallet', to: 'tai-chinh' },
  { k: 'gst', label: 'Khách viếng', icon: 'guest', to: 'khach-vieng' },
  { k: 'aft', label: 'Hậu tang', icon: 'after', to: 'hau-tang' },
  { k: 'doc', label: 'Tài liệu', icon: 'doc' },
];

export interface RouteMeta { nav: NavKey; title: string | null; back?: string }

export function metaOf(rest: string, from?: string): RouteMeta {
  const p = rest.split('/').filter(Boolean);
  switch (p[0]) {
    case undefined: return { nav: 'now', title: null };
    case 'ho-so': return { nav: 'now', title: 'Hồ sơ người đã khuất', back: '' };
    case 'ban-do': return { nav: 'map', title: 'Bản đồ đám hiếu' };
    case 'viec': return { nav: 'map', title: 'Chi tiết việc', back: from ?? 'ban-do' };
    case 'can-quyet': return { nav: 'dec', title: 'Cần quyết' };
    case 'quyet-dinh': return p[2] === 'thay-doi'
      ? { nav: 'dec', title: 'Xác nhận thay đổi', back: `quyet-dinh/${p[1]}` }
      : { nav: 'dec', title: 'Quyết định', back: 'can-quyet' };
    case 'doi': return { nav: 'team', title: 'Đội đám hiếu' };
    case 'nha-cung-cap': return { nav: 'ven', title: 'Nhà cung cấp' };
    case 'tai-chinh': return { nav: 'fin', title: 'Tài chính' };
    case 'khach-vieng': return { nav: 'gst', title: 'Khách viếng' };
    case 'hau-tang': return { nav: 'aft', title: 'Hậu tang' };
    case 'tai-lieu': return { nav: 'doc', title: 'Tài liệu' };
    default: return { nav: 'now', title: null };
  }
}
