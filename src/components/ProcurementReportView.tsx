import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Clock,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  PackageCheck,
  GraduationCap,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ProcurementCycleType,
  ProcurementReportItem,
  StockCategory,
} from '../types';
import { procurementCyclesConfig } from '../mockData';
import {
  generateCSVSpreadsheet,
  downloadCSVSpreadsheet,
  generateTextSummary,
} from '../utils/procurementExport';

export const ProcurementReportView: React.FC = () => {
  const { classes, stockItems, academicCalendar, showToast, toggleClassStatus } = useApp();

  // 1. Ciclo de Compras Selecionado (Conforme reunião de alunos e gestão)
  const [selectedCycleId, setSelectedCycleId] = useState<ProcurementCycleType>('hortifruti');

  // 2. Filtro de Turmas: 'ativas' (padrão) | 'todas' | 'inativas'
  const [classFilterMode, setClassFilterMode] = useState<'ativas' | 'todas' | 'inativas'>('ativas');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() =>
    classes.filter((c) => c.status === 'ativa').map((c) => c.id)
  );

  // 3. Período de Consulta ao Calendário
  const [periodPreset, setPeriodPreset] = useState<string>('semana-atual');
  const [startDate, setStartDate] = useState<string>('2026-09-15');
  const [endDate, setEndDate] = useState<string>('2026-09-21');

  // 4. Estados de Busca e Interação
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showCalendarBreakdown, setShowCalendarBreakdown] = useState(false);

  // Ciclo atual com regras
  const activeCycle = useMemo(() => {
    return (
      procurementCyclesConfig.find((c) => c.id === selectedCycleId) ||
      procurementCyclesConfig[0]
    );
  }, [selectedCycleId]);

  // Aplica preset de datas inteligente de acordo com o ciclo selecionado
  const handleCycleChange = (cycleId: ProcurementCycleType) => {
    setSelectedCycleId(cycleId);
    setExpandedItemId(null);

    if (cycleId === 'hortifruti') {
      // Semanal (Semana 38: 15/09 a 21/09)
      setPeriodPreset('semana-38');
      setStartDate('2026-09-15');
      setEndDate('2026-09-21');
    } else if (cycleId === 'frios') {
      // Mensal: Ex da reunião "Início de agosto, pede-se para setembro"
      setPeriodPreset('mes-setembro');
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    } else if (cycleId === 'proteina') {
      // Trimestral: Ex da reunião "Início de agosto, pede-se para setembro, outubro e novembro"
      setPeriodPreset('trimestre-set-nov');
      setStartDate('2026-09-01');
      setEndDate('2026-11-30');
    } else if (cycleId === 'mercearia') {
      // Semestral (Fracionado): Semestre 2026.2 (Agosto a Dezembro)
      setPeriodPreset('semestre-2026-2');
      setStartDate('2026-08-01');
      setEndDate('2026-12-31');
    }
  };

  // Aplica preset rápido dentro do ciclo atual
  const applyDatePreset = (presetKey: string, start: string, end: string) => {
    setPeriodPreset(presetKey);
    setStartDate(start);
    setEndDate(end);
  };

  // Filtra as turmas disponíveis para a lista de seleção
  const filteredClassesList = useMemo(() => {
    if (classFilterMode === 'ativas') {
      return classes.filter((c) => c.status === 'ativa');
    }
    if (classFilterMode === 'inativas') {
      return classes.filter((c) => c.status !== 'ativa');
    }
    return classes;
  }, [classes, classFilterMode]);

  // Ações de seleção de turmas
  const handleSelectAllActive = () => {
    const activeIds = classes.filter((c) => c.status === 'ativa').map((c) => c.id);
    setSelectedClassIds(activeIds);
    setClassFilterMode('ativas');
    showToast('info', 'Turmas Ativas Selecionadas', `${activeIds.length} turmas em andamento marcadas para o pedido.`);
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredClassesList.map((c) => c.id);
    setSelectedClassIds(visibleIds);
  };

  const handleDeselectAll = () => {
    setSelectedClassIds([]);
  };

  const handleToggleClassSelection = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  // --------------------------------------------------------------------------
  // MOTOR DE CONSULTA AO CALENDÁRIO ACADÊMICO & SOMA TOTAL DE INSUMOS
  // --------------------------------------------------------------------------
  const { reportItems, matchedLessons, grandTotalCost, totalUniqueItems } = useMemo(() => {
    if (selectedClassIds.length === 0 || !startDate || !endDate) {
      return { reportItems: [], matchedLessons: [], grandTotalCost: 0, totalUniqueItems: 0 };
    }

    const startTs = new Date(`${startDate}T00:00:00`).getTime();
    const endTs = new Date(`${endDate}T23:59:59`).getTime();

    // 1. Filtrar aulas do calendário dentro do período e das turmas selecionadas
    const lessonsInPeriod = academicCalendar.filter((lesson) => {
      const lessonTs = new Date(`${lesson.date}T00:00:00`).getTime();
      return (
        selectedClassIds.includes(lesson.classId) &&
        lessonTs >= startTs &&
        lessonTs <= endTs
      );
    });

    // 2. Mapa acumulador de insumos
    const itemsMap = new Map<
      string,
      {
        stockItemId: string;
        name: string;
        category: StockCategory;
        unit: any;
        totalRequired: number;
        classesMap: Map<string, { classCode: string; className: string; qty: number }>;
        lessonIds: Set<string>;
      }
    >();

    lessonsInPeriod.forEach((lesson) => {
      lesson.ingredients.forEach((ing) => {
        // Verificar se a categoria do ingrediente pertence ao ciclo de compras selecionado
        if (!activeCycle.categories.includes(ing.category)) {
          return;
        }

        const existing = itemsMap.get(ing.stockItemId);
        if (!existing) {
          const classesMap = new Map<string, { classCode: string; className: string; qty: number }>();
          classesMap.set(lesson.classId, {
            classCode: lesson.classCode,
            className: lesson.className,
            qty: ing.quantity,
          });

          itemsMap.set(ing.stockItemId, {
            stockItemId: ing.stockItemId,
            name: ing.name,
            category: ing.category,
            unit: ing.unit,
            totalRequired: ing.quantity,
            classesMap,
            lessonIds: new Set([lesson.id]),
          });
        } else {
          existing.totalRequired += ing.quantity;
          existing.lessonIds.add(lesson.id);

          const classAccum = existing.classesMap.get(lesson.classId);
          if (classAccum) {
            classAccum.qty += ing.quantity;
          } else {
            existing.classesMap.set(lesson.classId, {
              classCode: lesson.classCode,
              className: lesson.className,
              qty: ing.quantity,
            });
          }
        }
      });
    });

    // 3. Montar lista de ProcurementReportItem cruzando com o estoque atual
    let calculatedGrandTotalCost = 0;

    const reportItemsList: ProcurementReportItem[] = Array.from(itemsMap.values()).map(
      (itemData) => {
        const currentItemInStock = stockItems.find((s) => s.id === itemData.stockItemId);

        const currentStock = currentItemInStock ? currentItemInStock.currentQuantity : 0;
        const minSafetyStock = currentItemInStock ? currentItemInStock.minQuantity : 0;
        const unitCost = currentItemInStock ? currentItemInStock.costPerUnit : 15.0;

        // Quantidade sugerida para compra:
        // Se a demanda das aulas for maior que o estoque líquido disponível, compra-se o delta + margem mínima
        const netDeficit = Math.max(0, itemData.totalRequired + minSafetyStock - currentStock);
        const suggestedPurchase = netDeficit > 0 ? Number(netDeficit.toFixed(2)) : 0;

        const totalCost = suggestedPurchase * unitCost;
        calculatedGrandTotalCost += totalCost;

        const classesBreakdown = Array.from(itemData.classesMap.entries()).map(
          ([classId, val]) => ({
            classId,
            classCode: val.classCode,
            className: val.className,
            quantityNeeded: Number(val.qty.toFixed(2)),
          })
        );

        return {
          stockItemId: itemData.stockItemId,
          itemCode: currentItemInStock?.id || itemData.stockItemId,
          name: itemData.name,
          category: itemData.category,
          unit: itemData.unit,
          totalRequired: Number(itemData.totalRequired.toFixed(2)),
          currentStock: Number(currentStock.toFixed(2)),
          minSafetyStock: Number(minSafetyStock.toFixed(2)),
          suggestedPurchase,
          unitCost,
          totalCost: Number(totalCost.toFixed(2)),
          cycleLabel: activeCycle.periodicityLabel,
          classesBreakdown,
          lessonsCount: itemData.lessonIds.size,
        };
      }
    );

    // Ordenação padrão por maior volume sugerido e depois por nome
    reportItemsList.sort((a, b) => b.suggestedPurchase - a.suggestedPurchase || a.name.localeCompare(b.name));

    return {
      reportItems: reportItemsList,
      matchedLessons: lessonsInPeriod,
      grandTotalCost: Number(calculatedGrandTotalCost.toFixed(2)),
      totalUniqueItems: reportItemsList.length,
    };
  }, [academicCalendar, selectedClassIds, startDate, endDate, activeCycle, stockItems]);

  // Itens filtrados pelo campo de busca
  const displayedReportItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return reportItems;
    const q = itemSearchQuery.toLowerCase();
    return reportItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [reportItems, itemSearchQuery]);

  // Handlers de exportação e impressão
  const handleDownloadCSV = () => {
    const selectedClassesNames = classes
      .filter((c) => selectedClassIds.includes(c.id))
      .map((c) => c.name);

    const csvContent = generateCSVSpreadsheet(reportItems, {
      periodLabel: `${startDate} a ${endDate}`,
      cycleCategoryLabel: activeCycle.title,
      selectedClassesNames,
    });

    downloadCSVSpreadsheet(csvContent, activeCycle.id, `${startDate}_a_${endDate}`);
    showToast('success', 'Planilha Excel / CSV Exportada', 'O relatório de compras foi baixado para o seu computador.');
  };

  const handleCopySummary = () => {
    const selectedClassesNames = classes
      .filter((c) => selectedClassIds.includes(c.id))
      .map((c) => c.name);

    const text = generateTextSummary(
      reportItems,
      {
        periodLabel: `${startDate} a ${endDate}`,
        cycleCategoryLabel: activeCycle.title,
        selectedClassesNames,
      },
      grandTotalCost
    );

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    showToast('info', 'Resumo Copiado!', 'Lista formatada copiada para a área de transferência.');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* 1. Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#002747] text-white flex items-center justify-center shadow-xs shrink-0">
            <ShoppingCart className="w-6 h-6 text-[#ff8928]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-[#002747] tracking-tight">
                Planejamento & Relatório de Compras
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#002747]/10 text-[#002747] border border-[#002747]/20 uppercase">
                Módulo Pedagógico
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Consolidação automatizada a partir do calendário de aulas. Filtre por ciclo de perecibilidade, selecione as turmas ativas e obtenha a lista exata para cotação e compra.
            </p>
          </div>
        </div>

        {/* Botões de Ação Global de Exportação */}
        <div className="flex items-center space-x-2 w-full lg:w-auto shrink-0 flex-wrap gap-y-2">
          <button
            onClick={handleCopySummary}
            disabled={reportItems.length === 0}
            className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            title="Copiar resumo em texto"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copiar Resumo</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            disabled={reportItems.length === 0}
            className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={reportItems.length === 0}
            className="w-full lg:w-auto px-4 py-2 rounded-xl bg-[#002747] hover:bg-[#00192e] text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            title="Exportar planilha compatível com Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#ff8928]" />
            <span>Exportar Planilha (Excel)</span>
          </button>
        </div>
      </div>

      {/* 2. Seleção de Ciclos de Compra (Conforme prazos detalhados na reunião) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {procurementCyclesConfig.map((cycle) => {
          const isSelected = cycle.id === selectedCycleId;

          return (
            <button
              key={cycle.id}
              onClick={() => handleCycleChange(cycle.id)}
              className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-50/80 to-white border-[#002747] ring-2 ring-[#002747]/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-2.5 h-full bg-[#ff8928]" />
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isSelected
                        ? 'bg-[#002747] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cycle.periodicityLabel}
                  </span>

                  {cycle.fractionedDelivery && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                      Fracionado
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-[#002747] flex items-center space-x-1.5">
                  <span>{cycle.title}</span>
                </h3>

                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {cycle.ruleExplanation}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100/80">
                <span className="text-[10px] text-slate-500 font-semibold block italic">
                  {cycle.example}
                </span>
                <span className="text-[9px] text-[#ff8928] font-bold uppercase mt-1 block">
                  Categorias: {cycle.categories.join(', ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Painel de Controle: Período do Calendário & Seleção de Turmas Ativas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LADO ESQUERDO: SELETOR DE PERÍODO ESPECÍFICO DO CICLO */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#002747] flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-[#ff8928]" />
                <span>1. Período de Consumo nas Aulas Práticas</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Ciclo Atual: <strong className="text-slate-800">{activeCycle.periodicityLabel}</strong>
              </span>
            </div>

            {/* Presets contextuais de acordo com o ciclo */}
            <div className="flex flex-wrap gap-1.5">
              {selectedCycleId === 'hortifruti' && (
                <>
                  <button
                    onClick={() => applyDatePreset('semana-38', '2026-09-15', '2026-09-21')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'semana-38'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semana 38 (15/09 a 21/09)
                  </button>
                  <button
                    onClick={() => applyDatePreset('semana-39', '2026-09-22', '2026-09-28')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'semana-39'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semana 39 (22/09 a 28/09)
                  </button>
                  <button
                    onClick={() => applyDatePreset('mes-setembro-horti', '2026-09-01', '2026-09-30')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'mes-setembro-horti'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Mês Setembro Inteiro
                  </button>
                </>
              )}

              {selectedCycleId === 'frios' && (
                <>
                  <button
                    onClick={() => applyDatePreset('mes-setembro', '2026-09-01', '2026-09-30')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'mes-setembro'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Setembro 2026 (Ex: Pedido em Agosto)
                  </button>
                  <button
                    onClick={() => applyDatePreset('mes-outubro', '2026-10-01', '2026-10-31')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'mes-outubro'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Outubro 2026
                  </button>
                  <button
                    onClick={() => applyDatePreset('mes-novembro', '2026-11-01', '2026-11-30')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'mes-novembro'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Novembro 2026
                  </button>
                </>
              )}

              {selectedCycleId === 'proteina' && (
                <>
                  <button
                    onClick={() => applyDatePreset('trimestre-set-nov', '2026-09-01', '2026-11-30')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'trimestre-set-nov'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Trimestre Set / Out / Nov (Exemplo Reunião)
                  </button>
                  <button
                    onClick={() => applyDatePreset('trimestre-out-dez', '2026-10-01', '2026-12-31')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'trimestre-out-dez'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Trimestre Out / Nov / Dez
                  </button>
                </>
              )}

              {selectedCycleId === 'mercearia' && (
                <>
                  <button
                    onClick={() => applyDatePreset('semestre-2026-2', '2026-08-01', '2026-12-31')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'semestre-2026-2'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    2º Semestre Letivo 2026 (Integral)
                  </button>
                  <button
                    onClick={() => applyDatePreset('parcela-frac-set', '2026-09-01', '2026-09-30')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'parcela-frac-set'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Parcela Fracionada: Setembro
                  </button>
                  <button
                    onClick={() => applyDatePreset('parcela-frac-out', '2026-10-01', '2026-10-31')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodPreset === 'parcela-frac-out'
                        ? 'bg-[#002747] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Parcela Fracionada: Outubro
                  </button>
                </>
              )}
            </div>

            {/* Campos de Data Customizada */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPeriodPreset('custom');
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPeriodPreset('custom');
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none font-medium"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Aulas encontradas no calendário: <strong className="text-slate-900">{matchedLessons.length} aulas</strong>
              </span>
              <button
                onClick={() => setShowCalendarBreakdown(!showCalendarBreakdown)}
                className="text-[11px] font-bold text-[#002747] hover:underline flex items-center space-x-1"
              >
                <span>{showCalendarBreakdown ? 'Ocultar Aulas' : 'Ver Aulas do Período'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCalendarBreakdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* LADO DIREITO: SELETOR DE TURMAS COM FILTRO DE ATIVA / INATIVA */}
          <div className="lg:col-span-6 space-y-3 border-t lg:border-t-0 lg:border-l lg:pl-5 border-slate-200/80 pt-4 lg:pt-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-extrabold text-[#002747] flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-[#ff8928]" />
                <span>2. Seleção de Turmas Atendidas</span>
              </label>

              {/* Botões de Ação Rápida de Turmas */}
              <div className="flex items-center space-x-1.5 text-[11px]">
                <button
                  onClick={handleSelectAllActive}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Somente Ativas
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={handleSelectAllVisible}
                  className="text-blue-700 font-bold hover:underline"
                >
                  Todas
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-slate-500 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Flag / Filtro de Status de Turmas (Requisito da reunião) */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setClassFilterMode('ativas')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                  classFilterMode === 'ativas'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Turmas Ativas ({classes.filter((c) => c.status === 'ativa').length})</span>
              </button>
              <button
                onClick={() => setClassFilterMode('todas')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  classFilterMode === 'todas'
                    ? 'bg-[#002747] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({classes.length})
              </button>
              <button
                onClick={() => setClassFilterMode('inativas')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  classFilterMode === 'inativas'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inativas / Concluídas ({classes.filter((c) => c.status !== 'ativa').length})
              </button>
            </div>

            {/* Lista de Checkboxes de Turmas */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200/70 rounded-xl p-2 bg-slate-50/50">
              {filteredClassesList.map((cls) => {
                const isSelected = selectedClassIds.includes(cls.id);
                const isActive = cls.status === 'ativa';

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleToggleClassSelection(cls.id)}
                    className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#002747] shadow-xs'
                        : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-[#002747] focus:ring-[#002747]"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900">{cls.name}</span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {cls.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Turno: {cls.shift} • {cls.studentCount} alunos • {cls.kitchenRoom}
                        </span>
                      </div>
                    </div>

                    {/* Status Flag */}
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isActive ? 'Ativa' : 'Inativa'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>{selectedClassIds.length} turma(s) selecionada(s) para o lote de compras</span>
              <span className="text-emerald-700 font-medium">Turmas ativas filtradas automaticamente</span>
            </div>
          </div>
        </div>

        {/* Breakdown de Aulas Encontradas no Calendário (Colapsável) */}
        {showCalendarBreakdown && (
          <div className="pt-3 border-t border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#ff8928]" />
              <span>Aulas Práticas Mapeadas na Grade Escolar ({matchedLessons.length})</span>
            </h4>
            {matchedLessons.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Nenhuma aula agendada para o período e turmas selecionadas. Experimente ajustar as datas ou selecionar mais turmas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {matchedLessons.map((l) => (
                  <div
                    key={l.id}
                    className="p-2 bg-white rounded-xl border border-slate-200 text-xs shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#002747]">{l.classCode}</span>
                      <span className="font-semibold text-slate-500 text-[10px]">
                        {new Date(`${l.date}T00:00:00`).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 text-[11px] truncate">
                      {l.recipeName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {l.instructorName} • {l.ingredients.length} insumos previstos
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Métricas Resumidas do Lote de Compras */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Insumos Únicos</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-slate-900">{totalUniqueItems}</p>
          <span className="text-[10px] text-slate-500">Filtrados por {activeCycle.title}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Turmas Atendidas</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900">{selectedClassIds.length}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Turmas ativas no período</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Aulas no Calendário</span>
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-black text-slate-900">{matchedLessons.length}</p>
          <span className="text-[10px] text-slate-500">Sessões práticas mapeadas</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Custo Previsto</span>
            <DollarSign className="w-4 h-4 text-[#ff8928]" />
          </div>
          <p className="text-xl font-black text-[#002747]">
            R$ {grandTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">Estimativa para reposição</span>
        </div>
      </div>

      {/* 5. Tabela Detalhada com Soma Total dos Insumos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Barra de Ferramentas da Tabela */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#002747]">
              Itens Consolidados para Aquisição
            </h3>
            <p className="text-xs text-slate-500">
              Soma total calculada a partir do consumo de receitas nas aulas e estoque disponível
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar insumo..."
              value={itemSearchQuery}
              onChange={(e) => setItemSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
            />
          </div>
        </div>

        {displayedReportItems.length === 0 ? (
          <div className="text-center py-12 px-4">
            <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum insumo encontrado</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Não há receitas agendadas com insumos de {activeCycle.title} para as turmas e período selecionados. Selecione um período diferente ou adicione turmas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">Insumo / Categoria</th>
                  <th className="px-3 py-3 text-center">Unidade</th>
                  <th className="px-3 py-3 text-right">Demanda Aulas</th>
                  <th className="px-3 py-3 text-right">Estoque Atual</th>
                  <th className="px-3 py-3 text-right">Estoque Mínimo</th>
                  <th className="px-4 py-3 text-right font-extrabold text-[#002747]">
                    Sugestão de Compra
                  </th>
                  <th className="px-4 py-3 text-right">Custo Estimado</th>
                  <th className="px-3 py-3 text-center">Detalhamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedReportItems.map((item) => {
                  const isExpanded = expandedItemId === item.stockItemId;
                  const needsPurchase = item.suggestedPurchase > 0;

                  return (
                    <React.Fragment key={item.stockItemId}>
                      <tr
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isExpanded ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <span className="text-[10px] text-slate-500">{item.category}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 font-semibold rounded text-slate-700">
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-900">
                          {item.totalRequired.toFixed(2)} {item.unit}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-slate-600">
                          {item.currentStock.toFixed(2)} {item.unit}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-500">
                          {item.minSafetyStock.toFixed(2)} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {needsPurchase ? (
                            <span className="font-black text-[#002747] bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
                              {item.suggestedPurchase.toFixed(2)} {item.unit}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold flex items-center justify-end space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Estoque Suficiente</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          R$ {item.totalCost.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.stockItemId)
                            }
                            className="p-1 text-slate-500 hover:text-[#002747] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Ver turmas que consom este item"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isExpanded ? 'rotate-180 text-[#002747]' : ''
                              }`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Linha Expandida: Detalhamento por Turma */}
                      {isExpanded && (
                        <tr className="bg-blue-50/20">
                          <td colSpan={8} className="px-6 py-3 border-y border-blue-100">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#002747] flex items-center space-x-1.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-[#ff8928]" />
                                  <span>Distribuição por Turmas de Gastronomia:</span>
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Item utilizado em {item.lessonsCount} aula(s) programada(s)
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {item.classesBreakdown.map((cb) => (
                                  <div
                                    key={cb.classId}
                                    className="p-2 bg-white rounded-xl border border-blue-200/80 text-xs shadow-xs flex items-center justify-between"
                                  >
                                    <div>
                                      <span className="font-bold text-slate-900 block">
                                        {cb.className}
                                      </span>
                                      <span className="text-[10px] text-slate-500">{cb.classCode}</span>
                                    </div>
                                    <span className="font-extrabold text-[#002747] bg-blue-50 px-2 py-0.5 rounded">
                                      {cb.quantityNeeded.toFixed(2)} {item.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
