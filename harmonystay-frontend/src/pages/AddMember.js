import React, { useState, useEffect } from "react";
import "./AddMember.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const AddMember = () => {
  const [flats, setFlats] = useState([]); // for dropdown
   const navigate = useNavigate();
  const [member, setMember] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    flatId: "",
    role: "MEMBER",
    status: "ACTIVE",
    profileImage: "",
    emergencyContact: { name: "", phone: "", relation: "" },
    familyMembers: [{ name: "", age: "", relation: "" }],
    dateOfJoining: "",
  });

  // Fetch Flats on mount
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await axios.get("http://localhost:8888/api/flats");
        setFlats(res.data);
      } catch (err) {
        console.error("Error fetching flats:", err);
      }
    };
    fetchFlats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setMember({
      ...member,
      emergencyContact: { ...member.emergencyContact, [name]: value },
    });
  };

  const handleFamilyChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFamily = [...member.familyMembers];
    updatedFamily[index][name] = value;
    setMember({ ...member, familyMembers: updatedFamily });
  };

  const addFamilyMember = () => {
    setMember({
      ...member,
      familyMembers: [...member.familyMembers, { name: "", age: "", relation: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8888/api/members", member);
      alert("✅ Member added successfully!");
      setMember({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        flatId: "",
        role: "MEMBER",
        status: "ACTIVE",
        profileImage: "",
        emergencyContact: { name: "", phone: "", relation: "" },
        familyMembers: [{ name: "", age: "", relation: "" }],
        dateOfJoining: "",
      });
    } catch (error) {
      console.error("❌ Error adding member:", error);
      alert("Failed to add member.");
    }
  };

  return (
    <div className="add-member-container">
      <div className="form-card">
        <h1 className="form-title">Add Member</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={member.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={member.password} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={member.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={member.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={member.phone} onChange={handleChange} required />
            </div>

           <div className="form-group">
              <label>Flat</label>
              <select name="flatId" value={member.flatId} onChange={handleChange} required>
                <option value="">Select Flat</option>
                {flats
                  .filter(flat => flat.status !== "OCCUPIED") // filter out occupied flats
                  .map((flat) => (
                    <option key={flat.id} value={flat.flatNumber}>
                      {flat.wing}-{flat.flatNumber} ({flat.type})
                    </option>
                  ))}
              </select>
            </div>


          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={member.role} onChange={handleChange}>
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
                <option value="ACCOUNTANT">Accountant</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={member.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Profile Image URL</label>
            <input type="text" name="profileImage" value={member.profileImage} onChange={handleChange} />
          </div>

          <div className="section-title">Emergency Contact</div>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={member.emergencyContact.name} onChange={handleEmergencyChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={member.emergencyContact.phone} onChange={handleEmergencyChange} />
            </div>
            <div className="form-group">
              <label>Relation</label>
              <input type="text" name="relation" value={member.emergencyContact.relation} onChange={handleEmergencyChange} />
            </div>
          </div>

          <div className="section-title">Family Members</div>
          {member.familyMembers.map((fm, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={fm.name} onChange={(e) => handleFamilyChange(index, e)} />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={fm.age} onChange={(e) => handleFamilyChange(index, e)} />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <input type="text" name="relation" value={fm.relation} onChange={(e) => handleFamilyChange(index, e)} />
              </div>
            </div>
          ))}
          <button type="button" className="add-family-btn" onClick={addFamilyMember}>
            + Add Family Member
          </button>

          <div className="form-group">
            <label>Date of Joining</label>
            <input type="date" name="dateOfJoining" value={member.dateOfJoining} onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">Add Member</button>
           <button
              type="button"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
