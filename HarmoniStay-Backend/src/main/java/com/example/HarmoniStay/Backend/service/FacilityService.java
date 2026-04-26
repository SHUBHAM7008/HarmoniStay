package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Facility;
import com.example.HarmoniStay.Backend.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    public Facility createBooking(Facility facility) {
        List<Facility> existing = facilityRepository.findByNameAndBookingDate(
            facility.getName(), facility.getBookingDate());
        boolean slotTaken = existing.stream()
            .filter(f -> "BOOKED".equals(f.getStatus()))
            .anyMatch(f -> facility.getTimeSlot().equals(f.getTimeSlot()));
        if (slotTaken) {
            throw new IllegalStateException("This time slot is already booked");
        }
        facility.setStatus("BOOKED");
        facility.setCreatedAt(new Date());
        return facilityRepository.save(facility);
    }

    public List<Facility> getAllBookings() {
        return facilityRepository.findAll();
    }

    public List<Facility> getBookingsByUser(String userId) {
        return facilityRepository.findByUserId(userId);
    }

    public List<Facility> getBookingsByFacilityAndDate(String name, Date date) {
        return facilityRepository.findByNameAndBookingDate(name, date);
    }

    public Optional<Facility> getById(String id) {
        return facilityRepository.findById(id);
    }

    public Facility cancelBooking(String id) {
        Facility f = facilityRepository.findById(id).orElseThrow();
        f.setStatus("CANCELLED");
        return facilityRepository.save(f);
    }

    public void deleteBooking(String id) {
        facilityRepository.deleteById(id);
    }
}
