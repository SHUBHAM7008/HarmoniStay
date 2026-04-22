package com.example.HarmoniStay.Backend.controller;
import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.FlatOwnershipHistory;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import com.example.HarmoniStay.Backend.service.FlatService;
import com.example.HarmoniStay.Backend.service.MemberService;
import com.example.HarmoniStay.Backend.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*") // allow frontend
public class MemberController {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MemberService memberService;

    @Autowired
    private FlatService flatService;

    // GET /api/members
    @GetMapping
    public List<Member> getMembers() {
        return memberService.getAllMembers();
    }

    // POST /api/members
    @PostMapping
    public ResponseEntity<?> addMember(@RequestBody Member member) {
        if (member.getRole() != null && "ACCOUNTANT".equalsIgnoreCase(member.getRole())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Accountants are managed separately. Use Admin → Accountants to create an accountant."));
        }
        if (member.getRole() != null && "ADMIN".equalsIgnoreCase(member.getRole())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Admins cannot be created as members. Use the admins table / admin setup."));
        }
        Member savedMember = memberService.addMember(member);

        // Update flat status
        if (member.getFlatId() != null && !member.getFlatId().isEmpty()) {
            System.out.print("hello");
            flatService.updateFlatStatus(member.getFlatId(), Flat.Status.OCCUPIED);
        }

        return ResponseEntity.ok(savedMember);
    }


    // DELETE /api/members/{id}
    @DeleteMapping("/{id}")
    public void deleteMember(@PathVariable String id) {
        memberService.deleteMember(id);
    }

    @GetMapping("/{email}")
    public Optional<Member> getMemberById(@PathVariable String email) {
        return memberService.getMemberByEmail(email);
    }

    @GetMapping("/{memberId}/ownership-history")
    public List<FlatOwnershipHistory> getMemberOwnershipHistory(@PathVariable String memberId) {
        return flatService.getOwnershipHistoryByMember(memberId);
    }

    // PUT /api/members/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMember(@PathVariable String id, @RequestBody Member updatedMember) {
        try {
            return ResponseEntity.ok(memberService.updateMember(id, updatedMember));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Autowired
    private OTPService otpService;

    // Generate OTP
    @PostMapping("/send-otp/{id}")
    public String sendOtp(@PathVariable String id) {
        System.out.print("sendding ");
        Member member = memberRepository.findById(id).orElse(null);
        if (member == null) return "Member not found";

        otpService.generateOTP("+91"+member.getPhone());
        return "OTP sent";
    }

    // Verify OTP and change password
    @PostMapping("/change-password/{id}")
    public String changePassword(@PathVariable String id, @RequestBody Map<String, String> body) {
        Member member = memberRepository.findById(id).orElse(null);
        if (member == null) return "Member not found";

        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (!otpService.verifyOTP("+91"+member.getPhone(), otp)) {
            return "Invalid OTP";
        }

        member.setPassword(newPassword); // plaintext as requested
        memberRepository.save(member);
        return "Password changed successfully";
    }
}
