import React, { useEffect, useState } from 'react';
import { getMemberById, updateMember } from '../service/memberService';
import { useParams } from 'react-router-dom';
import './AdminMemberDetails.css';
import { useNavigate } from 'react-router-dom';

export default function AdminMemberDetails() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      const data = await getMemberById(id);
      setMember(data);
      console.log(data);
      setEditData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || '',
        status: data.status || '',
        flatId: data.flat || '',
        profileImage: data.profileImage || '',
        dateOfJoining: data.dateOfJoining || '',
        emergencyContactName: data.emergencyContact?.name || '',
        emergencyContactPhone: data.emergencyContact?.phone || '',
        emergencyContactRelation: data.emergencyContact?.relation || '',
      });
    } catch (err) {
      console.error('Error loading member:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMember(id, editData);
      setEditing(false);
      await loadMember();
      alert('Member updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (!member) return <p className="loading">Loading member details...</p>;

  return (
    <div className="admin-member-details-container">
      <div className="member-card">
        <div className="profile-header">
          <img
            src={member.profileImage || '/default-avatar.png'}
            alt="Profile"
            className="profile-image"
          />
          <div className="profile-basic">
            <h2>{member.firstName} {member.lastName}</h2>
            <p className={`role-badge ${member.role.toLowerCase()}`}>{member.role}</p>
            <p className="status">{member.status}</p>
          </div>
        </div>

        {editing ? (
          <div className="edit-form">
            <section>
              <h3>Personal Info</h3>
              <div className="form-grid">
                <input type="text" name="firstName" value={editData.firstName} onChange={handleInputChange} placeholder="First Name" />
                <input type="text" name="lastName" value={editData.lastName} onChange={handleInputChange} placeholder="Last Name" />
                <input type="email" name="email" value={editData.email} onChange={handleInputChange} placeholder="Email" />
                <input type="text" name="phone" value={editData.phone} onChange={handleInputChange} placeholder="Phone" />
              </div>
            </section>

            <section>
              <h3>Account Info</h3>
              <div className="form-grid">
                <input type="text" name="role" value={editData.role} onChange={handleInputChange} placeholder="Role" />
                <input type="text" name="status" value={editData.status} onChange={handleInputChange} placeholder="Status" />
                <input type="text" name="flatId" value={editData.flatId} onChange={handleInputChange} placeholder="Flat ID" />
                <input type="text" name="dateOfJoining" value={editData.dateOfJoining} onChange={handleInputChange} placeholder="Date of Joining" />
                <input type="text" name="profileImage" value={editData.profileImage} onChange={handleInputChange} placeholder="Profile Image URL" />
              </div>
            </section>

            <section>
              <h3>Emergency Contact</h3>
              <div className="form-grid">
                <input type="text" name="emergencyContactName" value={editData.emergencyContactName} onChange={handleInputChange} placeholder="Name" />
                <input type="text" name="emergencyContactPhone" value={editData.emergencyContactPhone} onChange={handleInputChange} placeholder="Phone" />
                <input type="text" name="emergencyContactRelation" value={editData.emergencyContactRelation} onChange={handleInputChange} placeholder="Relation" />
              </div>
            </section>

            <div className="form-actions">
              <button className="btn btn-save" onClick={handleSave}>Save</button>
              <button className="btn btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="member-info">
            <section>
              <h3>Personal Info</h3>
              <p><strong>Email:</strong> {member.email}</p>
              <p><strong>Phone:</strong> {member.phone}</p>
              <p><strong>Flat ID:</strong> {member.flat}</p>
              <p><strong>Date of Joining:</strong> {member.dateOfJoining}</p>
            </section>

            {member.emergencyContact && (
              <section>
                <h3>Emergency Contact</h3>
                <p>{member.emergencyContact.name} | {member.emergencyContact.phone} | {member.emergencyContact.relation}</p>
              </section>
            )}

            {member.familyMembers && member.familyMembers.length > 0 && (
              <section>
                <h3>Family Members</h3>
                <ul>
                  {member.familyMembers.map((f, idx) => (
                    <li key={idx}>{f.name} | {f.age} | {f.relation}</li>
                  ))}
                </ul>
              </section>
            )}

            <div className="member-actions">
              <button className="btn btn-edit" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-edit" onClick={() => navigate(-1)}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
