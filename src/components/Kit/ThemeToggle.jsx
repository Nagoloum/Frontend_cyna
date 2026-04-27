// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * variant:
 *  - "fixed"  → floats bottom-right (used on auth pages where there's no navbar)
 *  - "inline" → renders in place (used in the navbar / admin header)
 */
export default function ThemeToggle({ variant = 'fixed' }) {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  // Au chargement : on vérifie le localStorage ou la préférence système
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const baseBtn = 'rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-500 group';
  const positionCls =
    variant === 'fixed'
      ? `fixed bottom-4 right-4 z-50 p-2.5 hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/30 ${baseBtn}`
      : `relative inline-flex items-center justify-center p-1.5 ${baseBtn}`;
  const iconBox = variant === 'fixed' ? 'w-8 h-8' : 'w-6 h-6';
  const iconSize = variant === 'fixed' ? 'w-7 h-7 inset-0.5' : 'w-5 h-5 inset-0.5';

  return (
    <button
      onClick={toggleTheme}
      className={positionCls}
      aria-label="Toggle dark mode"
      type="button"
    >
      <div className={`relative ${iconBox}`}>
        <Sun
          className={`absolute ${iconSize} text-indigo-500 transition-all duration-700 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          className={`absolute ${iconSize} text-indigo-400 transition-all duration-700 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
      <div className="absolute inset-0 rounded-full bg-indigo-500/20 dark:bg-indigo-400/30 scale-0 group-hover:scale-105 transition-transform duration-300" />
    </button>
  );
}