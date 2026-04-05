import { useEffect, useState } from 'react';
import FacultyLayout from '../components/FacultyLayout';
import { studentService } from '../services/studentService';
import type { Student } from '../types';
import './StudentDirectory.css';

const FacultyStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await studentService.getAll(0, 500);
        if (response.success) {
          setStudents(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <FacultyLayout title="Student List" subtitle="View all students for faculty operations">
      {loading && <div className="directory-state">Loading students...</div>}
      {error && <div className="directory-error">{error}</div>}

      {!loading && !error && (
        <div className="directory-year-card">
          <div className="table-wrapper">
            <table className="directory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Email</th>
                  <th>Year</th>
                  <th>Course</th>
                  <th>Degree</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.userName}</td>
                    <td>{student.enrollmentNo}</td>
                    <td>{student.userEmail}</td>
                    <td>{student.academicYear}</td>
                    <td>{student.course}</td>
                    <td>{student.degree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </FacultyLayout>
  );
};

export default FacultyStudents;
