package com.example.gestaoestoque.admin;

import android.os.Bundle;
import android.widget.ListView;
import androidx.appcompat.app.AppCompatActivity;
import com.administrador.mobile.R;
import com.example.gestaoestoque.adapters.TurmaAdapter;
import com.example.gestaoestoque.model.Turma;
import java.util.ArrayList;
import java.util.List;

public class TurmaActivity extends AppCompatActivity {

    private ListView listView;
    private TurmaAdapter adapter;
    private List<Turma> turmaList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_turma);

        listView = findViewById(R.id.listViewTurmas);
        turmaList = new ArrayList<>();

        // Dados de exemplo de turmas de gastronomia SIGEC
        turmaList.add(new Turma("1", "Turma 2024.1.A - Padaria", "Noturno", "Lab 01", "Chef Carlos"));
        turmaList.add(new Turma("2", "Turma 2024.1.C - Confeitaria", "Matutino", "Lab 02", "Chef Ana"));

        adapter = new TurmaAdapter(this, turmaList);
        listView.setAdapter(adapter);
    }
}
