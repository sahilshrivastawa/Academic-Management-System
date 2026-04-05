import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FacultyLayout from '../components/FacultyLayout';
import { courseService } from '../services/courseService';
import { facultyService } from '../services/facultyService';
import { studentService } from '../services/studentService';
import type { FacultyDirectory } from '../types';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [courseCount, setCourseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [facultyProfile, setFacultyProfile] = useState<FacultyDirectory | null>(null);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [coursesRes, studentsRes] = await Promise.allSettled([
        courseService.getAll(0, 200),
        studentService.getAll(0, 500),
      ]);

      if (coursesRes.status === 'fulfilled' && coursesRes.value.success) {
        setCourseCount(coursesRes.value.data.length);
      }

      if (studentsRes.status === 'fulfilled' && studentsRes.value.success) {
        setStudentCount(studentsRes.value.data.length);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadFacultyProfile = async () => {
      if (!user?.email) {
        setFacultyProfile(null);
        return;
      }

      try {
        setFacultyLoading(true);
        setFacultyError('');
        const directory = await facultyService.getAll();
        const currentFaculty = directory.find(
          (item) => item.email.toLowerCase() === user.email.toLowerCase()
        ) || null;
        setFacultyProfile(currentFaculty);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        setFacultyError(err.response?.data?.message || 'Unable to load faculty profile details');
      } finally {
        setFacultyLoading(false);
      }
    };

    loadFacultyProfile();
  }, [user?.email]);

  const facultyProfileFields = useMemo(
    () => [
      { label: 'Faculty Name', value: facultyProfile?.name || 'Not Available' },
      { label: 'Faculty ID', value: facultyProfile?.id ?? 'Not Available' },
      { label: 'Login Email', value: user?.email || 'Not Available' },
      { label: 'Role', value: user?.role || 'Not Available' },
      { label: 'Mobile No', value: facultyProfile?.mobileNo || 'Not Available' },
      { label: 'Designation', value: facultyProfile?.designation || 'Not Available' },
      { label: 'Department', value: facultyProfile?.department || 'Not Available' },
      { label: 'House Coordinator', value: facultyProfile?.houseCoordinator || 'Not Assigned' },
      { label: 'Total Courses', value: courseCount },
      { label: 'Total Students', value: studentCount },
    ],
    [facultyProfile, user?.email, user?.role, courseCount, studentCount]
  );

  return (
    <FacultyLayout title="Faculty Dashboard" subtitle="Complete faculty profile and academic overview">
      {facultyError && <div className="error-banner">{facultyError}</div>}
      <div className="dashboard-cards">
        {facultyLoading && (
          <div className="dashboard-card">
            <h3>Profile</h3>
            <p className="student-placeholder-value">Loading faculty details...</p>
          </div>
        )}

        {!facultyLoading && facultyProfileFields.map((field) => (
          <div className="dashboard-card" key={field.label}>
            <h3>{field.label}</h3>
            <p className="student-placeholder-value">{field.value}</p>
          </div>
        ))}
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;
