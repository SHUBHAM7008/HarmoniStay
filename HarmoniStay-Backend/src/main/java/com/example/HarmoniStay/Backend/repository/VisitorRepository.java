package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitorRepository extends JpaRepository<Visitor, String> {
    List<Visitor> findByFlatId(String flatId);
}
