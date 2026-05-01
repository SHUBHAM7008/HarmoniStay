import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DualLoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('member');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(username, password, activeTab);
      if (success) {
        if (activeTab === 'member') navigate('/member/dashboard');
        else if (activeTab === 'admin') navigate('/admin/dashboard');
        else if (activeTab === 'accountant') navigate('/accountant/dashboard');
        else if (activeTab === 'security') navigate('/security/dashboard');
      } else {
        setError(`Invalid ${activeTab} credentials. Please verify your details and try again.`);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'member', label: 'Member' },
    { id: 'admin', label: 'Admin' },
    { id: 'accountant', label: 'Accountant' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden font-body">
      {/* Left Side: Visual Content */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Luxury property interior" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQF0w3DqNIrCjfKEMAL0n-eS9JPqByQAnXC3Z0dEf2f7GRNDwWLFNhvKkU98FQdrKRd0vMA62SHaQVScsXE2GzSYLDYV38C8GGDwuAlJdwI6N09e54duIZRubdlHhxLW3FfFc7PCGqKWYYkiCT_CZ8mnkhZM5CodxcfF-84Og9V9OUNwCmVHI_KvMIN8XYEhDJmVtotDyhc1fHbPv2thdFAuerqEh10KmsOZsEsYyE4ESyPhK_gHVd0IYjbX0d-F4o3DVszKLsk74"
          />
          <div className="absolute inset-0 bg-primary-container/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent"></div>
        </div>
        
        {/* Branding Top Left */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white">domain</span>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">HarmonyStay</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg mb-8">
          <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">Elevate Your Property Management.</h1>
          <p className="text-lg text-white/80 font-medium leading-relaxed">Seamlessly manage luxury estates, financial reporting, and team workflows in one unified, intelligent ecosystem.</p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-6 text-white/60 text-xs font-bold">
            <div className="flex -space-x-3">
              <img className="w-8 h-8 rounded-full border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5q-f9vnIWLQn736cDeC2S0H5DqM3T-zeOo1v4cEG0r6qCbsCn94K0z0Aw8C4nWHMtNnqmyvYCqkYWuTElzBCbmcQeQ9KENbod3GEEHEEevA7tP6GNbazfEBkfamsv1N_5V5pqCzrcQwLhGYWrtpJEfg6GTl59fdNNH1XQSe7BBXmWa6FX6xhQlt2L55K13ZQwyRAFBfgarJWEuwc_XTNgOJLmpLY5kBxJds83V_SaLV1Cwv3opqOK0IoG_FOrcC-IoNhXrtP4_mI" alt="User 1"/>
              <img className="w-8 h-8 rounded-full border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLPctSo9DkIvF4hYlE_348H-YgmhpgXxipxOQyE32Eqk_4DLCqr9DlGKsHOPXDNudi8tXrwKaNrAS9aLkOHi9wF5PsFh5w6d8xUNdyShRcbAOkiiLyz7PYQkTT-gZcm0AjMg65lRR0BSWEPOsBevImKv8y1F0OpJMVUbQ3hq1YDWNpBVnsTmZylkhpZEgKWektGmfgMRK1TeCcdwqJgFKYzAzPzA2mSkV8aAfwokP5L2PHdXO9mGsslt1cGEKmQT-GVNazqjGnkDw" alt="User 2"/>
              <img className="w-8 h-8 rounded-full border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUYUSTckQyo0gniGUQV7EhA9Jn-ObsBPNIZ3pjEaR_hK35O_F2E0BNkhQUbXGv7_0kaKiCLWap0IUqH9Pb02dYUL4JioOjrTH3C1tfUmzQMKAF4s-KylY5-Okgt-y-bq1Aly0VGm53Kope_tjfRO5E21qDi6JxNDr2V2r2gniMgLxhVmiHcRX0xQPAH03xRoKwYXb2gdiYAV93sracdPLRhp3RxuTs9Rpm8tftl1bZ9VRj35D09oWKo2BxC_nWl8hQGCHWNjApZFY" alt="User 3"/>
            </div>
            <span>Trusted by 500+ premium property groups</span>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <main className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-container-low overflow-y-auto">
        <div className="w-full max-w-[480px] space-y-8">
          {/* Mobile Brand View */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-md mb-4">
              <span className="material-symbols-outlined text-white text-3xl">domain</span>
            </div>
            <h2 className="text-3xl font-extrabold text-on-background">HarmonyStay</h2>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-8 lg:p-10 rounded-2xl shadow-[4px_0_24px_rgba(15,23,42,0.08)] border border-outline-variant/30">
            <header className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-primary mb-2">Secure Access</h2>
              <p className="text-on-surface-variant font-medium">Welcome back. Please select your role to continue.</p>
            </header>

            {/* Role Selector Tabs */}
            <div className="flex bg-surface-container-highest p-1 rounded-xl mb-8 overflow-x-auto no-scrollbar">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => { setActiveTab(role.id); setError(''); }}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === role.id
                      ? "bg-white shadow-sm text-secondary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-background block ml-1" htmlFor="username">
                  {activeTab === 'member' ? 'Flat Number' : 'Email Address'}
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                    {activeTab === 'member' ? 'home' : 'person'}
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-on-surface"
                    id="username"
                    required
                    autoComplete="username"
                    placeholder={activeTab === 'member' ? 'e.g. A-101' : 'name@harmony-stay.com'}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center px-1">
                  <span className="text-sm font-extrabold text-on-background">Password</span>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">lock</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-semibold text-on-surface placeholder:text-outline/40"
                    id="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute right-3 top-0 h-full flex items-center">
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-outline hover:text-on-surface transition-colors flex items-center justify-center rounded-lg hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-end px-1">
                  <button type="button" className="text-xs font-bold text-secondary hover:underline transition-all">Forgot password?</button>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="flex items-center space-x-2 text-error px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span className="text-xs font-bold">{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button 
                  disabled={loading}
                  className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-secondary/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                >
                  <span>{loading ? 'Authenticating...' : 'Login to Dashboard'}</span>
                  {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/30 flex items-center justify-center">
              <p className="text-xs font-medium text-on-surface-variant">Don't have an account? <button className="text-secondary font-extrabold hover:underline transition-all ml-1">Contact System Admin</button></p>
            </div>
          </div>

          {/* Footer Section */}
          <footer className="flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">© 2024 HarmonyStay</span>
            <div className="flex gap-6">
              <button className="text-[10px] font-bold text-on-surface-variant hover:text-secondary uppercase tracking-widest">Privacy</button>
              <button className="text-[10px] font-bold text-on-surface-variant hover:text-secondary uppercase tracking-widest">Security</button>
              <button className="text-[10px] font-bold text-on-surface-variant hover:text-secondary uppercase tracking-widest">Help</button>
            </div>
          </footer>
        </div>
      </main>

      {/* Visual Floating Elements (Geometric Accents) */}
      <div className="fixed top-0 right-0 p-12 opacity-[0.03] pointer-events-none select-none">
        <span className="material-symbols-outlined text-[120px]">grid_view</span>
      </div>
      <div className="fixed bottom-0 right-0 p-12 opacity-[0.03] pointer-events-none transform rotate-45 select-none">
        <span className="material-symbols-outlined text-[180px]">architecture</span>
      </div>
    </div>
  );
};

export default DualLoginPage;
