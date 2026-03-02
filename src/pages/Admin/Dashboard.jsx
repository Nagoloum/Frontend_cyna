// src/pages/Admin/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Award,
  Activity,
  RefreshCw,
  Download,
} from 'lucide-react';

import KPICard          from '../../components/Admin/Dashboard/KPICard';
import PeriodSelector   from '../../components/Admin/Dashboard/PeriodSelector';
import SalesBarChart    from '../../components/Admin/Dashboard/SalesBarChart';
import AvgCartStackedChart from '../../components/Admin/Dashboard/AvgCartStackedChart';
import SalesPieChart    from '../../components/Admin/Dashboard/SalesPieChart';
import QuickActions     from '../../components/Admin/Dashboard/QuickActions';
import api              from '../../services/api';

// ── Données de démo (utilisées si l'API échoue ou en dev) ─────────────────────
const DEMO_KPIs = {
  totalSales:    { value: '24 850 €', variation: +12.4, subtitle: 'vs previous period' },
  avgCart:       { value: '148 €',    variation: -2.1,  subtitle: 'avg cart / order' },
  topCategory:   { value: 'EDR',      variation: null,  subtitle: '42% of sales' },
  activeOrders:  { value: '37',       variation: +8,    subtitle: 'orders in progress' },
};

const DEMO_SALES_7D = [
  { label: 'Lun', value: 3200 },
  { label: 'Mar', value: 2800 },
  { label: 'Mer', value: 4100 },
  { label: 'Jeu', value: 3750 },
  { label: 'Ven', value: 5200 },
  { label: 'Sam', value: 2100 },
  { label: 'Dim', value: 1850 },
];

const DEMO_STACKED = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  categories: ['EDR', 'XDR', 'SOC'],
  datasets: [
    [120, 95,  145, 130, 180, 70,  60 ],
    [80,  70,  90,  85,  110, 50,  45 ],
    [60,  55,  75,  65,  90,  40,  35 ],
  ],
};

const DEMO_PIE = [
  { label: 'EDR',    value: 10440 },
  { label: 'XDR',    value: 7250  },
  { label: 'SOC',    value: 5100  },
  { label: 'Totres', value: 2060  },
];

// ── Helpers formatage ─────────────────────────────────────────────────────────
const formatCurrency = (val) =>
  val !== undefined && val !== null
    ? `${Number(val).toLocaleString('en-US')} €`
    : '—';

