package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Accountant;
import com.example.HarmoniStay.Backend.repository.AccountantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AccountantService {

    @Autowired
    private AccountantRepository accountantRepository;

    public List<Accountant> findAll() {
        return accountantRepository.findAll();
    }

    public Accountant create(Accountant input) {
        if (input.getEmail() == null || input.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (input.getPassword() == null || input.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (accountantRepository.existsByEmail(input.getEmail().trim().toLowerCase())) {
            throw new IllegalStateException("An accountant with this email already exists");
        }
        Accountant a = new Accountant();
        a.setEmail(input.getEmail().trim().toLowerCase());
        a.setPassword(input.getPassword());
        a.setFirstName(input.getFirstName() != null ? input.getFirstName().trim() : "Accountant");
        a.setLastName(input.getLastName() != null ? input.getLastName().trim() : "");
        a.setPhone(input.getPhone());
        a.setStatus(input.getStatus() != null ? input.getStatus() : "ACTIVE");
        a.setCreatedAt(new Date());
        return accountantRepository.save(a);
    }

    public Accountant update(String id, Accountant input) {
        Accountant existing = accountantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Accountant not found"));

        if (input.getEmail() == null || input.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        String normalizedEmail = input.getEmail().trim().toLowerCase();
        accountantRepository.findByEmail(normalizedEmail)
                .filter(accountant -> !accountant.getId().equals(id))
                .ifPresent(accountant -> {
                    throw new IllegalStateException("An accountant with this email already exists");
                });

        existing.setEmail(normalizedEmail);
        existing.setFirstName(input.getFirstName() != null && !input.getFirstName().isBlank()
                ? input.getFirstName().trim()
                : "Accountant");
        existing.setLastName(input.getLastName() != null ? input.getLastName().trim() : "");
        existing.setPhone(input.getPhone() != null && !input.getPhone().isBlank() ? input.getPhone().trim() : null);
        existing.setStatus(input.getStatus() != null && !input.getStatus().isBlank() ? input.getStatus() : "ACTIVE");

        if (input.getPassword() != null && !input.getPassword().isBlank()) {
            existing.setPassword(input.getPassword());
        }

        return accountantRepository.save(existing);
    }

    public void deleteById(String id) {
        accountantRepository.deleteById(id);
    }
}
