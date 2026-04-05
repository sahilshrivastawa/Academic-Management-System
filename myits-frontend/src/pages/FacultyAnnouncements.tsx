import { useState } from 'react';
import FacultyLayout from '../components/FacultyLayout';

const FacultyAnnouncements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [posted, setPosted] = useState(false);

  const handlePost = (event: React.FormEvent) => {
    event.preventDefault();
    setPosted(true);
    setTitle('');
    setMessage('');
  };

  return (
    <FacultyLayout title="Announcements" subtitle="Create and manage student announcements">
      <div className="dashboard-card" style={{ maxWidth: '760px' }}>
        <h3>Create Announcement</h3>
        <form onSubmit={handlePost} className="message-form">
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Announcement title"
              required
            />
          </label>

          <label>
            Message
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write announcement details"
              required
            />
          </label>

          <button type="submit" className="mini-btn">Post</button>
        </form>

        {posted && (
          <p style={{ marginTop: '10px', color: '#166534', fontWeight: 600 }}>
            Announcement posted (frontend placeholder).
          </p>
        )}
      </div>
    </FacultyLayout>
  );
};

export default FacultyAnnouncements;
