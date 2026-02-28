import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable"; 

import Papa from "papaparse";
import "./MemberBills.css";

const MemberBills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchBills = async () => {
      try {
       const res = await axios.get(`http://localhost:8888/api/bills/user/${user.id}`);

        // Sort by billMonth descending (latest first)
        const sortedBills = res.data.sort((a, b) => new Date(b.billMonth) - new Date(a.billMonth));

        // Set state
        setBills(sortedBills);
        setFilteredBills(sortedBills);

        console.log(res.data);
      } catch (err) {
        console.error("Error fetching bills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user]);

  // Filter and search bills
  useEffect(() => {
    let filtered = bills.filter((bill) => {
      const matchesSearch = search
        ? bill.billMonth.toLowerCase().includes(search.toLowerCase()) ||
          bill.status.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesMonth = filterMonth ? bill.billMonth.toLowerCase().includes(filterMonth.toLowerCase()) : true;
      const matchesYear = filterYear ? bill.billMonth.includes(filterYear) : true;
      return matchesSearch && matchesMonth && matchesYear;
    });
    setFilteredBills(filtered);
  }, [search, filterMonth, filterYear, bills]);

  const handlePayNow = async (billId, amount, billMonth) => {
    try {
      // Step 1: Create order via backend
      const orderRes = await axios.post("http://localhost:8888/api/payments/create-order", {
        amount: amount * 100, // in paise
      });

      const { orderId } = orderRes.data;

      // Step 2: Configure Razorpay options
      const options = {
        key: "rzp_test_RXjylnpmWsTC8v", // Your Razorpay test key
        amount: amount * 100,
        currency: "INR",
        name: "HarmonyStay",
        description: `Maintenance Payment for ${billMonth}`,
        order_id: orderId,
        handler: async function (response) {
          // Payment successful, update bill in backend
         await axios.put(
  `http://localhost:8888/api/bills/${billId}?transactionId=${response.razorpay_payment_id}`
);


          // Update UI
          setBills((prev) =>
            prev.map((bill) =>
              bill.id === billId || bill._id === billId
                ? { ...bill, status: "PAID" }
                : bill
            )
          );

          alert("Payment successful!");

          // Generate receipt PDF
         generateReceipt(user, billMonth, amount, response.razorpay_payment_id);

        },
        prefill: {
          name: user.firstName,
          email: user.email,
          contact: user.phone || "9999999999",
        },
        theme: { color: "#197de2" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };


const generateReceipt = (user, billMonth, amount, paymentId) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 70, 90);
  doc.text("RECEIPT", 90, 20);

  // Company Details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("HarmonyStay", 20, 35);
  doc.text("Ashok Chowk, Solapur", 20, 42);
  doc.text("Phone: 9359074915", 20, 49);

  // Right side (Date and Receipt #)
  const today = new Date();
  const receiptNo = "RCP-" + today.getTime().toString().slice(-6);
  doc.text(`Date: ${today.toLocaleDateString()}`, 150, 35);
  doc.text(`Receipt #: ${receiptNo}`, 150, 42);

  // Divider line
  doc.line(20, 55, 190, 55);

  // Description Table Headers
  doc.setFontSize(13);
  doc.text("DESCRIPTION", 25, 65);
  doc.text("PRICE", 120, 65);
  doc.text("TOTAL", 160, 65);

  // Table data
  doc.setFontSize(12);
  doc.text("Maintenance Bill", 25, 75);
  doc.text(`${amount}`, 120, 75);
  doc.text(`${amount}`, 160, 75);

  // Divider
  doc.line(20, 85, 190, 85);

  // Totals
  doc.text("Subtotal:", 130, 95);
  doc.text(`${amount}`, 170, 95);
  doc.text("Tax:", 130, 102);
  doc.text("₹0", 170, 102);
  doc.text("Total:", 130, 110);
  doc.text(`${amount}`, 170, 110);

  // Paid By section
  doc.line(20, 120, 190, 120);
  doc.text("PAID BY", 20, 130);
  doc.setFontSize(12);
  doc.text(`${user.firstName}`, 20, 140);
  doc.text(`${user.email}`, 20, 147);
  doc.text(`Payment Method: ONLINE`, 20, 154);
  doc.text(`Payment ID: ${paymentId}`, 20, 161);

  // Footer
  doc.setFontSize(14);
  doc.setTextColor(40, 70, 90);
  doc.text("Thank You!", 90, 185);

  // Save file
  doc.save(`HarmonyStay_Receipt_${billMonth}.pdf`);
};

  // Download all bills as PDF
 const downloadPDF = () => {
  const doc = new jsPDF();
  doc.text("HarmonyStay Bill History", 14, 15);

  let y = 25;
  doc.text("Month | Amount | Status | Due Date", 14, y);
  y += 10;

  filteredBills.forEach((b) => {
    doc.text(
      `${b.billMonth} | ${b.amount} | ${b.status} | ${b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "-"}`,
      14,
      y
    );
    y += 10;
  });

  doc.save("Bill_History.pdf");
};


  // Export CSV
 const exportCSV = () => {
  // Map all relevant attributes from the Bill object
  const csvData = filteredBills.map((b) => ({
    Id: b.id,
    UserId: b.userId,
    FlatId: b.flatId,
    Amount: b.amount,
    Status: b.status,
    BillMonth: b.billMonth,
    Description: b.description,
    UserEmail: b.userEmail,
    FlatNumber: b.flatNumber,
    transactionId:b.transactionId,
    DueDate: b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "-",
  }));

  const csv = Papa.unparse(csvData);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Bill_History.csv";
  link.click();
};


  // Summary totals
  const totalPaid = bills.filter((b) => b.status.toLowerCase() === "paid").reduce((sum, b) => sum + b.amount, 0);
  const totalUnpaid = bills.filter((b) => b.status.toLowerCase() !== "paid").reduce((sum, b) => sum + b.amount, 0);

  if (loading) return <p>Loading bills...</p>;

  return (
    <div className="member-bills-container">
      <h2>My Bills</h2>

      {/* Summary */}
      <div className="bill-summary">
        <p><strong>Total Paid:</strong> ₹{totalPaid}</p>
        <p><strong>Total Unpaid:</strong> ₹{totalUnpaid}</p>
        <p><strong>Total Bills:</strong> {bills.length}</p>
      </div>

      {/* Search & Filter */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="🔍 Search by Month or Status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter Month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter Year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        />
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button onClick={downloadPDF}>💾 Download PDF</button>
        <button onClick={exportCSV}>📥 Export CSV</button>
      </div>

      {filteredBills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <table className="bills-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
  {filteredBills.map((bill) => (
    <tr key={bill.id || bill._id}>
      <td>{bill.billMonth}</td>
      <td>{bill.amount}</td>
      <td>
        <span
          className={`status ${
            bill.status.toLowerCase() === "paid" ? "paid" : "pending"
          }`}
        >
          {bill.status}
        </span>
      </td>
      <td>
        {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "-"}
      </td>
      <td>
        {/* Show Pay Now only for unpaid or pending bills */}
        {bill.status.toLowerCase() === "unpaid" || bill.status.toLowerCase() === "pending" ? (
          <button
            className="pay-btn"
            onClick={() => handlePayNow(bill.id || bill._id, bill.amount, bill.billMonth)}
          >
            Pay Now
          </button>
        ) : (
          <span className="paid-label">Paid</span>
        )}
      </td>
    </tr>
  ))}
</tbody>

        </table>
      )}
    </div>
  );
};

export default MemberBills;
