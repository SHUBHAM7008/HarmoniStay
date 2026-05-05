import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaHome, FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import "./CreateFlat.css";

const API = "http://localhost:8888/api/flats";

const emptyFlatForm = {
  flatNumber: "",
  wing: "",
  floor: "",
  area: "",
  amount: "",
  type: "BHK1",
  status: "VACANT",
};

const CreateFlat = () => {
  const [flats, setFlats] = useState([]);
  const [form, setForm] = useState(emptyFlatForm);
  const [dialog, setDialog] = useState({ type: null, flat: null });
  const [message, setMessage] = useState("");

  const loadFlats = useCallback(async () => {
    try {
      const res = await axios.get(API);
      setFlats(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMessage("Unable to load flats.");
    }
  }, []);

  useEffect(() => {
    loadFlats();
  }, [loadFlats]);

  const openAddDialog = () => {
    setMessage("");
    setForm(emptyFlatForm);
    setDialog({ type: "add", flat: null });
  };

  const openEditDialog = (flat) => {
    setMessage("");
    setForm({
      flatNumber: flat.flatNumber || "",
      wing: flat.wing || "",
      floor: flat.floor ?? "",
      area: flat.area ?? "",
      amount: flat.amount ?? "",
      type: flat.type || "BHK1",
      status: flat.status || "VACANT",
    });
    setDialog({ type: "edit", flat });
  };

  const closeDialog = () => {
    setDialog({ type: null, flat: null });
    setForm(emptyFlatForm);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    flatNumber: form.flatNumber.trim(),
    wing: form.wing.trim(),
    floor: Number.parseInt(form.floor, 10),
    area: Number.parseFloat(form.area),
    amount: Number.parseInt(form.amount, 10),
    type: form.type,
    status: form.status,
  });

  const validateForm = () => {
    if (!form.flatNumber.trim() || !form.wing.trim() || !form.floor || !form.area || !form.amount) {
      setMessage("Please fill all required flat fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    try {
      const payload = buildPayload();
      if (dialog.type === "edit" && dialog.flat?.id) {
        await axios.put(`${API}/${dialog.flat.id}`, payload);
        setMessage("Flat updated successfully.");
      } else {
        await axios.post(API, payload);
        setMessage("Flat created successfully.");
      }
      closeDialog();
      await loadFlats();
    } catch (err) {
      console.error(err);
      setMessage(dialog.type === "edit" ? "Error updating flat." : "Error creating flat.");
    }
  };

  const handleDelete = async (flat) => {
    if (!window.confirm(`Delete flat ${flat.flatNumber}?`)) return;
    try {
      await axios.delete(`${API}/${flat.id}`);
      setMessage("Flat deleted successfully.");
      await loadFlats();
    } catch (err) {
      console.error(err);
      setMessage("Unable to delete flat.");
    }
  };

  return (
    <div className="create-flat-container">
      {dialog.type && (
        <div className="flat-dialog" role="dialog" aria-modal="true" aria-label="Flat dialog">
          <div className="flat-dialog__panel">
            <button
              type="button"
              className="flat-dialog__close"
              onClick={closeDialog}
              aria-label="Close dialog"
            >
              <IoCloseOutline aria-hidden="true" />
            </button>
            <form className="create-flat-form" onSubmit={handleSubmit}>
              <h3>{dialog.type === "edit" ? "Edit flat" : "Add flat"}</h3>
              <label>
                Flat Number *
                <input
                  type="text"
                  value={form.flatNumber}
                  onChange={(e) => handleChange("flatNumber", e.target.value)}
                  required
                />
              </label>
              <label>
                Wing *
                <input
                  type="text"
                  value={form.wing}
                  onChange={(e) => handleChange("wing", e.target.value)}
                  required
                />
              </label>
              <label>
                Floor *
                <input
                  type="number"
                  value={form.floor}
                  onChange={(e) => handleChange("floor", e.target.value)}
                  required
                />
              </label>
              <label>
                Area (sqft) *
                <input
                  type="number"
                  value={form.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  required
                />
              </label>
              <label>
                Amount (Rs.) *
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  required
                />
              </label>
              <label>
                Type
                <select value={form.type} onChange={(e) => handleChange("type", e.target.value)}>
                  <option value="BHK1">BHK1</option>
                  <option value="BHK2">BHK2</option>
                  <option value="BHK3">BHK3</option>
                  <option value="BHK4">BHK4</option>
                  <option value="PENTHOUSE">Penthouse</option>
                </select>
              </label>
              <label>
                Status
                <select value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                  <option value="VACANT">Vacant</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="UNDER_RENOVATION">Under Renovation</option>
                </select>
              </label>
              <div className="flat-dialog__actions">
                <button type="submit" className="flat-primary-btn">
                  <FaSave /> {dialog.type === "edit" ? "Save flat" : "Create flat"}
                </button>
                <button type="button" className="flat-secondary-btn" onClick={closeDialog}>
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flat-top-bar">
        <div>
          <h2><FaHome /> Flats</h2>
          <p>Manage every society flat and its occupancy status.</p>
        </div>
        <button type="button" className="flat-primary-btn" onClick={openAddDialog}>
          <FaPlus /> Add Flat
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="flat-table-wrap">
        <table className="flats-table">
          <thead>
            <tr>
              <th>Flat</th>
              <th>Wing</th>
              <th>Floor</th>
              <th>Type</th>
              <th>Area</th>
              <th>Amount</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {flats.length === 0 ? (
              <tr>
                <td colSpan={8} className="flat-empty">No flats found.</td>
              </tr>
            ) : (
              flats.map((flat) => (
                <tr key={flat.id}>
                  <td>{flat.flatNumber}</td>
                  <td>{flat.wing}</td>
                  <td>{flat.floor}</td>
                  <td>{flat.type}</td>
                  <td>{flat.area} sqft</td>
                  <td>Rs. {Number(flat.amount || 0).toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`flat-status flat-status--${String(flat.status || "").toLowerCase()}`}>
                      {flat.status}
                    </span>
                  </td>
                  <td>
                    <div className="flat-actions">
                      <button
                        type="button"
                        className="flat-icon-action"
                        title="Edit"
                        aria-label={`Edit flat ${flat.flatNumber}`}
                        onClick={() => openEditDialog(flat)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="flat-icon-action flat-icon-action--danger"
                        title="Delete"
                        aria-label={`Delete flat ${flat.flatNumber}`}
                        onClick={() => handleDelete(flat)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateFlat;
