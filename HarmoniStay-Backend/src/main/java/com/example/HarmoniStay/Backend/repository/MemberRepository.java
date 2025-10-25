package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Member;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface MemberRepository extends MongoRepository<Member, String> {

    // Find member by nested Flat's flatNumbe
    Optional<Member> findByFlatId(String flatNumber);

    // Example: find member by email
    Optional<Member> findByEmail(String email);
}
