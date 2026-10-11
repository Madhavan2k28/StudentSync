import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import ItemTag from '../components/ItemTag.jsx';
import { IconFound, IconInbox, IconList, IconLost, IconSearch } from '../components/Icons.jsx';

export default function LostFoundHub() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([api.items({ status: 'OPEN' }), api.claimsReceived()])
      .then(([items, claims]) => setData({ items, pending: claims.filter((c) => c.status === 'PENDING').length }))
      .catch(() => setData({ items: [], pending: 0 }));
  }, []);

  const lostCount = data?.items.filter((i) => i.type === 'LOST').length ?? 0;
  const foundCount = data?.items.filter((i) => i.type === 'FOUND').length ?? 0;

  return (
    <div className="hub">
      <header className="hub-head hub-red">
        <p className="crumb"><Link to="/home">Home</Link></p>
        <h1>Lost &amp; Found</h1>
        <form className="hub-search" onSubmit={(e) => { e.preventDefault(); navigate(`/items${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`); }} role="search">
          <IconSearch />
          <input type="search" placeholder="Search items: calculator, ID card, keys…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search items" />
          <button className="btn btn-white">Search</button>
        </form>
      </header>

      <div className="features">
        <Link to="/items/report?type=LOST" className="feature">
          <span className="feature-icon red"><IconLost /></span>
          <span className="feature-name">Report a lost item</span>
          <span className="feature-text">Say what you lost, where and when. We'll show items that match.</span>
        </Link>
        <Link to="/items/report?type=FOUND" className="feature">
          <span className="feature-icon"><IconFound /></span>
          <span className="feature-name">Report a found item</span>
          <span className="feature-text">Picked something up? Post it so the owner can claim it.</span>
        </Link>
        <Link to="/items" className="feature">
          <span className="feature-icon"><IconList /></span>
          <span className="feature-name">View all items</span>
          <span className="feature-text">{data ? `${lostCount} lost and ${foundCount} found, still open.` : 'Everything reported on campus.'}</span>
        </Link>
        <Link to="/items/mine" className="feature">
          <span className="feature-icon"><IconInbox /></span>
          <span className="feature-name">My reports &amp; claims {data?.pending > 0 && <span className="count">{data.pending}</span>}</span>
          <span className="feature-text">Check matches, verify claims and mark items recovered.</span>
        </Link>
      </div>

      {data?.items.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Latest reports</h2>
            <Link to="/items">See all</Link>
          </div>
          <div className="tag-grid">{data.items.slice(0, 3).map((i) => <ItemTag key={i.id} item={i} />)}</div>
        </section>
      )}
    </div>
  );
}
