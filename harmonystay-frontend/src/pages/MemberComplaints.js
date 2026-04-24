import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./MemberComplaints.css";

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const statusClass = (status) => {
  if (status === "RESOLVED") {
    return "resolved";
  }

  if (status === "IN_PROGRESS") {
    return "progress";
  }

  return "pending";
};

const MemberComplaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState("MAINTENANCE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const uid = user?.id || user?._id;

    if (!uid) {
      return;
    }

    let cancelled = false;

    const loadComplaints = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8888/api/complaints/user/${uid}`
        );

        if (!cancelled) {
          setComplaints(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadComplaints();

    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !description) {
      setMessage("Please fill all fields.");
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
      setMessage("Complaint lodged successfully.");
      setReloadKey((value) => value + 1);
    } catch (error) {
      console.error(error);
      setMessage("Error lodging complaint.");
    }
  };

  const openCount = complaints.filter((item) => item.status === "PENDING").length;
  const progressCount = complaints.filter((item) => item.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((item) => item.status === "RESOLVED").length;

  return (
    <div className="member-complaints-container">
      <div className="member-complaints__header">
        <div>
          <p className="member-complaints__eyebrow">Resident help desk</p>
          <h2>Complaints</h2>
          <p>Log issues clearly and keep track of responses without losing status visibility.</p>
        </div>
      </div>

      <div className="member-complaints__stats">
        <article>
          <span>Total</span>
          <strong>{complaints.length}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{openCount}</strong>
        </article>
        <article>
          <span>In progress</span>
          <strong>{progressCount}</strong>
        </article>
        <article>
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
        </article>
      </div>

      <div className="member-complaints__layout">
        <form className="complaint-form" onSubmit={handleSubmit}>
          <h3>Lodge a complaint</h3>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="WATER">Water</option>
            <option value="SECURITY">Security</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            placeholder="Complaint title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <textarea
            placeholder="Describe the issue"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
          <button type="submit">Submit complaint</button>
          {message && <p className="msg">{message}</p>}
        </form>

        <div className="complaint-list">
          {complaints.length === 0 ? (
            <div className="member-complaints__empty">You have not logged any complaints yet.</div>
          ) : (
            complaints.map((complaint) => (
              <article
                key={complaint.id || complaint._id}
                className={`complaint-card ${statusClass(complaint.status)}`}
              >
                <div className="complaint-card__top">
                  <div>
                    <span className="complaint-card__category">
                      {formatLabel(complaint.category)}
                    </span>
                    <h4>{complaint.title}</h4>
                  </div>
                  <span className={`status ${statusClass(complaint.status)}`}>
                    {formatLabel(complaint.status)}
                  </span>
                </div>

                <p>{complaint.description}</p>

                {complaint.adminFeedback && (
                  <div className="feedback">
                    <strong>Admin feedback</strong>
                    <span>{complaint.adminFeedback}</span>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberComplaints;
