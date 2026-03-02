// src/components/admin/shared/ConfirmDialog.jsx
import { AlertTriangle, Info, CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * ConfirmDialog — Dialog de confirmation action
 *
 * Props :
 *   open       {boolean}
 *   onClose    {function}
 *   onConfirm  {function} async
 *   title      {string}
 *   message    {string|ReactNode}
 *   confirmLabel {string}
 *   cancelLabel  {string}
 *   variant    {'danger'|'warning'|'info'|'success'}
 *   loading    {boolean}
 */

const VARIANT_CONFIG = {
  danger: { icon: XCircle, iconBg: 'bg-red-50 dark:bg-red-500/10', iconColor: 'text-red-500', btn: 'bg-red-500 hover:bg-red-600 text-white' },
  warning: { icon: AlertTriangle, iconBg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
  info: { icon: Info, iconBg: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-500', btn: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
  success: { icon: CheckCircle, iconBg: 'bg-green-50 dark:bg-green-500/10', iconColor: 'text-green-500', btn: 'bg-green-500 hover:bg-green-600 text-white' },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  if (!open) return null;

  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.danger;
  const Icon = config.icon;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      <div className="
        relative w-full max-w-md
        bg-white dark:bg-gray-800
        rounded-2xl shadow-2xl
        border border-gray-200 dark:border-gray-700
        p-6
        animate-in fade-in zoom-in-95 duration-200
      ">
        {/* Bouton fermer */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={15} />
          </button>
        )}

        {/* Icône */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${config.iconBg}`}>
          <Icon size={22} className={config.iconColor} />
        </div>

        {/* Texte */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          {message}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="
              flex-1 h-10 rounded-xl text-sm font-medium
              bg-gray-100 dark:bg-gray-700
              text-gray-700 dark:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-600
              disabled:opacity-50 transition-all
            "
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex-1 h-10 rounded-xl text-sm font-medium
              flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all ${config.btn}
            `}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
