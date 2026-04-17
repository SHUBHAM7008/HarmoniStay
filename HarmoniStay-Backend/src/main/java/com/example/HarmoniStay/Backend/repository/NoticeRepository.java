package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, String> {
}
