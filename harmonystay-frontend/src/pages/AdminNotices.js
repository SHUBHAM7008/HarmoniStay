import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminNotices.css";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/notices");
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setMessage("Please fill all fields");
      return;
    }
    try {
      await axios.post("http://localhost:8888/api/notices", {
        title,
        description,
        date: new Date(),
        createdBy: "Admin",
      });
      setTitle("");
      setDescription("");
      setMessage("Notice added successfully!");
      loadNotices();
    } catch (err) {
      console.error(err);
      setMessage("Error adding notice");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      await axios.delete(`http://localhost:8888/api/notices/${id}`);
      loadNotices();
    }
  };

  return (
    <div className="admin-notices-container">
      <h2>Notice Board</h2>

      <form className="notice-form" onSubmit={handleAddNotice}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button type="submit">Add Notice</button>
      </form>
      {message && <p className="message">{message}</p>}

      <ul className="notice-list">
        {notices.map((notice) => (
          <li key={notice.id}>
            <h4>{notice.title}</h4>
            <p>{notice.description}</p>
            <p>
              <em>{new Date(notice.date).toLocaleDateString()}</em>
            </p>
            <button onClick={() => handleDelete(notice.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNotices;
