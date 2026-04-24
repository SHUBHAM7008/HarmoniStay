import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminMeetings.css";

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "Date to be announced";

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("AGM");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [venue, setVenue] = useState("");
  const [minutes, setMinutes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadMeetings = async () => {
      try {
        const response = await axios.get("http://localhost:8888/api/meetings");

        if (!cancelled) {
          const data = Array.isArray(response.data) ? response.data : [];
          const sortedMeetings = [...data].sort(
            (left, right) =>
              new Date(right.scheduledDate || 0) - new Date(left.scheduledDate || 0)
          );
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
  }, [reloadKey]);

  const resetForm = () => {
    setTitle("");
    setType("AGM");
    setDescription("");
    setScheduledDate("");
    setVenue("");
    setMinutes("");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        title,
        type,
        description,
        scheduledDate: scheduledDate || null,
        venue,
        minutes,
      };

      if (editingId) {
        await axios.put(`http://localhost:8888/api/meetings/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:8888/api/meetings", payload);
      }

      resetForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const editMeeting = (meeting) => {
    setTitle(meeting.title || "");
    setType(meeting.type || "AGM");
    setDescription(meeting.description || "");
    setScheduledDate(meeting.scheduledDate ? meeting.scheduledDate.split("T")[0] : "");
    setVenue(meeting.venue || "");
    setMinutes(meeting.minutes || "");
    setEditingId(meeting.id);
  };

  const deleteMeeting = async (id) => {
    if (!window.confirm("Delete this meeting?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8888/api/meetings/${id}`);
      setReloadKey((value) => value + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const upcomingCount = meetings.filter(
    (meeting) => meeting.scheduledDate && new Date(meeting.scheduledDate) >= new Date()
  ).length;

  return (
    <div className="admin-meetings-container">
      <div className="admin-meetings__header">
        <div>
          <p className="admin-meetings__eyebrow">Governance planning</p>
          <h2>Meeting management</h2>
          <p>Plan upcoming meetings, keep agendas visible, and retain minutes in one polished flow.</p>
        </div>
      </div>

      <div className="admin-meetings__stats">
        <article>
          <span>Total meetings</span>
          <strong>{meetings.length}</strong>
        </article>
        <article>
          <span>Upcoming</span>
          <strong>{upcomingCount}</strong>
        </article>
        <article>
          <span>Editing</span>
          <strong>{editingId ? "Yes" : "No"}</strong>
        </article>
      </div>

      <div className="admin-meetings__layout">
        <form className="meeting-form" onSubmit={handleSubmit}>
          <div className="meeting-form__header">
            <h3>{editingId ? "Edit meeting" : "Create meeting"}</h3>
            {editingId && (
              <button type="button" className="meeting-form__ghost" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>

          <input
            placeholder="Meeting title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="AGM">AGM</option>
            <option value="SGM">SGM</option>
            <option value="COMMITTEE">Committee</option>
          </select>
          <input
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
          />
          <input
            placeholder="Venue"
            value={venue}
            onChange={(event) => setVenue(event.target.value)}
          />
          <textarea
            placeholder="Agenda or description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <textarea
            placeholder="Minutes or resolutions"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
          <button type="submit">{editingId ? "Update meeting" : "Add meeting"}</button>
        </form>

        <div className="admin-meetings__list">
          {meetings.length === 0 ? (
            <div className="admin-meetings__empty">No meetings have been scheduled yet.</div>
          ) : (
            meetings.map((meeting) => (
              <article key={meeting.id} className="meeting-card">
                <div className="meeting-card__top">
                  <div>
                    <span className="meeting-card__type">{formatLabel(meeting.type)}</span>
                    <h4>{meeting.title}</h4>
                  </div>
                  <span className="meeting-card__date">{formatDate(meeting.scheduledDate)}</span>
                </div>

                <p>{meeting.description || "No meeting description added yet."}</p>
                <div className="meeting-card__meta">
                  <span>{meeting.venue || "Venue pending"}</span>
                  <span>{meeting.minutes ? "Minutes attached" : "Minutes pending"}</span>
                </div>

                <div className="meeting-card__actions">
                  <button type="button" onClick={() => editMeeting(meeting)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="del"
                    onClick={() => deleteMeeting(meeting.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMeetings;
