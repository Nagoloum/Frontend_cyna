// src/components/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/uiSlice';

/**
 * variant:
 *  - "fixed"  → floats bottom-right (used on auth pages)
 *  - "inline" → renders in place (used in the navbar / admin header)
 */
export default function ThemeToggle({ variant = 'fixed' }) {
  const dispatch = useAppDispatch();
  const isDark   = useAppSelector((s) => s.ui.theme === 'dark');

  const handleToggle = () => dispatch(toggleTheme());

  const baseBtn = 'rounded-xl bg-transparent hover:bg-[var(--bg-muted)] transition-all duration-500 group';
  const positionCls =
    variant === 'fixed'
      ? `fixed bottom-4 right-4 z-50 p-2.5 hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/30 ${baseBtn}`
      : `relative inline-flex items-center justify-center p-2.5 ${baseBtn}`;
  const iconBox  = variant === 'fixed' ? 'w-8 h-8' : 'w-6 h-6';
  const iconSize = variant === 'fixed' ? 'w-7 h-7 inset-0.5' : 'w-5 h-5 inset-0.5';

  return (
    <button
      onClick={handleToggle}
      className={positionCls}
      aria-label="Toggle dark mode"
      type="button"
    >
      <div className={`relative ${iconBox}`}>
        <Sun
          className={`absolute ${iconSize} text-[var(--text-secondary)] transition-all duration-700 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
          }`}
        />
        <Moon
          className={`absolute ${iconSize} text-[var(--text-secondary)] transition-all duration-700 ${
            isDark ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
      <div className="absolute inset-0 rounded-full scale-0 transition-transform duration-300" />
    </button>
  );
}
