// S-AUTH-01 Đăng ký · S-AUTH-02 Đăng nhập · S-AUTH-03 Quên mật khẩu · S-AUTH-04 Hết phiên
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { createCase } from '../domain/model';
import { normalizeCase } from '../domain/normalize';
import { fmtPhone, OTP_TTL_MIN, SUPPORT } from '../domain/platform';
import { clearDraft, loadDraft, repo } from '../repo/repo';
import {
  completeProfile, currentUser, devOtpCode, getPlatform, login, register, resetPassword, sendOtp, sessionExpired, signInWithGoogle, usePlatform, useUser,
} from '../repo/platformStore';
import { REMOTE } from '../repo/backend';
import { entryItems } from '../domain/entry';
import { U1_ID } from '../domain/model';
import { Icon } from '../ui/Icon';
import { Banner, ErrorBanner, useApp } from '../ui/common';
import { BrandLine } from '../ui/brand';

/** Tạo đám hiếu từ câu trả lời đã nhập (giữ nguyên sau khi đăng ký / đăng nhập) */
export async function createCaseFromDraft(): Promise<string | null> {
  const u = currentUser(), d = loadDraft();
  if (!u || !d) return null;
  const items = entryItems(d.answers);
  const mine = items.filter(x => d.mine.includes(x.key)).flatMap(x => x.taskIds);
  const c = normalizeCase(createCase({ answers: d.answers, mine, notified: d.notified }));
  c.ownerId = u.id;
  const u1 = c.members.find(m => m.id === U1_ID)!;
  u1.name = u.name; u1.userId = u.id; u1.phone = u.phone;
  await repo.save(c);
  clearDraft();
  return c.id;
}

/** Sau khi đăng nhập / đăng ký: đi tiếp đúng chỗ đang dở */
async function afterAuth(tiep: string | null, nav: ReturnType<typeof useNavigate>) {
  if (tiep === 'tao-dam-hieu') {
    const id = await createCaseFromDraft();
    nav(id ? `/dh/${id}/ho-so?moi=1` : '/app', { replace: true });
    return;
  }
  nav(tiep && tiep.startsWith('/') ? tiep : '/app', { replace: true });
}

/** Đã đăng nhập sẵn mà đang dở bước tạo đám hiếu: tạo luôn rồi đi tiếp */
function ContinueAfterAuth({ tiep }: { tiep: string }) {
  const nav = useNavigate();
  const once = useRef(false);
  useEffect(() => { if (!once.current) { once.current = true; void afterAuth(tiep, nav); } }, [tiep, nav]);
  return <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><p className="muted" style={{ textAlign: 'center' }}>Đang lưu đám hiếu…</p></div></div>;
}

function AuthFrame({ title, sub, children, foot }: { title: string; sub?: ReactNode; children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="bare"><div className="bare-inner" style={{ maxWidth: 440 }}>
      <Link to="/" style={{ textDecoration: 'none' }}><BrandLine /></Link>
      <div><h1 style={{ fontSize: 26 }}>{title}</h1>{sub && <p className="muted" style={{ marginTop: 6 }}>{sub}</p>}</div>
      {children}
      {foot}
    </div></div>
  );
}

/** Ô nhập mã OTP + gửi lại; bản chạy thử hiện mã ngay trên màn */
function OtpBox({ phone, purpose, code, setCode }: { phone: string; purpose: 'register' | 'reset' | 'phone'; code: string; setCode: (s: string) => void }) {
  const { toast } = useApp();
  const otp = usePlatform(s => s.otp);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <Banner kind="info" icon="bell">Mã gồm 6 số đã gửi tới <b className="num">{phone}</b>, dùng trong {OTP_TTL_MIN} phút.</Banner>
      {otp && <div className="banner upd"><Icon n="alert" /><div><b>Bản chạy thử:</b> chưa có bên gửi tin nhắn (giai đoạn 3). Mã của anh/chị là <b className="num" style={{ letterSpacing: 2 }}>{devOtpCode()}</b>.</div></div>}
      <div className="field"><label htmlFor="otp">Mã xác minh</label>
        <input className="input num" id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} style={{ fontSize: 22, letterSpacing: 6 }} /></div>
      <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => { const r = sendOtp(phone, purpose); if (r.error) setErr(r.error); else { setErr(null); toast('Đã gửi lại mã'); } }}>Gửi lại mã</button>
      <ErrorBanner err={err} />
    </div>
  );
}

