// S-AUTH-01 Đăng ký · S-AUTH-02 Đăng nhập · S-AUTH-03 Quên mật khẩu · S-AUTH-04 Hết phiên
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { createCase } from '../domain/model';
import { normalizeCase } from '../domain/normalize';
import { OTP_TTL_MIN } from '../domain/platform';
import { clearDraft, loadDraft, repo } from '../repo/repo';
import {
  currentUser, devOtpCode, getPlatform, login, register, resetPassword, sendOtp, sessionExpired, usePlatform, useUser,
} from '../repo/platformStore';
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
    const r = sendOtp(f.phone, 'register');
    if (r.error) return setErr(r.error);
    setErr(null); setStep('otp');
  };
  const done = async () => {
    setBusy(true);
    const e = await register(f.name, f.phone, f.pass, code);
    if (e) { setErr(e); setBusy(false); return; }
    await afterAuth(tiep, nav);
  };

  return (
    <AuthFrame title={step === 'form' ? 'Tạo tài khoản' : 'Xác minh số điện thoại'}
      sub={fromEntry ? 'Lưu lại để không mất những gì anh/chị vừa nhập. Câu trả lời đã được giữ nguyên.' : 'Để cả nhà cùng dùng và giữ dữ liệu của gia đình.'}
      foot={<p className="muted" style={{ textAlign: 'center' }}>Đã có tài khoản? <Link to={`/dang-nhap${tiep ? '?tiep=' + encodeURIComponent(tiep) : ''}`}>Đăng nhập</Link></p>}>
      {step === 'form' ? (
        <section className="card card-pad stack">
          <div className="field"><label htmlFor="rName">Họ tên</label><input className="input" id="rName" autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ví dụ: Nguyễn Minh Tuấn" /></div>
          <div className="field"><label htmlFor="rPhone">Số điện thoại</label><input className="input num" id="rPhone" inputMode="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="0912 345 678" /></div>
          <div className="field"><label htmlFor="rPass">Mật khẩu (tối thiểu 8 ký tự)</label><input className="input" id="rPass" type="password" autoComplete="new-password" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} /></div>
          <label className="check"><input type="checkbox" checked={f.agree} onChange={e => setF({ ...f, agree: e.target.checked })} /><span>Tôi đồng ý <Link to="/dieu-khoan" target="_blank">Điều khoản sử dụng</Link> và <Link to="/bao-mat" target="_blank">Chính sách bảo mật</Link></span></label>
          <ErrorBanner err={err} />
          <button className="btn primary block" onClick={next}>Gửi mã xác minh</button>
        </section>
      ) : (
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
  if (!user) {
    const exp = sessionExpired(getPlatform());
    return <Navigate to={`${admin ? '/admin/dang-nhap' : '/dang-nhap'}?${exp ? 'het-phien=1&' : ''}tiep=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }
  if (admin && !user.isAdmin) return <Navigate to="/admin/dang-nhap" replace />;
  return <>{children}</>;
}
