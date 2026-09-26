// S-ENT-06 · Hồ sơ người đã khuất (+ người đại diện gia đình)
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { savePerson, validatePerson, type PersonForm } from '../../domain/actions';
import { portraitIcon, U1_ID } from '../../domain/model';
import { longevityWord, lunarAge, lunarDeathText } from '../../domain/person';
import { Icon } from '../../ui/Icon';
import { Banner, Chips, ErrorBanner, useApp } from '../../ui/common';
import { TitlePicker } from '../../ui/title';
import { useCase } from '../CaseContext';

const U1_RELS = ['Con trai trưởng', 'Con trai', 'Con gái', 'Vợ', 'Chồng', 'Cháu đích tôn', 'Người thân khác'];

/** Thu nhỏ ảnh thờ trước khi lưu (lưu trên máy có giới hạn dung lượng) */
function shrinkImage(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không đọc được ảnh'));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/jpeg', 0.85));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}

export function ProfilePage() {
  const { c, base, update } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const fromEntry = params.get('moi') === '1';
  const u1 = c.members.find(m => m.id === U1_ID)!;
  const [f, setF] = useState<PersonForm>(() => ({
    ...c.person,
    u1name: u1.name === 'Người đại diện' ? '' : u1.name,
    u1rel: u1.rel === 'Người đại diện gia đình' ? '' : u1.rel,
  }));
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof PersonForm>(k: K, v: PersonForm[K]) => setF(x => ({ ...x, [k]: v }));
  const cath = c.situation.rite === 'catholic';
  const age = lunarAge(f);
  const preview = f.name.trim() ? [f.title, cath && f.saint.trim() ? f.saint.trim() : '', f.name.trim()].filter(Boolean).join(' ') : '—';

  const save = () => {
    const v = validatePerson(f);
    if (v) { setErr(v); return; }
    const e = update(d => savePerson(d, f));
    if (e) { setErr(e); return; }
    nav(base);
    toast(fromEntry ? 'Đã tạo hồ sơ. Bắt đầu lo việc theo bản đồ.' : 'Đã lưu hồ sơ. Cáo phó, mốc tưởng niệm, lời cảm ơn cập nhật theo.');
  };

  return (
    <div className="page" style={{ maxWidth: 780 }}>
      <div className="page-title"><div><div className="eyebrow">Hồ sơ</div><h1 style={{ marginTop: 4 }}>Hồ sơ người đã khuất</h1>
        <p>Sửa ở đây thì màn Bây giờ, cáo phó, mốc tưởng niệm và lời cảm ơn cập nhật theo</p></div></div>
      {fromEntry && <Banner kind="info" icon="lotus">Xin chia buồn cùng gia đình. Anh/chị nhập vài thông tin chính; phần còn lại bổ sung sau cũng được.</Banner>}
      <section className="card card-pad stack">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {f.photo
              ? <div className="portrait" style={{ padding: 0, overflow: 'hidden', width: 96, height: 120 }}><img src={f.photo} alt="Ảnh thờ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              : <div className="portrait" style={{ width: 96, height: 120 }}><Icon n={portraitIcon(c.situation.rite)} c="lg" /></div>}
            <label className="btn sm file-btn"><Icon n="plus" c="sm" />{f.photo ? 'Đổi ảnh thờ' : 'Thêm ảnh thờ'}
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                try { set('photo', await shrinkImage(file)); } catch { toast('Không đọc được ảnh này — thử ảnh khác'); }
              }} /></label>
            {f.photo && <button className="btn sm ghost" onClick={() => set('photo', null)}>Bỏ ảnh</button>}
          </div>
          <div className="stack" style={{ flex: 1, minWidth: 240, gap: 12 }}>
            <div className="field"><label>Danh xưng</label><TitlePicker value={f.title} onChange={t => set('title', t)} /></div>
            <div className="field"><label htmlFor="pName">Họ và tên</label><input className="input" id="pName" value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ví dụ: Nguyễn Văn Hòa" /></div>
            {cath && <div className="field"><label htmlFor="pSaint">Tên thánh</label><input className="input" id="pSaint" value={f.saint} onChange={e => set('saint', e.target.value)} placeholder="Ví dụ: Giuse" /></div>}
            <p className="muted">Hiển thị: <b style={{ color: 'var(--text)' }}>{preview}</b></p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
          <div className="field"><label htmlFor="pBirth">Năm sinh</label><input className="input num" id="pBirth" inputMode="numeric" maxLength={4} value={f.birthYear} onChange={e => set('birthYear', e.target.value.replace(/\D/g, ''))} placeholder="1938" /></div>
          <div className="field"><label htmlFor="pDeath">Ngày mất</label><input className="input" type="date" id="pDeath" value={f.death} onChange={e => set('death', e.target.value)} /></div>
          <div className="field"><label htmlFor="pTime">Giờ mất (nếu biết)</label><input className="input" type="time" id="pTime" value={f.time} onChange={e => set('time', e.target.value)} /></div>
        </div>
        <Banner kind="info" icon="after">{f.death ? <>Âm lịch: <b>{lunarDeathText(f)}</b></> : 'Nhập ngày mất để app tính ngày âm lịch và các hạn việc.'}{age && age > 0 ? <> · {longevityWord(age)} <b>{age} tuổi</b> (tính theo tuổi âm)</> : null}</Banner>
        <div className="field"><label htmlFor="pHome">Quê quán (tùy chọn)</label><input className="input" id="pHome" value={f.hometown} onChange={e => set('hometown', e.target.value)} placeholder="Ví dụ: xã Tam Sơn, tỉnh Bắc Ninh" /></div>
      </section>
      <section className="card card-pad stack"><h3>Người đại diện gia đình (tang chủ)</h3>
        <div className="field"><label htmlFor="uName">Họ tên</label><input className="input" id="uName" value={f.u1name} onChange={e => set('u1name', e.target.value)} placeholder="Ví dụ: Nguyễn Minh Tuấn" /></div>
        <div className="field"><label>Quan hệ với người đã khuất</label><Chips items={U1_RELS} isOn={x => f.u1rel === x} onToggle={x => set('u1rel', x)} /></div>
      </section>
      <ErrorBanner err={err} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={save} style={{ flex: 1 }}>{fromEntry ? 'Lưu và vào đám hiếu' : 'Lưu hồ sơ'}</button>
        {!fromEntry && <button className="btn" onClick={() => nav(base)}>Hủy</button>}
      </div>
      <p className="note">Ngày âm lịch và tuổi âm tính tự động; “hưởng thọ” từ 60 tuổi, dưới 60 là “hưởng dương”. Hạn các việc tính theo ngày mất.</p>
    </div>
  );
}
