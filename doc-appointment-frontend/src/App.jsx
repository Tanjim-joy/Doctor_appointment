import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import DoctorsPage from './pages/DoctorsPage';
import OnlyDoctorPage from './pages/OnlyDoctorPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<DoctorsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/doctors" element={<OnlyDoctorPage />} />

            {/* Protected Routes */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <PrescriptionsPage />
                </ProtectedRoute>
              }
            />

            {/* Unauthorized page */}
            <Route
              path="/unauthorized"
              element={
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Access Denied</h1>
                  <p>You don't have permission to access this page.</p>
                </div>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;