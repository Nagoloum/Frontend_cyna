// src/components/admin/dashboard/TopProductsChart.jsx
import { Package } from 'lucide-react';

/**
 * Horizontal "ranking" chart for top products by paid revenue.
 *
 * We deliberately render this with plain HTML/CSS rather than Chart.js so
 * each row keeps the product name readable and the bar can carry a gradient
 * matching the rest of the dashboard accent palette.
 *
 * Props:
 *   data    Array<{ label: string, value: number }>
 *   loading boolean
 */
export default function TopProductsChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" style={{ width: `${90 - i * 12}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full h-[260px] flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
        <Package size={26} className="opacity-25" />
        <p className="text-sm text-center max-w-[200px]">
          No paid orders yet — top sellers will show here once revenue is recorded.
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 0) || 1;

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="
                  inline-flex items-center justify-center w-5 h-5 rounded-md
                  bg-indigo-50 dark:bg-indigo-500/10
                  text-[10px] font-bold text-indigo-600 dark:text-indigo-400
                  flex-shrink-0
                ">
                  {i + 1}
                </span>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {item.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums flex-shrink-0">
                {item.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-90"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, rgba(99,102,241,0.95) 0%, rgba(139,92,246,0.95) 100%)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
