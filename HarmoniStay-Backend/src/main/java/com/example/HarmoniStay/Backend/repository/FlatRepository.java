package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Flat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlatRepository extends JpaRepository<Flat, String> {
    Optional<Flat> findByFlatNumber(String flatNumber);
    Optional<Flat> findByOwnerId(String ownerId);
}
