// src/components/admin/reports/ReportExportPanel.jsx
import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { dashboardAPI, productsAPI, ordersAPI } from '../../../services/api';

const EXPORT_OPTIONS = [
  {
    id:          'sales_csv',
    label:       'Sales — CSV',
    description: 'Raw sales, orders and revenue data',
    icon:        FileSpreadsheet,
    iconBg:      'bg-green-50 dark:bg-green-500/10',
    iconColor:   'text-green-600 dark:text-green-400',
    format:      'csv',
    type:        'sales',
  },
  {
    id:          'sales_pdf',
    label:       'Sales — PDF',
    description: 'Formatted PDF report with charts',
    icon:        FileText,
    iconBg:      'bg-red-50 dark:bg-red-500/10',
    iconColor:   'text-red-600 dark:text-red-400',
    format:      'pdf',
    type:        'sales',
  },
  {
    id:          'products_csv',
    label:       'Products — CSV',
    description: 'Full catalog with prices, stock and sales',
    icon:        FileSpreadsheet,
    iconBg:      'bg-green-50 dark:bg-green-500/10',
    iconColor:   'text-green-600 dark:text-green-400',
    format:      'csv',
    type:        'products',
  },
  {
    id:          'orders_csv',
    label:       'Orders — CSV',
    description: 'Complete order history',
    icon:        FileSpreadsheet,
    iconBg:      'bg-green-50 dark:bg-green-500/10',
    iconColor:   'text-green-600 dark:text-green-400',
    format:      'csv',
    type:        'orders',
  },
];

export default function ReportExportPanel({ period }) {
  const [loadingId, setLoadingId] = useState(null);
  const [doneIds, setDoneIds]     = useState([]);
  const [error, setError]         = useState(null);

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (option) => {
    setLoadingId(option.id);
    setError(null);
    try {
      let res;
      const date = new Date().toISOString().slice(0, 10);

      if (option.type === 'sales') {
        res = await dashboardAPI.export(period, option.format);
        const blob = res.data instanceof Blob ? res.data : new Blob([JSON.stringify(res.data)], { type: 'application/octet-stream' });
        triggerDownload(blob, `rapport_ventes_${period}_${date}.${option.format}`);
      } else if (option.type === 'products') {
        res = await productsAPI.getAll({ limit: 1000 });
        const content = option.format === 'csv'
          ? convertToCSV(res.data?.data?.items ?? res.data?.data ?? res.data ?? [])
          : JSON.stringify(res.data, null, 2);
        const blob = new Blob([content], { type: option.format === 'csv' ? 'text/csv' : 'application/json' });
        triggerDownload(blob, `products_${date}.${option.format}`);
      } else if (option.type === 'orders') {
        res = await ordersAPI.getAll({ limit: 1000 });
        const content = convertToCSV(res.data?.data?.items ?? res.data?.data ?? res.data ?? []);
        const blob = new Blob([content], { type: 'text/csv' });
        triggerDownload(blob, `orders_${date}.csv`);
      }

      setDoneIds((prev) => [...prev, option.id]);
      setTimeout(() => setDoneIds((prev) => prev.filter((id) => id !== option.id)), 3000);
    } catch (err) {
      setError(`Export error "${option.label}". Vérifiez que l'API est disponible.`);
    } finally {
      setLoadingId(null);
    }
  };

  // Convertisseur JSON → CSV simple
  const convertToCSV = (data) => {
    if (!Array.isArray(data) || !data.length) return '';
    const headers = Object.keys(data[0]).filter((k) => typeof data[0][k] !== 'object');
    const rows    = data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val == null) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <Download size={17} className="text-indigo-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Export Data</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Download your reports in CSV or PDF format
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Grille options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPORT_OPTIONS.map((option) => {
          const Icon    = option.icon;
          const isLoading = loadingId === option.id;
          const isDone    = doneIds.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleExport(option)}
              disabled={!!loadingId}
              className={`
                group flex items-center gap-3 p-4 rounded-2xl text-left
                border transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                ${isDone
                  ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5'
                }
              `}
            >
              {/* Icône */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-100 dark:bg-green-500/20' : option.iconBg}`}>
                {isLoading
                  ? <Loader2 size={17} className="text-indigo-500 animate-spin" />
                  : isDone
                  ? <CheckCircle size={17} className="text-green-600 dark:text-green-400" />
                  : <Icon size={17} className={option.iconColor} />
                }
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${isDone ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {isDone ? 'Downloaded ✓' : option.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                  {option.description}
                </p>
              </div>

              {/* Flèche download */}
              {!isLoading && !isDone && (
                <Download size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Period note */}
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
        Sales exports cover the selected period · Products and orders: complete data
      </p>
    </div>
  );
}
