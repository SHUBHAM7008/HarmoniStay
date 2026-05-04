import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MemberProfile from "./MemberProfile";
import MemberBills from "./MemberBills";
import MemberParking from "./MemberParking";
import MemberComplaints from "./MemberComplaints";
import MemberMeetings from "./MemberMeetings";
import MemberFacilities from "./MemberFacilities";
import MemberDocuments from "./MemberDocuments";
import MemberNotices from "./MemberNotices";

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [pendingVisitorRequest, setPendingVisitorRequest] = useState(null);
  const [responding, setResponding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "member") navigate("/");
  }, [user, navigate]);


  useEffect(() => {
    if (!user?.id || user.role !== "member") return undefined;

    const fetchPendingRequests = async () => {
      try {
        const res = await fetch(`http://localhost:8888/api/visitor-requests/member/${user.id}/pending`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPendingVisitorRequest(data[0]);
        } else {
          setPendingVisitorRequest(null);
        }
      } catch (err) {
        console.error("Error fetching visitor requests:", err);
      }
    };

    fetchPendingRequests();
    const intervalId = setInterval(fetchPendingRequests, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  const respondVisitorRequest = async (status) => {
    if (!pendingVisitorRequest || !user?.id) return;
    setResponding(true);
    try {
      await fetch(
        `http://localhost:8888/api/visitor-requests/${pendingVisitorRequest.id}/respond?memberId=${user.id}&status=${status}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseNote: status === "ACCEPTED" ? "Allowed" : "Not allowed" }),
        }
      );
      setPendingVisitorRequest(null);
    } catch (err) {
      console.error("Failed responding request:", err);
    } finally {
      setResponding(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <div className="flex items-center justify-center h-screen font-body text-on-surface-variant">Loading dashboard...</div>;

  const NavItem = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveMenu(id)}
      className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
        activeMenu === id
          ? "bg-slate-50 text-secondary font-bold border-r-4 border-secondary translate-x-1"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      <span className={`material-symbols-outlined transition-all ${activeMenu === id ? "fill-[1]" : "group-hover:scale-110"}`} style={{ fontVariationSettings: activeMenu === id ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body">
      {/* Visitor Request Modal */}
      {pendingVisitorRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-outline-variant animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary-container/30 text-secondary rounded-xl">
                <span className="material-symbols-outlined text-3xl">person_pin_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">Visitor Request</h3>
                <p className="text-sm text-on-surface-variant">Action required for gate entry</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-surface-container rounded-xl">
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Visitor Name</p>
                <p className="text-lg font-bold text-on-surface">{pendingVisitorRequest.memberName}</p>
              </div>
              <div className="p-4 bg-surface-container rounded-xl">
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Purpose</p>
                <p className="text-on-surface font-medium">{pendingVisitorRequest.purpose}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                disabled={responding}
                onClick={() => respondVisitorRequest("ACCEPTED")}
                className="flex-1 py-4 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                Accept Entry
              </button>
              <button
                disabled={responding}
                onClick={() => respondVisitorRequest("REJECTED")}
                className="flex-1 py-4 bg-error-container text-on-error-container rounded-xl font-bold hover:bg-error-container/80 transition-all active:scale-95 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-outline-variant shadow-[4px_0_24px_rgba(15,23,42,0.04)] z-50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-white shadow-lg shadow-secondary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">HarmonyStay</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Management Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <NavItem id="dashboard" icon="dashboard" label="Dashboard" />
          <NavItem id="maintenance" icon="build" label="Maintenance" />
          <NavItem id="parking" icon="local_parking" label="Parking" />
          <NavItem id="complaints" icon="report_problem" label="Complaints" />
          <NavItem id="meetings" icon="groups" label="Meetings" />
          <NavItem id="facilities" icon="apartment" label="Facilities" />
          <NavItem id="documents" icon="description" label="Documents" />
          <NavItem id="notice" icon="campaign" label="Notices" />
          <NavItem id="profile" icon="person" label="Profile" />
          
          <div className="pt-4 mt-4 border-t border-slate-50">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/5 transition-all group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">logout</span>
              <span className="text-sm font-bold">Logout</span>
            </button>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Logged in as {user.role}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt="User avatar" />
                ) : (
                  <span className="material-symbols-outlined text-slate-500">person</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-slate-500 truncate">Flat No. {user.flatId || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center bg-slate-50 px-5 py-2 rounded-full w-96 border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary/10 transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">search</span>
            <input 
              type="text" 
              placeholder="Search meetings, attendees..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-secondary transition-all active:scale-90">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="text-slate-500 hover:text-secondary transition-all active:scale-90">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tighter leading-none">HarmonyStay</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Premium Estate</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-10 max-w-7xl mx-auto w-full">
          {activeMenu === "dashboard" && (
            <>
              {/* Hero */}
              <section className="mb-12">
                <h2 className="text-5xl font-extrabold text-on-surface mb-2 tracking-tight">Welcome back, {user.firstName} 👋</h2>
                <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                  Here’s a quick overview of your residence. Everything looks in order for today.
                </p>
              </section>

              {/* Bento Grid Stats */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveMenu('maintenance')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-secondary-container/20 text-secondary rounded-xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-secondary bg-secondary-container/30 px-2.5 py-1 rounded-full uppercase tracking-widest">Active</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-on-surface">02</h3>
                  <p className="text-sm font-bold text-on-surface-variant/70 mt-1">Maintenance Requests</p>
                  <div className="mt-6 pt-4 border-t border-surface-container flex items-center text-xs text-secondary font-black gap-1 uppercase tracking-tighter">
                    View Requests <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveMenu('parking')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary-fixed/20 text-on-primary-fixed rounded-xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_parking</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-on-primary-fixed bg-primary-fixed px-2.5 py-1 rounded-full uppercase tracking-widest">{user.flatId || 'N/A'}</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-on-surface">Active</h3>
                  <p className="text-sm font-bold text-on-surface-variant/70 mt-1">Parking Spot Allocation</p>
                  <div className="mt-6 pt-4 border-t border-surface-container flex items-center text-xs text-on-primary-fixed font-black gap-1 uppercase tracking-tighter">
                    Guest Parking <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveMenu('meetings')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-surface-container-high/40 text-on-surface-variant rounded-xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-on-surface-variant bg-surface-container-high/60 px-2.5 py-1 rounded-full uppercase tracking-widest">Upcoming</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-on-surface">7:00 PM</h3>
                  <p className="text-sm font-bold text-on-surface-variant/70 mt-1">Next Society Meeting</p>
                  <div className="mt-6 pt-4 border-t border-surface-container flex items-center text-xs text-on-surface-variant font-black gap-1 uppercase tracking-tighter">
                    Calendar <span className="material-symbols-outlined text-xs">calendar_today</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveMenu('notice')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-error-container/20 text-on-error-container rounded-xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-on-error-container bg-error-container/30 px-2.5 py-1 rounded-full uppercase tracking-widest">New</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-on-surface">04</h3>
                  <p className="text-sm font-bold text-on-surface-variant/70 mt-1">Community Notices</p>
                  <div className="mt-6 pt-4 border-t border-surface-container flex items-center text-xs text-on-error-container font-black gap-1 uppercase tracking-tighter">
                    Read Notices <span className="material-symbols-outlined text-xs">done_all</span>
                  </div>
                </div>
              </section>

              {/* Feed and Side widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-outline-variant">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-extrabold text-on-surface">Recent Activity</h3>
                      <p className="text-on-surface-variant font-medium">Latest updates from your residence</p>
                    </div>
                    <button className="text-secondary font-black text-xs uppercase tracking-widest hover:underline">View All</button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-5 p-5 hover:bg-surface-container rounded-2xl transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-sm border-2 border-white ring-1 ring-outline-variant">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp5Hw1Nefc85FWX9xF8rumS2E2qtjx9ONw-kqMI0kuVRpeJGwC4k3062WaFYcU8W-LkDQqLpBDn56PzcQDsT93QGS4PeNC___DZiqyjATezNgKczDSeTzqtcYGYy9u-AW0NuTr8NhHciLNggcjmm_omiyo1XTV4MfE5mH7CSn2MqVD0Txow7edXhQKyx6n84P-4NrVrX3TYnrdudWaFyXaRsjHMNT0FH-iighqJCaYvYrOOWmvT2_Cab6idej-T_3mUP-jJPAmPZU" alt="Sarah" />
                      </div>
                      <div className="flex-1">
                        <p className="text-on-surface font-bold">Sarah Jenkins <span className="text-on-surface-variant font-medium">responded to your Plumbing Request</span></p>
                        <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase mt-1 tracking-widest">2 hours ago • Unit 402</p>
                        <div className="mt-3 text-sm text-on-surface-variant bg-surface-container-low p-4 rounded-xl border-l-4 border-secondary shadow-sm">
                          "Hello! A contractor has been scheduled for tomorrow between 9 AM and 11 AM."
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-5 p-5 hover:bg-surface-container rounded-2xl transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0 text-on-primary-container shadow-sm">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-on-surface font-bold">Monthly Financial Report <span className="text-on-surface-variant font-medium">is now available for download</span></p>
                        <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase mt-1 tracking-widest">Yesterday • Documents</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="bg-on-primary-fixed rounded-2xl p-8 shadow-xl text-white relative overflow-hidden group min-h-[220px] flex flex-col justify-end">
                    <div className="relative z-10">
                      <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Facility Booking</h3>
                      <p className="text-primary-fixed/80 text-sm font-medium mb-6 leading-relaxed">Enjoy our rooftop lounge or reserve the guest suite for your visitors.</p>
                      <button className="bg-secondary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary/90 shadow-lg active:scale-95 transition-all w-fit">
                        Book Now
                      </button>
                    </div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <span className="material-symbols-outlined absolute top-6 right-6 text-primary-fixed/10 text-7xl select-none">apartment</span>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-outline-variant flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-8 border-b border-surface-container pb-4">Your Property Manager</h4>
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 rounded-full overflow-hidden shadow-md ring-2 ring-surface-container border-2 border-white">
                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300" alt="Avatar" />
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-on-surface leading-tight">David Richardson</p>
                        <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-tight">Senior Administrator</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-surface-container text-on-surface font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all active:scale-95">
                      <span className="material-symbols-outlined text-lg">mail</span>
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu === "maintenance" && <div className="transition-all duration-500"><MemberBills /></div>}
          {activeMenu === "parking" && <div className="transition-all duration-500"><MemberParking /></div>}
          {activeMenu === "complaints" && <div className="transition-all duration-500"><MemberComplaints /></div>}
          {activeMenu === "meetings" && <div className="transition-all duration-500"><MemberMeetings /></div>}
          {activeMenu === "facilities" && <div className="transition-all duration-500"><MemberFacilities /></div>}
          {activeMenu === "documents" && <div className="transition-all duration-500"><MemberDocuments /></div>}
          {activeMenu === "notice" && <div className="transition-all duration-500"><MemberNotices /></div>}
          {activeMenu === "profile" && <div className="transition-all duration-500"><MemberProfile user={user} /></div>}
        </main>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setActiveMenu('complaints')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-[60] group"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </button>
    </div>
  );
};

export default MemberDashboard;
