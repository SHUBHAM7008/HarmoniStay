import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import StatusDialog from "../components/StatusDialog";
import "./AdminAccountants.css";

const API = "http://localhost:8888/api/accountants";

const emptyEditForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  status: "ACTIVE",
};

const isNetworkError = (err) => {
  return err?.message === "Network Error" || (!err?.response && err?.request);
};

const AdminAccountants = () => {
  const [list, setList] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [dialog, setDialog] = useState({
    open: false,
    type: "error",
    title: "",
    message: "",
  });

  const showNetworkError = useCallback(() => {
    setDialog({
      open: true,
      type: "error",
      title: "Network Error",
      message: "Network Error",
    });
  }, []);

  const getErrorMessage = (err, fallback) => {
    if (isNetworkError(err)) {
      showNetworkError();
      return "Network Error";
    }
    const msg = err.response?.data?.message || err.message || fallback;
    return typeof msg === "string" ? msg : fallback;
  };

  const load = useCallback(async () => {
    try {
      const res = await axios.get(API);
      setList(res.data || []);
    } catch (e) {
      console.error(e);
      if (isNetworkError(e)) showNetworkError();
    }
  }, [showNetworkError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await axios.post(API, {
        email,
        password,
        firstName: firstName || "Accountant",
        lastName: lastName || "",
        phone: phone || null,
        status: "ACTIVE",
      });
      setMessage("Accountant created.");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPhone("");
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create accountant"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this accountant? They will no longer be able to log in.")) return;
    try {
      await axios.delete(`${API}/${id}`);
      if (editingId === id) setEditingId(null);
      load();
    } catch (e) {
      setError(getErrorMessage(e, "Could not delete accountant"));
    }
  };

  const startEdit = (accountant) => {
    setMessage("");
    setError("");
    setEditingId(accountant.id);
    setEditForm({
      email: accountant.email || "",
      password: "",
      firstName: accountant.firstName || "",
      lastName: accountant.lastName || "",
      phone: accountant.phone || "",
      status: accountant.status || "ACTIVE",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyEditForm);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (id) => {
    setMessage("");
    setError("");
    try {
      await axios.put(`${API}/${id}`, editForm);
      setMessage("Accountant updated.");
      cancelEdit();
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update accountant"));
    }
  };

  return (
    <div className="admin-accountants-container">
      <StatusDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
      <h2>Accountants</h2>
      <p className="admin-accountants-intro">
        Accountants use their own table and log in with <strong>email + password</strong> (not flat number).
      </p>

      <form className="accountant-form" onSubmit={handleSubmit}>
        <h3>Add accountant</h3>
        <div className="accountant-form-row">
          <label>
            Email *
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password *
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </div>
        <div className="accountant-form-row">
          <label>
            First name *
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label>
            Last name
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
          <label>
            Phone
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>
        <button type="submit">Create accountant</button>
      </form>

      {message && <p className="acct-msg success">{message}</p>}
      {error && <p className="acct-msg error">{error}</p>}

      <h3>Existing accountants</h3>
      <div className="table-wrap">
        <table className="accountants-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5}>No accountants yet.</td>
              </tr>
            )}
            {list.map((accountant) => {
              const isEditing = editingId === accountant.id;

              return (
                <tr key={accountant.id}>
                  <td>
                    {isEditing ? (
                      <div className="accountant-edit-name">
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => handleEditChange("firstName", e.target.value)}
                          aria-label="First name"
                        />
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => handleEditChange("lastName", e.target.value)}
                          aria-label="Last name"
                        />
                      </div>
                    ) : (
                      `${accountant.firstName} ${accountant.lastName || ""}`
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditChange("email", e.target.value)}
                        aria-label="Email"
                      />
                    ) : (
                      accountant.email
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => handleEditChange("phone", e.target.value)}
                        aria-label="Phone"
                      />
                    ) : (
                      accountant.phone || "-"
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => handleEditChange("status", e.target.value)}
                        aria-label="Status"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    ) : (
                      accountant.status
                    )}
                  </td>
                  <td>
                    <div className="accountant-actions">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="acct-icon-action"
                            title="Save"
                            aria-label={`Save accountant ${accountant.email}`}
                            onClick={() => handleUpdate(accountant.id)}
                          >
                            <FaSave />
                          </button>
                          <button
                            type="button"
                            className="acct-icon-action acct-icon-action--muted"
                            title="Cancel"
                            aria-label={`Cancel editing ${accountant.email}`}
                            onClick={cancelEdit}
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="acct-icon-action"
                          title="Edit"
                          aria-label={`Edit accountant ${accountant.email}`}
                          onClick={() => startEdit(accountant)}
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        type="button"
                        className="acct-icon-action acct-icon-action--danger"
                        title="Remove"
                        aria-label={`Remove accountant ${accountant.email}`}
                        onClick={() => handleDelete(accountant.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccountants;