export function RegisterPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tiep = params.get('tiep');
  const user = useUser();
  const [f, setF] = useState({ name: '', phone: '', pass: '', agree: false });
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (user && step === 'form' && !busy) return <Navigate to={tiep === 'tao-dam-hieu' ? `/dang-nhap?tiep=${tiep}` : '/app'} replace />;
  const fromEntry = tiep === 'tao-dam-hieu';

  const next = () => {
    if (!f.name.trim()) return setErr('Cần nhập họ tên.');
    if (f.pass.length < 8) return setErr('Mật khẩu cần tối thiểu 8 ký tự.');
    if (!f.agree) return setErr('Cần đồng ý Điều khoản sử dụng và Chính sách bảo mật.');
    if (REMOTE) { void done(); return; }
    const r = sendOtp(f.phone, 'register');
    if (r.error) return setErr(r.error);
    setErr(null); setStep('otp');
  };
  async function done() {
    setBusy(true);
    const e = await register(f.name, f.phone, f.pass, code);
    if (e) { setErr(e); setBusy(false); return; }
    await afterAuth(tiep, nav);
  }

  return (
    <AuthFrame title={step === 'form' ? 'Tạo tài khoản' : 'Xác minh số điện thoại'}
      sub={fromEntry ? 'Lưu lại để không mất những gì anh/chị vừa nhập. Câu trả lời đã được giữ nguyên.' : 'Để cả nhà cùng dùng và giữ dữ liệu của gia đình.'}
      foot={<p className="muted" style={{ textAlign: 'center' }}>Đã có tài khoản? <Link to={`/dang-nhap${tiep ? '?tiep=' + encodeURIComponent(tiep) : ''}`}>Đăng nhập</Link></p>}>
      {step === 'form' ? (<>
        <section className="card card-pad stack">
          <div className="field"><label htmlFor="rName">Họ tên</label><input className="input" id="rName" autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ví dụ: Nguyễn Minh Tuấn" /></div>
          <div className="field"><label htmlFor="rPhone">Số điện thoại</label><input className="input num" id="rPhone" inputMode="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="0912 345 678" /></div>
          <div className="field"><label htmlFor="rPass">Mật khẩu (tối thiểu 8 ký tự)</label><input className="input" id="rPass" type="password" autoComplete="new-password" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} /></div>
          <Consent checked={f.agree} onChange={v => setF({ ...f, agree: v })} />
          <ErrorBanner err={err} />
          <button className="btn primary block" disabled={busy} onClick={next}>{REMOTE ? (fromEntry ? 'Tạo tài khoản và lưu đám hiếu' : 'Tạo tài khoản') : 'Gửi mã xác minh'}</button>
        </section>
        {REMOTE && <GoogleBlock next={tiep ?? '/app'} />}
      </>) : (
        <section className="card card-pad stack">
          <OtpBox phone={f.phone} purpose="register" code={code} setCode={setCode} />
          <ErrorBanner err={err} />
          <button className="btn primary block" disabled={code.length !== 6 || busy} onClick={done}>{fromEntry ? 'Tạo tài khoản và lưu đám hiếu' : 'Tạo tài khoản'}</button>
          <button className="btn ghost block" onClick={() => { setStep('form'); setCode(''); setErr(null); }}>Sửa số điện thoại</button>
        </section>
      )}
    </AuthFrame>
  );
}

