import React, { useEffect, useState } from "react";
import axios from "axios";

const MemberDocuments = () => {
  const [documents, setDocuments] = useState([
    { id: "demo-1", title: "Q4_Annual_Financial_Statement.pdf", category: "FINANCIAL", description: "Audited financial report for the last quarter.", date: "Oct 24, 2023" },
    { id: "demo-2", title: "Community_Safety_Protocols.docx", category: "REGISTRATION", description: "Updated safety and security guidelines for 2024.", date: "Oct 22, 2023" },
    { id: "demo-3", title: "AGM_Meeting_Minutes_Sept.pdf", category: "MINUTES", description: "Official notes from the September General Meeting.", date: "Sep 28, 2023" },
    { id: "demo-4", title: "Festival_Celebration_Circular.pdf", category: "OTHER", description: "Guidelines for upcoming community celebrations.", date: "Oct 15, 2023" }
  ]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/documents");
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length > 0) {
        // Keep demo data but add real data at the top
        setDocuments(prev => {
          const demoIds = new Set(["demo-1", "demo-2", "demo-3", "demo-4"]);
          const onlyDemo = prev.filter(d => demoIds.has(d.id));
          return [...data, ...onlyDemo];
        });
      }
    } catch (err) {
      console.error("API failed, keeping demo data");
    }
  };

  const filtered = filter === "ALL" ? documents : documents.filter((d) => d.category === filter);

  const getDocIcon = (title) => {
    const ext = title.toLowerCase().split('.').pop();
    if (ext === 'pdf') return { icon: 'picture_as_pdf', color: 'bg-red-50 text-red-600' };
    if (ext === 'doc' || ext === 'docx') return { icon: 'description', color: 'bg-blue-50 text-blue-600' };
    if (ext === 'xls' || ext === 'xlsx') return { icon: 'table_chart', color: 'bg-green-50 text-green-600' };
    return { icon: 'draft', color: 'bg-slate-50 text-slate-600' };
  };

  const categories = [
    { label: "All Documents", value: "ALL" },
    { label: "Rules & Regulations", value: "REGISTRATION" },
    { label: "Financials", value: "FINANCIAL" },
    { label: "Meeting Minutes", value: "MINUTES" },
    { label: "Notices", value: "OTHER" }
  ];

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Document Repository</h1>
          <p className="text-slate-500 font-medium">Manage and access centralized documentation for HarmonyStay residents and staff.</p>
        </div>
        <button className="flex items-center gap-3 bg-secondary text-white px-6 py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-secondary/20 active:scale-95 group">
          <span className="material-symbols-outlined text-xl group-hover:animate-bounce">cloud_upload</span>
          <span className="text-xs font-black uppercase tracking-widest">Upload Document</span>
        </button>
      </div>

      {/* Categories / Quick Filters */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">
        {categories.map((cat) => (
          <button 
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              filter === cat.value 
              ? "bg-on-primary-fixed text-white border-on-primary-fixed shadow-md" 
              : "bg-white border-slate-200 text-slate-500 hover:border-secondary hover:text-secondary"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Section (Bento Inspired) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 relative overflow-hidden bg-primary-container rounded-3xl p-10 text-white group shadow-xl">
          <div className="relative z-10 flex flex-col h-full justify-between gap-10">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container/20 text-secondary-container text-[10px] font-black uppercase tracking-widest mb-6 border border-secondary-container/10">Pinned Resource</span>
              <h2 className="text-4xl font-black leading-tight tracking-tighter">Community Bylaws <br/>& Regulations 2024</h2>
              <p className="text-slate-400 mt-4 max-w-md font-medium leading-relaxed">The comprehensive guide for all residents, covering parking, waste management, and shared facility usage.</p>
            </div>
            <div className="flex flex-wrap gap-6 items-center">
              <button className="bg-white text-primary-container px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-100 transition-all active:scale-95">
                <span className="material-symbols-outlined text-lg">visibility</span> View Now
              </button>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history</span> Updated 2 days ago
              </span>
            </div>
          </div>
          <div className="absolute right-[-5%] bottom-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-12 group-hover:rotate-0">
            <span className="material-symbols-outlined text-[20rem]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-on-surface tracking-tight">Quick Stats</h3>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-secondary transition-colors" style={{ fontVariationSettings: "'opsz' 32" }}>analytics</span>
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Storage</span>
                  <span className="text-sm font-black text-on-surface">4.2 / 10 GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-50">
                  <div className="bg-secondary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,106,97,0.3)]" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-secondary/10 transition-all">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">PDF Files</span>
                  <span className="text-sm font-black text-on-surface">124 items</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-secondary/10 transition-all">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Spreadsheets</span>
                  <span className="text-sm font-black text-on-surface">12 items</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full border-2 border-slate-100 py-3 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:border-secondary/20 hover:text-secondary transition-all mt-10">Manage Storage</button>
        </div>
      </div>

      {/* Document List View */}
      <section className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-outline-variant/30 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xl font-black text-on-surface tracking-tight">Recent Documents</h3>
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
              <button className="p-2 bg-slate-50 text-secondary rounded-lg shadow-inner"><span className="material-symbols-outlined">list</span></button>
              <button className="p-2 text-slate-300 hover:text-slate-600 transition-all"><span className="material-symbols-outlined">grid_view</span></button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modified</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold italic">Loading documents...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold italic">No documents found in this category</td></tr>
              ) : filtered.map((doc) => {
                const style = getDocIcon(doc.title || doc.name || "");
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 ${style.color}`}>
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'opsz' 28" }}>{style.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-on-surface group-hover:text-secondary transition-colors">{doc.title || doc.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{doc.description || "Public document resource"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-black border border-secondary/20 uppercase tracking-widest">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">2.4 MB</td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{doc.date || "Oct 12, 2023"}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-secondary/10 hover:text-secondary transition-all">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-secondary/10 hover:text-secondary transition-all">
                          <span className="material-symbols-outlined text-lg">download</span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-secondary/10 hover:text-secondary transition-all">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filtered.length} of {documents.length} documents</span>
          <div className="flex gap-3">
            <button className="px-5 py-2 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:border-secondary/20 hover:text-secondary transition-all">Previous</button>
            <button className="px-5 py-2 bg-on-primary-fixed text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-on-primary-fixed/20 hover:brightness-110 active:scale-95 transition-all">Next</button>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all z-50 group">
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
        <div className="absolute right-20 bg-on-background text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl whitespace-nowrap">
          Quick Upload
        </div>
      </button>
    </div>
  );
};

export default MemberDocuments;
