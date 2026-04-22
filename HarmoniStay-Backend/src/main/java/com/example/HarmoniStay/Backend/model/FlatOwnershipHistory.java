package com.example.HarmoniStay.Backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "flat_ownership_history")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FlatOwnershipHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flat_id", nullable = false)
    private Flat flat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private LocalDate firstDay;

    private LocalDate lastDay;

    @Column(nullable = false)
    private String createdAt;

    @Column(nullable = false)
    private String updatedAt;

    @PrePersist
    void onInsert() {
        String now = Instant.now().toString();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Flat getFlat() { return flat; }
    public void setFlat(Flat flat) { this.flat = flat; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public LocalDate getFirstDay() { return firstDay; }
    public void setFirstDay(LocalDate firstDay) { this.firstDay = firstDay; }

    public LocalDate getLastDay() { return lastDay; }
    public void setLastDay(LocalDate lastDay) { this.lastDay = lastDay; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
