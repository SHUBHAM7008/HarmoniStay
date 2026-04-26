import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminFacilities.css";

const AdminFacilities = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/facilities");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-facilities-container">
      <h2>Facility Bookings</h2>
      <table className="facilities-table">
        <thead>
          <tr>
            <th>Facility</th>
            <th>Flat</th>
            <th>Date</th>
            <th>Time Slot</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.flatId}</td>
              <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
              <td>{b.timeSlot}</td>
              <td><span className={`badge ${b.status}`}>{b.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminFacilities;
