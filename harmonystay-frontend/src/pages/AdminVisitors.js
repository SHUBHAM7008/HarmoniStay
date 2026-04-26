import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./AdminVisitors.css";

const AdminVisitors = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatId, setFlatId] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/visitors");
      setVisitors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogEntry = async (e) => {
    e.preventDefault();
    if (!visitorName || !flatId) return;
    try {
      await axios.post("http://localhost:8888/api/visitors", {
        visitorName,
        phone,
        flatId,
        purpose,
        entryTime: new Date(),
        loggedBy: user?.firstName || "Admin",
      });
      setVisitorName(""); setPhone(""); setFlatId(""); setPurpose("");
      loadVisitors();
    } catch (err) {
      console.error(err);
    }
  };

  const logExit = async (id) => {
    await axios.put(`http://localhost:8888/api/visitors/${id}/exit`);
    loadVisitors();
  };

  return (
    <div className="admin-visitors-container">
      <h2>Visitor Log</h2>
      <form className="visitor-form" onSubmit={handleLogEntry}>
        <input placeholder="Visitor Name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Flat Visiting" value={flatId} onChange={(e) => setFlatId(e.target.value)} required />
        <input placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        <button type="submit">Log Entry</button>
      </form>
      <table className="visitors-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Flat</th>
            <th>Purpose</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((v) => (
            <tr key={v.id}>
              <td>{v.visitorName}</td>
              <td>{v.phone}</td>
              <td>{v.flatId}</td>
              <td>{v.purpose}</td>
              <td>{v.entryTime ? new Date(v.entryTime).toLocaleString() : "-"}</td>
              <td>{v.exitTime ? new Date(v.exitTime).toLocaleString() : "-"}</td>
              <td>
                {!v.exitTime && <button onClick={() => logExit(v.id)}>Log Exit</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminVisitors;
