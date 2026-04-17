package com.example.HarmoniStay.Backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "society_documents")
public class SocietyDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    private String category;
    @Column(length = 4000)
    private String description;

    @Column(length = 2000)
    private String fileUrl;

    private String originalFileName;

    @JsonIgnore
    @Column(length = 2000)
    private String storedFilePath;

    private String contentType;
    private Long fileSize;

    @Column(length = 64)
    private String checksumSha256;

    private String documentNumber;

    @Temporal(TemporalType.DATE)
    private Date issueDate;

    @Temporal(TemporalType.DATE)
    private Date expiryDate;

    private String uploadedBy;

    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadedAt;

    @Enumerated(EnumType.STRING)
    private DocumentVerificationStatus verificationStatus = DocumentVerificationStatus.PENDING_VERIFICATION;

    @Enumerated(EnumType.STRING)
    private DocumentVisibility visibility = DocumentVisibility.COMMITTEE_ONLY;

    private String verifiedBy;

    @Temporal(TemporalType.TIMESTAMP)
    private Date verifiedAt;

    @Column(length = 2000)
    private String rejectionReason;

    @Temporal(TemporalType.TIMESTAMP)
    private Date lastDownloadedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFilePath() { return storedFilePath; }
    public void setStoredFilePath(String storedFilePath) { this.storedFilePath = storedFilePath; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }

    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }

    public Date getIssueDate() { return issueDate; }
    public void setIssueDate(Date issueDate) { this.issueDate = issueDate; }

    public Date getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Date expiryDate) { this.expiryDate = expiryDate; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public Date getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Date uploadedAt) { this.uploadedAt = uploadedAt; }

    public DocumentVerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(DocumentVerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public DocumentVisibility getVisibility() { return visibility; }
    public void setVisibility(DocumentVisibility visibility) { this.visibility = visibility; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public Date getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Date verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Date getLastDownloadedAt() { return lastDownloadedAt; }
    public void setLastDownloadedAt(Date lastDownloadedAt) { this.lastDownloadedAt = lastDownloadedAt; }
}
