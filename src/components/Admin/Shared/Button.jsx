// src/components/admin/shared/Button.jsx
import { Loader2 } from 'lucide-react';

/**
 * Button — Bouton réutilisable
 *
 * Props :
 *   variant   {'primary'|'secondary'|'danger'|'ghost'|'success'}
 *   size      {'sm'|'md'|'lg'}
 *   loading   {boolean}
 *   icon      {ReactNode} – icône lucide (optionnel)
 *   iconPos   {'left'|'right'}
 *   fullWidth {boolean}
 *   disabled  {boolean}
 *   onClick   {function}
 *   type      {'button'|'submit'|'reset'}
 *   children  {ReactNode}
 */

const VARIANTS = {
  primary:   'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
  ghost:     'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
  success:   'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md',
};

const SIZES = {
  sm: 'h-7  px-3   text-xs  gap-1.5 rounded-lg',
  md: 'h-9  px-4   text-sm  gap-2   rounded-xl',
  lg: 'h-11 px-5   text-sm  gap-2   rounded-xl',
};

export default function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  icon: Icon,
  iconPos   = 'left',
  fullWidth = false,
  disabled  = false,
  onClick,
  type      = 'button',
  children,
  className = '',
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size]       ?? SIZES.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/* Icône gauche ou spinner */}
      {loading
        ? <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin flex-shrink-0" />
        : Icon && iconPos === 'left' && <Icon size={size === 'sm' ? 12 : 14} className="flex-shrink-0" />
      }

      {children && <span>{children}</span>}

      {/* Icône droite */}
      {!loading && Icon && iconPos === 'right' && (
        <Icon size={size === 'sm' ? 12 : 14} className="flex-shrink-0" />
      )}
    </button>
  );
}
