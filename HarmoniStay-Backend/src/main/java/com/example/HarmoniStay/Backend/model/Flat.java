package com.example.HarmoniStay.Backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "flats")
public class Flat {

    @Id
    private String id;

    private String flatNumber;
    private String wing;
    private int floor;
    private double area; // in sqft
    private Long amount;
    public enum FlatType { BHK1, BHK2, BHK3, BHK4, PENTHOUSE }
    private FlatType type;

    @DBRef
    private Member owner; // Reference to Users collection

    @DBRef
    private Member tenant; // Reference to Users collection

    public enum Status { OCCUPIED, VACANT, UNDER_RENOVATION }
    private Status status;

    private List<OwnershipHistory> ownershipHistory;

    private Date createdAt;
    private Date updatedAt;

    // Nested Class for ownership history
    public static class OwnershipHistory {
        private String previousOwnerId;
        private String newOwnerId;
        private Date transferDate;
        private String remarks;

        // Getters and setters
        public String getPreviousOwnerId() { return previousOwnerId; }
        public void setPreviousOwnerId(String previousOwnerId) { this.previousOwnerId = previousOwnerId; }

        public String getNewOwnerId() { return newOwnerId; }
        public void setNewOwnerId(String newOwnerId) { this.newOwnerId = newOwnerId; }

        public Date getTransferDate() { return transferDate; }
        public void setTransferDate(Date transferDate) { this.transferDate = transferDate; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    // Getters and setters for Flat fields
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public String getWing() { return wing; }
    public void setWing(String wing) { this.wing = wing; }

    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }

    public double getArea() { return area; }
    public void setArea(double area) { this.area = area; }

    public FlatType getType() { return type; }
    public void setType(FlatType type) { this.type = type; }

    public Member getOwner() { return owner; }
    public void setOwner(Member owner) { this.owner = owner; }

    public Member getTenant() { return tenant; }
    public void setTenant(Member tenant) { this.tenant = tenant; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public List<OwnershipHistory> getOwnershipHistory() { return ownershipHistory; }
    public void setOwnershipHistory(List<OwnershipHistory> ownershipHistory) { this.ownershipHistory = ownershipHistory; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    @Override
    public String toString() {
        return "Flat{" +
                "id='" + id + '\'' +
                ", flatNumber='" + flatNumber + '\'' +
                ", wing='" + wing + '\'' +
                ", floor=" + floor +
                ", area=" + area +
                ", amount=" + amount +
                ", type=" + type +
                ", owner=" + owner +
                ", tenant=" + tenant +
                ", status=" + status +
                ", ownershipHistory=" + ownershipHistory +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
