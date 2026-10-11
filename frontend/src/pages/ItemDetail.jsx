import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Avatar from '../components/Avatar.jsx';
import ItemTag from '../components/ItemTag.jsx';
import { Empty, ErrorNote, Loading, Status } from '../components/Feedback.jsx';
import { formatDate, formatDateTime } from '../util.js';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState(null);
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const it = await api.item(id);
      setItem(it);
      setMatches(await api.matches(id));
      if (it.postedBy.id === user.id) setClaims(await api.itemClaims(id));
    } catch (e) {
      setError(e.message);
    }
  }, [id, user.id]);

  useEffect(() => { load(); }, [load]);

  if (error && !item) return <ErrorNote error={error} />;
  if (!item) return <Loading />;

  const mine = item.postedBy.id === user.id;
  const lost = item.type === 'LOST';

  async function act(fn) {
    setError('');
    try { await fn(); await load(); } catch (e) { setError(e.message); }
  }

  async function remove() {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try { await api.deleteItem(item.id); navigate('/items/mine'); } catch (e) { setError(e.message); }
  }

  return (
    <div className="page">
      <p className="crumb"><Link to="/lost-found">Lost &amp; Found</Link> / <Link to="/items">All items</Link></p>
      {state?.justReported && matches?.length > 0 && (
        <p className="note note-good">Posted. We found {matches.length} possible match{matches.length > 1 ? 'es' : ''}; have a look below.</p>
      )}

      <div className="detail">
        <article className={`detail-main ${lost ? 'is-lost' : 'is-found'}`}>
          <div className="detail-badges">
            <span className={`badge ${lost ? 'badge-lost' : 'badge-found'}`}>{lost ? 'Lost' : 'Found'}</span>
            <Status value={item.status} />
          </div>
          <h1>{item.title}</h1>
          {item.description && <p className="detail-desc">{item.description}</p>}
          <dl className="facts">
            <div><dt>{lost ? 'Last seen at' : 'Found at'}</dt><dd>{item.location}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(item.date)}</dd></div>
            <div><dt>Category</dt><dd>{item.category}</dd></div>
            <div><dt>Reported by</dt><dd><Link to={`/students/${item.postedBy.id}`} className="inline-person"><Avatar user={item.postedBy} size={22} />{mine ? 'You' : item.postedBy.name}</Link></dd></div>
          </dl>
          {mine && item.status === 'OPEN' && <button className="link-btn danger" onClick={remove}>Delete this report</button>}
        </article>

        <aside className="detail-side">
          {mine ? (
            <ClaimsReview claims={claims} lost={lost} onVerify={(c) => act(() => api.verifyClaim(c.id))} onReject={(c) => act(() => api.rejectClaim(c.id))} />
          ) : item.status === 'OPEN' ? (
            <ClaimForm item={item} lost={lost} onDone={load} />
          ) : (
            <div className="panel"><p className="muted">This item has been returned to its owner.</p></div>
          )}
          <ErrorNote error={error} />
        </aside>
      </div>

      <section>
        <div className="section-head">
          <h2>{lost ? 'Found items that could be this' : 'Lost reports that could match'}</h2>
        </div>
        {matches === null ? <Loading /> : matches.length === 0 ? (
          <Empty title="No likely matches yet.">
            <p>Matches are checked against items in the same category, so this list grows as new reports come in.</p>
          </Empty>
        ) : (
          <div className="tag-grid">{matches.map((m) => <ItemTag key={m.item.id} item={m.item} score={m.score} reasons={m.reasons} />)}</div>
        )}
      </section>
    </div>
  );
}

function ClaimForm({ item, lost, onDone }) {
  const [form, setForm] = useState({ message: '', contact: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.submitClaim(item.id, form);
      setSent(true);
      onDone();
    } catch (err) { setError(err.message); }
  }

  if (sent) {
    return (
      <div className="panel">
        <h2>Claim sent</h2>
        <p className="muted">{item.postedBy.name} will check your details. Track it under <Link to="/items/mine">My reports &amp; claims</Link>.</p>
      </div>
    );
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <h2>{lost ? 'I found this' : 'This is mine'}</h2>
      <label>
        {lost ? 'Where is it now, and how can they collect it?' : 'Prove it: describe something only the owner would know'}
        <textarea required rows={4} maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </label>
      <label>
        Phone or email to reach you
        <input maxLength={120} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
      </label>
      <ErrorNote error={error} />
      <button className="btn btn-primary btn-block">Send claim</button>
    </form>
  );
}

function ClaimsReview({ claims, lost, onVerify, onReject }) {
  return (
    <div className="panel">
      <h2>{lost ? 'People who say they found it' : 'People claiming this item'}</h2>
      {claims === null ? <Loading /> : claims.length === 0 ? (
        <p className="muted">No claims yet. You'll see them here when someone responds.</p>
      ) : (
        <ul className="claims">
          {claims.map((c) => (
            <li key={c.id}>
              <div className="claim-head">
                <Link to={`/students/${c.claimant.id}`} className="inline-person"><Avatar user={c.claimant} size={26} />{c.claimant.name}</Link>
                <Status value={c.status} />
              </div>
              <p>{c.message}</p>
              {c.contact && <p className="muted small">Contact: {c.contact}</p>}
              <p className="muted small">{formatDateTime(c.createdAt)}</p>
              {c.status === 'PENDING' && (
                <div className="row-gap">
                  <button className="btn btn-primary btn-sm" onClick={() => onVerify(c)}>Verify and mark recovered</button>
                  <button className="btn btn-quiet btn-sm" onClick={() => onReject(c)}>Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
