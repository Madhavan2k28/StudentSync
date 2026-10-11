import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ItemTag from '../components/ItemTag.jsx';
import { Empty, ErrorNote, Loading, Status } from '../components/Feedback.jsx';
import { formatDate } from '../util.js';

export default function MyItems() {
  const [items, setItems] = useState(null);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.myItems(), api.claimsReceived(), api.claimsSent()])
      .then(([i, r, s]) => { setItems(i); setReceived(r); setSent(s); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote error={error} />;
  if (!items) return <Loading />;

  const pendingByItem = received.reduce((acc, c) => {
    if (c.status === 'PENDING') acc[c.item.id] = (acc[c.item.id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page">
      <header className="page-head"><h1>My reports &amp; claims</h1></header>

      <section>
        <h2>Items I reported</h2>
        {items.length === 0 ? (
          <Empty title="You haven't reported anything.">
            <p><Link to="/items/report">Report a lost or found item</Link></p>
          </Empty>
        ) : (
          <div className="tag-grid">
            {items.map((i) => (
              <div key={i.id} className="tag-wrap">
                <ItemTag item={i} />
                {pendingByItem[i.id] && <span className="pin">{pendingByItem[i.id]} new claim{pendingByItem[i.id] > 1 ? 's' : ''}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Claims I sent</h2>
        {sent.length === 0 ? <p className="muted">When you claim an item, its status shows up here.</p> : (
          <table className="table">
            <thead><tr><th>Item</th><th>Reported by</th><th>Sent</th><th>Status</th></tr></thead>
            <tbody>
              {sent.map((c) => (
                <tr key={c.id}>
                  <td><Link to={`/items/${c.item.id}`}>{c.item.title}</Link></td>
                  <td>{c.item.postedBy.name}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td><Status value={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
