import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import DoctorsPage from './pages/DoctorsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/" element={<DoctorsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;