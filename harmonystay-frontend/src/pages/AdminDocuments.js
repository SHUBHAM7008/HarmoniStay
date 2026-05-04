import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaDownload, FaEye, FaFileAlt, FaFileUpload, FaTrash } from "react-icons/fa";
import "./AdminDocuments.css";

const API_BASE = "http://localhost:8888/api/documents";
const ADMIN_HEADERS = { "X-User-Role": "ADMIN" };

const AdminDocuments = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("REGISTRATION");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await axios.get(API_BASE, { headers: ADMIN_HEADERS });
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) return;
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("description", description.trim());
    formData.append("uploadedBy", user?.firstName || "Admin");
    formData.append("visibility", "ALL_MEMBERS");

    try {
      await axios.post(API_BASE, formData, { headers: ADMIN_HEADERS });
      setTitle("");
      setDescription("");
      setFile(null);
      e.target.reset();
      setMessage("Document uploaded successfully.");
      await loadDocuments();
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id) => {
    if (window.confirm("Delete this document?")) {
      await axios.delete(`${API_BASE}/${id}`, { headers: ADMIN_HEADERS });
      loadDocuments();
    }
  };

  const getDownloadName = (doc) => doc.originalFileName || `${doc.title || "document"}`;

  const openDocumentBlob = async (doc, shouldDownload) => {
    const previewWindow = shouldDownload ? null : window.open("", "_blank");
    if (previewWindow) {
      previewWindow.opener = null;
    }

    try {
      const endpoint = shouldDownload ? "download" : "view";
      const res = await axios.get(`${API_BASE}/${doc.id}/${endpoint}`, {
        headers: ADMIN_HEADERS,
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(res.data);

      if (shouldDownload) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = getDownloadName(doc);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        if (previewWindow) {
          previewWindow.location.href = blobUrl;
        } else {
          window.open(blobUrl, "_blank", "noopener,noreferrer");
        }
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error(err);
      if (previewWindow) {
        previewWindow.close();
      }
      setMessage("Unable to open document.");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="admin-documents-container">
      <h2><FaFileAlt /> Document Repository</h2>
      <form className="doc-form" onSubmit={handleUpload}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="REGISTRATION">Registration</option>
          <option value="NOC">NOC</option>
          <option value="AGM_REPORT">AGM Report</option>
          <option value="MINUTES">Minutes</option>
          <option value="OTHER">Other</option>
        </select>
        <label className="doc-file-input">
          <FaFileUpload />
          <span>{file ? file.name : "Choose document file"}</span>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        </label>
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" disabled={uploading}>
          <FaFileUpload /> {uploading ? "Uploading..." : "Upload Document"}
        </button>
        {message && <p className="doc-message">{message}</p>}
      </form>
      <div className="doc-list">
        {documents.map((d) => (
          <div key={d.id} className="doc-card">
            <div className="doc-actions" aria-label={`Actions for ${d.title}`}>
              <button type="button" className="doc-icon-action" title="View" onClick={() => openDocumentBlob(d, false)}>
                <FaEye />
              </button>
              <button type="button" className="doc-icon-action" title="Download" onClick={() => openDocumentBlob(d, true)}>
                <FaDownload />
              </button>
              <button type="button" className="doc-icon-action doc-icon-action--danger" title="Delete" onClick={() => deleteDoc(d.id)}>
                <FaTrash />
              </button>
            </div>
            <div className="doc-card-header">
              <div>
                <h4 className="doc-card-title">{d.title}</h4>
                <p className="doc-card-meta">
                  {d.category} | {formatSize(d.fileSize)} | {d.originalFileName || "Uploaded document"}
                </p>
              </div>
              <span className="doc-status">{d.verificationStatus || "PENDING"}</span>
            </div>
            {d.description && <p>{d.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDocuments;
