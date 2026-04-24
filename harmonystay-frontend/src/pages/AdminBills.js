import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminBills.css";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const AdminBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadBills = async () => {
      setLoading(true);

      try {
        const [billsResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:8888/api/bills"),
          axios.get("http://localhost:8888/api/members"),
        ]);

        if (cancelled) {
          return;
        }

        const sortedBills = [...(billsResponse.data || [])].sort(
          (left, right) => new Date(right.billMonth || 0) - new Date(left.billMonth || 0)
        );

        setBills(sortedBills);
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBills();

    return () => {
      cancelled = true;
    };
  }, []);

  const sendNotification = async (userId, bill) => {
    try {
      const member = users.find(
        (user) => String(user._id || user.id) === String(userId)
      );

      if (!member?.phone) {
        window.alert("User phone number not found.");
        return;
      }

      await axios.post("http://localhost:8888/api/notices/notify", {
        phone: member.phone,
        message: `Hi ${member.firstName || member.name || "resident"}, your bill for ${
          bill.billMonth
        } of ${formatINR(bill.amount)} is pending.`,
      });

      window.alert("Notification sent successfully.");
    } catch (error) {
      console.error("Error sending notification:", error);
      window.alert("Failed to send notification.");
    }
  };

  const totalCollected = bills
    .filter((bill) => String(bill.status || "").toUpperCase() === "PAID")
    .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

  const totalPending = bills
    .filter((bill) => String(bill.status || "").toUpperCase() !== "PAID")
    .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

  const groupedBills = bills.reduce((groups, bill) => {
    const month = bill.billMonth || "Unscheduled";

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(bill);
    return groups;
  }, {});

  const groupedMonths = Object.keys(groupedBills);

  if (loading) {
    return <div className="admin-bills__loading">Loading bills...</div>;
  }

  return (
    <div className="admin-bills-container">
      <div className="admin-bills__header">
        <div>
          <p className="admin-bills__eyebrow">Maintenance operations</p>
          <h2>Bill management</h2>
          <p>
            Review billing month by month, spot unpaid dues quickly, and notify residents
            from one cleaner control surface.
          </p>
        </div>
      </div>

      <div className="admin-bills__stats">
        <article className="admin-bills__stat">
          <span>Collected</span>
          <strong>{formatINR(totalCollected)}</strong>
        </article>
        <article className="admin-bills__stat admin-bills__stat--warning">
          <span>Pending</span>
          <strong>{formatINR(totalPending)}</strong>
        </article>
        <article className="admin-bills__stat admin-bills__stat--muted">
          <span>Total bills</span>
          <strong>{bills.length}</strong>
        </article>
      </div>

      {groupedMonths.length === 0 ? (
        <div className="admin-bills__empty">No bills are available yet.</div>
      ) : (
        groupedMonths.map((month) => {
          const monthBills = groupedBills[month];
          const paidCount = monthBills.filter(
            (bill) => String(bill.status || "").toUpperCase() === "PAID"
          ).length;

          return (
            <section key={month} className="month-bills">
              <div className="month-bills__header">
                <div>
                  <h3>{month}</h3>
                  <p>{monthBills.length} bills tracked in this cycle.</p>
                </div>
                <span className="month-bills__meta">{paidCount} paid</span>
              </div>

              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Flat</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {monthBills.map((bill) => (
                    <tr key={bill._id || bill.id}>
                      <td>{bill.flatNumber || "Not assigned"}</td>
                      <td>{formatINR(bill.amount)}</td>
                      <td>
                        <span
                          className={`status ${
                            String(bill.status || "").toLowerCase() === "paid"
                              ? "paid"
                              : "pending"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td>
                        {String(bill.status || "").toUpperCase() === "UNPAID" ? (
                          <button
                            type="button"
                            className="notify-btn"
                            onClick={() => sendNotification(bill.userId, bill)}
                          >
                            Notify resident
                          </button>
                        ) : (
                          <span className="paid-label">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })
      )}
    </div>
  );
};

export default AdminBills;
