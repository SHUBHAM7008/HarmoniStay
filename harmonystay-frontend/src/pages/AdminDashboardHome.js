import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowDown,
  FaArrowUp,
  FaBell,
  FaBolt,
  FaCalendarCheck,
  FaExclamationCircle,
  FaFileInvoiceDollar,
  FaRupeeSign,
  FaSwimmingPool,
} from "react-icons/fa";

const API = "http://localhost:8888/api";

const formatINR = (value) =>
  value == null || Number.isNaN(value)
    ? "Not available"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);

const todayStr = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatChartLabel = (monthKey) => {
  if (!monthKey) {
    return "";
  }

  const parsed = new Date(`${monthKey}-01`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  }

  return String(monthKey).replace(/_/g, " ");
};

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const AdminDashboardHome = ({ user, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthlyCollection, setMonthlyCollection] = useState(null);
  const [members, setMembers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [notices, setNotices] = useState([]);
  const [bills, setBills] = useState([]);
  const [actionView, setActionView] = useState("dues");
  const [actionSearch, setActionSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const [
          summaryResponse,
          monthlyResponse,
          membersResponse,
          flatsResponse,
          complaintsResponse,
          facilitiesResponse,
          noticesResponse,
          billsResponse,
        ] = await Promise.all([
          axios.get(`${API}/reports/maintenance-summary`).catch(() => ({ data: null })),
          axios.get(`${API}/reports/monthly-collection`).catch(() => ({ data: {} })),
          axios.get(`${API}/members`).catch(() => ({ data: [] })),
          axios.get(`${API}/flats`).catch(() => ({ data: [] })),
          axios.get(`${API}/complaints`).catch(() => ({ data: [] })),
          axios.get(`${API}/facilities`).catch(() => ({ data: [] })),
          axios.get(`${API}/notices`).catch(() => ({ data: [] })),
          axios.get(`${API}/bills`).catch(() => ({ data: [] })),
        ]);

        if (cancelled) {
          return;
        }

        setSummary(summaryResponse.data);
        setMonthlyCollection(monthlyResponse.data || {});
        setMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);
        setFlats(Array.isArray(flatsResponse.data) ? flatsResponse.data : []);
        setComplaints(Array.isArray(complaintsResponse.data) ? complaintsResponse.data : []);
        setFacilities(Array.isArray(facilitiesResponse.data) ? facilitiesResponse.data : []);
        setNotices(Array.isArray(noticesResponse.data) ? noticesResponse.data : []);
        setBills(Array.isArray(billsResponse.data) ? billsResponse.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const openComplaints = useMemo(
    () =>
      complaints.filter((item) =>
        ["PENDING", "IN_PROGRESS"].includes(String(item.status || "").toUpperCase())
      ).length,
    [complaints]
  );

  const activeFacilityBookings = useMemo(
    () =>
      facilities.filter((item) => String(item.status || "").toUpperCase() === "BOOKED")
        .length,
    [facilities]
  );

  const chartMonths = useMemo(() => {
    if (!monthlyCollection || typeof monthlyCollection !== "object") {
      return [];
    }

    return Object.keys(monthlyCollection).sort();
  }, [monthlyCollection]);

  const chartBars = useMemo(() => {
    const visibleMonths = chartMonths.slice(-8);
    let maxValue = 1;

    const rows = visibleMonths.map((month) => {
      const items = monthlyCollection[month] || [];
      const paid = items
        .filter((item) => String(item.status || "").toUpperCase() === "PAID")
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      maxValue = Math.max(maxValue, paid);
      return {
        month,
        paid,
      };
    });

    return rows.map((row) => ({
      ...row,
      displayLabel: formatChartLabel(row.month),
      height: maxValue ? Math.round((row.paid / maxValue) * 100) : 0,
    }));
  }, [monthlyCollection, chartMonths]);

  const recentPaidBills = useMemo(
    () =>
      [...bills]
        .filter((item) => String(item.status || "").toUpperCase() === "PAID")
        .sort(
          (left, right) =>
            new Date(right.updatedAt || right.dueDate || 0) -
            new Date(left.updatedAt || left.dueDate || 0)
        )
        .slice(0, 5),
    [bills]
  );

  const sortedNotices = useMemo(
    () =>
      [...notices].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0)),
    [notices]
  );

  const recentNotices = useMemo(() => sortedNotices.slice(0, 3), [sortedNotices]);

  const recentBookings = useMemo(
    () =>
      [...facilities]
        .filter((item) => String(item.status || "").toUpperCase() === "BOOKED")
        .sort(
          (left, right) => new Date(right.bookingDate || 0) - new Date(left.bookingDate || 0)
        )
        .slice(0, 5),
    [facilities]
  );

  const pendingBills = useMemo(
    () =>
      [...bills]
        .filter((item) => String(item.status || "").toUpperCase() !== "PAID")
        .sort((left, right) => (Number(right.amount) || 0) - (Number(left.amount) || 0)),
    [bills]
  );

  const complaintQueue = useMemo(
    () =>
      [...complaints]
        .filter((item) => String(item.status || "").toUpperCase() !== "RESOLVED")
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)),
    [complaints]
  );

  const bookingQueue = useMemo(
    () =>
      [...facilities]
        .filter((item) => String(item.status || "").toUpperCase() === "BOOKED")
        .sort((left, right) => new Date(left.bookingDate || 0) - new Date(right.bookingDate || 0)),
    [facilities]
  );

  const filteredActionItems = useMemo(() => {
    const query = actionSearch.trim().toLowerCase();
    const source =
      actionView === "dues"
        ? pendingBills
        : actionView === "complaints"
          ? complaintQueue
          : bookingQueue;

    if (!query) {
      return source.slice(0, 6);
    }

    return source
      .filter((item) => {
        if (actionView === "dues") {
          return `${item.flatNumber} ${item.billMonth} ${item.amount}`
            .toLowerCase()
            .includes(query);
        }

        if (actionView === "complaints") {
          return `${item.title} ${item.category} ${item.flatId}`
            .toLowerCase()
            .includes(query);
        }

        return `${item.name} ${item.flatId} ${item.timeSlot}`
          .toLowerCase()
          .includes(query);
      })
      .slice(0, 6);
  }, [actionSearch, actionView, pendingBills, complaintQueue, bookingQueue]);

  const collected = summary?.collected ?? 0;
  const dues = summary?.dues ?? 0;
  const inflowPct =
    collected + dues > 0 ? Math.round((collected / (collected + dues)) * 100) : 0;

  if (loading) {
    return <div className="admin-home-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-home">
      <header className="admin-home__header">
        <div>
          <h1 className="admin-home__title">Hello, {user?.firstName || "Admin"}</h1>
          <p className="admin-home__date">{todayStr()}</p>
        </div>
      </header>

      <section className="admin-home__stats">
        <article className="stat-card stat-card--indigo">
          <span className="stat-card__label">Maintenance collected</span>
          <strong className="stat-card__value">{formatINR(collected)}</strong>
          <span className="stat-card__hint">Paid bills already recorded in the system.</span>
        </article>
        <article className="stat-card stat-card--amber">
          <span className="stat-card__label">Pending dues</span>
          <strong className="stat-card__value">{formatINR(dues)}</strong>
          <span className="stat-card__hint">Outstanding maintenance still to be collected.</span>
        </article>
        <article className="stat-card stat-card--rose">
          <span className="stat-card__label">Open complaints</span>
          <strong className="stat-card__value">{openComplaints}</strong>
          <span className="stat-card__hint">Requests waiting on action or closure.</span>
        </article>
        <article className="stat-card stat-card--teal">
          <span className="stat-card__label">Active bookings</span>
          <strong className="stat-card__value">{activeFacilityBookings}</strong>
          <span className="stat-card__hint">Amenities currently booked by residents.</span>
        </article>
      </section>

      <section className="admin-home__row admin-home__row--split">
        <div className="balance-card">
          <div className="balance-card__top">
            <div>
              <p className="balance-card__eyebrow">Collection overview</p>
              <h2 className="balance-card__amount">{formatINR(collected)}</h2>
              <p className="balance-card__sub">Total maintenance collected across recorded bills.</p>
            </div>

            <div className="balance-card__trends">
              <div className="trend trend--up">
                <FaArrowUp aria-hidden />
                <span>Collection share {inflowPct}%</span>
              </div>
              <div className="trend trend--down">
                <FaArrowDown aria-hidden />
                <span>Outstanding {formatINR(dues)}</span>
              </div>
            </div>
          </div>

          <div className="sparkline" aria-hidden>
            {chartBars.length > 0 ? (
              chartBars.map((item) => (
                <div key={item.month} className="sparkline__bar-wrap" title={item.displayLabel}>
                  <div
                    className="sparkline__bar"
                    style={{ height: `${Math.max(8, item.height)}%` }}
                  />
                </div>
              ))
            ) : (
              <p className="sparkline__empty">
                Monthly collection will appear here once payments are recorded.
              </p>
            )}
          </div>
        </div>

        <div className="society-card">
          <div className="society-card__inner">
            <FaRupeeSign className="society-card__chip" aria-hidden />
            <p className="society-card__brand">HarmonyStay</p>
            <p className="society-card__meta">Unified society operations workspace</p>
            <div className="society-card__nums">
              <span>{members.length}</span> members | <span>{flats.length}</span> flats
            </div>
          </div>

          <div className="quick-actions">
            <button type="button" onClick={() => onNavigate("notice")}>
              <FaBell aria-hidden />
              Post notice
            </button>
            <button type="button" onClick={() => onNavigate("assignbills")}>
              <FaFileInvoiceDollar aria-hidden />
              Assign bills
            </button>
            <button type="button" onClick={() => onNavigate("facilities")}>
              <FaSwimmingPool aria-hidden />
              Review bookings
            </button>
            <button type="button" onClick={() => onNavigate("meetings")}>
              <FaCalendarCheck aria-hidden />
              Schedule meetings
            </button>
          </div>
        </div>
      </section>

      <section className="admin-home__row">
        <div className="panel panel--operations">
          <div className="operations-board__top">
            <div>
              <p className="balance-card__eyebrow">Action center</p>
              <h3 className="panel__title">Operations board</h3>
            </div>
            <div className="operations-board__tabs">
              <button
                type="button"
                className={actionView === "dues" ? "is-active" : ""}
                onClick={() => setActionView("dues")}
              >
                Dues ({pendingBills.length})
              </button>
              <button
                type="button"
                className={actionView === "complaints" ? "is-active" : ""}
                onClick={() => setActionView("complaints")}
              >
                Complaints ({complaintQueue.length})
              </button>
              <button
                type="button"
                className={actionView === "bookings" ? "is-active" : ""}
                onClick={() => setActionView("bookings")}
              >
                Bookings ({bookingQueue.length})
              </button>
            </div>
          </div>

          <div className="operations-board__toolbar">
            <input
              type="search"
              value={actionSearch}
              onChange={(event) => setActionSearch(event.target.value)}
              placeholder={
                actionView === "dues"
                  ? "Search by flat or month"
                  : actionView === "complaints"
                    ? "Search by issue or category"
                    : "Search by facility or flat"
              }
            />
            <button
              type="button"
              className="operations-board__link"
              onClick={() =>
                onNavigate(
                  actionView === "dues"
                    ? "maintenance"
                    : actionView === "complaints"
                      ? "complaints"
                      : "facilities"
                )
              }
            >
              Open full section
            </button>
          </div>

          {filteredActionItems.length === 0 ? (
            <p className="panel__empty">
              {actionView === "dues"
                ? "No pending dues matched the current search."
                : actionView === "complaints"
                  ? "No active complaints matched the current search."
                  : "No bookings matched the current search."}
            </p>
          ) : (
            <ul className="operations-list">
              {filteredActionItems.map((item) => (
                <li key={item.id}>
                  {actionView === "dues" && (
                    <>
                      <div>
                        <strong>Flat {item.flatNumber || "Not assigned"}</strong>
                        <span className="activity-list__meta">
                          {item.billMonth || "Billing period unavailable"} | Due{" "}
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleDateString("en-IN")
                            : "not set"}
                        </span>
                      </div>
                      <span className="operations-list__metric operations-list__metric--warn">
                        {formatINR(item.amount)}
                      </span>
                    </>
                  )}

                  {actionView === "complaints" && (
                    <>
                      <div>
                        <strong>{item.title || "Complaint"}</strong>
                        <span className="activity-list__meta">
                          Flat {item.flatId || "N/A"} | {formatLabel(item.category)} |{" "}
                          {formatLabel(item.status)}
                        </span>
                      </div>
                      <span className="operations-list__metric operations-list__metric--issue">
                        <FaExclamationCircle aria-hidden />
                        Active
                      </span>
                    </>
                  )}

                  {actionView === "bookings" && (
                    <>
                      <div>
                        <strong>{formatLabel(item.name) || "Facility"}</strong>
                        <span className="activity-list__meta">
                          {item.bookingDate
                            ? new Date(item.bookingDate).toLocaleDateString("en-IN")
                            : "Date unavailable"}{" "}
                          | {item.timeSlot || "Slot pending"} | Flat {item.flatId || "N/A"}
                        </span>
                      </div>
                      <span className="operations-list__metric operations-list__metric--ok">
                        Booked
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="admin-home__row">
        <div className="panel panel--chart">
          <h3 className="panel__title">Monthly collection</h3>
          <div className="bar-chart">
            {chartBars.length > 0 ? (
              chartBars.map((item) => (
                <div key={item.month} className="bar-chart__col">
                  <div className="bar-chart__fill-wrap">
                    <div
                      className="bar-chart__fill"
                      style={{ height: `${Math.max(8, item.height)}%` }}
                    />
                  </div>
                  <span className="bar-chart__label">{item.displayLabel}</span>
                </div>
              ))
            ) : (
              <p className="panel__empty">
                Record bill payments to unlock monthly trend reporting.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-home__row admin-home__row--two">
        <div className="panel">
          <h3 className="panel__title">
            <FaFileInvoiceDollar aria-hidden />
            Recent payments
          </h3>
          <ul className="activity-list">
            {recentPaidBills.length === 0 && (
              <li className="activity-list__empty">No paid bills have been recorded yet.</li>
            )}
            {recentPaidBills.map((bill) => (
              <li key={bill.id}>
                <div>
                  <strong>Flat {bill.flatNumber || "Not assigned"}</strong>
                  <span className="activity-list__meta">
                    {bill.billMonth || "Billing period unavailable"}
                  </span>
                </div>
                <span className="activity-list__amt activity-list__amt--pos">
                  +{formatINR(bill.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="panel__title">
            <FaBolt aria-hidden />
            Latest notices
          </h3>
          <ul className="activity-list">
            {recentNotices.length === 0 && (
              <li className="activity-list__empty">No notices have been published yet.</li>
            )}
            {recentNotices.map((notice) => (
              <li key={notice.id}>
                <div>
                  <strong>{notice.title}</strong>
                  <span className="activity-list__meta">
                    {notice.date
                      ? new Date(notice.date).toLocaleDateString("en-IN")
                      : "Date unavailable"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <FaSwimmingPool aria-hidden />
          Recent facility bookings
        </h3>
        <ul className="activity-list">
          {recentBookings.length === 0 && (
            <li className="activity-list__empty">No facility bookings are available yet.</li>
          )}
          {recentBookings.map((facility) => (
            <li key={facility.id}>
              <div>
                <strong>{facility.name?.replace(/_/g, " ") || "Facility"}</strong>
                <span className="activity-list__meta">
                  {(facility.bookingDate &&
                    new Date(facility.bookingDate).toLocaleDateString("en-IN")) ||
                    "Date unavailable"}{" "}
                  | {facility.timeSlot || "Slot pending"} | Flat {facility.flatId || "N/A"}
                </span>
              </div>
              <span className="tag tag--booked">Booked</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboardHome;
