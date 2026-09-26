// S-ENT-01 · Chọn cửa vào · S-ENT-02 · Câu hỏi hoàn cảnh · S-ENT-03 · Việc cần làm ngay
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Answers } from '../domain/types';
import { answerLabel, DEFAULT_ANSWERS, earlyDecisions, entryItems, visibleQuestions } from '../domain/entry';
import { clearDraft, loadDraft, saveDraft, type EntryDraft } from '../repo/repo';
import { currentUser, useUser } from '../repo/platformStore';
import { createCaseFromDraft } from './AuthPages';
import { Icon } from '../ui/Icon';
import { LockPill } from '../ui/common';
import { BRAND, TAGLINE } from '../ui/brand';

function useDraft() {
  const [d, setD] = useState<EntryDraft>(() => loadDraft() ?? { answers: { ...DEFAULT_ANSWERS }, step: 0, mine: [], notified: [] });
  useEffect(() => { saveDraft(d); }, [d]);
  return [d, setD] as const;
}

export function Ent01() {
  const nav = useNavigate();
  const user = useUser();
  const start = () => {
    clearDraft();
    nav('/bat-dau/hoan-canh');
  };
  return (
    <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', color: 'var(--primary)' }}>
        <Icon n="lotus" c="lg" /><h1 style={{ fontSize: 30, color: 'var(--text)' }}>{BRAND}</h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--primary)' }}>{TAGLINE}</p>
        <p className="muted" style={{ fontSize: 15, maxWidth: '34ch' }}>Cùng gia đình lo trọn việc hiếu — biết việc gì trước, ai lo phần nào, không bỏ sót.</p>
      </div>
      <button className="entry-card main" onClick={start}><span className="eyebrow">Đã xảy ra</span><h3>Người thân vừa mất — cần tổ chức ngay</h3>
        <span className="muted">Trả lời vài câu, app đưa ngay những việc cần làm đầu tiên. Không cần đăng ký.</span></button>
      <button className="entry-card" onClick={() => nav('/chuan-bi/moi')}><span className="eyebrow">Chưa xảy ra</span><h3>Muốn chuẩn bị trước</h3>
        <span className="muted">Cho bản thân hoặc người thân: nguyện vọng, giấy tờ, người liên hệ, ngân sách.</span></button>
      <p className="muted" style={{ textAlign: 'center' }}>Đã có hồ sơ? {user ? <Link className="btn ghost sm" to="/app">Mở trang của tôi</Link> : <Link className="btn ghost sm" to="/dang-nhap">Đăng nhập</Link>}</p>
      <p style={{ textAlign: 'center' }}><Link className="btn ghost sm" to="/goc-binh-an">Góc Bình An · Nghệ thuật sống · Nghệ thuật chết</Link></p>
    </div></div>
  );
}

