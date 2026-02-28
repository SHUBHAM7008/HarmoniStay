// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DualLoginPage from './pages/DualLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminMemberDetails from './pages/AdminMemberDetails';
import AssignFlat from './pages/AssignFlat';
import CreateFlat from './pages/CreateFlat';
import AddMember from './pages/AddMember';
import AdminBills from './pages/AdminBills';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<DualLoginPage />} />

          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/member/:id" element={<AdminMemberDetails />} />
           <Route path="/admin/assignflat" element={<AssignFlat />} />
          <Route path="/admin/createflat" element={<CreateFlat />} />
          <Route path="/admin/addmember" element={<AddMember />} />
           <Route path="/admin-bills" element={<AdminBills />} />
          

          {/* You can add member dashboard route here later */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
