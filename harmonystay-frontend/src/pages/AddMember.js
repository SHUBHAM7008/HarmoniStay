import React, { useEffect, useState } from "react";
import { addMember as createMember } from "../service/memberService";
import { getFlats } from "../service/flatService";
import "./AddMember.css";

const emptyMember = {
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
};

const AddMember = ({ isDialog = false, onMemberAdded }) => {
  const [flats, setFlats] = useState([]);
  const [member, setMember] = useState(emptyMember);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const data = await getFlats();
        setFlats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching flats:", err);
        setMessage("Unable to load available flats. Please try again.");
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
    setIsSubmitting(true);
    setMessage("");
    let keepFormMounted = true;

    try {
      await createMember(member);
      if (onMemberAdded) {
        keepFormMounted = false;
        await onMemberAdded();
        return;
      }

      setMember(emptyMember);
      setMessage("Member added successfully.");
    } catch (error) {
      console.error("Error adding member:", error);
      setMessage("Unable to add member. Please check the details and try again.");
    } finally {
      if (keepFormMounted) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={`add-member-container${isDialog ? " add-member-container--dialog" : ""}`}>
      <div className="form-card">
        <h1 className="form-title" id="add-member-dialog-title">Add Member</h1>
        {message && <p className="add-member-message">{message}</p>}

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
                  .filter((flat) => flat.status !== "OCCUPIED")
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
                <option value="MEMBER">Member</option>
              </select>
              <small className="form-hint">Accountants are created from Admin - Accountants.</small>
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
              <input
                type="text"
                name="name"
                value={member.emergencyContact.name}
                onChange={handleEmergencyChange}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={member.emergencyContact.phone}
                onChange={handleEmergencyChange}
              />
            </div>
            <div className="form-group">
              <label>Relation</label>
              <input
                type="text"
                name="relation"
                value={member.emergencyContact.relation}
                onChange={handleEmergencyChange}
              />
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
                <input
                  type="text"
                  name="relation"
                  value={fm.relation}
                  onChange={(e) => handleFamilyChange(index, e)}
                />
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

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
