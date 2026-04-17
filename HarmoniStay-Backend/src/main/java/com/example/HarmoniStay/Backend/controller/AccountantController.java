package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Accountant;
import com.example.HarmoniStay.Backend.service.AccountantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accountants")
@CrossOrigin(origins = "*")
public class AccountantController {

    @Autowired
    private AccountantService accountantService;

    @GetMapping
    public List<Accountant> list() {
        return accountantService.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Accountant body) {
        try {
            Accountant saved = accountantService.create(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        accountantService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
