package com.example.HarmoniStay.Backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "bill_collections")
public class BillCollection {

    @Id
    private String id;

    @DBRef
    private Bill billId;

    @DBRef
    private Member userId;

    @DBRef
    private Flat flatId;

    private Double amount;
    private String paymentMethod; // CASH, CHEQUE, ONLINE, UPI, CARD
    private String transactionId;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private String status; // PENDING, SUCCESS, FAILED, REFUNDED
    private Date paymentDate;
    private String receiptNumber;
    private String receiptUrl;
    private String remarks;

    @DBRef
    private Member processedBy; // Admin user who processed payment

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Bill getBillId() { return billId; }
    public void setBillId(Bill billId) { this.billId = billId; }

    public Member getUserId() { return userId; }
    public void setUserId(Member userId) { this.userId = userId; }

    public Flat getFlatId() { return flatId; }
    public void setFlatId(Flat flatId) { this.flatId = flatId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getPaymentDate() { return paymentDate; }
    public void setPaymentDate(Date paymentDate) { this.paymentDate = paymentDate; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Member getProcessedBy() { return processedBy; }
    public void setProcessedBy(Member processedBy) { this.processedBy = processedBy; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
