import React, { useEffect, useState } from "react";
import axios from "axios";
import { getFlats } from "../service/flatService";
import "./AdminParking.css";

const AdminParking = () => {
  const [slots, setSlots] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotNumber: "",
    flatId: "",
    vehicleNumber: "",
    vehicleType: "TWO_WHEELER",
    monthlyCharge: "",
    paymentMonth: "",
    paymentStatus:"Unpaid",
  });

  const fetchSlots = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/parking/all");
      setSlots(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async () => {
    try {
      const res = await getFlats();
      setFlats(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchFlats();
  }, []);

  const handleAddSlot = async () => {
    if (!newSlot.slotNumber || !newSlot.flatId) {
      alert("Slot Number and Flat are required");
      return;
    }
    try {
      await axios.post("http://localhost:8888/api/parking/add", newSlot);
      setNewSlot({
        slotNumber: "",
        flatId: "",
        vehicleNumber: "",
        vehicleType: "TWO_WHEELER",
        monthlyCharge: "",
      });
      setShowAddForm(false);
      fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Failed to add slot");
    }
  };

  if (loading) return <p>Loading parking slots...</p>;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="admin-parking-container">
      <h2>Parking Slots</h2>

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
              <th>Status</th>
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
                <td>{slot.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Slot Button */}
      <button
        className="create-slot-btn"
        onClick={() => setShowAddForm(!showAddForm)}
      >
        {showAddForm ? "Close" : "Create Slot"}
      </button>

      {/* Add Slot Form */}
      {showAddForm && (
        <div className="add-slot-form">
          <h3>Add New Slot</h3>
          <input
            type="text"
            placeholder="Slot Number"
            value={newSlot.slotNumber}
            onChange={(e) =>
              setNewSlot({ ...newSlot, slotNumber: e.target.value })
            }
          />
          <select
            value={newSlot.flatId}
            onChange={(e) => setNewSlot({ ...newSlot, flatId: e.target.value })}
          >
            <option value="">Select Flat</option>
            {flats.map((f) => (
              <option key={f._id || f.id} value={f.flatNumber || f.id}>
                {f.flatNumber || f.name || f._id}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Vehicle Number"
            value={newSlot.vehicleNumber}
            onChange={(e) =>
              setNewSlot({ ...newSlot, vehicleNumber: e.target.value })
            }
          />
          <select
            value={newSlot.vehicleType}
            onChange={(e) =>
              setNewSlot({ ...newSlot, vehicleType: e.target.value })
            }
          >
            <option value="TWO_WHEELER">TWO_WHEELER</option>
            <option value="FOUR_WHEELER">FOUR_WHEELER</option>
            <option value="VISITOR">VISITOR</option>
          </select>
          <input
            type="number"
            placeholder="Monthly Charge"
            value={newSlot.monthlyCharge}
            onChange={(e) =>
              setNewSlot({ ...newSlot, monthlyCharge: e.target.value })
            }
          />
          <select
            value={newSlot.paymentMonth}
            onChange={(e) =>
              setNewSlot({ ...newSlot, paymentMonth: e.target.value })
            }
          >
            <option value="">Select Payment Month</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button onClick={handleAddSlot}>Add Slot</button>
        </div>
      )}
    </div>
  );
};

export default AdminParking;
