// Tài khoản nhận phúng viếng của gia đình: khi khách hỏi chuyển khoản, người trong đội đưa đúng số này.
// Chỉ người trong đội thấy (không có trên trang cáo phó). App không nhận, không giữ tiền thay gia đình.
import { useState } from 'react';
import type { CondolenceAccount } from '../domain/types';
import { BANKS } from '../domain/finance';
import { Icon } from '../ui/Icon';
import { useApp } from '../ui/common';
import { useCase } from './CaseContext';

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
const fullText = (a: CondolenceAccount) => `${a.bank} · ${a.acct} · ${a.holder}`;

/** Dòng gọn: dùng trong màn Ghi nhanh khách viếng khi chọn “Chuyển khoản” */
export function AccountInline() {
  const { c } = useCase();
  const { toast } = useApp();
  const a = c.condolenceAccount;
  if (!a) return <p className="muted">Gia đình chưa ghi tài khoản nhận phúng viếng — thêm ở trang Khách viếng.</p>;
  return (
    <div className="link-box" style={{ alignItems: 'center' }}>
      <span><b className="num">{a.acct}</b> · {a.bank}<br /><span className="muted">{a.holder}</span></span>
      <button className="btn sm" onClick={async () => toast(await copy(fullText(a)) ? 'Đã sao chép số tài khoản' : fullText(a))}><Icon n="copy" c="sm" />Sao chép</button>
    </div>
  );
}

/** Thẻ ở trang Khách viếng: xem, sao chép; người đại diện hoặc người có quyền Tài chính sửa */
export function AccountCard() {
  const { c, update, isU1, canFin } = useCase();
  const { toast } = useApp();
  const a = c.condolenceAccount;
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<CondolenceAccount>(() => a ?? { holder: '', bank: '', acct: '' });
  const [err, setErr] = useState<string | null>(null);
  const canEdit = isU1 || canFin;
  const save = () => {
    const x = { holder: f.holder.trim().toUpperCase(), bank: f.bank, acct: f.acct.replace(/[^\d]/g, '') };
    if (!x.holder || !x.bank || x.acct.length < 6) { setErr('Cần đủ ngân hàng, số tài khoản và tên chủ tài khoản.'); return; }
    update(d => { d.condolenceAccount = x; d.history.push({ at: new Date().toISOString(), text: 'Cập nhật tài khoản nhận phúng viếng' }); });
    setErr(null); setEdit(false); toast('Đã lưu tài khoản nhận phúng viếng');
  };
  return (
    <section className="card card-pad stack" style={{ gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><h3 style={{ flex: 1 }}>Tài khoản nhận phúng viếng</h3>
        {canEdit && a && !edit && <button className="btn sm ghost" onClick={() => { setF(a); setEdit(true); }}>Sửa</button>}</div>
      {edit || (!a && canEdit) ? <>
        <div className="field"><label htmlFor="caBank">Ngân hàng</label><select className="input" id="caBank" value={f.bank} onChange={e => setF({ ...f, bank: e.target.value })}><option value="">Chọn ngân hàng</option>{BANKS.map(b => <option key={b}>{b}</option>)}</select></div>
        <div className="field"><label htmlFor="caAcct">Số tài khoản</label><input className="input num" id="caAcct" inputMode="numeric" value={f.acct} onChange={e => setF({ ...f, acct: e.target.value })} /></div>
        <div className="field"><label htmlFor="caHolder">Chủ tài khoản</label><input className="input" id="caHolder" value={f.holder} onChange={e => setF({ ...f, holder: e.target.value })} placeholder="Viết như trên tài khoản, ví dụ LE THI HOA" style={{ textTransform: 'uppercase' }} /></div>
        {err && <p className="muted" style={{ color: 'var(--danger)' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 8 }}><button className="btn primary" onClick={save}>Lưu</button>{a && <button className="btn" onClick={() => setEdit(false)}>Hủy</button>}</div>
      </> : a ? <>
        <dl className="kv"><dt>Ngân hàng</dt><dd>{a.bank}</dd><dt>Số tài khoản</dt><dd className="num"><b>{a.acct}</b></dd><dt>Chủ tài khoản</dt><dd>{a.holder}</dd></dl>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={async () => toast(await copy(a.acct) ? 'Đã sao chép số tài khoản' : a.acct)}><Icon n="copy" c="sm" />Sao chép số</button>
          <button className="btn" onClick={async () => toast(await copy(fullText(a)) ? 'Đã sao chép đủ thông tin' : fullText(a))}><Icon n="copy" c="sm" />Sao chép đủ thông tin</button>
        </div>
      </> : <p className="muted">Người đại diện chưa ghi tài khoản.</p>}
      <p className="note">Khi khách hỏi chuyển khoản, người trong đội đưa đúng số này. Chỉ người trong đội thấy — không hiện trên trang cáo phó. App không nhận tiền thay gia đình.</p>
    </section>
  );
}
