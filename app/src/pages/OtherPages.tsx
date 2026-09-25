// Danh sách đám hiếu trên thiết bị (/app) · S-TEAM-06 Link User (/l/:token) · trang chờ giai đoạn sau
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CaseData, Member } from '../domain/types';
import { completeTask, reportIssue, startTask } from '../domain/actions';
import { U1_ID, visibleTasks, VENUE_LABEL } from '../domain/model';
import { repo, type CaseSummary } from '../repo/repo';
import { DN } from '../case/CaseContext';
import { Icon } from '../ui/Icon';
import { Banner, StatusPill, useApp } from '../ui/common';

export function HomePage() {
  const [list, setList] = useState<CaseSummary[] | null>(null);
  const nav = useNavigate();
  useEffect(() => { repo.list().then(setList); }, []);
  return (
    <div className="bare"><div className="bare-inner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)' }}><Icon n="lotus" /><h1 style={{ fontSize: 24, color: 'var(--text)' }}>Đám hiếu của tôi</h1></div>
      {list === null ? <p className="muted">Đang tải…</p> : list.length ? (
        <section className="card"><div className="list">{list.map(x => (
          <button key={x.id} className="row" onClick={() => nav(`/dh/${x.id}`)}><Icon n="lotus" />
            <div className="grow"><div className="title">Đám hiếu {x.name}</div><div className="meta"><span>Tạo lúc {new Date(x.createdAt).toLocaleString('vi-VN')}</span></div></div>
            <Icon n="chev" c="chev" /></button>
        ))}</div></section>
      ) : <div className="empty"><span>Chưa có đám hiếu nào trên thiết bị này.</span></div>}
      <p className="note">Hồ sơ chuẩn bị trước và đăng nhập nhiều thiết bị mở ở các giai đoạn sau.</p>
    </div>
    <div className="bare-foot"><Link className="btn primary block" to="/">Bắt đầu đám hiếu mới</Link></div></div>
  );
}

export function LinkPage() {
  const { token = '' } = useParams();
  const { toast } = useApp();
  const [st, setSt] = useState<{ c: CaseData; member: Member } | null | undefined>(undefined);
  const [issueFor, setIssueFor] = useState<string | null>(null);
  const [issue, setIssue] = useState('');
  useEffect(() => { repo.findByLinkToken(token).then(setSt); }, [token]);

  if (st === undefined) return <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><p className="muted" style={{ textAlign: 'center' }}>Đang mở…</p></div></div>;
  if (st === null) return (
    <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}><div className="empty"><Icon n="link" c="lg" />
      <h2 style={{ color: 'var(--text)' }}>Link này không còn dùng được</h2>
      <p>Người đại diện gia đình đã thu hồi hoặc link đã hết hạn. Bác liên hệ người đại diện gia đình để nhận link mới.</p></div></div></div>
  );
  const { c, member } = st;
  const u1 = c.members.find(m => m.id === U1_ID)!;
  const mine = visibleTasks(c).filter(t => t.owner === member.id && t.status !== 'skip');
  const act = async (fn: (d: CaseData) => void, msg: string) => {
    const next = structuredClone(c);
    fn(next);
    await repo.save(next);
    setSt({ c: next, member });
    toast(msg);
  };
  return (
    <div className="bare"><div className="bare-inner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)' }}><Icon n="lotus" /><span className="muted">Đám hiếu {DN(c)}</span></div>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 19 }}><b>{u1.name}</b> nhờ {member.name}:</p>
      {mine.length === 0 && <div className="empty"><Icon n="check" c="lg" /><span>Hiện chưa có việc nào được nhờ. Khi gia đình giao việc, việc sẽ hiện ở đây.</span></div>}
      {mine.map(t => (
        <section key={t.id} className="card card-pad stack" style={{ gap: 10 }}>
          <h1 style={{ fontSize: 23 }}>{t.title}</h1>
          <dl className="kv"><dt>Hạn</dt><dd>{t.due}</dd><dt>Nơi làm lễ</dt><dd>{VENUE_LABEL[c.situation.venue]}</dd>{t.assignNote && <><dt>Lời nhắn</dt><dd>{t.assignNote}</dd></>}{t.note && <><dt>Ghi chú</dt><dd>{t.note}</dd></>}</dl>
          <div><StatusPill s={t.status} /></div>
          {t.status === 'issue' && t.issue && <Banner kind="warn">Đã báo vấn đề: {t.issue}</Banner>}
          {issueFor === t.id ? (
            <div className="stack" style={{ gap: 8 }}>
              <div className="field"><label htmlFor="issueTxt">Gặp vấn đề gì?</label><textarea className="input" id="issueTxt" value={issue} onChange={e => setIssue(e.target.value)} placeholder="Ví dụ: Nhà văn hóa chỉ còn 12 ghế." /></div>
              <button className="btn primary" disabled={!issue.trim()} onClick={() => { void act(d => reportIssue(d, t.id, issue, member.name), 'Đã gửi cho ' + u1.name); setIssueFor(null); setIssue(''); }}>Gửi cho {u1.name}</button>
            </div>
          ) : t.status === 'done'
            ? <Banner kind="info" icon="check">Đã báo xong. Cảm ơn {member.name}.</Banner>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {t.status === 'todo'
                  ? <button className="btn primary block" onClick={() => void act(d => startTask(d, t.id), 'Đã báo gia đình: đã nhận việc')}>Nhận việc</button>
                  : <button className="btn primary block" onClick={() => void act(d => completeTask(d, t.id, { checksOk: true }), 'Đã báo gia đình: việc đã xong')} disabled={t.lock}><Icon n="check" c="sm" />Đã xong</button>}
                {t.lock && t.status !== 'todo' && <p className="muted">Việc không thể quay lại — người đại diện gia đình xác nhận.</p>}
                {t.status !== 'issue' && <button className="btn block" onClick={() => setIssueFor(t.id)}>Báo vấn đề</button>}
              </div>}
        </section>
      ))}
      <p className="muted">Không cần cài ứng dụng. Chỉ thấy việc được nhờ.</p>
    </div></div>
  );
}

export function LaterPage({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="page"><div className="page-title"><div><h1>{title}</h1><p>Phần này mở ở giai đoạn {phase}</p></div></div>
      <section className="card card-pad"><div className="empty"><Icon n="settings" c="lg" /><span>Đang xây ở giai đoạn {phase}. Bản mẫu đã duyệt của màn này nằm trong tệp bản mẫu.</span></div></section>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="bare"><div className="bare-inner" style={{ justifyContent: 'center' }}>
      <div className="empty"><Icon n="alert" c="lg" /><h2 style={{ color: 'var(--text)' }}>Không tìm thấy trang</h2></div>
      <Link className="btn primary block" to="/">Về trang đầu</Link></div></div>
  );
}
