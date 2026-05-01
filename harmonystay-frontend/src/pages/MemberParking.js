import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MemberParking = () => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVisitorPass, setShowVisitorPass] = useState(false);

  const fetchMemberSlots = async () => {
    if (!user?.flatId) return;
    try {
      const res = await axios.get(
        `http://localhost:8888/api/parking/byFlat/${user.flatId}`
      );
      setSlots(res.data);
    } catch (err) {
      console.error("Error fetching member slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberSlots();
  }, [user]);

  const handlePay = async (slotId) => {
    try {
      await axios.put(`http://localhost:8888/api/parking/pay/${slotId}`);
      alert("Payment successful!");
      fetchMemberSlots();
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed. Try again.");
    }
  };

  const primarySlot = slots[0] || null;

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Parking Management</h2>
        <p className="text-slate-500 font-medium mt-1">Manage your registered vehicles and parking assignments.</p>
      </div>

      {/* Parking Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Spots", val: "150", icon: "grid_view", border: "border-slate-900", text: "text-slate-500" },
          { label: "Occupied", val: "132", icon: "directions_car", border: "border-secondary", text: "text-secondary", fill: true },
          { label: "Available", val: "18", icon: "check_circle", border: "border-teal-400", text: "text-teal-600" },
          { label: "Visitor Spots", val: "05", icon: "person_pin", border: "border-amber-400", text: "text-amber-600" }
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.04)] border-b-4 ${stat.border} flex flex-col justify-between h-36 transition-all hover:translate-y-[-4px] hover:shadow-lg`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${stat.text}`}>{stat.label}</span>
            <div className="flex justify-between items-end">
              <span className="text-4xl font-black text-on-surface">{stat.val}</span>
              <span className={`material-symbols-outlined text-4xl opacity-10 ${stat.text}`} style={stat.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Assets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Registered Vehicles */}
          <section className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-outline-variant/30 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">car_rental</span>
                Registered Vehicles
              </h3>
              <button className="bg-secondary text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-secondary/20">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Vehicle
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {slots.length > 0 ? slots.map((slot, idx) => (
                <div key={slot.id || idx} className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center gap-5 transition-all hover:border-secondary/30 hover:shadow-xl hover:bg-white cursor-pointer">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50 group-hover:bg-secondary/5 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 text-4xl group-hover:text-secondary transition-colors">
                      {slot.vehicleType === "Two Wheeler" ? "moped" : "electric_car"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-on-surface text-lg">{slot.vehicleType || "Assigned Slot"}</p>
                    <p className="text-xs font-black text-slate-400 font-mono tracking-widest uppercase mt-1">{slot.vehicleNumber || "NO VEHICLE"}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${slot.paymentStatus === 'Paid' ? 'bg-secondary/10 text-secondary' : 'bg-amber-100 text-amber-700'}`}>
                        {slot.paymentStatus === 'Paid' ? 'Active' : 'Payment Due'}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Spot {slot.slotNumber}</span>
                    </div>
                  </div>
                  <button className="material-symbols-outlined text-slate-300 hover:text-secondary transition-colors">more_vert</button>
                </div>
              )) : (
                <div className="col-span-2 py-10 text-center text-slate-400 font-bold italic">No vehicles registered yet.</div>
              )}
            </div>
          </section>

          {/* Activity Log */}
          <section className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-outline-variant/30 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-on-surface tracking-tight">Activity Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle / User</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Spot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-on-surface">{user?.name || "Member"}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit {user?.flatId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-widest">
                        <span className="material-symbols-outlined text-lg">login</span>
                        Entry
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500">Today, 08:42 AM</td>
                    <td className="px-8 py-6 text-sm font-black font-mono text-on-surface">{primarySlot?.slotNumber || "B-12"}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                          <span className="material-symbols-outlined text-sm">person_search</span>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-on-surface">Guest Visitor</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VIS-4492</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="flex items-center gap-2 text-error font-black text-[10px] uppercase tracking-widest">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Exit
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500">Yesterday, 06:15 PM</td>
                    <td className="px-8 py-6 text-sm font-black font-mono text-on-surface">V-03</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-8">
          {/* Parking Spot Details */}
          <section className="bg-primary-container text-white rounded-3xl shadow-2xl p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <span className="text-[10px] text-secondary-fixed-dim font-black uppercase tracking-[0.3em]">Primary Assignment</span>
              <h2 className="text-6xl font-black mt-4 tracking-tighter group-hover:text-secondary-fixed transition-colors">{primarySlot?.slotNumber || "B-12"}</h2>
              <p className="text-sm font-bold text-slate-400 mt-2">Lower Level, South Wing</p>
              
              <div className="mt-10 flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Access Code</span>
                  <span className="text-lg font-black font-mono tracking-widest text-secondary-fixed-dim">#4492</span>
                </div>
                <div className="w-px h-12 bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">EV Charger</span>
                  <span className="text-lg font-black text-secondary-fixed-dim flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl animate-pulse">bolt</span>
                    Active
                  </span>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-800">
                <div className="relative rounded-2xl overflow-hidden h-40">
                  <img 
                    alt="Map" 
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000 grayscale" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMr2htnMhmW3Aa69D8Z7gRPXMQQmukqNGdGsgpoT78CLlwEbgyLqBcw8nRR5RWbqSKIYvGOsszBoIFtxJd0-irpDxqxIdBjQ0KZHx8ZmlGQObiERZtJvJkzP5e7_kElwbqbuTWHint_TStCpHIie2f5wJe0N0lktGvXV_GbEMi4KRcz8hCndXy24HF_dJp3va0RHllCvjdlm5RIyxWqy24dS0QcMOQ1s1QmvjZYn1ZIhYnQY6OPp03hPEAOFplpx43H6UyE1PPgXc" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent"></div>
                </div>
                <button className="w-full mt-6 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white border border-slate-700 py-4 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-lg">map</span>
                  Open Garage Map
                </button>
              </div>
            </div>
          </section>

          {/* Visitor Parking Request */}
          <section className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.05)] p-8 border border-outline-variant/30">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                <span className="material-symbols-outlined text-2xl">assignment_ind</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">Visitor Request</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Register a guest vehicle</p>
              </div>
            </div>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Visitor Pass Generated!'); }}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">License Plate</label>
                <input 
                  className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-4 px-5 focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all text-sm font-black uppercase placeholder:text-slate-300 outline-none" 
                  placeholder="Enter Plate Number" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duration</label>
                  <select className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-4 px-5 focus:ring-4 focus:ring-secondary/10 focus:border-secondary text-sm font-black outline-none cursor-pointer">
                    <option>4 Hours</option>
                    <option>12 Hours</option>
                    <option>24 Hours</option>
                    <option>Overnight</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                  <select className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-4 px-5 focus:ring-4 focus:ring-secondary/10 focus:border-secondary text-sm font-black outline-none cursor-pointer">
                    <option>Guest</option>
                    <option>Service</option>
                    <option>Delivery</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-on-background hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-on-background/10 mt-4" type="submit">
                Generate Visitor Pass
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MemberParking;
