import React, { useEffect, useState } from "react";

const MemberNotices = () => {
  const [notices, setNotices] = useState([
    { id: "demo-1", title: "Spring Rooftop Garden Re-opening", description: "Our seasonal rooftop garden is officially open for the spring season. Join us this Friday for a small sundowner event to celebrate the new plantings...", date: new Date(), type: "Community" },
    { id: "demo-2", title: "Biometric Access Point Updates", description: "To enhance premises security, all lobby biometric readers will undergo firmware updates tonight between 2 AM and 4 AM. Manual access will be available.", date: new Date(), type: "Security" },
    { id: "demo-3", title: "Quarterly Resident Mixer", description: "Don't miss our upcoming Q4 mixer at the Clubhouse Lounge. This is a great opportunity to meet your neighbors and the new concierge team...", date: new Date(), type: "Events" },
    { id: "demo-4", title: "Pool Drainage and Cleaning", description: "The West Wing infinity pool will be closed for a deep clean and filtration check. We apologize for any inconvenience caused during this period.", date: new Date(), type: "Maintenance" }
  ]);
  const [filter, setFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:8888/api/notices");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setNotices(prev => {
          const demoIds = new Set(["demo-1", "demo-2", "demo-3", "demo-4"]);
          const onlyDemo = prev.filter(n => demoIds.has(n.id));
          return [...data, ...onlyDemo];
        });
      }
    } catch (err) {
      console.error("Error fetching notices, using demo data:", err);
    }
  };

  const getNoticeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'community': return { icon: 'local_florist', color: 'bg-teal-100 text-teal-600' };
      case 'security': return { icon: 'shield_locked', color: 'bg-blue-100 text-blue-600' };
      case 'events': return { icon: 'event', color: 'bg-amber-100 text-amber-600' };
      case 'maintenance': return { icon: 'water_drop', color: 'bg-purple-100 text-purple-600' };
      default: return { icon: 'campaign', color: 'bg-slate-100 text-slate-600' };
    }
  };

  const categories = ["All Notices", "Maintenance", "Community", "Security", "Events"];
  
  const filteredNotices = (filter === "ALL"
    ? notices
    : notices.filter(n => (n.type || "").toUpperCase() === filter.toUpperCase())
  ).sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-700">
      {/* Filters Section */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-3 items-center overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setFilter(cat === "All Notices" ? "ALL" : cat)}
                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                  (cat === "All Notices" ? filter === "ALL" : filter === cat)
                  ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20" 
                  : "bg-white text-slate-500 border-slate-100 hover:border-secondary hover:text-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-slate-400 whitespace-nowrap">
            <label htmlFor="notice-sort" className="text-[10px] font-black uppercase tracking-widest">Sorted by:</label>
            <select
              id="notice-sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-on-surface font-black text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 outline-none cursor-pointer focus:ring-4 focus:ring-secondary/10 focus:border-secondary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notices Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-bold italic">No notices found for this category</div>
        ) : filteredNotices.map((notice, idx) => {
          const style = getNoticeIcon(notice.type);
          return (
            <div 
              key={notice.id} 
              className="group bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_24px_48px_rgba(15,23,42,0.1)] transition-all duration-500 hover:-translate-y-2 border border-outline-variant/30 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${style.color}`}>
                  <span className="material-symbols-outlined">{style.icon}</span>
                </div>
                <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">{notice.type || "General"}</span>
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">{new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <h3 className="text-xl font-extrabold mb-4 text-on-surface group-hover:text-secondary transition-colors leading-tight">{notice.title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-4 flex-1">
                {notice.description}
              </p>
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-50">
                {notice.type === "Community" ? (
                  <div className="flex -space-x-3">
                    <img alt="User" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADsxvc01fnF3i44is5we4hJ_V3qa0sqVvd2mafhvRfjbjMBf8phhFIPbJesEmkVpacjAQUqenXhNry3VbAv4Q5umSFQiv9vnKncBF29iZ4xZ9N7--4e3RPqbCDw2Fw2NPNU8qN6wuXVkfjKZ237tGesdKxmQEp-SW33-PFRA5Gsgnr48JQNlGYPdcy_Wry3tJBHfYqpx6L_lV1pOdi9Ev8xy8VTWSP4MY135DsbdqM-Z4zysF-rI0Yqkr9YbLiT0VS1_LGWt2smvo" />
                    <img alt="User" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLS0uh0rK6unvyhStFQhf_3nUIqxZlHjRTx-mhNqwsyLcom5nmYfDp5XcYrNXYL80y4Kz_fUEFA0P0MGys6kiuBHct2lUyD1un6f_xlLsohHrywjKXwlUJ8MSVjH4JbuNMm3UEdyQX_DkZXuqeInLDHR5twiOkKKSfmzgYeYQB1mEEJw8XpvBSlsYQrMRr52oXz4Ne0mXgA54Jnp55GmjjI-DHJsa3G_WYL1qBfLGAAB-f43f98WlGMp0blz7LSN9dqIi6lJeAaZo" />
                    <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">+14</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                    Action Required
                  </div>
                )}
                <button className="text-secondary text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                  Read more
                  <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Pagination/Load More */}
      <div className="flex justify-center mt-16">
        <button className="flex items-center gap-3 px-10 py-4 bg-white border-2 border-slate-50 text-on-surface rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/50 group">
          Load Older Notices
          <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
        </button>
      </div>
    </div>
  );
};

export default MemberNotices;
