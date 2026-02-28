import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AssignFlat.css";

const AssignFlat = () => {
  const [members, setMembers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedFlat, setSelectedFlat] = useState("");
  const [message, setMessage] = useState("");

  // Fetch members from backend
  useEffect(() => {
    axios
      .get("http://localhost:8888/api/members") // change to your endpoint
      .then((res) => setMembers(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Fetch flats from backend
  useEffect(() => {
    axios
      .get("http://localhost:8888/api/flats") // change to your endpoint
      .then((res) => setFlats(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedFlat) {
      setMessage("Please select both member and flat.");
      return;
    }

    const payload = {
      memberId: selectedMember,
      flatId: selectedFlat,
    };

    axios
      .post("http://localhost:8888/api/flats/assign", payload) // backend endpoint to assign flat
      .then((res) => {
        setMessage("Flat assigned successfully!");
        setSelectedMember("");
        setSelectedFlat("");
      })
      .catch((err) => {
        console.log(err);
        setMessage("Error assigning flat.");
      });
  };

  return (
    <div className="assign-flat-container">
      <h2>Assign Flat to Member</h2>
      <form className="assign-flat-form" onSubmit={handleSubmit}>
        <label>
          Select Member:
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="">-- Select Member --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} ({m.flat || "No Flat Assigned"})
              </option>
            ))}
          </select>
        </label>

        <label>
          Select Flat:
          <select
            value={selectedFlat}
            onChange={(e) => setSelectedFlat(e.target.value)}
          >
            <option value="">-- Select Flat --</option>
            {flats
              .filter((f) => f.status !== "OCCUPIED") // show only available flats
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flatNumber} - {f.wing} ({f.type})
                </option>
              ))}
          </select>
        </label>

        <button type="submit">Assign Flat</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AssignFlat;
