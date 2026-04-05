import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { studentService } from '../services/studentService';
import type { Student, StudentSelfProfileRequest } from '../types';
import './StudentDirectory.css';

const YEAR_SECTIONS = [1, 2, 3, 4] as const;

const getYearLabel = (year: number) => {
  if (year === 1) return '1st Year';
  if (year === 2) return '2nd Year';
  if (year === 3) return '3rd Year';
  if (year === 4) return '4th Year';
  return `Year ${year}`;
};

const StudentDirectory = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<StudentSelfProfileRequest>({
    enrollmentNo: '',
    branch: '',
    academicYear: 4,
    course: '',
    mobileNo: '',
    house: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const [allResponse, myProfileResponse] = await Promise.allSettled([
          studentService.getAllDirectoryRecords(),
          studentService.getMyProfile(),
        ]);

        let directoryStudents: Student[] = [];

        if (allResponse.status === 'fulfilled' && allResponse.value.success) {
          directoryStudents = allResponse.value.data;
        }

        if (myProfileResponse.status === 'fulfilled' && myProfileResponse.value.success) {
          const myProfile = myProfileResponse.value.data;
          const exists = directoryStudents.some((student) => student.id === myProfile.id);
          if (!exists) {
            directoryStudents = [myProfile, ...directoryStudents];
          }
          setNeedsProfileSetup(false);
        } else {
          setNeedsProfileSetup(true);
        }

        setStudents(directoryStudents);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load student directory');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const studentsByYear = useMemo(() => {
    const grouped: Record<number, Student[]> = { 1: [], 2: [], 3: [], 4: [] };

    students.forEach((student) => {
      const year = student.academicYear;
      if (YEAR_SECTIONS.includes(year as (typeof YEAR_SECTIONS)[number])) {
        grouped[year].push(student);
      }
    });

    return grouped;
  }, [students]);

  const handleProfileChange = (field: keyof StudentSelfProfileRequest, value: string | number) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      setSaveProfileLoading(true);
      const response = await studentService.upsertMyProfile(profileForm);
      if (response.success) {
        setStudents((prev) => {
          const filtered = prev.filter((student) => student.id !== response.data.id);
          return [response.data, ...filtered];
        });
        setNeedsProfileSetup(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save your student profile.');
    } finally {
      setSaveProfileLoading(false);
    }
  };

  return (
    <StudentLayout
      title="Student Directory"
      subtitle="1st, 2nd, 3rd and 4th year student records with contact options"
    >

        {loading && <div className="directory-state">Loading student details...</div>}
        {error && <div className="directory-error">{error}</div>}

        {!loading && !error && (
          <div className="directory-sections">
            {needsProfileSetup && (
              <section className="directory-year-card">
                <h2>Complete Your Student Profile</h2>
                <p className="directory-empty">Your student record is missing. Save your details to appear in the year-wise directory.</p>
                <form className="profile-setup-grid" onSubmit={handleSaveProfile}>
                  <input
                    type="text"
                    placeholder="Roll No"
                    value={profileForm.enrollmentNo}
                    onChange={(e) => handleProfileChange('enrollmentNo', e.target.value)}
                    required
                    disabled={saveProfileLoading}
                  />
                  <input
                    type="text"
                    placeholder="Branch"
                    value={profileForm.branch}
                    onChange={(e) => handleProfileChange('branch', e.target.value)}
                    required
                    disabled={saveProfileLoading}
                  />
                  <select
                    value={profileForm.academicYear}
                    onChange={(e) => handleProfileChange('academicYear', Number(e.target.value))}
                    disabled={saveProfileLoading}
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Course"
                    value={profileForm.course}
                    onChange={(e) => handleProfileChange('course', e.target.value)}
                    required
                    disabled={saveProfileLoading}
                  />
                  <input
                    type="text"
                    placeholder="Mobile No"
                    value={profileForm.mobileNo}
                    onChange={(e) => handleProfileChange('mobileNo', e.target.value)}
                    required
                    disabled={saveProfileLoading}
                  />
                  <input
                    type="text"
                    placeholder="House"
                    value={profileForm.house}
                    onChange={(e) => handleProfileChange('house', e.target.value)}
                    required
                    disabled={saveProfileLoading}
                  />
                  <button type="submit" disabled={saveProfileLoading}>
                    {saveProfileLoading ? 'Saving...' : 'Save and Show in Directory'}
                  </button>
                </form>
              </section>
            )}

            {YEAR_SECTIONS.map((year) => (
              <section key={year} className="directory-year-card">
                <h2>{getYearLabel(year)}</h2>
                {studentsByYear[year].length === 0 ? (
                  <p className="directory-empty">No students found in {getYearLabel(year)}.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="directory-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Student ID</th>
                          <th>Roll No</th>
                          <th>Email</th>
                          <th>Course</th>
                          <th>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsByYear[year].map((student) => (
                          <tr key={student.id}>
                            <td>
                              <Link to={`/students/${student.id}`} className="directory-name-link">
                                {student.userName}
                              </Link>
                            </td>
                            <td>{student.id}</td>
                            <td>{student.enrollmentNo}</td>
                            <td>{student.userEmail}</td>
                            <td>{student.course}</td>
                            <td>
                              <div className="contact-actions">
                                <a href={`mailto:${student.userEmail}`}>Email</a>
                                <a href={`tel:${student.mobileNo}`}>Call</a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
    </StudentLayout>
  );
};

export default StudentDirectory;
