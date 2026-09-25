// /checkout — S-CHK-01 Chọn gói · S-CHK-02 Chuyển khoản / QR · S-CHK-03 Chờ xác nhận · S-CHK-04 Thành công · S-CHK-05 Hết hạn / lỗi
// Phase 2: trạng thái giả lập, CHƯA THANH TOÁN THẬT. Phase 4 nối webhook SePay trên máy chủ, giữ nguyên các màn.
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { CaseData } from '../domain/types';
import { money } from '../domain/finance';
import { isExpired, isFull, type ProductId } from '../domain/platform';
import { DN_TEXT } from '../domain/text';
import { repo } from '../repo/repo';
import { expireOrders, placeOrder, simulateBankTx, usePlatform, useUser } from '../repo/platformStore';
import { Icon } from '../ui/Icon';
import { Banner, ErrorBanner, useApp } from '../ui/common';

function Frame({ children, foot }: { children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="bare"><div className="bare-inner" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}><Icon n="lotus" /><b style={{ fontFamily: 'var(--serif)' }}>Đám Hiếu</b><span className="muted" style={{ marginLeft: 'auto' }}>Thanh toán</span></div>
      <Banner kind="upd" icon="alert"><b>Bản chạy thử — chưa thanh toán thật.</b> Đơn và trạng thái thanh toán đang giả lập; không chuyển tiền thật ở giai đoạn này.</Banner>
      {children}
    </div>{foot && <div className="bare-foot">{foot}</div>}</div>
  );
}

/** S-CHK-01 */
export function CheckoutPage() {
  const [q] = useSearchParams();
  const nav = useNavigate();
  const user = useUser()!;
  const goi = (q.get('goi') === 'pre' ? 'pre' : 'full') as ProductId;
  const caseId = q.get('dh'), preId = q.get('cb'), ve = q.get('ve') ?? undefined;
  const p = usePlatform(s => s.products.find(x => x.id === goi))!;
  const pre = usePlatform(s => s.preNeeds.find(x => x.id === preId));
  const [c, setC] = useState<CaseData | null | undefined>(caseId ? undefined : null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (caseId) repo.get(caseId).then(setC); }, [caseId]);

  const target = goi === 'full' && c ? { kind: 'case' as const, id: c.id, name: `Đám hiếu ${DN_TEXT(c)}` }
    : goi === 'pre' && pre ? { kind: 'pre' as const, id: pre.id, name: `Hồ sơ chuẩn bị ${pre.subject.name || ''}`.trim() } : null;
  const member = c?.members.find(m => m.userId === user.id);
  const allowed = goi === 'pre' ? pre?.ownerId === user.id : !!member && (member.access === 'full');
  const already = goi === 'full' ? !!c && isFull(c) : !!pre?.paid;

  if (c === undefined) return <Frame><p className="muted">Đang tải…</p></Frame>;
  if (!target) return <Frame><div className="empty"><span>Chưa rõ gói áp dụng cho đám hiếu hay hồ sơ nào.</span><Link className="btn" to="/app">Về trang chủ</Link></div></Frame>;

  const create = () => {
    const r = placeOrder(goi, target, ve);
    if (r.error) { setErr(r.error); return; }
    nav(`/checkout/don/${r.order!.code}`, { replace: true });
  };
  return (
    <Frame foot={already ? <button className="btn primary block" onClick={() => nav(ve ?? '/app')}>Quay lại</button>
      : <><button className="btn" onClick={() => nav(-1)}>Để sau</button><button className="btn primary" style={{ flex: 1 }} disabled={!allowed || !p.active} onClick={create}>Tạo đơn và thanh toán</button></>}>
      <h1 style={{ fontSize: 24 }}>Chọn gói</h1>
      {already && <Banner kind="info" icon="check">{goi === 'full' ? 'Đám hiếu này đã được mở đầy đủ.' : 'Hồ sơ này đã mở gói.'}</Banner>}
      <section className="card card-pad stack" style={{ gap: 10 }}>
        <div className="eyebrow">Gói</div><h2 style={{ fontSize: 20 }}>{p.name}</h2>
        <p className="muted">{p.desc}</p>
        <dl className="kv"><dt>Áp dụng cho</dt><dd>{target.name}</dd><dt>Thời hạn</dt><dd>{p.duration}</dd><dt>Số tiền</dt><dd className="num" style={{ fontSize: 20, fontWeight: 600 }}>{money(p.price)}</dd><dt>Người trả</dt><dd>{user.name}</dd></dl>
      </section>
      {!p.active && <Banner kind="warn">Gói đang tạm ngừng bán.</Banner>}
      {!allowed && !already && <Banner kind="warn">{goi === 'full' ? 'Chỉ thành viên Đầy đủ của đám hiếu này mới mở gói được.' : 'Chỉ người lập hồ sơ mới mở gói được.'}</Banner>}
      <ErrorBanner err={err} />
      <p className="note">Trả một lần, không tự gia hạn. Hoàn tiền xử lý tay theo <Link to="/dieu-khoan">Điều khoản sử dụng</Link>.</p>
    </Frame>
  );
}