export function Ent02() {
  const nav = useNavigate();
  const [d, setD] = useDraft();
  const QX = visibleQuestions(d.answers);
  const step = Math.min(d.step, QX.length - 1);
  const q = QX[step], a = d.answers[q.k];
  const setAns = (v: string) => setD({ ...d, answers: { ...d.answers, [q.k]: v } as Answers });
  const next = () => {
    if (step < QX.length - 1) setD({ ...d, step: step + 1 });
    else nav('/bat-dau/viec-ngay');
  };
  return (
    <div className="bare"><div className="bare-inner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="icon-btn" style={{ border: 0, background: 'none' }} onClick={() => step ? setD({ ...d, step: step - 1 }) : nav('/')} aria-label="Quay lại"><Icon n="back" /></button>
        <span className="muted">Câu {step + 1}/{QX.length}</span></div>
      <div className="stepper">{QX.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      <h1 className="big-q">{q.q}</h1><p className="muted">{q.hint}</p>
      <div className="opts" role="radiogroup">{q.o.map(([k, l]) => (
        <button key={k} className="opt" role="radio" aria-checked={a === k} onClick={() => setAns(k)}><span className="radio" /><span className="title">{l}</span></button>
      ))}</div>
    </div>
    <div className="bare-foot"><button className="btn primary block" onClick={next}>{step < QX.length - 1 ? 'Tiếp tục' : 'Xem việc cần làm ngay'}</button></div></div>
  );
}

export function Ent03() {
  const nav = useNavigate();
  const [d, setD] = useDraft();
  const [busy, setBusy] = useState(false);
  const a = d.answers;
  const items = entryItems(a);
  const decs = earlyDecisions(a);
  const mineKey = (key: string) => d.mine.includes(key);
  // Lưu cần tài khoản: chưa đăng nhập thì tạo tài khoản, câu trả lời được giữ trong bản nháp
  const create = async (to: 'ho-so?moi=1' | 'ban-do') => {
    if (busy) return;
    if (!currentUser()) { nav('/dang-ky?tiep=tao-dam-hieu'); return; }
    setBusy(true);
    const id = await createCaseFromDraft();
    nav(id ? `/dh/${id}/${to}` : '/app', { replace: true });
  };
  return (
    <div className="bare"><div className="bare-inner">
      <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--primary)' }}>Xin chia buồn cùng gia đình.</p>
      <h1 style={{ fontSize: 26 }}>Đây là những việc cần làm ngay</h1>
      <div className="card card-pad" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="muted" style={{ flex: 1, minWidth: 200 }}>{answerLabel('place', a.place)} · {answerLabel('venue', a.venue)} · {answerLabel('form', a.form)}</span>
        <button className="btn sm ghost" onClick={() => { setD({ ...d, step: 0 }); nav('/bat-dau/hoan-canh'); }}>Sửa</button></div>
      <section className="card"><div className="list">{items.map((t, i) => (
        <div key={t.key} className="row"><span className="num-badge">{i + 1}</span>
          <div className="grow"><div className="title">{t.title}</div><div className="meta">{t.hint}</div>
            {t.groups && <ul className="subs">{t.groups.map(g => {
              const on = d.notified.includes(g.taskId);
              const toggle = () => setD({ ...d, notified: on ? d.notified.filter(x => x !== g.taskId) : [...d.notified, g.taskId] });
              return <li key={g.taskId}><span className="grow">{g.label}</span>{on
                ? <button className="pill done" onClick={toggle} style={{ border: 0 }}><Icon n="check" c="sm" />Đã báo</button>
                : <button className="btn sm" onClick={toggle}>Đánh dấu đã báo</button>}</li>;
            })}</ul>}
            <div className="acts">{mineKey(t.key)
              ? <span className="pill doing">Anh đang làm</span>
              : <button className="btn sm" onClick={() => setD({ ...d, mine: [...d.mine, t.key] })}>Tôi làm</button>}
              <span className="muted" style={{ fontSize: 13 }}>Nhờ người khác sau khi lưu</span></div>
          </div></div>
      ))}</div></section>
      <section className="card card-pad"><div className="sec-h"><h3>Cần quyết sớm</h3></div>
        <div className="list" style={{ margin: '0 -16px' }}>{decs.map(x => (
          <div key={x.label} className="row"><div className="grow"><div className="title">{x.label}</div>
            {x.lock && <div className="meta"><LockPill /><span>Sau khi nhập quan không thể làm lại</span></div>}</div></div>
        ))}</div></section>
      <p className="note">Bấm “Lưu và vào đám hiếu” để tạo tài khoản bằng số điện thoại — những gì anh/chị vừa nhập được giữ nguyên.</p>
    </div>
    <div className="bare-foot"><button className="btn" onClick={() => create('ban-do')} disabled={busy}>Xem toàn bộ các chặng</button>
      <button className="btn primary" style={{ flex: 1 }} onClick={() => create('ho-so?moi=1')} disabled={busy}>Lưu và vào đám hiếu</button></div></div>
  );
}
