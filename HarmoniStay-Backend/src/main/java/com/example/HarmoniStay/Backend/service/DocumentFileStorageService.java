package com.example.HarmoniStay.Backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentFileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx");

    private final Path storageRoot;

    public DocumentFileStorageService(@Value("${harmonistay.documents.storage-path:uploads/documents}") String storagePath) {
        this.storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    public StoredDocument store(MultipartFile file) {
        validate(file);

        try {
            Files.createDirectories(storageRoot);
            String originalFileName = safeFileName(file.getOriginalFilename());
            String extension = extensionOf(originalFileName);
            String storedFileName = UUID.randomUUID() + extension;
            Path destination = storageRoot.resolve(storedFileName).normalize();
            ensureInsideStorageRoot(destination);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream input = file.getInputStream();
                 DigestInputStream digestInput = new DigestInputStream(input, digest)) {
                Files.copy(digestInput, destination);
            }

            return new StoredDocument(
                    originalFileName,
                    storageRoot.relativize(destination).toString(),
                    file.getContentType(),
                    file.getSize(),
                    toHex(digest.digest())
            );
        } catch (IOException | NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to store document file", e);
        }
    }

    public Path resolve(String storedFilePath) {
        if (storedFilePath == null || storedFilePath.isBlank()) {
            throw new IllegalArgumentException("Document file path is missing");
        }

        Path resolved = storageRoot.resolve(storedFilePath).toAbsolutePath().normalize();
        ensureInsideStorageRoot(resolved);
        if (!Files.exists(resolved) || !Files.isRegularFile(resolved)) {
            throw new IllegalStateException("Document file is missing from storage");
        }
        return resolved;
    }

    public void deleteIfExists(String storedFilePath) {
        if (storedFilePath == null || storedFilePath.isBlank()) {
            return;
        }

        try {
            Path resolved = storageRoot.resolve(storedFilePath).toAbsolutePath().normalize();
            ensureInsideStorageRoot(resolved);
            Files.deleteIfExists(resolved);
        } catch (IOException e) {
            throw new IllegalStateException("Unable to delete document file", e);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Document file is required");
        }

        String originalFileName = safeFileName(file.getOriginalFilename());
        String extension = extensionOf(originalFileName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Only PDF, image, DOC, and DOCX documents are allowed");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Unsupported document content type");
        }
    }

    private String safeFileName(String fileName) {
        String safe = fileName == null ? "" : Paths.get(fileName).getFileName().toString().trim();
        if (safe.isBlank() || safe.contains("..")) {
            throw new IllegalArgumentException("Invalid document file name");
        }
        return safe;
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0) {
            throw new IllegalArgumentException("Document file must have an extension");
        }
        return fileName.substring(dot).toLowerCase(Locale.ROOT);
    }

    private void ensureInsideStorageRoot(Path path) {
        if (!path.toAbsolutePath().normalize().startsWith(storageRoot)) {
            throw new IllegalArgumentException("Invalid document storage path");
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    public record StoredDocument(
            String originalFileName,
            String storedFilePath,
            String contentType,
            long fileSize,
            String checksumSha256
    ) {}
}
