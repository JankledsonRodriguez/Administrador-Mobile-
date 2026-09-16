import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  DollarSign,
  Send,
  X,
  Check,
} from 'lucide-react';
import { StockItem, StockCategory, StockUnit } from '../../types';
import { useApp } from '../../context/AppContext';

const CATEGORIES: (StockCategory | 'Todas')[] = [
  'Todas',
  'Secos e Farinhas',
  'Laticínios e Frios',
  'Hortifruti',
  'Carnes e Pescados',
  'Óleos e Condimentos',
  'Bebidas e Líquidos',
  'Confeitaria e Chocolates',
  'Descartáveis e Higiene',
];

const UNITS: StockUnit[] = ['kg', 'g', 'L', 'ml', 'un', 'pct', 'cx', 'lata'];

interface StockViewProps {
  onOpenDirectDispatch?: () => void;
}

export const StockView: React.FC<StockViewProps> = ({ onOpenDirectDispatch }) => {
  const { stockItems, addStockItem, updateStockItem, deleteStockItem, adjustStockQuantity } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | 'Todas'>('Todas');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Secos e Farinhas' as StockCategory,
    currentQuantity: 0,
    minQuantity: 5,
    unit: 'kg' as StockUnit,
    location: '',
    expiryDate: '',
    costPerUnit: 0,
  });

  const [adjustModalItem, setAdjustModalItem] = useState<StockItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');

  // Filter items
  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todas' || item.category === selectedCategory;

    const matchesLowStock = onlyLowStock ? item.currentQuantity <= item.minQuantity : true;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = stockItems.filter((i) => i.currentQuantity <= i.minQuantity).length;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Secos e Farinhas',
      currentQuantity: 10,
      minQuantity: 5,
      unit: 'kg',
      location: 'Despensa Seca',
      expiryDate: '',
      costPerUnit: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentQuantity: item.currentQuantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      location: item.location,
      expiryDate: item.expiryDate || '',
      costPerUnit: item.costPerUnit || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      updateStockItem(editingItem.id, {
        name: formData.name,
        category: formData.category,
        currentQuantity: Number(formData.currentQuantity),
        minQuantity: Number(formData.minQuantity),
        unit: formData.unit,
        location: formData.location || 'Estoque Geral',
        expiryDate: formData.expiryDate || undefined,
        costPerUnit: Number(formData.costPerUnit) || 0,
      });
    } else {
      addStockItem({
        name: formData.name,
        category: formData.category,
        currentQuantity: Number(formData.currentQuantity),
        minQuantity: Number(formData.minQuantity),
        unit: formData.unit,
        location: formData.location || 'Estoque Geral',
        expiryDate: formData.expiryDate || undefined,
        costPerUnit: Number(formData.costPerUnit) || 0,
      });
    }
    setIsModalOpen(false);
  };

  const handleConfirmAdjust = () => {
    if (!adjustModalItem) return;
    const delta = adjustType === 'add' ? Number(adjustAmount) : -Number(adjustAmount);
    adjustStockQuantity(adjustModalItem.id, delta);
    setAdjustModalItem(null);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top Banner & Primary Stats */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#002747] text-white flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5 text-[#ff8928]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#002747] tracking-tight">
                Gerenciamento de Estoque da Cozinha
              </h2>
              <p className="text-xs text-slate-500">
                Cadastre, edite e monitore insumos, ingredientes e validades do SIGEC
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {onOpenDirectDispatch && (
            <button
              onClick={onOpenDirectDispatch}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#ff8928] hover:bg-[#eb7717] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar ao Instrutor</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#002747] hover:bg-[#00192e] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#ff8928]" />
            <span>Cadastrar Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Itens</span>
          <span className="text-lg font-extrabold text-blue-900">{stockItems.length}</span>
          <span className="text-[10px] text-slate-400 block">cadastrados</span>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            onlyLowStock
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-400/30'
              : 'bg-white border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Alerta Estoque</span>
            {lowStockCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            )}
          </div>
          <span
            className={`text-lg font-extrabold ${
              lowStockCount > 0 ? 'text-orange-600' : 'text-slate-700'
            }`}
          >
            {lowStockCount}
          </span>
          <span className="text-[10px] text-orange-600 font-medium block">
            {onlyLowStock ? 'Filtrando ativos' : 'abaixo do mínimo'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Categorias</span>
          <span className="text-lg font-extrabold text-slate-800">
            {new Set(stockItems.map((i) => i.category)).size}
          </span>
          <span className="text-[10px] text-slate-400 block">grupos ativos</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, código (ex: EST-001) ou local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable category pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 p-6">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum item de estoque encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Tente alterar os filtros ou cadastre um novo item.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Insumo</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLow = item.currentQuantity <= item.minQuantity;
            const percentage = Math.min(
              100,
              Math.round((item.currentQuantity / (item.minQuantity * 2 || 10)) * 100)
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-100 p-3.5 shadow-xs hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      {isLow && (
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                          Estoque Baixo
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h3>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
                      </span>
                      {item.expiryDate && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Validade: {item.expiryDate}</span>
                        </span>
                      )}
                      {Boolean(item.costPerUnit && item.costPerUnit > 0) && (
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 text-slate-400" />
                          <span>R$ {item.costPerUnit.toFixed(2)}/{item.unit}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Editar Item"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja realmente excluir ${item.name}?`)) {
                          deleteStockItem(item.id);
                        }
                      }}
                      title="Excluir Item"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Quantity Controller Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline space-x-1">
                      <span
                        className={`text-base font-extrabold ${
                          isLow ? 'text-orange-600' : 'text-slate-900'
                        }`}
                      >
                        {item.currentQuantity}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        (Mín: {item.minQuantity} {item.unit})
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-28 sm:w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          isLow ? 'bg-orange-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Fast stepper buttons */}
                  <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200/60">
                    <button
                      onClick={() => adjustStockQuantity(item.id, -1)}
                      title="Diminuir 1 unidade"
                      className="w-7 h-7 rounded bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shadow-xs"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => {
                        setAdjustModalItem(item);
                        setAdjustAmount(1);
                        setAdjustType('add');
                      }}
                      title="Ajuste rápido de quantidade"
                      className="px-2 h-7 rounded text-[11px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors flex items-center space-x-0.5"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Ajustar</span>
                    </button>
                    <button
                      onClick={() => adjustStockQuantity(item.id, 1)}
                      title="Adicionar 1 unidade"
                      className="w-7 h-7 rounded bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shadow-xs"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Cadastrar / Editar Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingItem ? `Editar Item (${editingItem.code})` : 'Cadastrar Item no Estoque'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Item / Insumo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Farinha de Trigo Especial 00, Manteiga..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as StockCategory })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'Todas').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Medida
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value as StockUnit })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade Atual ({formData.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.currentQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, currentQuantity: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Mínimo de Segurança
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.minQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, minQuantity: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Localização na Despensa/Câmara
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Câmara Fria 01, Prateleira B..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Validade (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custo Estimado por {formData.unit} (R$, opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.costPerUnit || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002747] hover:bg-[#00192e] text-white shadow-sm flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#ff8928]" />
                  <span>{editingItem ? 'Salvar Alterações' : 'Cadastrar Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajuste Rápido de Quantidade */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-sm">
              Ajuste de Estoque - {adjustModalItem.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estoque atual: <strong className="text-blue-700">{adjustModalItem.currentQuantity} {adjustModalItem.unit}</strong>
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex rounded-xl overflow-hidden border border-slate-200 p-0.5 bg-slate-100">
                <button
                  onClick={() => setAdjustType('add')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    adjustType === 'add'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Entrada (Adicionar)
                </button>
                <button
                  onClick={() => setAdjustType('remove')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    adjustType === 'remove'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - Saída (Retirar)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade a {adjustType === 'add' ? 'adicionar' : 'subtrair'} ({adjustModalItem.unit}):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                Novo saldo previsto:{' '}
                <strong className="text-slate-900">
                  {adjustType === 'add'
                    ? Math.round((adjustModalItem.currentQuantity + adjustAmount) * 100) / 100
                    : Math.max(0, Math.round((adjustModalItem.currentQuantity - adjustAmount) * 100) / 100)}{' '}
                  {adjustModalItem.unit}
                </strong>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setAdjustModalItem(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAdjust}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
