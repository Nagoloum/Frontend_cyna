/* eslint-disable no-unused-vars */
// src/pages/Admin/Settings.jsx
import { useState, useEffect } from 'react';
import {
  Palette, CheckCircle, AlertCircle, Loader2, Sun, Moon, Monitor,
} from 'lucide-react';

const THEME_KEY = 'theme';

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-center gap-3
      px-4 py-3 rounded-2xl shadow-xl text-sm font-medium
      animate-in slide-in-from-bottom-4 duration-300
      ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
    `}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-indigo-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ loading, label = 'Save', onClick }) {
  return (
    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={onClick}
        disabled={loading}
        className="
          flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold
          bg-indigo-500 hover:bg-indigo-600 text-white
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 shadow-sm shadow-indigo-500/20
        "
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {loading ? 'Saving…' : label}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════
export default function Settings() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return 'system';
  });
  const [savingAppearance, setSavingAppearance] = useState(false);

  const saveAppearance = () => {
    setSavingAppearance(true);
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    showToast('Appearance saved');
    setTimeout(() => setSavingAppearance(false), 250);
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Configure your interface preferences
        </p>
      </div>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance" subtitle="Choose your theme — saved locally on this device">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light',  label: 'Light',  icon: Sun     },
                { value: 'dark',   label: 'Dark',   icon: Moon    },
                { value: 'system', label: 'System', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                    ${theme === value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <SaveBtn loading={savingAppearance} onClick={saveAppearance} />
      </Section>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
