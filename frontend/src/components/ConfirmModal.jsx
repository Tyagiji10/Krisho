import { useState, useCallback } from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

/**
 * ConfirmModal — styled replacement for window.confirm()
 *
 * Usage:
 *   const { confirm, ConfirmModalUI } = useConfirm();
 *   ...
 *   const ok = await confirm({ title: 'Delete?', message: 'This cannot be undone.' });
 *   if (ok) { ... }
 *   ...
 *   return <> {ConfirmModalUI} </>
 */
export const useConfirm = () => {
  const [state, setState] = useState(null);

  const confirm = useCallback(({ title, message, confirmText = 'Confirm', danger = false }) => {
    return new Promise((resolve) => {
      setState({ title, message, confirmText, danger, resolve });
    });
  }, []);

  const handleClose = (result) => {
    state?.resolve(result);
    setState(null);
  };

  const ConfirmModalUI = state ? (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${state.danger ? 'bg-red-100 dark:bg-red-500/10' : 'bg-amber-100 dark:bg-amber-500/10'}`}>
          <AlertTriangle size={24} className={state.danger ? 'text-red-500' : 'text-amber-500'} />
        </div>

        {/* Content */}
        <h2 className="text-lg font-black text-center text-slate-900 dark:text-white mb-2">{state.title}</h2>
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{state.message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleClose(false)}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleClose(true)}
            className={`flex-1 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${
              state.danger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                : 'bg-primary hover:bg-primary-dark shadow-primary/20'
            }`}
          >
            {state.confirmText}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmModalUI };
};
