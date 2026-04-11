package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.SocietyDocument;
import com.example.HarmoniStay.Backend.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public SocietyDocument uploadDocument(SocietyDocument doc) {
        doc.setUploadedAt(new Date());
        return documentRepository.save(doc);
    }

    public List<SocietyDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<SocietyDocument> getByCategory(String category) {
        return documentRepository.findByCategory(category);
    }

    public Optional<SocietyDocument> getById(String id) {
        return documentRepository.findById(id);
    }

    public void deleteDocument(String id) {
        documentRepository.deleteById(id);
    }
}
