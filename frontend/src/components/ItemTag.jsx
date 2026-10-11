import { Link } from 'react-router-dom';
import { formatDate } from '../util.js';

/** A lost/found item drawn as a paper tag, the visual signature of the app. */
export default function ItemTag({ item, score, reasons }) {
  const lost = item.type === 'LOST';
  return (
    <Link to={`/items/${item.id}`} className={`tag ${lost ? 'tag-lost' : 'tag-found'} ${item.status === 'RECOVERED' ? 'tag-done' : ''}`}>
      <span className="tag-hole" aria-hidden="true" />
      <div className="tag-head">
        <span className="tag-type">{lost ? 'Lost' : 'Found'}</span>
        {item.status === 'RECOVERED' && <span className="tag-recovered">Recovered</span>}
        {score != null && <span className="tag-score">{score}% match</span>}
      </div>
      <h3 className="tag-title">{item.title}</h3>
      {item.description && <p className="tag-desc">{item.description}</p>}
      <dl className="tag-meta">
        <div><dt>Where</dt><dd>{item.location}</dd></div>
        <div><dt>When</dt><dd>{formatDate(item.date)}</dd></div>
        <div><dt>Category</dt><dd>{item.category}</dd></div>
      </dl>
      {reasons && <p className="tag-reasons">{reasons.join('; ')}</p>}
    </Link>
  );
}
