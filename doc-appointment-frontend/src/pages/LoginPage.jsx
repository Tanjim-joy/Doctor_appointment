import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, EyeOff, Loader2, Stethoscope, Users, 
  UserCheck, ChevronDown, AlertCircle, CheckCircle 
} from 'lucide-react';
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
  const [selectedRole, setSelectedRole] = useState('patient'); // Default role

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
    // Doctor specific fields
    specialization: '',
    experience_years: '',
    consultation_fee: '',
    qualification: '',
    bio: '',
    // Patient specific fields
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
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

    // Common validation
    if (!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.password) {
      setLocalError('Please fill in all required fields');
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

    // Role-specific validation
    if (selectedRole === 'doctor') {
      if (!registerForm.specialization) {
        setLocalError('Please select your specialization');
        return;
      }
      if (!registerForm.consultation_fee) {
        setLocalError('Please enter your consultation fee');
        return;
      }
    } else if (selectedRole === 'patient') {
      if (!registerForm.gender) {
        setLocalError('Please select your gender');
        return;
      }
    }

    try {
      // Prepare registration data based on role
      const registrationData = {
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        role: selectedRole, // Send selected role
      };

      // Add role-specific data
      if (selectedRole === 'doctor') {
        registrationData.specialization = registerForm.specialization;
        registrationData.experience_years = parseInt(registerForm.experience_years) || 0;
        registrationData.consultation_fee = parseFloat(registerForm.consultation_fee);
        registrationData.qualification = registerForm.qualification;
        registrationData.bio = registerForm.bio;
      } else if (selectedRole === 'patient') {
        registrationData.date_of_birth = registerForm.date_of_birth;
        registrationData.gender = registerForm.gender;
        registrationData.blood_group = registerForm.blood_group;
        registrationData.address = registerForm.address;
        registrationData.emergency_contact = registerForm.emergency_contact;
        registrationData.emergency_phone = registerForm.emergency_phone;
      }

      await registerAPI(registrationData);
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

        {/* Role Selection - Only show in Register mode */}
        {!isLogin && (
          <div className="role-selection">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              I want to register as:
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Patient Role Card */}
              <div
                onClick={() => setSelectedRole('patient')}
                className={`role-card p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedRole === 'patient'
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="text-center">
                  <Users className={`h-8 w-8 mx-auto mb-2 ${
                    selectedRole === 'patient' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <h3 className={`font-semibold ${
                    selectedRole === 'patient' ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                    Patient
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Book appointments & manage health records
                  </p>
                  {selectedRole === 'patient' && (
                    <CheckCircle className="h-5 w-5 text-indigo-600 mx-auto mt-2" />
                  )}
                </div>
              </div>

              {/* Doctor Role Card */}
              <div
                onClick={() => setSelectedRole('doctor')}
                className={`role-card p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedRole === 'doctor'
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="text-center">
                  <Stethoscope className={`h-8 w-8 mx-auto mb-2 ${
                    selectedRole === 'doctor' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <h3 className={`font-semibold ${
                    selectedRole === 'doctor' ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                    Doctor
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage patients & create prescriptions
                  </p>
                  {selectedRole === 'doctor' && (
                    <CheckCircle className="h-5 w-5 text-indigo-600 mx-auto mt-2" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {(localError || error) && (
          <div className="error-message">
            <AlertCircle className="h-5 w-5" />
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
            <CheckCircle className="h-5 w-5" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Email Address</label>
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
            {/* Common Fields for all roles */}
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Enter your full name"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address *</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={registerForm.phone}
                onChange={handleRegisterChange}
                placeholder="Enter your phone number"
                disabled={loading}
                required
              />
            </div>

            {/* Role-Specific Fields */}
            {selectedRole === 'doctor' ? (
              <>
                <div className="role-section-title">
                  <Stethoscope className="h-5 w-5 inline text-indigo-600" />
                  <span className="ml-2 font-semibold">Doctor Details</span>
                </div>

                <div className="form-group">
                  <label htmlFor="specialization">Specialization *</label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={registerForm.specialization}
                    onChange={handleRegisterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="ENT">ENT</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Dental">Dental</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="qualification">Qualification</label>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={registerForm.qualification}
                    onChange={handleRegisterChange}
                    placeholder="e.g., MBBS, MD, FCPS"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="experience_years">Experience (Years)</label>
                    <input
                      type="number"
                      id="experience_years"
                      name="experience_years"
                      value={registerForm.experience_years}
                      onChange={handleRegisterChange}
                      placeholder="e.g., 5"
                      min="0"
                      max="50"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="consultation_fee">Consultation Fee (BDT) *</label>
                    <input
                      type="number"
                      id="consultation_fee"
                      name="consultation_fee"
                      value={registerForm.consultation_fee}
                      onChange={handleRegisterChange}
                      placeholder="e.g., 500"
                      min="0"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio / About</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={registerForm.bio}
                    onChange={handleRegisterChange}
                    placeholder="Brief description about your practice..."
                    rows="3"
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="role-section-title">
                  <Users className="h-5 w-5 inline text-indigo-600" />
                  <span className="ml-2 font-semibold">Patient Details</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="date_of_birth">Date of Birth</label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={registerForm.date_of_birth}
                      onChange={handleRegisterChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender *</label>
                    <select
                      id="gender"
                      name="gender"
                      value={registerForm.gender}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="blood_group">Blood Group</label>
                  <select
                    id="blood_group"
                    name="blood_group"
                    value={registerForm.blood_group}
                    onChange={handleRegisterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={registerForm.address}
                    onChange={handleRegisterChange}
                    placeholder="Your address..."
                    rows="2"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="emergency_contact">Emergency Contact</label>
                    <input
                      type="text"
                      id="emergency_contact"
                      name="emergency_contact"
                      value={registerForm.emergency_contact}
                      onChange={handleRegisterChange}
                      placeholder="Contact person name"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergency_phone">Emergency Phone</label>
                    <input
                      type="tel"
                      id="emergency_phone"
                      name="emergency_phone"
                      value={registerForm.emergency_phone}
                      onChange={handleRegisterChange}
                      placeholder="01XXXXXXXXX"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="form-group">
              <label htmlFor="reg-password">Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Enter password (min 6 characters)"
                  disabled={loading}
                  required
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
              <label htmlFor="confirm-password">Confirm Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
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
                `Register as ${selectedRole === 'doctor' ? 'Doctor' : 'Patient'}`
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