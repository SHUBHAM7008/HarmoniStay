package com.example.HarmoniStay.Backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "flats")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String flatNumber;
    private String wing;
    private int floor;
    private double area;
    private Long amount;

    public enum FlatType { BHK1, BHK2, BHK3, BHK4, PENTHOUSE }
    @Enumerated(EnumType.STRING)
    private FlatType type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private Member owner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id")
    private Member tenant;

    public enum Status { OCCUPIED, VACANT, UNDER_RENOVATION }
    @Enumerated(EnumType.STRING)
    private Status status;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

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

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

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
                ", status=" + status +
                '}';
    }
}
