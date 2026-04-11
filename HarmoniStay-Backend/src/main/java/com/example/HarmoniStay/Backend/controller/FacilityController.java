package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Facility;
import com.example.HarmoniStay.Backend.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "*")
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    @GetMapping
    public List<Facility> getAllBookings() {
        return facilityService.getAllBookings();
    }

    @GetMapping("/user/{userId}")
    public List<Facility> getByUser(@PathVariable String userId) {
        return facilityService.getBookingsByUser(userId);
    }

    @GetMapping("/availability")
    public List<Facility> getByFacilityAndDate(
            @RequestParam String name,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        return facilityService.getBookingsByFacilityAndDate(name, date);
    }

    @PostMapping
    public Facility create(@RequestBody Facility facility) {
        return facilityService.createBooking(facility);
    }

    @PutMapping("/{id}/cancel")
    public Facility cancel(@PathVariable String id) {
        return facilityService.cancelBooking(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        facilityService.deleteBooking(id);
    }
}
