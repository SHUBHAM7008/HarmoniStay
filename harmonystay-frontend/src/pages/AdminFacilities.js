import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminFacilities.css";

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "Date unavailable";

const AdminFacilities = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        const response = await axios.get("http://localhost:8888/api/facilities");

        if (!cancelled) {
          setBookings(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const bookedCount = bookings.filter((booking) => booking.status === "BOOKED").length;
  const cancelledCount = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;

  return (
    <div className="admin-facilities-container">
      <div className="admin-facilities__header">
        <div>
          <p className="admin-facilities__eyebrow">Shared amenities</p>
          <h2>Facility bookings</h2>
          <p>Keep a cleaner view of amenity usage, current bookings, and cancellations.</p>
        </div>
      </div>

      <div className="admin-facilities__stats">
        <article>
          <span>Total bookings</span>
          <strong>{bookings.length}</strong>
        </article>
        <article>
          <span>Active</span>
          <strong>{bookedCount}</strong>
        </article>
        <article>
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
        </article>
      </div>

      {bookings.length === 0 ? (
        <div className="admin-facilities__empty">No facility bookings are available yet.</div>
      ) : (
        <div className="admin-facilities__table-wrap">
          <table className="facilities-table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Flat</th>
                <th>Date</th>
                <th>Time slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{formatLabel(booking.name)}</td>
                  <td>{booking.flatId || "N/A"}</td>
                  <td>{formatDate(booking.bookingDate)}</td>
                  <td>{booking.timeSlot || "Unscheduled"}</td>
                  <td>
                    <span className={`badge ${booking.status}`}>
                      {formatLabel(booking.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFacilities;
