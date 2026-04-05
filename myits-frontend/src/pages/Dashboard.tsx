import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { studentService } from '../services/studentService';
import type { Admin, Student } from '../types';
import './Dashboard.css';

type DashboardRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'GUEST';

interface DashboardProps {
  viewRole?: DashboardRole;
}

const Dashboard = ({ viewRole }: DashboardProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [academicOpen, setAcademicOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [studentProfileLoading, setStudentProfileLoading] = useState(false);
  const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
  const [adminProfileLoading, setAdminProfileLoading] = useState(false);

  const normalizedRole = ((viewRole ?? user?.role ?? 'STUDENT') as string).replace('ROLE_', '');
  const normalizedUserRole = (user?.role ?? '').replace('ROLE_', '');
  const effectiveRole: DashboardRole = (normalizedRole as DashboardRole) || 'STUDENT';
  const isAdminUser = normalizedUserRole === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (effectiveRole !== 'STUDENT' || !user?.email) {
        setStudentProfile(null);
        return;
      }

      try {
        setStudentProfileLoading(true);
        const response = await studentService.getAllDirectoryRecords();
        if (response.success) {
          const profile = response.data.find(
            (item) => item.userEmail.toLowerCase() === user.email.toLowerCase()
          ) || null;
          setStudentProfile(profile);
        }
      } finally {
        setStudentProfileLoading(false);
      }
    };

    fetchStudentProfile();
  }, [effectiveRole, user?.email]);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (effectiveRole !== 'ADMIN' || !user?.email) {
        setAdminProfile(null);
        return;
      }

      try {
        setAdminProfileLoading(true);
        const response = await adminService.getAll(0, 500);
        if (response.success) {
          const profile = response.data.find(
            (item) => item.email.toLowerCase() === user.email.toLowerCase()
          ) || null;
          setAdminProfile(profile);
        }
      } finally {
        setAdminProfileLoading(false);
      }
    };

    fetchAdminProfile();
  }, [effectiveRole, user?.email]);

  const studentProfileFields = useMemo(() => ([
    { label: 'Student Name', value: studentProfile?.userName || 'Not Available' },
    { label: 'Student ID', value: studentProfile?.id ?? 'Not Available' },
    { label: 'Roll No', value: studentProfile?.enrollmentNo || 'Not Available' },
    { label: 'Login Email', value: user?.email || 'Not Available' },
    { label: 'Role', value: user?.role || 'Not Available' },
    { label: 'Mobile No', value: studentProfile?.mobileNo || 'Not Available' },
    { label: 'Branch', value: studentProfile?.branch || 'Not Available' },
    { label: 'Academic Year', value: studentProfile?.academicYear ?? 'Not Available' },
    { label: 'Course', value: studentProfile?.course || 'Not Available' },
    { label: 'House', value: studentProfile?.house || 'Not Available' },
  ]), [studentProfile, user?.email, user?.role]);

  const adminProfileFields = useMemo(() => ([
    { label: 'Admin Name', value: adminProfile?.name || 'Not Available' },
    { label: 'Admin ID', value: adminProfile?.id ?? 'Not Available' },
    { label: 'User ID', value: adminProfile?.userId ?? 'Not Available' },
    { label: 'Login Email', value: user?.email || 'Not Available' },
    { label: 'Role', value: user?.role || 'Not Available' },
    { label: 'Department', value: adminProfile?.department || 'Not Available' },
  ]), [adminProfile, user?.email, user?.role]);

  return (
    <div className={`dashboard-container ${effectiveRole === 'STUDENT' ? 'student-dashboard' : ''}`}>
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
          {isAdminUser && effectiveRole !== 'ADMIN' && (
            <Link to="/dashboard/admin" className="menu-item" onClick={closeDrawer}>
              <span>↩️</span> Back to Admin Dashboard
            </Link>
          )}

          <Link to={
            effectiveRole === 'ADMIN'
              ? '/dashboard/admin'
              : effectiveRole === 'FACULTY'
                ? '/dashboard/faculty'
                : effectiveRole === 'GUEST'
                  ? '/dashboard/guest'
                  : '/dashboard/student'
            } className="menu-item" onClick={closeDrawer}>
            <span>📊</span> Dashboard
          </Link>

          {effectiveRole === 'STUDENT' && (
            <>
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
            </>
          )}

          {isAdminUser && (
            <>
              <Link to="/dashboard/admin" className="menu-item" onClick={closeDrawer}>
                <span>👑</span> Admin Dashboard
              </Link>
              <Link to="/dashboard/faculty" className="menu-item" onClick={closeDrawer}>
                <span>🧑‍🏫</span> Faculty Dashboard
              </Link>
              <Link to="/dashboard/student" className="menu-item" onClick={closeDrawer}>
                <span>🎓</span> Student Dashboard
              </Link>
              <Link to="/students" className="menu-item" onClick={closeDrawer}>
                <span>👨‍🎓</span> Students
              </Link>
              <Link to="/admins" className="menu-item" onClick={closeDrawer}>
                <span>👔</span> Admins
              </Link>
              <Link to="/courses" className="menu-item" onClick={closeDrawer}>
                <span>📚</span> Courses
              </Link>
              <Link to="/faculty" className="menu-item" onClick={closeDrawer}>
                <span>🧑‍🏫</span> Faculty Directory
              </Link>
              <Link to="/enrollments" className="menu-item" onClick={closeDrawer}>
                <span>📝</span> Enrollments
              </Link>
              <Link to="/guests" className="menu-item" onClick={closeDrawer}>
                <span>👥</span> Guests
              </Link>
            </>
          )}

          {effectiveRole === 'FACULTY' && (
            <>
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
            </>
          )}

          {effectiveRole === 'GUEST' && (
            <>
              <Link to="/dashboard/guest" className="menu-item" onClick={closeDrawer}>
                <span>👤</span> Guest Dashboard
              </Link>
            </>
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
          <h1>Welcome to MyITS</h1>
          <p>Manage your academic information system</p>
        </div>

        <div className="dashboard-cards">
          {effectiveRole === 'ADMIN' && (
            <>
              {adminProfileLoading && (
                <div className="dashboard-card">
                  <h3>Profile</h3>
                  <p className="student-placeholder-value">Loading admin details...</p>
                </div>
              )}
              {!adminProfileLoading && adminProfileFields.map((field) => (
                <div className="dashboard-card" key={field.label}>
                  <h3>{field.label}</h3>
                  <p className="student-placeholder-value">{field.value}</p>
                </div>
              ))}
            </>
          )}

          {effectiveRole === 'STUDENT' && (
            <>
              {studentProfileLoading && (
                <div className="dashboard-card">
                  <h3>Profile</h3>
                  <p className="student-placeholder-value">Loading student details...</p>
                </div>
              )}
              {!studentProfileLoading && studentProfileFields.map((field) => (
                <div className="dashboard-card" key={field.label}>
                  <h3>{field.label}</h3>
                  <p className="student-placeholder-value">{field.value}</p>
                </div>
              ))}
            </>
          )}

          {effectiveRole === 'FACULTY' && (
            <>
              <div className="dashboard-card">
                <h3>My Courses</h3>
                <p>Courses you teach</p>
                <Link to="/courses" className="card-link">View →</Link>
              </div>
              <div className="dashboard-card">
                <h3>Students</h3>
                <p>View student records</p>
                <Link to="/students" className="card-link">View →</Link>
              </div>
            </>
          )}

          {effectiveRole === 'GUEST' && (
            <>
              <div className="dashboard-card">
                <h3>Guest Access</h3>
                <p>Your guest account is created successfully in MyITS.</p>
              </div>
            </>
          )}
        </div>

        <section className="dashboard-modules-section">
          <h2>Core Sections</h2>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Student</h3>
              <p>Student profile, course participation, and peer communication.</p>
              <Link to="/student-directory" className="card-link">Open Directory →</Link>
            </div>
            <div className="dashboard-card">
              <h3>Admin</h3>
              <p>Administrative control for users, records, and operations.</p>
              <Link to="/dashboard/admin" className="card-link">Open Admin Dashboard →</Link>
            </div>
            <div className="dashboard-card">
              <h3>Faculty</h3>
              <p>Faculty directory access and course-level academic management.</p>
              <Link to="/faculty/directory" className="card-link">Open Directory →</Link>
            </div>
            <div className="dashboard-card">
              <h3>Guest</h3>
              <p>Guest visit tracking and institutional visitor management.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
