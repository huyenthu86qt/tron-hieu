// Bộ biểu tượng nét mảnh từ bản mẫu đã khóa.
const P = {
  now: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>',
  decide: '<path d="M5 12.5 9.5 17 19 7.5"/><rect x="2.5" y="2.5" width="19" height="19" rx="4"/>',
  team: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14c2.3.2 4 1.8 4.5 4.5"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  vendor: '<path d="M3.5 9 5 4.5h14L20.5 9"/><path d="M3.5 9h17v1.5a2.8 2.8 0 0 1-5.6 0 2.8 2.8 0 0 1-5.6 0 2.8 2.8 0 0 1-5.8 0Z"/><path d="M5 13v7h14v-7"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 9.5h18M16 14h2"/>',
  guest: '<path d="M4 20V9l8-5 8 5v11"/><path d="M9.5 20v-5h5v5"/>',
  after: '<path d="M7 3.5v3M17 3.5v3"/><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17"/>',
  doc: '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  pin: '<path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20.5V16h-4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1"/>',
  lotus: '<path d="M12 19c-3.5 0-7-2-8.5-5.5 2.3-.4 4.6.2 6.3 1.6"/><path d="M12 19c3.5 0 7-2 8.5-5.5-2.3-.4-4.6.2-6.3 1.6"/><path d="M12 19c-2.2-2-3.2-4.6-3-7.5.2-2.6 1.3-4.8 3-6.5 1.7 1.7 2.8 3.9 3 6.5.2 2.9-.8 5.5-3 7.5Z"/><path d="M8.3 15.5c-1.4-1.5-2.2-3.4-2.3-5.4 1.4.3 2.6.9 3.6 1.8M15.7 15.5c1.4-1.5 2.2-3.4 2.3-5.4-1.4.3-2.6.9-3.6 1.8"/>',
  swap: '<path d="M7 7h12l-3.5-3.5M17 17H5l3.5 3.5"/>',
  cross: '<path d="M12 3v18M7 8h10"/>',
  candle: '<path d="M12 3c1.5 1.8 1.5 3.2 0 4.5-1.5-1.3-1.5-2.7 0-4.5Z"/><rect x="9" y="9" width="6" height="11" rx="1.2"/><path d="M7 20h10"/>',
};

export type IconName = keyof typeof P;

export function Icon({ n, c = '' }: { n: IconName; c?: string }) {
  return <svg className={`i ${c}`.trim()} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: P[n] }} />;
}
