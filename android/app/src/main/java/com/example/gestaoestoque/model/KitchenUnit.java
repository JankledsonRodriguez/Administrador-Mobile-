package com.example.gestaoestoque.model;

public class KitchenUnit {
    private String id;
    private String name;
    private String location;

    public KitchenUnit(String id, String name, String location) {
        this.id = id;
        this.name = name;
        this.location = location;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
}
