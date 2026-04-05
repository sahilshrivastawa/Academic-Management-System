import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FacultyLayout from '../components/FacultyLayout';
import { facultyService } from '../services/facultyService';
import type { FacultyDirectory } from '../types';
import './StudentDirectory.css';

const Faculty = () => {
  const [faculty, setFaculty] = useState<FacultyDirectory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const response = await facultyService.getAll();
        setFaculty(response);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to fetch faculty directory');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const handleImport = async () => {
    if (!importFile) {
      setImportMessage('Select a CSV or Excel file first.');
      return;
    }

    try {
      setImportLoading(true);
      setImportMessage('');
      const result = await facultyService.importBulk(importFile);
      setImportMessage(`Imported: ${result.createdFaculty} created, ${result.updatedFaculty} updated, ${result.skippedRows} skipped.`);
        const refreshed = await facultyService.getAll();
        setFaculty(refreshed);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setImportMessage(error.response?.data?.message || 'Faculty import failed');
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading faculty directory...</div>;

  return (
    <FacultyLayout
      title="Faculty Directory"
      subtitle="Internal faculty communication directory"
    >

      {error && <div className="error-banner">{error}</div>}
      {user?.role === 'ADMIN' && (
        <div className="directory-year-card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginTop: 0 }}>Upload Faculty CSV/Excel</h3>
          <p style={{ marginBottom: '0.8rem' }}>
            Required columns: name, email, password (optional), designation, department, houseCoordinator, mobileNo.
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            disabled={importLoading}
          />
          <button type="button" className="btn-primary" style={{ marginLeft: '0.75rem' }} onClick={handleImport} disabled={importLoading}>
            {importLoading ? 'Importing...' : 'Import Faculty'}
          </button>
          {importMessage && <div className="success-message" style={{ marginTop: '0.8rem' }}>{importMessage}</div>}
        </div>
      )}

      <div className="directory-year-card">
        <div className="table-wrapper">
          <table className="directory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Mobile</th>
              <th>House Coordinator</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((item) => (
              <tr
                key={item.id}
                className="clickable-row"
                onClick={() => navigate(`/faculty/${item.id}`)}
              >
                <td>
                  <Link to={`/faculty/${item.id}`} className="directory-name-link">
                    {item.name}
                  </Link>
                </td>
                <td>{item.email}</td>
                <td>{item.designation}</td>
                <td>{item.department}</td>
                <td>{item.mobileNo}</td>
                <td>{item.houseCoordinator}</td>
                <td>
                  <Link to={`/faculty/${item.id}`} style={{ marginRight: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                    View
                  </Link>
                  <a href={`mailto:${item.email}`} style={{ marginRight: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                    Email
                  </a>
                  <a href={`tel:${item.mobileNo}`} style={{ color: '#4f46e5', fontWeight: 600 }}>
                    Call
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default Faculty;
