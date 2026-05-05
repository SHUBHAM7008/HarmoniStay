import React, { useCallback, useEffect, useState } from 'react';
import { getMembers, deleteMember } from '../service/memberService';
import { getFlats } from '../service/flatService'; // fetch available flats
import { IoCloseOutline } from 'react-icons/io5';
import AddMember from './AddMember';
import AdminMemberDetails from './AdminMemberDetails';
import './AdminMembers.css';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null); 
  const [selectedFlat, setSelectedFlat] = useState('All');
  const [message, setMessage] = useState('');
  const [dialog, setDialog] = useState({ type: null, member: null });

  const applyFlatFilter = useCallback((sourceMembers, flatValue) => {
    if (flatValue === 'All') {
      setFilteredMembers(sourceMembers);
    } else {
      setFilteredMembers(sourceMembers.filter(m => m.flatNo === flatValue));
    }
  }, []);

  const loadMembers = useCallback(async () => {
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
    } catch (err) {
      console.error('Error loading members:', err);
      setMessage('Unable to load members.');
    }
  }, []);

  const loadFlats = useCallback(async () => {
    try {
      const data = await getFlats();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error loading flats:', err);
      setMessage('Unable to load flats.');
    }
  }, []);

  useEffect(() => {
    loadMembers();
    loadFlats();
  }, [loadMembers, loadFlats]);

  useEffect(() => {
    applyFlatFilter(members, selectedFlat);
  }, [applyFlatFilter, members, selectedFlat]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);
        setSelectedMemberId(null);
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

  const handleMemberAdded = async () => {
    setDialog({ type: null, member: null });
    setMessage('Member added successfully.');
    await loadMembers();
    await loadFlats();
  };

  const handleMemberUpdated = async () => {
    setMessage('Member updated successfully.');
    await loadMembers();
    await loadFlats();
  };

  const closeDialog = () => setDialog({ type: null, member: null });

  const selectedDialogMemberId = dialog.member?.email || dialog.member?.id;

  return (
    <div className="admin-members-container">
      {dialog.type && (
        <div className="member-dialog" role="dialog" aria-modal="true" aria-label="Member dialog">
          <div className={`member-dialog__panel member-dialog__panel--${dialog.type}`}>
            <button
              type="button"
              className="member-dialog__close"
              onClick={closeDialog}
              aria-label="Close dialog"
            >
              <IoCloseOutline aria-hidden="true" />
            </button>
            {dialog.type === 'add' && <AddMember isDialog onMemberAdded={handleMemberAdded} />}
            {dialog.type === 'details' && (
              <AdminMemberDetails
                isDialog
                memberId={selectedDialogMemberId}
                onUpdated={handleMemberUpdated}
              />
            )}
            {dialog.type === 'edit' && (
              <AdminMemberDetails
                isDialog
                initialEditing
                memberId={selectedDialogMemberId}
                onUpdated={handleMemberUpdated}
              />
            )}
          </div>
        </div>
      )}
  
      <div className="top-bar">
        <p>Manage all society members here.</p>
        <button className="btn btn-blue" onClick={() => setDialog({ type: 'add', member: null })}>
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
                    <div className="action-buttons">
                      <button className="btn btn-green" onClick={() => setDialog({ type: 'edit', member: m })}>Edit</button>
                      <button className="btn btn-red" onClick={() => handleDelete(m.id)}>Delete</button>
                      <button className="btn btn-cyan" onClick={() => setDialog({ type: 'details', member: m })}>Details</button>
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