// ── Composant ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod]       = useState('7d');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Données
  const [kpis, setKpis]           = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [stackedData, setStackedData] = useState(null);
  const [pieData, setPieData]     = useState([]);

  // ── Fetch principal ──────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async (selectedPeriod, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // All calls in parallel for maximum performance
      const [kpiRes, salesRes, stackedRes, pieRes] = await Promise.allSettled([
        api.get(`/admin/dashboard/kpis?period=${selectedPeriod}`),
        api.get(`/admin/dashboard/sales?period=${selectedPeriod}`),
        api.get(`/admin/dashboard/avg-cart?period=${selectedPeriod}`),
        api.get(`/admin/dashboard/sales-by-category?period=${selectedPeriod}`),
      ]);

      // KPIs
      if (kpiRes.status === 'fulfilled') {
        const d = kpiRes.value.data?.data ?? kpiRes.value.data;
        setKpis({
          totalSales:   { value: formatCurrency(d?.totalSales),   variation: d?.totalSalesVariation   ?? null, subtitle: 'vs previous period' },
          avgCart:      { value: formatCurrency(d?.avgCart),      variation: d?.avgCartVariation      ?? null, subtitle: 'avg cart / order' },
          topCategory:  { value: d?.topCategory ?? '—',           variation: null,                             subtitle: `${d?.topCategoryPct ?? '—'}% of sales` },
          activeOrders: { value: String(d?.activeOrders ?? '—'),  variation: d?.activeOrdersVariation ?? null, subtitle: 'orders in progress' },
        });
      } else {
        setKpis(DEMO_KPIs); // fallback démo
      }

      // Histogramme ventes
      if (salesRes.status === 'fulfilled') {
        const raw = salesRes.value.data?.data ?? salesRes.value.data ?? [];
        setSalesData(Array.isArray(raw) ? raw : []);
      } else {
        setSalesData(DEMO_SALES_7D);
      }

      // Histogramme empilé
      if (stackedRes.status === 'fulfilled') {
        setStackedData(stackedRes.value.data?.data ?? stackedRes.value.data);
      } else {
        setStackedData(DEMO_STACKED);
      }

      // Camembert
      if (pieRes.status === 'fulfilled') {
        const raw = pieRes.value.data?.data ?? pieRes.value.data ?? [];
        setPieData(Array.isArray(raw) ? raw : []);
      } else {
        setPieData(DEMO_PIE);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to load data. Showing demo data.');
      // Full fallback to demo data
      setKpis(DEMO_KPIs);
      setSalesData(DEMO_SALES_7D);
      setStackedData(DEMO_STACKED);
      setPieData(DEMO_PIE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(period);
  }, [period, fetchDashboardData]);

  const handlePeriodChange = (p) => setPeriod(p.type === 'custom' ? `custom:${p.from}:${p.to}` : p.type);
  const handleRefresh = () => fetchDashboardData(period, true);

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── En-tête de page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Sales Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            SaaS Performance Tracking
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                · Updated at {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>

        {/* Header controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodSelector value={period} onChange={handlePeriodChange} />

          <button
            onClick={handleRefresh}
            disabled={refreshing}
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
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              // TODO: déclencher l'export CSV/PDF via API
              api.get(`/admin/dashboard/export?period=${period}&format=csv`)
                .then(() => console.log('Export lancé'))
                .catch(() => console.warn('Export non disponible'));
            }}
            className="
              flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
              bg-indigo-500 hover:bg-indigo-600
              text-white
              transition-all duration-200 shadow-sm
            "
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="
          flex items-center gap-3 px-4 py-3 rounded-xl
          bg-amber-50 dark:bg-amber-500/10
          border border-amber-200 dark:border-amber-500/20
          text-amber-700 dark:text-amber-400 text-sm
        ">
          <span className="flex-shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Sales"
          value={kpis?.totalSales.value ?? '—'}
          variation={kpis?.totalSales.variation}
          subtitle={kpis?.totalSales.subtitle}
          icon={TrendingUp}
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
          loading={loading}
        />
        <KPICard
          title="Average Cart"
          value={kpis?.avgCart.value ?? '—'}
          variation={kpis?.avgCart.variation}
          subtitle={kpis?.avgCart.subtitle}
          icon={ShoppingBag}
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
          loading={loading}
        />
        <KPICard
          title="Top Category"
          value={kpis?.topCategory.value ?? '—'}
          variation={kpis?.topCategory.variation}
          subtitle={kpis?.topCategory.subtitle}
          icon={Award}
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
          loading={loading}
        />
        <KPICard
          title="Orders Actives"
          value={kpis?.activeOrders.value ?? '—'}
          variation={kpis?.activeOrders.variation}
          subtitle={kpis?.activeOrders.subtitle}
          icon={Activity}
          iconBg="bg-green-50 dark:bg-green-500/10"
          iconColor="text-green-600 dark:text-green-400"
          loading={loading}
        />
      </div>

      {/* ── Graphiques principaux ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Histogramme ventes — 2/3 largeur */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Sales by {period === '5w' ? 'week' : 'day'}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Revenue generated over the selected period
              </p>
            </div>
          </div>
          <SalesBarChart data={salesData} period={period} loading={loading} />
        </div>

        {/* Camembert — 1/3 largeur */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Sales Distribution
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              By service category
            </p>
          </div>
          <SalesPieChart data={pieData} loading={loading} />
        </div>
      </div>

      {/* ── Histogramme empilé — pleine largeur ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Average carts by category
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Average cart breakdown — EDR, XDR, SOC
            </p>
          </div>
        </div>
        <AvgCartStackedChart data={stackedData} loading={loading} />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

    </div>
  );
}
