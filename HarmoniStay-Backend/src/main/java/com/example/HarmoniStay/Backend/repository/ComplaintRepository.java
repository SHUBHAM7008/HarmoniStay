package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    List<Complaint> findByUserId(String userId);
    List<Complaint> findByStatus(String status);
}
