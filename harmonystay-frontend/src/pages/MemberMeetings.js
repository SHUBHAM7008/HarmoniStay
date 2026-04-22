import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MemberMeetings.css";

const MemberMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const feedRes = await axios.get("http://localhost:8888/api/meetings/member-feed");
      const feed = Array.isArray(feedRes.data) ? feedRes.data : [];
      setMeetings(feed);
    } catch (err) {
      // Fallback for older backend builds: load all, then sort and limit client-side.
      try {
        const res = await axios.get("http://localhost:8888/api/meetings");
        const now = new Date();
        const items = (Array.isArray(res.data) ? res.data : [])
          .filter((m) => m && m.scheduledDate)
          .sort((a, b) => {
            const aDate = new Date(a.scheduledDate);
            const bDate = new Date(b.scheduledDate);
            const aUpcoming = aDate >= now;
            const bUpcoming = bDate >= now;
            if (aUpcoming && !bUpcoming) return -1;
            if (!aUpcoming && bUpcoming) return 1;
            return aUpcoming ? aDate - bDate : bDate - aDate;
          })
          .slice(0, 5);
        setMeetings(items);
      } catch (fallbackErr) {
        console.error(fallbackErr);
        setError("Unable to fetch meetings.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-meetings-container">
      <div className="meetings-header">
        <h2>Society Meetings</h2>
        <p>Latest scheduled meetings with complete details</p>
      </div>
      <div className="meetings-list">
        {loading && <p className="meeting-state">Loading meetings...</p>}
        {!loading && error && <p className="meeting-state error">{error}</p>}
        {!loading && !error && meetings.length === 0 && <p className="meeting-state">No meetings available.</p>}
        {!loading && !error && meetings.map((m) => (
          <div key={m.id} className="meeting-card">
            <div className="meeting-top">
              <h4>{m.title || "Untitled meeting"}</h4>
              <span className="meeting-type">{m.type || "General"}</span>
            </div>

            <div className="meeting-grid">
              <p><span>Created By</span>{m.createdBy || "-"}</p>
              <p><span>Schedule Time</span>{formatDateTime(m.scheduledDate)}</p>
              <p><span>Venue</span>{m.venue || "-"}</p>
              <p>
                <span>Meeting Link</span>
                {m.meetingLink ? (
                  <a href={m.meetingLink} target="_blank" rel="noreferrer">
                    Join Meeting
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>

            <div className="meeting-description">
              <span>Description</span>
              <p>{m.description || "-"}</p>
            </div>

            {m.minutes && (
              <div className="minutes">
                <span>Minutes</span>
                <pre>{m.minutes}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberMeetings;
