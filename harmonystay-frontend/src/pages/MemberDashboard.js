import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBell,
  FaCalendarAlt,
  FaCar,
  FaExclamationCircle,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaHome,
  FaSignOutAlt,
  FaSwimmingPool,
  FaUserCircle,
  FaWrench,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import MemberBills from "./MemberBills";
import MemberComplaints from "./MemberComplaints";
import MemberDocuments from "./MemberDocuments";
import MemberFacilities from "./MemberFacilities";
import MemberMeetings from "./MemberMeetings";
import MemberParking from "./MemberParking";
import MemberProfile from "./MemberProfile";
import "./MemberDashboard.css";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: FaHome },
  { id: "maintenance", label: "Maintenance", icon: FaWrench },
  { id: "parking", label: "Parking", icon: FaCar },
  { id: "complaints", label: "Complaints", icon: FaExclamationCircle },
  { id: "meetings", label: "Meetings", icon: FaCalendarAlt },
  { id: "facilities", label: "Facilities", icon: FaSwimmingPool },
  { id: "documents", label: "Documents", icon: FaFileAlt },
  { id: "notice", label: "Notices", icon: FaBell },
  { id: "profile", label: "Profile", icon: FaUserCircle },
];

const sectionDescriptions = {
  dashboard: "A resident overview of payments, community updates, and frequently used actions.",
  maintenance: "Review maintenance bills, download statements, and complete pending payments.",
  parking: "Track your parking slot details and related activity.",
  complaints: "Follow complaint status and keep service requests visible.",
  meetings: "Stay prepared for society meetings and upcoming discussions.",
  facilities: "Review amenity access, reservations, and shared spaces.",
  documents: "Access the documents made available for residents.",
  notice: "Read the latest community notices in one clean timeline.",
  profile: "Review your resident profile, flat details, and account security.",
};

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [bills, setBills] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [workbenchView, setWorkbenchView] = useState("dues");
  const [noticeQuery, setNoticeQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "member") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadOverview = async () => {
      if (!user?.id) {
        return;
      }

      setOverviewLoading(true);

      try {
        const [noticeResponse, billsResponse] = await Promise.all([
          axios.get("http://localhost:8888/api/notices").catch(() => ({ data: [] })),
          axios.get(`http://localhost:8888/api/bills/user/${user.id}`).catch(() => ({
            data: [],
          })),
        ]);

        if (cancelled) {
          return;
        }

        setNotices(Array.isArray(noticeResponse.data) ? noticeResponse.data : []);
        setBills(Array.isArray(billsResponse.data) ? billsResponse.data : []);
      } catch (error) {
        console.error("Error loading resident overview:", error);
      } finally {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return <div className="member-loading-screen">Loading dashboard...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const activeSection =
    menuItems.find((item) => item.id === activeMenu) || menuItems[0];

  const sortedNotices = [...notices].sort(
    (left, right) => new Date(right.date || 0) - new Date(left.date || 0)
  );

  const latestNotices = sortedNotices.slice(0, 3);

  const pendingBills = bills.filter(
    (bill) => String(bill.status || "").toUpperCase() !== "PAID"
  );

  const totalDue = pendingBills.reduce(
    (sum, bill) => sum + (Number(bill.amount) || 0),
    0
  );

  const dueSoonBills = [...pendingBills]
    .sort((left, right) => new Date(left.dueDate || 0) - new Date(right.dueDate || 0))
    .slice(0, 5);

  const nextDueBill = dueSoonBills[0];
  const paidBillCount = bills.filter(
    (bill) => String(bill.status || "").toUpperCase() === "PAID"
  ).length;

  const filteredWorkbenchNotices = sortedNotices.filter((notice) =>
    `${notice.title} ${notice.description}`.toLowerCase().includes(noticeQuery.trim().toLowerCase())
  );

  return (
    <div className="member-dashboard member-dashboard--modern">
      <aside className="member-shell__sidebar">
        <div className="member-shell__brand">
          <span className="member-shell__logo">HS</span>
          <div>
            <strong>HarmonyStay</strong>
            <small>Resident workspace</small>
          </div>
        </div>

        <div className="member-shell__resident-card">
          <FaUserCircle className="member-shell__resident-avatar" aria-hidden />
          <div>
            <strong>{user.firstName || "Resident"}</strong>
            <small>{user.flatId ? `Flat ${user.flatId}` : "Flat not assigned"}</small>
          </div>
        </div>

        <nav className="member-shell__nav">
          <ul>
            {menuItems.map(({ id, label, icon: Icon }) => (
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

        <button type="button" className="member-shell__logout" onClick={handleLogout}>
          <FaSignOutAlt aria-hidden />
          Logout
        </button>
      </aside>

      <div className="member-shell">
        <header className="member-shell__topbar">
          <div className="member-shell__heading">
            <p className="member-shell__eyebrow">Resident portal</p>
            <h1>{activeSection.label}</h1>
            <p>{sectionDescriptions[activeMenu]}</p>
          </div>

          <div className="member-shell__quickstats">
            <article>
              <span>Pending dues</span>
              <strong>{formatINR(totalDue)}</strong>
            </article>
            <article>
              <span>New notices</span>
              <strong>{latestNotices.length}</strong>
            </article>
          </div>
        </header>

        <main className="member-shell__main">
          {activeMenu === "dashboard" && (
            <div className="member-overview">
              <section className="member-hero-card">
                <div>
                  <p className="member-hero-card__eyebrow">Resident summary</p>
                  <h2>Everything important about your home account, in one glance.</h2>
                  <p>
                    Review outstanding dues, catch up on community notices, and jump directly
                    into the tasks you use most often.
                  </p>
                </div>

                <div className="member-hero-card__actions">
                  <button type="button" onClick={() => setActiveMenu("maintenance")}>
                    <FaFileInvoiceDollar aria-hidden />
                    Open bills
                  </button>
                  <button type="button" onClick={() => setActiveMenu("notice")}>
                    <FaBell aria-hidden />
                    View notices
                  </button>
                  <button type="button" onClick={() => setActiveMenu("profile")}>
                    <FaUserCircle aria-hidden />
                    My profile
                  </button>
                </div>
              </section>

              <section className="member-stats-grid">
                <article className="member-stat-card">
                  <span>Pending bills</span>
                  <strong>{pendingBills.length}</strong>
                  <small>Bills that still need your attention.</small>
                </article>
                <article className="member-stat-card member-stat-card--accent">
                  <span>Total due</span>
                  <strong>{formatINR(totalDue)}</strong>
                  <small>Outstanding amount across unpaid maintenance.</small>
                </article>
                <article className="member-stat-card member-stat-card--soft">
                  <span>Latest due date</span>
                  <strong>
                    {nextDueBill?.dueDate
                      ? new Date(nextDueBill.dueDate).toLocaleDateString("en-IN")
                      : "No due bills"}
                  </strong>
                  <small>Nearest payment deadline currently visible.</small>
                </article>
              </section>

              <section className="member-content-grid">
                <article className="member-panel">
                  <div className="member-panel__header">
                    <div>
                      <p className="member-panel__eyebrow">Community updates</p>
                      <h3>Latest notices</h3>
                    </div>
                    <button type="button" onClick={() => setActiveMenu("notice")}>
                      See all notices
                    </button>
                  </div>

                  {overviewLoading ? (
                    <p className="member-panel__empty">Loading your community updates...</p>
                  ) : latestNotices.length === 0 ? (
                    <p className="member-panel__empty">No notices are available right now.</p>
                  ) : (
                    <ul className="member-notice-list">
                      {latestNotices.map((notice) => (
                        <li key={notice.id}>
                          <strong>{notice.title}</strong>
                          <p>{notice.description}</p>
                          <span>
                            {notice.date
                              ? new Date(notice.date).toLocaleDateString("en-IN")
                              : "Date unavailable"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>

                <article className="member-panel">
                  <div className="member-panel__header">
                    <div>
                      <p className="member-panel__eyebrow">Account health</p>
                      <h3>What to do next</h3>
                    </div>
                  </div>

                  <ul className="member-checklist">
                    <li>
                      <strong>
                        {pendingBills.length > 0 ? "Review pending dues" : "Bills are up to date"}
                      </strong>
                      <span>
                        {pendingBills.length > 0
                          ? `${pendingBills.length} maintenance item(s) still need payment.`
                          : "No outstanding maintenance bill is visible right now."}
                      </span>
                    </li>
                    <li>
                      <strong>Stay current on notices</strong>
                      <span>
                        {latestNotices.length > 0
                          ? `${latestNotices.length} recent notice(s) are waiting in your feed.`
                          : "The notice board is currently quiet."}
                      </span>
                    </li>
                    <li>
                      <strong>Keep profile details accurate</strong>
                      <span>
                        Review your flat information and security settings in the profile section.
                      </span>
                    </li>
                  </ul>
                </article>
              </section>

              <section className="member-workbench">
                <article className="member-panel member-panel--workbench">
                  <div className="member-workbench__top">
                    <div>
                      <p className="member-panel__eyebrow">Resident workbench</p>
                      <h3>Quick tools</h3>
                    </div>
                    <div className="member-workbench__tabs">
                      <button
                        type="button"
                        className={workbenchView === "dues" ? "is-active" : ""}
                        onClick={() => setWorkbenchView("dues")}
                      >
                        Due tracker
                      </button>
                      <button
                        type="button"
                        className={workbenchView === "notices" ? "is-active" : ""}
                        onClick={() => setWorkbenchView("notices")}
                      >
                        Notice search
                      </button>
                    </div>
                  </div>

                  {workbenchView === "dues" ? (
                    <>
                      <div className="member-workbench__summary">
                        <article>
                          <span>Pending items</span>
                          <strong>{pendingBills.length}</strong>
                        </article>
                        <article>
                          <span>Amount due</span>
                          <strong>{formatINR(totalDue)}</strong>
                        </article>
                        <article>
                          <span>Paid history</span>
                          <strong>{paidBillCount}</strong>
                        </article>
                      </div>

                      {dueSoonBills.length === 0 ? (
                        <p className="member-panel__empty">
                          No unpaid bills are visible right now.
                        </p>
                      ) : (
                        <ul className="member-task-list">
                          {dueSoonBills.map((bill) => (
                            <li key={bill.id || bill._id}>
                              <div>
                                <strong>{bill.billMonth || "Billing period unavailable"}</strong>
                                <span>
                                  Due{" "}
                                  {bill.dueDate
                                    ? new Date(bill.dueDate).toLocaleDateString("en-IN")
                                    : "not scheduled"}
                                </span>
                              </div>
                              <em>{formatINR(bill.amount)}</em>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        type="button"
                        className="member-workbench__cta"
                        onClick={() => setActiveMenu("maintenance")}
                      >
                        Open maintenance bills
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="member-workbench__search">
                        <input
                          type="search"
                          value={noticeQuery}
                          onChange={(event) => setNoticeQuery(event.target.value)}
                          placeholder="Search notices by title or description"
                        />
                      </div>

                      {filteredWorkbenchNotices.length === 0 ? (
                        <p className="member-panel__empty">
                          No notices matched your search.
                        </p>
                      ) : (
                        <ul className="member-notice-list member-notice-list--workbench">
                          {filteredWorkbenchNotices.slice(0, 5).map((notice) => (
                            <li key={notice.id}>
                              <strong>{notice.title}</strong>
                              <p>{notice.description}</p>
                              <span>
                                {notice.date
                                  ? new Date(notice.date).toLocaleDateString("en-IN")
                                  : "Date unavailable"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        type="button"
                        className="member-workbench__cta"
                        onClick={() => setActiveMenu("notice")}
                      >
                        Open full notice board
                      </button>
                    </>
                  )}
                </article>
              </section>
            </div>
          )}

          {activeMenu === "maintenance" && <MemberBills />}
          {activeMenu === "parking" && <MemberParking />}
          {activeMenu === "complaints" && <MemberComplaints />}
          {activeMenu === "meetings" && <MemberMeetings />}
          {activeMenu === "facilities" && <MemberFacilities />}
          {activeMenu === "documents" && <MemberDocuments />}

          {activeMenu === "notice" && (
            <section className="member-panel member-panel--full">
              <div className="member-panel__header">
                <div>
                  <p className="member-panel__eyebrow">Notice board</p>
                  <h3>Community notices</h3>
                </div>
              </div>

              {latestNotices.length === 0 ? (
                <p className="member-panel__empty">No notices are available at the moment.</p>
              ) : (
                <ul className="member-notice-list member-notice-list--full">
                  {sortedNotices.map((notice) => (
                    <li key={notice.id}>
                      <strong>{notice.title}</strong>
                      <p>{notice.description}</p>
                      <span>
                        {notice.date
                          ? new Date(notice.date).toLocaleString("en-IN")
                          : "Date unavailable"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeMenu === "profile" && <MemberProfile user={user} />}
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;
