// src/pages/AdminBills.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminBills.css";

const AdminBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all bills
    axios
  .get("http://localhost:8888/api/bills")
  .then((res) => {
    const sortedBills = res.data.sort((a, b) => {
      // Convert billMonth to Date objects for comparison
      const dateA = new Date(a.billMonth);
      const dateB = new Date(b.billMonth);
      return dateB - dateA; // Latest on top
    });
    setBills(sortedBills);
  })
  .catch((err) => console.error(err));


    // Fetch all members to get phone numbers
    axios.get("http://localhost:8888/api/members")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const sendNotification = async (userId, bill) => {
    try {
      const user = users.find((u) => u._id === userId);
      if (!user || !user.phone) {
        alert("User phone number not found!");
        return;
      }

      // Call your backend to trigger Twilio SMS
      await axios.post(`http://localhost:8888/api/notices/notify`, {
        phone: user.phone,
        message: `Hi ${user.name}, your bill for ${bill.billMonth} of ₹${bill.amount} is pending.`
      });

      alert("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification.");
    }
  };

  // Group bills by month
  const groupedBills = bills.reduce((acc, bill) => {
    if (!acc[bill.billMonth]) acc[bill.billMonth] = [];
    acc[bill.billMonth].push(bill);
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading bills...</div>;

  return (
    <div className="admin-bills-container">
      <h2>Bill Management</h2>

      {Object.keys(groupedBills).map((month) => (
        <div key={month} className="month-bills">
          <h3>{month}</h3>
          <table className="bills-table">
            <thead>
              <tr>
                <th>Flat</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedBills[month].map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.flatNumber}</td>
                  <td>{bill.amount}</td>
                  <td>
                    <span className={`status ${bill.status.toLowerCase()}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    {bill.status === "UNPAID" ? (
                      <button
                        className="notify-btn"
                        onClick={() => sendNotification(bill.userId, bill)}
                      >
                        Notify
                      </button>
                    ) : (
                      <span className="paid-label">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AdminBills;
