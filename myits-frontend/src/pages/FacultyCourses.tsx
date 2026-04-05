import { useEffect, useState } from 'react';
import FacultyLayout from '../components/FacultyLayout';
import { courseService } from '../services/courseService';
import type { Course } from '../types';
import './StudentDirectory.css';

const FacultyCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await courseService.getAll(0, 300);
        if (response.success) {
          setCourses(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <FacultyLayout title="Course Management" subtitle="Review and manage assigned courses">
      {loading && <div className="directory-state">Loading courses...</div>}
      {error && <div className="directory-error">{error}</div>}

      {!loading && !error && (
        <div className="directory-year-card">
          <div className="table-wrapper">
            <table className="directory-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Course Code</th>
                  <th>Credits</th>
                  <th>Department</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.courseName}</td>
                    <td>{course.courseCode}</td>
                    <td>{course.credits}</td>
                    <td>{course.department}</td>
                    <td>{course.semester}</td>
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

export default FacultyCourses;
