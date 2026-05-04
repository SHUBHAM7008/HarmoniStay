package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.model.VisitorRequest;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import com.example.HarmoniStay.Backend.repository.VisitorRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VisitorRequestService {

    @Autowired
    private VisitorRequestRepository visitorRequestRepository;

    @Autowired
    private MemberRepository memberRepository;

    public Map<String, Object> validateFlat(String flatNumber) {
        Map<String, Object> out = new HashMap<>();
        if (flatNumber == null || flatNumber.isBlank()) {
            out.put("valid", false);
            out.put("message", "Flat number is required");
            return out;
        }

        Member member = memberRepository.findByFlatId(flatNumber.trim()).orElse(null);
        if (member == null) {
            out.put("valid", false);
            out.put("message", "No member found for this flat number");
            return out;
        }

        out.put("valid", true);
        out.put("flatNumber", member.getFlatId());
        out.put("memberId", member.getId());
        out.put("memberName", ((member.getFirstName() != null ? member.getFirstName() : "") + " " +
                (member.getLastName() != null ? member.getLastName() : "")).trim());
        return out;
    }

    public VisitorRequest createRequest(Map<String, String> payload) {
        String flatNumber = payload.get("flatNumber");
        String visitorName = payload.get("visitorName");
        String purpose = payload.get("purpose");
        String category = payload.get("category");
        if (flatNumber == null || flatNumber.isBlank()) {
            throw new RuntimeException("Flat number is required");
        }
        if (visitorName == null || visitorName.isBlank()) {
            throw new RuntimeException("Visitor name is required");
        }
        if (purpose == null || purpose.isBlank()) {
            throw new RuntimeException("Purpose is required");
        }

        Member owner = memberRepository.findByFlatId(flatNumber.trim())
                .orElseThrow(() -> new RuntimeException("No member found with this flat number"));

        VisitorRequest vr = new VisitorRequest();
        vr.setFlatNumber(owner.getFlatId());
        vr.setMemberId(owner.getId());
        String ownerName = ((owner.getFirstName() != null ? owner.getFirstName() : "") + " " +
                (owner.getLastName() != null ? owner.getLastName() : "")).trim();
        vr.setMemberName(ownerName);
        vr.setVisitorName(visitorName.trim());
        vr.setPurpose(purpose.trim());
        vr.setCategory(category != null && !category.isBlank() ? category.trim() : "etc");
        vr.setSecurityName(payload.getOrDefault("securityName", "Security"));
        vr.setSecurityId(payload.get("securityId"));
        vr.setStatus(VisitorRequest.RequestStatus.PENDING);
        return visitorRequestRepository.save(vr);
    }

    public List<VisitorRequest> getAllForSecurity() {
        return visitorRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<VisitorRequest> getPendingForMember(String memberId) {
        return visitorRequestRepository.findByMemberIdAndStatusOrderByCreatedAtDesc(
                memberId, VisitorRequest.RequestStatus.PENDING
        );
    }

    public VisitorRequest respondRequest(String requestId, String memberId, String status, String responseNote) {
        VisitorRequest vr = visitorRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!vr.getMemberId().equals(memberId)) {
            throw new RuntimeException("You are not allowed to respond to this request");
        }

        VisitorRequest.RequestStatus requestStatus = VisitorRequest.RequestStatus.valueOf(status.toUpperCase());
        if (requestStatus == VisitorRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Invalid response status");
        }
        vr.setStatus(requestStatus);
        vr.setResponseNote(responseNote);
        vr.setRespondedAt(Instant.now().toString());
        return visitorRequestRepository.save(vr);
    }
}
