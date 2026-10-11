import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorNote } from '../components/Feedback.jsx';
import { CATEGORIES, LOCATIONS, today } from '../util.js';

export default function ReportItem() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: params.get('type') === 'FOUND' ? 'FOUND' : 'LOST',
    title: '', description: '', category: '', location: '', date: today(),
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const lost = form.type === 'LOST';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const item = await api.createItem(form);
      navigate(`/items/${item.id}`, { state: { justReported: true } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="page page-narrow">
      <header className="page-head"><h1>Report an item</h1></header>

      <form className="form panel" onSubmit={submit}>
        <div className="type-switch" role="radiogroup" aria-label="What happened">
          <button type="button" role="radio" aria-checked={lost} className={lost ? 'on lost' : ''} onClick={() => setForm({ ...form, type: 'LOST' })}>I lost something</button>
          <button type="button" role="radio" aria-checked={!lost} className={!lost ? 'on found' : ''} onClick={() => setForm({ ...form, type: 'FOUND' })}>I found something</button>
        </div>

        <label>
          What is it?
          <input required maxLength={120} value={form.title} onChange={set('title')} placeholder={lost ? 'Black JBL earphones' : 'Grey backpack with a keychain'} />
        </label>
        <label>
          Description
          <textarea rows={4} maxLength={1000} value={form.description} onChange={set('description')}
            placeholder={lost ? 'Colour, brand, stickers, anything that makes it yours' : "Describe it, but keep one detail back so the owner can prove it's theirs"} />
        </label>
        <div className="form-row">
          <label>
            Category
            <select required value={form.category} onChange={set('category')}>
              <option value="" disabled>Choose one</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            {lost ? 'Date lost' : 'Date found'}
            <input type="date" required max={today()} value={form.date} onChange={set('date')} />
          </label>
        </div>
        <label>
          {lost ? 'Where did you last have it?' : 'Where did you find it?'}
          <input required maxLength={120} list="locations" value={form.location} onChange={set('location')} placeholder="Library" />
          <datalist id="locations">{LOCATIONS.map((l) => <option key={l} value={l} />)}</datalist>
        </label>

        <ErrorNote error={error} />
        <button className={`btn btn-block ${lost ? 'btn-lost' : 'btn-found'}`} disabled={busy}>
          {busy ? 'Posting…' : lost ? 'Post lost item' : 'Post found item'}
        </button>
      </form>
    </div>
  );
}
