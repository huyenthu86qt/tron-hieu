// Chọn quan hệ: lựa chọn có sẵn, hoặc “Khác” để gia đình tự viết (Em họ, Bạn thân của mẹ, Con nuôi…).
import { useState } from 'react';

export const REP_RELS = ['Con trai trưởng', 'Con trai', 'Con gái', 'Con dâu', 'Con rể', 'Vợ', 'Chồng', 'Cháu đích tôn', 'Cháu', 'Anh, chị, em ruột'];
export const MEMBER_RELS = ['Con trai trưởng', 'Con trai', 'Con gái', 'Con dâu', 'Con rể', 'Cháu', 'Anh, chị, em ruột', 'Họ hàng', 'Hàng xóm', 'Bạn của gia đình'];

export function RelationPicker({ value, onChange, items, disabled, id }: { value: string; onChange: (v: string) => void; items: string[]; disabled?: boolean; id?: string }) {
  const preset = (v: string) => items.includes(v);
  const [other, setOther] = useState(!!value && !preset(value));
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="chips">
        {items.map(r => (
          <button key={r} type="button" className="chip" disabled={disabled} aria-pressed={!other && value === r} onClick={() => { setOther(false); onChange(r); }}>{r}</button>
        ))}
        <button type="button" className="chip" disabled={disabled} aria-pressed={other} onClick={() => { setOther(true); if (preset(value)) onChange(''); }}>Khác</button>
      </div>
      {other && (
        <input className="input" id={id} value={preset(value) ? '' : value} maxLength={40} disabled={disabled} autoFocus
          onChange={e => onChange(e.target.value.replace(/^\s+/, ''))} placeholder="Tự viết, ví dụ: Em họ, Con nuôi, Bạn thân" aria-label="Quan hệ tự viết" />
      )}
    </div>
  );
}
