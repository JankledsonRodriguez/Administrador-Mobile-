export type StockUnit = 'kg' | 'g' | 'L' | 'ml' | 'un' | 'pct' | 'cx' | 'lata';

export type StockCategory =
  | 'Secos e Farinhas'
  | 'Laticínios e Frios'
  | 'Hortifruti'
  | 'Carnes e Pescados'
  | 'Óleos e Condimentos'
  | 'Bebidas e Líquidos'
  | 'Confeitaria e Chocolates'
  | 'Descartáveis e Higiene';

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: StockCategory;
  currentQuantity: number;
  minQuantity: number;
  unit: StockUnit;
  location: string;
  expiryDate?: string;
  costPerUnit?: number;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  registrationNumber?: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  color: string;
  active: boolean;
  notes?: string;
  createdAt?: string;
}

export interface ClassGroup {
  id: string;
  code: string;
  name: string;
  shift: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
  kitchenRoom: string;
  instructorId: string;
  studentCount: number;
  status: 'ativa' | 'inativa' | 'concluída';
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface RecipeIngredient {
  stockItemId?: string;
  name: string;
  quantity: number;
  unit: StockUnit;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  yieldPortions: number;
  prepTimeMinutes: number;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  instructions: string[];
  ingredients: RecipeIngredient[];
}

export type UtensilCategory =
  | 'Corte & Facas'
  | 'Confeitaria & Panificação'
  | 'Panelas & Formas'
  | 'Eletroportáteis & Motores'
  | 'Medição & Precisão'
  | 'Apoio, Tábuas & Higiene';

export interface KitchenUtensil {
  id: string;
  code: string;
  name: string;
  category: UtensilCategory;
  unit: string;
  totalAvailable: number;
  maintenanceStatus: 'pronto' | 'em_higienizacao' | 'manutencao';
  description?: string;
}

export interface RequisitionUtensilItem {
  utensilId: string;
  name: string;
  category: UtensilCategory;
  requestedQuantity: number;
  approvedQuantity: number;
  unit: string;
  returned?: boolean;
}

export type AlterationStatus = 'pendente' | 'autorizado' | 'recusado';

export interface ClassAlterationRequest {
  id: string;
  requestedAt: string;
  instructorId: string;
  classId: string;
  type: 'mudanca_sala' | 'mudanca_horario' | 'troca_receita' | 'acrescimo_utensilios' | 'outros';
  title: string;
  reason: string;
  previousValue?: string;
  newValue?: string;
  status: AlterationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  adminDecisionNotes?: string;
}

export interface InstructorPermissionSettings {
  allowAlterationsWithoutNotice: boolean;
  requireAdminApproval: boolean;
  maxNoticeHours: number;
  allowExtraUtensilsCheckout: boolean;
  allowEmergencyScheduleSwap: boolean;
}

export interface RequisitionItem {
  stockItemId: string;
  name: string;
  requestedQuantity: number;
  approvedQuantity: number;
  unit: StockUnit;
}

export type RequisitionStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'enviado';

export interface Requisition {
  id: string;
  code: string;
  classId: string;
  instructorId: string;
  recipeId?: string;
  recipeName?: string;
  purpose: string;
  requestDate: string;
  status: RequisitionStatus;
  items: RequisitionItem[];
  utensils?: RequisitionUtensilItem[];
  notes?: string;
  adminDispatchNotes?: string;
  alterationRequest?: ClassAlterationRequest;
  rejectionReason?: string;
  reviewedAt?: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
}

export interface DispatchRecord {
  id: string;
  code: string;
  requisitionId?: string;
  classId: string;
  className: string;
  instructorId: string;
  instructorName: string;
  kitchenRoom: string;
  items: {
    stockItemId: string;
    name: string;
    quantity: number;
    unit: StockUnit;
  }[];
  utensils?: {
    utensilId: string;
    name: string;
    quantity: number;
    unit: string;
    category: UtensilCategory;
  }[];
  dispatchedAt: string;
  dispatchedBy: string;
  notes?: string;
  adminDispatchNotes?: string;
  status: 'entregue' | 'a_caminho';
}

// ----------------------------------------------------
// CICLOS DE COMPRA & PLANEJAMENTO PEDAGÓGICO
// ----------------------------------------------------

export type ProcurementCycleType = 'hortifruti' | 'frios' | 'proteina' | 'mercearia' | 'todos';

export interface ProcurementCycleInfo {
  id: ProcurementCycleType;
  title: string;
  periodicityLabel: string;
  ruleExplanation: string;
  example: string;
  categories: StockCategory[];
  fractionedDelivery?: boolean;
}

export interface AcademicLessonSchedule {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  instructorId: string;
  instructorName: string;
  kitchenRoom: string;
  date: string; // YYYY-MM-DD
  weekNumber: number;
  recipeId: string;
  recipeName: string;
  servingsMultiplier: number;
  ingredients: {
    stockItemId: string;
    name: string;
    quantity: number;
    unit: StockUnit;
    category: StockCategory;
  }[];
}

export interface ProcurementClassBreakdown {
  classId: string;
  className: string;
  classCode: string;
  shift?: string;
  isActive?: boolean;
  quantityNeeded: number;
  lessonDates?: string[];
}

export interface ProcurementReportItem {
  stockItemId: string;
  itemCode?: string;
  name: string;
  category: StockCategory;
  cycleType?: ProcurementCycleType;
  cycleLabel: string;
  unit: StockUnit;
  totalRequired: number;
  currentStock: number;
  minSafetyStock: number;
  suggestedPurchase: number;
  unitCost: number;
  totalCost: number;
  classesBreakdown: ProcurementClassBreakdown[];
  matchedLessonsCount?: number;
  lessonsCount?: number;
  deliveryFractions?: {
    fractionNumber: number;
    totalFractions: number;
    portionQty: number;
    deliveryMonth: string;
  }[];
}

export type ActiveTab = 'estoque' | 'instrutores' | 'turmas' | 'requisicoes' | 'historico';

