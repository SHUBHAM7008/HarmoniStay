import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./AdminReports.css";

const AdminReports = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      const url = filterMonth
        ? `http://localhost:8888/api/reports/maintenance-summary?month=${filterMonth}`
        : "http://localhost:8888/api/reports/maintenance-summary";
      const res = await axios.get(url);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [filterMonth]);

  const loadMonthly = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/reports/monthly-collection");
      setMonthly(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadMonthly();
  }, [loadSummary, loadMonthly]);

  return (
    <div className="admin-reports-container">
      <h2>Reports & Analytics</h2>
      <input
        type="month"
        placeholder="Filter by month"
        value={filterMonth}
        onChange={(e) => setFilterMonth(e.target.value)}
        className="month-filter"
      />
      {summary && (
        <div className="summary-cards">
          <div className="card">
            <h4>Total Bills</h4>
            <p>{summary.totalBills}</p>
          </div>
          <div className="card">
            <h4>Total Amount (₹)</h4>
            <p>{summary.totalAmount?.toFixed(2)}</p>
          </div>
          <div className="card paid">
            <h4>Collected (₹)</h4>
            <p>{summary.collected?.toFixed(2)}</p>
            <small>{summary.paidCount} paid</small>
          </div>
          <div className="card unpaid">
            <h4>Dues (₹)</h4>
            <p>{summary.dues?.toFixed(2)}</p>
            <small>{summary.unpaidCount} unpaid</small>
          </div>
        </div>
      )}
      {monthly && Object.keys(monthly).length > 0 && (
        <div className="monthly-section">
          <h3>Monthly Collection</h3>
          {Object.entries(monthly).map(([m, items]) => (
            <div key={m} className="month-block">
              <h4>{m}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Flat</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.flatNumber}</td>
                      <td>₹{item.amount}</td>
                      <td><span className={"badge " + item.status}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
