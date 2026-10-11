import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import Avatar from './Avatar.jsx';
import { useAuth } from '../auth.jsx';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const inLost = pathname.startsWith('/lost-found') || pathname.startsWith('/items');
  const inSkills = pathname.startsWith('/skill') || pathname.startsWith('/requests') ||
    (pathname.startsWith('/students') && !pathname.endsWith(`/${user.id}`));

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Logo to="/home" />
          <nav className="topnav" aria-label="Main">
            <NavLink to="/home" className="topnav-link">Home</NavLink>
            <Link to="/lost-found" className={`topnav-link ${inLost ? 'active' : ''}`}>Lost &amp; Found</Link>
            <Link to="/skill-exchange" className={`topnav-link ${inSkills ? 'active' : ''}`}>Skill Exchange</Link>
          </nav>
          <div className="topbar-user">
            <Link to={`/students/${user.id}`} className="me" title="My profile">
              <Avatar user={user} size={32} />
              <span className="me-name">{user.name.split(' ')[0]}</span>
            </Link>
            <button className="link-btn" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
