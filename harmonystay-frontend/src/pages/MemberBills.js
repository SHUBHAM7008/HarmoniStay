import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable"; 
import Papa from "papaparse";

const MemberBills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const toComparableDate = (bill) => {
    if (bill?.createdDate) return new Date(bill.createdDate);
    if (bill?.billMonth) {
      const parsed = new Date(`${bill.billMonth}-01`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return new Date(0);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  useEffect(() => {
    if (!user) return;

    const fetchBills = async () => {
      try {
        const res = await axios.get(`http://localhost:8888/api/bills/user/${user.id}`);
        const sortedBills = [...res.data].sort((a, b) => toComparableDate(b) - toComparableDate(a));
        setBills(sortedBills);
        setFilteredBills(sortedBills);
      } catch (err) {
        console.error("Error fetching bills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user]);

  useEffect(() => {
    let filtered = bills.filter((bill) => {
      const matchesSearch = search
        ? (bill.billMonth || "").toLowerCase().includes(search.toLowerCase()) ||
          (bill.status || "").toLowerCase().includes(search.toLowerCase()) ||
          (bill.transactionId || "").toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesMonth = filterMonth ? (bill.billMonth || "").toLowerCase().includes(filterMonth.toLowerCase()) : true;
      const matchesYear = filterYear ? (bill.billMonth || "").includes(filterYear) : true;
      return matchesSearch && matchesMonth && matchesYear;
    });
    setFilteredBills(filtered);
  }, [search, filterMonth, filterYear, bills]);

  const handlePayNow = async (billId, amount, billMonth) => {
    try {
      const orderRes = await axios.post("http://localhost:8888/api/payments/create-order", {
        amount: amount * 100,
      });
      const { orderId } = orderRes.data;

      const options = {
        key: "rzp_test_RXjylnpmWsTC8v",
        amount: amount * 100,
        currency: "INR",
        name: "HarmonyStay",
        description: `Maintenance Payment for ${billMonth}`,
        order_id: orderId,
        handler: async function (response) {
          await axios.put(`http://localhost:8888/api/bills/${billId}?transactionId=${response.razorpay_payment_id}`);
          setBills((prev) =>
            prev.map((bill) =>
              bill.id === billId || bill._id === billId
                ? { ...bill, status: "PAID", transactionId: response.razorpay_payment_id }
                : bill
            )
          );
          alert("Payment successful!");
          generateReceipt(user, billMonth, amount, response.razorpay_payment_id);
        },
        prefill: {
          name: user.firstName,
          email: user.email,
          contact: user.phone || "9999999999",
        },
        theme: { color: "#006a61" },
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
    doc.setFontSize(22);
    doc.setTextColor(40, 70, 90);
    doc.text("RECEIPT", 90, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("HarmonyStay", 20, 35);
    doc.text("Elite Management Portal", 20, 42);
    doc.text("Phone: 9359074915", 20, 49);
    const today = new Date();
    const receiptNo = "RCP-" + today.getTime().toString().slice(-6);
    doc.text(`Date: ${today.toLocaleDateString()}`, 150, 35);
    doc.text(`Receipt #: ${receiptNo}`, 150, 42);
    doc.line(20, 55, 190, 55);
    doc.setFontSize(13);
    doc.text("DESCRIPTION", 25, 65);
    doc.text("PRICE", 120, 65);
    doc.text("TOTAL", 160, 65);
    doc.setFontSize(12);
    doc.text(`Maintenance Bill for ${billMonth}`, 25, 75);
    doc.text(`${amount}`, 120, 75);
    doc.text(`${amount}`, 160, 75);
    doc.line(20, 85, 190, 85);
    doc.text("Subtotal:", 130, 95);
    doc.text(`${amount}`, 170, 95);
    doc.text("Tax:", 130, 102);
    doc.text("₹0", 170, 102);
    doc.text("Total:", 130, 110);
    doc.text(`${amount}`, 170, 110);
    doc.line(20, 120, 190, 120);
    doc.text("PAID BY", 20, 130);
    doc.text(`${user.firstName} ${user.lastName || ''}`, 20, 140);
    doc.text(`${user.email}`, 20, 147);
    doc.text(`Payment Method: ONLINE`, 20, 154);
    doc.text(`Payment ID: ${paymentId}`, 20, 161);
    doc.setFontSize(14);
    doc.setTextColor(0, 106, 97);
    doc.text("Thank You!", 90, 185);
    doc.save(`HarmonyStay_Receipt_${billMonth}.pdf`);
  };

  const downloadHistoryPDF = () => {
    const doc = new jsPDF();
    doc.text("HarmonyStay Maintenance History", 14, 15);
    const tableColumn = ["#", "Month", "Amount", "Status", "Due Date", "Payment Ref"];
    const tableRows = filteredBills.map((b, i) => [
      i + 1,
      b.billMonth,
      `INR ${b.amount}`,
      b.status,
      formatDate(b.dueDate),
      b.transactionId || "-"
    ]);
    doc.autoTable(tableColumn, tableRows, { startY: 25 });
    doc.save("Maintenance_History.pdf");
  };

  const exportCSV = () => {
    const csvData = filteredBills.map((b) => ({
      Id: b.id,
      Amount: b.amount,
      Status: b.status,
      BillMonth: b.billMonth,
      transactionId: b.transactionId,
      DueDate: formatDate(b.dueDate),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Maintenance_History.csv";
    link.click();
  };

  const totalPaid = bills.filter((b) => (b.status || "").toLowerCase() === "paid").reduce((sum, b) => sum + b.amount, 0);
  const totalUnpaid = bills.filter((b) => (b.status || "").toLowerCase() !== "paid").reduce((sum, b) => sum + b.amount, 0);

  // Dynamic Upcoming Dues
  const unpaidBill = bills.find(b => (b.status || "").toLowerCase() !== "paid");
  let nextDueDate = "Next Cycle";
  let nextAmount = "₹1,000.00";
  
  if (unpaidBill) {
    nextDueDate = formatDate(unpaidBill.dueDate);
    nextAmount = `₹${unpaidBill.amount.toLocaleString()}`;
  } else if (bills.length > 0) {
    // Predict next month from latest bill
    const latest = bills[0];
    const date = toComparableDate(latest);
    date.setMonth(date.getMonth() + 1);
    nextDueDate = date.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
    nextAmount = `₹${latest.amount.toLocaleString()}`;
  }

  // Group bills by month for the chart
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  const monthStats = months.map((m, idx) => {
    const monthNum = (idx + 1).toString().padStart(2, '0');
    const bill = bills.find(b => {
      const bMonth = (b.billMonth || "").toLowerCase();
      return bMonth.includes(`${currentYear}-${monthNum}`) || 
             bMonth.includes(m.toLowerCase());
    });

    return {
      month: m,
      amount: bill ? (Number(bill.amount) || 0) : 0,
      paid: bill && (bill.status || "").toLowerCase() === "paid"
    };
  });

  const rawMax = Math.max(...monthStats.map(s => s.amount));
  const maxAmount = rawMax > 0 ? rawMax : 1000;
  console.log("Chart Debug:", { monthStats, maxAmount });

  if (loading) return <div className="flex items-center justify-center p-20 text-slate-500 font-bold">Loading records...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Maintenance History</h2>
          <p className="text-slate-500 font-medium mt-1">Review and manage your maintenance payment records and billing details.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadHistoryPDF}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-white hover:shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Download PDF
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-white hover:shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">csv</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
            <p className="text-2xl font-extrabold text-on-surface">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Unpaid</p>
            <p className="text-2xl font-extrabold text-on-surface">₹{totalUnpaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-5 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bills</p>
            <p className="text-2xl font-extrabold text-on-surface">{bills.length}</p>
          </div>
        </div>
      </div>

      {/* Filter & Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-6 border-b border-surface-container flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" 
                placeholder="Search by ID or Reference" 
                type="text"
              />
            </div>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-white border border-outline-variant/50 rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none cursor-pointer"
            >
              <option value="">All Months</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-white border border-outline-variant/50 rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none cursor-pointer"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <button 
            onClick={() => {setSearch(""); setFilterMonth(""); setFilterYear("");}}
            className="text-secondary text-xs font-black uppercase tracking-widest hover:underline"
          >
            Reset Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-surface-container">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill Month</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Ref</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center text-slate-400 font-bold">No maintenance records found for the selected filters.</td>
                </tr>
              ) : (
                filteredBills.map((bill, index) => (
                  <tr key={bill.id || bill._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-extrabold text-on-surface">{bill.billMonth || "-"}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{formatDate(bill.createdDate)}</td>
                    <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{formatDate(bill.dueDate)}</td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-extrabold text-on-surface">₹{(bill.amount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        (bill.status || "").toLowerCase() === "paid" 
                        ? "bg-secondary-container/20 text-secondary border border-secondary/20" 
                        : "bg-error-container/20 text-error border border-error/20"
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {bill.transactionId ? (
                        <code className="text-[10px] bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-600 font-mono font-bold tracking-tighter">
                          {bill.transactionId}
                        </code>
                      ) : (
                        <span className="text-xs text-slate-300 font-bold">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {(bill.status || "").toLowerCase() === "paid" ? (
                        <button 
                          onClick={() => generateReceipt(user, bill.billMonth, bill.amount, bill.transactionId)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary/90 transition-all shadow-sm active:scale-95"
                        >
                          <span className="material-symbols-outlined text-sm">receipt_long</span>
                          Receipt
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePayNow(bill.id || bill._id, bill.amount, bill.billMonth)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-on-primary-fixed text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-on-primary-fixed/90 transition-all shadow-sm active:scale-95"
                        >
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-50/50 border-t border-surface-container flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">Showing {filteredBills.length} of {bills.length} maintenance records</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-slate-400 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-white text-xs font-black">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-slate-400 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-8">
          <h3 className="text-xl font-extrabold text-on-surface mb-8 tracking-tight">Payment History Insights</h3>
          <div className="h-48 flex items-end gap-3 px-4 border-b border-slate-100">
            {monthStats.map((stat, i) => {
              const barHeight = (stat.amount / maxAmount) * 100;
              return (
                <div 
                  key={stat.month}
                  className="flex-1 h-full relative group cursor-pointer flex flex-col justify-end"
                  title={`${stat.month}: ₹${stat.amount}`}
                >
                  <div 
                    className="w-full rounded-t-lg transition-all duration-700 group-hover:opacity-80 origin-bottom"
                    style={{ 
                      height: `${Math.max(stat.amount > 0 ? 8 : 4, barHeight)}%`,
                      backgroundColor: stat.amount > 0 
                        ? (stat.paid ? '#006a61' : '#ba1a1a66') 
                        : '#f1f5f9'
                    }}
                  ></div>
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold shadow-lg z-10">
                    {stat.month}: ₹{stat.amount}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
            {months.map(m => <span key={m} className={monthStats.find(s => s.month === m)?.amount > 0 ? "text-on-surface-variant" : ""}>{m}</span>)}
          </div>
          <div className="mt-8 flex items-center gap-4 pt-4 border-t border-surface-container">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-error/40"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unpaid</span>
            </div>
          </div>
        </div>

        <div className="bg-secondary text-white rounded-2xl shadow-xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Upcoming Dues</h3>
            <p className="text-secondary-container font-medium text-sm">Next maintenance cycle begins in 12 days.</p>
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 transition-all hover:bg-white/20">
                <span className="material-symbols-outlined text-secondary-container text-3xl">calendar_today</span>
                <div>
                  <p className="text-[10px] font-black uppercase text-secondary-container tracking-widest mb-1">Next Due Date</p>
                  <p className="text-xl font-extrabold tracking-tight">{nextDueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 transition-all hover:bg-white/20">
                <span className="material-symbols-outlined text-secondary-container text-3xl">payments</span>
                <div>
                  <p className="text-[10px] font-black uppercase text-secondary-container tracking-widest mb-1">Expected Amount</p>
                  <p className="text-xl font-extrabold tracking-tight">{nextAmount}</p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              const pendingBill = bills.find(b => b.status.toLowerCase() !== 'paid');
              if (pendingBill) handlePayNow(pendingBill.id || pendingBill._id, pendingBill.amount, pendingBill.billMonth);
              else alert("No pending bills for the next cycle yet.");
            }}
            className="mt-10 relative z-10 w-full py-4 bg-white text-secondary font-black text-sm uppercase tracking-widest rounded-xl hover:bg-secondary-container hover:text-on-secondary-container active:scale-95 transition-all shadow-2xl"
          >
            Schedule Payment
          </button>
          
          {/* Abstract Background Pattern */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          <span className="material-symbols-outlined absolute top-8 right-8 text-white/5 text-8xl select-none group-hover:rotate-12 transition-transform duration-700">account_balance</span>
        </div>
      </div>
    </div>
  );
};

export default MemberBills;
