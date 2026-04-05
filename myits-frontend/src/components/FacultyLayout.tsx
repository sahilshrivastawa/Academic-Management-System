import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/Dashboard.css';

interface FacultyLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const FacultyLayout = ({ children, title, subtitle }: FacultyLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const normalizedRole = (user?.role || '').replace('ROLE_', '');
  const isAdminUser = normalizedRole === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="dashboard-container">
      {isDrawerOpen && <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} />}

      <nav className={`sidebar ${isDrawerOpen ? 'open' : ''}`}>
        <button type="button" className="sidebar-close" onClick={() => setIsDrawerOpen(false)}>
          ✕
        </button>

        <div className="sidebar-header">
          <h2>MyITS</h2>
          <p className="user-info">{user?.email}</p>
          <span className="user-role">{user?.role}</span>
        </div>

        <div className="sidebar-menu">
          {isAdminUser && (
            <Link to="/dashboard/admin" className="menu-item" onClick={closeDrawer}>
              <span>↩️</span> Back to Admin Dashboard
            </Link>
          )}
          <Link to="/faculty/dashboard" className="menu-item" onClick={closeDrawer}>
            <span>📊</span> Dashboard
          </Link>
          <Link to="/faculty/directory" className="menu-item" onClick={closeDrawer}>
            <span>🧑‍🏫</span> Faculty Directory
          </Link>
          <Link to="/faculty/students" className="menu-item" onClick={closeDrawer}>
            <span>👨‍🎓</span> Student List
          </Link>
          <Link to="/faculty/courses" className="menu-item" onClick={closeDrawer}>
            <span>📚</span> Course Management
          </Link>
          <Link to="/faculty/announcements" className="menu-item" onClick={closeDrawer}>
            <span>📢</span> Announcements
          </Link>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </nav>

      <main className="main-content">
        <button type="button" className="drawer-toggle" onClick={() => setIsDrawerOpen(true)}>
          ☰ Menu
        </button>

        <div className="dashboard-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {isAdminUser && (
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/dashboard/admin" className="profile-back-link">
                ← Back to Admin Dashboard
              </Link>
            </div>
          )}
        </div>

        {children}
      </main>
    </div>
  );
};

export default FacultyLayout;
