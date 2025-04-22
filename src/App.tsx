// src/App.tsx

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import TripPlanner from './TripPlanner';
import Leveling from './Leveling';
import LoginPage from './Login'; 

function AppContent() {
  const location = useLocation();

  // Don't show Navbar on login page
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/leveling" element={<Leveling />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;