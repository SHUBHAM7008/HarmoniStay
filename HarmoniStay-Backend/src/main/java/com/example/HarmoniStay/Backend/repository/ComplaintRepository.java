package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    List<Complaint> findByUserId(String userId);
    List<Complaint> findByStatus(String status);
}
