import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DualLoginPage.css';

const DualLoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('member');
  const [memberFlatNo, setMemberFlatNo] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  // Member login (mock)
  const handleMemberSubmit = (e) => {
    e.preventDefault();
    const success = login(memberFlatNo, memberPassword, 'member');
    
    if (!success) { console.log("hiiiiii");
      setError('Invalid member credentials');
    }
    else {
      setError('');
      navigate('/member/dashboard'); // optional: redirect member
    }
  };

  // Admin login (backend API)
 const handleAdminSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const success = await login(adminEmail, adminPassword, 'admin');
console.log(success);
  if (success) {
    // Login successful
    navigate('/admin/dashboard');
  } else {
    // Login failed
    setError('Invalid admin credentials');
  }
};


  return (
    <div className="login-container">
      <div className="tabs">
        <button
          className={activeTab === 'member' ? 'active' : ''}
          onClick={() => { setActiveTab('member'); setError(''); }}
        >
          Member Login
        </button>
        <button
          className={activeTab === 'admin' ? 'active' : ''}
          onClick={() => { setActiveTab('admin'); setError(''); }}
        >
          Admin Login
        </button>
      </div>

      <div className="form-area">
        {activeTab === 'member' && (
          <form className="login-form" onSubmit={handleMemberSubmit}>
            <h2>Member Login</h2>
            <input
              type="text"
              placeholder="Flat Number"
              value={memberFlatNo}
              onChange={e => setMemberFlatNo(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={memberPassword}
              onChange={e => setMemberPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        )}

        {activeTab === 'admin' && (
          <form className="login-form" onSubmit={handleAdminSubmit}>
            <h2>Admin Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default DualLoginPage;
