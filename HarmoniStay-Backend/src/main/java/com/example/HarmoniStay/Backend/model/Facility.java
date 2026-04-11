package com.example.HarmoniStay.Backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "facilities")
public class Facility {

    @Id
    private String id;

    private String name;            // GYM, CLUBHOUSE, SWIMMING_POOL
    private String userId;           // member who booked
    private String flatId;
    private Date bookingDate;
    private String timeSlot;         // e.g. "09:00-11:00"
    private String status;           // BOOKED, CANCELLED, COMPLETED
    private Date createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFlatId() { return flatId; }
    public void setFlatId(String flatId) { this.flatId = flatId; }

    public Date getBookingDate() { return bookingDate; }
    public void setBookingDate(Date bookingDate) { this.bookingDate = bookingDate; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
