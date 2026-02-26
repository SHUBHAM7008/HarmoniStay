package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.ParkingSlot;
import com.example.HarmoniStay.Backend.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository repository;

    // Get all parking slots
    public List<ParkingSlot> getAllSlots() {
        return repository.findAll();
    }

    // Add new slot
    public ParkingSlot addSlot(ParkingSlot slot) {
        Date now = new Date();
        slot.setCreatedAt(now);
        slot.setUpdatedAt(now);
        return repository.save(slot);
    }

    // Update slot (optional, e.g., vehicle assignment)
    public ParkingSlot updateSlot(String id, ParkingSlot updatedSlot) {
        return repository.findById(id).map(slot -> {
            slot.setSlotNumber(updatedSlot.getSlotNumber());
            slot.setFlatId(updatedSlot.getFlatId());
            slot.setVehicleNumber(updatedSlot.getVehicleNumber());
            slot.setVehicleType(updatedSlot.getVehicleType());
            slot.setMonthlyCharge(updatedSlot.getMonthlyCharge());
            slot.setUpdatedAt(new Date());
            return repository.save(slot);
        }).orElseThrow(() -> new RuntimeException("Slot not found"));
    }

    public List<ParkingSlot> getSlotsByFlat(String flatId) {
        return repository.findByFlatId(flatId);
    }

    public ParkingSlot updatePayment(String slotId, String status, String month) {
        ParkingSlot slot = repository.findById(slotId).orElseThrow();
        slot.setPaymentStatus(status);
        slot.setPaymentMonth(month);
        slot.setUpdatedAt(new Date());
        return repository.save(slot);
    }

}
