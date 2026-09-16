import React, { useState } from 'react';
import {
  Shield,
  X,
  Check,
  AlertTriangle,
  Clock,
  Settings,
  Flame,
  Utensils,
  DoorClosed,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PermissionsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsSettingsModal: React.FC<PermissionsSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { permissionSettings, updatePermissionSettings } = useApp();

  const [settings, setSettings] = useState(permissionSettings);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePermissionSettings(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#002747] text-white flex items-center justify-between border-b border-[#00192e]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff8928] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Estrutura de Permissões para Aulas</h3>
              <p className="text-xs text-blue-200">
                Políticas e diretrizes para alterações de aula e requisições dos instrutores
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed">
              As regras configuradas aqui definem os limites de autonomia dos chefs instrutores. Sempre que ocorrer uma alteração de sala, receita, horário ou utensílios fora da rotina padrão, o sistema acionará o fluxo de autorização administrativa.
            </p>
          </div>

          <div className="space-y-3">
            {/* Rule 1: Approval required */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="pr-3">
                <span className="font-bold text-slate-900 block text-xs">
                  Exigir Aprovação Prévia da Administração
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Qualquer mudança solicitada pelo instrutor na aula (sala, insumos, receita) exige parecer do almoxarife/gerência.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.requireAdminApprovalForAnyChange}
                  onChange={(e) =>
                    setSettings({ ...settings, requireAdminApprovalForAnyChange: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff8928]" />
              </label>
            </div>

            {/* Rule 2: Emergency utensils addition */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="pr-3">
                <div className="flex items-center space-x-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#ff8928]" />
                  <span className="font-bold text-slate-900 block text-xs">
                    Inclusão Emergencial de Utensílios
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Permite ao instrutor solicitar utensílios extras no início imediato da aula sem bloqueio operacional.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.allowEmergencyUtensilAddition}
                  onChange={(e) =>
                    setSettings({ ...settings, allowEmergencyUtensilAddition: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002747]" />
              </label>
            </div>

            {/* Rule 3: Recipe swap */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="pr-3">
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-slate-900 block text-xs">
                    Substituição de Ficha Técnica / Receita
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Permite ao instrutor trocar a preparação gastronômica da aula mediante justificativa pedagógica.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.allowInstructorRecipeSwap}
                  onChange={(e) =>
                    setSettings({ ...settings, allowInstructorRecipeSwap: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002747]" />
              </label>
            </div>

            {/* Rule 4: Room change */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="pr-3">
                <div className="flex items-center space-x-1.5">
                  <DoorClosed className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-bold text-slate-900 block text-xs">
                    Troca de Laboratório / Bancada sem Aviso Prévio
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Se desmarcado, qualquer realocação de cozinha pedagógica exige autorização da coordenação.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.allowRoomChangeWithoutNotice}
                  onChange={(e) =>
                    setSettings({ ...settings, allowRoomChangeWithoutNotice: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002747]" />
              </label>
            </div>

            {/* Numeric rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Antecedência Mínima de Aviso</span>
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={settings.minNoticeHoursForAlteration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minNoticeHoursForAlteration: parseInt(e.target.value) || 24,
                      })
                    }
                    className="w-20 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-xs text-slate-600 font-semibold">horas de antecedência</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tempo hábil para o almoxarifado separar os novos utensílios e insumos.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>Tolerância de Variação de Custo</span>
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settings.maxBudgetVariancePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxBudgetVariancePercent: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-20 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-xs text-slate-600 font-semibold">% de variação máxima</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Alterações que superem este limite exigem auditoria da gestão financeira.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              <Check className="w-3.5 h-3.5 text-[#ff8928]" />
              <span>Salvar Regras de Permissão</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
