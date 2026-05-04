import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const TIME_SLOTS = [
  { label: "09:00 AM", value: "09:00-11:00" },
  { label: "11:00 AM", value: "11:00-13:00" },
  { label: "02:00 PM", value: "14:00-16:00" },
  { label: "05:00 PM", value: "16:00-18:00" }
];

const FACILITY_MAP = {
  "GYM": { label: "Technogym Fitness Center", icon: "fitness_center", color: "bg-teal-100 text-teal-600", bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGCdejHeDyEJTkmuK-LS_oKAxnKV2DNk2g32rBMZx07tF9Ok7_buD2BpJ9w9F6xpuh3L9dOEQatfsdHaxN1MPrm5Hw4lSi6SwdLK2HKYmc-MTA-07SWxsvI1veYbM-WNTnTRGqe0u-3So1V1N9rKKrNrIsSdCZwzzIQNwQXZein9C_5VzaXf7h7AGYKvNVMouWQvDbTGH3KiuUOgHoKvbZun7YYpcb1_kShp-htTB1ButkwQZ1FI7mrxc0pf9g-HaEZZ3pXndBoU8" },
  "SWIMMING_POOL": { label: "Heated Swimming Pool", icon: "pool", color: "bg-blue-100 text-blue-600", bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzoPPbKyt_D9dSPhOgfdAHfZQgMjZxgPgZ0M-m7iq5dNGQ6TT7sPUUSubFanu0sCQQRLSwBqD-BWT5ss70ZAhnf42c2Z8MBdyhK6bws0rCoB70rAj4PU7AYjfJTwLbsUPQJSiQoA2FOlEFvxABrH6yrJDKGPivnspUyuiIlHZDTA3FxBWdCG72O_eoY7b7ph646T1m-I8v3zSWuYX9wxIbcRO1raHMA8GKRZluu6dzOGRcUmDT_Gr2c0688buQVNwQvqL2J58T4Ko" },
  "CLUBHOUSE": { label: "Resident Clubhouse", icon: "deck", color: "bg-amber-100 text-amber-600", bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQ7zcgGqAjuvUwydm9hcyR17X9bzzZhUbWIEkWQe2R0jH0IDeZU1qnvaHZnRrUy1O9Xy8Hg9nGrm5t7_J4q5gE0Tc0H6QyF993Y8A_rV5OFRt-RkBcGr_Tc70F_eJnOaGxFDUQo11M-PxUcJelhVXanU5Np0XChFNcqP7gOrg1TZ2TvHVUNnHxntcJezPpZD2zO8xA0xbid-M1z6AbPNBziySDX_644NEy8e73ewP_OTiode32vcmckF0tUzVgBMRNLFzDC4AAcUk" },
  "CINEMA": { label: "Private Cinema Room", icon: "movie", color: "bg-purple-100 text-purple-600", bg: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" },
  "ROOFTOP": { label: "Rooftop Lounge", icon: "deck", color: "bg-teal-100 text-teal-600", bg: "https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" }
};

const MemberFacilities = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [allBookedSlots, setAllBookedSlots] = useState([]);
  const [, setBookedSlotsLoading] = useState(false);
  const [name, setName] = useState("GYM");
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00-11:00");
  const [message, setMessage] = useState("");

  const userId = user?.id || user?._id;

  const loadBookings = useCallback(async () => {
    try {
      if (!userId) return;
      const res = await axios.get(`http://localhost:8888/api/facilities/user/${userId}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const loadBookedSlots = useCallback(async () => {
    setBookedSlotsLoading(true);
    try {
      const res = await axios.get("http://localhost:8888/api/facilities/availability", {
        params: { name, date: bookingDate },
      });
      const booked = (res.data || []).filter((b) => b.status === "BOOKED");
      setAllBookedSlots(booked);
    } catch (err) {
      setAllBookedSlots([]);
    } finally {
      setBookedSlotsLoading(false);
    }
  }, [bookingDate, name]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (name && bookingDate) {
      loadBookedSlots();
    } else {
      setAllBookedSlots([]);
      setBookedSlotsLoading(false);
    }
  }, [bookingDate, loadBookedSlots, name]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      setMessage("Please select a date");
      return;
    }
    const isSlotTaken = allBookedSlots.some((b) => b.timeSlot === timeSlot);
    if (isSlotTaken) {
      setMessage("This slot is already booked. Please choose another.");
      return;
    }
    try {
      await axios.post("http://localhost:8888/api/facilities", {
        userId,
        flatId: user.flatId,
        name,
        bookingDate,
        timeSlot,
      });
      setMessage("Booking successful!");
      setBookingDate("");
      loadBookings();
      loadBookedSlots();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setMessage(msg && String(msg).includes("already booked") ? String(msg) : "Error booking. Slot may be taken.");
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm("Cancel this booking?")) {
      await axios.put(`http://localhost:8888/api/facilities/${id}/cancel`);
      loadBookings();
    }
  };

  const bookedSlotSet = new Set(allBookedSlots.map((b) => b.timeSlot));

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Facilities Management</h2>
        <p className="text-slate-500 font-medium mt-1">Overview of shared amenities and resident reservations.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Book a Facility Section */}
        <section className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-outline-variant/30 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-lg font-extrabold text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">add_circle</span>
              Book a Facility
            </h3>
          </div>
          <form onSubmit={handleBook} className="p-8 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Select Amenity</label>
              <div className="relative group">
                <select 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl px-4 py-3.5 font-bold text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none appearance-none cursor-pointer transition-all"
                >
                  {Object.keys(FACILITY_MAP).map(key => (
                    <option key={key} value={key}>{FACILITY_MAP[key].label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-secondary transition-colors">expand_more</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Reservation Date</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontVariationSettings: "'opsz' 20" }}>calendar_today</span>
                <input 
                  type="date" 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl pl-12 pr-4 py-3.5 font-bold text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block ml-1">Time Slot</label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlotSet.has(slot.value);
                  const isSelected = timeSlot === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setTimeSlot(slot.value)}
                      className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        isSelected 
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                        : isBooked 
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed opacity-50" 
                        : "bg-slate-50 text-slate-500 border border-transparent hover:border-secondary/30 hover:text-secondary"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in slide-in-from-top-2 ${message.includes("successful") ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={bookedSlotSet.has(timeSlot) || !bookingDate}
              className="w-full bg-secondary text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-secondary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Reservation
            </button>
          </form>
        </section>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Featured Facilities Gallery */}
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2 md:col-span-1 h-64 bg-slate-900 rounded-2xl relative overflow-hidden group shadow-lg">
              <img 
                alt="Fitness Center" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                src={FACILITY_MAP["GYM"].bg} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
                <span className="text-white text-xl font-extrabold tracking-tight">Fitness Center</span>
                <p className="text-secondary-fixed text-[10px] font-black uppercase tracking-widest mt-1">Open 24/7 • Level 2</p>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 h-64 bg-slate-900 rounded-2xl relative overflow-hidden group shadow-lg">
              <img 
                alt="Heated Pool" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                src={FACILITY_MAP["SWIMMING_POOL"].bg} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
                <span className="text-white text-xl font-extrabold tracking-tight">Heated Pool</span>
                <p className="text-secondary-fixed text-[10px] font-black uppercase tracking-widest mt-1">6:00 AM - 10:00 PM • Rooftop</p>
              </div>
            </div>

            {/* My Bookings Section */}
            <section className="col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-outline-variant/30 overflow-hidden min-h-[400px] flex flex-col">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-extrabold text-on-surface tracking-tight">My Bookings</h3>
                <button className="text-secondary font-black text-xs uppercase tracking-widest hover:underline transition-all">View History</button>
              </div>
              <div className="overflow-x-auto flex-1 no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold italic">No active reservations found</td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${FACILITY_MAP[b.name]?.color || "bg-slate-100 text-slate-500"}`}>
                                <span className="material-symbols-outlined">{FACILITY_MAP[b.name]?.icon || "apartment"}</span>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-on-surface">{FACILITY_MAP[b.name]?.label || b.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit {b.flatId} • Private Session</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-extrabold text-on-surface">{new Date(b.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{b.timeSlot.replace('-', ' - ')}</p>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-on-surface">2 Hours</td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${
                              b.status === "BOOKED" 
                              ? "bg-secondary/10 text-secondary border-secondary/20" 
                              : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${b.status === "BOOKED" ? "bg-secondary" : "bg-amber-500"}`}></span>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {b.status === "BOOKED" && (
                              <button onClick={() => cancelBooking(b.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-error/10 hover:text-error transition-all group-hover:scale-110">
                                <span className="material-symbols-outlined">cancel</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Facility Map / Access Card */}
          <section className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-outline-variant/30 p-8 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-2/5 space-y-6">
              <div>
                <span className="text-secondary font-black uppercase tracking-widest text-[10px] bg-secondary/10 px-3 py-1 rounded-full">Amenity Access</span>
                <h3 className="text-2xl font-extrabold text-on-surface tracking-tight mt-4">Smart Key Integration</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                All booked facilities are automatically unlocked using your HarmonyStay Digital ID during your reserved time slot.
              </p>
              <div className="flex gap-4">
                <div className="p-6 bg-slate-50 rounded-2xl flex-1 text-center border border-slate-100 hover:border-secondary/30 transition-all group">
                  <span className="material-symbols-outlined text-secondary text-3xl block mb-3 group-hover:scale-110 transition-transform">nfc</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-secondary">NFC Entry</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl flex-1 text-center border border-slate-100 hover:border-secondary/30 transition-all group">
                  <span className="material-symbols-outlined text-secondary text-3xl block mb-3 group-hover:scale-110 transition-transform">qr_code_2</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-secondary">QR Access</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-3/5 h-72 rounded-2xl overflow-hidden relative border border-outline-variant/30 bg-slate-50 group">
              <img 
                alt="Map" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzv8Auiz3qXOOVU_h9NqA3IeFkMcCQW_fjuFhm1zydP4Hem5uRb7MhbEydyHvC82eP6xVVvQlqRm8cLPzEHt-8vI7i3Z2TNhbgrHT577CFl4Rr8IV6kDqThWXEA6JJ6oz1s0IH6el9u1Err78D8pjY2XPjUCKDNZ0vJmxVmFewxtfXeia7ARx0ZlNrvf2SvYUtoo8wWuRhziq0vK4fQ0pt93u8rrRgeUZUS4BgT2LFv1IXEVNKUF4gAZLFw7il_fUVuZA27tkz__k" 
              />
              <div className="absolute inset-0 bg-secondary/5 flex items-center justify-center pointer-events-none">
                <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-outline-variant/20">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-[0_0_12px_rgba(0,106,97,0.5)]"></span>
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface">Active Session: Fitness Center</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-outline-variant/20 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Facility Location: Tower B, Floor 14</span>
                <span className="material-symbols-outlined text-sm text-secondary">explore</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MemberFacilities;
