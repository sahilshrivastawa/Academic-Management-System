import { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import type { Course } from '../types';
import './Students.css';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    credits: 3,
    department: '',
    semester: 1
  });

  useEffect(() => {
    fetchCourses();
  }, [page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll(page, 10);
      if (response.success) {
        setCourses(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await courseService.delete(id);
      if (response.success) {
        fetchCourses();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      credits: course.credits,
      department: course.department,
      semester: course.semester
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingCourse(null);
    setFormData({
      courseName: '',
      courseCode: '',
      credits: 3,
      department: '',
      semester: 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, formData);
      } else {
        await courseService.create(formData);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save course');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Manage course catalog</p>
        </div>
        <button onClick={handleAddNew} className="btn-add">
          + Add Course
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Name</th>
              <th>Course Code</th>
              <th>Credits</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.courseName}</td>
                <td>{course.courseCode}</td>
                <td>{course.credits}</td>
                <td>{course.department}</td>
                <td>{course.semester}</td>
                <td>
                  <button 
                    onClick={() => handleEdit(course)} 
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)} 
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))} 
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={courses.length < 10}
        >
          Next
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Course Code</label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Credits</label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  min="1"
                  max="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Semester</label>
                <input
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  min="1"
                  max="8"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
