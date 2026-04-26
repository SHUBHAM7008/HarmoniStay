package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.VisitorRequest;
import com.example.HarmoniStay.Backend.service.VisitorRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitor-requests")
@CrossOrigin(origins = "*")
public class VisitorRequestController {

    @Autowired
    private VisitorRequestService visitorRequestService;

    @GetMapping("/validate-flat/{flatNumber}")
    public Map<String, Object> validateFlat(@PathVariable String flatNumber) {
        return visitorRequestService.validateFlat(flatNumber);
    }

    @PostMapping("/security")
    public VisitorRequest createBySecurity(@RequestBody Map<String, String> payload) {
        return visitorRequestService.createRequest(payload);
    }

    @GetMapping("/security")
    public List<VisitorRequest> getAllForSecurity() {
        return visitorRequestService.getAllForSecurity();
    }

    @GetMapping("/member/{memberId}/pending")
    public List<VisitorRequest> getPendingForMember(@PathVariable String memberId) {
        return visitorRequestService.getPendingForMember(memberId);
    }

    @PutMapping("/{requestId}/respond")
    public VisitorRequest respond(
            @PathVariable String requestId,
            @RequestParam String memberId,
            @RequestParam String status,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String responseNote = payload != null ? payload.get("responseNote") : null;
        return visitorRequestService.respondRequest(requestId, memberId, status, responseNote);
    }
}
