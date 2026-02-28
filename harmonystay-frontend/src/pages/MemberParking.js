import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./MemberParking.css";

const MemberParking = () => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMemberSlots = async () => {
    if (!user?.flatId) return;
    try {
      const res = await axios.get(
        `http://localhost:8888/api/parking/byFlat/${user.flatId}`
      );
      setSlots(res.data);
    } catch (err) {
      console.error("Error fetching member slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberSlots();
  }, [user]);

  const handlePay = async (slotId) => {
    try {
      await axios.put(`http://localhost:8888/api/parking/pay/${slotId}`);
      alert("Payment successful!");
      fetchMemberSlots(); // refresh table
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed. Try again.");
    }
  };

  if (loading) return <p>Loading parking details...</p>;
  if (slots.length === 0) return <p>No parking slots assigned to you.</p>;

  return (
    <div className="member-parking-container">
      <h2>My Parking Slots</h2>
      <div className="table-wrapper">
        <table className="parking-table">
          <thead>
            <tr>
              <th>Slot Number</th>
              <th>Flat</th>
              <th>Vehicle Number</th>
              <th>Vehicle Type</th>
              <th>Monthly Charge</th>
              <th>Payment Status</th>
              <th>Payment Month</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot._id || slot.id}>
                <td>{slot.slotNumber}</td>
                <td>{slot.flatId || "-"}</td>
                <td>{slot.vehicleNumber || "-"}</td>
                <td>{slot.vehicleType || "-"}</td>
                <td>{slot.monthlyCharge || "-"}</td>
                <td>
                  <span
                    className={`payment-status ${
                      slot.paymentStatus === "Paid" ? "paid" : "unpaid"
                    }`}
                  >
                    {slot.paymentStatus || "UnPaid"}
                  </span>
                </td>
                <td>{slot.paymentMonth || "-"}</td>
                
                <td>
                  {slot.paymentStatus !== "Paid" && (
                    <button
                      className="pay-btn"
                      onClick={() => handlePay(slot._id || slot.id)}
                    >
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberParking;
