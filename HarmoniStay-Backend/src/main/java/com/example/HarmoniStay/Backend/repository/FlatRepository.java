package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Flat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlatRepository extends MongoRepository<Flat, String> {
    Optional<Flat> findByFlatNumber(String id);
}

