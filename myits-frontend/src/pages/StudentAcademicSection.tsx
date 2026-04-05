import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import type { StudentAiDashboard, Student } from '../types';
import './StudentDirectory.css';

type SectionKey =
  | 'assignments'
  | 'timetable'
  | 'notes'
  | 'enrolled-courses'
  | 'performance-analysis'
  | 'fees-status';

interface StudentAcademicSectionProps {
  section: SectionKey;
}

const StudentAcademicSection = ({ section }: StudentAcademicSectionProps) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [aiDashboard, setAiDashboard] = useState<StudentAiDashboard | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) {
        return;
      }

      const [studentsRes, aiRes] = await Promise.allSettled([
        studentService.getAllDirectoryRecords(),
        studentService.getAiDashboard(),
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value.success) {
        const found = studentsRes.value.data.find((item) => item.userEmail.toLowerCase() === user.email.toLowerCase()) || null;
        setStudent(found);
      }

      if (aiRes.status === 'fulfilled' && aiRes.value.success) {
        setAiDashboard(aiRes.value.data);
      }
    };

    load();
  }, [user?.email]);

  if (section === 'assignments') {
    return (
      <StudentLayout title="Assignment Submission" subtitle="Track submission progress and due dates">
        <div className="directory-year-card">
          <div className="table-wrapper">
            <table className="directory-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Course</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Assignment 1</td><td>{student?.course || 'Course 1'}</td><td>05 Apr 2026</td><td>Submitted</td></tr>
                <tr><td>Assignment 2</td><td>{student?.course || 'Course 2'}</td><td>12 Apr 2026</td><td>Pending</td></tr>
                <tr><td>Assignment 3</td><td>{student?.course || 'Course 3'}</td><td>20 Apr 2026</td><td>In Progress</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (section === 'timetable') {
    return (
      <StudentLayout title="Student Timetable" subtitle="Weekly class schedule">
        <div className="directory-year-card">
          <div className="table-wrapper">
            <table className="directory-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>9:00-10:00</th>
                  <th>10:00-11:00</th>
                  <th>11:30-12:30</th>
                  <th>2:00-3:00</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Monday</td><td>Math</td><td>Physics</td><td>Lab</td><td>English</td></tr>
                <tr><td>Tuesday</td><td>Programming</td><td>Math</td><td>Workshop</td><td>Sports</td></tr>
                <tr><td>Wednesday</td><td>Physics</td><td>Chemistry</td><td>Lab</td><td>Library</td></tr>
                <tr><td>Thursday</td><td>Programming</td><td>Math</td><td>Tutorial</td><td>Seminar</td></tr>
                <tr><td>Friday</td><td>English</td><td>Project</td><td>Lab</td><td>Mentoring</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (section === 'notes') {
    return (
      <StudentLayout title="Download Notes" subtitle="Course materials and notes downloads">
        <div className="dashboard-cards">
          <div className="dashboard-card"><h3>Mathematics Notes</h3><p>Unit-wise class notes (PDF)</p><a className="card-link" href="#">Download →</a></div>
          <div className="dashboard-card"><h3>Physics Notes</h3><p>Lecture + practical references</p><a className="card-link" href="#">Download →</a></div>
          <div className="dashboard-card"><h3>Programming Notes</h3><p>Concept sheet + examples</p><a className="card-link" href="#">Download →</a></div>
        </div>
      </StudentLayout>
    );
  }

  if (section === 'enrolled-courses') {
    return (
      <StudentLayout title="Enrolled Course" subtitle="Your currently enrolled course details">
        <div className="dashboard-cards">
          <div className="dashboard-card"><h3>Course</h3><p>{student?.course || 'Not assigned'}</p></div>
          <div className="dashboard-card"><h3>Academic Year</h3><p>{student?.academicYear || '-'}</p></div>
        </div>
      </StudentLayout>
    );
  }

  if (section === 'performance-analysis') {
    return (
      <StudentLayout title="Student Performance Analysis" subtitle="AI-driven performance summary">
        <div className="dashboard-cards">
          <div className="dashboard-card"><h3>Summary</h3><p>{aiDashboard?.summary || 'No data available'}</p></div>
          <div className="dashboard-card"><h3>Attendance</h3><p>{aiDashboard ? `${aiDashboard.attendancePercentage}%` : 'N/A'}</p></div>
          <div className="dashboard-card"><h3>Attendance Prediction</h3><p>{aiDashboard ? `${aiDashboard.attendancePrediction}%` : 'N/A'}</p></div>
          <div className="dashboard-card"><h3>Analysis</h3><p>{aiDashboard?.academicProgressAnalysis || 'No analysis available'}</p></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Fees Status" subtitle="Current fee payment status and due details">
      <div className="directory-year-card">
        <div className="table-wrapper">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Total Fees</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Sem 1</td><td>₹45,000</td><td>₹45,000</td><td>₹0</td><td>Paid</td></tr>
              <tr><td>Sem 2</td><td>₹45,000</td><td>₹30,000</td><td>₹15,000</td><td>Partial</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentAcademicSection;
