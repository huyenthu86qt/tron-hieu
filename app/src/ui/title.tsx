// Chọn danh xưng người đã khuất: danh xưng có sẵn, hoặc “Khác” để gia đình tự viết (Thầy, Cô, Bác, Chú, Sơ…).
import { useState } from 'react';
import { TITLES } from '../domain/person';
import type { Title } from '../domain/types';

const isPreset = (t: string) => (TITLES as readonly string[]).includes(t);

export function TitlePicker({ value, onChange, disabled }: { value: Title; onChange: (t: Title) => void; disabled?: boolean }) {
  const [other, setOther] = useState(!!value && !isPreset(value));
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="chips">
        {TITLES.map(t => (
          <button key={t} type="button" className="chip" disabled={disabled} aria-pressed={!other && value === t} onClick={() => { setOther(false); onChange(t); }}>{t}</button>
        ))}
        <button type="button" className="chip" disabled={disabled} aria-pressed={other} onClick={() => { setOther(true); if (isPreset(value)) onChange(''); }}>Khác</button>
      </div>
      {!other && !value && !disabled && <p className="muted" style={{ fontSize: 13 }}>Chưa chọn danh xưng — cáo phó và các trang sẽ chỉ ghi họ tên.</p>}
      {other && (
        <input className="input" value={isPreset(value) ? '' : value} maxLength={20} disabled={disabled} autoFocus
          onChange={e => onChange(e.target.value.replace(/^\s+/, ''))} placeholder="Gia đình tự viết, ví dụ: Thầy, Cô, Bác, Chú, Sơ" aria-label="Danh xưng tự viết" />
      )}
    </div>
  );
}
