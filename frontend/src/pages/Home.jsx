import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatDateTime } from '../util.js';

/** The main page after login: two choices, plus anything waiting on the student. */
export default function Home() {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    Promise.all([api.items({ status: 'OPEN' }), api.skills({ kind: 'TEACH' }), api.claimsReceived(), api.requestsReceived(), api.requestsSent()])
      .then(([items, skills, claims, received, sent]) => setInfo({ items, skills, claims, received, sent }))
      .catch(() => setInfo(null));
  }, []);

  const todo = [];
  if (info) {
    const c = info.claims.filter((x) => x.status === 'PENDING').length;
    const r = info.received.filter((x) => x.status === 'PENDING').length;
    if (c) todo.push({ to: '/items/mine', text: `${c} claim${c > 1 ? 's' : ''} on your items to review` });
    if (r) todo.push({ to: '/requests', text: `${r} skill request${r > 1 ? 's' : ''} waiting for your reply` });
    [...info.received, ...info.sent]
      .filter((x) => x.status === 'ACCEPTED' && x.sessionTime)
      .sort((a, b) => new Date(a.sessionTime) - new Date(b.sessionTime))
      .forEach((x) => todo.push({ to: '/requests', text: `${x.skillName} session, ${formatDateTime(x.sessionTime)}, ${x.sessionPlace}` }));
  }

  return (
    <div className="home">
      <h1 className="home-hello">Hi {user.name.split(' ')[0]}, what do you need today?</h1>

      <div className="choices">
        <Link to="/lost-found" className="choice choice-red">
          <span className="choice-title">Lost &amp; Found</span>
          <span className="choice-text">Report something you lost or found on campus, and get it back to its owner.</span>
          <span className="choice-foot">
            {info ? `${info.items.length} item${info.items.length === 1 ? '' : 's'} waiting to be claimed` : 'Open'}
          </span>
        </Link>
        <Link to="/skill-exchange" className="choice choice-black">
          <span className="choice-title">Skill Exchange</span>
          <span className="choice-text">Teach what you know, learn what you don't, from students on your campus.</span>
          <span className="choice-foot">
            {info ? `${info.skills.length} skill${info.skills.length === 1 ? '' : 's'} on offer` : 'Open'}
          </span>
        </Link>
      </div>

      {todo.length > 0 && (
        <section className="attention">
          <h2>Waiting on you</h2>
          <ul>{todo.map((t, i) => <li key={i}><Link to={t.to}>{t.text}</Link></li>)}</ul>
        </section>
      )}
    </div>
  );
}
