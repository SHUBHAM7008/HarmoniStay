package com.example.HarmoniStay.Backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;

    private String userId;       // member who lodged
    private String flatId;
    private String category;     // MAINTENANCE, ELECTRICITY, WATER, SECURITY, OTHER
    private String title;
    private String description;
    private String status;       // PENDING, IN_PROGRESS, RESOLVED
    private String adminFeedback; // admin response when resolved
    private Date createdAt;
    private Date updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFlatId() { return flatId; }
    public void setFlatId(String flatId) { this.flatId = flatId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminFeedback() { return adminFeedback; }
    public void setAdminFeedback(String adminFeedback) { this.adminFeedback = adminFeedback; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
