package com.example.gestaoestoque.model;

public class RequisitionItem {
    private String id;
    private String requisitionId;
    private String stockItemId;
    private double requestedQuantity;
    private double approvedQuantity;
    private String unit;

    public RequisitionItem(String id, String requisitionId, String stockItemId, double requestedQuantity, double approvedQuantity, String unit) {
        this.id = id;
        this.requisitionId = requisitionId;
        this.stockItemId = stockItemId;
        this.requestedQuantity = requestedQuantity;
        this.approvedQuantity = approvedQuantity;
        this.unit = unit;
    }

    public String getId() { return id; }
    public String getRequisitionId() { return requisitionId; }
    public String getStockItemId() { return stockItemId; }
    public double getRequestedQuantity() { return requestedQuantity; }
    public double getApprovedQuantity() { return approvedQuantity; }
    public String getUnit() { return unit; }
}
