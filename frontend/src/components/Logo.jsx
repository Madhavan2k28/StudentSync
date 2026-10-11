import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="StudentSync home">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="var(--black)" />
        <path d="M10 9h9l4 4v10H10z" fill="#fff" />
        <circle cx="14" cy="13" r="1.9" fill="var(--red)" />
      </svg>
      <span>Student<b>Sync</b></span>
    </Link>
  );
}
