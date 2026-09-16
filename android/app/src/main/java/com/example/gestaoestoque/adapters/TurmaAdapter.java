package com.example.gestaoestoque.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;
import com.example.gestaoestoque.model.Turma;
import java.util.List;

public class TurmaAdapter extends ArrayAdapter<Turma> {

    public TurmaAdapter(Context context, List<Turma> turmas) {
        super(context, 0, turmas);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        Turma turma = getItem(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(android.R.layout.simple_list_item_2, parent, false);
        }
        TextView text1 = convertView.findViewById(android.R.id.text1);
        TextView text2 = convertView.findViewById(android.R.id.text2);

        if (turma != null) {
            text1.setText(turma.getNome());
            text2.setText("Turno: " + turma.getTurno() + " | Sala: " + turma.getSala());
        }
        return convertView;
    }
}
