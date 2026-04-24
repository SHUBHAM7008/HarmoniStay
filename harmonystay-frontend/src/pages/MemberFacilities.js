import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./MemberFacilities.css";

const TIME_SLOTS = ["09:00-11:00", "11:00-13:00", "14:00-16:00", "16:00-18:00"];

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "Date unavailable";

const MemberFacilities = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [allBookedSlots, setAllBookedSlots] = useState([]);
  const [bookedSlotsLoading, setBookedSlotsLoading] = useState(false);
  const [name, setName] = useState("GYM");
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00-11:00");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const uid = user?.id || user?._id;

    if (!uid) {
      return;
    }

    let cancelled = false;

    const loadBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:8888/api/facilities/user/${uid}`);

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
  }, [user, reloadKey]);

  useEffect(() => {
    if (!name || !bookingDate) {
      setAllBookedSlots([]);
      setBookedSlotsLoading(false);
      return;
    }

    let cancelled = false;

    const loadBookedSlots = async () => {
      setBookedSlotsLoading(true);

      try {
        const response = await axios.get(
          "http://localhost:8888/api/facilities/availability",
          {
            params: { name, date: bookingDate },
          }
        );

        if (!cancelled) {
          const booked = (response.data || []).filter(
            (booking) => booking.status === "BOOKED"
          );
          setAllBookedSlots(booked);
        }
      } catch (error) {
        if (!cancelled) {
          setAllBookedSlots([]);
        }
      } finally {
        if (!cancelled) {
          setBookedSlotsLoading(false);
        }
      }
    };

    loadBookedSlots();

    return () => {
      cancelled = true;
    };
  }, [name, bookingDate, reloadKey]);

  useEffect(() => {
    const booked = new Set(allBookedSlots.map((booking) => booking.timeSlot));

    if (booked.has(timeSlot)) {
      const available = TIME_SLOTS.find((slot) => !booked.has(slot));

      if (available) {
        setTimeSlot(available);
      }
    }
  }, [allBookedSlots, timeSlot]);

  const handleBook = async (event) => {
    event.preventDefault();

    if (!bookingDate) {
      setMessage("Please select a date.");
      return;
    }

    const isSlotTaken = allBookedSlots.some((booking) => booking.timeSlot === timeSlot);

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

      setMessage("Booking successful.");
      setBookingDate("");
      setReloadKey((value) => value + 1);
    } catch (error) {
      const apiMessage = error.response?.data?.message || error.response?.data;
      setMessage(
        apiMessage && String(apiMessage).includes("already booked")
          ? String(apiMessage)
          : "Error booking the facility. The slot may already be taken."
      );
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) {
      return;
    }

    try {
      await axios.put(`http://localhost:8888/api/facilities/${id}/cancel`);
      setReloadKey((value) => value + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const bookedSlotSet = new Set(allBookedSlots.map((booking) => booking.timeSlot));
  const activeBookings = bookings.filter((booking) => booking.status === "BOOKED").length;
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;
  const availableSlots = TIME_SLOTS.filter((slot) => !bookedSlotSet.has(slot)).length;

  return (
    <div className="member-facilities-container">
      <div className="member-facilities__header">
        <div>
          <p className="member-facilities__eyebrow">Amenity bookings</p>
          <h2>Facilities</h2>
          <p>Check availability, reserve time slots, and manage your shared amenity bookings with more clarity.</p>
        </div>
      </div>

      <div className="member-facilities__stats">
        <article>
          <span>Total bookings</span>
          <strong>{bookings.length}</strong>
        </article>
        <article>
          <span>Active</span>
          <strong>{activeBookings}</strong>
        </article>
        <article>
          <span>Cancelled</span>
          <strong>{cancelledBookings}</strong>
        </article>
        <article>
          <span>Open slots</span>
          <strong>{bookingDate ? availableSlots : TIME_SLOTS.length}</strong>
        </article>
      </div>

      <div className="member-facilities__layout">
        <div className="member-facilities__booking-panel">
          {bookingDate && name && !bookedSlotsLoading && (
            <div
              className={`booked-slots-info ${
                allBookedSlots.length > 0 ? "has-bookings" : "all-available"
              }`}
            >
              <h4>
                {formatLabel(name)} on {formatDate(bookingDate)}
              </h4>
              {allBookedSlots.length > 0 ? (
                <p className="booked-slots-list">
                  {allBookedSlots.map((booking) => (
                    <span key={booking.id} className="booked-badge">
                      {booking.timeSlot} | Flat {booking.flatId}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="all-available-msg">All slots are currently available for this date.</p>
              )}
            </div>
          )}

          {bookingDate && name && bookedSlotsLoading && (
            <p className="loading-slots">Loading availability...</p>
          )}

          <form className="facility-form" onSubmit={handleBook}>
            <h3>Book a facility</h3>
            <select value={name} onChange={(event) => setName(event.target.value)}>
              <option value="GYM">Gym</option>
              <option value="CLUBHOUSE">Clubhouse</option>
              <option value="SWIMMING_POOL">Swimming Pool</option>
            </select>
            <input
              type="date"
              value={bookingDate}
              onChange={(event) => setBookingDate(event.target.value)}
              required
            />
            <select value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)}>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot} disabled={bookedSlotSet.has(slot)}>
                  {slot} {bookedSlotSet.has(slot) ? "(Booked)" : ""}
                </option>
              ))}
            </select>
            <button type="submit" disabled={bookedSlotSet.has(timeSlot)}>
              Confirm booking
            </button>
            {message && <p className="msg">{message}</p>}
          </form>
        </div>

        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="member-facilities__empty">You have not made any facility bookings yet.</div>
          ) : (
            bookings.map((booking) => (
              <article key={booking.id} className={`booking-card ${booking.status}`}>
                <div className="booking-card__top">
                  <div>
                    <span className="booking-card__facility">
                      {formatLabel(booking.name)}
                    </span>
                    <h4>{formatDate(booking.bookingDate)}</h4>
                  </div>
                  <span className="status">{formatLabel(booking.status)}</span>
                </div>

                <p>{booking.timeSlot}</p>

                {booking.status === "BOOKED" && (
                  <button type="button" onClick={() => cancelBooking(booking.id)}>
                    Cancel booking
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberFacilities;
