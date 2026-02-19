// src/components/admin/shared/Spinner.jsx

/**
 * Spinner — Loading indicator
 *
 * Props :
 *   size    {'sm'|'md'|'lg'|'xl'}
 *   color   {'indigo'|'white'|'gray'}
 *   label   {string} – texte accessible (sr-only)
 *   center  {boolean} – centre dans le conteneur parent
 */

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-9 h-9 border-[3px]',
  xl: 'w-14 h-14 border-4',
};

const COLORS = {
  indigo: 'border-indigo-200 dark:border-indigo-500/30 border-t-indigo-500',
  white:  'border-white/30 border-t-white',
  gray:   'border-gray-200 dark:border-gray-600 border-t-gray-500 dark:border-t-gray-300',
};

export default function Spinner({
  size   = 'md',
  color  = 'indigo',
  label  = 'Loading…',
  center = false,
}) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={`
        rounded-full animate-spin flex-shrink-0
        ${SIZES[size]  ?? SIZES.md}
        ${COLORS[color] ?? COLORS.indigo}
      `}
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// ── Variante pleine page ──────────────────────────────────────────────────────
export function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
      <Spinner size="lg" color="indigo" />
      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{message}</p>
    </div>
  );
}

// ── Variante overlay ──────────────────────────────────────────────────────────
export function OverlayLoader({ message = 'Loading…' }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl gap-3">
      <Spinner size="lg" color="indigo" />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{message}</p>
      )}
    </div>
  );
}
