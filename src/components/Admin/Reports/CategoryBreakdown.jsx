// src/components/admin/reports/CategoryBreakdown.jsx

const COLORS = [
  { bar: 'bg-indigo-500',  text: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-500/10'  },
  { bar: 'bg-violet-500',  text: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-50 dark:bg-violet-500/10'  },
  { bar: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-400',      bg: 'bg-blue-50 dark:bg-blue-500/10'      },
  { bar: 'bg-cyan-500',    text: 'text-cyan-600 dark:text-cyan-400',      bg: 'bg-cyan-50 dark:bg-cyan-500/10'      },
];

function SkeletonItem() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function CategoryBreakdown({ data = [], loading = false }) {
  const totalRevenue = data.reduce((sum, d) => sum + (d.value ?? 0), 0) || 1;

  const formatCurrency = (v) =>
    v != null ? `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })} €` : '—';

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => <SkeletonItem key={i} />)}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500 text-sm">
        Tocune donnée
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.map((item, i) => {
        const color = COLORS[i % COLORS.length];
        const pct   = ((item.value ?? 0) / totalRevenue * 100).toFixed(1);

        return (
          <div key={item.label} className="space-y-2">
            {/* Label + valeur */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color.bg} ${color.text}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(item.value)}
              </span>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${color.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Stats secondaires */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{item.orders ?? '—'} orders · avg. {formatCurrency(item.avg)}</span>
              <span className="font-semibold">{pct}%</span>
            </div>
          </div>
        );
      })}

      {/* Total */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</span>
        <span className="text-base font-bold text-gray-900 dark:text-white">
          {formatCurrency(totalRevenue)}
        </span>
      </div>
    </div>
  );
}
