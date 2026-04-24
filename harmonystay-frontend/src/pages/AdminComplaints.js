import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminComplaints.css";

const FILTERS = ["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"];

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [feedback, setFeedback] = useState({});
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadComplaints = async () => {
      try {
        const response = await axios.get("http://localhost:8888/api/complaints");

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
  }, [reloadKey]);

  const updateStatus = async (id, status) => {
    const complaint = complaints.find((item) => String(item.id || item._id) === String(id));

    try {
      await axios.put(`http://localhost:8888/api/complaints/${id}/status`, {
        status,
        adminFeedback:
          feedback[id] ?? complaint?.adminFeedback ?? "",
      });

      setReloadKey((value) => value + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredComplaints =
    filter === "ALL"
      ? complaints
      : complaints.filter((complaint) => complaint.status === filter);

  const pendingCount = complaints.filter((item) => item.status === "PENDING").length;
  const progressCount = complaints.filter((item) => item.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((item) => item.status === "RESOLVED").length;

  return (
    <div className="admin-complaints-container">
      <div className="admin-complaints__header">
        <div>
          <p className="admin-complaints__eyebrow">Service desk</p>
          <h2>Complaint management</h2>
          <p>Move issues from pending to resolved while leaving residents clear admin feedback.</p>
        </div>
      </div>

      <div className="admin-complaints__stats">
        <article>
          <span>Total</span>
          <strong>{complaints.length}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
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

      <div className="admin-complaints__filters">
        {FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className={filter === status ? "is-active" : ""}
            onClick={() => setFilter(status)}
          >
            {formatLabel(status)}
          </button>
        ))}
      </div>

      <div className="complaints-table-wrap">
        {filteredComplaints.length === 0 ? (
          <div className="admin-complaints__empty">No complaints match the current filter.</div>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Flat</th>
                <th>Category</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => {
                const id = complaint.id || complaint._id;

                return (
                  <tr key={id}>
                    <td>{complaint.flatId || "N/A"}</td>
                    <td>{formatLabel(complaint.category)}</td>
                    <td>
                      <strong>{complaint.title}</strong>
                      <p>{complaint.description}</p>
                    </td>
                    <td>
                      <span className={`badge ${complaint.status}`}>
                        {formatLabel(complaint.status)}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Add admin feedback"
                        value={feedback[id] ?? complaint.adminFeedback ?? ""}
                        onChange={(event) =>
                          setFeedback((current) => ({
                            ...current,
                            [id]: event.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <div className="admin-complaints__actions">
                        {complaint.status !== "IN_PROGRESS" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(id, "IN_PROGRESS")}
                          >
                            Mark in progress
                          </button>
                        )}
                        {complaint.status !== "RESOLVED" && (
                          <button
                            type="button"
                            className="resolve"
                            onClick={() => updateStatus(id, "RESOLVED")}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
