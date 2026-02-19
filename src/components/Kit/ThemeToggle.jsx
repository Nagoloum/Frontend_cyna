// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Au chargement : on vérifie le localStorage ou la préférence système
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-full hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/30 border border-gray-200 dark:border-gray-700 transition-all duration-500 group"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-8 h-8">
        {/* Soleil (light mode) */}
        <Sun
          className={`absolute inset-0.5 w-7 h-7 text-indigo-500 transition-all duration-700 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />

        {/* Lune (dark mode) */}
        <Moon
          className={`absolute inset-0.5 w-7 h-7 text-indigo-400 transition-all duration-700 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>

      {/* Effet de glow subtil */}
      <div className="absolute inset-0 rounded-full bg-indigo-500/20 dark:bg-indigo-400/30 scale-0 group-hover:scale-105 transition-transform duration-300" />
    </button>
  );
}