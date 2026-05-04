import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MemberComplaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState("MAINTENANCE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [feedbackForms, setFeedbackForms] = useState({});
  const userId = user?.id || user?._id;

  const loadComplaints = useCallback(async () => {
    try {
      if (!userId) return;
      const res = await axios.get(`http://localhost:8888/api/complaints/user/${userId}`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setMessage("Please fill all fields");
      return;
    }
    try {
      await axios.post("http://localhost:8888/api/complaints", {
        userId,
        flatId: user.flatId,
        category,
        title,
        description,
      });
      setTitle("");
      setDescription("");
      setMessage("Complaint lodged successfully!");
      loadComplaints();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error lodging complaint");
    }
  };

  const updateFeedbackForm = (id, patch) => {
    setFeedbackForms((prev) => ({
      ...prev,
      [id]: {
        rating: prev[id]?.rating || 5,
        description: prev[id]?.description || "",
        ...patch,
      },
    }));
  };

  const submitComplaintFeedback = async (complaint) => {
    const id = complaint.id || complaint._id;
    const form = feedbackForms[id] || { rating: 5, description: "" };
    if (!form.description.trim()) {
      setMessage("Please add feedback description");
      return;
    }

    try {
      await axios.put(`http://localhost:8888/api/complaints/${id}/member-feedback`, {
        userId,
        rating: String(form.rating),
        description: form.description.trim(),
      });
      setMessage("Feedback submitted successfully!");
      setFeedbackForms((prev) => ({ ...prev, [id]: { rating: 5, description: "" } }));
      await loadComplaints();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error submitting feedback");
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (activeFilter === "All") return true;
    return c.status === activeFilter.toUpperCase().replace(" ", "_");
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-secondary/10 text-secondary border-secondary/20 dot-bg-secondary";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-700 border-amber-200 dot-bg-amber-500";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 dot-bg-slate-400";
    }
  };

  const getCategoryTagStyles = (cat) => {
    switch (cat) {
      case "WATER": return "bg-blue-50 text-blue-600";
      case "ELECTRICITY": return "bg-yellow-50 text-yellow-700";
      case "SECURITY": return "bg-red-50 text-red-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-8">
        {/* Section 1: Lodge a Complaint */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">edit_note</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">Lodge a Complaint</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tell us how we can improve your stay</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-on-surface uppercase tracking-widest mb-2 ml-1">Issue Category</label>
                <div className="relative group">
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl px-4 py-3.5 font-bold text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="MAINTENANCE">General Maintenance</option>
                    <option value="WATER">Water Supply & Plumbing</option>
                    <option value="ELECTRICITY">Electricity & Power</option>
                    <option value="SECURITY">Security & Safety</option>
                    <option value="OTHER">Other Issues</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-secondary transition-colors">expand_more</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-on-surface uppercase tracking-widest mb-2 ml-1">Title</label>
                <input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl px-4 py-3.5 font-bold text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all placeholder:text-slate-300" 
                  placeholder="e.g. Low water pressure in kitchen" 
                  type="text"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-on-surface uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl px-4 py-3.5 font-bold text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all placeholder:text-slate-300 min-h-[120px]" 
                  placeholder="Provide as much detail as possible..." 
                  rows="4"
                  required
                ></textarea>
              </div>
              
              {message && (
                <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in slide-in-from-top-2 ${message.includes("success") ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>
                  {message}
                </div>
              )}

              <button className="w-full py-4 bg-secondary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-secondary/20" type="submit">
                Submit Complaint
              </button>
            </form>
          </div>
          
          <div className="bg-primary-container text-white rounded-2xl p-8 overflow-hidden relative group">
            <div className="relative z-10">
              <h4 className="text-xl font-extrabold mb-2">Urgent Matters?</h4>
              <p className="text-sm font-medium opacity-70 mb-6 leading-relaxed">For life-threatening emergencies or critical fire hazards, please use the direct concierge hotline.</p>
              <a className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-3.5 rounded-full font-black text-sm transition-all active:scale-95 border border-white/5 backdrop-blur-sm" href="tel:+123456789">
                <span className="material-symbols-outlined">call</span>
                +1 (234) 567 890
              </a>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-secondary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <span className="material-symbols-outlined absolute top-8 right-8 text-white/5 text-8xl select-none group-hover:rotate-12 transition-transform duration-700">support_agent</span>
          </div>
        </section>

        {/* Section 2: My Complaints */}
        <section className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30 h-full flex flex-col min-h-[600px]">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-extrabold text-on-surface tracking-tight">My Complaints</h3>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-outline-variant/20">
                {["All", "Pending", "Resolved"].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeFilter === filter 
                      ? "bg-white text-secondary shadow-sm" 
                      : "text-slate-400 hover:text-on-surface"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex-1 no-scrollbar overflow-y-auto">
              {filteredComplaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <span className="material-symbols-outlined text-6xl mb-4">cloud_done</span>
                  <p className="font-bold">No complaints found</p>
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <div key={c.id || c._id} className="group border border-outline-variant/30 rounded-2xl p-6 hover:border-secondary/30 hover:shadow-md transition-all bg-slate-50/20">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${getCategoryTagStyles(c.category)}`}>
                          {c.category}
                        </span>
                        <h4 className="font-extrabold text-on-surface tracking-tight">{c.title}</h4>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter transition-colors ${getStatusStyles(c.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full current-dot bg-current"></span>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant mb-6 leading-relaxed">
                      {c.description}
                    </p>
                    
                    {c.adminFeedback ? (
                      <div className="bg-white border-l-4 border-secondary p-5 rounded-r-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-secondary text-base">admin_panel_settings</span>
                          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Management Response</span>
                          <span className="text-[10px] text-slate-400 ml-auto font-bold">{c.updatedDate ? new Date(c.updatedDate).toLocaleDateString() : "Recently"}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                          "{c.adminFeedback}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                        <span className="material-symbols-outlined text-sm animate-pulse">schedule</span>
                        Awaiting Manager Review
                      </div>
                    )}

                    {c.memberFeedbackRating ? (
                      <div className="mt-5 bg-secondary/5 border border-secondary/10 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-amber-400 text-base">star</span>
                          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Your Feedback</span>
                          <span className="text-xs font-black text-amber-500 ml-auto">{c.memberFeedbackRating}/5</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.memberFeedbackDescription}</p>
                      </div>
                    ) : (
                      <div className="mt-5 bg-white rounded-2xl border border-outline-variant/40 p-5">
                        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Feedback to Admin</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const id = c.id || c._id;
                              const selected = feedbackForms[id]?.rating || 5;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => updateFeedbackForm(id, { rating: star })}
                                  className={`material-symbols-outlined text-2xl transition-all ${star <= selected ? "text-amber-400" : "text-slate-200 hover:text-amber-200"}`}
                                  style={{ fontVariationSettings: star <= selected ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                  star
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <textarea
                          value={feedbackForms[c.id || c._id]?.description || ""}
                          onChange={(e) => updateFeedbackForm(c.id || c._id, { description: e.target.value })}
                          className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-bold focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none min-h-[84px]"
                          placeholder="Share your feedback about how this complaint was handled..."
                        />
                        <button
                          type="button"
                          onClick={() => submitComplaintFeedback(c)}
                          className="mt-3 px-5 py-3 bg-secondary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex items-center justify-center pt-6 border-t border-slate-50">
              <button className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-widest hover:underline transition-all">
                View Archival Records
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MemberComplaints;
