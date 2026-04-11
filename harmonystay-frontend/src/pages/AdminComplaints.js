import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminComplaints.css";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    const c = complaints.find((x) => (x.id || x._id) === id);
    try {
      await axios.put(`http://localhost:8888/api/complaints/${id}/status`, {
        status,
        adminFeedback: feedback[id] ?? c?.adminFeedback ?? "",
      });
      loadComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === "ALL" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="admin-complaints-container">
      <h2>Complaint Management</h2>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
        <option value="ALL">All</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      <div className="complaints-table-wrap">
        <table className="complaints-table">
          <thead>
            <tr>
              <th>Flat</th>
              <th>Category</th>
              <th>Title</th>
              <th>Status</th>
              <th>Feedback</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id || c._id}>
                <td>{c.flatId}</td>
                <td>{c.category}</td>
                <td>{c.title}</td>
                <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                <td>
                  <input
                    type="text"
                    placeholder="Admin feedback"
                    value={feedback[c.id || c._id] ?? c.adminFeedback ?? ""}
                    onChange={(e) => setFeedback({ ...feedback, [c.id || c._id]: e.target.value })}
                  />
                </td>
                <td>
                  {c.status !== "IN_PROGRESS" && (
                    <button onClick={() => updateStatus(c.id || c._id, "IN_PROGRESS")}>In Progress</button>
                  )}
                  {c.status !== "RESOLVED" && (
                    <button className="resolve" onClick={() => updateStatus(c.id || c._id, "RESOLVED")}>Resolve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComplaints;
