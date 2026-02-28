import React, { useState } from "react";
import axios from "axios";
import "./CreateFlat.css";

const CreateFlat = () => {
  const [flatNumber, setFlatNumber] = useState("");
  const [wing, setWing] = useState("");
  const [floor, setFloor] = useState("");
  const [area, setArea] = useState("");
  const [amount, setAmount] = useState(""); // new field
  const [type, setType] = useState("BHK1");
  const [status, setStatus] = useState("VACANT");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!flatNumber || !wing || !floor || !area || !amount) {
      setMessage("Please fill all required fields.");
      return;
    }

    const payload = {
      flatNumber,
      wing,
      floor: parseInt(floor),
      area: parseFloat(area),
      amount: parseInt(amount),
      type,
      status,
    };

    axios
      .post("http://localhost:8888/api/flats", payload) // backend endpoint
      .then((res) => {
        setMessage("Flat created successfully!");
        setFlatNumber("");
        setWing("");
        setFloor("");
        setArea("");
        setAmount("");
        setType("BHK1");
        setStatus("VACANT");
      })
      .catch((err) => {
        console.log(err);
        setMessage("Error creating flat.");
      });
  };

  return (
    <div className="create-flat-container">
      <h2>Create New Flat</h2>
      <form className="create-flat-form" onSubmit={handleSubmit}>
        <label>
          Flat Number:
          <input
            type="text"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
          />
        </label>

        <label>
          Wing:
          <input
            type="text"
            value={wing}
            onChange={(e) => setWing(e.target.value)}
          />
        </label>

        <label>
          Floor:
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />
        </label>

        <label>
          Area (sqft):
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </label>

        <label>
          Amount (₹):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="BHK1">BHK1</option>
            <option value="BHK2">BHK2</option>
            <option value="BHK3">BHK3</option>
            <option value="BHK4">BHK4</option>
            <option value="PENTHOUSE">Penthouse</option>
          </select>
        </label>

        <label>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="VACANT">Vacant</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="UNDER_RENOVATION">Under Renovation</option>
          </select>
        </label>

        <button type="submit">Create Flat</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default CreateFlat;
