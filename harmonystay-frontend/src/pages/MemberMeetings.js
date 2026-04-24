import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MemberMeetings.css";

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "Date to be announced";

const MemberMeetings = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadMeetings = async () => {
      try {
        const response = await axios.get("http://localhost:8888/api/meetings");
        const data = Array.isArray(response.data) ? response.data : [];
        const sortedMeetings = [...data].sort(
          (left, right) => new Date(right.scheduledDate || 0) - new Date(left.scheduledDate || 0)
        );

        if (!cancelled) {
          setMeetings(sortedMeetings);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadMeetings();

    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingCount = meetings.filter(
    (meeting) => meeting.scheduledDate && new Date(meeting.scheduledDate) >= new Date()
  ).length;

  return (
    <div className="member-meetings-container">
      <div className="member-meetings__header">
        <div>
          <p className="member-meetings__eyebrow">Community governance</p>
          <h2>Society meetings</h2>
          <p>Stay prepared with a clearer view of scheduled meetings, agendas, and recorded minutes.</p>
        </div>
      </div>

      <div className="member-meetings__stats">
        <article>
          <span>Total meetings</span>
          <strong>{meetings.length}</strong>
        </article>
        <article>
          <span>Upcoming</span>
          <strong>{upcomingCount}</strong>
        </article>
      </div>

      <div className="meetings-list">
        {meetings.length === 0 ? (
          <div className="member-meetings__empty">No meetings are currently scheduled.</div>
        ) : (
          meetings.map((meeting) => (
            <article key={meeting.id} className="meeting-card">
              <div className="meeting-card__header">
                <div>
                  <span className="meeting-card__type">{formatLabel(meeting.type)}</span>
                  <h4>{meeting.title}</h4>
                </div>
                <span className="meeting-card__date">{formatDate(meeting.scheduledDate)}</span>
              </div>

              <div className="meeting-card__meta">
                <span>{meeting.venue || "Venue pending"}</span>
                <span>
                  {meeting.scheduledDate && new Date(meeting.scheduledDate) >= new Date()
                    ? "Upcoming"
                    : "Recorded"}
                </span>
              </div>

              <p>{meeting.description || "No meeting description has been shared yet."}</p>

              {meeting.minutes && (
                <div className="minutes">
                  <strong>Minutes</strong>
                  <pre>{meeting.minutes}</pre>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberMeetings;
