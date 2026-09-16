package com.example.gestaoestoque.model;

public class Requisition {
    private String id;
    private String codigo;
    private String finalidade;
    private String status;
    private String data;

    public Requisition(String id, String codigo, String finalidade, String status, String data) {
        this.id = id;
        this.codigo = codigo;
        this.finalidade = finalidade;
        this.status = status;
        this.data = data;
    }

    public String getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getFinalidade() { return finalidade; }
    public String getStatus() { return status; }
    public String getData() { return data; }
}
