// src/components/admin/shared/AlertBanner.jsx
import { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X, ChevronRight } from 'lucide-react';

/**
 * AlertBanner — Bannière d'alerte système
 *
 * Props :
 *   type       {'warning'|'error'|'info'|'success'}
 *   title      {string}
 *   message    {string}
 *   dismissible {boolean}
 *   action     {{ label: string, onClick: function }} – bouton d'action optionnel
 */

const CONFIG = {
  warning: {
    icon:    AlertTriangle,
    wrapper: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    iconCls: 'text-amber-500',
    text:    'text-amber-800 dark:text-amber-300',
    sub:     'text-amber-600 dark:text-amber-400',
    btn:     'text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 border-amber-300 dark:border-amber-500/30 hover:border-amber-400',
  },
  error: {
    icon:    XCircle,
    wrapper: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
    iconCls: 'text-red-500',
    text:    'text-red-800 dark:text-red-300',
    sub:     'text-red-600 dark:text-red-400',
    btn:     'text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 border-red-300 dark:border-red-500/30 hover:border-red-400',
  },
  info: {
    icon:    Info,
    wrapper: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
    iconCls: 'text-indigo-500',
    text:    'text-indigo-800 dark:text-indigo-300',
    sub:     'text-indigo-600 dark:text-indigo-400',
    btn:     'text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-400',
  },
  success: {
    icon:    CheckCircle,
    wrapper: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
    iconCls: 'text-green-500',
    text:    'text-green-800 dark:text-green-300',
    sub:     'text-green-600 dark:text-green-400',
    btn:     'text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 border-green-300 dark:border-green-500/30 hover:border-green-400',
  },
};

export default function AlertBanner({
  type        = 'warning',
  title,
  message,
  dismissible = true,
  action,
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const c    = CONFIG[type] ?? CONFIG.info;
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${c.wrapper}`}>
      {/* Icône */}
      <Icon size={16} className={`flex-shrink-0 mt-0.5 ${c.iconCls}`} />

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold leading-tight ${c.text}`}>{title}</p>
        )}
        {message && (
          <p className={`text-xs mt-0.5 leading-relaxed ${c.sub}`}>{message}</p>
        )}

        {/* Bouton d'action */}
        {action && (
          <button
            onClick={action.onClick}
            className={`
              mt-2 inline-flex items-center gap-1 text-xs font-medium
              border rounded-lg px-2.5 py-1
              transition-colors duration-150 ${c.btn}
            `}
          >
            {action.label}
            <ChevronRight size={11} />
          </button>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className={`flex-shrink-0 p-0.5 rounded-lg transition-colors duration-150 opacity-60 hover:opacity-100 ${c.text}`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
