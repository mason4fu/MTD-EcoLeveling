import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // react-router-dom v6
import './Login.css'; // optional

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('user1@example.com');     // default for testing
  const [password, setPassword] = useState('0bipi5u8cyg3zq0o3k894t6tnblylbo9'); // default for testing
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/login/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Save user ID somewhere if needed
        localStorage.setItem('user_id', data.user_id);
        navigate('/trip-planner');  // redirect to TripPlanner
      } else {
        setErrorMessage(data.error || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Server error');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>

      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
      />
      <br/>
      <input 
        type="text"  // notice: plain text input because password is random
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
      />
      <br/>
      <button onClick={handleLogin}>Login</button>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}

export default Login;