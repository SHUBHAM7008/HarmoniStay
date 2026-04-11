package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.SocietyDocument;
import com.example.HarmoniStay.Backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping
    public List<SocietyDocument> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/category/{category}")
    public List<SocietyDocument> getByCategory(@PathVariable String category) {
        return documentService.getByCategory(category);
    }

    @GetMapping("/{id}")
    public Optional<SocietyDocument> getById(@PathVariable String id) {
        return documentService.getById(id);
    }

    @PostMapping
    public SocietyDocument upload(@RequestBody SocietyDocument doc) {
        return documentService.uploadDocument(doc);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        documentService.deleteDocument(id);
    }
}
