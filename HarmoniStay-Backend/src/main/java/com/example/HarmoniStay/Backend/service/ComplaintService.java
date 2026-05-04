package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Complaint;
import com.example.HarmoniStay.Backend.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public Complaint createComplaint(Complaint complaint) {
        complaint.setStatus("PENDING");
        complaint.setCreatedAt(new Date());
        complaint.setUpdatedAt(new Date());
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getComplaintsByUser(String userId) {
        return complaintRepository.findByUserId(userId);
    }

    public List<Complaint> getComplaintsByStatus(String status) {
        return complaintRepository.findByStatus(status);
    }

    public Optional<Complaint> getById(String id) {
        return complaintRepository.findById(id);
    }

    public Complaint updateStatus(String id, String status, String adminFeedback) {
        Complaint c = complaintRepository.findById(id).orElseThrow();
        c.setStatus(status);
        if (adminFeedback != null) c.setAdminFeedback(adminFeedback);
        c.setUpdatedAt(new Date());
        return complaintRepository.save(c);
    }

    public Complaint submitMemberFeedback(String id, String userId, Integer rating, String description) {
        Complaint c = complaintRepository.findById(id).orElseThrow();
        if (userId == null || userId.isBlank() || !userId.equals(c.getUserId())) {
            throw new IllegalArgumentException("You are not allowed to give feedback for this complaint");
        }
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Feedback description is required");
        }

        c.setMemberFeedbackRating(rating);
        c.setMemberFeedbackDescription(description.trim());
        c.setMemberFeedbackAt(new Date());
        c.setUpdatedAt(new Date());
        return complaintRepository.save(c);
    }

    public void deleteComplaint(String id) {
        complaintRepository.deleteById(id);
    }
}
