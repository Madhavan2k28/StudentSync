import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Avatar from '../components/Avatar.jsx';
import { Empty, ErrorNote, Loading } from '../components/Feedback.jsx';
import { levelLabel } from '../util.js';

export default function Skills() {
  const { user } = useAuth();
  const [kind, setKind] = useState('TEACH');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSkills(null);
    api.skills({ kind, q: search }).then(setSkills).catch((e) => setError(e.message));
  }, [kind, search]);

  // Group by skill name so "Python" shows every student who offers it together.
  const groups = (skills || []).reduce((acc, s) => {
    const key = s.name.trim().toLowerCase();
    (acc[key] ||= { name: s.name, list: [] }).list.push(s);
    return acc;
  }, {});

  return (
    <div className="page">
      <p className="crumb"><Link to="/skill-exchange">Skill Exchange</Link></p>
      <header className="page-head">
        <h1>Skill Exchange</h1>
        <div className="page-actions"><Link className="btn btn-primary" to="/skills/mine">Add my skills</Link></div>
      </header>

      <form className="filters" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }}>
        <input className="search" type="search" placeholder="Search a skill, e.g. Python, guitar, Figma" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search skills" />
        <div className="segmented" role="group" aria-label="Show">
          <button type="button" className={kind === 'TEACH' ? 'on' : ''} onClick={() => setKind('TEACH')}>People who can teach</button>
          <button type="button" className={kind === 'LEARN' ? 'on' : ''} onClick={() => setKind('LEARN')}>People who want to learn</button>
        </div>
      </form>

      <ErrorNote error={error} />
      {!skills ? <Loading /> : skills.length === 0 ? (
        <Empty title={search ? `Nobody has listed "${search}" yet.` : 'No skills listed yet.'}>
          <p>Be the first: <Link to="/skills/mine">add what you can teach</Link>.</p>
        </Empty>
      ) : (
        <div className="skill-groups">
          {Object.values(groups).map((g) => (
            <section key={g.name} className="skill-group">
              <h2>{g.name}</h2>
              <ul>
                {g.list.map((s) => (
                  <li key={s.id}>
                    <Link to={`/students/${s.user.id}`} className="person-row">
                      <Avatar user={s.user} size={32} />
                      <span className="person-text">
                        <strong>{s.user.id === user.id ? 'You' : s.user.name}</strong>
                        <small>{[s.user.branch, levelLabel(s.level)].filter(Boolean).join(', ')}</small>
                      </span>
                    </Link>
                    {s.description && <p className="muted small">{s.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
