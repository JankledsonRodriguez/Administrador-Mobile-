package com.example.gestaoestoque.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;
import com.administrador.mobile.R;
import com.example.gestaoestoque.model.ItemEstoque;
import java.util.List;

public class EstoqueAdapter extends ArrayAdapter<ItemEstoque> {

    public EstoqueAdapter(Context context, List<ItemEstoque> items) {
        super(context, 0, items);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ItemEstoque item = getItem(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(android.R.layout.simple_list_item_2, parent, false);
        }
        TextView text1 = convertView.findViewById(android.R.id.text1);
        TextView text2 = convertView.findViewById(android.R.id.text2);

        if (item != null) {
            text1.setText(item.getNome());
            text2.setText("Qtd: " + item.getQuantidade() + " " + item.getUnidade() + " (" + item.getCategoria() + ")");
        }
        return convertView;
    }
}
