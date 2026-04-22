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

    // ✅ Return Member object or null (supports flat or email login)
    public Member loginMember(String identifier, String password) {
        if (identifier == null || password == null) {
            return null;
        }

        String normalizedIdentifier = identifier.trim();
        String normalizedPassword = password.trim();

        Member member = memberRepo.findByFlatId(normalizedIdentifier).orElse(null);
        if (member == null) {
            member = memberRepo.findByEmail(normalizedIdentifier).orElse(null);
        }

        if (member == null || member.getPassword() == null || !member.getPassword().trim().equals(normalizedPassword)) {
            return null;
        }
        if ("ACCOUNTANT".equalsIgnoreCase(member.getRole())) {
            return null;
        }
        return member;
    }

    public Member loginSecurity(String email, String password) {
        if (email == null || password == null) {
            return null;
        }

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedPassword = password.trim();

        // Temporary dummy credential for Security login.
        if ("security@harmonistay.local".equals(normalizedEmail) && "security".equals(normalizedPassword)) {
            Member dummySecurity = new Member();
            dummySecurity.setId("security-dummy-1");
            dummySecurity.setEmail("security@harmonistay.local");
            dummySecurity.setFirstName("Security");
            dummySecurity.setLastName("Guard");
            dummySecurity.setRole("SECURITY");
            dummySecurity.setStatus("ACTIVE");
            return dummySecurity;
        }
        Member member = memberRepo.findByEmail(normalizedEmail).orElse(null);
        if (member == null || member.getPassword() == null || !member.getPassword().trim().equals(normalizedPassword)) {
            return null;
        }
        String role = member.getRole() != null ? member.getRole().trim() : "";
        if (!"SECURITY".equalsIgnoreCase(role) && !"SECURITY_GUARD".equalsIgnoreCase(role)) {
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
