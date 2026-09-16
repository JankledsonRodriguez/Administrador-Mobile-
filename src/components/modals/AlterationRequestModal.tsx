import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Check,
  XCircle,
  FileText,
  Clock,
  User,
  GraduationCap,
  Sparkles,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { ClassAlterationRequest, Requisition } from '../../types';
import { useApp } from '../../context/AppContext';

interface AlterationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Requisition;
  mode: 'review' | 'create'; // review by admin, or create by instructor
}

export const AlterationRequestModal: React.FC<AlterationRequestModalProps> = ({
  isOpen,
  onClose,
  requisition,
  mode,
}) => {
  const {
    classes,
    instructors,
    reviewClassAlterationRequest,
    submitClassAlterationRequest,
    permissionSettings,
  } = useApp();

  const reqClass = classes.find((c) => c.id === requisition.classId);
  const reqInstructor = instructors.find((i) => i.id === requisition.instructorId);

  // Review mode state
  const [decisionNotes, setDecisionNotes] = useState('');

  // Create mode state
  const [altType, setAltType] = useState<ClassAlterationRequest['type']>('substituicao_insumo_utensilio');
  const [title, setTitle] = useState('');
  const [previousValue, setPreviousValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleReviewSubmit = (decision: 'autorizado' | 'recusado') => {
    reviewClassAlterationRequest(requisition.id, decision, decisionNotes);
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reason.trim()) {
      alert('Por favor, preencha o resumo e a justificativa da alteração.');
      return;
    }

    submitClassAlterationRequest(requisition.id, {
      type: altType,
      title,
      reason,
      previousValue: previousValue || undefined,
      newValue: newValue || undefined,
    });
    onClose();
  };

  const existingRequest = requisition.alterationRequest;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#002747] text-white flex items-center justify-between border-b border-[#00192e]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff8928] flex items-center justify-center text-white">
              {mode === 'review' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {mode === 'review'
                  ? 'Avaliar Alteração na Aula'
                  : 'Solicitar Alteração na Aula Prática'}
              </h3>
              <p className="text-xs text-blue-200">
                {requisition.code} • {reqClass?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {mode === 'review' && existingRequest ? (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
            {/* Request Summary Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {existingRequest.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                  {existingRequest.status === 'pendente'
                    ? 'Aguardando Avaliação'
                    : existingRequest.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block">Chef Solicitante:</span>
                  <strong className="text-slate-800">{reqInstructor?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Solicitado em:</span>
                  <span className="font-semibold text-slate-800">{existingRequest.requestedAt}</span>
                </div>
              </div>

              {/* Old vs New */}
              {(existingRequest.previousValue || existingRequest.newValue) && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Planejamento Anterior
                    </span>
                    <span className="font-medium text-slate-700">
                      {existingRequest.previousValue || 'Não especificado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 block uppercase">
                      Nova Configuração Solicitada
                    </span>
                    <span className="font-bold text-slate-900">
                      {existingRequest.newValue || 'Não especificado'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                  Justificativa Pedagógica do Instrutor:
                </span>
                <p className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200/60 text-slate-800 italic leading-relaxed">
                  "{existingRequest.reason}"
                </p>
              </div>
            </div>

            {/* Permission Policy Notice */}
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 space-y-1">
              <span className="font-bold text-[11px] block flex items-center space-x-1">
                <span>Diretriz Atual de Governança:</span>
              </span>
              <p className="text-[11px] text-blue-800">
                {permissionSettings.requireAdminApprovalForAnyChange
                  ? '• Todas as alterações de aula necessitam de despacho formal registrado.'
                  : '• Instrutor possui autonomia parcial sob homologação.'}
                {' '}Prazo de aviso configurado: <strong>{permissionSettings.minNoticeHoursForAlteration}h</strong>.
              </p>
            </div>

            {/* Deliberation Notes Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parecer / Observações da Administração *
              </label>
              <textarea
                rows={3}
                placeholder="Registre as notas do parecer (ex: Autorizada a troca do fogão por indução e acréscimo de 2 batedeiras. Organizado na bancada fria 01)..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-[#ff8928]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleReviewSubmit('recusado')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Recusar Alteração</span>
              </button>

              <button
                type="button"
                onClick={() => handleReviewSubmit('autorizado')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ff8928] hover:bg-[#eb7717] text-white shadow-md shadow-orange-500/30 flex items-center space-x-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Autorizar Alteração</span>
              </button>
            </div>
          </div>
        ) : (
          /* CREATE MODE (by Instructor) */
          <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-slate-800 text-xs">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200/80 text-blue-900">
              <p className="leading-relaxed">
                Utilize este formulário para solicitar à gerência do almoxarifado qualquer alteração na dinâmica da aula prática (troca de sala, substituição de utensílios, ajuste de insumos ou horários).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Alteração na Aula *
              </label>
              <select
                value={altType}
                onChange={(e) => setAltType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none"
              >
                <option value="substituicao_insumo_utensilio">
                  Utensílios & Insumos (Adição ou Substituição)
                </option>
                <option value="mudanca_sala">Mudança de Sala / Laboratório</option>
                <option value="troca_receita">Substituição de Ficha Técnica / Receita</option>
                <option value="horario">Ajuste de Horário / Turno</option>
                <option value="outro">Outra Necessidade Operacional</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Título do Pedido *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Troca de 2 batedeiras por processador e espátulas de silicone..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Configuração Anterior (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sala 01 - Cozinha Quente"
                  value={previousValue}
                  onChange={(e) => setPreviousValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nova Configuração Desejada (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sala 03 - Ateliê de Confeitaria"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Justificativa Pedagógica Detalhada *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Descreva o motivo pedagógico da alteração para análise da administração..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
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
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002747] hover:bg-[#00192e] text-white shadow-md flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5 text-[#ff8928]" />
                <span>Enviar Solicitação à Administração</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
