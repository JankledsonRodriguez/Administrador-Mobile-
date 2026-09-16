package com.example.gestaoestoque.admin;

import android.os.Bundle;
import android.widget.ListView;
import androidx.appcompat.app.AppCompatActivity;
import com.administrador.mobile.R;
import com.example.gestaoestoque.adapters.EstoqueAdapter;
import com.example.gestaoestoque.model.ItemEstoque;
import java.util.ArrayList;
import java.util.List;

public class EstoqueActivity extends AppCompatActivity {

    private ListView listView;
    private EstoqueAdapter adapter;
    private List<ItemEstoque> estoqueList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_estoque);

        listView = findViewById(R.id.listViewEstoque);
        estoqueList = new ArrayList<>();

        // Dados de exemplo do almoxarifado SIGEC
        estoqueList.add(new ItemEstoque("1", "Farinha de Trigo Especial", "Secos e Farinhas", 150.0, "kg", 20.0));
        estoqueList.add(new ItemEstoque("2", "Manteiga Sem Sal", "Laticínios e Frios", 45.0, "kg", 10.0));
        estoqueList.add(new ItemEstoque("3", "Chocolate em Pó 50%", "Confeitaria", 30.0, "kg", 5.0));

        adapter = new EstoqueAdapter(this, estoqueList);
        listView.setAdapter(adapter);
    }
}
