package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Admin;
import com.example.HarmoniStay.Backend.model.Member;
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
        if (member != null && member.getPassword().equals(password)) {
            return member;
        }
        return null;
    }

    // ✅ Accountant login (email + password from members with role ACCOUNTANT)
    public Member loginAccountant(String email, String password) {
        Member member = memberRepo.findByEmail(email).orElse(null);
        if (member != null && "ACCOUNTANT".equalsIgnoreCase(member.getRole()) && member.getPassword().equals(password)) {
            return member;
        }
        return null;
    }
}
