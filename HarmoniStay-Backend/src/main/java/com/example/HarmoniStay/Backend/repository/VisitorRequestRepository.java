package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.VisitorRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitorRequestRepository extends JpaRepository<VisitorRequest, String> {
    List<VisitorRequest> findByMemberIdAndStatusOrderByCreatedAtDesc(String memberId, VisitorRequest.RequestStatus status);
    List<VisitorRequest> findAllByOrderByCreatedAtDesc();
}
