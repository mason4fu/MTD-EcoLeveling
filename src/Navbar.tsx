// src/Navbar.tsx

import { Link } from 'react-router-dom';
import './Navbar.css'; // <-- import css

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/trip-planner" className="navbar-link">Trip Planner</Link>
      <Link to="/leveling" className="navbar-link">Leveling</Link>
    </nav>
  );
}

export default Navbar;