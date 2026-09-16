import React from 'react';
import { Package, UserCheck, Users, ClipboardCheck, History } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useApp } from '../../context/AppContext';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { requisitions } = useApp();
  const pendingCount = requisitions.filter((r) => r.status === 'pendente').length;

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'instrutores', label: 'Instrutores', icon: UserCheck },
    { id: 'turmas', label: 'Turmas', icon: Users },
    { id: 'requisicoes', label: 'Requisições', icon: ClipboardCheck, badge: pendingCount },
    { id: 'historico', label: 'Histórico', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 max-w-7xl mx-auto sm:static sm:border-t-0 sm:shadow-none sm:py-2 sm:px-4 sm:bg-transparent">
      <div className="flex items-center justify-around sm:justify-center sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col sm:flex-row items-center justify-center py-2 px-2 sm:px-4 sm:py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[#002747] bg-slate-100 sm:bg-[#002747] sm:text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-[#002747] hover:bg-slate-100 sm:hover:bg-slate-200/60'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 sm:w-4 sm:h-4 sm:mr-1.5 ${
                    isActive ? 'text-[#ff8928] sm:text-white' : 'text-slate-500'
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 sm:-top-2 sm:-right-2 w-4 h-4 rounded-full bg-[#ff8928] text-white text-[10px] font-black flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] sm:text-xs mt-0.5 sm:mt-0 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="sm:hidden absolute -bottom-1 w-6 h-1 rounded-full bg-[#ff8928]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
