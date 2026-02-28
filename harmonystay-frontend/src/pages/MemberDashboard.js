import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MemberProfile from "./MemberProfile";
import MemberBills from "./MemberBills";
import MemberParking from "./MemberParking";
import { FaUserCircle, FaSignOutAlt, FaHome, FaBell, FaCar, FaWrench } from "react-icons/fa";
import "./MemberDashboard.css";

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "member") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch("http://localhost:8888/api/notices");
        const data = await res.json();
        setNotices(data);
      } catch (err) {
        console.error("Error fetching notices:", err);
      }
    };
    fetchNotices();
  }, []);

  if (!user) return <div className="text-center p-6 text-gray-500">Loading...</div>;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="member-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HarmonyStay</h2>
        </div>

        <ul className="menu-list">
          <li className={activeMenu === "dashboard" ? "active" : ""} onClick={() => setActiveMenu("dashboard")}>
            <FaHome /> Dashboard
          </li>
          <li className={activeMenu === "maintenance" ? "active" : ""} onClick={() => setActiveMenu("maintenance")}>
            <FaWrench /> Maintenance
          </li>
          <li className={activeMenu === "parking" ? "active" : ""} onClick={() => setActiveMenu("parking")}>
            <FaCar /> Parking
          </li>
          <li className={activeMenu === "notice" ? "active" : ""} onClick={() => setActiveMenu("notice")}>
            <FaBell /> Notices
          </li>
          <li className={activeMenu === "profile" ? "active" : ""} onClick={() => setActiveMenu("profile")}>
            <FaUserCircle /> Profile
          </li>
        </ul>

        <button className="logout-btn-sidebar" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Right content */}
      <div className="main-panel">
        {activeMenu === "dashboard" && (
          <div className="dashboard-card">
            <h2>Welcome, {user.firstName || "Member"} 👋</h2>
            <p>Here’s an overview of your HarmonyStay account.</p>
          </div>
        )}

        {activeMenu === "maintenance" && (
          <div className="dashboard-card">
            <MemberBills />
          </div>
        )}

        {activeMenu === "parking" && (
          <div className="dashboard-card">
            <MemberParking />
          </div>
        )}

        {activeMenu === "notice" && (
          <div className="dashboard-card">
            <h2>Community Notices</h2>
            {notices.length === 0 ? (
              <p>No notices available.</p>
            ) : (
              [...notices]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((notice) => (
                  <div key={notice.id} className="notice-item">
                    <h4>{notice.title}</h4>
                    <p>{notice.description}</p>
                    <small>{new Date(notice.date).toLocaleString()}</small>
                  </div>
                ))
            )}
          </div>
        )}

        {activeMenu === "profile" && (
          <div className="profile-card">
<MemberProfile user={user} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
