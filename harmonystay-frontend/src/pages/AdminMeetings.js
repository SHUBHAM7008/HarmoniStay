import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminMeetings.css";

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("AGM");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [venue, setVenue] = useState("");
  const [minutes, setMinutes] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/meetings");
      setMeetings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8888/api/meetings/${editingId}`, {
          title, type, description, scheduledDate: scheduledDate || null, venue, minutes,
        });
        setEditingId(null);
      } else {
        await axios.post("http://localhost:8888/api/meetings", {
          title, type, description, scheduledDate: scheduledDate || null, venue, minutes,
        });
      }
      setTitle(""); setType("AGM"); setDescription(""); setScheduledDate(""); setVenue(""); setMinutes("");
      loadMeetings();
    } catch (err) {
      console.error(err);
    }
  };

  const editMeeting = (m) => {
    setTitle(m.title); setType(m.type || "AGM"); setDescription(m.description || "");
    setScheduledDate(m.scheduledDate ? m.scheduledDate.split("T")[0] : "");
    setVenue(m.venue || ""); setMinutes(m.minutes || "");
    setEditingId(m.id);
  };

  const deleteMeeting = async (id) => {
    if (window.confirm("Delete this meeting?")) {
      await axios.delete(`http://localhost:8888/api/meetings/${id}`);
      loadMeetings();
    }
  };

  return (
    <div className="admin-meetings-container">
      <h2>Meeting Management</h2>
      <form className="meeting-form" onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="AGM">AGM</option>
          <option value="SGM">SGM</option>
          <option value="COMMITTEE">Committee</option>
        </select>
        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        <input placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <textarea placeholder="Minutes / Resolutions" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        <button type="submit">{editingId ? "Update" : "Add"} Meeting</button>
      </form>
      <div className="meetings-list">
        {meetings.map((m) => (
          <div key={m.id} className="meeting-card">
            <h4>{m.title} ({m.type})</h4>
            <p>{new Date(m.scheduledDate).toLocaleDateString()} - {m.venue}</p>
            <button onClick={() => editMeeting(m)}>Edit</button>
            <button className="del" onClick={() => deleteMeeting(m.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMeetings;
