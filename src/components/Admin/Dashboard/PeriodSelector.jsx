// src/components/admin/dashboard/PeriodSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

const PRESETS = [
  { label: '7 derniers days', value: '7d' },
  { label: '5 dernières weeks', value: '5w' },
  { label: '30 derniers days', value: '30d' },
  { label: 'This month', value: 'month' },
];

/**
 * PeriodSelector
 *
 * Props :
 *   value     {string}   – Valeur active ('7d' | '5w' | '30d' | 'month' | 'custom')
 *   onChange  {function} – Callback ({ type, from?, to? }) => void
 */
export default function PeriodSelector({ value = '7d', onChange }) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const ref = useRef(null);

  const activeLabel =
    PRESETS.find((p) => p.value === value)?.label ??
    (value === 'custom' && customFrom && customTo
      ? `${customFrom} → ${customTo}`
      : 'Custom range');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreset = (preset) => {
    setShowCustom(false);
    setOpen(false);
    onChange?.({ type: preset.value });
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    setOpen(false);
    setShowCustom(false);
    onChange?.({ type: 'custom', from: customFrom, to: customTo });
  };

  return (
    <div className="relative" ref={ref}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2 h-9 px-3.5
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl text-sm font-medium
          text-gray-700 dark:text-gray-300
          hover:border-indigo-400 dark:hover:border-indigo-500
          hover:text-indigo-600 dark:hover:text-indigo-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          transition-all duration-200 shadow-sm
        "
      >
        <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
        <span className="max-w-[160px] truncate">{activeLabel}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="
          absolute right-0 top-full mt-2 z-50
          w-64
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30
          overflow-hidden
        ">
          {/* Presets */}
          <div className="p-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 py-1.5">
              Preset period
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePreset(preset)}
                className="
                  w-full flex items-center justify-between
                  px-3 py-2 rounded-xl text-sm
                  text-gray-700 dark:text-gray-300
                  hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                  hover:text-indigo-600 dark:hover:text-indigo-400
                  transition-colors duration-150
                "
              >
                <span>{preset.label}</span>
                {value === preset.value && (
                  <Check size={14} className="text-indigo-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Custom date range */}
          <div className="p-2">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="
                w-full flex items-center justify-between
                px-3 py-2 rounded-xl text-sm
                text-gray-700 dark:text-gray-300
                hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                hover:text-indigo-600 dark:hover:text-indigo-400
                transition-colors duration-150
              "
            >
              <span>Custom range…</span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${showCustom ? 'rotate-180' : ''}`}
              />
            </button>

            {showCustom && (
              <div className="mt-2 px-2 space-y-2">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="
                      w-full h-9 px-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-gray-700
                      border border-gray-200 dark:border-gray-600
                      text-gray-700 dark:text-gray-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                      focus:border-indigo-400 dark:focus:border-indigo-500
                      transition-all duration-200
                    "
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">To</label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="
                      w-full h-9 px-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-gray-700
                      border border-gray-200 dark:border-gray-600
                      text-gray-700 dark:text-gray-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                      focus:border-indigo-400 dark:focus:border-indigo-500
                      transition-all duration-200
                    "
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  disabled={!customFrom || !customTo}
                  className="
                    w-full h-9 rounded-xl text-sm font-medium
                    bg-indigo-500 hover:bg-indigo-600
                    text-white disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors duration-200
                  "
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
