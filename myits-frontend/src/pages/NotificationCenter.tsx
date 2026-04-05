import StudentLayout from '../components/StudentLayout';
import './StudentDirectory.css';

const NotificationCenter = () => {
  return (
    <StudentLayout
      title="Notification Center"
      subtitle="All academic and communication alerts in one place"
    >
      <div className="directory-year-card">
        <div className="table-wrapper">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Notification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Today, 09:20 AM</td><td>Attendance</td><td>Your attendance dropped by 2% this week.</td><td>Unread</td></tr>
              <tr><td>Today, 08:00 AM</td><td>Assignment</td><td>Assignment 2 due in 2 days.</td><td>Unread</td></tr>
              <tr><td>Yesterday</td><td>Course</td><td>New notes uploaded for Programming.</td><td>Read</td></tr>
              <tr><td>Yesterday</td><td>Communication</td><td>You received a message from a senior student.</td><td>Read</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
};

export default NotificationCenter;
