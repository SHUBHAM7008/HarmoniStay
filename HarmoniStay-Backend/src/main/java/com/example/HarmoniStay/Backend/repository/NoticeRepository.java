package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Notice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeRepository extends MongoRepository<Notice, String> {
    // default CRUD methods
}
