// src/App.tsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./Navbar";
import TripPlanner from "./TripPlanner";
import Leveling from "./Leveling";
import LoginPage from "./Login";
import TravelHistory from "./TravelHistory";
import UserStatsTable from "./Transaction";
import Transaction from "./Transaction";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/travel-history" element={<TravelHistory />} />
        <Route path="/leveling" element={<Leveling />} />
        <Route path="/transactions" element={<Transaction />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
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
