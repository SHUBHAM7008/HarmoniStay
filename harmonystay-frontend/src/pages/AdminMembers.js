import React, { useEffect, useState } from 'react';
import { getMembers, addMember, deleteMember } from '../service/memberService';
import { getFlats } from '../service/flatService'; // fetch available flats
import { useNavigate } from 'react-router-dom';
import './AdminMembers.css';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [newMember, setNewMember] = useState({ firstName: '', flatId: '', email: '', phone: '', password: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null); 
  const [selectedFlat, setSelectedFlat] = useState('All');
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
        name: m.firstName,
        flatNo: m.flatId ? `${m.flatId}` : 'Not Assigned'
      }));
      setMembers(membersWithId);
      setFilteredMembers(membersWithId);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  const loadFlats = async () => {
    try {
      const data = await getFlats();
      const availableFlats = data.filter(f => f.status !== 'OCCUPIED'); // only vacant or under renovation
      setFlats(availableFlats);
    } catch (err) {
      console.error('Error loading flats:', err);
    }
  };

  const handleAdd = async () => {
    // your add logic will go here
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      await deleteMember(id);
      loadMembers();
      loadFlats(); // refresh flats
    }
  };

  const handleRowClick = (id) => {
    setSelectedMemberId(selectedMemberId === id ? null : id);
  };

  // Handle flat filter dropdown change
  const handleFlatFilter = (e) => {
    const selected = e.target.value;
    setSelectedFlat(selected);

    if (selected === 'All') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(m => m.flatNo === selected);
      setFilteredMembers(filtered);
    }
  };

  return (
    <div className="admin-members-container">
  
      <div className="top-bar">
        <p>Manage all society members here.</p>
        <button className="btn btn-blue" onClick={() => navigate(`/admin/addmember`)}>
          {showAddForm ? 'Close' : '+ Add Member'}
        </button>
      </div>

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
                    <div className="action-buttons">
                      <button className="btn btn-green" onClick={() => alert('Edit functionality pending')}>Edit</button>
                      <button className="btn btn-red" onClick={() => handleDelete(m.id)}>Delete</button>
                      <button className="btn btn-cyan" onClick={() => navigate(`/admin/member/${m.email}`)}>Details</button>
                    </div>
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
