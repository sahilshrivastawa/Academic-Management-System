import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { facultyService } from '../services/facultyService';
import type { FacultyDirectory } from '../types';
import './StudentDirectory.css';

const FacultyProfile = () => {
  const { facultyId } = useParams();
  const [faculty, setFaculty] = useState<FacultyDirectory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFaculty = async () => {
      if (!facultyId) {
        setError('Faculty ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await facultyService.getById(Number(facultyId));
        if (response) {
          setFaculty(response);
        } else {
          setError('Faculty record not found.');
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message || 'Failed to load faculty profile');
      } finally {
        setLoading(false);
      }
    };

    loadFaculty();
  }, [facultyId]);

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-topbar">
          <Link to="/faculty/directory" className="profile-back-link">← Back to Faculty Directory</Link>
          <span className="profile-badge">Admin View</span>
        </div>

        <div className="profile-hero">
          <h1>{faculty?.name || 'Faculty Dashboard'}</h1>
          <p>
            {faculty
              ? `${faculty.email} • ${faculty.designation}`
              : 'Select a faculty member from the directory to inspect the full profile.'}
          </p>
          {faculty && (
            <div className="profile-badges">
              <span className="profile-badge">{faculty.designation}</span>
              <span className="profile-badge">{faculty.department}</span>
              <span className="profile-badge">{faculty.houseCoordinator || 'House Coordinator N/A'}</span>
            </div>
          )}
        </div>

        {loading && <div className="directory-state">Loading faculty dashboard...</div>}
        {error && <div className="directory-error">{error}</div>}

        {!loading && !error && faculty && (
          <div className="profile-grid">
            <div className="profile-card">
              <h3>Identity</h3>
              <p><strong>Name:</strong> {faculty.name}</p>
              <p><strong>Faculty ID:</strong> {faculty.id}</p>
              <p><strong>User ID:</strong> {faculty.userId}</p>
              <p><strong>Email:</strong> {faculty.email}</p>
            </div>

            <div className="profile-card">
              <h3>Academic Details</h3>
              <p><strong>Designation:</strong> {faculty.designation}</p>
              <p><strong>Department:</strong> {faculty.department}</p>
              <p><strong>House Coordinator:</strong> {faculty.houseCoordinator || 'Not Assigned'}</p>
              <p><strong>Mobile No:</strong> {faculty.mobileNo}</p>
            </div>

            <div className="profile-card">
              <h3>Contact</h3>
              <p>Use these quick actions to reach the selected faculty member directly.</p>
              <div className="profile-actions">
                <a href={`mailto:${faculty.email}`}>Email</a>
                <a href={`tel:${faculty.mobileNo}`}>Call</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyProfile;
