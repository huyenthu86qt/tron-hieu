// Nhận lời mời vào đội đám hiếu (/moi/:token) và vào hồ sơ chuẩn bị (/moi-cb/:token).
// Người nhận mở link người đại diện gửi qua Zalo → đăng nhập (Google hoặc số điện thoại) → vào đúng vị trí.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { claimInvite, claimPreInvite, invitePreview, preInvitePreview, usePlatform, useUser, type InvitePreview, type PreInvitePreview } from '../repo/platformStore';
import { REMOTE } from '../repo/backend';
import { Icon } from '../ui/Icon';
import { Banner, ErrorBanner } from '../ui/common';
import { BrandLine } from '../ui/brand';
import { GoogleBlock } from './AuthPages';

const ACCESS = { full: 'thấy toàn bộ đám hiếu', limited: 'thấy phần việc được giao' } as Record<string, string>;
const ROLE = { view: 'xem', edit: 'cùng sửa', activate: 'xem và kích hoạt khi cần' } as Record<string, string>;

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="bare"><div className="bare-inner" style={{ maxWidth: 460 }}><BrandLine />{children}</div></div>;
}

function Invalid() {
  return (
    <Frame><div className="empty"><Icon n="link" c="lg" /><h2 style={{ color: 'var(--text)' }}>Lời mời không còn dùng được</h2>
      <p>Có thể lời mời đã được dùng, hoặc người đại diện gia đình đã tạo link mới. Anh/chị nhờ người đã gửi link gửi lại link mới.</p></div>
      <Link className="btn block" to="/app">Về trang của tôi</Link></Frame>
  );
}

/** Chưa đăng nhập: chọn cách vào (Google / số điện thoại), rồi quay lại đúng link mời */
function SignInChoices({ back }: { back: string }) {
  const q = `?tiep=${encodeURIComponent(back)}`;
  return (
    <section className="card card-pad stack">
      <p className="muted">Đăng nhập hoặc tạo tài khoản để nhận lời mời. Xong sẽ quay lại đúng trang này.</p>
      {REMOTE && <GoogleBlock next={back} bare />}
      <Link className="btn primary block" to={`/dang-ky${q}`}>Tạo tài khoản bằng số điện thoại</Link>
      <Link className="btn ghost block" to={`/dang-nhap${q}`}>Đã có tài khoản? Đăng nhập</Link>
    </section>
  );
}

export function InvitePage() {
  const { token = '' } = useParams();
  const user = useUser();
  const ready = usePlatform(s => s.ready);
  const nav = useNavigate();
  const [p, setP] = useState<InvitePreview | null | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready) invitePreview(token).then(setP).catch(() => setP(null)); }, [token, ready, user?.id]);
  if (p === undefined) return <Frame><p className="muted" style={{ textAlign: 'center' }}>Đang mở lời mời…</p></Frame>;
  if (p === null) return <Invalid />;
  const join = async () => {
    setBusy(true);
    const r = await claimInvite(token);
    if (r.error) { setErr(r.error); setBusy(false); return; }
    nav(`/dh/${r.caseId}`, { replace: true });
  };
  return (
    <Frame>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--primary)' }}>Đám hiếu {p.caseName}</p>
      <div><h1 style={{ fontSize: 24 }}>{p.inviter} mời {p.memberName} vào đội</h1>
        <p className="muted" style={{ marginTop: 6 }}>{p.memberRel ? p.memberRel + ' · ' : ''}Tham gia để {ACCESS[p.access] ?? 'cùng lo việc'} và nhận việc được nhờ.</p></div>
      {!user ? <SignInChoices back={`/moi/${token}`} /> : (
        <section className="card card-pad stack">
          <p>Anh/chị đang đăng nhập là <b>{user.name}</b>{user.phone ? <> · <span className="num">{user.phone}</span></> : null}.</p>
          <Banner kind="info">Nếu đây không phải anh/chị ({p.memberName}), đừng bấm tham gia — hãy đăng xuất và đưa link cho đúng người.</Banner>
          <ErrorBanner err={err} />
          <button className="btn primary block" disabled={busy} onClick={join}>{busy ? 'Đang vào đội…' : 'Tham gia đội'}</button>
        </section>
      )}
    </Frame>
  );
}

export function PreInvitePage() {
  const { token = '' } = useParams();
  const user = useUser();
  const ready = usePlatform(s => s.ready);
  const nav = useNavigate();
  const [p, setP] = useState<PreInvitePreview | null | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready) preInvitePreview(token).then(setP).catch(() => setP(null)); }, [token, ready, user?.id]);
  if (p === undefined) return <Frame><p className="muted" style={{ textAlign: 'center' }}>Đang mở lời mời…</p></Frame>;
  if (p === null) return <Invalid />;
  const join = async () => {
    setBusy(true);
    const r = await claimPreInvite(token);
    if (r.error) { setErr(r.error); setBusy(false); return; }
    nav(`/chuan-bi/${r.preId}`, { replace: true });
  };
  return (
    <Frame>
      <div><h1 style={{ fontSize: 24 }}>{p.inviter} chia sẻ hồ sơ chuẩn bị{p.subject ? ` của ${p.subject}` : ''}</h1>
        <p className="muted" style={{ marginTop: 6 }}>Mời {p.memberName} {ROLE[p.role] ?? 'xem'} hồ sơ này.</p></div>
      {!user ? <SignInChoices back={`/moi-cb/${token}`} /> : (
        <section className="card card-pad stack">
          <p>Anh/chị đang đăng nhập là <b>{user.name}</b>.</p>
          <ErrorBanner err={err} />
          <button className="btn primary block" disabled={busy} onClick={join}>{busy ? 'Đang mở…' : 'Nhận lời mời'}</button>
        </section>
      )}
    </Frame>
  );
}
