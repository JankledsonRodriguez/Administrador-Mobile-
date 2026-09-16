package com.example.gestaoestoque.model;

public class Envio {
    private String id;
    private String turmaId;
    private String instrutorId;
    private String data;
    private String status;

    public Envio(String id, String turmaId, String instrutorId, String data, String status) {
        this.id = id;
        this.turmaId = turmaId;
        this.instrutorId = instrutorId;
        this.data = data;
        this.status = status;
    }

    public String getId() { return id; }
    public String getTurmaId() { return turmaId; }
    public String getInstrutorId() { return instrutorId; }
    public String getData() { return data; }
    public String getStatus() { return status; }
}
