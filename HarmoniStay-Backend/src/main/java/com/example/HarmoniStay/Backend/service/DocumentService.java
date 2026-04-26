package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.DocumentVerificationStatus;
import com.example.HarmoniStay.Backend.model.DocumentVisibility;
import com.example.HarmoniStay.Backend.model.SocietyDocument;
import com.example.HarmoniStay.Backend.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentFileStorageService fileStorageService;

    public SocietyDocument uploadDocument(
            MultipartFile file,
            String title,
            String category,
            String description,
            String uploadedBy,
            String documentNumber,
            LocalDate issueDate,
            LocalDate expiryDate,
            String visibility,
            String actorRole
    ) {
        requireDocumentManager(actorRole);
        requireText(title, "Document title is required");
        requireText(category, "Document category is required");

        DocumentFileStorageService.StoredDocument storedFile = fileStorageService.store(file);

        SocietyDocument doc = new SocietyDocument();
        doc.setTitle(title.trim());
        doc.setCategory(category.trim().toUpperCase());
        doc.setDescription(trimToNull(description));
        doc.setUploadedBy(trimToNull(uploadedBy));
        doc.setDocumentNumber(trimToNull(documentNumber));
        doc.setIssueDate(toDate(issueDate));
        doc.setExpiryDate(toDate(expiryDate));
        doc.setOriginalFileName(storedFile.originalFileName());
        doc.setStoredFilePath(storedFile.storedFilePath());
        doc.setContentType(storedFile.contentType());
        doc.setFileSize(storedFile.fileSize());
        doc.setChecksumSha256(storedFile.checksumSha256());
        doc.setVisibility(parseVisibility(visibility, DocumentVisibility.COMMITTEE_ONLY));
        doc.setVerificationStatus(DocumentVerificationStatus.PENDING_VERIFICATION);
        doc.setUploadedAt(new Date());

        try {
            SocietyDocument saved = documentRepository.save(doc);
            saved.setFileUrl("/api/documents/" + saved.getId() + "/download");
            return documentRepository.save(saved);
        } catch (RuntimeException ex) {
            fileStorageService.deleteIfExists(storedFile.storedFilePath());
            throw ex;
        }
    }

    public List<SocietyDocument> getDocuments(String actorRole, String category, String status) {
        if (isMember(actorRole)) {
            if (category != null && !category.isBlank()) {
                return documentRepository.findByCategoryIgnoreCaseAndVerificationStatusAndVisibility(
                        category.trim(),
                        DocumentVerificationStatus.VERIFIED,
                        DocumentVisibility.ALL_MEMBERS
                );
            }
            return documentRepository.findByVerificationStatusAndVisibility(
                    DocumentVerificationStatus.VERIFIED,
                    DocumentVisibility.ALL_MEMBERS
            );
        }

        requireDocumentManager(actorRole);
        if (status != null && !status.isBlank()) {
            if (category != null && !category.isBlank()) {
                return documentRepository.findByCategoryIgnoreCaseAndVerificationStatus(category.trim(), parseStatus(status));
            }
            return documentRepository.findByVerificationStatus(parseStatus(status));
        }
        if (category != null && !category.isBlank()) {
            return documentRepository.findByCategoryIgnoreCase(category.trim());
        }
        return documentRepository.findAll();
    }

    public List<SocietyDocument> getAllDocuments() {
        return getDocuments("ADMIN", null, null);
    }

    public List<SocietyDocument> getByCategory(String category) {
        return documentRepository.findByCategoryIgnoreCase(category);
    }

    public Optional<SocietyDocument> getById(String id, String actorRole) {
        SocietyDocument document = findRequired(id);
        ensureCanRead(document, actorRole);
        return Optional.of(document);
    }

    public Optional<SocietyDocument> getById(String id) {
        return documentRepository.findById(id);
    }

    public SocietyDocument verifyDocument(String id, String verifiedBy, String visibility, String actorRole) {
        requireAdmin(actorRole);
        SocietyDocument document = findRequired(id);
        if (document.getVerificationStatus() == DocumentVerificationStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Archived documents cannot be verified");
        }

        document.setVerificationStatus(DocumentVerificationStatus.VERIFIED);
        document.setVisibility(parseVisibility(visibility, DocumentVisibility.ALL_MEMBERS));
        document.setVerifiedBy(trimToNull(verifiedBy));
        document.setVerifiedAt(new Date());
        document.setRejectionReason(null);
        return documentRepository.save(document);
    }

    public SocietyDocument rejectDocument(String id, String rejectedBy, String reason, String actorRole) {
        requireAdmin(actorRole);
        requireText(reason, "Rejection reason is required");

        SocietyDocument document = findRequired(id);
        if (document.getVerificationStatus() == DocumentVerificationStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Archived documents cannot be rejected");
        }

        document.setVerificationStatus(DocumentVerificationStatus.REJECTED);
        document.setVerifiedBy(trimToNull(rejectedBy));
        document.setVerifiedAt(new Date());
        document.setRejectionReason(reason.trim());
        document.setVisibility(DocumentVisibility.COMMITTEE_ONLY);
        return documentRepository.save(document);
    }

    public SocietyDocument archiveDocument(String id, String actorRole) {
        requireAdmin(actorRole);
        SocietyDocument document = findRequired(id);
        document.setVerificationStatus(DocumentVerificationStatus.ARCHIVED);
        document.setVisibility(DocumentVisibility.COMMITTEE_ONLY);
        return documentRepository.save(document);
    }

    public SocietyDocument prepareDownload(String id, String actorRole) {
        SocietyDocument document = findRequired(id);
        ensureCanRead(document, actorRole);
        document.setLastDownloadedAt(new Date());
        return documentRepository.save(document);
    }

    public void deleteDocument(String id) {
        SocietyDocument document = findRequired(id);
        documentRepository.deleteById(id);
        fileStorageService.deleteIfExists(document.getStoredFilePath());
    }

    private SocietyDocument findRequired(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
    }

    private void ensureCanRead(SocietyDocument document, String actorRole) {
        if (isDocumentManager(actorRole)) {
            return;
        }

        if (isMember(actorRole)
                && document.getVerificationStatus() == DocumentVerificationStatus.VERIFIED
                && document.getVisibility() == DocumentVisibility.ALL_MEMBERS) {
            return;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to access this document");
    }

    private void requireAdmin(String role) {
        if (!"ADMIN".equalsIgnoreCase(trimToNull(role))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin users can perform this document action");
        }
    }

    private void requireDocumentManager(String role) {
        if (!isDocumentManager(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin or accountant users can manage documents");
        }
    }

    private boolean isDocumentManager(String role) {
        String normalized = trimToNull(role);
        return "ADMIN".equalsIgnoreCase(normalized) || "ACCOUNTANT".equalsIgnoreCase(normalized);
    }

    private boolean isMember(String role) {
        return "MEMBER".equalsIgnoreCase(trimToNull(role));
    }

    private DocumentVerificationStatus parseStatus(String status) {
        try {
            return DocumentVerificationStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid document status");
        }
    }

    private DocumentVisibility parseVisibility(String visibility, DocumentVisibility defaultValue) {
        if (visibility == null || visibility.isBlank()) {
            return defaultValue;
        }
        try {
            return DocumentVisibility.valueOf(visibility.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid document visibility");
        }
    }

    private void requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private Date toDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}
