package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AdminRepository extends MongoRepository<Admin, String> {
    Optional<Admin> findByEmail(String email);
}

