package com.example.HarmoniStay.Backend.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "flat_id")
    private String flatId;

    private double amount;
    private String status;
    private String billMonth;
    private String description;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "flat_number")
    private String flatNumber;

    private String transactionId;
    private LocalDate createdDate;
    private LocalDate dueDate;
    // Keep nullable for safe schema migration on existing rows.
    private Boolean overdueSmsSent;

    public Bill() {}

    @PrePersist
    void onCreate() {
        if (this.createdDate == null) {
            this.createdDate = LocalDate.now();
        }
        if (this.dueDate == null) {
            this.dueDate = this.createdDate.plusDays(4);
        }
        if (this.status == null || this.status.isBlank()) {
            this.status = "UNPAID";
        }
        if (this.overdueSmsSent == null) {
            this.overdueSmsSent = false;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFlatId() { return flatId; }
    public void setFlatId(String flatId) { this.flatId = flatId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBillMonth() { return billMonth; }
    public void setBillMonth(String billMonth) { this.billMonth = billMonth; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDate getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDate createdDate) { this.createdDate = createdDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public boolean isOverdueSmsSent() { return Boolean.TRUE.equals(overdueSmsSent); }
    public void setOverdueSmsSent(Boolean overdueSmsSent) { this.overdueSmsSent = overdueSmsSent; }

    @Override
    public String toString() {
        return "Bill{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", flatId='" + flatId + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                ", billMonth='" + billMonth + '\'' +
                '}';
    }
}
