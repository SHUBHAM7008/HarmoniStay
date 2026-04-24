import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCalendarAlt,
  FaCalculator,
  FaCar,
  FaChartBar,
  FaExclamationCircle,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaHome,
  FaMoon,
  FaSearch,
  FaSignOutAlt,
  FaSun,
  FaSwimmingPool,
  FaUserCircle,
  FaUserFriends,
  FaUsers,
  FaWrench,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import AdminAccountants from "./AdminAccountants";
import AdminBills from "./AdminBills";
import AdminComplaints from "./AdminComplaints";
import AdminDashboardHome from "./AdminDashboardHome";
import AdminDocuments from "./AdminDocuments";
import AdminFacilities from "./AdminFacilities";
import AdminMeetings from "./AdminMeetings";
import AdminMembers from "./AdminMembers";
import AdminNotices from "./AdminNotices";
import AdminParking from "./AdminParking";
import AdminReports from "./AdminReports";
import AdminVisitors from "./AdminVisitors";
import AssignMonthlyBill from "./AssignMonthlyBill";
import CreateFlat from "./CreateFlat";
import "./AdminDashboard.css";

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

const sectionDescriptions = {
  dashboard: "Monitor collections, complaints, notices, and daily society activity from one command center.",
  members: "Review resident records, check occupancy, and keep member data organized.",
  accountants: "Coordinate financial ownership and access for your accounting team.",
  flats: "Set up or review flat inventory, availability, and occupancy details.",
  maintenance: "Track billing performance, payment progress, and overdue maintenance.",
  assignbills: "Create and distribute new maintenance bills with less operational friction.",
  parking: "Manage parking slots, assignments, and availability across the property.",
  complaints: "Review resident issues and keep service requests moving.",
  meetings: "Plan meeting schedules and keep the community aligned.",
  facilities: "Manage facility usage, bookings, and shared amenities.",
  documents: "Organize official society documents in one secure place.",
  visitors: "Keep a clear record of visitor movement and entry activity.",
  reports: "Review performance and payment data to support timely decisions.",
  notice: "Publish and manage notices with a clean, visible communication flow.",
  profile: "Review administrator account details and sign out when needed.",
};

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
    return <div className="admin-loading-screen">Loading dashboard...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredMenu = menuItems.filter(
    (item) =>
      !searchQ.trim() || item.label.toLowerCase().includes(searchQ.trim().toLowerCase())
  );

  const activeSection =
    menuItems.find((item) => item.id === activeMenu) || menuItems[0];

  return (
    <div
      className={`admin-dashboard admin-dashboard--modern${
        darkUi ? " admin-dashboard--dark" : ""
      }`}
    >
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">HS</span>
          <div>
            <strong>HarmonyStay</strong>
            <small>Society operations</small>
          </div>
        </div>

        <div className="admin-sidebar__profile">
          <FaUserCircle className="admin-sidebar__avatar" aria-hidden />
          <div>
            <strong>{user.firstName || "Admin"}</strong>
            <small>Administrator workspace</small>
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

        <div className="admin-sidebar__footer">
          <p>Live control across members, maintenance, notices, and facilities.</p>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            <FaSignOutAlt aria-hidden />
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-topbar__heading">
            <p className="admin-topbar__eyebrow">Admin workspace</p>
            <h1>{activeSection.label}</h1>
            <p>{sectionDescriptions[activeMenu]}</p>
          </div>

          <div className="admin-topbar__utility">
            <label className="admin-topbar__search">
              <FaSearch aria-hidden />
              <input
                type="search"
                placeholder="Search navigation"
                value={searchQ}
                onChange={(event) => setSearchQ(event.target.value)}
                aria-label="Search navigation"
              />
            </label>

            <div className="admin-topbar__actions">
              <button
                type="button"
                className="admin-topbar__icon"
                title={darkUi ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setDarkUi((value) => !value)}
              >
                {darkUi ? <FaSun aria-hidden /> : <FaMoon aria-hidden />}
              </button>
              <span className="admin-topbar__bell" title="Notifications">
                <FaBell aria-hidden />
              </span>
              <div className="admin-topbar__user">
                <strong>{user.email || "admin@harmonystay.local"}</strong>
                <small>{filteredMenu.length} visible sections</small>
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
              <FaUserCircle size={88} className="admin-profile-card__avatar" />
              <h3>{user.firstName || "Admin"}</h3>
              <p>
                <strong>Email</strong>
                <span>{user.email || "Not available"}</span>
              </p>
              <p>
                <strong>Role</strong>
                <span>{user.role}</span>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
