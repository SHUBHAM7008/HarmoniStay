import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminAccountants.css";

const API = "http://localhost:8888/api/accountants";

const AdminAccountants = () => {
  const [list, setList] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await axios.get(API);
      setList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      const msg = err.response?.data?.message || err.message || "Could not create accountant";
      setError(typeof msg === "string" ? msg : "Could not create accountant");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this accountant? They will no longer be able to log in.")) return;
    try {
      await axios.delete(`${API}/${id}`);
      load();
    } catch (e) {
      setError("Could not delete accountant");
    }
  };

  return (
    <div className="admin-accountants-container">
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5}>No accountants yet.</td>
              </tr>
            )}
            {list.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.firstName} {a.lastName || ""}
                </td>
                <td>{a.email}</td>
                <td>{a.phone || "—"}</td>
                <td>{a.status}</td>
                <td>
                  <button type="button" className="btn-del" onClick={() => handleDelete(a.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccountants;
