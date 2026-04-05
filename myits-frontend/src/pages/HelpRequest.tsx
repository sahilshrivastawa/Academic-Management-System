import { useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import './StudentDirectory.css';

const HelpRequest = () => {
  const [queryType, setQueryType] = useState('Academic');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSubject('');
    setMessage('');
  };

  return (
    <StudentLayout
      title="Raise Query / Help Request"
      subtitle="Submit your issue and track support response"
    >
      <div className="directory-year-card">
        <form onSubmit={handleSubmit} className="message-form">
          <label>
            Query Type
            <select value={queryType} onChange={(e) => setQueryType(e.target.value)}>
              <option value="Academic">Academic</option>
              <option value="Attendance">Attendance</option>
              <option value="Fees">Fees</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Subject
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter short subject"
              required
            />
          </label>

          <label>
            Message
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue/request"
              required
            />
          </label>

          <button type="submit" className="mini-btn">Submit Request</button>
        </form>

        {submitted && (
          <div style={{ marginTop: '12px', color: '#166534', fontWeight: 600 }}>
            Request submitted successfully. Support team will contact you soon.
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default HelpRequest;
