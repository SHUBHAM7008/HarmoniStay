package com.example.HarmoniStay.Backend.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "visitors")
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String visitorName;
    private String phone;
    private String flatId;
    private String purpose;
    @Temporal(TemporalType.TIMESTAMP)
    private Date entryTime;
    @Temporal(TemporalType.TIMESTAMP)
    private Date exitTime;
    private String loggedBy;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVisitorName() { return visitorName; }
    public void setVisitorName(String visitorName) { this.visitorName = visitorName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getFlatId() { return flatId; }
    public void setFlatId(String flatId) { this.flatId = flatId; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Date getEntryTime() { return entryTime; }
    public void setEntryTime(Date entryTime) { this.entryTime = entryTime; }

    public Date getExitTime() { return exitTime; }
    public void setExitTime(Date exitTime) { this.exitTime = exitTime; }

    public String getLoggedBy() { return loggedBy; }
    public void setLoggedBy(String loggedBy) { this.loggedBy = loggedBy; }
}