export function LoginPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tiep = params.get('tiep');
  const expired = params.get('het-phien') === '1';
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const user = useUser();
  const go = async () => {
    setBusy(true);
    const e = await login(phone, pass);
    if (e) { setErr(e); setBusy(false); return; }
    await afterAuth(tiep, nav);
  };
  if (user && !busy) {
    if (tiep === 'tao-dam-hieu') return <ContinueAfterAuth tiep={tiep} />;
    return <Navigate to={tiep && tiep.startsWith('/') ? tiep : '/app'} replace />;
  }
  return (
    <AuthFrame title="Đăng nhập" sub={tiep === 'tao-dam-hieu' ? 'Đăng nhập để lưu đám hiếu vừa tạo. Câu trả lời đã được giữ nguyên.' : undefined}
      foot={<p className="muted" style={{ textAlign: 'center' }}>Chưa có tài khoản? <Link to={`/dang-ky${tiep ? '?tiep=' + encodeURIComponent(tiep) : ''}`}>Tạo tài khoản</Link></p>}>
      {expired && <Banner kind="info" icon="lock"><b>Phiên đăng nhập đã hết.</b> Anh/chị đăng nhập lại — app đưa về đúng màn đang dở.</Banner>}
      <section className="card card-pad stack">
        <div className="field"><label htmlFor="lPhone">Số điện thoại</label><input className="input num" id="lPhone" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <div className="field"><label htmlFor="lPass">Mật khẩu</label><input className="input" id="lPass" type="password" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void go(); }} /></div>
        <ErrorBanner err={err} />
        <button className="btn primary block" disabled={busy} onClick={go}>Đăng nhập</button>
        <Link className="btn ghost block" to={`/quen-mat-khau${tiep ? '?tiep=' + encodeURIComponent(tiep) : ''}`}>Quên mật khẩu?</Link>
      </section>
      {REMOTE && <GoogleBlock next={tiep ?? '/app'} />}
    </AuthFrame>
  );
}

export function ForgotPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tiep = params.get('tiep');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const send = () => { const r = sendOtp(phone, 'reset'); if (r.error) setErr(r.error); else { setErr(null); setStep('otp'); } };
  const done = async () => {
    const e = await resetPassword(phone, code, pass);
    if (e) { setErr(e); return; }
    await afterAuth(tiep, nav);
  };
  if (REMOTE) return (
    <AuthFrame title="Lấy lại quyền vào tài khoản" foot={<p className="muted" style={{ textAlign: 'center' }}><Link to="/dang-nhap">Về đăng nhập</Link></p>}>
      <section className="card card-pad stack">
        <h3>Đã liên kết Google?</h3>
        <p className="muted">Bấm nút dưới để vào lại tài khoản, rồi đặt mật khẩu mới trong mục Tài khoản.</p>
        <GoogleBlock next={tiep ?? '/tai-khoan'} bare />
      </section>
      <section className="card card-pad stack">
        <h3>Chưa liên kết Google</h3>
        <p className="muted">Nhắn Zalo hoặc gọi hỗ trợ Trọn Hiếu. Người hỗ trợ sẽ <b>gọi vào đúng số điện thoại của tài khoản</b> để xác nhận, rồi cấp mật khẩu tạm. Anh/chị đăng nhập bằng mật khẩu tạm và đổi mật khẩu mới ngay.</p>
        <p>Hỗ trợ: <b>{SUPPORT.name}</b> — <span className="num">{fmtPhone(SUPPORT.phone)}</span></p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><a className="btn primary" href={`tel:${SUPPORT.phone}`}>Gọi {SUPPORT.name}</a><a className="btn" href={`https://zalo.me/${SUPPORT.phone}`} target="_blank" rel="noreferrer">Nhắn Zalo</a></div>
      </section>
    </AuthFrame>
  );
  return (
    <AuthFrame title="Lấy lại mật khẩu" sub="Nhập số điện thoại đã đăng ký, app gửi mã xác minh để đặt mật khẩu mới."
      foot={<p className="muted" style={{ textAlign: 'center' }}><Link to="/dang-nhap">Về đăng nhập</Link></p>}>
      <section className="card card-pad stack">
        {step === 'phone' ? <>
          <div className="field"><label htmlFor="fPhone">Số điện thoại</label><input className="input num" id="fPhone" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <ErrorBanner err={err} />
          <button className="btn primary block" onClick={send}>Gửi mã xác minh</button>
        </> : <>
          <OtpBox phone={phone} purpose="reset" code={code} setCode={setCode} />
          <div className="field"><label htmlFor="fPass">Mật khẩu mới (tối thiểu 8 ký tự)</label><input className="input" id="fPass" type="password" autoComplete="new-password" value={pass} onChange={e => setPass(e.target.value)} /></div>
          <ErrorBanner err={err} />
          <button className="btn primary block" disabled={code.length !== 6} onClick={done}>Đặt mật khẩu mới</button>
        </>}
      </section>
    </AuthFrame>
  );
}

