import { useNavigate } from 'react-router-dom';
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

export function TaskRow({ t, why, acts = true, from }: { t: TaskView; why?: boolean; acts?: boolean; from: string }) {
  const { c, base, update, openSheet, me } = useCase();
  const { toast } = useApp();
  const nav = useNavigate();
  const open = useOpenTask();
  const o = memberOf(c, t.owner);
  const finished = t.status === 'done' || t.status === 'skip';
  return (
    <div className="row">
      <div className="grow">
        <button className="title" onClick={() => open(t.id, from)} style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', fontWeight: 500 }}>{t.title}</button>
        <div className="meta">
          <StatusPill s={t.status} />{t.lock && <LockPill />}
          <span><Icon n="now" c="sm" /> {t.due}</span>
          <span>{o ? o.name : <i>Chưa có người nhận</i>}</span>
        </div>
        {why && (
          <div className="meta">
            <KindPill k={t.kind} />{t.why && <span>Vì: {t.why}</span>}{t.area && <span><Icon n="team" c="sm" /> {t.area}</span>}
            {t.unverified && <span className="pill soft">Thủ tục chờ nguồn kiểm chứng</span>}
          </div>
        )}
        {t.status === 'issue' && t.issue && <div className="meta" style={{ color: 'var(--danger)' }}><Icon n="alert" c="sm" /> {t.issue}</div>}
        {t.status === 'skip' && t.skipReason && <div className="meta"><span>Không áp dụng: {t.skipReason}</span></div>}
        {acts && !finished && (
          <div className="acts">
            {!t.owner && <button className="btn sm" onClick={() => { update(d => takeTask(d, t.id, me.id)); toast('Đã nhận: ' + t.title); }}>Tôi làm</button>}
            <button className="btn sm" onClick={() => openSheet({ type: 'assign', taskId: t.id })}>{t.owner ? 'Giao lại' : 'Nhờ người khác'}</button>
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
