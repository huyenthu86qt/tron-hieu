import { useLocation, useNavigate } from 'react-router-dom';
import type { DecisionView, TaskView } from '../domain/model';
import { takeTask } from '../domain/actions';
import { Icon } from '../ui/Icon';
import { KindPill, LockPill, StatusPill, useApp } from '../ui/common';
import { memberOf, useCase } from './CaseContext';

/** Mở chi tiết việc, nhớ màn đang đứng để nút Quay lại / danh sách bên trái đúng ngữ cảnh */
export function useOpenTask() {
  const nav = useNavigate();
  const { base } = useCase();
  return (id: string, from: string) => nav(`${base}/viec/${id}`, { state: { from } });
}

/** Sau khi xong một việc ở màn chi tiết: quay về đúng danh sách đang làm (Bây giờ, Bản đồ, Việc của tôi) */
export function useBackToList() {
  const nav = useNavigate();
  const loc = useLocation();
  const { base } = useCase();
  return () => {
    if (!loc.pathname.includes('/viec/')) return;
    const from = (loc.state as { from?: string } | null)?.from ?? 'ban-do';
    nav(from === '' ? base : `${base}/${from}`);
  };
}

export function TaskRow({ t, why, acts = true, from }: { t: TaskView; why?: boolean; acts?: boolean; from: string }) {
  const { base, update, openSheet, me } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const open = useOpenTask();
  const finished = t.status === 'done' || t.status === 'skip';
  const mine = !!t.owner && t.owner === me.id;
  return (
    <div className={mine ? 'row mine' : 'row'}>
      <div className="grow">
        <button className="title" onClick={() => open(t.id, from)} style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', fontWeight: 500 }}>{t.title}</button>
        <div className="meta">
          <StatusPill s={t.status} />{t.lock && <LockPill />}
          <span><Icon n="now" c="sm" /> {t.due}</span>
          <OwnerPill owner={t.owner} status={t.status} />
        </div>
        {why && (
          <div className="meta">
            <KindPill k={t.kind} />{t.why && <span>Vì: {t.why}</span>}{t.area && <span><Icon n="team" c="sm" /> {t.area}</span>}
            {t.unverified && <span className="pill soft">Hướng dẫn chi tiết đang bổ sung</span>}
          </div>
        )}
        {t.status === 'issue' && t.issue && <div className="meta" style={{ color: 'var(--danger)' }}><Icon n="alert" c="sm" /> {t.issue}</div>}
        {t.status === 'skip' && t.skipReason && <div className="meta"><span>Không áp dụng: {t.skipReason}</span></div>}
        {acts && !finished && (
          <div className="acts">
            {!t.owner && <button className="btn sm" onClick={() => { update(d => takeTask(d, t.id, me.id)); toast('Đã nhận: ' + t.title); }}>Tôi làm</button>}
            <button className="btn sm" onClick={() => openSheet({ type: 'assign', taskId: t.id })}>{t.owner ? 'Giao lại' : 'Nhờ người khác'}</button>
            {mine && <button className="btn sm ghost" onClick={() => openSheet({ type: 'return', taskId: t.id })}>Trả lại việc</button>}
            <button className="btn sm ghost" onClick={() => open(t.id, from)}>Chi tiết</button>
            {t.go && <button className="btn sm ghost" onClick={() => nav(`${base}/${t.go}`)}>Mở màn liên quan</button>}
          </div>
        )}
      </div>
    </div>
  );
}

export function DecRow({ d, current }: { d: DecisionView; current?: boolean }) {
  const nav = useNavigate();
  const { base } = useCase();
  return (
    <button className="row" onClick={() => nav(`${base}/quyet-dinh/${d.id}`)} style={current ? { background: 'var(--primary-soft)' } : undefined}>
      <span className="num-badge"><Icon n={d.kind === 'org' ? 'team' : d.kind === 'vendor' ? 'vendor' : 'decide'} c="sm" /></span>
      <div className="grow">
        <div className="title">{d.title}</div>
        <div className="meta">
          {d.status === 'pending'
            ? <span className="pill wait">{d.kind === 'org' ? 'Ban lễ tang đề xuất · cần gia đình xác nhận' : 'Cần quyết'}</span>
            : <span className="pill done">Đã quyết</span>}
          {d.lock && <LockPill />}{d.due && d.status === 'pending' && <span>{d.due}</span>}{d.from && <span>Từ: {d.from}</span>}
        </div>
      </div>
      <Icon n="chev" c="chev" />
    </button>
  );
}

/** Nhãn người phụ trách: Việc của tôi (nâu đậm) · tên người khác (be) · Chưa có người nhận (cam đất, cần chú ý).
 *  Việc đã xong / không áp dụng mà không ai nhận thì không cảnh báo nữa. */
export function OwnerPill({ owner, status }: { owner: string | null | undefined; status?: string }) {
  const { c, me } = useCase();
  if (!owner && (status === 'done' || status === 'skip')) return null;
  if (owner && owner === me.id) return <span className="pill mine"><Icon n="user" c="sm" />Việc của tôi</span>;
  const o = owner ? memberOf(c, owner) : null;
  if (o) return <span className="pill owner"><Icon n="user" c="sm" />{o.name}</span>;
  return <span className="pill nobody"><Icon n="alert" c="sm" />Chưa có người nhận</span>;
}
