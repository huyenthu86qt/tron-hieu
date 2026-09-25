// S-MAP-02 · Bản đồ đám hiếu (15 chặng)
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  currentPhase, FORM_LABEL, hasBLT, MODEL_LABEL, ORGT, PLACE_LABEL, RITE_LABEL, SCALE_LABEL, VENUE_LABEL, visibleTasks, type TaskView,
} from '../../domain/model';
import { PHASES } from '../../domain/templates';
import { Icon } from '../../ui/Icon';
import { KindPill, useApp } from '../../ui/common';
import { useCase } from '../CaseContext';
import { TaskRow } from '../rows';

type Filter = 'all' | 'open' | 'free';

export function MapPage() {
  const { c, openSheet } = useCase();
  const { mobile } = useApp();
  const [params, setParams] = useSearchParams();
  const cur = currentPhase(c);
  const sel = Number(params.get('chang')) || cur;
  const setSel = (n: number) => setParams(p => { p.set('chang', String(n)); return p; }, { replace: true });
  const [F, setF] = useState<Filter>('all');
  const [openFold, setOpenFold] = useState<number>(sel);
  const all = visibleTasks(c);
  const s = c.situation;

  const flt = (t: TaskView) => F === 'open' ? t.status !== 'done' && t.status !== 'skip' : F === 'free' ? !t.owner && t.status !== 'done' && t.status !== 'skip' : true;
  const cnt = (n: number) => {
    const tt = all.filter(t => t.phase === n);
    return { all: tt.length, done: tt.filter(t => t.status === 'done' || t.status === 'skip').length, free: tt.filter(t => !t.owner && t.status !== 'done' && t.status !== 'skip').length, iss: tt.filter(t => t.status === 'issue').length };
  };
  const phaseList = (n: number) => {
    const ts = all.filter(t => t.phase === n && flt(t));
    return ts.length
      ? <div className="list">{ts.map(t => <TaskRow key={t.id} t={t} why from={`ban-do?chang=${n}`} />)}</div>
      : <div className="empty"><span>{F === 'all' ? 'Chưa có việc ở chặng này.' : 'Không có việc nào khớp bộ lọc.'}</span></div>;
  };

  // Giữ chặng đang chọn trong khung nhìn của thanh chặng (không nhảy về chặng hiện tại)
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rl = railRef.current, st = rl?.querySelector<HTMLElement>('.rail-step[aria-pressed="true"]');
    if (rl && st && (st.offsetLeft < rl.scrollLeft || st.offsetLeft + st.offsetWidth > rl.scrollLeft + rl.clientWidth)) rl.scrollLeft = Math.max(0, st.offsetLeft - 60);
  }, [sel, mobile]);

  const chips = [PLACE_LABEL[s.place], s.venue === 'home' ? 'Làm lễ tại nhà riêng' : 'Làm lễ tại ' + VENUE_LABEL[s.venue].toLowerCase(), FORM_LABEL[s.form], RITE_LABEL[s.rite], MODEL_LABEL[s.org],
    ...(hasBLT(s) ? [ORGT[s.orgType].chip] : []), SCALE_LABEL[s.scale], ...(s.hasPre ? ['Có hồ sơ chuẩn bị'] : [])];
  const context = (
    <section className="card card-pad stack" style={{ gap: 8 }}>
      <div className="eyebrow">Bản đồ được sinh từ hoàn cảnh</div>
      <div className="chips" style={{ gap: 6 }}>{chips.map(x => <span key={x} className="pill soft">{x}</span>)}</div>
      <div className="meta" style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KindPill k="core" /> việc ai cũng cần <KindPill k="cond" /> sinh ra vì hoàn cảnh trên <KindPill k="opt" /> gia đình tự chọn</div>
    </section>
  );
  const filt = (
    <div className="segin" role="group" aria-label="Lọc việc">
      {([['all', 'Tất cả'], ['open', 'Chưa xong'], ['free', 'Chưa có người nhận']] as [Filter, string][]).map(([k, l]) =>
        <button key={k} onClick={() => setF(k)} aria-pressed={F === k}>{l}</button>)}
    </div>
  );
  const doneAll = all.filter(t => t.status === 'done' || t.status === 'skip').length;
  const head = (
    <div className="page-title"><div><h1>Bản đồ đám hiếu</h1><p>15 chặng từ lúc nhận tin tới khi khép vòng · đang ở chặng {cur} · {doneAll}/{all.length} việc đã xong</p></div>
      <div className="actions"><button className="btn" onClick={() => openSheet({ type: 'taskform', mode: 'new', phase: mobile ? (openFold || cur) : sel })}><Icon n="plus" c="sm" />Thêm việc riêng</button></div></div>
  );

  if (mobile) {
    return (
      <div className="page">{head}{context}<div>{filt}</div>
        <section className="card">{PHASES.map((p, i) => {
          const n = i + 1, k = cnt(n), st = n < cur ? 'done' : n === cur ? 'cur' : '';
          return (
            <details key={n} className="fold" open={n === openFold} style={i === 0 ? { borderTop: 0 } : undefined}>
              <summary className={n === openFold ? 'cur-sel' : ''} onClick={e => { e.preventDefault(); setOpenFold(openFold === n ? 0 : n); if (openFold !== n) setSel(n); }}>
                <Icon n="chev" c="chev" />
                <span className="num-badge" style={st === 'done' ? { background: 'var(--success-soft)', color: 'var(--success)' } : st === 'cur' ? { background: 'var(--accent-soft)', color: 'var(--warning)' } : undefined}>{st === 'done' ? <Icon n="check" c="sm" /> : n}</span>
                <span style={{ flex: 1 }}>{p}{k.iss > 0 && <> <span className="pill issue">{k.iss} vấn đề</span></>}</span>
                <span className="muted num">{k.done}/{k.all}</span>
              </summary>
              {n === openFold && phaseList(n)}
            </details>
          );
        })}</section>
        <p className="note">Tên 15 chặng và danh sách việc sẽ được đối chiếu với nguồn phong tục, thủ tục đã kiểm chứng.</p>
      </div>
    );
  }

  const k = cnt(sel);
  return (
    <div className="page">{head}{context}
      <div className="rail" ref={railRef}><div className="rail-inner">{PHASES.map((p, i) => {
        const n = i + 1, x = cnt(n);
        return (
          <button key={n} className={'rail-step ' + (n < cur ? 'done' : n === cur ? 'cur' : '')} onClick={() => setSel(n)} aria-pressed={n === sel}>
            <span className="n">Chặng {n}</span>{n === cur && <span className="here">Gia đình đang ở đây</span>}
            <span className="nm">{p}</span>
            <span className="muted num" style={{ marginTop: 'auto' }}>{x.done}/{x.all} xong{x.iss > 0 && <> · <span style={{ color: 'var(--danger)' }}>{x.iss} vấn đề</span></>}</span>
          </button>
        );
      })}</div></div>
      <section className="card">
        <div className="card-pad" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn sm" onClick={() => setSel(sel - 1)} disabled={sel <= 1} aria-label="Chặng trước"><Icon n="back" c="sm" />Chặng trước</button>
            <button className="btn sm" onClick={() => setSel(sel + 1)} disabled={sel >= 15} aria-label="Chặng sau">Chặng sau<Icon n="chev" c="sm" /></button>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="eyebrow">Đang xem{sel === cur ? ' · gia đình đang ở chặng này' : ''}</div>
            <h3>Chặng {sel} · {PHASES[sel - 1]}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div className={'bar ' + (k.all && k.done === k.all ? 'ok' : '')} style={{ flex: 1, maxWidth: 260 }}><i style={{ width: `${k.all ? k.done / k.all * 100 : 0}%` }} /></div>
              <span className="muted num">{k.done}/{k.all} việc xong{k.free ? ` · ${k.free} chưa có người nhận` : ''}</span>
            </div>
          </div>
          {filt}
        </div>
        {phaseList(sel)}
      </section>
      <p className="note">Tên 15 chặng và danh sách việc sẽ được đối chiếu với nguồn phong tục, thủ tục đã kiểm chứng.</p>
    </div>
  );
}
