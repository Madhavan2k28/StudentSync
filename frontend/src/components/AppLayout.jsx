import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo.jsx';
import Avatar from './Avatar.jsx';
import { useAuth } from '../auth.jsx';

const NAV = [
  { group: null, links: [{ to: '/dashboard', label: 'Dashboard' }] },
  {
    group: 'Lost & Found',
    links: [
      { to: '/items', label: 'Browse items', end: true },
      { to: '/items/report', label: 'Report an item' },
      { to: '/items/mine', label: 'My reports & claims' },
    ],
  },
  {
    group: 'Skill Exchange',
    links: [
      { to: '/skills', label: 'Browse skills', end: true },
      { to: '/skills/mine', label: 'My skills' },
      { to: '/requests', label: 'Requests & sessions' },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Logo to="/dashboard" />
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Close' : 'Menu'}
        </button>
      </header>

      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-logo"><Logo to="/dashboard" /></div>
        <nav onClick={() => setOpen(false)}>
          {NAV.map((section) => (
            <div key={section.group ?? 'main'} className="nav-group">
              {section.group && <p className="nav-heading">{section.group}</p>}
              {section.links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
                  {l.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <NavLink to={`/students/${user.id}`} className="me" onClick={() => setOpen(false)}>
            <Avatar user={user} size={34} />
            <span>
              <strong>{user.name}</strong>
              <small>{user.rollNo || user.email}</small>
            </span>
          </NavLink>
          <button className="link-btn" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
