import React from 'react';
import {
  UtensilsCrossed,
  Smartphone,
  Monitor,
  RotateCcw,
  AlertTriangle,
  ClipboardCheck,
  UserPlus,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenRequisitions: () => void;
  onOpenInstructors?: () => void;
  onOpenCreateInstructor?: () => void;
  onOpenProcurement?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  onOpenRequisitions,
  onOpenInstructors,
  onOpenCreateInstructor,
  onOpenProcurement,
}) => {
  const { requisitions, stockItems, resetToDefaults } = useApp();

  const pendingCount = requisitions.filter((r) => r.status === 'pendente').length;
  const lowStockCount = stockItems.filter((i) => i.currentQuantity <= i.minQuantity).length;

  return (
    <header className="bg-[#002747] text-white shadow-md sticky top-0 z-30 border-b border-[#00192e]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#ff8928] flex items-center justify-center shadow-md shadow-[#ff8928]/30 text-white font-black">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black tracking-tight text-xl text-white">SIGEC</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#ff8928] text-white">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-blue-200/90 hidden sm:block font-medium">
              Sistema de Gerenciamento de Estoque da Cozinha
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Procurement Report Button */}
          {onOpenProcurement && (
            <button
              id="header-btn-compras"
              onClick={onOpenProcurement}
              title="Planejamento e Relatório de Compras"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#003660] hover:bg-[#004277] text-blue-100 border border-blue-400/20 text-xs font-bold transition-all shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#ff8928]" />
              <span>Relatório de Compras</span>
            </button>
          )}

          {/* Quick Add Instructor Button for Manager */}
          {onOpenCreateInstructor && (
            <button
              id="header-btn-novo-instrutor"
              onClick={onOpenCreateInstructor}
              title="Cadastrar Novo Instrutor Chef"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#ff8928] hover:bg-[#eb7717] text-white text-xs font-bold transition-all shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cadastrar Instrutor</span>
              <span className="sm:hidden">+ Instrutor</span>
            </button>
          )}

          {/* Low stock badge notification */}
          {lowStockCount > 0 && (
            <div
              title={`${lowStockCount} itens com estoque abaixo do mínimo`}
              className="hidden md:flex items-center space-x-1 bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs px-2.5 py-1 rounded-lg"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{lowStockCount} baixo estoque</span>
            </div>
          )}

          {/* Pending Requisitions Pill */}
          <button
            onClick={onOpenRequisitions}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pendingCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm ring-2 ring-amber-300/40 animate-pulse'
                : 'bg-[#003660] hover:bg-[#004277] text-blue-100 border border-blue-400/20'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-white" />
            <span>{pendingCount > 0 ? `${pendingCount} Req. Pendentes` : 'Requisições'}</span>
          </button>

          {/* Frame switch (Mobile shell vs Fluid desktop) */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? 'Expandir para Tela Cheia' : 'Simular Moldura Mobile'}
            className="p-2 rounded-xl bg-[#003660] hover:bg-[#004277] text-blue-100 transition-colors border border-blue-400/20 flex items-center justify-center text-xs"
          >
            {isMobileFrame ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4 text-[#ff8928]" />
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('Deseja restaurar os dados padrão do SIGEC?')) {
                resetToDefaults();
              }
            }}
            title="Restaurar dados padrão"
            className="p-2 rounded-xl bg-[#003660] hover:bg-[#004277] text-blue-100 transition-colors border border-blue-400/20 flex items-center justify-center text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
