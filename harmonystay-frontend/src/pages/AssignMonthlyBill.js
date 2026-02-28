import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AssignMonthlyBill.css";

const AssignMonthlyBill = () => {
  const [members, setMembers] = useState([]);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  useEffect(() => {
    // Fetch all members
    axios.get("http://localhost:8888/api/members")
      .then((res) => setMembers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSendToAll = async () => {
    if (!amount || !month) {
      setMessage("Please enter amount and month.");
      return;
    }

    try {
      // Loop through all members and assign bill
      for (const member of members) {
        if (!member.flatId) continue; // skip if no flat assigned
        const payload = {
          userEmail: member.email,
          flatNumber: member.flatId,
          amount: parseFloat(amount),
          status: "UNPAID",
          billMonth: month,
          description: description || "Monthly maintenance bill",
        };
        alert(member.flatId);
        await axios.post("http://localhost:8888/api/bills", payload);
      }

      setMessage("Monthly bills sent to all members successfully!");
      setAmount("");
      setMonth("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setMessage("Error sending bills to all members.");
    }
  };

  return (
    <div className="assign-bill-container">
      <h2>Assign Monthly Bills</h2>
      <div className="assign-bill-form">
        <label>
          Month:
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>

        <label>
          Amount (₹):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Monthly maintenance bill"
          />
        </label>

        <button onClick={handleSendToAll}>Send to All Members</button>

         <button
              style={{ marginTop: "10px" }}
              onClick={() => navigate("/admin-bills")}
            >
              Maintenance Bills
            </button>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default AssignMonthlyBill;
