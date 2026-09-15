import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Award,
  Send,
  X,
  Check,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Instructor } from '../types';
import { useApp } from '../context/AppContext';

interface InstructorsViewProps {
  onStartDirectDispatchForInstructor?: (classId: string, instructorId: string) => void;
  onStartRequisitionForInstructor?: (classId: string, instructorId: string) => void;
  isOpenCreateModalInitially?: boolean;
  onCloseInitialModal?: () => void;
}

const COLOR_PALETTE = [
  { label: 'Azul SIGEC', value: '#002747' },
  { label: 'Laranja SIGEC', value: '#ff8928' },
  { label: 'Azul Petróleo', value: '#003660' },
  { label: 'Laranja Queimado', value: '#eb7717' },
  { label: 'Verde Oliva', value: '#059669' },
  { label: 'Bordeaux', value: '#991b1b' },
];

export const InstructorsView: React.FC<InstructorsViewProps> = ({
  onStartDirectDispatchForInstructor,
  onStartRequisitionForInstructor,
  isOpenCreateModalInitially = false,
  onCloseInitialModal,
}) => {
  const {
    instructors,
    classes,
    requisitions,
    addInstructor,
    updateInstructor,
    deleteInstructor,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(isOpenCreateModalInitially);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  const [form, setForm] = useState<{
    name: string;
    registrationNumber: string;
    email: string;
    phone: string;
    specialty: string;
    color: string;
    active: boolean;
    notes: string;
  }>({
    name: '',
    registrationNumber: '',
    email: '',
    phone: '',
    specialty: '',
    color: '#002747',
    active: true,
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingInstructor(null);
    const nextNum = instructors.length + 1;
    setForm({
      name: '',
      registrationNumber: `CHEF-${String(nextNum).padStart(3, '0')}`,
      email: '',
      phone: '',
      specialty: '',
      color: '#002747',
      active: true,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: Instructor) => {
    setEditingInstructor(inst);
    setForm({
      name: inst.name,
      registrationNumber: inst.registrationNumber || '',
      email: inst.email,
      phone: inst.phone,
      specialty: inst.specialty,
      color: inst.color || '#002747',
      active: inst.active !== false,
      notes: inst.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseInitialModal) onCloseInitialModal();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty.trim()) return;

    if (editingInstructor) {
      updateInstructor(editingInstructor.id, {
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialty: form.specialty.trim(),
        color: form.color,
        active: form.active,
        notes: form.notes.trim() || undefined,
      });
    } else {
      addInstructor({
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialty: form.specialty.trim(),
        color: form.color,
        active: form.active,
        notes: form.notes.trim() || undefined,
      });
    }
    handleCloseModal();
  };

  const filteredInstructors = instructors.filter((inst) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inst.name.toLowerCase().includes(q) ||
      inst.specialty.toLowerCase().includes(q) ||
      (inst.registrationNumber && inst.registrationNumber.toLowerCase().includes(q)) ||
      inst.email.toLowerCase().includes(q) ||
      inst.phone.includes(q);

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' && inst.active !== false) ||
      (statusFilter === 'inativos' && inst.active === false);

    return matchesSearch && matchesStatus;
  });

  const activeCount = instructors.filter((i) => i.active !== false).length;
  const classesCoordinatedCount = classes.filter((c) => c.status === 'ativa').length;

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top Banner / Admin Header */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-[#002747] text-white flex items-center justify-center shadow-sm">
            <UserCheck className="w-6 h-6 text-[#ff8928]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-[#002747] tracking-tight">
                Gestão de Instrutores Chefs
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#002747]/10 text-[#002747] border border-[#002747]/20">
                Administração
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cadastre e gerencie os chefs docentes, turmas vinculadas e permissões de requisição
            </p>
          </div>
        </div>

        <button
          id="btn-cadastrar-instrutor-topo"
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#ff8928] hover:bg-[#eb7717] text-white text-xs font-bold shadow-sm transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Instrutor</span>
        </button>
      </div>

      {/* Admin KPI Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Cadastrados
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-[#002747]">{instructors.length}</span>
            <span className="text-[11px] text-slate-500 font-medium">docentes</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
            Instrutores Ativos
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">{activeCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">em operação</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#ff8928] block tracking-wider">
            Turmas Vinculadas
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-[#002747]">
              {classesCoordinatedCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">ativas</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do chef, especialidade, matrícula (CHEF-001), e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center space-x-1">
            {(['todos', 'ativos', 'inativos'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-[#002747] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Exibindo {filteredInstructors.length} de {instructors.length}
          </span>
        </div>
      </div>

      {/* List of Instructors */}
      <div className="space-y-3">
        {filteredInstructors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-800">Nenhum instrutor encontrado</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {search
                  ? 'Tente outro termo de pesquisa ou limpe os filtros.'
                  : 'Comece cadastrando o primeiro instrutor chef da escola.'}
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#ff8928] hover:bg-[#eb7717] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Instrutor</span>
            </button>
          </div>
        ) : (
          filteredInstructors.map((inst) => {
            const assignedClasses = classes.filter((c) => c.instructorId === inst.id);
            const pendingReqs = requisitions.filter(
              (r) => r.instructorId === inst.id && r.status === 'pendente'
            );

            return (
              <div
                key={inst.id}
                className={`bg-white rounded-2xl border transition-all p-4 shadow-xs space-y-3.5 ${
                  inst.active === false
                    ? 'border-slate-200 opacity-75'
                    : 'border-slate-200/90 hover:border-[#ff8928]/60'
                }`}
              >
                {/* Header card: Avatar, Name, Specialty, Matrícula, Action buttons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-xs shrink-0"
                      style={{ backgroundColor: inst.color || '#002747' }}
                    >
                      {inst.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-base font-bold text-[#002747]">{inst.name}</h3>
                        {inst.registrationNumber && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {inst.registrationNumber}
                          </span>
                        )}
                        {inst.active !== false ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Ativo</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#ff8928] mt-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{inst.specialty}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2 flex-wrap gap-y-1">
                        {inst.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{inst.phone}</span>
                          </span>
                        )}
                        {inst.email && (
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{inst.email}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(inst)}
                      className="p-1.5 text-slate-400 hover:text-[#002747] hover:bg-slate-100 rounded-lg transition-colors"
                      title="Editar dados do instrutor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Confirmar exclusão do instrutor ${inst.name}? Se houver turmas vinculadas a ele, você precisará reatribuí-las.`
                          )
                        ) {
                          deleteInstructor(inst.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir instrutor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes if present */}
                {inst.notes && (
                  <div className="bg-[#fbf8ff] p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start space-x-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{inst.notes}</span>
                  </div>
                )}

                {/* Assigned classes & pending requests */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Turmas Vinculadas ({assignedClasses.length}):
                      </span>
                      {assignedClasses.length > 0 ? (
                        assignedClasses.map((ac) => (
                          <span
                            key={ac.id}
                            className="text-[11px] font-medium bg-[#002747]/5 text-[#002747] px-2 py-0.5 rounded-md border border-[#002747]/10 flex items-center space-x-1"
                          >
                            <GraduationCap className="w-3 h-3 text-[#002747]" />
                            <span>{ac.name} ({ac.shift})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Nenhuma turma vinculada atualmente
                        </span>
                      )}
                    </div>

                    {pendingReqs.length > 0 && (
                      <span className="text-[10px] font-bold text-[#ff8928] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-[#ff8928]" />
                        <span>{pendingReqs.length} Req. Pendente(s)</span>
                      </span>
                    )}
                  </div>

                  {/* Dispatch and Requisition buttons */}
                  <div className="flex items-center space-x-2 pt-1">
                    {onStartDirectDispatchForInstructor && (
                      <button
                        onClick={() => {
                          const classId = assignedClasses[0]?.id || classes[0]?.id || '';
                          onStartDirectDispatchForInstructor(classId, inst.id);
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#002747] hover:bg-[#00192e] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-[#ff8928]" />
                        <span>Enviar Insumos ao Chef</span>
                      </button>
                    )}

                    {onStartRequisitionForInstructor && assignedClasses.length > 0 && (
                      <button
                        onClick={() =>
                          onStartRequisitionForInstructor(assignedClasses[0].id, inst.id)
                        }
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff8928] border border-orange-200 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Criar Requisição</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Cadastrar / Editar Instrutor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#002747] text-white flex items-center justify-between border-b border-[#00192e]">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-[#ff8928] text-white">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {editingInstructor ? 'Editar Dados do Instrutor Chef' : 'Cadastrar Novo Instrutor Chef'}
                  </h3>
                  <p className="text-[11px] text-blue-200 font-medium">
                    SIGEC - Painel de Controle da Gerência
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#002747] mb-1">
                    Nome Completo do Chef / Instrutor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chef Juliana Morais"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002747] mb-1">
                    Matrícula / Crachá
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CHEF-005"
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002747] mb-1">
                  Especialidade Gastronômica Principal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pâtisserie & Confeitaria, Charcutaria, Cozinha Italiana, Panificação..."
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#002747] mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002747] mb-1">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    placeholder="chef@sigec.culinaria.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
                  />
                </div>
              </div>

              {/* Tag Color and Active status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-[#002747] mb-1.5">
                    Cor do Crachá / Identificação
                  </label>
                  <div className="flex items-center space-x-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => setForm({ ...form, color: c.value })}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          form.color === c.value
                            ? 'border-[#002747] scale-110 shadow-md ring-2 ring-[#ff8928]/40'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002747] mb-1.5">
                    Situação / Status
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, active: true })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        form.active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Ativo
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, active: false })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        !form.active
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Inativo
                    </button>
                  </div>
                </div>
              </div>

              {/* Administrative Notes */}
              <div>
                <label className="block text-xs font-bold text-[#002747] mb-1">
                  Observações Administrativas (Gerência)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Autorizado para uso dos fornos de convecção 01 e 02; preferência por insumos orgânicos..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#ff8928] hover:bg-[#eb7717] text-white shadow-sm flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingInstructor ? 'Salvar Alterações' : 'Cadastrar Instrutor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
