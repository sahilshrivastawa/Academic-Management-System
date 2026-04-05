import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { studentService } from '../services/studentService';
import type { Student } from '../types';
import './StudentDirectory.css';

const StudentProfile = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) {
        setError('Student ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await studentService.getById(Number(studentId));
        if (response.success) {
          setStudent(response.data);
        } else {
          setError(response.message || 'Student record not found.');
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentId]);

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-topbar">
          <Link to="/students" className="profile-back-link">← Back to Student Directory</Link>
          <span className="profile-badge">Admin View</span>
        </div>

        <div className="profile-hero">
          <h1>{student?.userName || 'Student Dashboard'}</h1>
          <p>
            {student
              ? `${student.userEmail} • Roll No ${student.enrollmentNo}`
              : 'Select a student from the directory to inspect the full profile.'}
          </p>
          {student && (
            <div className="profile-badges">
              <span className="profile-badge">Year {student.academicYear}</span>
              <span className="profile-badge">{student.course}</span>
              <span className="profile-badge">{student.branch}</span>
            </div>
          )}
        </div>

        {loading && <div className="directory-state">Loading student dashboard...</div>}
        {error && <div className="directory-error">{error}</div>}

        {!loading && !error && student && (
          <>
            <div className="profile-grid">
              <div className="profile-card">
                <h3>Identity</h3>
                <p><strong>Name:</strong> {student.userName}</p>
                <p><strong>Student ID:</strong> {student.id}</p>
                <p><strong>User ID:</strong> {student.userId}</p>
                <p><strong>Email:</strong> {student.userEmail}</p>
              </div>

              <div className="profile-card">
                <h3>Academic Details</h3>
                <p><strong>Roll No:</strong> {student.enrollmentNo}</p>
                <p><strong>Branch:</strong> {student.branch}</p>
                <p><strong>Academic Year:</strong> {student.academicYear}</p>
                <p><strong>Course:</strong> {student.course}</p>
              </div>

              <div className="profile-card">
                <h3>Program Details</h3>
                <p><strong>Degree:</strong> {student.degree}</p>
                <p><strong>Program:</strong> {student.program}</p>
                <p><strong>Mobile No:</strong> {student.mobileNo}</p>
                <p><strong>House:</strong> {student.house}</p>
              </div>

              <div className="profile-card">
                <h3>Contact</h3>
                <p>Use these quick actions to reach the selected student directly.</p>
                <div className="profile-actions">
                  <a href={`mailto:${student.userEmail}`}>Email</a>
                  <a href={`tel:${student.mobileNo}`}>Call</a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
