import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ItemTag from '../components/ItemTag.jsx';
import { Empty, ErrorNote, Loading } from '../components/Feedback.jsx';
import { CATEGORIES } from '../util.js';

export default function Items() {
  const [params, setParams] = useSearchParams();
  const filters = {
    type: params.get('type') || '',
    category: params.get('category') || '',
    status: params.get('status') ?? 'OPEN',
    q: params.get('q') || '',
  };
  const [query, setQuery] = useState(filters.q);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(null);
    api.items(filters).then(setItems).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Lost &amp; Found</h1>
        <div className="page-actions">
          <Link className="btn btn-primary" to="/items/report">Report an item</Link>
        </div>
      </header>

      <form className="filters" onSubmit={(e) => { e.preventDefault(); update('q', query.trim()); }}>
        <input className="search" type="search" placeholder="Search by name, description or place" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search items" />
        <div className="segmented" role="group" aria-label="Item type">
          {[['', 'All'], ['LOST', 'Lost'], ['FOUND', 'Found']].map(([v, l]) => (
            <button type="button" key={l} className={filters.type === v ? 'on' : ''} onClick={() => update('type', v)}>{l}</button>
          ))}
        </div>
        <select value={filters.category} onChange={(e) => update('category', e.target.value)} aria-label="Category">
          <option value="">Any category</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => update('status', e.target.value)} aria-label="Status">
          <option value="OPEN">Still open</option>
          <option value="RECOVERED">Recovered</option>
          <option value="">Open and recovered</option>
        </select>
      </form>

      <ErrorNote error={error} />
      {!items ? <Loading /> : items.length === 0 ? (
        <Empty title="No items match these filters.">
          <p>Try a different word or category, or <Link to="/items/report">report the item yourself</Link>.</p>
        </Empty>
      ) : (
        <div className="tag-grid">{items.map((i) => <ItemTag key={i.id} item={i} />)}</div>
      )}
    </div>
  );
}
