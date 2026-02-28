// src/pages/MemberProfile.js
import React, { useEffect, useState } from "react";
import { FaUserCircle, FaHome, FaHistory } from "react-icons/fa";
import axios from "axios";
import "./MemberProfile.css";

export default function MemberProfile({ user }) {
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");


  useEffect(() => {
    const fetchFlat = async () => {
      if (!user?.flatId) return;
      try {
        const res = await axios.get(`http://localhost:8888/api/flats/${user.flatId}`);
        console.log(user.flatId);
        console.log(res);
        setFlat(res.data);
      } catch (err) {
        console.error("Error fetching flat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlat();
  }, [user]);

  const sendOtp = async () => {
    try {
      console.log("sending !!");
      await axios.post(`http://localhost:8888/api/members/send-otp/${user.id}`);
      setOtpSent(true);
      setMessage("OTP sent to your registered phone.");
      console.log(user);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send OTP.");
    }
  };

  const changePassword = async () => {
    try {
      const res = await axios.post(`http://localhost:8888/api/members/change-password/${user.id}`, {
        otp,
        newPassword,
      });
      setMessage(res.data);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to change password.");
    }
  };


  if (!user) return <div className="profile-loading">Loading member...</div>;

  return (
    <div className="member-profile">
      <div className="profile-header">
        <FaUserCircle className="profile-avatar" size={90} />
        <h2>{user.firstName} {user.lastName}</h2>
        <p className="profile-role">{user.role?.toUpperCase()}</p>
      </div>

      <div className="profile-section">
        <h3>👤 Personal Details</h3>
        <div className="profile-grid">
          <p><strong>Email:</strong> {user.email || "N/A"}</p>
          <p><strong>Phone:</strong> {user.phone || "N/A"}</p>
          <p><strong>Join Date:</strong> {user.dateOfJoining || "N/A"}</p>
          <p><strong>Status:</strong> {user.status || "Active"}</p>
        </div>
      </div>

<div className="profile-section">
        <h3>🔑 Change Password</h3>
        {!otpSent && <button onClick={sendOtp}>Send OTP</button>}
        {otpSent && (
          <div className="change-password-form">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={changePassword}>Change Password</button>
          </div>
        )}
        {message && <p>{message}</p>}
      </div>
      {!loading && flat && (
        <div className="profile-section">
          <h3><FaHome /> Flat Details</h3>
          <div className="profile-grid">
            <p><strong>Flat No:</strong> {flat.flatNumber || 'N/A'}</p>
            <p><strong>Wing:</strong> {flat.wing}</p>
            <p><strong>Floor:</strong> {flat.floor}</p>
            <p><strong>Area:</strong> {flat.area} sqft</p>
            <p><strong>Type:</strong> {flat.type}</p>
            <p><strong>Status:</strong> {flat.status}</p>
          </div>

          {flat.owner && (
            <div className="sub-section">
              <h4>🏠 Owner</h4>
              <p><strong>Name:</strong> {flat.owner.firstName} {flat.owner.lastName}</p>
              <p><strong>Email:</strong> {flat.owner.email}</p>
            </div>
          )}

          {flat.tenant && (
            <div className="sub-section">
              <h4>👥 Tenant</h4>
              <p><strong>Name:</strong> {flat.tenant.firstName} {flat.tenant.lastName}</p>
              <p><strong>Email:</strong> {flat.tenant.email}</p>
            </div>
          )}

          {flat.ownershipHistory?.length > 0 && (
            <div className="sub-section">
              <h4><FaHistory /> Ownership History</h4>
              <table className="ownership-table">
                <thead>
                  <tr>
                    <th>Previous Owner</th>
                    <th>New Owner</th>
                    <th>Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {flat.ownershipHistory.map((h, idx) => (
                    <tr key={idx}>
                      <td>{h.previousOwnerId}</td>
                      <td>{h.newOwnerId}</td>
                      <td>{new Date(h.transferDate).toLocaleDateString()}</td>
                      <td>{h.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
