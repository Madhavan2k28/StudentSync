import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { api } from '../api.js';

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
          <Link to="/register" className="btn btn-red">Sign up</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Your campus, connected.</h1>
        <p className="lede">Find what you lost. Learn what you want. Two simple tools for students of one college.</p>
      </section>

      <div className="choices">
        <Link to="/register" className="choice choice-red">
          <span className="choice-title">Lost &amp; Found</span>
          <span className="choice-text">Report lost or found items, see likely matches, and claim what's yours.</span>
          <span className="choice-foot">{stats ? `${stats.recovered} items returned so far` : 'Get started'}</span>
        </Link>
        <Link to="/register" className="choice choice-black">
          <span className="choice-title">Skill Exchange</span>
          <span className="choice-text">List skills you can teach, find classmates to learn from, and rate each session.</span>
          <span className="choice-foot">{stats ? `${stats.skills} skills listed by ${stats.students} students` : 'Get started'}</span>
        </Link>
      </div>

      <footer className="landing-foot">
        <p>StudentSync, a campus project by Tirumala Sai Madhavan, AIML-C.</p>
      </footer>
    </div>
  );
}
