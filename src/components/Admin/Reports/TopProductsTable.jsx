// src/components/admin/reports/TopProductsTable.jsx
import { TrendingUp, TrendingDown, Minus, Package } from 'lucide-react';

function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function TopProductsTable({ products = [], loading = false }) {
  const maxRevenue = Math.max(...products.map((p) => p.revenue ?? 0), 1);

  const formatCurrency = (v) =>
    v != null ? `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })} €` : '—';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700/60">
            {['#', 'Product', 'Sales', 'Revenue', 'Trend'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
          {loading
            ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            : products.length === 0
            ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                  <Package size={28} className="mx-auto mb-2 opacity-30" />
                  No products
                </td>
              </tr>
            )
            : products.map((product, i) => {
              const pct    = ((product.revenue ?? 0) / maxRevenue) * 100;
              const isPos  = product.trend > 0;
              const isNeg  = product.trend < 0;

              return (
                <tr key={product.slug ?? i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-100 group">
                  {/* Rang */}
                  <td className="px-4 py-3 w-10">
                    <span className={`
                      inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold
                      ${i === 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : ''}
                      ${i === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'         : ''}
                      ${i === 2 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-500'                   : ''}
                      ${i  > 2  ? 'text-gray-400 dark:text-gray-500'                                      : ''}
                    `}>
                      {i + 1}
                    </span>
                  </td>

                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <Package size={13} className="text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
                          {product.name}
                        </p>
                        {product.category && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {product.category?.name ?? product.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Sales */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {product.sales ?? '—'}
                    </span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">units</p>
                  </td>

                  {/* Revenue + barre de progression */}
                  <td className="px-4 py-3 min-w-[140px]">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {formatCurrency(product.revenue)}
                    </span>
                    <div className="mt-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>

                  {/* Trend */}
                  <td className="px-4 py-3">
                    <div className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                      ${isPos ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : ''}
                      ${isNeg ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'         : ''}
                      ${!isPos && !isNeg ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
                    `}>
                      {isPos && <TrendingUp   size={11} />}
                      {isNeg && <TrendingDown size={11} />}
                      {!isPos && !isNeg && <Minus size={11} />}
                      {product.trend != null ? `${isPos ? '+' : ''}${product.trend}%` : '—'}
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
