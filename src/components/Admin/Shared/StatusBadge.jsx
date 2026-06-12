// src/components/admin/shared/StatusBadge.jsx
import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
  // Products
  active:   { labelKey: 'admin.common.active',     classes: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' },
  inactive: { labelKey: 'admin.common.inactive',   classes: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600' },
  // Orders
  pending:   { labelKey: 'admin.common.status_pending', classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  confirmed: { labelKey: 'admin.common.status_confirmed', classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  cancelled: { labelKey: 'admin.common.status_cancelled', classes: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  refunded:  { labelKey: 'admin.common.status_refunded', classes: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
  // Support
  open:     { labelKey: 'admin.common.status_open',     classes: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' },
  resolved: { labelKey: 'admin.common.status_resolved', classes: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' },
  closed:   { labelKey: 'admin.common.status_closed',   classes: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600' },
};

/**
 * StatusBadge
 * Props :
 *   status  {string}  – status key (e.g. 'active', 'pending', 'open'…)
 *   label   {string}  – override du label (optionnel)
 *   dot     {boolean} – afficher un point coloré (défaut: true)
 */
export default function StatusBadge({ status, label, dot = true }) {
  const { t } = useTranslation();
  const known = STATUS_CONFIG[status];
  const config = known ?? {
    labelKey: null,
    classes: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600',
  };
  const resolvedLabel = config.labelKey ? t(config.labelKey) : (label ?? status);

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border
      ${config.classes}
    `}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      )}
      {label ?? resolvedLabel}
    </span>
  );
}
