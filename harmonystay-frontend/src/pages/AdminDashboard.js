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
  FaExclamationCircle,
  FaCalendarAlt,
  FaSwimmingPool,
  FaFileAlt,
  FaUserFriends,
  FaChartBar,
  FaSearch,
  FaMoon,
  FaSun,
  FaCalculator,
} from "react-icons/fa";

import AdminMembers from "./AdminMembers";
import CreateFlat from "./CreateFlat";
import AdminBills from "./AdminBills";
import AdminNotices from "./AdminNotices";
import AssignMonthlyBill from "./AssignMonthlyBill";
import AdminParking from "./AdminParking";
import AdminComplaints from "./AdminComplaints";
import AdminMeetings from "./AdminMeetings";
import AdminFacilities from "./AdminFacilities";
import AdminDocuments from "./AdminDocuments";
import AdminVisitors from "./AdminVisitors";
import AdminReports from "./AdminReports";
import AdminDashboardHome from "./AdminDashboardHome";
import AdminAccountants from "./AdminAccountants";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [searchQ, setSearchQ] = useState("");
  const [darkUi, setDarkUi] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="admin-loading-screen">Loading…</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaHome },
    { id: "members", label: "Members", icon: FaUsers },
    { id: "accountants", label: "Accountants", icon: FaCalculator },
    { id: "flats", label: "Flats", icon: FaWrench },
    { id: "maintenance", label: "Maintenance", icon: FaFileInvoiceDollar },
    { id: "assignbills", label: "Assign bills", icon: FaFileInvoiceDollar },
    { id: "parking", label: "Parking", icon: FaCar },
    { id: "complaints", label: "Complaints", icon: FaExclamationCircle },
    { id: "meetings", label: "Meetings", icon: FaCalendarAlt },
    { id: "facilities", label: "Facilities", icon: FaSwimmingPool },
    { id: "documents", label: "Documents", icon: FaFileAlt },
    { id: "visitors", label: "Visitors", icon: FaUserFriends },
    { id: "reports", label: "Reports", icon: FaChartBar },
    { id: "notice", label: "Notices", icon: FaBell },
    { id: "profile", label: "Profile", icon: FaUserCircle },
  ];

  const filteredMenu = menuItems.filter(
    (m) =>
      !searchQ.trim() ||
      m.label.toLowerCase().includes(searchQ.trim().toLowerCase())
  );

  return (
    <div
      className={`admin-dashboard admin-dashboard--modern${darkUi ? " admin-dashboard--dark" : ""}`}
    >
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">HS</span>
          <div>
            <strong>HarmonyStay</strong>
            <small>Society admin</small>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <ul>
            {filteredMenu.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  className={activeMenu === id ? "is-active" : ""}
                  onClick={() => setActiveMenu(id)}
                >
                  <Icon aria-hidden />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-topbar__search">
            <FaSearch aria-hidden />
            <input
              type="search"
              placeholder="Search menu…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              aria-label="Search navigation"
            />
          </div>
          <div className="admin-topbar__actions">
            <button
              type="button"
              className="admin-topbar__icon"
              title={darkUi ? "Light mode" : "Dark mode"}
              onClick={() => setDarkUi(!darkUi)}
            >
              {darkUi ? <FaSun /> : <FaMoon />}
            </button>
            <span className="admin-topbar__bell" title="Notifications">
              <FaBell />
            </span>
            <div className="admin-topbar__user">
              <FaUserCircle size={36} />
              <div>
                <strong>{user.firstName || "Admin"}</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main-scroll">
          {activeMenu === "dashboard" && (
            <AdminDashboardHome user={user} onNavigate={setActiveMenu} />
          )}
          {activeMenu === "members" && <AdminMembers />}
          {activeMenu === "accountants" && <AdminAccountants />}
          {activeMenu === "flats" && <CreateFlat />}
          {activeMenu === "maintenance" && <AdminBills />}
          {activeMenu === "assignbills" && <AssignMonthlyBill />}
          {activeMenu === "parking" && <AdminParking />}
          {activeMenu === "complaints" && <AdminComplaints />}
          {activeMenu === "meetings" && <AdminMeetings />}
          {activeMenu === "facilities" && <AdminFacilities />}
          {activeMenu === "documents" && <AdminDocuments />}
          {activeMenu === "visitors" && <AdminVisitors />}
          {activeMenu === "reports" && <AdminReports />}
          {activeMenu === "notice" && <AdminNotices />}
          {activeMenu === "profile" && (
            <div className="admin-profile-card">
              <FaUserCircle size={80} className="admin-profile-card__avatar" />
              <h3>{user.firstName}</h3>
              <p>
                <strong>Email:</strong> {user.email || "—"}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
