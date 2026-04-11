import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MemberMeetings.css";

const MemberMeetings = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/meetings");
      setMeetings(res.data.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="member-meetings-container">
      <h2>Society Meetings</h2>
      <div className="meetings-list">
        {meetings.map((m) => (
          <div key={m.id} className="meeting-card">
            <h4>{m.title}</h4>
            <p><strong>Type:</strong> {m.type}</p>
            <p><strong>Date:</strong> {new Date(m.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Venue:</strong> {m.venue || "-"}</p>
            <p>{m.description}</p>
            {m.minutes && <div className="minutes"><strong>Minutes:</strong><pre>{m.minutes}</pre></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberMeetings;
