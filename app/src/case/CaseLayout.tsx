import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { CaseData } from '../domain/types';
import { RuleError, initials } from '../domain/actions';
import { pendingDecisions, U1_ID } from '../domain/model';
import { repo } from '../repo/repo';
import { Icon } from '../ui/Icon';
import { useApp } from '../ui/common';
import { CaseContext, caseLine, DN, useCase as useContextSafe, type SheetState } from './CaseContext';
import { metaOf, NAV } from './nav';
import { CaseSheets } from './sheets';

export function CaseLayout() {
  const { id = '' } = useParams();
  const [c, setC] = useState<CaseData | null | undefined>(undefined);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const cRef = useRef<CaseData | null>(null);

  useEffect(() => {
    let live = true;
    repo.get(id).then(x => { if (live) { cRef.current = x; setC(x); } });
    return () => { live = false; };
  }, [id]);

  const update = useCallback((fn: (d: CaseData) => void) => {
    const cur = cRef.current;
    if (!cur) return 'Chưa tải xong đám hiếu.';
    const next = structuredClone(cur);
    try {
      fn(next);
    } catch (e) {
      if (e instanceof RuleError) return e.message;
      throw e;
    }
    cRef.current = next;
    setC(next);
    void repo.save(next);
    return null;
  }, []);

  if (c === undefined) return <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><p className="muted" style={{ textAlign: 'center' }}>Đang mở đám hiếu…</p></div></div>;
  if (c === null) return (
    <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}>
      <div className="empty"><Icon n="alert" c="lg" /><h2 style={{ color: 'var(--text)' }}>Không tìm thấy đám hiếu này</h2><p>Đám hiếu có thể đã bị xóa, hoặc được tạo trên thiết bị khác.</p></div>
      <Link className="btn primary block" to="/app">Về danh sách đám hiếu</Link>
    </div></div>
  );

  return (
    <CaseContext.Provider value={{ c, base: `/dh/${c.id}`, update, sheet, openSheet: setSheet }}>
      <Shell />
      <CaseSheets />
    </CaseContext.Provider>
  );
}

function Shell() {
  const { mobile, toast } = useApp();
  const loc = useLocation();
  const nav = useNavigate();
  const ctx = useContextSafe();
  const { c, base, update, openSheet } = ctx;
  const rest = loc.pathname.slice(base.length);
  const from = (loc.state as { from?: string } | null)?.from;
  const m = metaOf(rest, from);
  const n = pendingDecisions(c).length;
  const u1 = c.members.find(x => x.id === U1_ID)!;
  const later = (what: string) => toast(`${what} sẽ mở ở giai đoạn sau`);
  const toggleMourning = () => {
    update(d => { d.mourning = !d.mourning; });
    toast(c.mourning ? 'Đã tắt Chế độ tang gia' : 'Đã bật Chế độ tang gia');
  };
  const go = (to?: string) => nav(to ? `${base}/${to}` : base);

  // Cuộn lên đầu khi đổi màn
  const contentRef = useRef<HTMLElement>(null);
  useEffect(() => { contentRef.current?.scrollTo({ top: 0 }); }, [loc.pathname]);

  if (mobile) {
    const items = NAV.slice(0, 4);
    const inMore = ['ven', 'fin', 'gst', 'aft', 'doc'].includes(m.nav);
    return (
      <div className="shell-m">
        <header className="top-m">
          {m.back !== undefined && <button className="icon-btn" onClick={() => go(m.back)} aria-label="Quay lại"><Icon n="back" /></button>}
          <div className="t"><h2>{m.title ?? DN(c)}</h2><p>{m.title ? `${DN(c)} · ${caseLine(c).split(' · ').pop()}` : caseLine(c)}</p></div>
          <button className="icon-btn" onClick={() => later('Thông báo')} aria-label="Thông báo"><Icon n="bell" /></button>
        </header>
        <main className="content" ref={contentRef}><Outlet /></main>
        <nav className="bottom-nav" aria-label="Điều hướng chính">
          {items.map(it => (
            <button key={it.k} className="bn" onClick={() => go(it.to)} aria-current={m.nav === it.k ? 'page' : undefined}>
              <Icon n={it.icon} />{it.short ?? it.label}{it.k === 'dec' && n > 0 && <span className="count">{n}</span>}
            </button>
          ))}
          <button className="bn" onClick={() => openSheet({ type: 'more' })} aria-current={inMore ? 'page' : undefined}><Icon n="more" />Thêm</button>
        </nav>
      </div>
    );
  }

  return (
    <div className="shell-d">
      <nav className="side" aria-label="Điều hướng chính">
        <div className="logo"><Icon n="lotus" c="lg" />Đám Hiếu</div>
        {NAV.map(it => it.to === undefined
          ? <button key={it.k} className="nav-item later" onClick={() => later(it.label)}><Icon n={it.icon} />{it.label}<span className="tag">Giai đoạn sau</span></button>
          : <button key={it.k} className="nav-item" onClick={() => go(it.to)} aria-current={m.nav === it.k ? 'page' : undefined}>
              <Icon n={it.icon} />{it.label}{it.k === 'dec' && n > 0 && <span className="count">{n}</span>}
            </button>)}
        <div className="sep" />
        <button className="nav-item" onClick={() => nav('/app')}><Icon n="swap" />Đổi hồ sơ</button>
        <button className="nav-item later" onClick={() => later('Cài đặt')}><Icon n="settings" />Cài đặt<span className="tag">Giai đoạn sau</span></button>
      </nav>
      <div className="main-d">
        <header className="head-d">
          <div className="case"><h2>Đám hiếu {DN(c)}</h2><p>{caseLine(c)}</p></div>
          <div className="tools">
            <button className="switch" onClick={toggleMourning} aria-pressed={c.mourning}><span className="knob" />Chế độ tang gia</button>
            <button className="icon-btn" onClick={() => later('Tìm kiếm')} aria-label="Tìm kiếm"><Icon n="search" /></button>
            <button className="icon-btn" onClick={() => later('Thông báo')} aria-label="Thông báo"><Icon n="bell" /></button>
            <div className="avatar" title={u1.name}>{initials(u1.name)}</div>
          </div>
        </header>
        <main className="content" ref={contentRef}><Outlet /></main>
      </div>
    </div>
  );
}
