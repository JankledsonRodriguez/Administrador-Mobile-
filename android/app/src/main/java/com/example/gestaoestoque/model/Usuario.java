package com.example.gestaoestoque.model;

public class Usuario {
    private String id;
    private String nome;
    private String email;
    private String cargo;

    public Usuario(String id, String nome, String email, String cargo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cargo = cargo;
    }

    public String getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getCargo() { return cargo; }
}
