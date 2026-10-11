import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ErrorNote, Loading } from '../components/Feedback.jsx';
import { levelLabel } from '../util.js';

const EMPTY = { name: '', level: 'INTERMEDIATE', description: '' };

export default function MySkills() {
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.mySkills().then(setSkills).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function remove(id) {
    try { await api.removeSkill(id); load(); } catch (e) { setError(e.message); }
  }

  if (!skills) return error ? <ErrorNote error={error} /> : <Loading />;

  return (
    <div className="page">
      <header className="page-head"><h1>My skills</h1></header>
      <ErrorNote error={error} />
      <div className="two-col">
        <SkillColumn
          kind="TEACH"
          title="I can teach"
          hint="Things you're good enough at to help a classmate."
          skills={skills.filter((s) => s.kind === 'TEACH')}
          onAdded={load} onRemove={remove}
        />
        <SkillColumn
          kind="LEARN"
          title="I want to learn"
          hint="Others who can teach these will find you."
          skills={skills.filter((s) => s.kind === 'LEARN')}
          onAdded={load} onRemove={remove}
        />
      </div>
    </div>
  );
}

function SkillColumn({ kind, title, hint, skills, onAdded, onRemove }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const teach = kind === 'TEACH';

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.addSkill({ ...form, kind, level: teach ? form.level : null });
      setForm(EMPTY);
      onAdded();
    } catch (err) { setError(err.message); }
  }

  return (
    <section className="panel">
      <h2>{title}</h2>
      <p className="muted small">{hint}</p>
      {skills.length > 0 && (
        <ul className="chips">
          {skills.map((s) => (
            <li key={s.id} className="chip">
              <span>{s.name}{s.level && <em>{levelLabel(s.level)}</em>}</span>
              <button onClick={() => onRemove(s.id)} aria-label={`Remove ${s.name}`}>×</button>
            </li>
          ))}
        </ul>
      )}
      <form className="form compact" onSubmit={submit}>
        <div className="form-row">
          <label>Skill<input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={teach ? 'Java' : 'Public speaking'} /></label>
          {teach && (
            <label>Your level
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
          )}
        </div>
        <label>Note (optional)<input maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={teach ? 'Can help with OOP and DSA basics' : 'Preparing for placement interviews'} /></label>
        <ErrorNote error={error} />
        <button className="btn btn-quiet">Add skill</button>
      </form>
    </section>
  );
}
