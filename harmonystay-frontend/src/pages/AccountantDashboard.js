import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBell,
  FaBars,
  FaChartBar,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaPaperPlane,
  FaSignOutAlt,
} from "react-icons/fa";
import "./AccountantDashboard.css";

const AccountantDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("bills");
  const [summary, setSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [members, setMembers] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [message, setMessage] = useState("");
  const [sendingId, setSendingId] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [sumRes, billsRes, monthlyRes, membersRes] = await Promise.all([
        axios.get("http://localhost:8888/api/reports/maintenance-summary"),
        axios.get("http://localhost:8888/api/bills"),
        axios.get("http://localhost:8888/api/reports/monthly-collection"),
        axios.get("http://localhost:8888/api/members"),
      ]);

      const sortedBills = [...(Array.isArray(billsRes.data) ? billsRes.data : [])].sort((a, b) => {
        return new Date(b.billMonth || b.createdDate || 0) - new Date(a.billMonth || a.createdDate || 0);
      });

      setSummary(sumRes.data);
      setBills(sortedBills);
      setMonthlyData(monthlyRes.data);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch (err) {
      console.error(err);
      setMessage("Unable to load accountant dashboard data.");
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "accountant") {
      navigate("/");
      return;
    }
    loadData();
  }, [loadData, navigate, user]);

  const unpaidBills = useMemo(() => {
    return bills.filter((bill) => (bill.status || "").toUpperCase() !== "PAID");
  }, [bills]);

  const chartRows = useMemo(() => {
    if (!monthlyData) return [];

    const rows = Object.entries(monthlyData).map(([month, items]) => {
      const monthBills = Array.isArray(items) ? items : [];
      const collected = monthBills
        .filter((bill) => (bill.status || "").toUpperCase() === "PAID")
        .reduce((total, bill) => total + Number(bill.amount || 0), 0);
      const dues = monthBills
        .filter((bill) => (bill.status || "").toUpperCase() !== "PAID")
        .reduce((total, bill) => total + Number(bill.amount || 0), 0);

      return { month, collected, dues };
    });

    const maxAmount = Math.max(...rows.map((row) => row.collected + row.dues), 1);
    return rows.slice(-6).map((row) => ({
      ...row,
      collectedHeight: Math.round((row.collected / maxAmount) * 100),
      duesHeight: Math.round((row.dues / maxAmount) * 100),
    }));
  }, [monthlyData]);

  const paidPercent = useMemo(() => {
    if (!summary?.totalBills) return 0;
    return Math.round((Number(summary.paidCount || 0) / Number(summary.totalBills || 1)) * 100);
  }, [summary]);

  const getMemberForBill = useCallback((bill) => {
    return members.find((member) => {
      return member.id === bill.userId
        || member._id === bill.userId
        || member.email === bill.userEmail
        || member.flatId === bill.flatId
        || member.flat === bill.flatNumber;
    });
  }, [members]);

  const buildReminderMessage = (bill, member) => {
    const name = [member?.firstName, member?.lastName].filter(Boolean).join(" ") || member?.name || "Member";
    return `Hi ${name}, your HarmonyStay maintenance bill for ${bill.billMonth || "this month"} of Rs. ${Number(bill.amount || 0).toFixed(2)} is pending. Please pay it soon.`;
  };

  const sendNotification = useCallback(async (bill) => {
    const member = getMemberForBill(bill);
    const phone = member?.phone;

    if (!phone) {
      setMessage(`No phone number found for flat ${bill.flatNumber || "N/A"}.`);
      return false;
    }

    setSendingId(bill.id || bill._id);
    try {
      await axios.post("http://localhost:8888/api/notices/notify", {
        phone,
        message: buildReminderMessage(bill, member),
      });
      setMessage(`Reminder sent to flat ${bill.flatNumber || "member"}.`);
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      setMessage(`Failed to send reminder for flat ${bill.flatNumber || "N/A"}.`);
      return false;
    } finally {
      setSendingId(null);
    }
  }, [getMemberForBill]);

  const sendAllNotifications = async () => {
    if (unpaidBills.length === 0) {
      setMessage("All bills are paid. No reminders to send.");
      return;
    }

    setSendingAll(true);
    const results = await Promise.allSettled(unpaidBills.map((bill) => sendNotification(bill)));
    const sent = results.filter((result) => result.status === "fulfilled" && result.value).length;
    setMessage(`Sent ${sent} of ${unpaidBills.length} unpaid bill reminders.`);
    setSendingAll(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className={`accountant-dashboard${sidebarCollapsed ? " accountant-dashboard--sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">HS</span>
          <div className="sidebar-brand-text">
            <h2>HarmonyStay</h2>
            <p className="role">Accountant</p>
          </div>
          <button
            type="button"
            className="menu-toggle-btn sidebar-toggle-btn"
            title={sidebarCollapsed ? "Open menu" : "Close menu"}
            aria-label={sidebarCollapsed ? "Open menu" : "Close menu"}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
          >
            <FaBars />
          </button>
        </div>
        <ul className="menu-list">
          <li
            className={activeMenu === "bills" ? "active" : ""}
            onClick={() => setActiveMenu("bills")}
            title={sidebarCollapsed ? "Bills" : undefined}
          >
            <FaFileInvoiceDollar /> <span>Bills</span>
          </li>
          <li
            className={activeMenu === "reports" ? "active" : ""}
            onClick={() => setActiveMenu("reports")}
            title={sidebarCollapsed ? "Reports" : undefined}
          >
            <FaChartBar /> <span>Reports</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </aside>

      <div className="main-panel">
        <div className="dashboard-header">
          <div className="dashboard-header__left">
            <div>
              <h2>Welcome, {user.firstName || "Accountant"}</h2>
              <p>Track collections, dues, and reminder actions from one place.</p>
            </div>
          </div>
          <button
            className="notify-all-btn"
            type="button"
            onClick={sendAllNotifications}
            disabled={sendingAll || unpaidBills.length === 0}
          >
            <FaBell />
            {sendingAll ? "Sending..." : `Notify Unpaid (${unpaidBills.length})`}
          </button>
        </div>

        {message && <div className="dashboard-message">{message}</div>}

        {summary && (
          <>
            <div className="summary-cards">
              <div className="card">
                <h4>Total Collected (Rs.)</h4>
                <p>{Number(summary.collected || 0).toFixed(2)}</p>
              </div>
              <div className="card">
                <h4>Outstanding Dues (Rs.)</h4>
                <p>{Number(summary.dues || 0).toFixed(2)}</p>
              </div>
              <div className="card">
                <h4>Paid / Unpaid</h4>
                <p>{summary.paidCount || 0} / {summary.unpaidCount || 0}</p>
              </div>
            </div>

            <div className="analytics-grid">
              <section className="chart-panel">
                <div className="panel-title-row">
                  <h3>Collection Trend</h3>
                  <span>Last 6 months</span>
                </div>
                <div className="bar-chart" aria-label="Monthly collection chart">
                  {chartRows.length > 0 ? chartRows.map((row) => (
                    <div className="bar-group" key={row.month}>
                      <div className="bar-stack">
                        <span
                          className="bar bar-dues"
                          style={{ height: `${Math.max(row.duesHeight, row.dues ? 8 : 0)}%` }}
                          title={`Dues: Rs. ${row.dues.toFixed(2)}`}
                        />
                        <span
                          className="bar bar-collected"
                          style={{ height: `${Math.max(row.collectedHeight, row.collected ? 8 : 0)}%` }}
                          title={`Collected: Rs. ${row.collected.toFixed(2)}`}
                        />
                      </div>
                      <span className="bar-label">{row.month}</span>
                    </div>
                  )) : (
                    <p className="empty-chart">No monthly data available.</p>
                  )}
                </div>
                <div className="chart-legend">
                  <span><i className="legend-collected" /> Collected</span>
                  <span><i className="legend-dues" /> Dues</span>
                </div>
              </section>

              <section className="chart-panel payment-chart-panel">
                <div className="panel-title-row">
                  <h3>Payment Status</h3>
                  <span>{paidPercent}% paid</span>
                </div>
                <div
                  className="donut-chart"
                  style={{ background: `conic-gradient(#1f9d55 ${paidPercent * 3.6}deg, #ef4444 0deg)` }}
                >
                  <div>
                    <strong>{paidPercent}%</strong>
                    <small>Paid</small>
                  </div>
                </div>
                <div className="status-split">
                  <span><FaCheckCircle /> {summary.paidCount || 0} paid</span>
                  <span><FaBell /> {summary.unpaidCount || 0} unpaid</span>
                </div>
              </section>
            </div>
          </>
        )}

        {activeMenu === "bills" && (
          <>
            <h3>Recent Bills</h3>
            <table className="bills-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Flat</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reminder</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 20).map((bill) => {
                  const billId = bill.id || bill._id;
                  const paid = (bill.status || "").toUpperCase() === "PAID";

                  return (
                    <tr key={billId}>
                      <td>{bill.billMonth}</td>
                      <td>{bill.flatNumber}</td>
                      <td>Rs. {Number(bill.amount || 0).toFixed(2)}</td>
                      <td><span className={`badge ${bill.status}`}>{bill.status}</span></td>
                      <td>
                        {paid ? (
                          <span className="paid-action"><FaCheckCircle /> Paid</span>
                        ) : (
                          <button
                            className="icon-action"
                            type="button"
                            title="Send unpaid bill reminder"
                            aria-label={`Send reminder for flat ${bill.flatNumber}`}
                            onClick={() => sendNotification(bill)}
                            disabled={sendingAll || sendingId === billId}
                          >
                            <FaPaperPlane />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {activeMenu === "reports" && (
          <>
            <h3>Monthly Collection Report</h3>
            {monthlyData && Object.keys(monthlyData).length > 0 ? (
              <div className="monthly-reports">
                {Object.entries(monthlyData).map(([month, items]) => (
                  <div key={month} className="report-month-card">
                    <h4>{month}</h4>
                    <table className="bills-table">
                      <thead>
                        <tr>
                          <th>Flat</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={`${month}-${i}`}>
                            <td>{item.flatNumber}</td>
                            <td>Rs. {Number(item.amount || 0).toFixed(2)}</td>
                            <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <p>No monthly data available.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccountantDashboard;
