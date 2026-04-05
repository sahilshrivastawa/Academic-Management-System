import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [role, setRole] = useState<'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST'>('STUDENT');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMobileNo, setResetMobileNo] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetOtpLoading, setResetOtpLoading] = useState(false);
  const [resetOtpHint, setResetOtpHint] = useState('');
  const [resetOtpRequested, setResetOtpRequested] = useState(false);
  const [resetResendCooldown, setResetResendCooldown] = useState(0);
  const [resetRole, setResetRole] = useState<'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST'>('STUDENT');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendCooldown]);

  useEffect(() => {
    if (resetResendCooldown <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setResetResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resetResendCooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const authResponse = await authService.login({
        email: email.trim().toLowerCase(),
        password,
        role,
        mobileNo: mobileNo.trim(),
        otp: otp.trim(),
      });
      if (authResponse.token) {
        login(authResponse);
        navigate('/dashboard');
      } else {
        setError('Login failed');
      }
    } catch (err: unknown) {
      const loginError = err as { response?: { data?: { message?: string } } };
      setError(loginError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobileNo = mobileNo.trim();

    if (!normalizedEmail || !normalizedMobileNo) {
      setError('Enter email and mobile number first to send OTP.');
      return;
    }

    try {
      setOtpLoading(true);
      setError('');
      const response = await authService.sendOtp({
        email: normalizedEmail,
        mobileNo: normalizedMobileNo,
        purpose: 'LOGIN',
      });
      if (response.success) {
        setOtpRequested(true);
        setResendCooldown(30);
        setSuccessMessage(`OTP sent to ${normalizedMobileNo} for login.`);
        setOtpHint(response.data.otpForTesting ? `Dev OTP: ${response.data.otpForTesting}` : 'OTP sent successfully');
      }
    } catch (err: unknown) {
      const otpErr = err as { response?: { data?: { message?: string } } };
      setError(otpErr.response?.data?.message || 'Failed to send login OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    const normalizedEmail = resetEmail.trim().toLowerCase();
    const normalizedMobileNo = resetMobileNo.trim();

    if (!normalizedEmail || !normalizedMobileNo) {
      setError('Enter reset email and mobile number first to send OTP.');
      return;
    }

    try {
      setResetOtpLoading(true);
      setError('');
      const response = await authService.sendOtp({
        email: normalizedEmail,
        mobileNo: normalizedMobileNo,
        purpose: 'RESET_PASSWORD',
      });
      if (response.success) {
        setResetOtpRequested(true);
        setResetResendCooldown(30);
        setSuccessMessage(`OTP sent to ${normalizedMobileNo} for password reset.`);
        setResetOtpHint(response.data.otpForTesting ? `Dev OTP: ${response.data.otpForTesting}` : 'OTP sent successfully');
      }
    } catch (err: unknown) {
      const otpErr = err as { response?: { data?: { message?: string } } };
      setError(otpErr.response?.data?.message || 'Failed to send reset OTP.');
    } finally {
      setResetOtpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccessMessage('');
    setResetLoading(true);

    try {
      const response = await authService.resetPassword({
        email: resetEmail.trim().toLowerCase(),
        role: resetRole,
        mobileNo: resetMobileNo.trim(),
        otp: resetOtp.trim(),
        newPassword,
      });

      if (response.success) {
        setSuccessMessage('Password reset successful. Please login with your new password.');
        setShowForgotPassword(false);
        setPassword('');
        setNewPassword('');
        setResetOtp('');
        setResetOtpHint('');
        setEmail(resetEmail);
        setRole(resetRole);
      }
    } catch (err: unknown) {
      const resetErr = err as { response?: { data?: { message?: string } } };
      setError(resetErr.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>MyITS Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (otpRequested) {
                  setOtpRequested(false);
                  setResendCooldown(0);
                  setOtp('');
                  setOtpHint('');
                }
              }}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNo">Mobile Number</label>
            <input
              type="text"
              id="mobileNo"
              value={mobileNo}
              onChange={(e) => {
                setMobileNo(e.target.value);
                if (otpRequested) {
                  setOtpRequested(false);
                  setResendCooldown(0);
                  setOtp('');
                  setOtpHint('');
                }
              }}
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
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                disabled={loading || otpLoading}
              />
            </div>
            <button
              type="button"
              className="btn-secondary otp-btn"
              disabled={loading || otpLoading || (otpRequested && resendCooldown > 0)}
              onClick={handleSendLoginOtp}
            >
              {otpLoading
                ? 'Sending...'
                : otpRequested
                  ? (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP')
                  : 'Send OTP'}
            </button>
          </div>

          {otpHint && <div className="otp-hint">{otpHint}</div>}

          <div className="forgot-password-row">
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setShowForgotPassword((prev) => !prev);
                setError('');
                setSuccessMessage('');
                setResetEmail(email);
                setResetMobileNo(mobileNo);
                setResetRole(role);
                setResetOtpRequested(false);
                setResetResendCooldown(0);
                setResetOtpHint('');
                setResetOtp('');
              }}
              disabled={loading || resetLoading || otpLoading || resetOtpLoading}
            >
              Forgot Password?
            </button>
          </div>

          {showForgotPassword && (
            <div className="forgot-password-box">
              <h4>Reset Password</h4>
              <div className="form-group">
                <label htmlFor="resetEmail">Email</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (resetOtpRequested) {
                      setResetOtpRequested(false);
                      setResetResendCooldown(0);
                      setResetOtpHint('');
                      setResetOtp('');
                    }
                  }}
                  required
                  disabled={resetLoading || resetOtpLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="resetRole">Role</label>
                <select
                  id="resetRole"
                  value={resetRole}
                  onChange={(e) => setResetRole(e.target.value as 'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST')}
                  disabled={resetLoading || resetOtpLoading}
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Admin</option>
                  <option value="GUEST">Guest</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="resetMobileNo">Mobile Number</label>
                <input
                  type="text"
                  id="resetMobileNo"
                  value={resetMobileNo}
                  onChange={(e) => {
                    setResetMobileNo(e.target.value);
                    if (resetOtpRequested) {
                      setResetOtpRequested(false);
                      setResetResendCooldown(0);
                      setResetOtpHint('');
                      setResetOtp('');
                    }
                  }}
                  required
                  disabled={resetLoading || resetOtpLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars with letter, number, special char"
                  required
                  disabled={resetLoading || resetOtpLoading}
                />
              </div>

              <div className="otp-row">
                <div className="form-group otp-group">
                  <label htmlFor="resetOtp">OTP</label>
                  <input
                    type="text"
                    id="resetOtp"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                    disabled={resetLoading || resetOtpLoading}
                  />
                </div>
                <button
                  type="button"
                  className="btn-secondary otp-btn"
                  disabled={resetLoading || resetOtpLoading || (resetOtpRequested && resetResendCooldown > 0)}
                  onClick={handleSendResetOtp}
                >
                  {resetOtpLoading
                    ? 'Sending...'
                    : resetOtpRequested
                      ? (resetResendCooldown > 0 ? `Resend in ${resetResendCooldown}s` : 'Resend OTP')
                      : 'Send OTP'}
                </button>
              </div>

              {resetOtpHint && <div className="otp-hint">{resetOtpHint}</div>}

              <button type="button" className="btn-secondary" disabled={resetLoading} onClick={handleResetPassword}>
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST')}
              disabled={loading}
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Admin</option>
              <option value="GUEST">Guest</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || otpLoading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
