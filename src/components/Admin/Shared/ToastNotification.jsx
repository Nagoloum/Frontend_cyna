// src/components/admin/shared/ToastNotification.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES = {
  success: 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-500/30  text-green-700 dark:text-green-400',
  error:   'bg-white dark:bg-gray-800 border-red-200 dark:border-red-500/30    text-red-700 dark:text-red-400',
  warning: 'bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400',
  info:    'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400',
};

const ICON_STYLES = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-indigo-500',
};

const PROGRESS_STYLES = {
  success: 'bg-green-400',
  error:   'bg-red-400',
  warning: 'bg-amber-400',
  info:    'bg-indigo-400',
};

// ── Toast individuel ──────────────────────────────────────────────────────────
function Toast({ toast, onRemove }) {
  const { id, type = 'info', title, message, duration = 4000 } = toast;
  const Icon = ICONS[type] ?? Info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <div className={`
      relative flex items-start gap-3 w-80 p-4 rounded-2xl shadow-lg
      border overflow-hidden
      animate-in slide-in-from-right-4 fade-in duration-300
      ${STYLES[type] ?? STYLES.info}
    `}>
      {/* Icône */}
      <div className={`flex-shrink-0 mt-0.5 ${ICON_STYLES[type]}`}>
        <Icon size={16} />
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {title}
          </p>
        )}
        {message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-0.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={14} />
      </button>

      {/* Barre de progression */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${PROGRESS_STYLES[type]}`}
        style={{
          animation: `shrink ${duration}ms linear forwards`,
          width: '100%',
        }}
      />

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helpers pratiques
  const toast = {
    success: (title, message, opts) => addToast({ type: 'success', title, message, ...opts }),
    error:   (title, message, opts) => addToast({ type: 'error',   title, message, ...opts }),
    warning: (title, message, opts) => addToast({ type: 'warning', title, message, ...opts }),
    info:    (title, message, opts) => addToast({ type: 'info',    title, message, ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Conteneur des toasts — coin bas droit */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useToast — Hook pour déclencher des notifications depuis n'importe quel composant
 *
 * Usage :
 *   const toast = useToast();
 *   toast.success('Product created', 'The product was added to the catalog.');
 *   toast.error('Error', 'Unable to delete this product.');
 *   toast.warning('Warning', 'Low stock for this product.');
 *   toast.info('Info', 'Les données ont été actualisées.');
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un <ToastProvider>');
  return ctx;
}
