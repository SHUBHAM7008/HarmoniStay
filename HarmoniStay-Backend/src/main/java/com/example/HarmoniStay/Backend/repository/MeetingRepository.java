package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Meeting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MeetingRepository extends MongoRepository<Meeting, String> {
    List<Meeting> findByType(String type);
}
