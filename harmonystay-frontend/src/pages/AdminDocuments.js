import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./AdminDocuments.css";

const AdminDocuments = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("REGISTRATION");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await axios.post("http://localhost:8888/api/documents", {
        title,
        category,
        description,
        fileUrl: fileUrl || "#",
        uploadedBy: user?.firstName || "Admin",
      });
      setTitle(""); setDescription(""); setFileUrl("");
      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDoc = async (id) => {
    if (window.confirm("Delete this document?")) {
      await axios.delete(`http://localhost:8888/api/documents/${id}`);
      loadDocuments();
    }
  };

  return (
    <div className="admin-documents-container">
      <h2>Document Repository</h2>
      <form className="doc-form" onSubmit={handleUpload}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="REGISTRATION">Registration</option>
          <option value="NOC">NOC</option>
          <option value="AGM_REPORT">AGM Report</option>
          <option value="MINUTES">Minutes</option>
          <option value="OTHER">Other</option>
        </select>
        <input placeholder="File URL (optional)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Add Document</button>
      </form>
      <div className="doc-list">
        {documents.map((d) => (
          <div key={d.id} className="doc-card">
            <h4>{d.title}</h4>
            <p><strong>Category:</strong> {d.category}</p>
            <p>{d.description}</p>
            {d.fileUrl && d.fileUrl !== "#" && (
              <a href={d.fileUrl} target="_blank" rel="noreferrer">View / Download</a>
            )}
            <button className="del" onClick={() => deleteDoc(d.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDocuments;
