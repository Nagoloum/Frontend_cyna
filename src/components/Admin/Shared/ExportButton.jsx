// src/components/admin/shared/ExportButton.jsx
import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown, Loader2 } from 'lucide-react';

/**
 * ExportButton — Bouton export CSV / PDF
 *
 * Props :
 *   onExport  {function(format: 'csv'|'pdf') => Promise<Blob>}
 *   label     {string}
 *   disabled  {boolean}
 *   formats   {Array<'csv'|'pdf'>}  – formats disponibles (défaut: les deux)
 *   filename  {string} – nom du fichier sans extension
 */

const FORMAT_CONFIG = {
  csv: {
    label:    'Export CSV',
    icon:     FileSpreadsheet,
    mime:     'text/csv',
    ext:      'csv',
  },
  pdf: {
    label:    'Export PDF',
    icon:     FileText,
    mime:     'application/pdf',
    ext:      'pdf',
  },
};

export default function ExportButton({
  onExport,
  label    = 'Export',
  disabled = false,
  formats  = ['csv', 'pdf'],
  filename = `export_${new Date().toISOString().slice(0, 10)}`,
}) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(null); // format en cours
  const [error, setError]     = useState(null);
  const ref                   = useRef(null);

  // Close le dropdown au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (format) => {
    setOpen(false);
    setError(null);
    setLoading(format);
    try {
      const result = await onExport(format);

      // Si onExport retourne un Blob directement
      let blob = result instanceof Blob ? result : null;

      // Si c'est une réponse axios avec responseType: 'blob'
      if (!blob && result?.data instanceof Blob) blob = result.data;

      // Si c'est du JSON/texte brut → on le convertit
      if (!blob && result) {
        const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        blob = new Blob([content], { type: FORMAT_CONFIG[format].mime });
      }

      if (!blob) throw new Error('Tocune donnée à exporter.');

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${filename}.${FORMAT_CONFIG[format].ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message ?? 'Error lors de l\'export.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(null);
    }
  };

  // Si un seul format disponible → bouton simple
  if (formats.length === 1) {
    const fmt    = formats[0];
    const config = FORMAT_CONFIG[fmt];
    const Icon   = config.icon;

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => handleExport(fmt)}
          disabled={disabled || !!loading}
          className="
            flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-600 dark:text-gray-400
            hover:border-indigo-400 dark:hover:border-indigo-500
            hover:text-indigo-600 dark:hover:text-indigo-400
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 shadow-sm
          "
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
          <span className="hidden sm:inline">{label}</span>
        </button>
        {error && (
          <div className="absolute right-0 top-full mt-1 w-52 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Plusieurs formats → dropdown
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled || !!loading}
        className="
          flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-400
          hover:border-indigo-400 dark:hover:border-indigo-500
          hover:text-indigo-600 dark:hover:text-indigo-400
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 shadow-sm
        "
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <Download size={14} />
        }
        <span className="hidden sm:inline">{loading ? 'Exporting…' : label}</span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute right-0 top-full mt-2 w-44
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30
          py-1.5 z-50
          animate-in fade-in slide-in-from-top-2 duration-150
        ">
          {formats.map((fmt) => {
            const config = FORMAT_CONFIG[fmt];
            const Icon   = config.icon;
            return (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={!!loading}
                className="
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  text-gray-700 dark:text-gray-300
                  hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                  hover:text-indigo-600 dark:hover:text-indigo-400
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors duration-150
                "
              >
                <Icon size={15} className="text-gray-400 flex-shrink-0" />
                {loading === fmt
                  ? <span className="flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" />Exporting…</span>
                  : config.label
                }
              </button>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute right-0 top-full mt-1 w-52 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}
