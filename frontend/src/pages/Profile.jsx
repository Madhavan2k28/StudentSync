import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Avatar from '../components/Avatar.jsx';
import { ErrorNote, Loading } from '../components/Feedback.jsx';
import { levelLabel } from '../util.js';

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const load = () => api.profile(id).then(setData).catch((e) => setError(e.message));
  useEffect(() => { setData(null); setEditing(false); load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return error ? <ErrorNote error={error} /> : <Loading />;

  const me = data.user.id === user.id;
  const teach = data.skills.filter((s) => s.kind === 'TEACH');
  const learn = data.skills.filter((s) => s.kind === 'LEARN');

  return (
    <div className="page page-narrow">
      <header className="profile-head">
        <Avatar user={data.user} size={72} />
        <div>
          <h1>{data.user.name}</h1>
          <p className="muted">{[data.user.rollNo, data.user.branch].filter(Boolean).join(', ') || data.user.email}</p>
          {data.completedSessions > 0 && (
            <p className="rating">
              <span className="stars">★</span> {data.averageRating} from {data.completedSessions} session{data.completedSessions > 1 ? 's' : ''} taught
            </p>
          )}
        </div>
        {me && !editing && <button className="btn btn-quiet btn-sm push" onClick={() => setEditing(true)}>Edit profile</button>}
      </header>

      {editing ? (
        <EditProfile user={data.user} onCancel={() => setEditing(false)}
          onSaved={(u) => { updateUser({ ...user, ...u }); setEditing(false); load(); }} />
      ) : data.user.bio && <p className="bio">{data.user.bio}</p>}

      <section className="panel">
        <h2>Can teach</h2>
        {teach.length === 0 ? <p className="muted">No teaching skills listed.</p> : (
          <ul className="teach-list">
            {teach.map((s) => <TeachRow key={s.id} skill={s} canRequest={!me} receiverId={data.user.id} />)}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Wants to learn</h2>
        {learn.length === 0 ? <p className="muted">Nothing listed.</p> : (
          <ul className="chips">{learn.map((s) => <li key={s.id} className="chip"><span>{s.name}</span></li>)}</ul>
        )}
      </section>
    </div>
  );
}

function TeachRow({ skill, canRequest, receiverId }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');

  async function send(e) {
    e.preventDefault();
    setError('');
    try {
      await api.sendRequest({ receiverId, skillName: skill.name, message });
      setState('sent');
      setOpen(false);
    } catch (err) { setError(err.message); }
  }

  return (
    <li>
      <div className="teach-row">
        <div>
          <strong>{skill.name}</strong> {skill.level && <span className="muted small">{levelLabel(skill.level)}</span>}
          {skill.description && <p className="muted small">{skill.description}</p>}
        </div>
        {canRequest && (state === 'sent'
          ? <span className="muted small">Request sent</span>
          : !open && <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>Ask to learn</button>)}
      </div>
      {open && (
        <form className="form compact inline-form" onSubmit={send}>
          <label>Message<textarea rows={2} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What you'd like to cover, and when you're free" /></label>
          <ErrorNote error={error} />
          <div className="row-gap">
            <button className="btn btn-primary btn-sm">Send request</button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </li>
  );
}

function EditProfile({ user, onCancel, onSaved }) {
  const [form, setForm] = useState({ name: user.name, rollNo: user.rollNo || '', branch: user.branch || '', bio: user.bio || '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    try { onSaved(await api.updateProfile(form)); } catch (err) { setError(err.message); }
  }

  return (
    <form className="form panel" onSubmit={submit}>
      <label>Full name<input required value={form.name} onChange={set('name')} /></label>
      <div className="form-row">
        <label>Roll number<input value={form.rollNo} onChange={set('rollNo')} /></label>
        <label>Branch &amp; section<input value={form.branch} onChange={set('branch')} /></label>
      </div>
      <label>About you<textarea rows={3} maxLength={500} value={form.bio} onChange={set('bio')} placeholder="Year, interests, when you're usually free" /></label>
      <ErrorNote error={error} />
      <div className="row-gap">
        <button className="btn btn-primary">Save profile</button>
        <button type="button" className="btn btn-quiet" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
