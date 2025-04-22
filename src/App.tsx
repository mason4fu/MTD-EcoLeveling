import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import TripPlanner from './TripPlanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
      </Routes>
    </Router>
  );
}

export default App;