package com.example.HarmoniStay.Backend.model;

public class EmergencyContact {
    private String name;
    private String phone;
    private String relation;

    public EmergencyContact() {}

    public EmergencyContact(String name, String phone, String relation) {
        this.name = name;
        this.phone = phone;
        this.relation = relation;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRelation() { return relation; }
    public void setRelation(String relation) { this.relation = relation; }

    @Override
    public String toString() {
        return "EmergencyContact{" +
                "name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", relation='" + relation + '\'' +
                '}';
    }
}