function CopyLine({ label, value, big }: { label: string; value: string; big?: boolean }) {
  const { toast } = useApp();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}><div className="muted" style={{ fontSize: 13 }}>{label}</div><div className="num" style={{ fontWeight: 600, fontSize: big ? 20 : 16, wordBreak: 'break-all' }}>{value || '—'}</div></div>
      {value && <button className="btn sm" onClick={async () => { try { await navigator.clipboard.writeText(value); toast('Đã sao chép ' + label.toLowerCase()); } catch { toast('Không sao chép được — chọn và sao chép thủ công'); } }}><Icon n="copy" c="sm" />Sao chép</button>}
    </div>
  );
}

/** S-CHK-02 → 03 → 04 / 05 theo trạng thái đơn */
export function OrderPage() {
  const { code = '' } = useParams();
  const nav = useNavigate();
  const user = useUser()!;
  const o = usePlatform(s => s.orders.find(x => x.code === code));
  const acct = usePlatform(s => s.settings.sepay.account);
  const [waiting, setWaiting] = useState(false);
  useEffect(() => { expireOrders(); const t = setInterval(() => expireOrders(), 30000); return () => clearInterval(t); }, []);
  if (!o || o.userId !== user.id) return <Frame><div className="empty"><span>Không tìm thấy đơn {code}.</span><Link className="btn" to="/tai-khoan">Về tài khoản</Link></div></Frame>;

  const back = o.returnTo ?? (o.target.kind === 'case' ? `/dh/${o.target.id}` : `/chuan-bi/${o.target.id}`);
  const again = o.target.kind === 'case' ? `/checkout?goi=full&dh=${o.target.id}&ve=${encodeURIComponent(back)}` : `/checkout?goi=pre&cb=${o.target.id}&ve=${encodeURIComponent(back)}`;

  if (o.status === 'paid') return (
    <Frame foot={<button className="btn primary block" onClick={() => nav(back)}>{o.target.kind === 'case' ? 'Về đúng phần đang cần dùng' : 'Về hồ sơ chuẩn bị'}</button>}>
      <div className="empty" style={{ padding: '24px 0' }}><Icon n="check" c="lg" /><h1 style={{ fontSize: 24, color: 'var(--text)' }}>Đã mở đầy đủ</h1>
        <p>{o.productName} — {o.target.name}. Mã đơn <b className="num">{o.code}</b>.</p></div>
    </Frame>
  );
  if (o.status !== 'pending' || isExpired(o)) return (
    <Frame foot={<><Link className="btn" to="/tai-khoan">Liên hệ hỗ trợ</Link><button className="btn primary" style={{ flex: 1 }} onClick={() => nav(again)}>Tạo đơn mới</button></>}>
      <div className="empty" style={{ padding: '24px 0' }}><Icon n="alert" c="lg" /><h1 style={{ fontSize: 22, color: 'var(--text)' }}>{o.status === 'refunded' ? 'Đơn đã hoàn tiền' : o.status === 'failed' ? 'Đơn gặp lỗi' : 'Đơn đã hết hạn'}</h1>
        <p>Nếu anh/chị đã chuyển khoản cho đơn <b className="num">{o.code}</b>, đừng chuyển lại — liên hệ hỗ trợ kèm mã đơn để được kiểm tra.</p></div>
    </Frame>
  );

  const content = o.code;
  const qr = acct.number && acct.bank ? `https://qr.sepay.vn/img?acc=${encodeURIComponent(acct.number)}&bank=${encodeURIComponent(acct.bank)}&amount=${o.amount}&des=${encodeURIComponent(content)}` : null;
  const left = Math.max(0, new Date(o.expiresAt).getTime() - Date.now());
  return (
    <Frame foot={<button className="btn primary block" onClick={() => setWaiting(true)} disabled={waiting}>{waiting ? 'Đang chờ ngân hàng báo…' : 'Tôi đã chuyển khoản'}</button>}>
      <h1 style={{ fontSize: 24 }}>{waiting ? 'Đang chờ xác nhận' : 'Chuyển khoản hoặc quét mã QR'}</h1>
      {waiting && <Banner kind="info" icon="refresh">App tự cập nhật khi ngân hàng báo có tiền. Anh/chị có thể rời màn này — quay lại ở <b>Tài khoản → Lịch sử đơn hàng</b> vẫn thấy trạng thái.</Banner>}
      <section className="card card-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {qr ? <img src={qr} alt={`Mã QR chuyển ${money(o.amount)} cho đơn ${o.code}`} style={{ width: 240, height: 240, borderRadius: 12, background: '#fff' }} />
          : <div className="portrait" style={{ width: 200, height: 200 }}><Icon n="alert" c="lg" /></div>}
        {!qr && <p className="muted" style={{ textAlign: 'center' }}>Mã QR hiện khi Admin cài tài khoản ngân hàng nhận.</p>}
        <p className="muted" style={{ textAlign: 'center' }}>Mở app ngân hàng → quét mã, hoặc chụp màn hình rồi chọn ảnh QR.</p>
      </section>
      <section className="card card-pad">
        <CopyLine label="Số tiền" value={money(o.amount)} big />
        <CopyLine label="Nội dung chuyển khoản" value={content} big />
        <CopyLine label="Số tài khoản" value={acct.number} />
        <CopyLine label="Ngân hàng" value={acct.bank} />
        <CopyLine label="Chủ tài khoản" value={acct.holder} />
      </section>
      <Banner kind="warn">Ghi <b>đúng nội dung {content}</b> và <b>đúng số tiền</b> để app tự mở gói. Đơn giữ trong {Math.floor(left / 3600000)} giờ {Math.floor(left % 3600000 / 60000)} phút.</Banner>
      <SimPanel code={o.code} amount={o.amount} />
    </Frame>
  );
}

