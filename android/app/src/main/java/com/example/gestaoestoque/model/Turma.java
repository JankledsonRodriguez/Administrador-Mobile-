package com.example.gestaoestoque.model;

public class Turma {
    private String id;
    private String nome;
    private String turno;
    private String sala;
    private String instrutorNome;

    public Turma(String id, String nome, String turno, String sala, String instrutorNome) {
        this.id = id;
        this.nome = nome;
        this.turno = turno;
        this.sala = sala;
        this.instrutorNome = instrutorNome;
    }

    public String getId() { return id; }
    public String getNome() { return nome; }
    public String getTurno() { return turno; }
    public String getSala() { return sala; }
    public String getInstrutorNome() { return instrutorNome; }
}
