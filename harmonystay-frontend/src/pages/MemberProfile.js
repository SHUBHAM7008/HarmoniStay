import React, { useEffect, useState } from "react";
import { FaHistory, FaHome, FaUserCircle } from "react-icons/fa";
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
      if (!user?.flatId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8888/api/flats/${user.flatId}`);
        setFlat(response.data);
      } catch (error) {
        console.error("Error fetching flat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlat();
  }, [user]);

  const sendOtp = async () => {
    try {
      await axios.post(`http://localhost:8888/api/members/send-otp/${user.id}`);
      setOtpSent(true);
      setMessage("OTP sent to your registered phone.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send OTP.");
    }
  };

  const changePassword = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8888/api/members/change-password/${user.id}`,
        {
          otp,
          newPassword,
        }
      );

      setMessage(response.data);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to change password.");
    }
  };

  if (!user) {
    return <div className="profile-loading">Loading member profile...</div>;
  }

  return (
    <div className="member-profile">
      <div className="profile-header">
        <div className="profile-header__avatar-wrap">
          <FaUserCircle className="profile-avatar" size={96} />
        </div>
        <div>
          <p className="profile-header__eyebrow">Resident profile</p>
          <h2>
            {user.firstName} {user.lastName || ""}
          </h2>
          <p className="profile-role">{String(user.role || "member").toUpperCase()}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Personal details</h3>
        <div className="profile-grid">
          <p>
            <strong>Email</strong>
            <span>{user.email || "Not available"}</span>
          </p>
          <p>
            <strong>Phone</strong>
            <span>{user.phone || "Not available"}</span>
          </p>
          <p>
            <strong>Join date</strong>
            <span>{user.dateOfJoining || "Not available"}</span>
          </p>
          <p>
            <strong>Status</strong>
            <span>{user.status || "Active"}</span>
          </p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Change password</h3>
        {!otpSent && (
          <button type="button" onClick={sendOtp}>
            Send OTP
          </button>
        )}

        {otpSent && (
          <div className="change-password-form">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <button type="button" onClick={changePassword}>
              Update password
            </button>
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </div>

      {!loading && flat && (
        <div className="profile-section">
          <h3>
            <FaHome aria-hidden />
            Flat details
          </h3>
          <div className="profile-grid">
            <p>
              <strong>Flat number</strong>
              <span>{flat.flatNumber || "Not available"}</span>
            </p>
            <p>
              <strong>Wing</strong>
              <span>{flat.wing || "Not available"}</span>
            </p>
            <p>
              <strong>Floor</strong>
              <span>{flat.floor || "Not available"}</span>
            </p>
            <p>
              <strong>Area</strong>
              <span>{flat.area ? `${flat.area} sqft` : "Not available"}</span>
            </p>
            <p>
              <strong>Type</strong>
              <span>{flat.type || "Not available"}</span>
            </p>
            <p>
              <strong>Status</strong>
              <span>{flat.status || "Not available"}</span>
            </p>
          </div>

          {flat.owner && (
            <div className="sub-section">
              <h4>Owner</h4>
              <p>
                {flat.owner.firstName} {flat.owner.lastName}
              </p>
              <p>{flat.owner.email}</p>
            </div>
          )}

          {flat.tenant && (
            <div className="sub-section">
              <h4>Tenant</h4>
              <p>
                {flat.tenant.firstName} {flat.tenant.lastName}
              </p>
              <p>{flat.tenant.email}</p>
            </div>
          )}

          {flat.ownershipHistory?.length > 0 && (
            <div className="sub-section">
              <h4>
                <FaHistory aria-hidden />
                Ownership history
              </h4>
              <table className="ownership-table">
                <thead>
                  <tr>
                    <th>Previous owner</th>
                    <th>New owner</th>
                    <th>Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {flat.ownershipHistory.map((history, index) => (
                    <tr key={`${history.transferDate}-${index}`}>
                      <td>{history.previousOwnerId}</td>
                      <td>{history.newOwnerId}</td>
                      <td>
                        {history.transferDate
                          ? new Date(history.transferDate).toLocaleDateString("en-IN")
                          : "Not available"}
                      </td>
                      <td>{history.remarks || "Not available"}</td>
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
