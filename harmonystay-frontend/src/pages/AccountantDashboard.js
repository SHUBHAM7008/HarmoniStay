import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSignOutAlt, FaFileInvoiceDollar, FaChartBar } from "react-icons/fa";
import "./AccountantDashboard.css";

const AccountantDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("bills");
  const [summary, setSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "accountant") {
      navigate("/");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [sumRes, billsRes, monthlyRes] = await Promise.all([
        axios.get("http://localhost:8888/api/reports/maintenance-summary"),
        axios.get("http://localhost:8888/api/bills"),
        axios.get("http://localhost:8888/api/reports/monthly-collection"),
      ]);
      setSummary(sumRes.data);
      setBills(billsRes.data?.slice(0, 20) || []);
      setMonthlyData(monthlyRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="accountant-dashboard">
      <aside className="sidebar">
        <h2>HarmonyStay</h2>
        <p className="role">Accountant</p>
        <ul className="menu-list">
          <li
            className={activeMenu === "bills" ? "active" : ""}
            onClick={() => setActiveMenu("bills")}
          >
            <FaFileInvoiceDollar /> Bills
          </li>
          <li
            className={activeMenu === "reports" ? "active" : ""}
            onClick={() => setActiveMenu("reports")}
          >
            <FaChartBar /> Reports
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      <div className="main-panel">
        <h2>Welcome, {user.firstName || "Accountant"} 👋</h2>

        {activeMenu === "bills" && (
          <>
            {summary && (
              <div className="summary-cards">
                <div className="card">
                  <h4>Total Collected (₹)</h4>
                  <p>{summary.collected?.toFixed(2)}</p>
                </div>
                <div className="card">
                  <h4>Outstanding Dues (₹)</h4>
                  <p>{summary.dues?.toFixed(2)}</p>
                </div>
                <div className="card">
                  <h4>Paid / Unpaid</h4>
                  <p>{summary.paidCount} / {summary.unpaidCount}</p>
                </div>
              </div>
            )}
            <h3>Recent Bills</h3>
            <table className="bills-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Flat</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id}>
                    <td>{b.billMonth}</td>
                    <td>{b.flatNumber}</td>
                    <td>₹{b.amount}</td>
                    <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeMenu === "reports" && (
          <>
            {summary && (
              <div className="summary-cards">
                <div className="card">
                  <h4>Total Collected (₹)</h4>
                  <p>{summary.collected?.toFixed(2)}</p>
                </div>
                <div className="card">
                  <h4>Outstanding Dues (₹)</h4>
                  <p>{summary.dues?.toFixed(2)}</p>
                </div>
                <div className="card">
                  <h4>Paid / Unpaid</h4>
                  <p>{summary.paidCount} / {summary.unpaidCount}</p>
                </div>
              </div>
            )}
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
                            <td>₹{item.amount}</td>
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
