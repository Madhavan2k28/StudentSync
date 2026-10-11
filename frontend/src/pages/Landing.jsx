import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { api } from '../api.js';

const SAMPLE_TAGS = [
  { type: 'Lost', title: 'Blue Casio calculator', where: 'Library, 2nd floor', when: 'Mon' },
  { type: 'Found', title: 'Hostel room key on a red ring', where: 'Canteen', when: 'Tue' },
  { type: 'Found', title: 'Steel water bottle with stickers', where: 'Labs', when: 'Wed' },
];

export default function Landing() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav>
          <Link to="/login" className="btn btn-quiet">Log in</Link>
          <Link to="/register" className="btn btn-primary">Create account</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Lost it on campus? Someone probably found it.</h1>
          <p className="lede">
            StudentSync is one place for your college to report lost and found items and to
            trade skills with each other: you teach what you know, and learn what you don't.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Join with your college email</Link>
            <Link to="/login" className="btn btn-quiet btn-lg">I already have an account</Link>
          </div>
          {stats && (
            <p className="hero-stats">
              {stats.students} students, {stats.items} items reported, {stats.recovered} returned to
              their owners, {stats.skills} skills listed.
            </p>
          )}
        </div>

        <div className="hero-board" aria-hidden="true">
          {SAMPLE_TAGS.map((t, i) => (
            <div key={i} className={`tag tag-static ${t.type === 'Lost' ? 'tag-lost' : 'tag-found'}`} style={{ '--tilt': `${[-3, 2, -1][i]}deg` }}>
              <span className="tag-hole" />
              <div className="tag-head"><span className="tag-type">{t.type}</span></div>
              <h3 className="tag-title">{t.title}</h3>
              <dl className="tag-meta">
                <div><dt>Where</dt><dd>{t.where}</dd></div>
                <div><dt>When</dt><dd>{t.when}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="how">
        <article>
          <h2>Lost &amp; Found</h2>
          <ol className="steps">
            <li>Report what you lost or found, with where and when.</li>
            <li>StudentSync lists likely matches from the other side.</li>
            <li>Send a claim with proof that it's yours.</li>
            <li>The finder verifies it and the item is marked recovered.</li>
          </ol>
        </article>
        <article>
          <h2>Skill Exchange</h2>
          <ol className="steps">
            <li>List skills you can teach and ones you want to learn.</li>
            <li>Browse classmates' profiles and send a request.</li>
            <li>Once accepted, fix a time and place to meet.</li>
            <li>After the session, rate it so others know who teaches well.</li>
          </ol>
        </article>
      </section>

      <footer className="landing-foot">
        <p>StudentSync, a campus project by Tirumala Sai Madhavan, AIML-C.</p>
      </footer>
    </div>
  );
}
