import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./AdminDocuments.css";

const formatLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const AdminDocuments = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("REGISTRATION");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadDocuments = async () => {
      try {
        const response = await axios.get("http://localhost:8888/api/documents");

        if (!cancelled) {
          setDocuments(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!title) {
      return;
    }

    try {
      await axios.post("http://localhost:8888/api/documents", {
        title,
        category,
        description,
        fileUrl: fileUrl || "#",
        uploadedBy: user?.firstName || "Admin",
      });

      setTitle("");
      setDescription("");
      setFileUrl("");
      setReloadKey((value) => value + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this document?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8888/api/documents/${id}`);
      setReloadKey((value) => value + 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-documents-container">
      <div className="admin-documents__header">
        <div>
          <p className="admin-documents__eyebrow">Knowledge hub</p>
          <h2>Document repository</h2>
          <p>Publish society records with clearer categorization and easier resident access.</p>
        </div>
      </div>

      <div className="admin-documents__layout">
        <form className="doc-form" onSubmit={handleUpload}>
          <h3>Add document</h3>
          <input
            placeholder="Document title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="REGISTRATION">Registration</option>
            <option value="NOC">NOC</option>
            <option value="AGM_REPORT">AGM Report</option>
            <option value="MINUTES">Minutes</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            placeholder="File URL (optional)"
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button type="submit">Add document</button>
        </form>

        <div className="doc-list">
          {documents.length === 0 ? (
            <div className="admin-documents__empty">No documents have been added yet.</div>
          ) : (
            documents.map((document) => (
              <article key={document.id} className="doc-card">
                <div className="doc-card__top">
                  <span className="doc-card__category">{formatLabel(document.category)}</span>
                  <span className="doc-card__author">
                    {document.uploadedBy || "Admin upload"}
                  </span>
                </div>

                <h4>{document.title}</h4>
                <p>{document.description || "No description provided."}</p>

                <div className="doc-card__actions">
                  {document.fileUrl && document.fileUrl !== "#" && (
                    <a href={document.fileUrl} target="_blank" rel="noreferrer">
                      View document
                    </a>
                  )}
                  <button type="button" className="del" onClick={() => deleteDocument(document.id)}>
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

export default AdminDocuments;
