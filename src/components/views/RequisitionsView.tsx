import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  GraduationCap,
  Package,
  FileText,
  X,
  Check,
  ChefHat,
  Search,
  Filter,
  Utensils,
  Shield,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Requisition, StockUnit, RequisitionStatus, KitchenUtensil } from '../../types';
import { useApp } from '../../context/AppContext';
import { PermissionsSettingsModal } from '../modals/PermissionsSettingsModal';
import { AlterationRequestModal } from '../modals/AlterationRequestModal';

interface RequisitionsViewProps {
  initialPreselectedClassId?: string;
  initialPreselectedInstructorId?: string;
  onOpenDirectDispatch?: () => void;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  initialPreselectedClassId,
  initialPreselectedInstructorId,
  onOpenDirectDispatch,
}) => {
  const {
    requisitions,
    classes,
    instructors,
    stockItems,
    utensils,
    permissionSettings,
    createRequisition,
    approveAndDispatchRequisition,
    rejectRequisition,
    submitClassAlterationRequest,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'todas' | 'pendente' | 'enviado' | 'rejeitado'>('pendente');
  const [search, setSearch] = useState('');

  // Modals state
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [alterationModalData, setAlterationModalData] = useState<{
    req: Requisition;
    mode: 'review' | 'create';
  } | null>(null);

  // Review & Approval Modal state
  const [analyzingReq, setAnalyzingReq] = useState<Requisition | null>(null);
  const [approvedQuantities, setApprovedQuantities] = useState<{ [stockItemId: string]: number }>({});
  const [approvedUtensilQuantities, setApprovedUtensilQuantities] = useState<{ [utensilId: string]: number }>({});
  const [adminDispatchNotes, setAdminDispatchNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // New Requisition Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<'insumos' | 'utensilios'>('insumos');
  const [newClassId, setNewClassId] = useState(
    initialPreselectedClassId || classes[0]?.id || ''
  );
  const [newInstructorId, setNewInstructorId] = useState(
    initialPreselectedInstructorId || instructors[0]?.id || ''
  );
  const [newPurpose, setNewPurpose] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newItems, setNewItems] = useState<{ stockItemId: string; requestedQuantity: number; unit: StockUnit }[]>([]);
  const [newUtensils, setNewUtensils] = useState<{ utensilId: string; requestedQuantity: number }[]>([]);

  // Class alteration toggle inside new requisition
  const [hasAlterationFlag, setHasAlterationFlag] = useState(false);
  const [altType, setAltType] = useState<any>('substituicao_insumo_utensilio');
  const [altTitle, setAltTitle] = useState('');
  const [altReason, setAltReason] = useState('');

  // Temp item adder for new requisition
  const [tempItemId, setTempItemId] = useState(stockItems[0]?.id || '');
  const [tempQty, setTempQty] = useState(1);

  // Temp utensil adder for new requisition
  const [tempUtensilCategory, setTempUtensilCategory] = useState<string>('todos');
  const [tempUtensilId, setTempUtensilId] = useState(utensils[0]?.id || '');
  const [tempUtensilQty, setTempUtensilQty] = useState(1);

  // Filter requisitions
  const filteredRequisitions = requisitions.filter((req) => {
    const matchesFilter =
      activeFilter === 'todas' || req.status === activeFilter;

    const classObj = classes.find((c) => c.id === req.classId);
    const instructorObj = instructors.find((i) => i.id === req.instructorId);

    const matchesSearch =
      req.code.toLowerCase().includes(search.toLowerCase()) ||
      req.purpose.toLowerCase().includes(search.toLowerCase()) ||
      (classObj?.name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (instructorObj?.name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (req.recipeName?.toLowerCase().includes(search.toLowerCase()) ?? false);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = requisitions.filter((r) => r.status === 'pendente').length;
  const pendingAlterationsCount = requisitions.filter(
    (r) => r.alterationRequest && r.alterationRequest.status === 'pendente'
  ).length;

  // Open Review modal
  const handleOpenReview = (req: Requisition) => {
    setAnalyzingReq(req);
    setIsRejecting(false);
    setRejectionReasonText('');
    setApprovalNotes('');
    setAdminDispatchNotes('');

    // Pre-populate approved quantities with requested quantities
    const initApproved: { [stockItemId: string]: number } = {};
    req.items.forEach((item) => {
      initApproved[item.stockItemId] = item.requestedQuantity;
    });
    setApprovedQuantities(initApproved);

    // Pre-populate approved utensils
    const initApprovedUtensils: { [utensilId: string]: number } = {};
    (req.utensils || []).forEach((u) => {
      initApprovedUtensils[u.utensilId] = u.requestedQuantity;
    });
    setApprovedUtensilQuantities(initApprovedUtensils);
  };

  // Submit Approval & Dispatch
  const handleConfirmApprovalAndDispatch = () => {
    if (!analyzingReq) return;

    const approvedList = analyzingReq.items.map((item) => ({
      stockItemId: item.stockItemId,
      approvedQuantity: approvedQuantities[item.stockItemId] ?? item.requestedQuantity,
    }));

    const approvedUtensilsList = (analyzingReq.utensils || []).map((u) => ({
      utensilId: u.utensilId,
      approvedQuantity: approvedUtensilQuantities[u.utensilId] ?? u.requestedQuantity,
    }));

    approveAndDispatchRequisition(
      analyzingReq.id,
      approvedList,
      approvalNotes,
      approvedUtensilsList,
      adminDispatchNotes
    );
    setAnalyzingReq(null);
  };

  // Submit Rejection
  const handleConfirmRejection = () => {
    if (!analyzingReq) return;
    if (!rejectionReasonText.trim()) {
      alert('Por favor, informe a justificativa da recusa.');
      return;
    }
    rejectRequisition(analyzingReq.id, rejectionReasonText);
    setAnalyzingReq(null);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setNewClassId(initialPreselectedClassId || classes[0]?.id || '');
    setNewInstructorId(initialPreselectedInstructorId || instructors[0]?.id || '');
    setNewPurpose('');
    setNewNotes('');
    setNewItems([]);
    setNewUtensils([]);
    setHasAlterationFlag(false);
    setAltTitle('');
    setAltReason('');
    setCreateModalTab('insumos');
    setIsCreateModalOpen(true);
  };

  const handleAddItemToNewReq = () => {
    if (!tempItemId || tempQty <= 0) return;
    const stock = stockItems.find((s) => s.id === tempItemId);
    const existingIndex = newItems.findIndex((it) => it.stockItemId === tempItemId);
    if (existingIndex !== -1) {
      const updated = [...newItems];
      updated[existingIndex].requestedQuantity += tempQty;
      setNewItems(updated);
    } else {
      setNewItems([
        ...newItems,
        {
          stockItemId: tempItemId,
          requestedQuantity: tempQty,
          unit: stock ? stock.unit : 'kg',
        },
      ]);
    }
    setTempQty(1);
  };

  const handleRemoveItemFromNewReq = (index: number) => {
    setNewItems(newItems.filter((_, idx) => idx !== index));
  };

  const handleAddUtensilToNewReq = () => {
    if (!tempUtensilId || tempUtensilQty <= 0) return;
    const existingIndex = newUtensils.findIndex((u) => u.utensilId === tempUtensilId);
    if (existingIndex !== -1) {
      const updated = [...newUtensils];
      updated[existingIndex].requestedQuantity += tempUtensilQty;
      setNewUtensils(updated);
    } else {
      setNewUtensils([
        ...newUtensils,
        {
          utensilId: tempUtensilId,
          requestedQuantity: tempUtensilQty,
        },
      ]);
    }
    setTempUtensilQty(1);
  };

  const handleRemoveUtensilFromNewReq = (index: number) => {
    setNewUtensils(newUtensils.filter((_, idx) => idx !== index));
  };

  const handleSubmitNewRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassId || !newInstructorId || (newItems.length === 0 && newUtensils.length === 0)) {
      alert('Selecione uma turma, instrutor e ao menos um insumo ou utensílio.');
      return;
    }

    const newReqId = createRequisition({
      classId: newClassId,
      instructorId: newInstructorId,
      purpose: newPurpose || 'Insumos e utensílios para aula prática',
      notes: newNotes || undefined,
      items: newItems,
      utensils: newUtensils,
    });

    if (hasAlterationFlag && altTitle.trim() && altReason.trim()) {
      submitClassAlterationRequest(newReqId, {
        type: altType,
        title: altTitle,
        reason: altReason,
      });
    }

    setIsCreateModalOpen(false);
  };

  // Utensils categorized for quick selection
  const filteredAvailableUtensils = utensils.filter(
    (u) => tempUtensilCategory === 'todos' || u.category === tempUtensilCategory
  );

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#002747] text-white flex items-center justify-center shadow-xs">
            <ClipboardCheck className="w-5 h-5 text-[#ff8928]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-lg font-extrabold text-[#002747] tracking-tight">
                Requisições de Insumos & Utensílios
              </h2>
              {pendingCount > 0 && (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#ff8928] text-white shadow-xs">
                  {pendingCount} para aprovar
                </span>
              )}
              {pendingAlterationsCount > 0 && (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-xs animate-pulse flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{pendingAlterationsCount} alteração de aula</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Gerencie insumos, todos os tipos de utensílios solicitados, permissões de alteração e observações de despacho
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto flex-wrap gap-y-2">
          {/* Permission Settings Trigger */}
          <button
            onClick={() => setIsPermissionsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
            title="Estrutura de Permissões para Alterações de Aula"
          >
            <Shield className="w-3.5 h-3.5 text-[#002747]" />
            <span>Permissões de Aula</span>
          </button>

          {onOpenDirectDispatch && (
            <button
              onClick={onOpenDirectDispatch}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#ff8928] hover:bg-[#eb7717] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Despacho Direto</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#002747] hover:bg-[#00192e] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#ff8928]" />
            <span>Nova Requisição</span>
          </button>
        </div>
      </div>

      {/* Permission Summary Strip */}
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-orange-50/50 p-3 rounded-xl border border-blue-100/80 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#002747]" />
          <span className="font-semibold text-slate-700">
            Governança de Aulas Práticas:
          </span>
          <span className="text-slate-600">
            {permissionSettings.requireAdminApprovalForAnyChange
              ? 'Aprovação prévia obrigatória para alterações de aula'
              : 'Autonomia parcial aos instrutores'}
            {' • '}
            Prazo de aviso: <strong>{permissionSettings.minNoticeHoursForAlteration}h</strong>
          </span>
        </div>
        <button
          onClick={() => setIsPermissionsModalOpen(true)}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center space-x-0.5"
        >
          <span>Configurar Regras</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código (REQ-104), turma, chef, utensílio ou finalidade..."
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

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveFilter('pendente')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeFilter === 'pendente'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendentes de Análise</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-orange-600 text-[10px] flex items-center justify-center font-extrabold ml-1">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('enviado')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeFilter === 'enviado'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aprovadas & Enviadas</span>
          </button>

          <button
            onClick={() => setActiveFilter('rejeitado')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeFilter === 'rejeitado'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejeitadas</span>
          </button>

          <button
            onClick={() => setActiveFilter('todas')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'todas'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({requisitions.length})
          </button>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-3">
        {filteredRequisitions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 p-6">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhuma requisição encontrada</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeFilter === 'pendente'
                ? 'Tudo em dia! Não há requisições aguardando análise neste momento.'
                : 'Tente alterar os filtros de busca.'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Nova Requisição</span>
            </button>
          </div>
        ) : (
          filteredRequisitions.map((req) => {
            const classObj = classes.find((c) => c.id === req.classId);
            const instructorObj = instructors.find((i) => i.id === req.instructorId);
            const isPending = req.status === 'pendente';
            const isSent = req.status === 'enviado';
            const isRejected = req.status === 'rejeitado';

            const altReq = req.alterationRequest;
            const hasPendingAlt = altReq && altReq.status === 'pendente';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all space-y-3 ${
                  hasPendingAlt
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : isPending
                    ? 'border-orange-200 ring-2 ring-orange-400/20'
                    : isSent
                    ? 'border-emerald-200/80'
                    : 'border-red-200/80'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[11px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                        {req.code}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{req.requestDate}</span>
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                          <Clock className="w-3 h-3 text-orange-600" />
                          <span>Aguardando Análise</span>
                        </span>
                      )}
                      {isSent && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aprovado & Enviado</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Rejeitado</span>
                        </span>
                      )}

                      {/* Alteration Flag if present */}
                      {altReq && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                            altReq.status === 'pendente'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : altReq.status === 'autorizado'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>
                            Alteração:{' '}
                            {altReq.status === 'pendente'
                              ? 'Pendente de Autorização'
                              : altReq.status === 'autorizado'
                              ? 'Autorizada'
                              : 'Recusada'}
                          </span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{req.purpose}</h3>

                    <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1 flex-wrap gap-y-1">
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-slate-800">{classObj?.name || 'Turma'}</span>
                        <span className="text-slate-400">({classObj?.shift})</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        <span>Chef: {instructorObj?.name || 'Instrutor'}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        Sala: <strong>{classObj?.kitchenRoom}</strong>
                      </span>
                    </div>

                    {req.recipeName && (
                      <div className="mt-1 flex items-center space-x-1 text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md inline-flex">
                        <ChefHat className="w-3 h-3 text-blue-600" />
                        <span>Ficha Técnica: <strong>{req.recipeName}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alteration Request Highlight Banner if present */}
                {altReq && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-2 ${
                      altReq.status === 'pendente'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : altReq.status === 'autorizado'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#ff8928]" />
                        <div>
                          <span className="font-extrabold block text-slate-900">
                            Solicitação de Alteração na Aula: {altReq.title}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            Tipo: <strong>{altReq.type.replace(/_/g, ' ').toUpperCase()}</strong> • Solicitado em {altReq.requestedAt}
                          </span>
                        </div>
                      </div>

                      {altReq.status === 'pendente' && (
                        <button
                          onClick={() => setAlterationModalData({ req, mode: 'review' })}
                          className="px-3 py-1 rounded-lg bg-[#002747] hover:bg-[#00192e] text-white font-bold text-xs shrink-0 shadow-xs flex items-center space-x-1"
                        >
                          <Shield className="w-3 h-3 text-[#ff8928]" />
                          <span>Avaliar Autorização</span>
                        </button>
                      )}
                    </div>

                    {(altReq.previousValue || altReq.newValue) && (
                      <div className="grid grid-cols-2 gap-2 bg-white/80 p-2 rounded-lg border border-amber-200/60 text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-bold text-[10px]">Anterior:</span>
                          <span className="text-slate-700">{altReq.previousValue || 'Padrão'}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 block font-bold text-[10px]">Nova Configuração:</span>
                          <span className="text-slate-900 font-bold">{altReq.newValue || 'Solicitado'}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] italic text-slate-700">
                      <strong>Justificativa do Chef:</strong> "{altReq.reason}"
                    </p>

                    {altReq.adminDeliberationNotes && (
                      <div className="p-2 bg-white rounded-lg border text-[11px] text-slate-800">
                        <strong className="text-slate-600 block text-[10px] uppercase font-bold">
                          Parecer Administrativo ({altReq.reviewedAt}):
                        </strong>
                        <span className="italic">"{altReq.adminDeliberationNotes}"</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items and Utensils Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Ingredients Column */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center space-x-1">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>Insumos Solicitados ({req.items.length})</span>
                      </span>
                      <span>Qtd {isSent ? 'Entregue' : 'Solicitada'}</span>
                    </div>

                    <div className="divide-y divide-slate-200/60 max-h-48 overflow-y-auto">
                      {req.items.map((item, idx) => {
                        const stock = stockItems.find((s) => s.id === item.stockItemId);
                        const isAvailable = stock ? stock.currentQuantity >= item.requestedQuantity : false;

                        return (
                          <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-medium text-slate-800">{item.name}</span>
                              {isPending && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                    isAvailable
                                      ? 'text-emerald-700 bg-emerald-50'
                                      : 'text-orange-700 bg-orange-100'
                                  }`}
                                >
                                  {isAvailable
                                    ? 'Em estoque'
                                    : `Saldo: ${stock?.currentQuantity ?? 0} ${item.unit}`}
                                </span>
                              )}
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-slate-900">
                                {isSent ? item.approvedQuantity : item.requestedQuantity} {item.unit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Utensils Column */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center space-x-1">
                        <Utensils className="w-3.5 h-3.5 text-[#ff8928]" />
                        <span>Utensílios da Aula ({req.utensils?.length || 0})</span>
                      </span>
                      <span>Qtd</span>
                    </div>

                    {req.utensils && req.utensils.length > 0 ? (
                      <div className="divide-y divide-slate-200/60 max-h-48 overflow-y-auto">
                        {req.utensils.map((u, idx) => (
                          <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-medium text-slate-800">{u.name}</span>
                              <span className="text-[10px] text-slate-400 block">{u.category}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-blue-900">
                                {isSent ? u.approvedQuantity : u.requestedQuantity} {u.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        Nenhum utensílio extra requisitado para esta aula.
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Dispatch Notes if sent */}
                {req.adminDispatchNotes && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-start space-x-2 text-amber-900">
                    <MessageSquare className="w-4 h-4 text-[#ff8928] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[10px] uppercase tracking-wider text-amber-800">
                        Observações do Administrador no Envio dos Itens:
                      </strong>
                      <p className="italic text-slate-800 mt-0.5 leading-relaxed">
                        "{req.adminDispatchNotes}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes or Rejection Reason */}
                {req.notes && (
                  <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200/70 italic">
                    "{req.notes}"
                  </p>
                )}
                {req.rejectionReason && (
                  <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    <strong>Motivo da Recusa:</strong> {req.rejectionReason}
                  </div>
                )}
                {req.dispatchedAt && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Despachado em: <strong>{req.dispatchedAt}</strong></span>
                    <span>Por: <strong>{req.dispatchedBy}</strong></span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {/* Instructor Request Alteration button */}
                  {!altReq && (
                    <button
                      type="button"
                      onClick={() => setAlterationModalData({ req, mode: 'create' })}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 flex items-center space-x-1 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Solicitar Alteração na Aula</span>
                    </button>
                  )}

                  {/* Main Action Trigger for Pending Requisition */}
                  {isPending && (
                    <div className="ml-auto">
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-700/20 flex items-center justify-center space-x-2 transition-all"
                      >
                        <ClipboardCheck className="w-4 h-4 text-orange-400" />
                        <span>Analisar, Aprovar & Despachar Itens</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ANALISAR E APROVAR REQUISIÇÃO (COM UTENSÍLIOS E NOTAS DO ADMIN) */}
      {analyzingReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-[#002747] text-white flex items-center justify-between border-b border-[#00192e]">
              <div>
                <div className="flex items-center space-x-2">
                  <ClipboardCheck className="w-5 h-5 text-[#ff8928]" />
                  <h3 className="font-bold text-base">
                    Análise da Requisição {analyzingReq.code}
                  </h3>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Conferência de estoque de insumos, utensílios de cozinha e registro das notas de envio
                </p>
              </div>
              <button
                onClick={() => setAnalyzingReq(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
              {/* Summary of Class and Instructor */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">Destino</span>
                  <span className="font-bold text-slate-900">
                    {classes.find((c) => c.id === analyzingReq.classId)?.name}
                  </span>
                  <span className="text-slate-500 block">
                    Sala: {classes.find((c) => c.id === analyzingReq.classId)?.kitchenRoom}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">Instrutor Responsável</span>
                  <span className="font-bold text-slate-900">
                    {instructors.find((i) => i.id === analyzingReq.instructorId)?.name}
                  </span>
                  <span className="text-slate-500 block">
                    {instructors.find((i) => i.id === analyzingReq.instructorId)?.specialty}
                  </span>
                </div>
              </div>

              {/* SECTION 1: INGREDIENTS STOCK CHECK */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  <span>Conferência de Estoque dos Insumos</span>
                </h4>

                <div className="space-y-2">
                  {analyzingReq.items.map((item) => {
                    const stock = stockItems.find((s) => s.id === item.stockItemId);
                    const stockQty = stock?.currentQuantity ?? 0;
                    const approvedVal = approvedQuantities[item.stockItemId] ?? item.requestedQuantity;
                    const isDeficit = approvedVal > stockQty;

                    return (
                      <div
                        key={item.stockItemId}
                        className={`p-3 rounded-xl border transition-all ${
                          isDeficit
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-white border-slate-200/80 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                              <span>Solicitado: <strong>{item.requestedQuantity} {item.unit}</strong></span>
                              <span>•</span>
                              <span className={stockQty < item.requestedQuantity ? 'text-orange-600 font-bold' : 'text-slate-600'}>
                                Saldo em Estoque: {stockQty} {item.unit}
                              </span>
                            </div>
                          </div>

                          {/* Approved quantity stepper/input */}
                          <div className="flex items-center space-x-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">
                              Aprovar:
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max={stockQty > 0 ? stockQty : 9999}
                              value={approvedVal}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setApprovedQuantities({
                                  ...approvedQuantities,
                                  [item.stockItemId]: val,
                                });
                              }}
                              className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 text-right focus:border-blue-600 outline-none"
                            />
                            <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                          </div>
                        </div>

                        {isDeficit && (
                          <div className="mt-2 text-[11px] font-semibold text-red-600 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Atenção: Quantidade aprovada ({approvedVal}) excede o estoque atual ({stockQty}). Ajuste o valor ou confirme para zerar o saldo.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: UTENSILS CHECK & APPROVAL */}
              {analyzingReq.utensils && analyzingReq.utensils.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#ff8928]" />
                    <span>Conferência de Utensílios de Cozinha Solicitados</span>
                  </h4>

                  <div className="space-y-2">
                    {analyzingReq.utensils.map((u) => {
                      const approvedVal = approvedUtensilQuantities[u.utensilId] ?? u.requestedQuantity;
                      const utRecord = utensils.find((item) => item.id === u.utensilId);

                      return (
                        <div
                          key={u.utensilId}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">{u.name}</span>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                              <span>Categoria: {u.category}</span>
                              <span>•</span>
                              <span>Disponível no acervo: {utRecord?.totalQuantity ?? 10} {u.unit}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <label className="text-[11px] font-semibold text-slate-600">
                              Aprovar:
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={approvedVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setApprovedUtensilQuantities({
                                  ...approvedUtensilQuantities,
                                  [u.utensilId]: val,
                                });
                              }}
                              className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 text-right focus:border-blue-600 outline-none"
                            />
                            <span className="text-xs text-slate-500">{u.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: CAMPO DE OBSERVAÇÕES DO ADMINISTRADOR AO ENVIAR OS ITENS */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-2">
                <label className="block text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-[#ff8928]" />
                  <span>Observações do Administrador no Envio dos Itens</span>
                </label>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Registre notas da entrega física (ex: conferência de lâminas afiadas, lote refrigerado entregue na bancada 02, orientação de higienização e devolução ao fim da aula).
                </p>
                <textarea
                  rows={2}
                  placeholder="Ex: Entregue diretamente ao chef na bancada fria. Kit de facas calibrado e batedeiras testadas. Devolver limpos ao fim do turno..."
                  value={adminDispatchNotes}
                  onChange={(e) => setAdminDispatchNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white outline-none focus:border-[#ff8928]"
                />
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas Adicionais para a Guia / Recibo (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entregue em caixas térmicas lacradas com gelo..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                />
              </div>

              {/* Rejection Toggle Area */}
              {isRejecting ? (
                <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-red-800">
                    Justificativa de Recusa da Requisição *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Descreva o motivo da recusa para o instrutor..."
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-300 bg-white outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRejection}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                    >
                      Confirmar Rejeição
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              {!isRejecting && (
                <button
                  type="button"
                  onClick={() => setIsRejecting(true)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  Recusar Requisição
                </button>
              )}

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setAnalyzingReq(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprovalAndDispatch}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-[#ff8928] hover:bg-[#eb7717] text-white shadow-md shadow-orange-500/30 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Aprovar & Despachar Tudo Agora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVA REQUISIÇÃO (COM TODOS OS TIPOS DE UTENSÍLIOS E ALTERAÇÃO DE AULA) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-[#002747] text-white flex items-center justify-between border-b border-[#00192e]">
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="w-5 h-5 text-[#ff8928]" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Nova Requisição do Instrutor Chef</h3>
                  <p className="text-xs text-blue-200">
                    Solicite insumos do estoque e todos os utensílios necessários para a aula prática
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewRequisition} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-slate-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Turma de Gastronomia *
                  </label>
                  <select
                    required
                    value={newClassId}
                    onChange={(e) => {
                      setNewClassId(e.target.value);
                      const targetClass = classes.find((c) => c.id === e.target.value);
                      if (targetClass?.instructorId) {
                        setNewInstructorId(targetClass.instructorId);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.shift}) • {cls.kitchenRoom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instrutor Chef Responsável *
                  </label>
                  <select
                    required
                    value={newInstructorId}
                    onChange={(e) => setNewInstructorId(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finalidade da Aula Prática *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aula prática de Massas Frescas, Preparo de Entremets, Técnicas de Cocção..."
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                />
              </div>

              {/* TABS: INSUMOS VS UTENSÍLIOS */}
              <div className="border-b border-slate-200 flex pt-1">
                <button
                  type="button"
                  onClick={() => setCreateModalTab('insumos')}
                  className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
                    createModalTab === 'insumos'
                      ? 'border-[#ff8928] text-[#002747]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>1. Insumos do Estoque ({newItems.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalTab('utensilios')}
                  className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
                    createModalTab === 'utensilios'
                      ? 'border-[#ff8928] text-[#002747]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>2. Utensílios de Cozinha ({newUtensils.length})</span>
                </button>
              </div>

              {/* TAB 1: INSUMOS */}
              {createModalTab === 'insumos' && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      Adicionar Ingredientes / Insumos
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Saldo atual em tempo real
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="col-span-7">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Insumo do Almoxarifado
                      </label>
                      <select
                        value={tempItemId}
                        onChange={(e) => setTempItemId(e.target.value)}
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
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Qtd
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.01"
                        value={tempQty}
                        onChange={(e) => setTempQty(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={handleAddItemToNewReq}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Items preview list */}
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {newItems.map((it, idx) => {
                      const s = stockItems.find((stock) => stock.id === it.stockItemId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs"
                        >
                          <span className="font-semibold text-slate-800">{s?.name || 'Insumo'}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-700 font-bold">
                              {it.requestedQuantity} {it.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromNewReq(idx)}
                              className="text-red-500 hover:text-red-700 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {newItems.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-1">
                        Nenhum insumo selecionado ainda.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: UTENSÍLIOS */}
              {createModalTab === 'utensilios' && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Catálogo de Utensílios da Cozinha
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Facas, panelas, equipamentos, eletroportáteis e instrumentos de medição
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                      {newUtensils.length} selecionados
                    </span>
                  </div>

                  {/* Category Filter for Utensils */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    {['todos', 'Facas & Cortes', 'Panelas & Cocção', 'Confeitaria & Panificação', 'Eletroportáteis & Equipamentos', 'Medição & Controle', 'Apoio & Higiene'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTempUtensilCategory(cat)}
                        className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                          tempUtensilCategory === cat
                            ? 'bg-[#002747] text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat === 'todos' ? 'Todos' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="col-span-7">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Utensílio Solicitado
                      </label>
                      <select
                        value={tempUtensilId}
                        onChange={(e) => setTempUtensilId(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        {filteredAvailableUtensils.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.category} • {u.totalQuantity} disp.)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Qtd
                      </label>
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
                        onClick={handleAddUtensilToNewReq}
                        className="w-full py-1.5 rounded-lg bg-[#002747] hover:bg-[#00192e] text-white text-xs font-bold shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Utensils preview list */}
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {newUtensils.map((u, idx) => {
                      const utRecord = utensils.find((item) => item.id === u.utensilId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{utRecord?.name || 'Utensílio'}</span>
                            <span className="text-[10px] text-slate-400 block">{utRecord?.category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-900 font-bold">
                              {u.requestedQuantity} {utRecord?.unit || 'un'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUtensilFromNewReq(idx)}
                              className="text-red-500 hover:text-red-700 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {newUtensils.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-1">
                        Nenhum utensílio adicionado.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* OPÇÃO DE ALTERAÇÃO DE AULA PELO INSTRUTOR */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAlterationFlag}
                    onChange={(e) => setHasAlterationFlag(e.target.checked)}
                    className="w-4 h-4 rounded text-[#ff8928] focus:ring-[#ff8928]"
                  />
                  <span className="font-bold text-amber-950 text-xs flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ff8928]" />
                    <span>Esta requisição envolve uma alteração no planejamento original da aula</span>
                  </span>
                </label>

                {hasAlterationFlag && (
                  <div className="pt-2 border-t border-amber-200 space-y-2 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Tipo de Alteração
                        </label>
                        <select
                          value={altType}
                          onChange={(e) => setAltType(e.target.value as any)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="substituicao_insumo_utensilio">
                            Substituição / Adição de Insumos & Utensílios
                          </option>
                          <option value="mudanca_sala">Mudança de Sala / Laboratório</option>
                          <option value="troca_receita">Troca de Ficha Técnica / Receita</option>
                          <option value="horario">Ajuste de Horário / Turno</option>
                          <option value="outro">Outra Necessidade</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Título Resumido da Alteração *
                        </label>
                        <input
                          type="text"
                          required={hasAlterationFlag}
                          placeholder="Ex: Troca de forno por combinador e acréscimo de fouets"
                          value={altTitle}
                          onChange={(e) => setAltTitle(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        Justificativa Pedagógica do Instrutor *
                      </label>
                      <textarea
                        rows={2}
                        required={hasAlterationFlag}
                        placeholder="Explique o motivo para análise e autorização da administração..."
                        value={altReason}
                        onChange={(e) => setAltReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Extras (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pesar na balança de precisão, insumos pré-refrigerados..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Registrar Requisição</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAÇÃO DE ESTRUTURA DE PERMISSÕES DE AULAS */}
      <PermissionsSettingsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />

      {/* MODAL: AVALIAÇÃO / CRIAÇÃO DE ALTERAÇÃO DE AULA */}
      {alterationModalData && (
        <AlterationRequestModal
          isOpen={true}
          onClose={() => setAlterationModalData(null)}
          requisition={alterationModalData.req}
          mode={alterationModalData.mode}
        />
      )}
    </div>
  );
};
