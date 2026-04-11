package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Date;
import java.util.List;

public interface FacilityRepository extends MongoRepository<Facility, String> {
    List<Facility> findByUserId(String userId);
    List<Facility> findByNameAndBookingDate(String name, Date bookingDate);
}
