import React, { useEffect, useState } from "react";
import CommonLoader from "../components/CommonLoader";
import StatusDialog from "../components/StatusDialog";
import { addNotice, deleteNotice, getNotices } from "../service/noticeService";
import "./AdminNotices.css";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const data = await getNotices();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const getFriendlyErrorMessage = (err) => {
    if (!err.response) {
      return "Unable to connect to the server. Please check your connection and try again.";
    }

    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      "We could not add the notice right now. Please try again in a moment."
    );
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setDialog({
        open: true,
        type: "error",
        title: "Missing details",
        message: "Please enter both the notice title and description.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addNotice({
        title: title.trim(),
        description: description.trim(),
        date: new Date(),
        createdBy: "Admin",
      });
      setTitle("");
      setDescription("");
      await loadNotices();
      setDialog({
        open: true,
        type: "success",
        title: "Notice added",
        message: "Notice is added successfully.",
      });
    } catch (err) {
      console.error(err);
      setDialog({
        open: true,
        type: "error",
        title: "Notice not added",
        message: getFriendlyErrorMessage(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      await deleteNotice(id);
      loadNotices();
    }
  };

  return (
    <div className="admin-notices-container">
      <CommonLoader show={isLoading} message="Adding notice..." />
      <StatusDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />

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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Notice"}
        </button>
      </form>

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
