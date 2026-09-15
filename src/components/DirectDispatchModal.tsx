import React, { useState } from 'react';
import { Send, X, Plus, Check, Package, GraduationCap, User, Utensils, MessageSquare } from 'lucide-react';
import { StockUnit } from '../types';
import { useApp } from '../context/AppContext';

interface DirectDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClassId?: string;
  preselectedInstructorId?: string;
}

export const DirectDispatchModal: React.FC<DirectDispatchModalProps> = ({
  isOpen,
  onClose,
  preselectedClassId,
  preselectedInstructorId,
}) => {
  const { classes, instructors, stockItems, utensils, createDirectDispatch } = useApp();

  const [selectedClassId, setSelectedClassId] = useState(
    preselectedClassId || classes[0]?.id || ''
  );
  const [selectedInstructorId, setSelectedInstructorId] = useState(
    preselectedInstructorId || instructors[0]?.id || ''
  );
  const [notes, setNotes] = useState('');
  const [adminDispatchNotes, setAdminDispatchNotes] = useState('');

  // Active section tab: 'insumos' or 'utensilios'
  const [dispatchTab, setDispatchTab] = useState<'insumos' | 'utensilios'>('insumos');

  // Stock items to dispatch
  const [dispatchItems, setDispatchItems] = useState<
    { stockItemId: string; quantity: number; unit: StockUnit }[]
  >([]);
  const [tempStockItemId, setTempStockItemId] = useState(stockItems[0]?.id || '');
  const [tempQuantity, setTempQuantity] = useState(1);

  // Utensils to dispatch
  const [dispatchUtensils, setDispatchUtensils] = useState<
    { utensilId: string; quantity: number }[]
  >([]);
  const [tempUtensilId, setTempUtensilId] = useState(utensils[0]?.id || '');
  const [tempUtensilQty, setTempUtensilQty] = useState(1);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!tempStockItemId || tempQuantity <= 0) return;
    const stock = stockItems.find((s) => s.id === tempStockItemId);
    if (!stock) return;

    const existingIndex = dispatchItems.findIndex((it) => it.stockItemId === tempStockItemId);
    if (existingIndex !== -1) {
      const updated = [...dispatchItems];
      updated[existingIndex].quantity += tempQuantity;
      setDispatchItems(updated);
    } else {
      setDispatchItems([
        ...dispatchItems,
        {
          stockItemId: tempStockItemId,
          quantity: tempQuantity,
          unit: stock.unit,
        },
      ]);
    }
    setTempQuantity(1);
  };

  const handleAddUtensil = () => {
    if (!tempUtensilId || tempUtensilQty <= 0) return;
    const existingIndex = dispatchUtensils.findIndex((u) => u.utensilId === tempUtensilId);
    if (existingIndex !== -1) {
      const updated = [...dispatchUtensils];
      updated[existingIndex].quantity += tempUtensilQty;
      setDispatchUtensils(updated);
    } else {
      setDispatchUtensils([
        ...dispatchUtensils,
        {
          utensilId: tempUtensilId,
          quantity: tempUtensilQty,
        },
      ]);
    }
    setTempUtensilQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setDispatchItems(dispatchItems.filter((_, idx) => idx !== index));
  };

  const handleRemoveUtensil = (index: number) => {
    setDispatchUtensils(dispatchUtensils.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedInstructorId || (dispatchItems.length === 0 && dispatchUtensils.length === 0)) {
      alert('Selecione uma turma, um instrutor e adicione ao menos um insumo ou utensílio para enviar.');
      return;
    }

    createDirectDispatch({
      classId: selectedClassId,
      instructorId: selectedInstructorId,
      items: dispatchItems,
      utensils: dispatchUtensils,
      notes: notes || 'Envio direto avulso para a bancada da aula prática.',
      adminDispatchNotes: adminDispatchNotes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 bg-[#002747] text-white flex items-center justify-between border-b border-[#00192e]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff8928] flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Despachar Itens & Utensílios</h3>
              <p className="text-xs text-blue-200">
                Envio imediato pelo Administrador SIGEC com registro de notas do almoxarife
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-slate-800 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Turma de Destino *
              </label>
              <select
                required
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  const c = classes.find((cl) => cl.id === e.target.value);
                  if (c?.instructorId) {
                    setSelectedInstructorId(c.instructorId);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.shift})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chef Instrutor Responsável *
              </label>
              <select
                required
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Tabs for Insumos vs Utensilios */}
          <div className="flex border-b border-slate-200 pt-1">
            <button
              type="button"
              onClick={() => setDispatchTab('insumos')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
                dispatchTab === 'insumos'
                  ? 'border-[#ff8928] text-[#002747]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Insumos & Ingredientes ({dispatchItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setDispatchTab('utensilios')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
                dispatchTab === 'utensilios'
                  ? 'border-[#ff8928] text-[#002747]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Utensílios de Cozinha ({dispatchUtensils.length})</span>
            </button>
          </div>

          {/* Tab 1: Insumos */}
          {dispatchTab === 'insumos' && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  Selecionar Insumos para Envio ({dispatchItems.length})
                </h4>
                <span className="text-[10px] text-slate-500">Saldo atual do estoque</span>
              </div>

              <div className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="col-span-7">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Item de Cozinha
                  </label>
                  <select
                    value={tempStockItemId}
                    onChange={(e) => setTempStockItemId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {stockItems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.currentQuantity} {s.unit} disp.)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Qtd</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>

                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {dispatchItems.map((item, idx) => {
                  const stock = stockItems.find((s) => s.id === item.stockItemId);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-800">{stock?.name || 'Insumo'}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-600 font-bold">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {dispatchItems.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-1">
                    Nenhum insumo adicionado.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Utensílios */}
          {dispatchTab === 'utensilios' && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  Utensílios de Cozinha para a Bancada ({dispatchUtensils.length})
                </h4>
                <span className="text-[10px] text-slate-500">Todos os tipos de utensílios</span>
              </div>

              <div className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="col-span-7">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Utensílio / Equipamento
                  </label>
                  <select
                    value={tempUtensilId}
                    onChange={(e) => setTempUtensilId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {utensils.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.category} • {u.totalQuantity} disp.)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={tempUtensilQty}
                    onChange={(e) => setTempUtensilQty(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>

                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={handleAddUtensil}
                    className="w-full py-1.5 rounded-lg bg-[#002747] hover:bg-[#00192e] text-white text-xs font-bold shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {dispatchUtensils.map((u, idx) => {
                  const ut = utensils.find((item) => item.id === u.utensilId);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{ut?.name || 'Utensílio'}</span>
                        <span className="text-[10px] text-slate-400 block">{ut?.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-800 font-bold">
                          {u.quantity} {ut?.unit || 'un'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUtensil(idx)}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {dispatchUtensils.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-1">
                    Nenhum utensílio adicionado.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Campo de Observações do Administrador no Envio */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1.5">
            <label className="block text-xs font-bold text-amber-900 flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#ff8928]" />
              <span>Observações do Administrador no Envio dos Itens</span>
            </label>
            <p className="text-[10px] text-amber-800 leading-tight">
              Registre anotações da expedição (ex: conferência de lâminas afiadas, lote especial ou orientações de manuseio e devolução).
            </p>
            <input
              type="text"
              placeholder="Ex: Entregue diretamente ao chef na bancada do ateliê com kit de facas calibrado..."
              value={adminDispatchNotes}
              onChange={(e) => setAdminDispatchNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white outline-none focus:border-[#ff8928]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ff8928] hover:bg-[#eb7717] text-white shadow-md shadow-orange-500/30 flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Despachar Itens & Utensílios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

