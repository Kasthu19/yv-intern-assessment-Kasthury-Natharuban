import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-brand-logo">YV</div>
        <span>Yarl Ventures MMS</span>
      </Link>

      <nav>
        <ul className="navbar-links">
          <li>
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}
            >
              My Membership
            </Link>
          </li>

          {hasPermission('application.view') && (
            <li>
              <Link
                to="/staff/applications"
                className={`nav-link ${location.pathname === '/staff/applications' ? 'active' : ''}`}
              >
                Review Applications
              </Link>
            </li>
          )}

          {hasPermission('member.view') && (
            <li>
              <Link
                to="/members"
                className={`nav-link ${location.pathname === '/members' ? 'active' : ''}`}
              >
                Member Directory
              </Link>
            </li>
          )}

          {user.userType === 'CHAIRMAN' && (
            <li>
              <Link
                to="/chairman"
                className={`nav-link ${location.pathname === '/chairman' ? 'active' : ''}`}
              >
                Chairman Control
              </Link>
            </li>
          )}

          {hasPermission('audit.view') && (
            <li>
              <Link
                to="/audit-logs"
                className={`nav-link ${location.pathname === '/audit-logs' ? 'active' : ''}`}
              >
                Audit Log
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="user-profile-badge">
        <div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>
            {user.fullName}
          </span>
          <span className={`role-pill ${user.userType}`}>
            {user.userType === 'OFFICER' && user.officerRole
              ? user.officerRole.name
              : user.userType}
          </span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
