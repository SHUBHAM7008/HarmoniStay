import React, { useEffect, useState } from "react";
import axios from "axios";

const MemberMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list");
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const feedRes = await axios.get("http://localhost:8888/api/meetings/member-feed");
      const feed = Array.isArray(feedRes.data) ? feedRes.data : [];
      setMeetings(feed);
    } catch (err) {
      try {
        const res = await axios.get("http://localhost:8888/api/meetings");
        const items = (Array.isArray(res.data) ? res.data : [])
          .filter((m) => m && m.scheduledDate);
        setMeetings(items);
      } catch (fallbackErr) {
        console.error(fallbackErr);
        setError("Unable to fetch meetings.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 text-slate-500 font-bold">Loading records...</div>;

  const featured = meetings[0];
  const others = meetings.slice(1);

  // Calendar Logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const meetingsOnDay = (day) => {
    if (!day) return [];
    return meetings.filter(m => {
      const d = new Date(m.scheduledDate);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // Group stats for categories
  const catStats = {
    "AGM": meetings.filter(m => (m.type || "").includes("AGM")).length,
    "Maintenance": meetings.filter(m => (m.type || "").toLowerCase().includes("maint")).length,
    "General": meetings.filter(m => !(m.type || "").includes("AGM") && !(m.type || "").toLowerCase().includes("maint")).length
  };

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Society Meetings</h2>
          <p className="text-slate-500 font-medium mt-1">Latest scheduled meetings with complete details.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white shadow-sm rounded-xl p-1 border border-slate-100">
            <button 
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-slate-50 text-secondary' : 'text-slate-400 hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">list</span>
              List
            </button>
            <button 
              onClick={() => setView("calendar")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-slate-50 text-secondary' : 'text-slate-400 hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              Calendar
            </button>
          </div>
          <button className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary/20 hover:brightness-110 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">add</span>
            Request Meeting
          </button>
        </div>
      </div>

      {view === "list" ? (
        /* Bento-ish Grid of Meetings */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Meeting */}
          {featured ? (
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden border border-outline-variant/30 flex flex-col md:flex-row transition-all hover:shadow-xl group">
              <div className="md:w-2/5 relative">
                <img 
                  className="w-full h-full object-cover min-h-[300px]" 
                  alt="Meeting visual" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4svXQJYwm4dFMSemMvLNKcIZalmsVfIckg5X-Pw7KU42IlKNVhLXFw3ETgmQlfIJBc5GWlGHsUkRhxlQBTiP1p2Oy9T7xYezlJTFAo19QqJLdQgROydnI90rTOHHQ4dIRNl6QOLpjQ48vp3pKEsyb1vdVvoS0I6tWmNJv5a3JBh2O5GmTJlwfta1GJtq95wK6nP5PAh8hMHHkGV5une8dcDyYN8Y7T5dYNglmNXl_Sa0YSrYGkKAR8lk7Wgcla2c3Pwz5nDZ5KPg" 
                />
                <div className="absolute top-4 left-4 bg-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Upcoming Next</div>
              </div>
              <div className="md:w-3/5 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase font-black tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">{featured.type || "General Meeting"}</span>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500">12+</div>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-on-surface mb-3 tracking-tight group-hover:text-secondary transition-colors">{featured.title}</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed line-clamp-3">{featured.description || "No description provided for this meeting."}</p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-xl">event</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Date & Time</p>
                      <p className="text-sm font-extrabold text-on-surface">{formatDateTime(featured.scheduledDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-xl">location_on</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Venue</p>
                      <p className="text-sm font-extrabold text-on-surface">{featured.venue || "To be decided"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">Created by <span className="text-on-surface">{featured.createdBy || "Admin"}</span></span>
                  </div>
                  {featured.meetingLink ? (
                    <a 
                      href={featured.meetingLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-secondary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                      Join Meeting
                    </a>
                  ) : (
                    <button className="bg-slate-100 text-slate-400 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                      Link Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-4">event_busy</span>
              <p className="font-bold uppercase tracking-widest text-xs">No upcoming meetings scheduled</p>
            </div>
          )}

          {/* Sidebar Sections */}
          <div className="lg:col-span-4 space-y-8">
            {/* Categories Card */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-8 border border-outline-variant/30">
              <h4 className="text-sm font-black text-on-surface uppercase tracking-widest mb-6">Meeting Categories</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group cursor-pointer hover:bg-secondary/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-secondary transition-colors">Official AGMs</span>
                  </div>
                  <span className="text-xs font-black text-slate-400">{catStats["AGM"].toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group cursor-pointer hover:bg-amber-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-amber-700 transition-colors">Maintenance Syncs</span>
                  </div>
                  <span className="text-xs font-black text-slate-400">{catStats["Maintenance"].toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group cursor-pointer hover:bg-blue-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700 transition-colors">General Resident Meets</span>
                  </div>
                  <span className="text-xs font-black text-slate-400">{catStats["General"].toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-primary-container rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-lg font-extrabold mb-1 tracking-tight">Attendance Rate</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">Average across last 5 meetings</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black tracking-tighter">88%</span>
                  <span className="text-secondary mb-2 flex items-center gap-1 font-bold text-xs">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    +4.2%
                  </span>
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
              <span className="material-symbols-outlined absolute top-8 right-8 text-white/5 text-8xl select-none group-hover:rotate-12 transition-transform duration-700">groups</span>
            </div>
          </div>

          {/* Secondary Meeting List */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {others.map((m) => (
              <div key={m.id || m._id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] border border-outline-variant/30 p-7 hover:shadow-xl hover:border-secondary/30 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${m.type?.includes('AGM') ? 'bg-secondary/10 text-secondary' : 'bg-slate-50 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-2xl">{m.type?.includes('AGM') ? 'account_balance' : 'groups'}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">REF: MT-{m.id?.slice(-4) || "2024"}</span>
                </div>
                <h4 className="text-lg font-extrabold text-on-surface mb-3 tracking-tight group-hover:text-secondary transition-colors">{m.title}</h4>
                <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-8 leading-relaxed">{m.description || "No description provided."}</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="material-symbols-outlined text-[20px] text-slate-300">schedule</span>
                    {formatDateTime(m.scheduledDate)}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="material-symbols-outlined text-[20px] text-slate-300">location_on</span>
                    {m.venue || m.meetingLink ? (m.venue || "Online") : "TBD"}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">By {m.createdBy || "Admin"}</span>
                  <button className="text-secondary font-black text-[10px] uppercase tracking-widest hover:underline">View Details</button>
                </div>
              </div>
            ))}

            {/* Quick Draft Placeholder */}
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 hover:bg-slate-100 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">add_circle</span>
              </div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Request Draft</h4>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-[150px]">Start a new meeting draft to be approved by the board.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-4">
              <button onClick={() => changeMonth(-1)} className="w-10 h-10 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-slate-400 hover:text-secondary hover:border-secondary transition-all shadow-sm active:scale-90">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 rounded-xl bg-white border border-outline-variant text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-on-surface transition-all shadow-sm">
                Today
              </button>
              <button onClick={() => changeMonth(1)} className="w-10 h-10 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-slate-400 hover:text-secondary hover:border-secondary transition-all shadow-sm active:scale-90">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="bg-slate-50/80 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
              ))}
              {days.map((day, i) => {
                const dayMeetings = meetingsOnDay(day);
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div key={i} className={`min-h-[140px] p-4 transition-all ${day ? 'bg-white hover:bg-slate-50/50 cursor-pointer' : 'bg-slate-50/30'}`}>
                    {day && (
                      <div className="flex flex-col h-full">
                        <span className={`text-sm font-black mb-3 ${isToday ? 'w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/30' : 'text-slate-400'}`}>
                          {day}
                        </span>
                        <div className="space-y-2">
                          {dayMeetings.map(m => (
                            <div key={m.id} className="p-2.5 rounded-xl bg-secondary/10 border-l-4 border-secondary text-secondary group transition-all hover:bg-secondary hover:text-white">
                              <p className="text-[10px] font-black truncate">{m.title}</p>
                              <p className="text-[8px] font-bold opacity-60 flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                {new Date(m.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberMeetings;
