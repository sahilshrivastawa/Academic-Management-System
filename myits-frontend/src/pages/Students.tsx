import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import type { Student, StudentMessage, StudentAiDashboard, AttendancePrediction, ChatMessage, AcademicPerformanceResult, StudentBulkImportResult } from '../types';
import { useAuth } from '../context/AuthContext';
import './Students.css';

const Students = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const normalizedRole = (user?.role || '').toUpperCase();
  const canManageStudents = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';
  const canSendStudentMessages = normalizedRole === 'STUDENT' || normalizedRole === 'ROLE_STUDENT';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState<Student | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<StudentMessage[]>([]);
  const [aiDashboard, setAiDashboard] = useState<StudentAiDashboard | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pastAttendanceInput, setPastAttendanceInput] = useState('82, 80, 78, 81, 79');
  const [attendancePrediction, setAttendancePrediction] = useState<AttendancePrediction | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hi! Ask me about your attendance, courses, performance, or suggestions.' }
  ]);
  const [analyzerAttendance, setAnalyzerAttendance] = useState(80);
  const [analyzerActivity, setAnalyzerActivity] = useState(70);
  const [analyzerCoursesInput, setAnalyzerCoursesInput] = useState('Math:78, Physics:65, Chemistry:72');
  const [analyzerResult, setAnalyzerResult] = useState<AcademicPerformanceResult | null>(null);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [analyzerError, setAnalyzerError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<StudentBulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    userId: 0,
    enrollmentNo: '',
    branch: '',
    academicYear: 1,
    course: '',
    mobileNo: '',
    house: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [page]);

  useEffect(() => {
    if (canSendStudentMessages) {
      fetchInboxMessages();
      fetchAiDashboard();
    }
  }, [canSendStudentMessages]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAll(page, 25);
      if (response.success) {
        setStudents(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchInboxMessages = async () => {
    try {
      const response = await studentService.getInbox();
      if (response.success) {
        setInboxMessages(response.data);
      }
    } catch {
      setInboxMessages([]);
    }
  };

  const fetchAiDashboard = async () => {
    try {
      setAiLoading(true);
      const response = await studentService.getAiDashboard();
      if (response.success) {
        setAiDashboard(response.data);
      }
    } catch {
      setAiDashboard(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePredictAttendance = async () => {
    const parsedValues = pastAttendanceInput
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));

    if (parsedValues.length < 3) {
      setPredictError('Enter at least 3 attendance values, separated by commas.');
      setAttendancePrediction(null);
      return;
    }

    if (parsedValues.some((value) => value < 0 || value > 100)) {
      setPredictError('Attendance values must be between 0 and 100.');
      setAttendancePrediction(null);
      return;
    }

    try {
      setPredictLoading(true);
      setPredictError('');
      const response = await studentService.predictAttendance({
        pastAttendanceList: parsedValues,
      });

      if (response.success) {
        setAttendancePrediction(response.data);
      }
    } catch (err: any) {
      setPredictError(err.response?.data?.message || 'Failed to predict attendance.');
      setAttendancePrediction(null);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    const message = chatInput.trim();
    if (!message || chatLoading) {
      return;
    }

    setChatMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatInput('');

    try {
      setChatLoading(true);
      const response = await studentService.askChatbot({ message });

      if (response.success) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: response.data.answer }]);
      } else {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: 'I could not process that right now.' }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Chatbot service is unavailable right now.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAnalyzePerformance = async () => {
    const coursePairs = analyzerCoursesInput
      .split(',')
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0);

    const courses = coursePairs
      .map((pair) => {
        const [courseNameRaw, scoreRaw] = pair.split(':').map((part) => part?.trim() ?? '');
        return {
          courseName: courseNameRaw,
          score: Number(scoreRaw),
        };
      })
      .filter((course) => course.courseName && !Number.isNaN(course.score));

    if (courses.length === 0) {
      setAnalyzerError('Enter courses in format: Subject:Score, Subject:Score');
      setAnalyzerResult(null);
      return;
    }

    if (analyzerAttendance < 0 || analyzerAttendance > 100 || analyzerActivity < 0 || analyzerActivity > 100) {
      setAnalyzerError('Attendance and activity must be between 0 and 100.');
      setAnalyzerResult(null);
      return;
    }

    if (courses.some((course) => course.score < 0 || course.score > 100)) {
      setAnalyzerError('All course scores must be between 0 and 100.');
      setAnalyzerResult(null);
      return;
    }

    try {
      setAnalyzerLoading(true);
      setAnalyzerError('');
      const response = await studentService.analyzePerformance({
        attendance: analyzerAttendance,
        activity: analyzerActivity,
        courses,
      });

      if (response.success) {
        setAnalyzerResult(response.data);
      } else {
        setAnalyzerResult(null);
        setAnalyzerError('Failed to analyze performance.');
      }
    } catch (err: any) {
      setAnalyzerResult(null);
      setAnalyzerError(err.response?.data?.message || 'Failed to analyze performance.');
    } finally {
      setAnalyzerLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await studentService.delete(id);
      if (response.success) {
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleEdit = (student: Student) => {
    if (!canManageStudents) return;

    setEditingStudent(student);
    setFormData({
      userId: student.userId,
      enrollmentNo: student.enrollmentNo,
      branch: student.branch,
      academicYear: student.academicYear,
      course: student.course,
      mobileNo: student.mobileNo,
      house: student.house
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    if (!canManageStudents) return;

    setEditingStudent(null);
    setFormData({
      userId: 0,
      enrollmentNo: '',
      branch: '',
      academicYear: 1,
      course: '',
      mobileNo: '',
      house: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageStudents) return;
    
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, formData);
      } else {
        await studentService.create(formData);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save student');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleChooseImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);
      const response = await studentService.bulkImport(file);
      if (response.success) {
        setImportResult(response.data);
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to import student file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openMessageModal = (student: Student) => {
    setSelectedReceiver(student);
    setMessageSubject('');
    setMessageText('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReceiver) {
      return;
    }

    try {
      setSendingMessage(true);
      const response = await studentService.sendMessage({
        receiverStudentId: selectedReceiver.id,
        subject: messageSubject,
        message: messageText,
      });

      if (response.success) {
        setShowMessageModal(false);
        setSelectedReceiver(null);
        setMessageSubject('');
        setMessageText('');
        alert('Message sent successfully');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Internal student communication directory (junior ↔ senior support)</p>
        </div>
        {canManageStudents && (
          <div className="admin-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard/admin')}
              className="btn-back"
            >
              ← Back to Admin Dashboard
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <button type="button" onClick={handleChooseImportFile} className="btn-import" disabled={importing}>
              {importing ? 'Importing...' : 'Upload CSV/Excel'}
            </button>
            <button onClick={handleAddNew} className="btn-add">
              + Add Student
            </button>
          </div>
        )}
      </div>

      {canManageStudents && (
        <div className="import-hint-box">
          <p><strong>Bulk Import Format:</strong> name,email,password,enrollmentNo,branch,academicYear,course,mobileNo,house</p>
          <p>Upload one `.csv` or `.xlsx` file. Students can login directly with uploaded email/password credentials.</p>
        </div>
      )}

      {!canManageStudents && (
        <div className="import-hint-box">
          <p><strong>Import Access:</strong> CSV/Excel student upload is available only for Admin login.</p>
          <p>Current role: {user?.role || 'Unknown'}</p>
        </div>
      )}

      {canManageStudents && importResult && (
        <div className="import-result-box">
          <p><strong>Total Rows:</strong> {importResult.totalRows}</p>
          <p><strong>Created:</strong> {importResult.createdStudents}</p>
          <p><strong>Updated:</strong> {importResult.updatedStudents}</p>
          <p><strong>Skipped:</strong> {importResult.skippedRows}</p>
          {importResult.messages.length > 0 && (
            <ul>
              {importResult.messages.slice(0, 8).map((message, index) => (
                <li key={`${message}-${index}`}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {canSendStudentMessages && (
        <div className="ai-dashboard-grid">
          <div className="ai-card ai-summary-card">
            <h2>AI Performance Summary</h2>
            {aiLoading ? (
              <p>Generating summary...</p>
            ) : (
              <>
                <p>{aiDashboard?.summary || 'AI summary is currently unavailable.'}</p>
                <div className="ai-metrics-grid">
                  <div className="ai-metric">
                    <span>Enrolled Courses</span>
                    <strong>{aiDashboard?.enrolledCourses ?? '-'}</strong>
                  </div>
                  <div className="ai-metric">
                    <span>Attendance %</span>
                    <strong>{aiDashboard ? `${aiDashboard.attendancePercentage}%` : '-'}</strong>
                  </div>
                  <div className="ai-metric">
                    <span>Pending Assignments</span>
                    <strong>{aiDashboard?.pendingAssignments ?? '-'}</strong>
                  </div>
                  <div className="ai-metric">
                    <span>Messages</span>
                    <strong>{aiDashboard?.messages ?? '-'}</strong>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="ai-card">
            <h2>AI Attendance Prediction</h2>
            <p style={{ marginBottom: '10px' }}>Input past attendance list (comma-separated):</p>
            <textarea
              className="ai-input"
              value={pastAttendanceInput}
              onChange={(e) => setPastAttendanceInput(e.target.value)}
              placeholder="Example: 82, 80, 78, 81, 79"
              rows={3}
              disabled={predictLoading}
            />
            <button
              type="button"
              className="btn-add ai-predict-btn"
              onClick={handlePredictAttendance}
              disabled={predictLoading}
            >
              {predictLoading ? 'Predicting...' : 'Predict Attendance'}
            </button>

            {predictError && <p className="ai-error">{predictError}</p>}

            {attendancePrediction && (
              <div className="ai-prediction-result">
                <p className="ai-large-value">{attendancePrediction.predictedAttendance}%</p>
                <p><strong>Risk Level:</strong> {attendancePrediction.riskLevel}</p>
                <p><strong>AI Warning:</strong> {attendancePrediction.aiWarning}</p>
              </div>
            )}
          </div>

          <div className="ai-card">
            <h2>AI Academic Progress Analysis</h2>
            <p>{aiDashboard?.academicProgressAnalysis || 'Progress analysis is currently unavailable.'}</p>
          </div>

          <div className="ai-card ai-performance-card">
            <h2>AI Academic Performance Analyzer</h2>
            <div className="ai-performance-inputs">
              <label>
                Attendance (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={analyzerAttendance}
                  onChange={(e) => setAnalyzerAttendance(Number(e.target.value))}
                  disabled={analyzerLoading}
                />
              </label>

              <label>
                Activity (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={analyzerActivity}
                  onChange={(e) => setAnalyzerActivity(Number(e.target.value))}
                  disabled={analyzerLoading}
                />
              </label>

              <label>
                Courses (format: Subject:Score)
                <textarea
                  className="ai-input"
                  rows={3}
                  value={analyzerCoursesInput}
                  onChange={(e) => setAnalyzerCoursesInput(e.target.value)}
                  placeholder="Math:78, Physics:65, Chemistry:72"
                  disabled={analyzerLoading}
                />
              </label>

              <button
                type="button"
                className="btn-add ai-predict-btn"
                onClick={handleAnalyzePerformance}
                disabled={analyzerLoading}
              >
                {analyzerLoading ? 'Analyzing...' : 'Analyze Performance'}
              </button>
            </div>

            {analyzerError && <p className="ai-error">{analyzerError}</p>}

            {analyzerResult && (
              <div className="ai-performance-result">
                <p><strong>Performance Level:</strong> {analyzerResult.performanceLevel}</p>
                <p><strong>Weak Subject:</strong> {analyzerResult.weakSubject}</p>
                <p><strong>Recommendation:</strong> {analyzerResult.recommendation}</p>
              </div>
            )}
          </div>

          <div className="ai-card">
            <h2>AI Recommendations</h2>
            {aiDashboard?.recommendations?.length ? (
              <ul className="ai-recommendations">
                {aiDashboard.recommendations.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No recommendations available right now.</p>
            )}
          </div>

          <div className="ai-card ai-chatbot-card">
            <h2>AI Chatbot Assistant</h2>
            <p>Ask about my attendance, my courses, my performance, and suggestions.</p>
            <div className="chatbot-window">
              {chatMessages.map((chat, index) => (
                <div
                  key={`${chat.role}-${index}`}
                  className={`chat-bubble ${chat.role === 'user' ? 'chat-user' : 'chat-assistant'}`}
                >
                  {chat.text}
                </div>
              ))}
              {chatLoading && <div className="chat-bubble chat-assistant">Thinking...</div>}
            </div>
            <div className="chatbot-input-row">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={aiDashboard?.chatbotPrompt || 'Ask a question...'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                disabled={chatLoading}
              />
              <button
                type="button"
                className="btn-add"
                onClick={handleSendChatMessage}
                disabled={chatLoading}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Year</th>
              <th>Course</th>
              <th>Mobile</th>
              <th>House</th>
              {canManageStudents && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <Link to={`/students/${student.id}`} className="directory-name-link">
                    {student.id}
                  </Link>
                </td>
                <td>
                  <Link to={`/students/${student.id}`} className="directory-name-link">
                    {student.userName}
                  </Link>
                </td>
                <td>{student.userEmail}</td>
                <td>{student.academicYear}</td>
                <td>{student.course}</td>
                <td>{student.mobileNo}</td>
                <td>{student.house}</td>
                {canManageStudents && (
                  <td>
                    <Link to={`/students/${student.id}`} className="btn-edit" style={{ marginRight: '0.5rem' }}>
                      View
                    </Link>
                    <button 
                      onClick={() => handleEdit(student)} 
                      className="btn-edit"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)} 
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                )}
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
          disabled={students.length < 25}
        >
          Next
        </button>
      </div>

      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Internal Communication Section</h2>
        <p style={{ marginBottom: '1rem', color: '#64748b' }}>
          All 1st, 2nd, 3rd and 4th year students can connect here and help each other.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Year</th>
              <th>Mobile</th>
              <th>House</th>
              <th>Connect</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={`comm-${student.id}`}>
                <td>
                  <Link to={`/students/${student.id}`} className="directory-name-link">
                    {student.userName}
                  </Link>
                </td>
                <td>{student.userEmail}</td>
                <td>{student.course}</td>
                <td>{student.academicYear}</td>
                <td>{student.mobileNo}</td>
                <td>{student.house}</td>
                <td>
                  {canSendStudentMessages ? (
                    <button
                      onClick={() => openMessageModal(student)}
                      className="btn-edit"
                    >
                      Message
                    </button>
                  ) : (
                    <>
                      <a href={`mailto:${student.userEmail}`} className="btn-edit" style={{ marginRight: '0.5rem' }}>
                        Email
                      </a>
                      <a href={`tel:${student.mobileNo}`} className="btn-add">
                        Call
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canSendStudentMessages && (
        <div className="table-container" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>My Received Messages</h2>
          {inboxMessages.length === 0 ? (
            <p style={{ color: '#64748b' }}>No messages yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {inboxMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td>{msg.senderName}</td>
                    <td>{msg.senderEmail}</td>
                    <td>{msg.subject}</td>
                    <td>{msg.message}</td>
                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {canManageStudents && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="number"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Enrollment No</label>
                <input
                  type="text"
                  name="enrollmentNo"
                  value={formData.enrollmentNo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Academic Year</label>
                <input
                  type="number"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  min="1"
                  max="8"
                  required
                />
              </div>
              <div className="form-group">
                <label>Course</label>
                <input type="text" name="course" value={formData.course} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Mobile No</label>
                <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>House</label>
                <input type="text" name="house" value={formData.house} onChange={handleChange} required />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {canSendStudentMessages && showMessageModal && selectedReceiver && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Send Message to {selectedReceiver.userName}</h2>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  required
                  disabled={sendingMessage}
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  required
                  disabled={sendingMessage}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowMessageModal(false)} className="btn-cancel" disabled={sendingMessage}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={sendingMessage}>
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
