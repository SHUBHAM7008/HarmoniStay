package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.SocietyDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DocumentRepository extends MongoRepository<SocietyDocument, String> {
    List<SocietyDocument> findByCategory(String category);
}
