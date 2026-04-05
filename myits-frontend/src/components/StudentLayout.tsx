import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/Dashboard.css';

interface StudentLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const StudentLayout = ({ children, title, subtitle }: StudentLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [academicOpen, setAcademicOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="dashboard-container student-internal-page">
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
          <Link to="/dashboard/student" className="menu-item" onClick={closeDrawer}>
            <span>📊</span> Dashboard
          </Link>
          <Link to="/student-directory" className="menu-item" onClick={closeDrawer}>
            <span>👨‍🎓</span> Student Directory
          </Link>
          <Link to="/attendance/live" className="menu-item" onClick={closeDrawer}>
            <span>✅</span> Live Attendance Tracking
          </Link>
          <Link to="/notifications" className="menu-item" onClick={closeDrawer}>
            <span>🔔</span> Notification Center
          </Link>
          <Link to="/help-request" className="menu-item" onClick={closeDrawer}>
            <span>🆘</span> Raise Query / Help Request
          </Link>

          <button
            type="button"
            className="menu-item dropdown-toggle"
            onClick={() => setAcademicOpen((prev) => !prev)}
          >
            <span>📈</span> Academic Progress Tracking {academicOpen ? '▾' : '▸'}
          </button>

          {academicOpen && (
            <div className="menu-dropdown">
              <Link to="/academic/assignments" className="menu-item dropdown-item" onClick={closeDrawer}>
                <span>📝</span> Assignment Submission
              </Link>
              <Link to="/academic/timetable" className="menu-item dropdown-item" onClick={closeDrawer}>
                <span>🗓️</span> Student Timetable
              </Link>
              <Link to="/academic/notes" className="menu-item dropdown-item" onClick={closeDrawer}>
                <span>📥</span> Download Notes
              </Link>
              <Link to="/academic/enrolled-courses" className="menu-item dropdown-item" onClick={closeDrawer}>
                <span>📚</span> Enrolled Course
              </Link>
              <Link to="/academic/performance-analysis" className="menu-item dropdown-item" onClick={closeDrawer}>
                <span>📊</span> Student Performance Analysis
              </Link>
              <Link to="/academic/fees-status" className="menu-item dropdown-item" onClick={closeDrawer}>
                <span>💳</span> Fees Status
              </Link>
            </div>
          )}
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
        </div>

        {children}
      </main>
    </div>
  );
};

export default StudentLayout;
