package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, String> {
    List<Meeting> findByType(String type);
    List<Meeting> findTop5ByScheduledDateGreaterThanEqualOrderByScheduledDateAsc(Date now);
    List<Meeting> findTop5ByOrderByScheduledDateDesc();
}
