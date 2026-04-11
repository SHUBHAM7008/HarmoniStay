import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MemberDocuments.css";

const MemberDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === "ALL" ? documents : documents.filter((d) => d.category === filter);

  return (
    <div className="member-documents-container">
      <h2>Document Repository</h2>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
        <option value="ALL">All</option>
        <option value="REGISTRATION">Registration</option>
        <option value="NOC">NOC</option>
        <option value="AGM_REPORT">AGM Report</option>
        <option value="MINUTES">Minutes</option>
        <option value="OTHER">Other</option>
      </select>
      <div className="doc-list">
        {filtered.map((d) => (
          <div key={d.id} className="doc-card">
            <h4>{d.title}</h4>
            <p><strong>Category:</strong> {d.category}</p>
            <p>{d.description}</p>
            {d.fileUrl && d.fileUrl !== "#" && (
              <a href={d.fileUrl} target="_blank" rel="noreferrer">View / Download</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberDocuments;
