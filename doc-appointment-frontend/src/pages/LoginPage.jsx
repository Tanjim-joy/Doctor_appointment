import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAPI, registerAPI, loading, error, setError } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const from = location.state?.from?.pathname || '/doctors';

  // Handle login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!loginForm.username || !loginForm.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await loginAPI(loginForm.username, loginForm.password);
      setSuccessMsg('Login successful! Redirecting...');
      setTimeout(() => {
        navigate(from);
      }, 1000);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Login failed');
    }
  };

  // Handle register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    // Validation
    if (!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await registerAPI({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
      });
      setSuccessMsg('Registration successful! Logging in...');
      setTimeout(() => {
        navigate(from);
      }, 1000);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const toggleTab = (isLoginTab) => {
    setIsLogin(isLoginTab);
    setLocalError('');
    setSuccessMsg('');
  };

  // Demo credentials for testing
  const demoAdminCredentials = {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Admin',
  };

  const demoDoctorCredentials = {
    email: 'doctor@example.com',
    password: 'doctor123',
    role: 'Doctor',
  };

  const demoPatientCredentials = {
    email: 'patient@example.com',
    password: 'patient123',
    role: 'Patient',
  };

  const fillDemoCredentials = (credentials) => {
    setLoginForm({
      email: credentials.email,
      password: credentials.password,
    });
    setIsLogin(true);
    setLocalError('');
    setSuccessMsg('');
  };

  return (
    <div className="login-container">
      <div className={`login-wrapper ${!isLogin ? 'register-active' : ''}`}>
        <div className="login-header">
          <h1 className="login-title">Doctor Appointment</h1>
          <p className="login-subtitle">Manage your health, one appointment at a time</p>
        </div>

        {/* Tab buttons */}
        <div className="login-tabs">
          <button
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => toggleTab(true)}
          >
            Login
          </button>
          <button
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => toggleTab(false)}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {(localError || error) && (
          <div className="error-message">
            <p>{localError || error}</p>
            <button
              className="error-close"
              onClick={() => {
                setLocalError('');
                setError('');
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="success-message">
            <p>{successMsg}</p>
          </div>
        )}        
        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="text">Email Address</label>
              <input
                type="text"
                id="username"
                name="username"
                value={loginForm.username}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="spinner" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={registerForm.phone}
                onChange={handleRegisterChange}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Enter password (min 6 characters)"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="spinner" /> Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
        )}

        <p className="login-footer">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
