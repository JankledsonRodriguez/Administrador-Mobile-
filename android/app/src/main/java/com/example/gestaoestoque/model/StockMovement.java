package com.example.gestaoestoque.model;

public class StockMovement {
    private String id;
    private String stockItemId;
    private String type; // IN / OUT
    private double quantity;
    private String date;
    private String reason;

    public StockMovement(String id, String stockItemId, String type, double quantity, String date, String reason) {
        this.id = id;
        this.stockItemId = stockItemId;
        this.type = type;
        this.quantity = quantity;
        this.date = date;
        this.reason = reason;
    }

    public String getId() { return id; }
    public String getStockItemId() { return stockItemId; }
    public String getType() { return type; }
    public double getQuantity() { return quantity; }
    public String getDate() { return date; }
    public String getReason() { return reason; }
}
