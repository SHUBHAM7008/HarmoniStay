import React, { useEffect, useState } from 'react';
import { getMembers, deleteMember, updateMember } from '../service/memberService';
import { getFlats } from '../service/flatService'; // fetch available flats
import { useNavigate } from 'react-router-dom';
import './AdminMembers.css';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null); 
  const [selectedFlat, setSelectedFlat] = useState('All');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    flatId: '',
    status: 'ACTIVE',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadMembers();
    loadFlats();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await getMembers();
      const membersWithId = data.map(m => ({
        ...m,
        id: m._id || m.id,
        phone: m.phone || 'N/A',
        name: [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email,
        flatNo: m.flatId ? `${m.flatId}` : 'Not Assigned'
      }));
      setMembers(membersWithId);
      applyFlatFilter(membersWithId, selectedFlat);
    } catch (err) {
      console.error('Error loading members:', err);
      setMessage('Unable to load members.');
    }
  };

  const loadFlats = async () => {
    try {
      const data = await getFlats();
      setFlats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading flats:', err);
      setMessage('Unable to load flats.');
    }
  };

  const applyFlatFilter = (sourceMembers, flatValue) => {
    if (flatValue === 'All') {
      setFilteredMembers(sourceMembers);
    } else {
      setFilteredMembers(sourceMembers.filter(m => m.flatNo === flatValue));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);
        setSelectedMemberId(null);
        setEditingMemberId(null);
        setMessage('Member deleted successfully.');
        await loadMembers();
        await loadFlats(); // refresh flats
      } catch (err) {
        console.error('Error deleting member:', err);
        setMessage('Unable to delete member.');
      }
    }
  };

  const handleRowClick = (id) => {
    setSelectedMemberId(selectedMemberId === id ? null : id);
  };

  // Handle flat filter dropdown change
  const handleFlatFilter = (e) => {
    const selected = e.target.value;
    setSelectedFlat(selected);
    applyFlatFilter(members, selected);
  };

  const startEdit = (member) => {
    setEditingMemberId(member.id);
    setEditForm({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phone: member.phone === 'N/A' ? '' : member.phone || '',
      flatId: member.flatId || '',
      status: member.status || 'ACTIVE',
    });
  };

  const cancelEdit = () => {
    setEditingMemberId(null);
    setEditForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      flatId: '',
      status: 'ACTIVE',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (member) => {
    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        flatId: editForm.flatId,
        status: editForm.status,
      };
      await updateMember(member.id || member.email, payload);
      setMessage('Member updated successfully.');
      cancelEdit();
      await loadMembers();
      await loadFlats();
    } catch (err) {
      console.error('Error updating member:', err);
      setMessage('Unable to update member.');
    }
  };

  const editableFlatsFor = (member) => {
    return flats.filter((flat) => flat.status !== 'OCCUPIED' || flat.flatNumber === member.flatId);
  };

  return (
    <div className="admin-members-container">
  
      <div className="top-bar">
        <p>Manage all society members here.</p>
        <button className="btn btn-blue" onClick={() => navigate(`/admin/addmember`)}>
          + Add Member
        </button>
      </div>
      {message && <div className="member-message">{message}</div>}

      {/* Single Dropdown Filter */}
      <div className="filter-bar">
        <label htmlFor="flatFilter">Filter by Flat:</label>
        <select id="flatFilter" value={selectedFlat} onChange={handleFlatFilter}>
          <option value="All">All Flats</option>
          {[...new Set(members.map(m => m.flatNo))].map(flat => (
            <option key={flat} value={flat}>{flat}</option>
          ))}
        </select>
      </div>

      <table className="members-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Flat</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length > 0 ? filteredMembers.map((m, i) => (
            <React.Fragment key={m.id || i}>
              <tr onClick={() => handleRowClick(m.id)} className="member-row">
                <td>{i + 1}</td>
                <td>{m.name}</td>
                <td>{m.flatNo}</td>
                <td>{m.email}</td>
                <td>{m.phone}</td>
              </tr>

              {selectedMemberId === m.id && (
                <tr className="action-row">
                  <td colSpan="5">
                    {editingMemberId === m.id ? (
                      <div className="member-edit-panel">
                        <div className="member-edit-grid">
                          <input name="firstName" value={editForm.firstName} onChange={handleEditChange} placeholder="First name" />
                          <input name="lastName" value={editForm.lastName} onChange={handleEditChange} placeholder="Last name" />
                          <input name="email" type="email" value={editForm.email} onChange={handleEditChange} placeholder="Email" />
                          <input name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="Phone" />
                          <select name="flatId" value={editForm.flatId} onChange={handleEditChange}>
                            <option value="">Not Assigned</option>
                            {editableFlatsFor(m).map((flat) => (
                              <option key={flat.id} value={flat.flatNumber}>
                                {flat.wing ? `${flat.wing}-` : ''}{flat.flatNumber} ({flat.type || flat.status})
                              </option>
                            ))}
                          </select>
                          <select name="status" value={editForm.status} onChange={handleEditChange}>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                          </select>
                        </div>
                        <div className="action-buttons">
                          <button className="btn btn-green" onClick={() => handleSaveEdit(m)}>Save</button>
                          <button className="btn btn-red" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn btn-green" onClick={() => startEdit(m)}>Edit</button>
                        <button className="btn btn-red" onClick={() => handleDelete(m.id)}>Delete</button>
                        <button className="btn btn-cyan" onClick={() => navigate(`/admin/member/${m.email}`)}>Details</button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          )) : (
            <tr>
              <td colSpan="5" className="no-members">No members found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
