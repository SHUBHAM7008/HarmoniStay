package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private FlatService flatService;

    @Autowired
    private SmsService smsService;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    @Transactional
    public Member addMember(Member member) {
        if (member.getRole() != null && "ACCOUNTANT".equalsIgnoreCase(member.getRole())) {
            throw new IllegalArgumentException("Accountants are not stored as members");
        }
        String welcomePassword = member.getPassword();
        member.setId(null);
        Member saved = memberRepository.save(member);
        if (saved.getFlatId() != null && !saved.getFlatId().isBlank()) {
            try {
                flatService.assignFlatToMember(saved.getFlatId(), saved.getId());
            } catch (Exception e) {
                throw new RuntimeException("Failed to auto-assign flat while creating member", e);
            }
        }
        Member result = memberRepository.findById(saved.getId()).orElse(saved);
        scheduleMemberWelcomeSms(result, welcomePassword);
        return result;
    }

    private void scheduleMemberWelcomeSms(Member member, String plainPassword) {
        if (!StringUtils.hasText(member.getPhone())) {
            return;
        }
        final String phone = member.getPhone().trim();
        final String flatNo = StringUtils.hasText(member.getFlatId()) ? member.getFlatId().trim() : "";
        final String password = plainPassword != null ? plainPassword.trim() : "";
        final String email = member.getEmail() != null ? member.getEmail().trim() : "";

        Runnable send = () -> smsService.sendMemberCredentialsSms(phone, flatNo, password, email);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    send.run();
                }
            });
        } else {
            send.run();
        }
    }

    public void deleteMember(String id) {
        memberRepository.deleteById(id);
    }

    public Optional<Member> getMemberByEmail(String id) {
        return memberRepository.findByEmail(id);
    }

    @Transactional
    public Member updateMember(String id, Member updatedMember) {
        Member existing = memberRepository.findByEmail(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));
        String previousFlatId = existing.getFlatId();

        // Update only if the new value is not null
        if (updatedMember.getFirstName() != null) existing.setFirstName(updatedMember.getFirstName());
        if (updatedMember.getLastName() != null) existing.setLastName(updatedMember.getLastName());
        if (updatedMember.getEmail() != null) existing.setEmail(updatedMember.getEmail());
        if (updatedMember.getPhone() != null) existing.setPhone(updatedMember.getPhone());
        if (updatedMember.getRole() != null) {
            if ("ACCOUNTANT".equalsIgnoreCase(updatedMember.getRole())) {
                throw new IllegalArgumentException("Cannot set member role to ACCOUNTANT");
            }
            existing.setRole(updatedMember.getRole());
        }
        if (updatedMember.getStatus() != null) existing.setStatus(updatedMember.getStatus());
        if (updatedMember.getFlatId() != null) existing.setFlatId(updatedMember.getFlatId());
        if (updatedMember.getProfileImage() != null) existing.setProfileImage(updatedMember.getProfileImage());
        if (updatedMember.getDateOfJoining() != null) existing.setDateOfJoining(updatedMember.getDateOfJoining());
        if (updatedMember.getEmergencyContact() != null) existing.setEmergencyContact(updatedMember.getEmergencyContact());
        if (updatedMember.getFamilyMembers() != null) existing.setFamilyMembers(updatedMember.getFamilyMembers());
        Member saved = memberRepository.save(existing);

        String currentFlatId = saved.getFlatId();
        boolean flatChanged = currentFlatId != null && !currentFlatId.isBlank() &&
                (previousFlatId == null || !previousFlatId.equals(currentFlatId));

        if (flatChanged) {
            try {
                flatService.assignFlatToMember(currentFlatId, saved.getId());
            } catch (Exception e) {
                throw new RuntimeException("Failed to auto-assign flat while updating member", e);
            }
        } else if ((currentFlatId == null || currentFlatId.isBlank()) &&
                previousFlatId != null && !previousFlatId.isBlank()) {
            flatService.clearOwnershipForMember(saved.getId());
        }

        return saved;
    }
}

