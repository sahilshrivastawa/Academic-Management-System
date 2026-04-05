import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDirectory from './pages/StudentDirectory';
import StudentAcademicSection from './pages/StudentAcademicSection';
import StudentProfile from './pages/StudentProfile';
import LiveAttendanceTracking from './pages/LiveAttendanceTracking';
import NotificationCenter from './pages/NotificationCenter';
import HelpRequest from './pages/HelpRequest';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Faculty from './pages/Faculty';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyProfile from './pages/FacultyProfile';
import FacultyStudents from './pages/FacultyStudents';
import FacultyCourses from './pages/FacultyCourses';
import FacultyAnnouncements from './pages/FacultyAnnouncements';
import './App.css';

const RoleDashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = (user?.role || '').replace('ROLE_', '');

  if (normalizedRole === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (normalizedRole === 'STUDENT') {
    return <Navigate to="/dashboard/student" replace />;
  }

  if (normalizedRole === 'FACULTY') {
    return <Navigate to="/faculty/dashboard" replace />;
  }

  if (normalizedRole === 'GUEST') {
    return <Navigate to="/dashboard/guest" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleDashboardRedirect />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Dashboard viewRole="ADMIN" />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/faculty" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/faculty/dashboard" replace />
            </ProtectedRoute>
          } />

          <Route path="/faculty/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />

          <Route path="/faculty/directory" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Faculty />
            </ProtectedRoute>
          } />

          <Route path="/faculty/:facultyId" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FacultyProfile />
            </ProtectedRoute>
          } />

          <Route path="/faculty/students" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FacultyStudents />
            </ProtectedRoute>
          } />

          <Route path="/faculty/courses" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FacultyCourses />
            </ProtectedRoute>
          } />

          <Route path="/faculty/announcements" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FacultyAnnouncements />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <Dashboard viewRole="STUDENT" />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/guest" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Dashboard viewRole="GUEST" />
            </ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Students />
            </ProtectedRoute>
          } />

          <Route path="/students/:studentId" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StudentProfile />
            </ProtectedRoute>
          } />

          <Route path="/student-directory" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <StudentDirectory />
            </ProtectedRoute>
          } />

          <Route path="/attendance/live" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <LiveAttendanceTracking />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <NotificationCenter />
            </ProtectedRoute>
          } />

          <Route path="/help-request" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <HelpRequest />
            </ProtectedRoute>
          } />

          <Route path="/academic/assignments" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <StudentAcademicSection section="assignments" />
            </ProtectedRoute>
          } />

          <Route path="/academic/timetable" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <StudentAcademicSection section="timetable" />
            </ProtectedRoute>
          } />

          <Route path="/academic/notes" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <StudentAcademicSection section="notes" />
            </ProtectedRoute>
          } />

          <Route path="/academic/enrolled-courses" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <StudentAcademicSection section="enrolled-courses" />
            </ProtectedRoute>
          } />

          <Route path="/academic/performance-analysis" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <StudentAcademicSection section="performance-analysis" />
            </ProtectedRoute>
          } />

          <Route path="/academic/fees-status" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <StudentAcademicSection section="fees-status" />
            </ProtectedRoute>
          } />
          
          <Route path="/courses" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Courses />
            </ProtectedRoute>
          } />

          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/faculty/directory" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
