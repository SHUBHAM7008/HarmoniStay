import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaFileInvoiceDollar,
  FaBell,
  FaWrench,
  FaCar,
} from "react-icons/fa";

import AdminMembers from "./AdminMembers";
import CreateFlat from "./CreateFlat";
import AdminBills from "./AdminBills";
import AdminNotices from "./AdminNotices";
import AssignMonthlyBill from "./AssignMonthlyBill";
import AdminParking from "./AdminParking";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="text-center p-6 text-gray-500">Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      {/* ✅ Sidebar - Left side */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HarmonyStay</h2>
        </div>

        <ul className="menu-list">
          <li
            className={activeMenu === "dashboard" ? "active" : ""}
            onClick={() => setActiveMenu("dashboard")}
          >
            <FaHome /> Dashboard
          </li>
          <li
            className={activeMenu === "members" ? "active" : ""}
            onClick={() => setActiveMenu("members")}
          >
            <FaUsers /> Members
          </li>
          <li
            className={activeMenu === "flats" ? "active" : ""}
            onClick={() => setActiveMenu("flats")}
          >
            <FaWrench /> Flats
          </li>
          <li
            className={activeMenu === "maintenance" ? "active" : ""}
            onClick={() => setActiveMenu("maintenance")}
          >
            <FaFileInvoiceDollar /> Maintenance
          </li>
          <li
            className={activeMenu === "parking" ? "active" : ""}
            onClick={() => setActiveMenu("parking")}
          >
            <FaCar /> Parking
          </li>
          <li
            className={activeMenu === "notice" ? "active" : ""}
            onClick={() => setActiveMenu("notice")}
          >
            <FaBell /> Notices
          </li>
          <li
            className={activeMenu === "profile" ? "active" : ""}
            onClick={() => setActiveMenu("profile")}
          >
            <FaUserCircle /> Profile
          </li>
        </ul>

        <button className="logout-btn-sidebar" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* ✅ Right Side Content Area */}
      <div className="main-panel">
        {activeMenu === "dashboard" && (
          <div className="dashboard-welcome">
            <h2>Welcome, {user.firstName || "Admin"} 👋</h2>
            <p>Manage your HarmonyStay society operations efficiently.</p>
          </div>
        )}

        {activeMenu === "members" && <AdminMembers />}
        {activeMenu === "flats" && <CreateFlat />}
        {activeMenu === "maintenance" && <AdminBills />}
        {activeMenu === "parking" && <AdminParking />}
        {activeMenu === "notice" && <AdminNotices />}

        {activeMenu === "profile" && (
          <div className="profile-card-simple">
            <FaUserCircle size={80} className="profile-avatar" />
            <h3>{user.firstName}</h3>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
