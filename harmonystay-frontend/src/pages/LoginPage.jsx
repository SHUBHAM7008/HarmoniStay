import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password, role);
    if (!success) {
      setError('Invalid credentials');
    } else {
      setError('');
      // proceed - maybe show dashboard or clear form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="accountant">Accountant</option>
      </select>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default LoginPage;
