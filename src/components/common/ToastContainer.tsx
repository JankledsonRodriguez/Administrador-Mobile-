import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 ${
              isSuccess
                ? 'bg-white text-slate-800 border-emerald-300 shadow-emerald-500/10'
                : isWarning
                ? 'bg-white text-slate-800 border-amber-300 shadow-amber-500/10'
                : isError
                ? 'bg-white text-slate-800 border-red-300 shadow-red-500/10'
                : 'bg-white text-slate-800 border-blue-300 shadow-blue-500/10'
            }`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-500" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 mr-2">
              <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
