import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FaBolt, FaFileInvoiceDollar, FaShieldAlt, FaTools, FaThLarge } from "react-icons/fa";
import "./SecurityDashboard.css";

const SecurityDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [flatNumber, setFlatNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("etc");
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const getCategoryIcon = (value) => {
    const key = String(value || "").toLowerCase();
    if (key === "plumbing") return <FaTools />;
    if (key === "electrical") return <FaBolt />;
    if (key === "security") return <FaShieldAlt />;
    if (key === "billing") return <FaFileInvoiceDollar />;
    return <FaThLarge />;
  };

  useEffect(() => {
    if (!user || user.role !== "security") {
      navigate("/");
      return undefined;
    }
    loadRequests();
    const intervalId = setInterval(loadRequests, 8000);
    return () => clearInterval(intervalId);
  }, [user, navigate]);

  const loadRequests = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/visitor-requests/security");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:8888/api/visitor-requests/security", {
        flatNumber: flatNumber.trim(),
        purpose: purpose.trim(),
        category,
        securityName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Security",
        securityId: user?.id || "",
      });
      setFlatNumber("");
      setPurpose("");
      setCategory("etc");
      setMessage("Request sent to member successfully.");
      loadRequests();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to send request.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="security-dashboard">
      <div className="security-header">
        <h2>Security Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="security-card">
        <h3>Visitor Request to Flat Owner</h3>
        <form className="security-form" onSubmit={submitRequest}>
          <input
            type="text"
            placeholder="Flat Number"
            value={flatNumber}
            onChange={(e) => {
              setFlatNumber(e.target.value);
            }}
            required
          />
          <input
            type="text"
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="security">Security</option>
            <option value="billing">Billing</option>
            <option value="etc">Etc.</option>
          </select>
          <button type="submit">Send Request</button>
        </form>
        {message && <p className="message-text">{message}</p>}
      </div>

      <div className="security-card">
        <h3>Visitor Request Status</h3>
        <div className="table-wrap">
          <table className="security-table">
            <thead>
              <tr>
                <th>Flat</th>
                <th>Member</th>
                <th>Purpose</th>
                <th>Category</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Responded At</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.flatNumber}</td>
                  <td>{r.memberName}</td>
                  <td>{r.purpose}</td>
                  <td>
                    <span className="category-chip">
                      {getCategoryIcon(r.category)}
                      {r.category || "etc"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${String(r.status || "").toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                  <td>{r.respondedAt ? new Date(r.respondedAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="7">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
