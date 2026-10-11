import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Avatar from '../components/Avatar.jsx';
import { IconPeople, IconPlus, IconSwap, IconUser } from '../components/Icons.jsx';

export default function SkillHub() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([api.skills({ kind: 'TEACH' }), api.mySkills(), api.requestsReceived()])
      .then(([teach, mine, received]) => setData({ teach, mine, pending: received.filter((r) => r.status === 'PENDING').length }))
      .catch(() => setData({ teach: [], mine: [], pending: 0 }));
  }, []);

  const others = data?.teach.filter((s) => s.user.id !== user.id) ?? [];

  return (
    <div className="hub">
      <header className="hub-head hub-black">
        <p className="crumb"><Link to="/home">Home</Link></p>
        <h1>Skill Exchange</h1>
        <p className="hub-sub">Students teaching students. Offer an hour of what you're good at, and ask for help with what you're not.</p>
      </header>

      <div className="features">
        <Link to="/skills/mine" className="feature">
          <span className="feature-icon red"><IconPlus /></span>
          <span className="feature-name">Add my skills</span>
          <span className="feature-text">{data?.mine.length ? `You've listed ${data.mine.length}. Add or remove skills.` : 'List what you can teach and what you want to learn.'}</span>
        </Link>
        <Link to="/skills" className="feature">
          <span className="feature-icon"><IconPeople /></span>
          <span className="feature-name">Find someone to learn from</span>
          <span className="feature-text">Browse skills, open a profile and send a request.</span>
        </Link>
        <Link to="/requests" className="feature">
          <span className="feature-icon"><IconSwap /></span>
          <span className="feature-name">Requests &amp; sessions {data?.pending > 0 && <span className="count">{data.pending}</span>}</span>
          <span className="feature-text">Accept requests, schedule sessions and leave ratings.</span>
        </Link>
        <Link to={`/students/${user.id}`} className="feature">
          <span className="feature-icon"><IconUser /></span>
          <span className="feature-name">My profile</span>
          <span className="feature-text">What other students see, with your teaching rating.</span>
        </Link>
      </div>

      {others.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Recently offered</h2>
            <Link to="/skills">See all</Link>
          </div>
          <ul className="offer-list">
            {others.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link to={`/students/${s.user.id}`} className="offer">
                  <Avatar user={s.user} size={34} />
                  <span><strong>{s.name}</strong><small>{s.user.name}{s.user.branch ? `, ${s.user.branch}` : ''}</small></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
