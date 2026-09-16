import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  X,
  Check,
  UserCheck,
  Award,
} from 'lucide-react';
import { ClassGroup, Instructor } from '../../types';
import { useApp } from '../../context/AppContext';

interface ClassesViewProps {
  onStartRequisitionForClass?: (classId: string, instructorId: string) => void;
  onStartDirectDispatchForInstructor?: (classId: string, instructorId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  onStartRequisitionForClass,
  onStartDirectDispatchForInstructor,
}) => {
  const {
    classes,
    instructors,
    addClassGroup,
    updateClassGroup,
    deleteClassGroup,
    toggleClassStatus,
    addInstructor,
    updateInstructor,
    deleteInstructor,
    requisitions,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'turmas' | 'instrutores'>('turmas');
  const [classFilter, setClassFilter] = useState<'todas' | 'ativas' | 'inativas'>('todas');

  // Turma modal states
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [classForm, setClassForm] = useState<{
    name: string;
    shift: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
    kitchenRoom: string;
    instructorId: string;
    studentCount: number;
    status: 'ativa' | 'inativa' | 'concluída';
    startDate: string;
    endDate: string;
    description: string;
  }>({
    name: '',
    shift: 'Manhã',
    kitchenRoom: 'Cozinha Pedagógica 01',
    instructorId: instructors[0]?.id || '',
    studentCount: 16,
    status: 'ativa',
    startDate: '',
    endDate: '',
    description: '',
  });

  // Instructor modal states
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [instructorForm, setInstructorForm] = useState<{
    name: string;
    email: string;
    phone: string;
    specialty: string;
    color: string;
    active: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    color: '#1e40af',
    active: true,
  });

  // Open Turma Modal
  const handleOpenClassModal = (cls?: ClassGroup) => {
    if (cls) {
      setEditingClass(cls);
      setClassForm({
        name: cls.name,
        shift: cls.shift,
        kitchenRoom: cls.kitchenRoom,
        instructorId: cls.instructorId,
        studentCount: cls.studentCount,
        status: cls.status,
        startDate: cls.startDate || '',
        endDate: cls.endDate || '',
        description: cls.description || '',
      });
    } else {
      setEditingClass(null);
      setClassForm({
        name: '',
        shift: 'Manhã',
        kitchenRoom: 'Cozinha Pedagógica 01',
        instructorId: instructors[0]?.id || '',
        studentCount: 16,
        status: 'ativa',
        startDate: '',
        endDate: '',
        description: '',
      });
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    if (editingClass) {
      updateClassGroup(editingClass.id, classForm);
    } else {
      addClassGroup(classForm);
    }
    setIsClassModalOpen(false);
  };

  // Open Instructor Modal
  const handleOpenInstructorModal = (inst?: Instructor) => {
    if (inst) {
      setEditingInstructor(inst);
      setInstructorForm({
        name: inst.name,
        email: inst.email,
        phone: inst.phone,
        specialty: inst.specialty,
        color: inst.color,
        active: inst.active,
      });
    } else {
      setEditingInstructor(null);
      setInstructorForm({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        color: '#1e40af',
        active: true,
      });
    }
    setIsInstructorModalOpen(true);
  };

  const handleSaveInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorForm.name.trim()) return;

    if (editingInstructor) {
      updateInstructor(editingInstructor.id, instructorForm);
    } else {
      addInstructor(instructorForm);
    }
    setIsInstructorModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#002747] text-white flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5 text-[#ff8928]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#002747] tracking-tight">
              Gestão de Turmas & Laboratórios
            </h2>
            <p className="text-xs text-slate-500">
              Cadastre turmas de gastronomia, vincule chefs instrutores e despache insumos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {activeSubTab === 'turmas' ? (
            <button
              onClick={() => handleOpenClassModal()}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#002747] hover:bg-[#00192e] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-[#ff8928]" />
              <span>Cadastrar Turma</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenInstructorModal()}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#ff8928] hover:bg-[#eb7717] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Instrutor</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Switcher (Turmas vs Instrutores) */}
      <div className="flex rounded-xl bg-white border border-slate-200/80 p-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('turmas')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeSubTab === 'turmas'
              ? 'bg-[#002747] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#002747] hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#ff8928]" />
          <span>Turmas de Culinária ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('instrutores')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeSubTab === 'instrutores'
              ? 'bg-[#ff8928] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#ff8928] hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Instrutores / Chefs ({instructors.length})</span>
        </button>
      </div>

      {/* TAB 1: TURMAS */}
      {activeSubTab === 'turmas' && (
        <div className="space-y-3">
          {/* Status Filter Tabs (Turmas Ativas vs Inativas) */}
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-xs flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="font-bold text-slate-500 mr-1">Filtrar Turmas:</span>
              <button
                onClick={() => setClassFilter('todas')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  classFilter === 'todas'
                    ? 'bg-[#002747] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({classes.length})
              </button>
              <button
                onClick={() => setClassFilter('ativas')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center space-x-1.5 ${
                  classFilter === 'ativas'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Ativas ({classes.filter((c) => c.status === 'ativa').length})</span>
              </button>
              <button
                onClick={() => setClassFilter('inativas')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center space-x-1.5 ${
                  classFilter === 'inativas'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Inativas / Concluídas ({classes.filter((c) => c.status !== 'ativa').length})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 italic hidden sm:inline">
              Filtro essencial para a geração de relatórios de compras e histórico de consumo
            </span>
          </div>

          {classes
            .filter((cls) => {
              if (classFilter === 'ativas') return cls.status === 'ativa';
              if (classFilter === 'inativas') return cls.status !== 'ativa';
              return true;
            })
            .length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 p-6">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Nenhuma turma encontrada para o filtro selecionado ({classFilter})
              </p>
              <button
                onClick={() => setClassFilter('todas')}
                className="mt-3 inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-[#002747] text-white text-xs font-semibold"
              >
                <span>Ver Todas as Turmas</span>
              </button>
            </div>
          ) : (
            classes
              .filter((cls) => {
                if (classFilter === 'ativas') return cls.status === 'ativa';
                if (classFilter === 'inativas') return cls.status !== 'ativa';
                return true;
              })
              .map((cls) => {
                const instructor = instructors.find((i) => i.id === cls.instructorId);
                const pendingReqs = requisitions.filter(
                  (r) => r.classId === cls.id && r.status === 'pendente'
                ).length;
                const isActive = cls.status === 'ativa';

                return (
                  <div
                    key={cls.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all space-y-3 ${
                      isActive
                        ? 'border-slate-200/80 hover:border-blue-300'
                        : 'border-dashed border-slate-300 bg-slate-50/50 opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-[11px] font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                            {cls.code}
                          </span>

                          {/* Status Flag Badge */}
                          <button
                            onClick={() => toggleClassStatus(cls.id)}
                            title="Clique para alternar status da turma (Ativa / Inativa)"
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            />
                            <span>{isActive ? 'Turma Ativa' : 'Turma Inativa (Concluída)'}</span>
                            <span className="text-[9px] underline opacity-70 ml-1">alterar</span>
                          </button>

                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Turno: {cls.shift}</span>
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {cls.studentCount} Alunos
                          </span>
                          {pendingReqs > 0 && (
                            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md animate-pulse">
                              {pendingReqs} Req. Pendente
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-1.5">{cls.name}</h3>

                        {cls.description && (
                          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">{cls.description}</p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1.5 flex-wrap gap-y-1">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cls.kitchenRoom}</span>
                          </div>

                          {(cls.startDate || cls.endDate) && (
                            <div className="flex items-center space-x-1 text-slate-500">
                              <span className="font-semibold text-slate-600">Período:</span>
                              <span>
                                {cls.startDate ? new Date(cls.startDate).toLocaleDateString('pt-BR') : 'Início'}
                                {' até '}
                                {cls.endDate ? new Date(cls.endDate).toLocaleDateString('pt-BR') : 'Término'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenClassModal(cls)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar Turma"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja excluir a turma ${cls.name}?`)) {
                              deleteClassGroup(cls.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Turma"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Instructor badge & Quick Dispatch action */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                          style={{ backgroundColor: instructor?.color || '#1e40af' }}
                        >
                          {instructor?.name ? instructor.name.charAt(0) : 'C'}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Instrutor Responsável
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {instructor?.name || 'Não vinculado'}
                          </span>
                          {instructor?.specialty && (
                            <span className="text-[10px] text-slate-500 block">
                              {instructor.specialty}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onStartDirectDispatchForInstructor && (
                          <button
                            onClick={() =>
                              onStartDirectDispatchForInstructor(cls.id, cls.instructorId)
                            }
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors border border-orange-200/60"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar Itens Agora</span>
                          </button>
                        )}

                        {onStartRequisitionForClass && (
                          <button
                            onClick={() => onStartRequisitionForClass(cls.id, cls.instructorId)}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-[#002747] hover:bg-[#00192e] text-white text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#ff8928]" />
                            <span>Nova Requisição</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* TAB 2: INSTRUTORES */}
      {activeSubTab === 'instrutores' && (
        <div className="space-y-3">
          {instructors.map((inst) => {
            const assignedClasses = classes.filter((c) => c.instructorId === inst.id);

            return (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:border-orange-200 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-sm"
                      style={{ backgroundColor: inst.color || '#ea580c' }}
                    >
                      {inst.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{inst.name}</h3>
                      <div className="flex items-center space-x-1 text-xs text-orange-600 font-semibold mt-0.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>{inst.specialty}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{inst.phone}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{inst.email}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenInstructorModal(inst)}
                      className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Editar Instrutor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir o instrutor ${inst.name}?`)) {
                          deleteInstructor(inst.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Instrutor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Turmas vinculadas */}
                <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Turmas Ativas:
                    </span>
                    {assignedClasses.length > 0 ? (
                      assignedClasses.map((ac) => (
                        <span
                          key={ac.id}
                          className="text-[11px] font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md"
                        >
                          {ac.name} ({ac.shift})
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Nenhuma turma vinculada
                      </span>
                    )}
                  </div>

                  {onStartDirectDispatchForInstructor && assignedClasses.length > 0 && (
                    <button
                      onClick={() =>
                        onStartDirectDispatchForInstructor(
                          assignedClasses[0].id,
                          inst.id
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Itens a Este Chef</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Cadastrar / Editar Turma */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingClass ? `Editar Turma (${editingClass.code})` : 'Cadastrar Nova Turma'}
                </h3>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Turma *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pâtisserie Francesa Avançada, Panificação..."
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Turno</label>
                  <select
                    value={classForm.shift}
                    onChange={(e) =>
                      setClassForm({
                        ...classForm,
                        shift: e.target.value as 'Manhã' | 'Tarde' | 'Noite' | 'Integral',
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-white"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nº de Alunos
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={classForm.studentCount}
                    onChange={(e) =>
                      setClassForm({ ...classForm, studentCount: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laboratório / Cozinha
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cozinha Pedagógica 01, Ateliê de Confeitaria..."
                  value={classForm.kitchenRoom}
                  onChange={(e) => setClassForm({ ...classForm, kitchenRoom: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#002747]">
                    Instrutor Chef Responsável *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassModalOpen(false);
                      handleOpenInstructorModal();
                    }}
                    className="text-[11px] font-bold text-[#ff8928] hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Novo Instrutor</span>
                  </button>
                </div>
                <select
                  required
                  value={classForm.instructorId}
                  onChange={(e) => setClassForm({ ...classForm, instructorId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none bg-white font-medium"
                >
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status da Turma (Ativa vs Inativa) */}
              <div>
                <label className="block text-xs font-bold text-[#002747] mb-1.5">
                  Status Operacional da Turma *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClassForm({ ...classForm, status: 'ativa' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      classForm.status === 'ativa'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Turma Ativa (Em andamento)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassForm({ ...classForm, status: 'inativa' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      classForm.status === 'inativa'
                        ? 'bg-slate-100 border-slate-500 text-slate-800 ring-2 ring-slate-400/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Turma Inativa (Concluída)</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Turmas ativas são consideradas no cálculo padrão do relatório de compras para o CD (Centro de Distribuição).
                </p>
              </div>

              {/* Datas de Início e Término */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Início das Aulas
                  </label>
                  <input
                    type="date"
                    value={classForm.startDate}
                    onChange={(e) => setClassForm({ ...classForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Prevista de Término
                  </label>
                  <input
                    type="date"
                    value={classForm.endDate}
                    onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none"
                  />
                </div>
              </div>

              {/* Descrição Pedagógica */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição / Ementa Resumida
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Módulo avançado de pâtisserie francesa e chocolateria fina..."
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002747]/20 focus:border-[#002747] outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002747] hover:bg-[#00192e] text-white shadow-sm flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5 text-[#ff8928]" />
                  <span>{editingClass ? 'Salvar Alterações' : 'Cadastrar Turma'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar / Editar Instrutor */}
      {isInstructorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingInstructor ? 'Editar Instrutor' : 'Cadastrar Novo Instrutor'}
                </h3>
              </div>
              <button
                onClick={() => setIsInstructorModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInstructor} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Chef / Instrutor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chef Bernardo Guimarães"
                  value={instructorForm.name}
                  onChange={(e) =>
                    setInstructorForm({ ...instructorForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Especialidade Gastronômica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Panificação, Confeitaria Francesa, Carnes..."
                  value={instructorForm.specialty}
                  onChange={(e) =>
                    setInstructorForm({ ...instructorForm, specialty: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={instructorForm.phone}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="chef@escola.com.br"
                    value={instructorForm.email}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cor do Crachá / Identificação
                </label>
                <div className="flex items-center space-x-2">
                  {['#1e40af', '#ea580c', '#0284c7', '#f97316', '#059669', '#7c3aed'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setInstructorForm({ ...instructorForm, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        instructorForm.color === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInstructorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30 flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
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