/** Chỉ bản chạy thử: giả lập SePay báo giao dịch để thử đủ các trạng thái */
function SimPanel({ code, amount }: { code: string; amount: number }) {
  const { toast } = useApp();
  const [n, setN] = useState(1);
  const send = async (amt: number, content: string, label: string) => {
    const r = await simulateBankTx({ providerTxId: `SIM-${code}-${n}`, amount: amt, content });
    setN(n + 1);
    toast(r.tx.status === 'matched' ? 'Giả lập: đã khớp giao dịch' : `Giả lập: ${label} — vào Giao dịch chưa khớp`);
  };
  return (
    <details className="card card-pad"><summary style={{ cursor: 'pointer', fontWeight: 500 }}>Giả lập thanh toán (chỉ bản chạy thử)</summary>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        <button className="btn sm" onClick={() => send(amount, `CK ${code}`, 'đúng')}>Ngân hàng báo: đúng tiền, đúng nội dung</button>
        <button className="btn sm" onClick={() => send(amount - 10000, `CK ${code}`, 'thiếu tiền')}>Báo: thiếu tiền</button>
        <button className="btn sm" onClick={() => send(amount, 'chuyen tien dam hieu', 'thiếu mã đơn')}>Báo: thiếu mã đơn</button>
      </div>
      <p className="note" style={{ marginTop: 8 }}>Phase 4 thay bằng webhook SePay đã xác thực trên máy chủ; luật khớp giữ nguyên.</p>
    </details>
  );
}
