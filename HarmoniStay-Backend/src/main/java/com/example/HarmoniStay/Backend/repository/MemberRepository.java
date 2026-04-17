package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, String> {

    Optional<Member> findByFlatId(String flatNumber);

    Optional<Member> findByEmail(String email);
}