/** Bảo vệ màn cần đăng nhập — hết phiên thì về đăng nhập rồi quay lại đúng màn (S-AUTH-04) */
export function RequireAuth({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const user = useUser();
  const loc = useLocation();
  const ready = usePlatform(s => s.ready);
  if (!ready) return <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><p className="muted" style={{ textAlign: 'center' }}>Đang tải…</p></div></div>;
  if (!user) {
    const exp = sessionExpired(getPlatform());
    return <Navigate to={`${admin ? '/admin/dang-nhap' : '/dang-nhap'}?${exp ? 'het-phien=1&' : ''}tiep=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }
  if (admin && !user.isAdmin) return <Navigate to="/admin/dang-nhap" replace />;
  // Vào bằng Google lần đầu: cần họ tên + số điện thoại trước khi dùng app
  if (REMOTE && !user.phone && !admin) return <Navigate to={`/hoan-tat?tiep=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}

/** Nút “Tiếp tục với Google” (bản thật) */
export function GoogleBlock({ next, bare, label = 'Tiếp tục với Google' }: { next: string; bare?: boolean; label?: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const btn = (
    <button className="btn block google-btn" disabled={busy} onClick={async () => { setBusy(true); const e = await signInWithGoogle(next); if (e) { setErr(e); setBusy(false); } }}>
      <GoogleG />{busy ? 'Đang mở Google…' : label}
    </button>
  );
  if (bare) return <>{btn}<ErrorBanner err={err} /></>;
  return (
    <section className="stack" style={{ gap: 10 }}>
      <div className="or-line"><span>hoặc</span></div>
      {btn}
      <ErrorBanner err={err} />
      <p className="note" style={{ textAlign: 'center' }}>Không cần nhớ mật khẩu. Lần đầu vào bằng Google, app hỏi thêm họ tên và số điện thoại.</p>
    </section>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/** Lần đầu vào bằng Google: xác nhận họ tên, thêm số điện thoại để người thân liên lạc */
export function CompleteProfilePage() {
  const user = useUser();
  const ready = usePlatform(s => s.ready);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tiep = params.get('tiep');
  const [f, setF] = useState({ name: user?.name ?? '', phone: '', agree: false });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!ready) return <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><p className="muted" style={{ textAlign: 'center' }}>Đang tải…</p></div></div>;
  if (!user) return <Navigate to="/dang-nhap" replace />;
  const go = async () => {
    if (!f.agree) { setErr('Cần đồng ý Điều khoản sử dụng và Chính sách bảo mật.'); return; }
    setBusy(true);
    const e = await completeProfile(f.name, f.phone);
    if (e) { setErr(e); setBusy(false); return; }
    await afterAuth(tiep, nav);
  };
  return (
    <AuthFrame title="Hoàn tất tài khoản" sub="Một lần duy nhất. Người thân trong đội thấy tên này; số điện thoại để mọi người gọi nhau khi cần.">
      <section className="card card-pad stack">
        {user.email && <p className="muted">Đang vào bằng Google: <b>{user.email}</b></p>}
        <div className="field"><label htmlFor="cName">Họ tên</label><input className="input" id="cName" autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="cPhone">Số điện thoại</label><input className="input num" id="cPhone" inputMode="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="0912 345 678" /></div>
        <Consent checked={f.agree} onChange={v => setF({ ...f, agree: v })} />
        <ErrorBanner err={err} />
        <button className="btn primary block" disabled={busy} onClick={go}>Tiếp tục</button>
      </section>
    </AuthFrame>
  );
}

/** Đồng ý khi tạo tài khoản — nói rõ có dữ liệu nhạy cảm (Điều 9 Luật Bảo vệ dữ liệu cá nhân 2025: đồng ý rõ ràng, cụ thể) */
function Consent({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="check"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>Tôi đồng ý <Link to="/dieu-khoan" target="_blank">Điều khoản sử dụng</Link> và <Link to="/bao-mat" target="_blank">Chính sách bảo mật</Link>, gồm việc xử lý dữ liệu nhạy cảm (nghi thức tôn giáo, dữ liệu tài chính) khi tôi tự nhập để lo việc của gia đình.</span></label>
  );
}
