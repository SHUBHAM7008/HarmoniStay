package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.ParkingSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends MongoRepository<ParkingSlot, String> {
    // Find by slotNumber if needed
    ParkingSlot findBySlotNumber(String slotNumber);
    List<ParkingSlot> findByFlatId(String flatId);
}
