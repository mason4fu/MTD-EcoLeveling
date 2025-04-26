// src/Navbar.tsx

import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear any auth info
    localStorage.removeItem("user_id");
    // redirect to login
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <Link to="/trip-planner" className="navbar-link">
        Trip Planner
      </Link>
      <Link to="/travel-history" className="navbar-link">
        Travel History
      </Link>
      <Link to="/leveling" className="navbar-link">
        Leveling
      </Link>
      <button
        onClick={handleLogout}
        className="navbar-link logout-button"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
