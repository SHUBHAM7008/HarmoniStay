package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Accountant;
import com.example.HarmoniStay.Backend.model.Admin;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.AccountantRepository;
import com.example.HarmoniStay.Backend.repository.AdminRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AdminRepository adminRepo;

    @Autowired
    private MemberRepository memberRepo;

    @Autowired
    private AccountantRepository accountantRepo;

    // ✅ Return Admin object or null
    public Admin loginAdmin(String email, String password) {
        Admin admin = adminRepo.findByEmail(email).orElse(null);
        if (admin != null && admin.getPassword().equals(password)) {
            return admin;
        }
        return null;
    }

    // ✅ Return Member object or null (flat number login)
    public Member loginMember(String flatNo, String password) {
        Member member = memberRepo.findByFlatId(flatNo).orElse(null);
        if (member == null || !member.getPassword().equals(password)) {
            return null;
        }
        if ("ACCOUNTANT".equalsIgnoreCase(member.getRole())) {
            return null;
        }
        return member;
    }

    /** Accountant login — separate `accountants` table (not members). */
    public Accountant loginAccountant(String email, String password) {
        if (email == null || password == null) return null;
        Accountant a = accountantRepo.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (a != null && "ACTIVE".equalsIgnoreCase(a.getStatus()) && a.getPassword().equals(password)) {
            return a;
        }
        return null;
    }
}
