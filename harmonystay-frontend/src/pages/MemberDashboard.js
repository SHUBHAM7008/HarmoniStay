import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MemberProfile from "./MemberProfile";
import MemberBills from "./MemberBills";
import MemberParking from "./MemberParking";
import MemberComplaints from "./MemberComplaints";
import MemberMeetings from "./MemberMeetings";
import MemberFacilities from "./MemberFacilities";
import MemberDocuments from "./MemberDocuments";
import { FaBolt, FaFileInvoiceDollar, FaShieldAlt, FaTools, FaThLarge } from "react-icons/fa";
import { FaUserCircle, FaSignOutAlt, FaHome, FaBell, FaCar, FaWrench, FaExclamationCircle, FaCalendarAlt, FaSwimmingPool, FaFileAlt } from "react-icons/fa";
import "./MemberDashboard.css";

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [pendingVisitorRequest, setPendingVisitorRequest] = useState(null);
  const [responding, setResponding] = useState(false);
  const navigate = useNavigate();

  const getCategoryIcon = (value) => {
    const key = String(value || "").toLowerCase();
    if (key === "plumbing") return <FaTools />;
    if (key === "electrical") return <FaBolt />;
    if (key === "security") return <FaShieldAlt />;
    if (key === "billing") return <FaFileInvoiceDollar />;
    return <FaThLarge />;
  };

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

  useEffect(() => {
    if (!user?.id || user.role !== "member") return undefined;

    const fetchPendingRequests = async () => {
      try {
        const res = await fetch(`http://localhost:8888/api/visitor-requests/member/${user.id}/pending`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPendingVisitorRequest(data[0]);
        } else {
          setPendingVisitorRequest(null);
        }
      } catch (err) {
        console.error("Error fetching visitor requests:", err);
      }
    };

    fetchPendingRequests();
    const intervalId = setInterval(fetchPendingRequests, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  const respondVisitorRequest = async (status) => {
    if (!pendingVisitorRequest || !user?.id) return;
    setResponding(true);
    try {
      await fetch(
        `http://localhost:8888/api/visitor-requests/${pendingVisitorRequest.id}/respond?memberId=${user.id}&status=${status}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseNote: status === "ACCEPTED" ? "Allowed" : "Not allowed" }),
        }
      );
      setPendingVisitorRequest(null);
    } catch (err) {
      console.error("Failed responding request:", err);
    } finally {
      setResponding(false);
    }
  };

  if (!user) return <div className="text-center p-6 text-gray-500">Loading...</div>;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="member-dashboard">
      {pendingVisitorRequest && (
        <div className="visitor-modal-overlay">
          <div className="visitor-modal" role="dialog" aria-modal="true">
            <h3>Visitor Request</h3>
            <p><strong>Member:</strong> {pendingVisitorRequest.memberName}</p>
            <p><strong>Purpose:</strong> {pendingVisitorRequest.purpose}</p>
            <div className="visitor-category">
              {getCategoryIcon(pendingVisitorRequest.category)}
              <span>{pendingVisitorRequest.category || "etc"}</span>
            </div>
            <div className="visitor-modal-actions">
              <button
                disabled={responding}
                className="accept-btn"
                onClick={() => respondVisitorRequest("ACCEPTED")}
              >
                Accept
              </button>
              <button
                disabled={responding}
                className="reject-btn"
                onClick={() => respondVisitorRequest("REJECTED")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
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
          <li className={activeMenu === "complaints" ? "active" : ""} onClick={() => setActiveMenu("complaints")}>
            <FaExclamationCircle /> Complaints
          </li>
          <li className={activeMenu === "meetings" ? "active" : ""} onClick={() => setActiveMenu("meetings")}>
            <FaCalendarAlt /> Meetings
          </li>
          <li className={activeMenu === "facilities" ? "active" : ""} onClick={() => setActiveMenu("facilities")}>
            <FaSwimmingPool /> Facilities
          </li>
          <li className={activeMenu === "documents" ? "active" : ""} onClick={() => setActiveMenu("documents")}>
            <FaFileAlt /> Documents
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

        {activeMenu === "complaints" && (
          <div className="dashboard-card">
            <MemberComplaints />
          </div>
        )}

        {activeMenu === "meetings" && (
          <div className="dashboard-card">
            <MemberMeetings />
          </div>
        )}

        {activeMenu === "facilities" && (
          <div className="dashboard-card">
            <MemberFacilities />
          </div>
        )}

        {activeMenu === "documents" && (
          <div className="dashboard-card">
            <MemberDocuments />
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
