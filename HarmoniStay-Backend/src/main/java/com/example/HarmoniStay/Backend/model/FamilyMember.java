package com.example.HarmoniStay.Backend.model;

public class FamilyMember {
    private String name;
    private int age;
    private String relation;

    public FamilyMember() {}

    public FamilyMember(String name, int age, String relation) {
        this.name = name;
        this.age = age;
        this.relation = relation;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getRelation() { return relation; }
    public void setRelation(String relation) { this.relation = relation; }

    @Override
    public String toString() {
        return "FamilyMember{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", relation='" + relation + '\'' +
                '}';
    }
}
