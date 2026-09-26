// S-TEAM-01 · Đội đám hiếu
import { initials } from '../../domain/actions';
import { visibleTasks } from '../../domain/model';
import { Icon } from '../../ui/Icon';
import { useApp } from '../../ui/common';
import { ACCESS_LABEL, useCase } from '../CaseContext';

export function TeamPage() {
  const { c, openSheet } = useCase();
  const { mobile } = useApp();
  const open = (id: string) => visibleTasks(c).filter(t => t.owner === id && t.status !== 'done' && t.status !== 'skip').length;
  const people = c.members;
  const body = mobile ? (
    <section className="card"><div className="list">{people.map(m => (
      <button key={m.id} className="row" onClick={() => openSheet({ type: 'member', id: m.id })}>
        <div className="who" style={{ flex: 1, alignItems: 'flex-start' }}><span className="av">{initials(m.name)}</span>
          <div className="grow"><div className="title">{m.name}</div>
            <div className="meta"><span>{m.rel}</span><span className="pill soft">{ACCESS_LABEL[m.access]}</span>{m.inviteToken && <span className="pill wait">Chờ nhận lời mời</span>}</div>
            <div className="meta">{m.areas.join(' · ') || 'Chưa có vùng'} · {open(m.id)} việc đang mở</div></div></div>
        <Icon n="chev" c="chev" />
      </button>
    ))}</div></section>
  ) : (
    <section className="card" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Người</th><th>Vai trò</th><th>Tham gia</th><th>Vùng trách nhiệm</th><th className="num">Việc đang mở</th><th /></tr></thead>
      <tbody>{people.map(m => (
        <tr key={m.id}>
          <td><div className="who"><span className="av">{initials(m.name)}</span><div><div style={{ fontWeight: 500 }}>{m.name}</div><div className="muted">{m.rel}</div></div></div></td>
          <td>{m.role}</td><td><span className="pill soft">{ACCESS_LABEL[m.access]}</span>{m.inviteToken && <span className="pill wait">Chờ nhận lời mời</span>}</td><td>{m.areas.join(', ') || '—'}</td>
          <td className="num">{open(m.id)}</td><td><button className="btn sm" onClick={() => openSheet({ type: 'member', id: m.id })}>Sửa</button></td>
        </tr>
      ))}</tbody></table></section>
  );
  return (
    <div className="page">
      <div className="page-title"><div><h1>Đội đám hiếu</h1><p>Ai đang giúp và lo phần nào — mỗi người chỉ thấy phần của mình</p></div>
        <div className="actions"><button className="btn primary" onClick={() => openSheet({ type: 'invite' })}><Icon n="plus" c="sm" />Mời người hỗ trợ</button></div></div>
      {body}
      {c.members.length === 1 && <p className="muted">Mới có người đại diện. Mời các con, cháu, hàng xóm để cùng chia việc — người không cài app có thể nhận việc qua link.</p>}
      <section className="card card-pad"><div className="sec-h" style={{ marginBottom: 6 }}><h3>Vùng trách nhiệm</h3><button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => openSheet({ type: 'areas' })}>Sửa vùng</button></div>
        <div className="chips">{c.areas.map(a => <span key={a} className="chip">{a} <span className="muted">· {c.members.filter(m => m.areas.includes(a)).length} người</span></span>)}</div>
      </section>
    </div>
  );
}
