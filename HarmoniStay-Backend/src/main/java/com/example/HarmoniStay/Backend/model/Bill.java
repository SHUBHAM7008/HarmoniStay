package com.example.HarmoniStay.Backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bills")
public class Bill {

    @Id
    private String id;

    private String userId;   // resolved from userEmail
    private String flatId;   // resolved from flatNumber
    private double amount;
    private String status;   // UNPAID, PAID, etc.
    private String billMonth;
    private String description;

    // Transient fields for JSON input
    private String userEmail;

    private String flatNumber;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    private String transactionId;

    public Bill() {}

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFlatId() {
        return flatId;
    }

    public void setFlatId(String flatId) {
        this.flatId = flatId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBillMonth() {
        return billMonth;
    }

    public void setBillMonth(String billMonth) {
        this.billMonth = billMonth;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getFlatNumber() {
        return flatNumber;
    }

    public void setFlatNumber(String flatNumber) {
        this.flatNumber = flatNumber;
    }

    @Override
    public String toString() {
        return "Bill{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", flatId='" + flatId + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                ", billMonth='" + billMonth + '\'' +
                ", description='" + description + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", flatNumber='" + flatNumber + '\'' +
                '}';
    }
}
