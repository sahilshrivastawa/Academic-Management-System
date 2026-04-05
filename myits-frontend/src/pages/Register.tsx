import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    password: '',
    email: '',
    name: '',
    role: 'STUDENT' as 'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST',
    rollNo: '',
    branch: '',
    course: '',
    designation: '',
    houseCoordinator: '',
    mobileNo: '',
    year: 1,
    house: '',
    department: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();

  const getErrorMessage = (error: unknown): string => {
    const fallbackMessage = 'Registration failed. Please try again.';

    if (!error || typeof error !== 'object') {
      return fallbackMessage;
    }

    const axiosLikeError = error as {
      response?: {
        data?: {
          message?: string;
          data?: string | Record<string, string>;
        };
      };
      message?: string;
    };

    const responseData = axiosLikeError.response?.data;

    if (responseData?.data && typeof responseData.data === 'string') {
      return responseData.data;
    }

    if (
      responseData?.data &&
      typeof responseData.data === 'object' &&
      !Array.isArray(responseData.data)
    ) {
      const fieldMessages = Object.values(responseData.data).filter(
        (value): value is string => typeof value === 'string' && value.trim().length > 0
      );

      if (fieldMessages.length > 0) {
        return fieldMessages.join(', ');
      }
    }

    if (responseData?.message && responseData.message.trim().length > 0) {
      return responseData.message;
    }

    if (axiosLikeError.message && axiosLikeError.message.trim().length > 0) {
      return axiosLikeError.message;
    }

    return fallbackMessage;
  };

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setError('');
    setSuccessMessage('');
    const normalizedEmail = formData.email.trim().toLowerCase();
    const normalizedMobileNo = formData.mobileNo.trim();

    if (!normalizedEmail || !normalizedMobileNo) {
      setError('Enter email and mobile number first to send OTP.');
      return;
    }

    try {
      setOtpLoading(true);
      const response = await authService.sendOtp({
        email: normalizedEmail,
        mobileNo: normalizedMobileNo,
        purpose: 'REGISTER',
      });

      if (response.success) {
        setOtpRequested(true);
        setResendCooldown(30);
        setSuccessMessage(`OTP sent to ${normalizedMobileNo} for registration.`);
        setOtpHint(response.data.otpForTesting ? `Dev OTP: ${response.data.otpForTesting}` : 'OTP sent successfully');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedEmail = formData.email.trim().toLowerCase();

    if (formData.role === 'GUEST') {
      if (!normalizedEmail.endsWith('@gmail.com')) {
        setError('Guest registration requires a @gmail.com email address.');
        setLoading(false);
        return;
      }
    } else if (!normalizedEmail.endsWith('@its.edu.in')) {
      setError('Student, Faculty, and Admin registration require an @its.edu.in email address.');
      setLoading(false);
      return;
    }

    if (!formData.mobileNo.trim()) {
      setError('Mobile number is required for OTP-based registration.');
      setLoading(false);
      return;
    }

    if (!formData.otp.trim()) {
      setError('OTP is required for registration.');
      setLoading(false);
      return;
    }

    if (formData.role === 'STUDENT') {
      if (!formData.rollNo || !formData.branch || !formData.course || !formData.house) {
        setError('Please fill all required student details.');
        setLoading(false);
        return;
      }
    }

    if (formData.role === 'FACULTY') {
      if (!formData.department || !formData.designation) {
        setError('Please fill all required faculty details.');
        setLoading(false);
        return;
      }
    }

    try {
      const authResponse = await authService.register({
        ...formData,
        email: normalizedEmail,
        mobileNo: formData.mobileNo.trim(),
      });
      if (authResponse.token) {
        login(authResponse);
        navigate('/dashboard');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const isOtpIdentityField = e.target.name === 'email' || e.target.name === 'mobileNo';
    const value = e.target.name === 'year' ? Number(e.target.value) : e.target.value;

    if (isOtpIdentityField && otpRequested) {
      setOtpRequested(false);
      setResendCooldown(0);
      setOtpHint('');
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: value,
        otp: '',
      }));
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>MyITS Registration</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNo">Mobile No</label>
            <input
              type="text"
              id="mobileNo"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              required
              disabled={loading || otpLoading}
            />
          </div>

          <div className="otp-row">
            <div className="form-group otp-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                disabled={loading || otpLoading}
                placeholder="Enter OTP"
              />
            </div>
            <button
              type="button"
              className="btn-secondary otp-btn"
              disabled={loading || otpLoading || (otpRequested && resendCooldown > 0)}
              onClick={handleSendOtp}
            >
              {otpLoading
                ? 'Sending...'
                : otpRequested
                  ? (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP')
                  : 'Send OTP'}
            </button>
          </div>

          {otpHint && <div className="otp-hint">{otpHint}</div>}

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Admin</option>
              <option value="GUEST">Guest</option>
            </select>
          </div>

          {formData.role === 'STUDENT' && (
            <>
              <div className="form-group">
                <label htmlFor="rollNo">Roll No</label>
                <input
                  type="text"
                  id="rollNo"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="branch">Branch</label>
                <input
                  type="text"
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="course">Course</label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="house">House</label>
                <input
                  type="text"
                  id="house"
                  name="house"
                  value={formData.house}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {formData.role === 'FACULTY' && (
            <>
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="designation">Designation *</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="houseCoordinator">House Coordinator (Optional)</label>
                <input
                  type="text"
                  id="houseCoordinator"
                  name="houseCoordinator"
                  value={formData.houseCoordinator}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading || otpLoading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
