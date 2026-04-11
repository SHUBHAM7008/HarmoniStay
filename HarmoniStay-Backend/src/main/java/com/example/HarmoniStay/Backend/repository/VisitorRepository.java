package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Visitor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VisitorRepository extends MongoRepository<Visitor, String> {
    List<Visitor> findByFlatId(String flatId);
}
