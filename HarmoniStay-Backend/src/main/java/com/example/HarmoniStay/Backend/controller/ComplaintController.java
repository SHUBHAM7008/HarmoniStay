package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Complaint;
import com.example.HarmoniStay.Backend.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @GetMapping("/user/{userId}")
    public List<Complaint> getByUser(@PathVariable String userId) {
        return complaintService.getComplaintsByUser(userId);
    }

    @GetMapping("/status/{status}")
    public List<Complaint> getByStatus(@PathVariable String status) {
        return complaintService.getComplaintsByStatus(status);
    }

    @PostMapping
    public Complaint create(@RequestBody Complaint complaint) {
        return complaintService.createComplaint(complaint);
    }

    @PutMapping("/{id}/status")
    public Complaint updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return complaintService.updateStatus(
            id,
            body.getOrDefault("status", "PENDING"),
            body.get("adminFeedback")
        );
    }

    @PutMapping("/{id}/member-feedback")
    public Complaint submitMemberFeedback(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            return complaintService.submitMemberFeedback(
                    id,
                    body.get("userId"),
                    body.get("rating") == null ? null : Integer.parseInt(body.get("rating")),
                    body.get("description")
            );
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Rating must be a number between 1 and 5");
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        complaintService.deleteComplaint(id);
    }
}
