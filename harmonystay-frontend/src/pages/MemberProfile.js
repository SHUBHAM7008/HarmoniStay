import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MemberProfile({ user }) {
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchFlat = async () => {
      if (!user?.flatId) return;
      try {
        const res = await axios.get(`http://localhost:8888/api/flats/${user.flatId}`);
        setFlat(res.data);
      } catch (err) {
        console.error("Error fetching flat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlat();
  }, [user]);

  const sendOtp = async () => {
    try {
      await axios.post(`http://localhost:8888/api/members/send-otp/${user.id}`);
      setOtpSent(true);
      setMessage("OTP sent to your registered phone.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send OTP.");
    }
  };

  const changePassword = async () => {
    try {
      const res = await axios.post(`http://localhost:8888/api/members/change-password/${user.id}`, {
        otp,
        newPassword,
      });
      setMessage(res.data);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to change password.");
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>
  );

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-700">
      {/* Hero Section (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 relative h-[320px] rounded-[32px] overflow-hidden bg-primary-container group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/70 to-transparent z-10"></div>
          <img 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2000ms]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgnFlirNabAKrU4VXeX5rEH9WU432xiUgNDZAG9HsmYYR8qH6KLEj9yntF3s7gabyXRv4RSk06uga4vPEBFmyHvP7SKK_TYNPftXCBGGR2IWoBX7LQ4knxFtmmlGpL85L0Lg1ptpvv98o9TMKA11HU-SmsPtF4Q3bEVzgxZoWIuXqAmYOySHkTs3kyvUp_AD9BVTiKHvNWC6bQR3W5luKwK9kAtIC1c3aWOLU617gw4oRzQiUMKhiaBRekQ8FuIoH8YKk98HGZlo0" 
          />
          <div className="relative z-20 h-full flex flex-col justify-end p-10">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl ring-4 ring-black/5 transition-transform group-hover:scale-105">
                  <img 
                    alt="Resident" 
                    className="w-full h-full object-cover" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300" 
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="bg-secondary/20 backdrop-blur-md text-secondary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-secondary/30">
                  {user.status === 'Active' ? 'Premium Member' : 'Member'}
                </span>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-300 font-bold text-xs uppercase tracking-[0.1em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  Resident ID: HST-2024-{user.id?.toString().padStart(4, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] flex flex-col justify-between border border-outline-variant/30 group">
          <div>
            <h3 className="text-xl font-black text-on-surface tracking-tight mb-2">Residency Status</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">Your account is in excellent standing. All amenities are active.</p>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Trust Score</span>
              <span className="text-5xl font-black text-secondary tracking-tighter group-hover:scale-110 transition-transform">985</span>
            </div>
            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
              <div className="bg-secondary h-full w-[98.5%] rounded-full shadow-[0_0_12px_rgba(0,106,97,0.4)] transition-all duration-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal & Unit */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Details Card */}
          <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-2xl">account_circle</span>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Personal Details</h3>
              </div>
              <button className="text-secondary hover:underline font-black text-[10px] uppercase tracking-widest transition-all">Edit Profile</button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                <p className="text-base font-extrabold text-on-surface">{user.firstName} {user.lastName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-base font-extrabold text-on-surface">{user.email || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-base font-extrabold text-on-surface">{user.phone || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</p>
                <p className="text-base font-extrabold text-on-surface">{user.dateOfJoining || "N/A"}</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                <div className="flex">
                  <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black rounded-full border border-secondary/20 uppercase tracking-widest">
                    {user.status?.toUpperCase() || "ACTIVE RESIDENT"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Ownership Card */}
          {!loading && flat && (
            <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
              <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-2xl">domain</span>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Unit Ownership</h3>
              </div>
              <div className="p-10 grid grid-cols-2 md:grid-cols-3 gap-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flat Number</p>
                  <p className="text-2xl font-black text-on-primary-fixed tracking-tight">{flat.flatNumber || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wing/Block</p>
                  <p className="text-base font-extrabold text-on-surface uppercase tracking-tight">{flat.wing}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor</p>
                  <p className="text-base font-extrabold text-on-surface">{flat.floor} Floor</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area</p>
                  <p className="text-base font-extrabold text-on-surface">{flat.area} Sq. Ft.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Type</p>
                  <p className="text-base font-extrabold text-on-surface">{flat.type}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership</p>
                  <p className="text-base font-extrabold text-on-surface">Primary Owner</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Security & Gallery */}
        <div className="lg:col-span-4 space-y-8">
          {/* Security Card */}
          <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
              <span className="material-symbols-outlined text-secondary text-2xl">security</span>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Security & Privacy</h3>
            </div>
            <div className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-black text-on-surface">Password Control</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last changed 3 months ago</p>
                  </div>
                  {!otpSent ? (
                    <button 
                      onClick={sendOtp}
                      className="px-6 py-3 bg-on-primary-fixed text-on-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-on-primary-fixed/20"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-secondary uppercase animate-pulse">OTP Sent</span>
                  )}
                </div>
                
                {otpSent && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <input 
                      type="text" 
                      placeholder="Enter OTP" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                    <button 
                      onClick={changePassword}
                      className="w-full py-4 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary/20 active:scale-95 transition-all"
                    >
                      Update Password
                    </button>
                  </div>
                )}

                {message && <p className="text-[10px] font-bold text-secondary text-center uppercase tracking-widest">{message}</p>}

                <div className="h-px bg-slate-100 w-full"></div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-on-surface">Two-Factor Auth</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended for security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox"/>
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Card */}
          <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-2xl">photo_library</span>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Property Amenities</h3>
              </div>
              <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-secondary transition-colors">chevron_right</span>
            </div>
            <div className="p-8 grid grid-cols-2 gap-4">
              {[
                { label: 'Pool', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzOAmPvb01bHzY8T86SxjMqAWYNh4EKx93mJ57byaRQbe-sF7rjNKNJvPx-QtOrTs_LPc8LEDFBKoXMeK4Ul_1HwvmmKuyR91RnmzBUblcMRAhdHCKwNC082v-EwV2tp_bTCFlyESv3_MTNI-oJ1PUWqP1t95zew8ymldwFRjo_yiBQvrjGfIimCwPTZBpoZBmNsqnCrg5G4XcnJ9R0dAk12EAt1UXjMBAuRwTkeSm0DOwJpoe7seRAVOguPp_F-Qr6C3MEUu4GZc' },
                { label: 'Gym', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqsn0M0kKLLfY43RUXlpMw-oFREvQyLComuL1XpZHsjV5PZLu5JCMIOdH_GIqyv8avwDTgOa3ZgaBklU7B3t4AYo4g1yUQ1gfgzgCujt2h5T5yGtRWUs43S_XAfqBCuO7fqEfC_Ti97ONLBLIJR-FPu4kDahUW7sDqXe1R_0WM9bI3gj992u04DSY6fFAi89itbTRG8iof0c7VEQoMW5cOVcw8RiuOhGuwUji2ClO6DREFQ_qEc0ZxkFHQD1QC2Q0TJZvVEvCh8tE' },
                { label: 'Garden', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoVKGJ4YzqeFpZkHKMZQMXuukqixBBT0TQXG4Al3b-Kw46nZPJ0QU95r76nP5GaGM_lGF7RBRdf8E8WZvejfGZZaxKhr8YB7wVp971fcRtbRDQAOBE7tnb4xvXIVeJhRpLKEXaZ6C0jkVU0qikB35oFYtEWa69O9DHG61si_mv4FlN5IJQ-uVj_LTarSoqsAy0i6zE7DqacAEWqgbLNPHvRb5L_B9s_KqDg_vQnE36Vd7tNgpZWpjgsDr8ORoQAT1a-_s00rGxxGw' },
                { label: 'Lounge', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdqqAQQ-9AuvhTH9xL8ncejRF0FA-WM0OKY8GsKc4jHgeDWWlLWFZlGVHPzloM-13rsk0g1fWAWbKCLIS6YwZotZVkUXXHSfEuxys2JKdY6hC7uUhZAHwuTPf7thrvOMjiZ2WoOoeuC-Ddyh9XWzmMB_QsiC-R3q9t_e_JlFzvslKn-qZTflneGeXEGCvnRAlP1mUKf75RZVaz5qYNCVlMrK048D1B4-Hi5XMzoWHYTE-YpDo3DDhAqgD4ElfYJwyDjakj3_vvakU' }
              ].map((item, idx) => (
                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-50">
                  <img alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.img} />
                  <div className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      <footer class="mt-20 pt-10 border-t border-slate-100 text-center space-y-4">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">HarmonyStay Management • Secure Resident Portal</p>
        <div class="flex justify-center gap-10">
          <button class="text-[10px] font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors">Privacy Policy</button>
          <button class="text-[10px] font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors">Terms of Service</button>
          <button class="text-[10px] font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors">Contact Support</button>
        </div>
      </footer>
    </div>
  );
}
