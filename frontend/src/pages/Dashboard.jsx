import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import ItemTag from '../components/ItemTag.jsx';
import { ErrorNote, Loading } from '../components/Feedback.jsx';
import { formatDateTime } from '../util.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.myItems(), api.claimsReceived(), api.requestsReceived(), api.requestsSent(), api.items({ status: 'OPEN' })])
      .then(([mine, claims, received, sent, recent]) => setData({ mine, claims, received, sent, recent: recent.slice(0, 4) }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;

  const pendingClaims = data.claims.filter((c) => c.status === 'PENDING');
  const pendingRequests = data.received.filter((r) => r.status === 'PENDING');
  const upcoming = [...data.received, ...data.sent]
    .filter((r) => r.status === 'ACCEPTED' && r.sessionTime)
    .sort((a, b) => new Date(a.sessionTime) - new Date(b.sessionTime));
  const openItems = data.mine.filter((i) => i.status === 'OPEN');

  const todo = [];
  if (pendingClaims.length) todo.push({ to: '/items/mine', text: `${pendingClaims.length} claim${pendingClaims.length > 1 ? 's' : ''} on your items to review` });
  if (pendingRequests.length) todo.push({ to: '/requests', text: `${pendingRequests.length} skill request${pendingRequests.length > 1 ? 's' : ''} waiting for your reply` });
  upcoming.forEach((r) => todo.push({ to: '/requests', text: `${r.skillName} session on ${formatDateTime(r.sessionTime)} at ${r.sessionPlace}` }));

  return (
    <div className="page">
      <header className="page-head">
        <h1>Hello, {user.name.split(' ')[0]}</h1>
        <div className="page-actions">
          <Link className="btn btn-lost" to="/items/report?type=LOST">I lost something</Link>
          <Link className="btn btn-found" to="/items/report?type=FOUND">I found something</Link>
        </div>
      </header>

      <section className="panel">
        <h2>Needs your attention</h2>
        {todo.length === 0 ? (
          <p className="muted">Nothing waiting on you. You have {openItems.length} open report{openItems.length === 1 ? '' : 's'}.</p>
        ) : (
          <ul className="todo">
            {todo.map((t, i) => <li key={i}><Link to={t.to}>{t.text}</Link></li>)}
          </ul>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Recently reported</h2>
          <Link to="/items">See all items</Link>
        </div>
        {data.recent.length === 0
          ? <p className="muted">No open items yet. Reports from your campus will show up here.</p>
          : <div className="tag-grid">{data.recent.map((i) => <ItemTag key={i.id} item={i} />)}</div>}
      </section>

      <section className="panel panel-split">
        <div>
          <h2>Share a skill</h2>
          <p className="muted">List what you can teach and what you'd like to learn, so classmates can find you.</p>
        </div>
        <div className="row-gap">
          <Link className="btn btn-primary" to="/skills/mine">Add my skills</Link>
          <Link className="btn btn-quiet" to="/skills">Find a teacher</Link>
        </div>
      </section>
    </div>
  );
}
