import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaArrowUp,
  FaArrowDown,
  FaRupeeSign,
  FaSwimmingPool,
  FaBell,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaBolt,
} from "react-icons/fa";

const API = "http://localhost:8888/api";

const formatINR = (n) =>
  n == null || Number.isNaN(n)
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);

const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * HarmonyStay admin home — stats and activity from live APIs (no placeholder numbers).
 */
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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [
          sumRes,
          monthlyRes,
          memRes,
          flatRes,
          compRes,
          facRes,
          noticeRes,
          billsRes,
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
        if (cancelled) return;
        setSummary(sumRes.data);
        setMonthlyCollection(monthlyRes.data || {});
        setMembers(Array.isArray(memRes.data) ? memRes.data : []);
        setFlats(Array.isArray(flatRes.data) ? flatRes.data : []);
        setComplaints(Array.isArray(compRes.data) ? compRes.data : []);
        setFacilities(Array.isArray(facRes.data) ? facRes.data : []);
        setNotices(Array.isArray(noticeRes.data) ? noticeRes.data : []);
        setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openComplaints = useMemo(
    () =>
      complaints.filter((c) =>
        ["PENDING", "IN_PROGRESS"].includes(String(c.status || "").toUpperCase())
      ).length,
    [complaints]
  );

  const activeFacilityBookings = useMemo(
    () => facilities.filter((f) => String(f.status).toUpperCase() === "BOOKED").length,
    [facilities]
  );

  const chartMonths = useMemo(() => {
    if (!monthlyCollection || typeof monthlyCollection !== "object") return [];
    return Object.keys(monthlyCollection).sort();
  }, [monthlyCollection]);

  const chartBars = useMemo(() => {
    const months = chartMonths.slice(-8);
    let max = 1;
    const rows = months.map((m) => {
      const items = monthlyCollection[m] || [];
      const paid = items
        .filter((x) => String(x.status).toUpperCase() === "PAID")
        .reduce((s, x) => s + (Number(x.amount) || 0), 0);
      max = Math.max(max, paid);
      return { month: m, paid };
    });
    return rows.map((r) => ({ ...r, h: max ? Math.round((r.paid / max) * 100) : 0 }));
  }, [monthlyCollection, chartMonths]);

  const recentPaidBills = useMemo(() => {
    return [...bills]
      .filter((b) => String(b.status).toUpperCase() === "PAID")
      .slice(0, 5);
  }, [bills]);

  const recentNotices = useMemo(() => {
    return [...notices]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 3);
  }, [notices]);

  const recentBookings = useMemo(() => {
    return [...facilities]
      .filter((f) => String(f.status).toUpperCase() === "BOOKED")
      .sort((a, b) => new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0))
      .slice(0, 5);
  }, [facilities]);

  const collected = summary?.collected ?? 0;
  const dues = summary?.dues ?? 0;
  const inflowPct =
    collected + dues > 0 ? Math.round((collected / (collected + dues)) * 100) : 0;

  if (loading) {
    return (
      <div className="admin-home-loading">Loading dashboard…</div>
    );
  }

  return (
    <div className="admin-home">
      <header className="admin-home__header">
        <div>
          <h1 className="admin-home__title">
            Hello, {user?.firstName || "Admin"}!
          </h1>
          <p className="admin-home__date">{todayStr()}</p>
        </div>
      </header>

      <section className="admin-home__stats">
        <article className="stat-card stat-card--indigo">
          <span className="stat-card__label">Maintenance collected</span>
          <strong className="stat-card__value">{formatINR(collected)}</strong>
          <span className="stat-card__hint">From paid bills in the system</span>
        </article>
        <article className="stat-card stat-card--amber">
          <span className="stat-card__label">Pending dues</span>
          <strong className="stat-card__value">{formatINR(dues)}</strong>
          <span className="stat-card__hint">Unpaid maintenance total</span>
        </article>
        <article className="stat-card stat-card--rose">
          <span className="stat-card__label">Open complaints</span>
          <strong className="stat-card__value">{openComplaints}</strong>
          <span className="stat-card__hint">Pending or in progress</span>
        </article>
        <article className="stat-card stat-card--teal">
          <span className="stat-card__label">Active facility bookings</span>
          <strong className="stat-card__value">{activeFacilityBookings}</strong>
          <span className="stat-card__hint">Currently booked slots</span>
        </article>
      </section>

      <section className="admin-home__row admin-home__row--split">
        <div className="balance-card">
          <div className="balance-card__top">
            <div>
              <p className="balance-card__eyebrow">Society maintenance</p>
              <h2 className="balance-card__amount">{formatINR(collected)}</h2>
              <p className="balance-card__sub">Total collected (all time)</p>
            </div>
            <div className="balance-card__trends">
              <div className="trend trend--up">
                <FaArrowUp /> <span>Inflow share {inflowPct}%</span>
              </div>
              <div className="trend trend--down">
                <FaArrowDown /> <span>Outstanding {formatINR(dues)}</span>
              </div>
            </div>
          </div>
          <div className="sparkline" aria-hidden>
            {chartBars.length > 0 ? (
              chartBars.map((b) => (
                <div key={b.month} className="sparkline__bar-wrap" title={b.month}>
                  <div
                    className="sparkline__bar"
                    style={{ height: `${Math.max(8, b.h)}%` }}
                  />
                </div>
              ))
            ) : (
              <p className="sparkline__empty">No monthly payment data yet</p>
            )}
          </div>
        </div>

        <div className="society-card">
          <div className="society-card__inner">
            <FaRupeeSign className="society-card__chip" />
            <p className="society-card__brand">HarmonyStay</p>
            <p className="society-card__meta">Society operations hub</p>
            <div className="society-card__nums">
              <span>{members.length}</span> members · <span>{flats.length}</span> flats
            </div>
          </div>
          <div className="quick-actions">
            <button type="button" onClick={() => onNavigate("notice")}>
              <FaBell /> Post notice
            </button>
            <button type="button" onClick={() => onNavigate("assignbills")}>
              <FaFileInvoiceDollar /> Assign bills
            </button>
            <button type="button" onClick={() => onNavigate("facilities")}>
              <FaSwimmingPool /> Bookings
            </button>
            <button type="button" onClick={() => onNavigate("meetings")}>
              <FaCalendarCheck /> Meetings
            </button>
          </div>
        </div>
      </section>

      <section className="admin-home__row">
        <div className="panel panel--chart">
          <h3 className="panel__title">Monthly collection (paid amounts)</h3>
          <div className="bar-chart">
            {chartBars.length > 0 ? (
              chartBars.map((b) => (
                <div key={b.month} className="bar-chart__col">
                  <div className="bar-chart__fill-wrap">
                    <div
                      className="bar-chart__fill"
                      style={{ height: `${Math.max(4, b.h)}%` }}
                    />
                  </div>
                  <span className="bar-chart__label">{b.month}</span>
                </div>
              ))
            ) : (
              <p className="panel__empty">Record bill payments to see trends here.</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-home__row admin-home__row--two">
        <div className="panel">
          <h3 className="panel__title">
            <FaFileInvoiceDollar /> Recent payments
          </h3>
          <ul className="activity-list">
            {recentPaidBills.length === 0 && (
              <li className="activity-list__empty">No paid bills yet.</li>
            )}
            {recentPaidBills.map((b) => (
              <li key={b.id}>
                <div>
                  <strong>Flat {b.flatNumber || "—"}</strong>
                  <span className="activity-list__meta">{b.billMonth}</span>
                </div>
                <span className="activity-list__amt activity-list__amt--pos">
                  +{formatINR(b.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="panel__title">
            <FaBolt /> Latest notices
          </h3>
          <ul className="activity-list activity-list--compact">
            {recentNotices.length === 0 && (
              <li className="activity-list__empty">No notices posted.</li>
            )}
            {recentNotices.map((n) => (
              <li key={n.id}>
                <div>
                  <strong>{n.title}</strong>
                  <span className="activity-list__meta">
                    {n.date ? new Date(n.date).toLocaleDateString("en-IN") : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel__title">
          <FaSwimmingPool /> Recent facility bookings
        </h3>
        <ul className="activity-list">
          {recentBookings.length === 0 && (
            <li className="activity-list__empty">No facility bookings yet.</li>
          )}
          {recentBookings.map((f) => (
            <li key={f.id}>
              <div>
                <strong>{f.name?.replace(/_/g, " ")}</strong>
                <span className="activity-list__meta">
                  {f.bookingDate
                    ? new Date(f.bookingDate).toLocaleDateString("en-IN")
                    : ""}{" "}
                  · {f.timeSlot} · Flat {f.flatId}
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
