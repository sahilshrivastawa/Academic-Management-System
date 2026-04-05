import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { studentService } from '../services/studentService';
import type { StudentAiDashboard } from '../types';
import './StudentDirectory.css';

const LiveAttendanceTracking = () => {
  const [aiDashboard, setAiDashboard] = useState<StudentAiDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const response = await studentService.getAiDashboard();
        if (response.success) {
          setAiDashboard(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  return (
    <StudentLayout
      title="Live Attendance Tracking"
      subtitle="Check your latest attendance status anytime"
    >
      {loading ? (
        <div className="directory-state">Loading attendance data...</div>
      ) : (
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Current Attendance</h3>
            <p className="student-placeholder-value">
              {aiDashboard ? `${aiDashboard.attendancePercentage}%` : 'N/A'}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Predicted Attendance</h3>
            <p className="student-placeholder-value">
              {aiDashboard ? `${aiDashboard.attendancePrediction}%` : 'N/A'}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Attendance Status</h3>
            <p className="student-placeholder-value">
              {aiDashboard && aiDashboard.attendancePercentage >= 75
                ? 'Safe'
                : 'Below Required'}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>AI Note</h3>
            <p>{aiDashboard?.summary || 'Attendance insights are not available yet.'}</p>
          </div>
        </div>
      )}

      <div className="directory-year-card" style={{ marginTop: '20px' }}>
        <h2>Recent Attendance Log (Preview)</h2>
        <div className="table-wrapper">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>27 Mar 2026</td><td>Mathematics</td><td>Present</td></tr>
              <tr><td>26 Mar 2026</td><td>Physics</td><td>Present</td></tr>
              <tr><td>25 Mar 2026</td><td>Programming</td><td>Absent</td></tr>
              <tr><td>24 Mar 2026</td><td>Chemistry</td><td>Present</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
};

export default LiveAttendanceTracking;
