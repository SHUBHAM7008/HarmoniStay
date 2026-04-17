package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, String> {
    List<Meeting> findByType(String type);
}
