// Khung “Không gian của tôi”: Trang chủ, Chuẩn bị trước, Góc Bình An, Thông báo, Tài khoản (bản mẫu: shellX 'acct')
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CaseData } from '../domain/types';
import { initials } from '../domain/actions';
import { repo } from '../repo/repo';
import { ringForNew } from '../ui/bell';
import { useUser } from '../repo/platformStore';
import { DN_TEXT } from '../domain/text';
import { Icon, type IconName } from '../ui/Icon';
import { useApp } from '../ui/common';
import { SideLogo } from '../ui/brand';

const ITEMS: [string, IconName, string][] = [['Trang chủ', 'now', '/app'], ['Chuẩn bị trước', 'doc', '/chuan-bi'], ['Góc Bình An', 'lotus', '/goc-binh-an'], ['Thông báo', 'bell', '/thong-bao'], ['Tài khoản', 'user', '/tai-khoan']];

/** Đám hiếu mà tài khoản này là người đại diện hoặc thành viên */
export function useMyCases() {
  const user = useUser();
  const [list, setList] = useState<CaseData[] | null>(null);
  useEffect(() => {
    if (!user) return;
    let live = true;
    repo.listAll().then(all => {
      if (!live) return;
      const mine = all.filter(c => c.ownerId === user.id || !c.ownerId || c.members.some(m => m.userId === user.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setList(mine);
      // Chuông chánh niệm: có người vừa viết vào Sổ tưởng nhớ kể từ lần trước (không ngân cho dòng của chính mình)
      ringForNew(mine.flatMap(c => c.history), mine.map(c => c.members.find(m => m.userId === user.id)?.name).find(Boolean) ?? user.name);
    });
    return () => { live = false; };
  }, [user]);
  return list;
}

export function AccountShell({ title, back, children }: { title: string; back?: string; children: ReactNode }) {
  const { mobile } = useApp();
  const user = useUser()!;
  const nav = useNavigate();
  const loc = useLocation();
  const cases = useMyCases();
  const cur = (to: string) => (loc.pathname === to || (to !== '/app' && loc.pathname.startsWith(to)) ? 'page' : undefined);
  if (mobile) return (
    <div className="shell-m">
      <header className="top-m">
        {back && <button className="icon-btn" onClick={() => nav(back)} aria-label="Quay lại"><Icon n="back" /></button>}
        <div className="t"><h2>{title}</h2><p>Không gian của {user.name}</p></div>
      </header>
      <main className="content">{children}</main>
      <nav className="bottom-nav" aria-label="Điều hướng chính">
        {ITEMS.map(([l, i, to]) => <button key={to} className="bn" onClick={() => nav(to)} aria-current={cur(to)}><Icon n={i} />{l}</button>)}
      </nav>
    </div>
  );
  return (
    <div className="shell-d">
      <nav className="side" aria-label="Điều hướng chính">
        <SideLogo />
        {ITEMS.map(([l, i, to]) => <button key={to} className="nav-item" onClick={() => nav(to)} aria-current={cur(to)}><Icon n={i} />{l}</button>)}
        {cases && cases.length > 0 && <>
          <div className="sep" /><div className="eyebrow" style={{ padding: '4px 12px' }}>Đám hiếu đang lo</div>
          {cases.slice(0, 5).map(c => <button key={c.id} className="nav-item" onClick={() => nav(`/dh/${c.id}`)}><Icon n="lotus" />{DN_TEXT(c)}</button>)}
        </>}
      </nav>
      <div className="main-d">
        <header className="head-d"><div className="case"><h2>Không gian của {user.name}</h2><p>Hồ sơ chuẩn bị và đám hiếu đang lo</p></div>
          <div className="tools"><button className="avatar" style={{ border: 0, cursor: 'pointer' }} onClick={() => nav('/tai-khoan')} title="Tài khoản">{initials(user.name)}</button></div></header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
