import React, { useState } from 'react';
import {
  History,
  Truck,
  Search,
  Printer,
  FileCheck,
  Calendar,
  GraduationCap,
  User,
  MapPin,
  Package,
  X,
  CheckCircle2,
  Share2,
  Utensils,
  MessageSquare,
} from 'lucide-react';
import { DispatchRecord } from '../../types';
import { useApp } from '../../context/AppContext';

export const DispatchHistoryView: React.FC = () => {
  const { dispatches, classes, instructors, utensils } = useApp();

  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('todas');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('todos');

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<DispatchRecord | null>(null);

  // Filter logic
  const filteredDispatches = dispatches.filter((disp) => {
    const matchesSearch =
      disp.code.toLowerCase().includes(search.toLowerCase()) ||
      disp.className.toLowerCase().includes(search.toLowerCase()) ||
      disp.instructorName.toLowerCase().includes(search.toLowerCase()) ||
      disp.kitchenRoom.toLowerCase().includes(search.toLowerCase()) ||
      disp.items.some((it) => it.name.toLowerCase().includes(search.toLowerCase()));

    const matchesClass =
      selectedClassId === 'todas' || disp.classId === selectedClassId;

    const matchesInstructor =
      selectedInstructorId === 'todos' || disp.instructorId === selectedInstructorId;

    return matchesSearch && matchesClass && matchesInstructor;
  });

  const totalItemsCount = dispatches.reduce(
    (acc, d) => acc + d.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#002747] text-white flex items-center justify-center shadow-xs">
            <History className="w-5 h-5 text-[#ff8928]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#002747] tracking-tight">
              Histórico de Envios & Despachos
            </h2>
            <p className="text-xs text-slate-500">
              Registro gerencial completo de todos os insumos entregues aos instrutores e turmas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-[#002747] border border-slate-200">
            {dispatches.length} Registros de Despacho
          </span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Despachos</span>
          <span className="text-lg font-extrabold text-blue-900">{dispatches.length}</span>
          <span className="text-[10px] text-slate-400 block">remessas enviadas</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Volume Despachado</span>
          <span className="text-lg font-extrabold text-orange-600">
            {Math.round(totalItemsCount * 10) / 10}
          </span>
          <span className="text-[10px] text-slate-400 block">quantidades de insumos</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Status Médio</span>
          <span className="text-sm font-extrabold text-emerald-600 mt-1 block">100% Entregue</span>
          <span className="text-[10px] text-slate-400 block">sem extravios</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código de envio (ENV-2026-...), instrutor, insumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filtrar por Turma:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="todas">Todas as Turmas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filtrar por Instrutor:
            </label>
            <select
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="todos">Todos os Chefs / Instrutores</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dispatches List */}
      <div className="space-y-3">
        {filteredDispatches.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 p-6">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum envio registrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Quando você aprovar uma requisição ou fizer um envio direto, o histórico será registrado aqui.
            </p>
          </div>
        ) : (
          filteredDispatches.map((disp) => (
            <div
              key={disp.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:border-blue-200 transition-all space-y-3"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[11px] font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                      {disp.code}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{disp.dispatchedAt}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Entregue na Cozinha</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-700 mt-2 flex-wrap">
                    <span className="flex items-center space-x-1">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-bold">{disp.className}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-orange-500" />
                      <span>{disp.instructorName}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{disp.kitchenRoom}</span>
                    </span>
                  </div>
                </div>

                {/* Print/View receipt button */}
                <button
                  onClick={() => setActiveReceipt(disp)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center space-x-1 transition-colors border border-blue-200/60"
                  title="Ver Comprovante Oficial"
                >
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Comprovante</span>
                </button>
              </div>

              {/* Items in this dispatch */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Insumos Entregues ({disp.items.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {disp.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200/60"
                      >
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <span className="font-bold text-slate-900 ml-2">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utensils in this dispatch if any */}
                {disp.utensils && disp.utensils.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider flex items-center space-x-1 mb-1">
                      <Utensils className="w-3 h-3" />
                      <span>Utensílios Entregues ({disp.utensils.length}):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {disp.utensils.map((ut, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200/60 text-xs font-semibold"
                        >
                          <span>{ut.name}</span>
                          <strong className="text-blue-700 font-extrabold">({ut.quantity} {ut.unit})</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Dispatch Notes Highlight */}
              {disp.adminDispatchNotes && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs flex items-start space-x-2 text-amber-900">
                  <MessageSquare className="w-3.5 h-3.5 text-[#ff8928] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800">
                      Observações do Administrador no Envio:
                    </span>
                    <p className="italic text-slate-800 mt-0.5 leading-relaxed">
                      "{disp.adminDispatchNotes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Footer info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                {disp.notes && <span className="italic">"{disp.notes}"</span>}
                <span className="text-slate-400 ml-auto">
                  Liberado por: <strong className="text-slate-600">{disp.dispatchedBy}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMPROVANTE DE ENTREGA / GUIA OFICIAL MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-[#002747] text-white flex items-center justify-between border-b border-[#00192e]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#ff8928] tracking-wider">
                  Guia Oficial de Expedição • SIGEC
                </span>
                <h3 className="font-bold text-base">Comprovante de Despacho de Insumos</h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800">
              {/* Receipt Header details */}
              <div className="border-b border-dashed border-slate-300 pb-3 flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-extrabold text-[#002747] text-sm">SIGEC • Almoxarifado Central</h4>
                  <p className="text-slate-500">Gestão de Cozinha & Aulas Práticas</p>
                  <p className="text-slate-500">Data/Hora: {activeReceipt.dispatchedAt}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#ff8928] block">
                    {activeReceipt.code}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Entregue com Sucesso
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Turma:</span>
                  <strong className="text-slate-900">{activeReceipt.className}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chef Instrutor:</span>
                  <strong className="text-slate-900">{activeReceipt.instructorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Local de Destino:</span>
                  <strong className="text-slate-900">{activeReceipt.kitchenRoom}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Despachado por:</span>
                  <strong className="text-slate-900">{activeReceipt.dispatchedBy}</strong>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                      <th className="py-2">Item / Insumo</th>
                      <th className="py-2 text-right">Qtd Entregue</th>
                      <th className="py-2 text-center w-12">Conferido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReceipt.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-medium text-slate-900">{it.name}</td>
                        <td className="py-2 text-right font-bold text-slate-900">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="py-2 text-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Utensils Table if present */}
              {activeReceipt.utensils && activeReceipt.utensils.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider flex items-center space-x-1 mb-1">
                    <Utensils className="w-3 h-3" />
                    <span>Utensílios & Equipamentos de Cozinha:</span>
                  </span>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                        <th className="py-2">Utensílio / Equipamento</th>
                        <th className="py-2 text-right">Qtd Entregue</th>
                        <th className="py-2 text-center w-12">Conferido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeReceipt.utensils.map((u, idx) => (
                        <tr key={idx}>
                          <td className="py-2 font-medium text-slate-900">{u.name}</td>
                          <td className="py-2 text-right font-bold text-blue-900">
                            {u.quantity} {u.unit}
                          </td>
                          <td className="py-2 text-center">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    * Utensílios devem ser higienizados e devolvidos ao almoxarifado ao final do turno da aula.
                  </p>
                </div>
              )}

              {/* Admin Dispatch Notes in Receipt */}
              {activeReceipt.adminDispatchNotes && (
                <div className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 space-y-0.5">
                  <strong className="text-amber-800 block uppercase text-[10px] tracking-wider">
                    Observações do Administrador no Envio:
                  </strong>
                  <p className="italic text-slate-800">
                    "{activeReceipt.adminDispatchNotes}"
                  </p>
                </div>
              )}

              {activeReceipt.notes && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <strong>Finalidade / Notas Gerais:</strong> {activeReceipt.notes}
                </div>
              )}

              {/* Signatures simulation */}
              <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                <div>
                  <div className="border-b border-slate-300 mb-1 h-8" />
                  <span>Visto do Almoxarife</span>
                </div>
                <div>
                  <div className="border-b border-slate-300 mb-1 h-8" />
                  <span>Assinatura do Chef Recebedor</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Fechar
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprovante</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
