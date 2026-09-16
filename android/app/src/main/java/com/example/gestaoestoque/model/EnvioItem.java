package com.example.gestaoestoque.model;

public class EnvioItem {
    private String id;
    private String envioId;
    private String itemId;
    private double quantidade;
    private String unidade;

    public EnvioItem(String id, String envioId, String itemId, double quantidade, String unidade) {
        this.id = id;
        this.envioId = envioId;
        this.itemId = itemId;
        this.quantidade = quantidade;
        this.unidade = unidade;
    }

    public String getId() { return id; }
    public String getEnvioId() { return envioId; }
    public String getItemId() { return itemId; }
    public double getQuantidade() { return quantidade; }
    public String getUnidade() { return unidade; }
}
