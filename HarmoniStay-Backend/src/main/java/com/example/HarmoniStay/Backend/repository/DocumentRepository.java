package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.SocietyDocument;
import com.example.HarmoniStay.Backend.model.DocumentVerificationStatus;
import com.example.HarmoniStay.Backend.model.DocumentVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<SocietyDocument, String> {
    List<SocietyDocument> findByCategory(String category);
    List<SocietyDocument> findByCategoryIgnoreCase(String category);
    List<SocietyDocument> findByVerificationStatus(DocumentVerificationStatus verificationStatus);
    List<SocietyDocument> findByCategoryIgnoreCaseAndVerificationStatus(String category, DocumentVerificationStatus verificationStatus);
    List<SocietyDocument> findByVerificationStatusAndVisibility(DocumentVerificationStatus verificationStatus, DocumentVisibility visibility);
    List<SocietyDocument> findByCategoryIgnoreCaseAndVerificationStatusAndVisibility(
            String category,
            DocumentVerificationStatus verificationStatus,
            DocumentVisibility visibility
    );
}
