// src/pages/AdminBills.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import "./AdminBills.css";

const API = "http://localhost:8888/api";

const AdminBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [billsRes, membersRes] = await Promise.all([
          axios.get(`${API}/bills`),
          axios.get(`${API}/members`),
        ]);

        const sortedBills = [...(Array.isArray(billsRes.data) ? billsRes.data : [])].sort((a, b) => {
          const dateA = new Date(a.billMonth || a.createdDate || 0);
          const dateB = new Date(b.billMonth || b.createdDate || 0);
          return dateB - dateA;
        });

        setBills(sortedBills);
        setUsers(Array.isArray(membersRes.data) ? membersRes.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
  };

  const getMemberForBill = (bill) => {
    return users.find((member) => {
      return member.id === bill.userId
        || member._id === bill.userId
        || member.email === bill.userEmail
        || member.flatId === bill.flatId
        || member.flatId === bill.flatNumber;
    });
  };

  const sendNotification = async (userId, bill) => {
    try {
      const user = users.find((u) => u.id === userId || u._id === userId);
      if (!user || !user.phone) {
        alert("User phone number not found!");
        return;
      }

      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "Member";
      await axios.post(`${API}/notices/notify`, {
        phone: user.phone,
        message: `Hi ${name}, your bill for ${bill.billMonth} of Rs. ${bill.amount} is pending.`,
      });

      alert("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification.");
    }
  };

  const buildExportRows = (sourceBills = bills) => {
    return sourceBills.map((bill, index) => {
      const member = getMemberForBill(bill);
      const memberName = [member?.firstName, member?.lastName].filter(Boolean).join(" ") || member?.name || "-";

      return {
        "#": index + 1,
        "Bill ID": bill.id || bill._id || "-",
        "Flat": bill.flatNumber || "-",
        "Member": memberName,
        "Email": bill.userEmail || member?.email || "-",
        "Month": bill.billMonth || "-",
        "Amount": Number(bill.amount || 0).toFixed(2),
        "Status": bill.status || "-",
        "Created Date": formatDate(bill.createdDate),
        "Due Date": formatDate(bill.dueDate),
        "Transaction ID": bill.transactionId || "-",
      };
    });
  };

  const downloadCSV = (sourceBills = bills, filename = "Maintenance_Bills.csv") => {
    const csv = Papa.unparse(buildExportRows(sourceBills));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (sourceBills = bills, filename = "Maintenance_Bills.pdf", title = "HarmonyStay Maintenance Bills") => {
    const rows = buildExportRows(sourceBills);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 14, 22);

    autoTable(doc, {
      head: [["#", "Flat", "Member", "Email", "Month", "Amount", "Status", "Due Date", "Transaction ID"]],
      body: rows.map((row) => [
        row["#"],
        row.Flat,
        row.Member,
        row.Email,
        row.Month,
        row.Amount,
        row.Status,
        row["Due Date"],
        row["Transaction ID"],
      ]),
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 106, 97] },
    });

    doc.save(filename);
  };

  const groupedBills = bills.reduce((acc, bill) => {
    if (!acc[bill.billMonth]) acc[bill.billMonth] = [];
    acc[bill.billMonth].push(bill);
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading bills...</div>;

  return (
    <div className="admin-bills-container">
      <div className="admin-bills-header">
        <div>
          <h2>Bill Management</h2>
          <p>Download maintenance records as CSV or PDF.</p>
        </div>
        <div className="admin-bills-export-actions">
          <button type="button" onClick={() => downloadPDF()}>
            Download PDF
          </button>
          <button type="button" onClick={() => downloadCSV()}>
            Export CSV
          </button>
        </div>
      </div>

      {Object.keys(groupedBills).map((month) => (
        <div key={month} className="month-bills">
          <div className="month-bills__title-row">
            <h3>{month}</h3>
            <div className="month-bills__actions">
              <button
                type="button"
                onClick={() => downloadPDF(groupedBills[month], `Maintenance_Bills_${month}.pdf`, `HarmonyStay Maintenance Bills - ${month}`)}
              >
                PDF
              </button>
              <button
                type="button"
                onClick={() => downloadCSV(groupedBills[month], `Maintenance_Bills_${month}.csv`)}
              >
                CSV
              </button>
            </div>
          </div>
          <table className="bills-table">
            <thead>
              <tr>
                <th>Flat</th>
                <th>Amount (Rs.)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedBills[month].map((bill) => (
                <tr key={bill.id || bill._id}>
                  <td>{bill.flatNumber}</td>
                  <td>{Number(bill.amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status ${(bill.status || "").toLowerCase()}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    {(bill.status || "").toUpperCase() === "UNPAID" ? (
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
