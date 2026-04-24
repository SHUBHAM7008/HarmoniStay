import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import { AuthContext } from "../context/AuthContext";
import "./MemberBills.css";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const MemberBills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchBills = async () => {
      try {
        const response = await axios.get(`http://localhost:8888/api/bills/user/${user.id}`);

        const sortedBills = [...(response.data || [])].sort(
          (left, right) => new Date(right.billMonth || 0) - new Date(left.billMonth || 0)
        );

        setBills(sortedBills);
        setFilteredBills(sortedBills);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user]);

  useEffect(() => {
    const filtered = bills.filter((bill) => {
      const billMonth = String(bill.billMonth || "");
      const billStatus = String(bill.status || "");

      const matchesSearch = search
        ? billMonth.toLowerCase().includes(search.toLowerCase()) ||
          billStatus.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesMonth = filterMonth
        ? billMonth.toLowerCase().includes(filterMonth.toLowerCase())
        : true;

      const matchesYear = filterYear ? billMonth.includes(filterYear) : true;

      return matchesSearch && matchesMonth && matchesYear;
    });

    setFilteredBills(filtered);
  }, [search, filterMonth, filterYear, bills]);

  const generateReceipt = (member, billMonth, amount, paymentId) => {
    const doc = new jsPDF();
    const receiptDate = new Date();
    const receiptNo = `RCP-${String(receiptDate.getTime()).slice(-6)}`;

    doc.setFontSize(22);
    doc.setTextColor(40, 70, 90);
    doc.text("RECEIPT", 84, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("HarmonyStay", 20, 35);
    doc.text("Ashok Chowk, Solapur", 20, 42);
    doc.text("Phone: 9359074915", 20, 49);
    doc.text(`Date: ${receiptDate.toLocaleDateString("en-IN")}`, 145, 35);
    doc.text(`Receipt #: ${receiptNo}`, 145, 42);

    doc.line(20, 55, 190, 55);
    doc.setFontSize(13);
    doc.text("DESCRIPTION", 25, 65);
    doc.text("PRICE", 120, 65);
    doc.text("TOTAL", 160, 65);

    doc.setFontSize(12);
    doc.text(`Maintenance bill - ${billMonth}`, 25, 75);
    doc.text(`${amount}`, 120, 75);
    doc.text(`${amount}`, 160, 75);

    doc.line(20, 85, 190, 85);
    doc.text("Subtotal:", 130, 95);
    doc.text(`${amount}`, 170, 95);
    doc.text("Tax:", 130, 102);
    doc.text("0", 170, 102);
    doc.text("Total:", 130, 110);
    doc.text(`${amount}`, 170, 110);

    doc.line(20, 120, 190, 120);
    doc.text("PAID BY", 20, 130);
    doc.text(`${member.firstName || ""}`, 20, 140);
    doc.text(`${member.email || ""}`, 20, 147);
    doc.text("Payment Method: ONLINE", 20, 154);
    doc.text(`Payment ID: ${paymentId}`, 20, 161);

    doc.setFontSize(14);
    doc.setTextColor(40, 70, 90);
    doc.text("Thank you for your payment.", 66, 185);
    doc.save(`HarmonyStay_Receipt_${billMonth}.pdf`);
  };

  const handlePayNow = async (billId, amount, billMonth) => {
    try {
      const orderResponse = await axios.post(
        "http://localhost:8888/api/payments/create-order",
        {
          amount: amount * 100,
        }
      );

      const { orderId } = orderResponse.data;

      const options = {
        key: "rzp_test_RXjylnpmWsTC8v",
        amount: amount * 100,
        currency: "INR",
        name: "HarmonyStay",
        description: `Maintenance payment for ${billMonth}`,
        order_id: orderId,
        handler: async (response) => {
          await axios.put(
            `http://localhost:8888/api/bills/${billId}?transactionId=${response.razorpay_payment_id}`
          );

          setBills((previousBills) =>
            previousBills.map((bill) =>
              bill.id === billId || bill._id === billId
                ? { ...bill, status: "PAID" }
                : bill
            )
          );

          window.alert("Payment successful.");
          generateReceipt(user, billMonth, amount, response.razorpay_payment_id);
        },
        prefill: {
          name: user.firstName,
          email: user.email,
          contact: user.phone || "9999999999",
        },
        theme: { color: "#24557b" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      window.alert("Payment failed. Please try again.");
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("HarmonyStay Bill History", 14, 15);

    let cursorY = 25;
    doc.text("Month | Amount | Status | Due Date", 14, cursorY);
    cursorY += 10;

    filteredBills.forEach((bill) => {
      doc.text(
        `${bill.billMonth} | ${bill.amount} | ${bill.status} | ${
          bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("en-IN") : "-"
        }`,
        14,
        cursorY
      );
      cursorY += 10;
    });

    doc.save("Bill_History.pdf");
  };

  const exportCSV = () => {
    const csvData = filteredBills.map((bill) => ({
      Id: bill.id,
      UserId: bill.userId,
      FlatId: bill.flatId,
      Amount: bill.amount,
      Status: bill.status,
      BillMonth: bill.billMonth,
      Description: bill.description,
      UserEmail: bill.userEmail,
      FlatNumber: bill.flatNumber,
      TransactionId: bill.transactionId,
      DueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("en-IN") : "-",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Bill_History.csv";
    link.click();
  };

  const totalPaid = bills
    .filter((bill) => String(bill.status || "").toLowerCase() === "paid")
    .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

  const totalUnpaid = bills
    .filter((bill) => String(bill.status || "").toLowerCase() !== "paid")
    .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

  if (loading) {
    return <p className="member-bills__loading">Loading bills...</p>;
  }

  return (
    <div className="member-bills-container">
      <div className="member-bills__header">
        <div>
          <h2>My Bills</h2>
          <p>Track maintenance history, exports, and pending payments from one view.</p>
        </div>

        <div className="export-buttons">
          <button type="button" onClick={downloadPDF}>
            Download PDF
          </button>
          <button type="button" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bill-summary">
        <article>
          <span>Total paid</span>
          <strong>{formatINR(totalPaid)}</strong>
        </article>
        <article>
          <span>Total unpaid</span>
          <strong>{formatINR(totalUnpaid)}</strong>
        </article>
        <article>
          <span>Total bills</span>
          <strong>{bills.length}</strong>
        </article>
      </div>

      <div className="filter-section">
        <input
          type="text"
          placeholder="Search by month or status"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by month"
          value={filterMonth}
          onChange={(event) => setFilterMonth(event.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by year"
          value={filterYear}
          onChange={(event) => setFilterYear(event.target.value)}
        />
      </div>

      {filteredBills.length === 0 ? (
        <p className="member-bills__empty">No bills matched the current filters.</p>
      ) : (
        <table className="bills-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill.id || bill._id}>
                <td>{bill.billMonth}</td>
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
                  {bill.dueDate
                    ? new Date(bill.dueDate).toLocaleDateString("en-IN")
                    : "-"}
                </td>
                <td>
                  {["unpaid", "pending"].includes(
                    String(bill.status || "").toLowerCase()
                  ) ? (
                    <button
                      type="button"
                      className="pay-btn"
                      onClick={() =>
                        handlePayNow(bill.id || bill._id, bill.amount, bill.billMonth)
                      }
                    >
                      Pay now
                    </button>
                  ) : (
                    <span className="paid-label">Settled</span>
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
