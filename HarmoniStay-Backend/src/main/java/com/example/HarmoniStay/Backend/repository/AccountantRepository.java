package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Accountant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountantRepository extends JpaRepository<Accountant, String> {
    Optional<Accountant> findByEmail(String email);
    boolean existsByEmail(String email);
}
