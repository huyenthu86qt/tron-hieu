import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { CaseData } from '../domain/types';
import { RuleError, initials } from '../domain/actions';
import { pendingDecisions, U1_ID } from '../domain/model';
import { isFull } from '../domain/platform';
import { syncPublicPage } from '../domain/guests';
import { repo } from '../repo/repo';
import { usePlatform, useUser } from '../repo/platformStore';
import { Icon } from '../ui/Icon';
import { useApp } from '../ui/common';
import { CaseContext, caseLine, DN, permsOf, useCase, type SheetState } from './CaseContext';
import { metaOf, NAV } from './nav';
import { CaseSheets } from './sheets';
import { SideLogo } from '../ui/brand';

export function CaseLayout() {
  const { id = '' } = useParams();
  const user = useUser()!;
  const dir = usePlatform(s => s.directory);
  const [c, setC] = useState<CaseData | null | undefined>(undefined);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const cRef = useRef<CaseData | null>(null);

  useEffect(() => {
    let live = true;
    repo.get(id).then(async x => {
      // Đám hiếu tạo trước khi có tài khoản (Phase 1): người mở đầu tiên thành người đại diện
      if (x && !x.ownerId) {
        x.ownerId = user.id;
        const u1 = x.members.find(m => m.id === U1_ID)!;
        u1.userId = user.id; u1.phone = user.phone;
        if (u1.name === 'Người đại diện') u1.name = user.name;
        await repo.save(x);
      }
      if (live) { cRef.current = x; setC(x); }
    });
    return () => { live = false; };
  }, [id, user.id, user.phone, user.name]);

  const update = useCallback((fn: (d: CaseData) => void) => {
    const cur = cRef.current;
    if (!cur) return 'Chưa tải xong đám hiếu.';
    const next = structuredClone(cur);
    try {
      fn(next);
      syncPublicPage(next);
    } catch (e) {
      if (e instanceof RuleError || e instanceof Error) return e.message;
      throw e;
    }
    cRef.current = next;
    setC(next);
    void repo.save(next);
    return null;
  }, []);

  if (c === undefined) return <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><p className="muted" style={{ textAlign: 'center' }}>Đang mở đám hiếu…</p></div></div>;
  const me = c?.members.find(m => m.userId === user.id) ?? c?.members.find(m => m.phone && m.phone === user.phone && m.access !== 'link');
  if (c === null || !me) return (
    <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}>
      <div className="empty"><Icon n={c ? 'lock' : 'alert'} c="lg" />
        <h2 style={{ color: 'var(--text)' }}>{c ? 'Anh/chị chưa có quyền xem đám hiếu này' : 'Không tìm thấy đám hiếu này'}</h2>
        <p>{c ? 'Người đại diện gia đình cần mời anh/chị bằng số điện thoại của tài khoản này.' : 'Đám hiếu có thể đã bị xóa, hoặc được tạo trên thiết bị khác.'}</p></div>
      <Link className="btn primary block" to="/app">Về trang chủ</Link>
    </div></div>
  );

  const perms = permsOf(me);
  return (
    <CaseContext.Provider value={{ c, base: `/dh/${c.id}`, update, sheet, openSheet: setSheet, me, ...perms, full: isFull(c), dir }}>
      <Shell />
      <CaseSheets />
    </CaseContext.Provider>
  );
}

function Shell() {
  const { mobile, toast } = useApp();
  const loc = useLocation();
  const nav = useNavigate();
  const { c, base, update, openSheet, me } = useCase();
  const rest = loc.pathname.slice(base.length);
  const from = (loc.state as { from?: string } | null)?.from;
  const m = metaOf(rest, from);
  const n = pendingDecisions(c).length + (c.finance?.expenses.filter(e => e.status === 'request').length ?? 0);
  const toggleMourning = () => {
    update(d => { d.mourning = !d.mourning; });
    toast(c.mourning ? 'Đã tắt Chế độ tang gia' : 'Đã bật Chế độ tang gia');
  };
  const go = (to?: string) => nav(to ? `${base}/${to}` : base);

  // Tìm nhanh: Ctrl/⌘ + K
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSheet({ type: 'search' }); } };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [openSheet]);

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
          <button className="icon-btn" onClick={() => nav('/thong-bao')} aria-label="Thông báo"><Icon n="bell" /></button>
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
        <SideLogo />
        {NAV.map(it => (
          <button key={it.k} className="nav-item" onClick={() => go(it.to)} aria-current={m.nav === it.k ? 'page' : undefined}>
            <Icon n={it.icon} />{it.label}{it.k === 'dec' && n > 0 && <span className="count">{n}</span>}
          </button>
        ))}
        <div className="sep" />
        <button className="nav-item" onClick={() => nav('/app')}><Icon n="swap" />Đổi hồ sơ</button>
        <button className="nav-item" onClick={() => go('cai-dat')} aria-current={rest === '/cai-dat' ? 'page' : undefined}><Icon n="settings" />Cài đặt</button>
      </nav>
      <div className="main-d">
        <header className="head-d">
          <div className="case"><h2>Đám hiếu {DN(c)}</h2><p>{caseLine(c)}</p></div>
          <div className="tools">
            <button className="switch" onClick={toggleMourning} aria-pressed={c.mourning}><span className="knob" />Chế độ tang gia</button>
            <button className="icon-btn" onClick={() => openSheet({ type: 'search' })} aria-label="Tìm kiếm (Ctrl K)"><Icon n="search" /></button>
            <button className="icon-btn" onClick={() => nav('/thong-bao')} aria-label="Thông báo"><Icon n="bell" /></button>
            <button className="avatar" style={{ border: 0, cursor: 'pointer' }} title={`${me.name} · Tài khoản`} onClick={() => nav('/tai-khoan')}>{initials(me.name)}</button>
          </div>
        </header>
        <main className="content" ref={contentRef}><Outlet /></main>
      </div>
    </div>
  );
}
