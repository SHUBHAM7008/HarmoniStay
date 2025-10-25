package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.BillCollection;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BillCollectionRepository extends MongoRepository<BillCollection, String> {
}
