import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import type { TaskKind, TaskStatus } from '../domain/types';
import { STATUS_LABEL } from '../domain/model';

/* ---------- Khung app: máy tính / điện thoại + thông báo ngắn ---------- */
const MQ = '(max-width: 899px)';

export function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(MQ).matches);
  useEffect(() => {
    const q = window.matchMedia(MQ);
    const on = () => setM(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return m;
}

interface AppCtx { mobile: boolean; toast: (msg: string) => void }
const Ctx = createContext<AppCtx>({ mobile: false, toast: () => {} });
export const useApp = () => useContext(Ctx);

export function AppFrame({ children }: { children: ReactNode }) {
  const mobile = useIsMobile();
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const toast = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 3200);
  }, []);
  return (
    <Ctx.Provider value={{ mobile, toast }}>
      <div className={'app ' + (mobile ? 'mode-m' : 'mode-d')}>
        {children}
        {msg && <div className="toast" role="status"><Icon n="check" c="sm" />{msg}</div>}
      </div>
    </Ctx.Provider>
  );
}

/* ---------- Sheet ---------- */
export function Sheet({ title, onClose, children, foot }: { title: string; onClose: () => void; children: ReactNode; foot?: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="layer">
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="grab" />
        <div className="sheet-h"><h3>{title}</h3><button className="icon-btn" style={{ border: 0 }} onClick={onClose} aria-label="Đóng"><Icon n="x" /></button></div>
        <div className="sheet-b">{children}</div>
        {foot && <div className="sheet-f">{foot}</div>}
      </div>
    </div>
  );
}

/* ---------- Nhãn ---------- */
export const StatusPill = ({ s }: { s: TaskStatus }) => <span className={'pill ' + s}>{STATUS_LABEL[s]}</span>;
export const LockPill = () => <span className="pill lock"><Icon n="lock" c="sm" />Không thể quay lại</span>;
export function KindPill({ k }: { k: TaskKind }) {
  if (k === 'own') return <span className="pill prio">Việc riêng của gia đình</span>;
  if (k === 'core') return <span className="pill soft">Bắt buộc</span>;
  if (k === 'cond') return <span className="pill prio">Theo hoàn cảnh</span>;
  return <span className="pill soft" style={{ fontStyle: 'italic' }}>Tùy chọn</span>;
}

export function Banner({ kind, icon = 'alert', children }: { kind: 'info' | 'warn' | 'upd'; icon?: Parameters<typeof Icon>[0]['n']; children: ReactNode }) {
  return <div className={'banner ' + kind}><Icon n={icon} /><div style={{ flex: 1 }}>{children}</div></div>;
}

export const ErrorBanner = ({ err }: { err: string | null | undefined }) => (err ? <Banner kind="warn">{err}</Banner> : null);

/** Nhóm lựa chọn một (radio) theo mẫu `.opts` */
export function Opts<T extends string>({ value, onChange, items, disabled }: {
  value: T | null; onChange: (v: T) => void; items: { k: T; title: ReactNode; note?: ReactNode }[]; disabled?: boolean;
}) {
  return (
    <div className="opts" role="radiogroup">
      {items.map(o => (
        <button key={o.k} type="button" className="opt" role="radio" aria-checked={value === o.k} disabled={disabled} onClick={() => onChange(o.k)}>
          <span className="radio" />
          <span>{<span className="title">{o.title}</span>}{o.note && <><br /><span className="muted">{o.note}</span></>}</span>
        </button>
      ))}
    </div>
  );
}

export function Chips({ items, isOn, onToggle }: { items: string[]; isOn: (x: string) => boolean; onToggle: (x: string) => void }) {
  return (
    <div className="chips">
      {items.map(x => <button key={x} type="button" className="chip" aria-pressed={isOn(x)} onClick={() => onToggle(x)}>{x}</button>)}
    </div>
  );
}

export const toggleIn = (arr: string[], x: string) => (arr.includes(x) ? arr.filter(y => y !== x) : [...arr, x]);
