// src/components/admin/reports/ReportKPIStrip.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function KPI({ label, value, variation, prefix = '', suffix = '', loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60 shadow-sm animate-pulse">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const isPos     = variation > 0;
  const isNeg     = variation < 0;
  const isNeutral = !variation && variation !== 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-200">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-US') : (value ?? '—')}{suffix}
      </p>
      {variation !== undefined && variation !== null && !isNeutral && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${isPos ? 'text-green-600 dark:text-green-400' : isNeg ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`}>
          {isPos && <TrendingUp  size={11} />}
          {isNeg && <TrendingDown size={11} />}
          {!isPos && !isNeg && <Minus size={11} />}
          <span>{isPos ? '+' : ''}{variation}% vs prev. period</span>
        </div>
      )}
    </div>
  );
}

export default function ReportKPIStrip({ kpis, loading }) {
  const fmt = (v, dec = 2) =>
    v != null ? Number(v).toLocaleString('en-US', { minimumFractionDigits: dec }) : '—';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <KPI
        label="Total Revenue"
        value={kpis?.totalRevenue}
        variation={kpis?.revenueVariation}
        suffix=" €"
        loading={loading}
      />
      <KPI
        label="Orders"
        value={kpis?.totalOrders}
        variation={kpis?.ordersVariation}
        loading={loading}
      />
      <KPI
        label="Average Cart"
        value={kpis?.avgCart != null ? fmt(kpis.avgCart) : undefined}
        variation={kpis?.avgCartVariation}
        suffix=" €"
        loading={loading}
      />
      <KPI
        label="New Customers"
        value={kpis?.newCustomers}
        variation={kpis?.newCustomersVariation}
        loading={loading}
      />
      <KPI
        label="Conversion Rate"
        value={kpis?.conversionRate != null ? fmt(kpis.conversionRate, 1) : undefined}
        suffix="%"
        loading={loading}
      />
      <KPI
        label="Refund Rate"
        value={kpis?.refundRate != null ? fmt(kpis.refundRate, 1) : undefined}
        suffix="%"
        loading={loading}
      />
    </div>
  );
}
