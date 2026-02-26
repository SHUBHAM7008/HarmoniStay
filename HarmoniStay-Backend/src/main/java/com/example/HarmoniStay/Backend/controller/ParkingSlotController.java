package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.ParkingSlot;
import com.example.HarmoniStay.Backend.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "*") // allow React frontend to access
public class ParkingSlotController {

    @Autowired
    private ParkingSlotService service;

    // Get all parking slots
    @GetMapping("/all")
    public List<ParkingSlot> getAllSlots() {
        return service.getAllSlots();
    }

    // Add a new parking slot
    @PostMapping("/add")
    public ParkingSlot addSlot(@RequestBody ParkingSlot slot)
    {
        return service.addSlot(slot);
    }

    // Update a parking slot
    @PutMapping("/update/{id}")
    public ParkingSlot updateSlot(@PathVariable String id, @RequestBody ParkingSlot slot) {
        return service.updateSlot(id, slot);
    }

    @GetMapping("/byFlat/{flatId}")
    public List<ParkingSlot> getSlotsByFlat(@PathVariable String flatId) {
        return service.getSlotsByFlat(flatId);
    }

    @PutMapping("/updatePayment/{slotId}")
    public ParkingSlot updatePayment(
            @PathVariable String slotId,
            @RequestParam String status,
            @RequestParam String month) {
        return service.updatePayment(slotId, status, month);
    }

}
