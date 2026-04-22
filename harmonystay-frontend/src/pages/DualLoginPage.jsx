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
  const [accountantEmail, setAccountantEmail] = useState('');
  const [accountantPassword, setAccountantPassword] = useState('');
  const [securityEmail, setSecurityEmail] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [error, setError] = useState('');

  // Member login (mock)
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    const success = await login(memberFlatNo, memberPassword, 'member');
    
    if (!success) {
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
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleAccountantSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(accountantEmail, accountantPassword, 'accountant');
    if (success) {
      navigate('/accountant/dashboard');
    } else {
      setError('Invalid accountant credentials');
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(securityEmail, securityPassword, 'security');
    if (success) {
      navigate('/security/dashboard');
    } else {
      setError('Invalid security credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
      <div className="tabs">
        <button
          className={activeTab === 'member' ? 'active' : ''}
          onClick={() => { setActiveTab('member'); setError(''); }}
        >
          Member
        </button>
        <button
          className={activeTab === 'admin' ? 'active' : ''}
          onClick={() => { setActiveTab('admin'); setError(''); }}
        >
          Admin
        </button>
        <button
          className={activeTab === 'accountant' ? 'active' : ''}
          onClick={() => { setActiveTab('accountant'); setError(''); }}
        >
          Accountant
        </button>
        <button
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => { setActiveTab('security'); setError(''); }}
        >
          Security
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

        {activeTab === 'accountant' && (
          <form className="login-form" onSubmit={handleAccountantSubmit}>
            <h2>Accountant Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={accountantEmail}
              onChange={e => setAccountantEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={accountantPassword}
              onChange={e => setAccountantPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        )}

        {activeTab === 'security' && (
          <form className="login-form" onSubmit={handleSecuritySubmit}>
            <h2>Security Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={securityEmail}
              onChange={e => setSecurityEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={securityPassword}
              onChange={e => setSecurityPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </div>
      </div>
    </div>
  );
};

export default DualLoginPage;
