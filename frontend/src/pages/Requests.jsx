import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Avatar from '../components/Avatar.jsx';
import { Empty, ErrorNote, Loading, Status } from '../components/Feedback.jsx';
import { formatDateTime } from '../util.js';

export default function Requests() {
  const [tab, setTab] = useState('received');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => Promise.all([api.requestsReceived(), api.requestsSent()])
    .then(([received, sent]) => setData({ received, sent }))
    .catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function act(fn) {
    setError('');
    try { await fn(); await load(); } catch (e) { setError(e.message); }
  }

  if (!data) return error ? <ErrorNote error={error} /> : <Loading />;
  const list = data[tab];
  const pending = data.received.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="page">
      <header className="page-head"><h1>Requests &amp; sessions</h1></header>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'received'} className={tab === 'received' ? 'on' : ''} onClick={() => setTab('received')}>
          People who want to learn from me{pending > 0 && <span className="count">{pending}</span>}
        </button>
        <button role="tab" aria-selected={tab === 'sent'} className={tab === 'sent' ? 'on' : ''} onClick={() => setTab('sent')}>
          My learning requests
        </button>
      </div>
      <ErrorNote error={error} />

      {list.length === 0 ? (
        tab === 'received'
          ? <Empty title="No requests yet."><p>Add skills you can teach on <Link to="/skills/mine">My skills</Link> so classmates can find you.</p></Empty>
          : <Empty title="You haven't asked anyone yet."><p><Link to="/skills">Browse skills</Link> and open a profile to send a request.</p></Empty>
      ) : (
        <ul className="requests">
          {list.map((r) => <RequestCard key={r.id} r={r} asTeacher={tab === 'received'} act={act} />)}
        </ul>
      )}
    </div>
  );
}

function RequestCard({ r, asTeacher, act }) {
  const other = asTeacher ? r.sender : r.receiver;
  const [scheduling, setScheduling] = useState(false);
  const [rating, setRating] = useState(false);

  return (
    <li className="request">
      <div className="request-head">
        <Link to={`/students/${other.id}`} className="inline-person"><Avatar user={other} size={30} /><strong>{other.name}</strong></Link>
        <span className="muted">{asTeacher ? 'wants to learn' : 'teaching you'}</span>
        <strong className="request-skill">{r.skillName}</strong>
        <Status value={r.status} />
      </div>
      {r.message && <p className="request-msg">{r.message}</p>}

      {r.sessionTime && (
        <p className="session">Session: {formatDateTime(r.sessionTime)} at {r.sessionPlace}</p>
      )}
      {r.status === 'COMPLETED' && (
        <p className="session">
          Rated <span className="stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
          {r.feedback && <> “{r.feedback}”</>}
        </p>
      )}

      <div className="row-gap">
        {asTeacher && r.status === 'PENDING' && (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => act(() => api.acceptRequest(r.id))}>Accept</button>
            <button className="btn btn-quiet btn-sm" onClick={() => act(() => api.rejectRequest(r.id))}>Decline</button>
          </>
        )}
        {r.status === 'ACCEPTED' && !scheduling && (
          <button className="btn btn-quiet btn-sm" onClick={() => setScheduling(true)}>{r.sessionTime ? 'Change time' : 'Schedule session'}</button>
        )}
        {!asTeacher && r.status === 'ACCEPTED' && !rating && (
          <button className="btn btn-primary btn-sm" onClick={() => setRating(true)}>Mark done and rate</button>
        )}
      </div>

      {scheduling && r.status === 'ACCEPTED' && <ScheduleForm r={r} onCancel={() => setScheduling(false)} onSave={(d) => act(() => api.schedule(r.id, d)).then(() => setScheduling(false))} />}
      {rating && r.status === 'ACCEPTED' && <RateForm onCancel={() => setRating(false)} onSave={(d) => act(() => api.feedback(r.id, d))} />}
    </li>
  );
}

function ScheduleForm({ r, onCancel, onSave }) {
  const [time, setTime] = useState(r.sessionTime ? r.sessionTime.slice(0, 16) : '');
  const [place, setPlace] = useState(r.sessionPlace || '');
  return (
    <form className="form compact inline-form" onSubmit={(e) => { e.preventDefault(); onSave({ sessionTime: time, sessionPlace: place }); }}>
      <div className="form-row">
        <label>When<input type="datetime-local" required value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label>Where<input required maxLength={150} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Library discussion room / Google Meet" /></label>
      </div>
      <div className="row-gap">
        <button className="btn btn-primary btn-sm">Save session</button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function RateForm({ onCancel, onSave }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  return (
    <form className="form compact inline-form" onSubmit={(e) => { e.preventDefault(); onSave({ rating: stars, feedback: text }); }}>
      <fieldset className="star-input">
        <legend>How was the session?</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= stars ? 'lit' : ''}>
            <input type="radio" name="stars" value={n} checked={stars === n} onChange={() => setStars(n)} />
            <span aria-hidden="true">★</span>
            <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
          </label>
        ))}
      </fieldset>
      <label>Feedback (optional)<textarea rows={2} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} /></label>
      <div className="row-gap">
        <button className="btn btn-primary btn-sm">Submit rating</button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
