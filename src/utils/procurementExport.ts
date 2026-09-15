import { ProcurementReportItem } from '../types';

export interface ProcurementExportParams {
  periodLabel: string;
  cycleCategoryLabel: string;
  selectedClassesNames: string[];
}

/**
 * Gera relatório formatado em CSV (compatível com Excel e Google Planilhas)
 */
export const generateCSVSpreadsheet = (
  items: ProcurementReportItem[],
  params: ProcurementExportParams
): string => {
  const headers = [
    'Item / Insumo',
    'Categoria',
    'Ciclo de Compra',
    'Unidade',
    'Demanda Aulas',
    'Estoque Atual',
    'Estoque de Segurança',
    'Sugestão de Compra',
    'Custo Unitário (R$)',
    'Custo Estimado (R$)',
    'Turmas Atendidas',
  ];

  const rows = items.map((item) => {
    const classSummary = item.classesBreakdown
      .map((c) => `${c.classCode} (${c.quantityNeeded} ${item.unit})`)
      .join(' | ');

    return [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.cycleLabel}"`,
      `"${item.unit}"`,
      item.totalRequired.toFixed(2).replace('.', ','),
      item.currentStock.toFixed(2).replace('.', ','),
      item.minSafetyStock.toFixed(2).replace('.', ','),
      item.suggestedPurchase.toFixed(2).replace('.', ','),
      item.unitCost.toFixed(2).replace('.', ','),
      item.totalCost.toFixed(2).replace('.', ','),
      `"${classSummary}"`,
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\r\n');
};

/**
 * Dispara download do relatório em planilha CSV
 */
export const downloadCSVSpreadsheet = (
  content: string,
  categoryLabel: string,
  periodLabel: string
): void => {
  const cleanCategory = categoryLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `RELATORIO_COMPRAS_${cleanCategory}_${Date.now()}.csv`;

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Gera resumo textual para cópia rápida (WhatsApp, e-mail ou anotações)
 */
export const generateTextSummary = (
  items: ProcurementReportItem[],
  params: ProcurementExportParams,
  grandTotal: number
): string => {
  const lines: string[] = [];
  lines.push(`📋 *RELATÓRIO DE COMPRAS - SIGEC*`);
  lines.push(`📅 *Período:* ${params.periodLabel}`);
  lines.push(`📦 *Categoria:* ${params.cycleCategoryLabel}`);
  lines.push(`👥 *Turmas:* ${params.selectedClassesNames.join(', ')}`);
  lines.push(`💰 *Custo Total Estimado:* R$ ${grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  lines.push(``);
  lines.push(`*ITENS PARA AQUISIÇÃO:*`);

  items.forEach((item, index) => {
    if (item.suggestedPurchase > 0) {
      lines.push(
        `${index + 1}. *${item.name}*: ${item.suggestedPurchase.toFixed(2)} ${item.unit} (Demanda: ${item.totalRequired.toFixed(2)} ${item.unit} | Estoque: ${item.currentStock.toFixed(2)} ${item.unit}) - R$ ${item.totalCost.toFixed(2)}`
      );
    }
  });

  return lines.join('\n');
};
