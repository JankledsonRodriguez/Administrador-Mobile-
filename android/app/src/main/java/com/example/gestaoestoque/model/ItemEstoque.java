package com.example.gestaoestoque.model;

public class ItemEstoque {
    private String id;
    private String nome;
    private String categoria;
    private double quantidade;
    private String unidade;
    private double quantidadeMinima;

    public ItemEstoque(String id, String nome, String categoria, double quantidade, String unidade, double quantidadeMinima) {
        this.id = id;
        this.nome = nome;
        this.categoria = categoria;
        this.quantidade = quantidade;
        this.unidade = unidade;
        this.quantidadeMinima = quantidadeMinima;
    }

    public String getId() { return id; }
    public String getNome() { return nome; }
    public String getCategoria() { return categoria; }
    public double getQuantidade() { return quantidade; }
    public String getUnidade() { return unidade; }
    public double getQuantidadeMinima() { return quantidadeMinima; }
}
