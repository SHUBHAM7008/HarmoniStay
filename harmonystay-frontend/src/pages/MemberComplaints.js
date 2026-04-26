import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./MemberComplaints.css";

const MemberComplaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState("MAINTENANCE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.id || user?._id) loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    try {
      const uid = user?.id || user?._id;
      const res = await axios.get(`http://localhost:8888/api/complaints/user/${uid}`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setMessage("Please fill all fields");
      return;
    }
    try {
      const uid = user?.id || user?._id;
      await axios.post("http://localhost:8888/api/complaints", {
        userId: uid,
        flatId: user.flatId,
        category,
        title,
        description,
      });
      setTitle("");
      setDescription("");
      setMessage("Complaint lodged successfully!");
      loadComplaints();
    } catch (err) {
      setMessage("Error lodging complaint");
    }
  };

  const statusClass = (s) => (s === "RESOLVED" ? "resolved" : s === "IN_PROGRESS" ? "progress" : "pending");

  return (
    <div className="member-complaints-container">
      <h2>Lodge a Complaint</h2>
      <form className="complaint-form" onSubmit={handleSubmit}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="ELECTRICITY">Electricity</option>
          <option value="WATER">Water</option>
          <option value="SECURITY">Security</option>
          <option value="OTHER">Other</option>
        </select>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit">Submit Complaint</button>
      </form>
      {message && <p className="msg">{message}</p>}

      <h3>My Complaints</h3>
      <div className="complaint-list">
        {complaints.map((c) => (
          <div key={c.id} className={`complaint-card ${statusClass(c.status)}`}>
            <h4>{c.title}</h4>
            <p><strong>Category:</strong> {c.category}</p>
            <p>{c.description}</p>
            <span className={`status ${statusClass(c.status)}`}>{c.status}</span>
            {c.adminFeedback && <p className="feedback"><strong>Admin:</strong> {c.adminFeedback}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberComplaints;
