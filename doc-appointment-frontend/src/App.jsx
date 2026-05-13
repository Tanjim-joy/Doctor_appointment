import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import DoctorsPage from './pages/DoctorsPage';
import OnlyDoctorPage from './pages/OnlyDoctorPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
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
            <Route path="/doctors" element={<OnlyDoctorPage />} />
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <PrescriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<DoctorsPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;