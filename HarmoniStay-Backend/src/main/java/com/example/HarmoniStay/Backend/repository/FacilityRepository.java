package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface FacilityRepository extends JpaRepository<Facility, String> {
    List<Facility> findByUserId(String userId);

    @Query("SELECT f FROM Facility f WHERE f.name = :name AND f.bookingDate = :bookingDate")
    List<Facility> findByNameAndBookingDate(@Param("name") String name, @Param("bookingDate") Date bookingDate);
}
