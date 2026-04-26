import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./MemberFacilities.css";

const TIME_SLOTS = ["09:00-11:00", "11:00-13:00", "14:00-16:00", "16:00-18:00"];

const MemberFacilities = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [allBookedSlots, setAllBookedSlots] = useState([]);
  const [bookedSlotsLoading, setBookedSlotsLoading] = useState(false);
  const [name, setName] = useState("GYM");
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00-11:00");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.id || user?._id) loadBookings();
  }, [user]);

  useEffect(() => {
    if (name && bookingDate) {
      loadBookedSlots();
    } else {
      setAllBookedSlots([]);
      setBookedSlotsLoading(false);
    }
  }, [name, bookingDate]);

  useEffect(() => {
    const booked = new Set(allBookedSlots.map((b) => b.timeSlot));
    if (booked.has(timeSlot)) {
      const available = TIME_SLOTS.find((s) => !booked.has(s));
      if (available) setTimeSlot(available);
    }
  }, [allBookedSlots]);

  const loadBookings = async () => {
    try {
      const uid = user?.id || user?._id;
      const res = await axios.get(`http://localhost:8888/api/facilities/user/${uid}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBookedSlots = async () => {
    setBookedSlotsLoading(true);
    try {
      const res = await axios.get("http://localhost:8888/api/facilities/availability", {
        params: { name, date: bookingDate },
      });
      const booked = (res.data || []).filter((b) => b.status === "BOOKED");
      setAllBookedSlots(booked);
    } catch (err) {
      setAllBookedSlots([]);
    } finally {
      setBookedSlotsLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      setMessage("Please select a date");
      return;
    }
    const isSlotTaken = allBookedSlots.some((b) => b.timeSlot === timeSlot);
    if (isSlotTaken) {
      setMessage("This slot is already booked. Please choose another.");
      return;
    }
    try {
      const uid = user?.id || user?._id;
      await axios.post("http://localhost:8888/api/facilities", {
        userId: uid,
        flatId: user.flatId,
        name,
        bookingDate,
        timeSlot,
      });
      setMessage("Booking successful!");
      setBookingDate("");
      loadBookings();
      loadBookedSlots();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setMessage(msg && String(msg).includes("already booked") ? String(msg) : "Error booking. Slot may be taken.");
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm("Cancel this booking?")) {
      await axios.put(`http://localhost:8888/api/facilities/${id}/cancel`);
      loadBookings();
    }
  };

  const bookedSlotSet = new Set(allBookedSlots.map((b) => b.timeSlot));

  return (
    <div className="member-facilities-container">
      <h2>Book Facility</h2>

      {bookingDate && name && !bookedSlotsLoading && (
        <div className={`booked-slots-info ${allBookedSlots.length > 0 ? "has-bookings" : "all-available"}`}>
          <h4>📅 {name} on {new Date(bookingDate).toLocaleDateString()}</h4>
          {allBookedSlots.length > 0 ? (
            <p className="booked-slots-list">
              Booked: {allBookedSlots.map((b) => (
                <span key={b.id} className="booked-badge">
                  {b.timeSlot} (Flat {b.flatId})
                </span>
              ))}
            </p>
          ) : (
            <p className="all-available-msg">All slots are available for this date.</p>
          )}
        </div>
      )}
      {bookingDate && name && bookedSlotsLoading && <p className="loading-slots">Loading availability...</p>}

      <form className="facility-form" onSubmit={handleBook}>
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="GYM">Gym</option>
          <option value="CLUBHOUSE">Clubhouse</option>
          <option value="SWIMMING_POOL">Swimming Pool</option>
        </select>
        <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot} disabled={bookedSlotSet.has(slot)}>
              {slot.replace("-", " – ")} {bookedSlotSet.has(slot) ? " (Booked)" : ""}
            </option>
          ))}
        </select>
        <button type="submit" disabled={bookedSlotSet.has(timeSlot)}>Book</button>
      </form>
      {message && <p className="msg">{message}</p>}

      <h3>My Bookings</h3>
      <div className="bookings-list">
        {bookings.map((b) => (
          <div key={b.id} className={`booking-card ${b.status}`}>
            <p><strong>{b.name}</strong> - {new Date(b.bookingDate).toLocaleDateString()} ({b.timeSlot})</p>
            <span className="status">{b.status}</span>
            {b.status === "BOOKED" && <button onClick={() => cancelBooking(b.id)}>Cancel</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberFacilities;
