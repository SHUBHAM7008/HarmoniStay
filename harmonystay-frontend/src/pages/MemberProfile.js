import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { updateMember } from "../service/memberService";

export default function MemberProfile({ user }) {
  const { updateUser } = useContext(AuthContext);
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFamily, setSavingFamily] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      emergencyContactName: user.emergencyContact?.name || "",
      emergencyContactPhone: user.emergencyContact?.phone || "",
      emergencyContactRelation: user.emergencyContact?.relation || "",
    });
    setFamilyMembers(
      Array.isArray(user.familyMembers) && user.familyMembers.length > 0
        ? user.familyMembers.map((member) => ({
            name: member.name || "",
            age: member.age || "",
            relation: member.relation || "",
          }))
        : []
    );
  }, [user]);

  useEffect(() => {
    const fetchFlat = async () => {
      if (!user?.flatId) return;
      try {
        const res = await axios.get(`http://localhost:8888/api/flats/${user.flatId}`);
        setFlat(res.data);
      } catch (err) {
        console.error("Error fetching flat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlat();
  }, [user]);

  const sendOtp = async () => {
    try {
      await axios.post(`http://localhost:8888/api/members/send-otp/${user.id}`);
      setOtpSent(true);
      setMessage("OTP sent to your registered phone.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send OTP.");
    }
  };

  const changePassword = async () => {
    try {
      const res = await axios.post(`http://localhost:8888/api/members/change-password/${user.id}`, {
        otp,
        newPassword,
      });
      setMessage(res.data);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to change password.");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setMessage("");

    try {
      const saved = await updateMember(user.id || user.email, {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        emergencyContact: {
          name: profileForm.emergencyContactName.trim(),
          phone: profileForm.emergencyContactPhone.trim(),
          relation: profileForm.emergencyContactRelation.trim(),
        },
      });
      updateUser(saved);
      setIsEditingProfile(false);
      setMessage("Personal details updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage(err.message || "Unable to update personal details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFamilyChange = (index, field, value) => {
    setFamilyMembers((prev) =>
      prev.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    );
  };

  const addFamilyMember = () => {
    setFamilyMembers((prev) => [...prev, { name: "", age: "", relation: "" }]);
    setIsEditingFamily(true);
  };

  const removeFamilyMember = (index) => {
    setFamilyMembers((prev) => prev.filter((_, memberIndex) => memberIndex !== index));
  };

  const saveFamilyMembers = async () => {
    setSavingFamily(true);
    setMessage("");

    const cleanedFamilyMembers = familyMembers
      .map((member) => ({
        name: member.name.trim(),
        age: member.age === "" ? 0 : Number(member.age),
        relation: member.relation.trim(),
      }))
      .filter((member) => member.name || member.age > 0 || member.relation);

    try {
      const saved = await updateMember(user.id || user.email, {
        familyMembers: cleanedFamilyMembers,
      });
      updateUser(saved);
      setFamilyMembers(cleanedFamilyMembers);
      setIsEditingFamily(false);
      setMessage("Family details updated successfully.");
    } catch (err) {
      console.error("Error updating family details:", err);
      setMessage(err.message || "Unable to update family details.");
    } finally {
      setSavingFamily(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>
  );

  return (
    <div className="pt-4 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-700">
      {/* Hero Section (Bento Style) */}
      <section className="mb-12">
        <div className="relative h-[320px] rounded-[32px] overflow-hidden bg-primary-container group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/70 to-transparent z-10"></div>
          <img 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2000ms]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgnFlirNabAKrU4VXeX5rEH9WU432xiUgNDZAG9HsmYYR8qH6KLEj9yntF3s7gabyXRv4RSk06uga4vPEBFmyHvP7SKK_TYNPftXCBGGR2IWoBX7LQ4knxFtmmlGpL85L0Lg1ptpvv98o9TMKA11HU-SmsPtF4Q3bEVzgxZoWIuXqAmYOySHkTs3kyvUp_AD9BVTiKHvNWC6bQR3W5luKwK9kAtIC1c3aWOLU617gw4oRzQiUMKhiaBRekQ8FuIoH8YKk98HGZlo0" 
          />
          <div className="relative z-20 h-full flex flex-col justify-end p-10">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl ring-4 ring-black/5 transition-transform group-hover:scale-105">
                  <img 
                    alt="Resident" 
                    className="w-full h-full object-cover" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300" 
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="bg-secondary/20 backdrop-blur-md text-secondary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-secondary/30">
                  {user.status === 'Active' ? 'Premium Member' : 'Member'}
                </span>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-300 font-bold text-xs uppercase tracking-[0.1em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  Resident ID: HST-2024-{user.id?.toString().padStart(4, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {message && (
        <div className="mb-8 rounded-2xl bg-secondary/10 border border-secondary/20 px-6 py-4 text-secondary text-sm font-black text-center">
          {message}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal & Flat */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Details Card */}
          <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-2xl">account_circle</span>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Personal Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile((prev) => !prev)}
                className="text-secondary hover:underline font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>
            {isEditingProfile ? (
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                    <input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-[0.2em] mb-5">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input name="emergencyContactName" placeholder="Name" value={profileForm.emergencyContactName} onChange={handleProfileChange} className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                    <input name="emergencyContactPhone" placeholder="Phone" value={profileForm.emergencyContactPhone} onChange={handleProfileChange} className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                    <input name="emergencyContactRelation" placeholder="Relation" value={profileForm.emergencyContactRelation} onChange={handleProfileChange} className="w-full bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={saveProfile}
                  className="bg-secondary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Personal Details"}
                </button>
              </div>
            ) : (
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-base font-extrabold text-on-surface">{user.firstName} {user.lastName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-base font-extrabold text-on-surface">{user.email || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-base font-extrabold text-on-surface">{user.phone || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</p>
                  <p className="text-base font-extrabold text-on-surface">{user.dateOfJoining || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                  <p className="text-base font-extrabold text-on-surface">
                    {user.emergencyContact?.name
                      ? `${user.emergencyContact.name} • ${user.emergencyContact.phone || "N/A"} • ${user.emergencyContact.relation || "N/A"}`
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                  <div className="flex">
                    <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black rounded-full border border-secondary/20 uppercase tracking-widest">
                      {user.status?.toUpperCase() || "ACTIVE RESIDENT"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Family Details Card */}
          <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-2xl">family_restroom</span>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Family Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingFamily((prev) => !prev)}
                className="text-secondary hover:underline font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {isEditingFamily ? "Cancel" : "Edit Family"}
              </button>
            </div>

            <div className="p-10 space-y-6">
              {isEditingFamily ? (
                <>
                  {familyMembers.length === 0 && (
                    <p className="text-sm font-bold text-slate-400">No family members added yet.</p>
                  )}
                  {familyMembers.map((familyMember, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_110px_1fr_44px] gap-4 items-center">
                      <input placeholder="Name" value={familyMember.name} onChange={(e) => handleFamilyChange(index, "name", e.target.value)} className="bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                      <input type="number" min="0" placeholder="Age" value={familyMember.age} onChange={(e) => handleFamilyChange(index, "age", e.target.value)} className="bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                      <input placeholder="Relation" value={familyMember.relation} onChange={(e) => handleFamilyChange(index, "relation", e.target.value)} className="bg-slate-50 border border-outline-variant/50 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary" />
                      <button type="button" onClick={() => removeFamilyMember(index)} className="h-11 rounded-xl bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={addFamilyMember} className="px-5 py-3 rounded-xl border-2 border-secondary text-secondary text-xs font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">
                      + Add Family Member
                    </button>
                    <button type="button" disabled={savingFamily} onClick={saveFamilyMembers} className="px-5 py-3 rounded-xl bg-secondary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-60 transition-all">
                      {savingFamily ? "Saving..." : "Save Family Details"}
                    </button>
                  </div>
                </>
              ) : familyMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyMembers.map((familyMember, index) => (
                    <div key={index} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="font-black text-on-surface">{familyMember.name || "Family Member"}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                        {familyMember.relation || "Relation N/A"} {familyMember.age ? `• Age ${familyMember.age}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-sm font-bold text-slate-400">No family members added yet.</p>
                  <button type="button" onClick={addFamilyMember} className="px-5 py-3 rounded-xl bg-secondary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all">
                    Add Family Member
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Flat Details Card */}
          {!loading && flat && (
            <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
              <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-2xl">domain</span>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Flat Details</h3>
              </div>
              <div className="p-10 grid grid-cols-2 md:grid-cols-3 gap-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flat Number</p>
                  <p className="text-2xl font-black text-on-primary-fixed tracking-tight">{flat.flatNumber || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wing/Block</p>
                  <p className="text-base font-extrabold text-on-surface uppercase tracking-tight">{flat.wing}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor</p>
                  <p className="text-base font-extrabold text-on-surface">{flat.floor} Floor</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area</p>
                  <p className="text-base font-extrabold text-on-surface">{flat.area} Sq. Ft.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flat Type</p>
                  <p className="text-base font-extrabold text-on-surface">{flat.type}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membership</p>
                  <p className="text-base font-extrabold text-on-surface">Registered Resident</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Security & Gallery */}
        <div className="lg:col-span-4 space-y-8">
          {/* Security Card */}
          <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-outline-variant/30">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
              <span className="material-symbols-outlined text-secondary text-2xl">security</span>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em]">Security & Privacy</h3>
            </div>
            <div className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-black text-on-surface">Password Control</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last changed 3 months ago</p>
                  </div>
                  {!otpSent ? (
                    <button 
                      onClick={sendOtp}
                      className="px-6 py-3 bg-on-primary-fixed text-on-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-on-primary-fixed/20"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-secondary uppercase animate-pulse">OTP Sent</span>
                  )}
                </div>
                
                {otpSent && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <input 
                      type="text" 
                      placeholder="Enter OTP" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                    <button 
                      onClick={changePassword}
                      className="w-full py-4 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary/20 active:scale-95 transition-all"
                    >
                      Update Password
                    </button>
                  </div>
                )}

                <div className="h-px bg-slate-100 w-full"></div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-on-surface">Two-Factor Auth</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended for security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox"/>
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      <footer className="mt-20 pt-10 border-t border-slate-100 text-center space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">HarmonyStay Society Management • Secure Resident Portal</p>
        <div className="flex justify-center gap-10">
          <button className="text-[10px] font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors">Privacy Policy</button>
          <button className="text-[10px] font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors">Terms of Service</button>
          <button className="text-[10px] font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors">Contact Support</button>
        </div>
      </footer>
    </div>
  );
}
