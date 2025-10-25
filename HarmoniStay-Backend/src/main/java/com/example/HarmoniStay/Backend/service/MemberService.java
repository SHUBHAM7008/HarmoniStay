package com.example.HarmoniStay.Backend.service;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member addMember(Member member) {
        return memberRepository.save(member);
    }

    public void deleteMember(String id) {
        memberRepository.deleteById(id);
    }

    public Optional<Member> getMemberByEmail(String id) {
        return memberRepository.findByEmail(id);
    }

    public Member updateMember(String id, Member updatedMember) {
        Member existing = memberRepository.findByEmail(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));

        // Update only if the new value is not null
        if (updatedMember.getFirstName() != null) existing.setFirstName(updatedMember.getFirstName());
        if (updatedMember.getLastName() != null) existing.setLastName(updatedMember.getLastName());
        if (updatedMember.getEmail() != null) existing.setEmail(updatedMember.getEmail());
        if (updatedMember.getPhone() != null) existing.setPhone(updatedMember.getPhone());
        if (updatedMember.getRole() != null) existing.setRole(updatedMember.getRole());
        if (updatedMember.getStatus() != null) existing.setStatus(updatedMember.getStatus());
        if (updatedMember.getFlatId() != null) existing.setFlatId(updatedMember.getFlatId());
        if (updatedMember.getProfileImage() != null) existing.setProfileImage(updatedMember.getProfileImage());
        if (updatedMember.getDateOfJoining() != null) existing.setDateOfJoining(updatedMember.getDateOfJoining());
        if (updatedMember.getEmergencyContact() != null) existing.setEmergencyContact(updatedMember.getEmergencyContact());
        if (updatedMember.getFamilyMembers() != null) existing.setFamilyMembers(updatedMember.getFamilyMembers());
        if (updatedMember.getUpdatedAt() != null) existing.setUpdatedAt(updatedMember.getUpdatedAt());
        return memberRepository.save(existing);
    }
}

