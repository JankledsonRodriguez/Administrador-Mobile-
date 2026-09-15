import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StockItem,
  Instructor,
  ClassGroup,
  Recipe,
  Requisition,
  DispatchRecord,
  StockUnit,
  KitchenUtensil,
  InstructorPermissionSettings,
  ClassAlterationRequest,
  RequisitionUtensilItem,
  AcademicLessonSchedule,
} from '../types';
import {
  initialStockItems,
  initialInstructors,
  initialClasses,
  initialRecipes,
  initialRequisitions,
  initialDispatches,
  initialUtensils,
  initialPermissionSettings,
  initialAcademicCalendar,
} from '../mockData';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description?: string;
}

interface AppContextType {
  stockItems: StockItem[];
  instructors: Instructor[];
  classes: ClassGroup[];
  recipes: Recipe[];
  requisitions: Requisition[];
  dispatches: DispatchRecord[];
  utensils: KitchenUtensil[];
  academicCalendar: AcademicLessonSchedule[];
  permissionSettings: InstructorPermissionSettings;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, description?: string) => void;
  removeToast: (id: string) => void;

  // Stock methods
  addStockItem: (item: Omit<StockItem, 'id' | 'code' | 'updatedAt'>) => void;
  updateStockItem: (id: string, item: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  adjustStockQuantity: (id: string, delta: number) => void;

  // Utensils methods
  updateUtensilStatus: (id: string, status: KitchenUtensil['maintenanceStatus']) => void;

  // Permission settings
  updatePermissionSettings: (settings: Partial<InstructorPermissionSettings>) => void;

  // Instructor methods
  addInstructor: (instructor: Omit<Instructor, 'id'>) => void;
  updateInstructor: (id: string, instructor: Partial<Instructor>) => void;
  deleteInstructor: (id: string) => void;

  // Class methods
  addClassGroup: (classGroup: Omit<ClassGroup, 'id' | 'code'>) => void;
  updateClassGroup: (id: string, classGroup: Partial<ClassGroup>) => void;
  deleteClassGroup: (id: string) => void;
  toggleClassStatus: (id: string) => void;

  // Recipe methods
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  // Requisition methods
  createRequisition: (data: {
    classId: string;
    instructorId: string;
    recipeId?: string;
    recipeName?: string;
    purpose: string;
    notes?: string;
    items: { stockItemId: string; requestedQuantity: number; unit: StockUnit }[];
    utensils?: { utensilId: string; requestedQuantity: number }[];
  }) => string;
  approveAndDispatchRequisition: (
    requisitionId: string,
    approvedItems: { stockItemId: string; approvedQuantity: number }[],
    notes?: string,
    approvedUtensils?: { utensilId: string; approvedQuantity: number }[],
    adminNotes?: string
  ) => boolean;
  rejectRequisition: (requisitionId: string, reason: string) => void;
  createDirectDispatch: (data: {
    classId: string;
    instructorId: string;
    items: { stockItemId: string; quantity: number; unit: StockUnit }[];
    utensils?: { utensilId: string; quantity: number }[];
    notes?: string;
    adminDispatchNotes?: string;
  }) => boolean;

  // Alteration permission methods
  submitClassAlterationRequest: (
    requisitionId: string,
    data: {
      type: ClassAlterationRequest['type'];
      title: string;
      reason: string;
      previousValue?: string;
      newValue?: string;
    }
  ) => void;
  reviewClassAlterationRequest: (
    requisitionId: string,
    decision: 'autorizado' | 'recusado',
    adminNotes?: string
  ) => void;

  // Utilities
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('sigec_stock') || localStorage.getItem('chefstock_stock');
    return saved ? JSON.parse(saved) : initialStockItems;
  });

  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    const saved = localStorage.getItem('sigec_instructors') || localStorage.getItem('chefstock_instructors');
    return saved ? JSON.parse(saved) : initialInstructors;
  });

  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem('sigec_classes') || localStorage.getItem('chefstock_classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('sigec_recipes') || localStorage.getItem('chefstock_recipes');
    return saved ? JSON.parse(saved) : initialRecipes;
  });

  const [requisitions, setRequisitions] = useState<Requisition[]>(() => {
    const saved = localStorage.getItem('sigec_requisitions') || localStorage.getItem('chefstock_requisitions');
    return saved ? JSON.parse(saved) : initialRequisitions;
  });

  const [dispatches, setDispatches] = useState<DispatchRecord[]>(() => {
    const saved = localStorage.getItem('sigec_dispatches') || localStorage.getItem('chefstock_dispatches');
    return saved ? JSON.parse(saved) : initialDispatches;
  });

  const [utensils, setUtensils] = useState<KitchenUtensil[]>(() => {
    const saved = localStorage.getItem('sigec_utensils');
    return saved ? JSON.parse(saved) : initialUtensils;
  });

  const [permissionSettings, setPermissionSettings] = useState<InstructorPermissionSettings>(() => {
    const saved = localStorage.getItem('sigec_permissions');
    return saved ? JSON.parse(saved) : initialPermissionSettings;
  });

  const [academicCalendar, setAcademicCalendar] = useState<AcademicLessonSchedule[]>(() => {
    const saved = localStorage.getItem('sigec_calendar');
    return saved ? JSON.parse(saved) : initialAcademicCalendar;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sigec_stock', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('sigec_instructors', JSON.stringify(instructors));
  }, [instructors]);

  useEffect(() => {
    localStorage.setItem('sigec_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('sigec_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('sigec_requisitions', JSON.stringify(requisitions));
  }, [requisitions]);

  useEffect(() => {
    localStorage.setItem('sigec_dispatches', JSON.stringify(dispatches));
  }, [dispatches]);

  useEffect(() => {
    localStorage.setItem('sigec_utensils', JSON.stringify(utensils));
  }, [utensils]);

  useEffect(() => {
    localStorage.setItem('sigec_permissions', JSON.stringify(permissionSettings));
  }, [permissionSettings]);

  useEffect(() => {
    localStorage.setItem('sigec_calendar', JSON.stringify(academicCalendar));
  }, [academicCalendar]);

  const updateUtensilStatus = (id: string, status: KitchenUtensil['maintenanceStatus']) => {
    setUtensils((prev) =>
      prev.map((u) => (u.id === id ? { ...u, maintenanceStatus: status } : u))
    );
  };

  const updatePermissionSettings = (settings: Partial<InstructorPermissionSettings>) => {
    setPermissionSettings((prev) => ({ ...prev, ...settings }));
    showToast('success', 'Regras de Permissão Atualizadas', 'As diretrizes para alterações de aula por instrutores foram salvas.');
  };

  const showToast = (type: ToastMessage['type'], title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Stock handlers
  const addStockItem = (item: Omit<StockItem, 'id' | 'code' | 'updatedAt'>) => {
    const newCode = `EST-${String(stockItems.length + 1).padStart(3, '0')}`;
    const newItem: StockItem = {
      ...item,
      id: `item-${Date.now()}`,
      code: newCode,
      updatedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setStockItems((prev) => [newItem, ...prev]);
    showToast('success', 'Item Cadastrado!', `${newItem.name} foi adicionado ao estoque.`);
  };

  const updateStockItem = (id: string, updated: Partial<StockItem>) => {
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updated,
              updatedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
            }
          : item
      )
    );
    showToast('info', 'Item Atualizado', 'Os dados do item foram salvos com sucesso.');
  };

  const deleteStockItem = (id: string) => {
    const target = stockItems.find((i) => i.id === id);
    setStockItems((prev) => prev.filter((item) => item.id !== id));
    showToast('warning', 'Item Removido', `${target?.name || 'Item'} foi excluído do estoque.`);
  };

  const adjustStockQuantity = (id: string, delta: number) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, Math.round((item.currentQuantity + delta) * 100) / 100);
          return {
            ...item,
            currentQuantity: newQty,
            updatedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
          };
        }
        return item;
      })
    );
  };

  // Instructor handlers
  const addInstructor = (instructor: Omit<Instructor, 'id'>) => {
    const nextNum = instructors.length + 1;
    const generatedReg = instructor.registrationNumber?.trim() || `CHEF-${String(nextNum).padStart(3, '0')}`;
    const newInstructor: Instructor = {
      ...instructor,
      id: `inst-${Date.now()}`,
      registrationNumber: generatedReg,
      createdAt: instructor.createdAt || new Date().toISOString().split('T')[0],
      active: instructor.active !== undefined ? instructor.active : true,
    };
    setInstructors((prev) => [...prev, newInstructor]);
    showToast('success', 'Instrutor Cadastrado!', `${newInstructor.name} (${generatedReg}) foi cadastrado com sucesso.`);
  };

  const updateInstructor = (id: string, updated: Partial<Instructor>) => {
    setInstructors((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, ...updated } : inst))
    );
    showToast('info', 'Instrutor Atualizado', 'As informações do instrutor foram atualizadas.');
  };

  const deleteInstructor = (id: string) => {
    const inst = instructors.find((i) => i.id === id);
    setInstructors((prev) => prev.filter((i) => i.id !== id));
    showToast('warning', 'Instrutor Removido', `${inst?.name || 'Instrutor'} foi excluído.`);
  };

  // Class handlers
  const addClassGroup = (classGroup: Omit<ClassGroup, 'id' | 'code'>) => {
    const newCode = `TUR-2026-${String(classes.length + 1).padStart(2, '0')}`;
    const newClass: ClassGroup = {
      ...classGroup,
      id: `turma-${Date.now()}`,
      code: newCode,
    };
    setClasses((prev) => [...prev, newClass]);
    showToast('success', 'Turma Cadastrada!', `Turma ${newClass.name} criada com sucesso.`);
  };

  const updateClassGroup = (id: string, updated: Partial<ClassGroup>) => {
    setClasses((prev) =>
      prev.map((cls) => (cls.id === id ? { ...cls, ...updated } : cls))
    );
    showToast('info', 'Turma Atualizada', 'Informações da turma foram salvas.');
  };

  const deleteClassGroup = (id: string) => {
    const cls = classes.find((c) => c.id === id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    showToast('warning', 'Turma Removida', `${cls?.name || 'Turma'} foi excluída.`);
  };

  const toggleClassStatus = (id: string) => {
    const cls = classes.find((c) => c.id === id);
    if (!cls) return;

    const newStatus: ClassGroup['status'] = cls.status === 'ativa' ? 'inativa' : 'ativa';
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    showToast(
      newStatus === 'ativa' ? 'success' : 'info',
      `Status da Turma: ${newStatus === 'ativa' ? 'Ativa' : 'Inativa'}`,
      `A turma "${cls.name}" agora está classificada como ${newStatus === 'ativa' ? 'Ativa (Em andamento)' : 'Inativa (Concluída)'}.`
    );
  };

  // Recipe handlers
  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `rec-${Date.now()}`,
    };
    setRecipes((prev) => [...prev, newRecipe]);
    showToast('success', 'Receita Cadastrada!', `${newRecipe.name} foi adicionada ao cardápio pedagógico.`);
  };

  const updateRecipe = (id: string, updated: Partial<Recipe>) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
    showToast('info', 'Receita Atualizada', 'A receita foi atualizada com sucesso.');
  };

  const deleteRecipe = (id: string) => {
    const rec = recipes.find((r) => r.id === id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    showToast('warning', 'Receita Removida', `${rec?.name || 'Receita'} foi excluída.`);
  };

  // Requisition handlers
  const createRequisition = (data: {
    classId: string;
    instructorId: string;
    recipeId?: string;
    recipeName?: string;
    purpose: string;
    notes?: string;
    items: { stockItemId: string; requestedQuantity: number; unit: StockUnit }[];
    utensils?: { utensilId: string; requestedQuantity: number }[];
  }): string => {
    const nextNum = requisitions.length + 105;
    const reqCode = `REQ-${nextNum}`;

    const formattedItems = data.items.map((item) => {
      const stock = stockItems.find((s) => s.id === item.stockItemId);
      return {
        stockItemId: item.stockItemId,
        name: stock ? stock.name : 'Item Desconhecido',
        requestedQuantity: item.requestedQuantity,
        approvedQuantity: item.requestedQuantity,
        unit: item.unit || (stock ? stock.unit : 'un'),
      };
    });

    const formattedUtensils: RequisitionUtensilItem[] = (data.utensils || []).map((u) => {
      const utObj = utensils.find((item) => item.id === u.utensilId);
      return {
        utensilId: u.utensilId,
        name: utObj ? utObj.name : 'Utensílio',
        category: utObj ? utObj.category : 'Apoio, Tábuas & Higiene',
        requestedQuantity: u.requestedQuantity,
        approvedQuantity: u.requestedQuantity,
        unit: utObj ? utObj.unit : 'un',
      };
    });

    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      code: reqCode,
      classId: data.classId,
      instructorId: data.instructorId,
      recipeId: data.recipeId,
      recipeName: data.recipeName,
      purpose: data.purpose,
      notes: data.notes,
      requestDate: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'pendente',
      items: formattedItems,
      utensils: formattedUtensils,
    };

    setRequisitions((prev) => [newReq, ...prev]);
    showToast('success', `Requisição ${reqCode} Criada!`, 'Aguardando análise e aprovação do almoxarife.');
    return newReq.id;
  };

  // Main flow: Analyze, Approve and Dispatch Requisition
  const approveAndDispatchRequisition = (
    requisitionId: string,
    approvedItems: { stockItemId: string; approvedQuantity: number }[],
    notes?: string,
    approvedUtensils?: { utensilId: string; approvedQuantity: number }[],
    adminNotes?: string
  ): boolean => {
    const req = requisitions.find((r) => r.id === requisitionId);
    if (!req) return false;

    const classObj = classes.find((c) => c.id === req.classId);
    const instructorObj = instructors.find((i) => i.id === req.instructorId);

    // Deduct approved items from stock
    const updatedStock = [...stockItems];
    const dispatchItemsList: {
      stockItemId: string;
      name: string;
      quantity: number;
      unit: StockUnit;
    }[] = [];

    for (const approved of approvedItems) {
      const stockIdx = updatedStock.findIndex((s) => s.id === approved.stockItemId);
      if (stockIdx !== -1) {
        const current = updatedStock[stockIdx];
        const newQty = Math.max(0, Math.round((current.currentQuantity - approved.approvedQuantity) * 100) / 100);
        updatedStock[stockIdx] = {
          ...current,
          currentQuantity: newQty,
          updatedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        };
        dispatchItemsList.push({
          stockItemId: current.id,
          name: current.name,
          quantity: approved.approvedQuantity,
          unit: current.unit,
        });
      }
    }

    setStockItems(updatedStock);

    // Format approved utensils for dispatch
    const dispatchUtensilsList: {
      utensilId: string;
      name: string;
      quantity: number;
      unit: string;
      category: any;
    }[] = [];

    const updatedRequisitionUtensils = (req.utensils || []).map((u) => {
      const match = (approvedUtensils || []).find((au) => au.utensilId === u.utensilId);
      const appQty = match !== undefined ? match.approvedQuantity : u.requestedQuantity;
      if (appQty > 0) {
        dispatchUtensilsList.push({
          utensilId: u.utensilId,
          name: u.name,
          quantity: appQty,
          unit: u.unit,
          category: u.category,
        });
      }
      return {
        ...u,
        approvedQuantity: appQty,
      };
    });

    // Mark requisition as sent/dispatched
    const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === requisitionId
          ? {
              ...r,
              status: 'enviado',
              reviewedAt: nowStr,
              dispatchedAt: nowStr,
              dispatchedBy: 'Gestão de Estoque (Chef Almoxarife)',
              notes: notes || r.notes,
              adminDispatchNotes: adminNotes,
              utensils: updatedRequisitionUtensils,
              items: r.items.map((item) => {
                const match = approvedItems.find((a) => a.stockItemId === item.stockItemId);
                return match ? { ...item, approvedQuantity: match.approvedQuantity } : item;
              }),
            }
          : r
      )
    );

    // Record in Dispatch History
    const dispatchCode = `ENV-2026-${String(dispatches.length + 90).padStart(3, '0')}`;
    const newDispatch: DispatchRecord = {
      id: `disp-${Date.now()}`,
      code: dispatchCode,
      requisitionId: req.id,
      classId: req.classId,
      className: classObj?.name || 'Turma Gastronomia',
      instructorId: req.instructorId,
      instructorName: instructorObj?.name || 'Instrutor Responsável',
      kitchenRoom: classObj?.kitchenRoom || 'Cozinha Pedagógica',
      dispatchedAt: nowStr,
      dispatchedBy: 'Gestão de Estoque (Chef Almoxarife)',
      status: 'entregue',
      notes: notes || `Envio de requisição ${req.code} - ${req.purpose}`,
      adminDispatchNotes: adminNotes,
      items: dispatchItemsList,
      utensils: dispatchUtensilsList,
    };

    setDispatches((prev) => [newDispatch, ...prev]);

    showToast(
      'success',
      'Itens & Utensílios Aprovados & Despachados!',
      `Envio ${dispatchCode} gerado com anotações do administrador e estoque atualizado.`
    );
    return true;
  };

  const rejectRequisition = (requisitionId: string, reason: string) => {
    const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === requisitionId
          ? {
              ...r,
              status: 'rejeitado',
              rejectionReason: reason,
              reviewedAt: nowStr,
            }
          : r
      )
    );
    showToast('warning', 'Requisição Rejeitada', `A requisição foi recusada com a devida justificativa.`);
  };

  // Direct dispatch without prior requisition
  const createDirectDispatch = (data: {
    classId: string;
    instructorId: string;
    items: { stockItemId: string; quantity: number; unit: StockUnit }[];
    utensils?: { utensilId: string; quantity: number }[];
    notes?: string;
    adminDispatchNotes?: string;
  }): boolean => {
    const classObj = classes.find((c) => c.id === data.classId);
    const instructorObj = instructors.find((i) => i.id === data.instructorId);

    // Deduct from stock
    const updatedStock = [...stockItems];
    const dispatchItemsList: {
      stockItemId: string;
      name: string;
      quantity: number;
      unit: StockUnit;
    }[] = [];

    for (const item of data.items) {
      const idx = updatedStock.findIndex((s) => s.id === item.stockItemId);
      if (idx !== -1) {
        const current = updatedStock[idx];
        const newQty = Math.max(0, Math.round((current.currentQuantity - item.quantity) * 100) / 100);
        updatedStock[idx] = {
          ...current,
          currentQuantity: newQty,
          updatedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        };
        dispatchItemsList.push({
          stockItemId: current.id,
          name: current.name,
          quantity: item.quantity,
          unit: item.unit,
        });
      }
    }

    setStockItems(updatedStock);

    const dispatchUtensilsList = (data.utensils || []).map((u) => {
      const utObj = utensils.find((item) => item.id === u.utensilId);
      return {
        utensilId: u.utensilId,
        name: utObj ? utObj.name : 'Utensílio',
        quantity: u.quantity,
        unit: utObj ? utObj.unit : 'un',
        category: utObj ? utObj.category : 'Apoio, Tábuas & Higiene',
      };
    });

    const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    const dispatchCode = `ENV-2026-${String(dispatches.length + 90).padStart(3, '0')}`;

    const newDispatch: DispatchRecord = {
      id: `disp-${Date.now()}`,
      code: dispatchCode,
      classId: data.classId,
      className: classObj?.name || 'Turma Selecionada',
      instructorId: data.instructorId,
      instructorName: instructorObj?.name || 'Instrutor Responsável',
      kitchenRoom: classObj?.kitchenRoom || 'Cozinha Pedagógica',
      dispatchedAt: nowStr,
      dispatchedBy: 'Gestão de Estoque',
      status: 'entregue',
      notes: data.notes || 'Envio direto avulso para bancada do instrutor.',
      adminDispatchNotes: data.adminDispatchNotes,
      items: dispatchItemsList,
      utensils: dispatchUtensilsList,
    };

    setDispatches((prev) => [newDispatch, ...prev]);

    showToast(
      'success',
      'Itens Enviados com Sucesso!',
      `Despacho ${dispatchCode} registrado e estoque deduzido.`
    );
    return true;
  };

  // Class alteration requests by instructors
  const submitClassAlterationRequest = (
    requisitionId: string,
    data: {
      type: ClassAlterationRequest['type'];
      title: string;
      reason: string;
      previousValue?: string;
      newValue?: string;
    }
  ) => {
    const req = requisitions.find((r) => r.id === requisitionId);
    if (!req) return;

    const newRequest: ClassAlterationRequest = {
      id: `alt-${Date.now()}`,
      requestedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      instructorId: req.instructorId,
      classId: req.classId,
      type: data.type,
      title: data.title,
      reason: data.reason,
      previousValue: data.previousValue,
      newValue: data.newValue,
      status: 'pendente',
    };

    setRequisitions((prev) =>
      prev.map((r) => (r.id === requisitionId ? { ...r, alterationRequest: newRequest } : r))
    );

    showToast(
      'info',
      'Solicitação de Alteração Registrada',
      'A alteração de aula foi encaminhada para autorização da gerência.'
    );
  };

  const reviewClassAlterationRequest = (
    requisitionId: string,
    decision: 'autorizado' | 'recusado',
    adminNotes?: string
  ) => {
    const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    let reqTitle = '';

    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.id === requisitionId && r.alterationRequest) {
          reqTitle = r.alterationRequest.title;
          const updatedRequest: ClassAlterationRequest = {
            ...r.alterationRequest,
            status: decision,
            reviewedBy: 'Chef Almoxarife (Administração)',
            reviewedAt: nowStr,
            adminDecisionNotes: adminNotes,
          };
          return {
            ...r,
            alterationRequest: updatedRequest,
          };
        }
        return r;
      })
    );

    if (decision === 'autorizado') {
      showToast(
        'success',
        'Alteração Autorizada!',
        `A solicitação do instrutor foi autorizada pela gerência.`
      );
    } else {
      showToast(
        'warning',
        'Alteração Recusada',
        `A alteração foi recusada com parecer do administrador.`
      );
    }
  };

  const resetToDefaults = () => {
    setStockItems(initialStockItems);
    setInstructors(initialInstructors);
    setClasses(initialClasses);
    setRecipes(initialRecipes);
    setRequisitions(initialRequisitions);
    setDispatches(initialDispatches);
    setUtensils(initialUtensils);
    setAcademicCalendar(initialAcademicCalendar);
    setPermissionSettings(initialPermissionSettings);
    localStorage.clear();
    showToast('info', 'Dados Restaurados', 'Dados demonstrativos da escola de culinária e calendário acadêmico foram restaurados.');
  };

  return (
    <AppContext.Provider
      value={{
        stockItems,
        instructors,
        classes,
        recipes,
        requisitions,
        dispatches,
        utensils,
        academicCalendar,
        permissionSettings,
        toasts,
        showToast,
        removeToast,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        adjustStockQuantity,
        updateUtensilStatus,
        updatePermissionSettings,
        addInstructor,
        updateInstructor,
        deleteInstructor,
        addClassGroup,
        updateClassGroup,
        deleteClassGroup,
        toggleClassStatus,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        createRequisition,
        approveAndDispatchRequisition,
        rejectRequisition,
        createDirectDispatch,
        submitClassAlterationRequest,
        reviewClassAlterationRequest,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
