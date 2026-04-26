package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.SocietyDocument;
import com.example.HarmoniStay.Backend.service.DocumentFileStorageService;
import com.example.HarmoniStay.Backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private DocumentFileStorageService fileStorageService;

    @GetMapping
    public List<SocietyDocument> getAllDocuments(
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        return documentService.getDocuments(role, category, status);
    }

    @GetMapping("/category/{category}")
    public List<SocietyDocument> getByCategory(
            @PathVariable String category,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        return documentService.getDocuments(role, category, null);
    }

    @GetMapping("/{id}")
    public Optional<SocietyDocument> getById(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        return documentService.getById(id, role);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SocietyDocument upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String uploadedBy,
            @RequestParam(required = false) String documentNumber,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(required = false) String visibility,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        return documentService.uploadDocument(
                file,
                title,
                category,
                description,
                uploadedBy,
                documentNumber,
                issueDate,
                expiryDate,
                visibility,
                role
        );
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        SocietyDocument document = documentService.prepareDownload(id, role);
        Path filePath = fileStorageService.resolve(document.getStoredFilePath());
        Resource resource = new PathResource(filePath);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (document.getContentType() != null && !document.getContentType().isBlank()) {
            mediaType = MediaType.parseMediaType(document.getContentType());
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(document.getOriginalFileName())
                        .build()
                        .toString())
                .body(resource);
    }

    @PatchMapping("/{id}/verify")
    public SocietyDocument verify(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        String verifiedBy = payload == null ? null : payload.get("verifiedBy");
        String visibility = payload == null ? null : payload.get("visibility");
        return documentService.verifyDocument(id, verifiedBy, visibility, role);
    }

    @PatchMapping("/{id}/reject")
    public SocietyDocument reject(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        String rejectedBy = payload == null ? null : payload.get("rejectedBy");
        String reason = payload == null ? null : payload.get("reason");
        return documentService.rejectDocument(id, rejectedBy, reason, role);
    }

    @PatchMapping("/{id}/archive")
    public SocietyDocument archive(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        return documentService.archiveDocument(id, role);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "MEMBER") String role
    ) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Only admin users can permanently delete documents"
            );
        }
        documentService.deleteDocument(id);
    }
}
