import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaChartBar,
  FaDownload,
  FaFileInvoiceDollar,
  FaRegClock,
  FaSearch,
  FaSignOutAlt,
  FaWallet,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "./AccountantDashboard.css";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const sectionDescriptions = {
  bills: "Track recent maintenance bills, payment status, and quick collection health signals.",
  reports: "Review monthly collection performance and month-wise bill details for the society.",
};

const AccountantDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("bills");
  const [summary, setSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billSearch, setBillSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReportMonth, setSelectedReportMonth] = useState("");

  useEffect(() => {
    if (!user || user.role !== "accountant") {
      navigate("/");
      return;
    }

    const loadData = async () => {
      setLoading(true);

      try {
        const [summaryResponse, billsResponse, monthlyResponse] = await Promise.all([
          axios.get("http://localhost:8888/api/reports/maintenance-summary"),
          axios.get("http://localhost:8888/api/bills"),
          axios.get("http://localhost:8888/api/reports/monthly-collection"),
        ]);

        setSummary(summaryResponse.data);
        setBills(Array.isArray(billsResponse.data) ? billsResponse.data : []);
        setMonthlyData(monthlyResponse.data || {});
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const reportMonths = useMemo(() => {
    if (!monthlyData || typeof monthlyData !== "object") {
      return [];
    }

    return Object.keys(monthlyData).sort().reverse();
  }, [monthlyData]);

  useEffect(() => {
    if (!selectedReportMonth && reportMonths.length > 0) {
      setSelectedReportMonth(reportMonths[0]);
    }
  }, [reportMonths, selectedReportMonth]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const summaryCards = summary
    ? [
        {
          label: "Total collected",
          value: formatINR(summary.collected),
          icon: FaWallet,
        },
        {
          label: "Outstanding dues",
          value: formatINR(summary.dues),
          icon: FaRegClock,
        },
        {
          label: "Paid / unpaid",
          value: `${summary.paidCount || 0} / ${summary.unpaidCount || 0}`,
          icon: FaFileInvoiceDollar,
        },
      ]
    : [];

  const visibleBills = useMemo(() => {
    const query = billSearch.trim().toLowerCase();

    return [...bills]
      .sort((left, right) => new Date(right.dueDate || 0) - new Date(left.dueDate || 0))
      .filter((bill) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          String(bill.status || "").toUpperCase() === statusFilter;

        const matchesSearch = query
          ? `${bill.billMonth} ${bill.flatNumber} ${bill.amount} ${bill.status}`
              .toLowerCase()
              .includes(query)
          : true;

        return matchesStatus && matchesSearch;
      });
  }, [bills, billSearch, statusFilter]);

  const outstandingBills = useMemo(
    () =>
      visibleBills
        .filter((bill) => String(bill.status || "").toUpperCase() !== "PAID")
        .slice(0, 5),
    [visibleBills]
  );

  const chartBars = useMemo(() => {
    if (!monthlyData || typeof monthlyData !== "object") {
      return [];
    }

    const months = Object.keys(monthlyData).sort().slice(-6);
    let maxValue = 1;

    const rows = months.map((month) => {
      const collected = (monthlyData[month] || [])
        .filter((item) => String(item.status || "").toUpperCase() === "PAID")
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      maxValue = Math.max(maxValue, collected);
      return { month, collected };
    });

    return rows.map((row) => ({
      ...row,
      height: maxValue ? Math.round((row.collected / maxValue) * 100) : 0,
    }));
  }, [monthlyData]);

  const activeReportMonth = selectedReportMonth || reportMonths[0] || "";
  const activeReportItems = activeReportMonth ? monthlyData?.[activeReportMonth] || [] : [];
  const reportCollected = activeReportItems
    .filter((item) => String(item.status || "").toUpperCase() === "PAID")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const reportPending = activeReportItems.filter(
    (item) => String(item.status || "").toUpperCase() !== "PAID"
  ).length;

  const exportVisibleBills = () => {
    const rows = [
      ["Month", "Flat", "Amount", "Status", "Due Date"],
      ...visibleBills.map((bill) => [
        bill.billMonth || "",
        bill.flatNumber || "",
        bill.amount || "",
        bill.status || "",
        bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("en-IN") : "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "accountant-visible-bills.csv";
    link.click();
  };

  if (!user || loading) {
    return <div className="accountant-loading">Loading dashboard...</div>;
  }

  return (
    <div className="accountant-dashboard accountant-dashboard--modern">
      <aside className="accountant-shell__sidebar">
        <div className="accountant-shell__brand">
          <span className="accountant-shell__logo">HS</span>
          <div>
            <strong>HarmonyStay</strong>
            <small>Accounts workspace</small>
          </div>
        </div>

        <div className="accountant-shell__profile">
          <strong>{user.firstName || "Accountant"}</strong>
          <small>Finance operations</small>
        </div>

        <nav className="accountant-shell__nav">
          <button
            type="button"
            className={activeMenu === "bills" ? "is-active" : ""}
            onClick={() => setActiveMenu("bills")}
          >
            <FaFileInvoiceDollar aria-hidden />
            Bills
          </button>
          <button
            type="button"
            className={activeMenu === "reports" ? "is-active" : ""}
            onClick={() => setActiveMenu("reports")}
          >
            <FaChartBar aria-hidden />
            Reports
          </button>
        </nav>

        <button type="button" className="accountant-shell__logout" onClick={handleLogout}>
          <FaSignOutAlt aria-hidden />
          Logout
        </button>
      </aside>

      <div className="accountant-shell">
        <header className="accountant-shell__topbar">
          <div>
            <p className="accountant-shell__eyebrow">Accounts portal</p>
            <h1>{activeMenu === "bills" ? "Billing overview" : "Collection reports"}</h1>
            <p>{sectionDescriptions[activeMenu]}</p>
          </div>
        </header>

        <main className="accountant-shell__main">
          <section className="accountant-summary-grid">
            {summaryCards.map(({ label, value, icon: Icon }) => (
              <article key={label} className="accountant-summary-card">
                <div className="accountant-summary-card__icon">
                  <Icon aria-hidden />
                </div>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          {activeMenu === "bills" && (
            <div className="accountant-layout">
              <section className="accountant-shell__panel accountant-shell__panel--wide">
                <div className="accountant-shell__panel-header">
                  <div>
                    <p className="accountant-shell__panel-eyebrow">Bill toolkit</p>
                    <h3>Search and export bills</h3>
                  </div>
                </div>

                <div className="accountant-shell__controls">
                  <label className="accountant-shell__search">
                    <FaSearch aria-hidden />
                    <input
                      type="search"
                      value={billSearch}
                      onChange={(event) => setBillSearch(event.target.value)}
                      placeholder="Search by month, flat, amount, or status"
                    />
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="ALL">All statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PENDING">Pending</option>
                  </select>

                  <button
                    type="button"
                    className="accountant-shell__export"
                    onClick={exportVisibleBills}
                  >
                    <FaDownload aria-hidden />
                    Export visible bills
                  </button>
                </div>

                <p className="accountant-shell__count">
                  {visibleBills.length} bill(s) match the current filters.
                </p>

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
                    {visibleBills.slice(0, 20).map((bill) => (
                      <tr key={bill.id}>
                        <td>{bill.billMonth}</td>
                        <td>{bill.flatNumber || "Not assigned"}</td>
                        <td>{formatINR(bill.amount)}</td>
                        <td>
                          <span className={`badge ${bill.status}`}>{bill.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="accountant-shell__panel">
                <div className="accountant-shell__panel-header">
                  <div>
                    <p className="accountant-shell__panel-eyebrow">Collection health</p>
                    <h3>Outstanding items</h3>
                  </div>
                </div>

                {outstandingBills.length === 0 ? (
                  <p className="accountant-shell__empty">
                    There are no outstanding bills for the current filters.
                  </p>
                ) : (
                  <ul className="accountant-list">
                    {outstandingBills.map((bill) => (
                      <li key={bill.id}>
                        <strong>Flat {bill.flatNumber || "N/A"}</strong>
                        <span>{bill.billMonth || "Month unavailable"}</span>
                        <em>{formatINR(bill.amount)}</em>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          {activeMenu === "reports" && (
            <>
              <section className="accountant-shell__panel">
                <div className="accountant-shell__panel-header">
                  <div>
                    <p className="accountant-shell__panel-eyebrow">Six month view</p>
                    <h3>Collection trend</h3>
                  </div>
                </div>

                {chartBars.length === 0 ? (
                  <p className="accountant-shell__empty">
                    Monthly collection data is not available yet.
                  </p>
                ) : (
                  <div className="accountant-chart">
                    {chartBars.map((item) => (
                      <div key={item.month} className="accountant-chart__column">
                        <div className="accountant-chart__bar-wrap">
                          <div
                            className="accountant-chart__bar"
                            style={{ height: `${Math.max(8, item.height)}%` }}
                          />
                        </div>
                        <span>{item.month}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="accountant-layout accountant-layout--reports">
                <section className="accountant-shell__panel">
                  <div className="accountant-shell__panel-header">
                    <div>
                      <p className="accountant-shell__panel-eyebrow">Focused month</p>
                      <h3>Month selector</h3>
                    </div>
                  </div>

                  {reportMonths.length === 0 ? (
                    <p className="accountant-shell__empty">No monthly data is available.</p>
                  ) : (
                    <>
                      <label className="accountant-report-toolbar">
                        <span>Report month</span>
                        <select
                          value={activeReportMonth}
                          onChange={(event) => setSelectedReportMonth(event.target.value)}
                        >
                          {reportMonths.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="accountant-report-summary">
                        <article>
                          <span>Entries</span>
                          <strong>{activeReportItems.length}</strong>
                        </article>
                        <article>
                          <span>Collected</span>
                          <strong>{formatINR(reportCollected)}</strong>
                        </article>
                        <article>
                          <span>Pending items</span>
                          <strong>{reportPending}</strong>
                        </article>
                      </div>
                    </>
                  )}
                </section>

                <section className="accountant-shell__panel accountant-shell__panel--wide">
                  <div className="accountant-shell__panel-header">
                    <div>
                      <p className="accountant-shell__panel-eyebrow">Month details</p>
                      <h3>{activeReportMonth || "No report selected"}</h3>
                    </div>
                  </div>

                  {activeReportItems.length === 0 ? (
                    <p className="accountant-shell__empty">
                      Select a month with report data to inspect details.
                    </p>
                  ) : (
                    <table className="bills-table">
                      <thead>
                        <tr>
                          <th>Flat</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeReportItems.map((item, index) => (
                          <tr key={`${activeReportMonth}-${index}`}>
                            <td>{item.flatNumber || "Not assigned"}</td>
                            <td>{formatINR(item.amount)}</td>
                            <td>
                              <span className={`badge ${item.status}`}>{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountantDashboard;
