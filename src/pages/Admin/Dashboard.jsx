// src/pages/admin/DashboardPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Package, Tag, Users, TrendingUp,
  BarChart3, RefreshCw, 
  AlertCircle,
} from 'lucide-react';
import KPICard from '../../components/admin/dashboard/KPICard';
import PeriodSelector from '../../components/admin/dashboard/PeriodSelector';
import SalesBarChart from '../../components/admin/dashboard/SalesBarChart';
import SalesPieChart from '../../components/admin/dashboard/SalesPieChart';
import AvgCartStackedChart from '../../components/admin/dashboard/AvgCartStackedChart';
import QuickActions from '../../components/admin/dashboard/QuickActions';
import { dashboardAPI } from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n, opts = {}) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('fr-FR', opts);
}

function fmtEur(n) {
  if (n === null || n === undefined) return '—';
  return `${fmt(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Generate axis labels for the period */
function buildLabels(period) {
  const now = new Date();
  const labels = [];
  if (period === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
    }
  } else if (period === '5w') {
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      labels.push(`W${getWeekNumber(d)}`);
    }
  } else if (period === '30d') {
    for (let i = 29; i >= 0; i -= 3) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  } else {
    for (let i = 0; i < 4; i++) {
      labels.push(`Week ${i + 1}`);
    }
  }
  return labels;
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Raw data from API
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers]           = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardAPI.fetchAll();
      // Defensive: always guarantee arrays even if API shape changes
      setProducts(Array.isArray(data.products)   ? data.products   : []);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setUsers(Array.isArray(data.users)         ? data.users       : []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Computed KPIs ──────────────────────────────────────────────────────────

  const activeProducts   = products.filter((p) => p.isActive !== false);
  const inactiveProducts = products.filter((p) => p.isActive === false);
  const avgPrice         = products.length
    ? products.reduce((sum, p) => sum + (Number(p.price ?? p.priceMonth ?? 0)), 0) / products.length
    : 0;

  // ── Chart Data (derived from products + categories) ────────────────────────

  // Sales bar chart: simulate distribution across labels using product prices
  const labels = buildLabels(period);
  const salesBarData = labels.map((label, i) => {
    // Distribute total "potential revenue" across periods as illustrative data
    const base = activeProducts.reduce((sum, p) => sum + Number(p.price ?? p.priceMonth ?? 0), 0);
    const factor = 0.7 + Math.sin(i * 1.2) * 0.3 + Math.cos(i * 0.7) * 0.15;
    return { label, value: Math.round(base * factor * 100) / 100 };
  });

  // Pie chart: revenue by category
  const salesPieData = categories
    .map((cat) => {
      const catProducts = products.filter(
        (p) => p.category?.slug === cat.slug || p.category === cat.slug || p.categorySlug === cat.slug
      );
      const value = catProducts.reduce((sum, p) => sum + Number(p.price ?? p.priceMonth ?? 0), 0);
      return { label: cat.name, value };
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Stacked chart: avg cart per category per period
  const stackedCategories = salesPieData.map((d) => d.label);
  const stackedDatasets = stackedCategories.map((catLabel) => {
    const cat = categories.find((c) => c.name === catLabel);
    const catProducts = products.filter(
      (p) => p.category?.slug === cat?.slug || p.category === cat?.slug
    );
    const avgCat = catProducts.length
      ? catProducts.reduce((sum, p) => sum + Number(p.price ?? p.priceMonth ?? 0), 0) / catProducts.length
      : 0;
    return labels.map((_, i) => {
      const factor = 0.6 + Math.sin(i * 0.9 + stackedCategories.indexOf(catLabel)) * 0.4;
      return Math.round(avgCat * factor * 100) / 100;
    });
  });

  const avgCartData = stackedCategories.length > 0
    ? { labels, categories: stackedCategories, datasets: stackedDatasets }
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-1 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Overview of your SaaS catalog
            {lastRefresh && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                · Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <br />
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={({ type }) => setPeriod(type)} />
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 disabled:opacity-50 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load data</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="ml-auto text-xs underline underline-offset-2 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Products"
          value={loading ? '…' : fmt(products.length)}
          subtitle={loading ? '' : `${activeProducts.length} active · ${inactiveProducts.length} inactive`}
          icon={Package}
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
          loading={loading}
        />
        <KPICard
          title="Categories"
          value={loading ? '…' : fmt(categories.length)}
          subtitle={loading ? '' : `${categories.length} category${categories.length !== 1 ? 's' : ''} configured`}
          icon={Tag}
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
          loading={loading}
        />
        <KPICard
          title="Avg. Price"
          value={loading ? '…' : fmtEur(avgPrice)}
          subtitle={loading ? '' : 'Per active product'}
          icon={TrendingUp}
          iconBg="bg-green-50 dark:bg-green-500/10"
          iconColor="text-green-600 dark:text-green-400"
          loading={loading}
        />
        <KPICard
          title="Users"
          value={loading ? '…' : fmt(users.length)}
          subtitle={loading ? '' : 'Registered accounts'}
          icon={Users}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          loading={loading}
        />
      </div>

      {/* Charts row 1: Sales + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Estimated revenue based on catalog pricing
              </p>
            </div>
            <BarChart3 size={16} className="text-gray-300 dark:text-gray-600" />
          </div>
          {!loading && products.length === 0 ? (
            <EmptyChart message="Add products to see revenue data" icon={Package} />
          ) : (
            <SalesBarChart data={salesBarData} period={period} loading={loading} />
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sales by Category</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distribution of catalog value</p>
          </div>
          {!loading && salesPieData.length === 0 ? (
            <EmptyChart message="Assign products to categories to see the breakdown" icon={Tag} />
          ) : (
            <SalesPieChart data={salesPieData} loading={loading} />
          )}
        </div>
      </div>

      {/* Charts row 2: Stacked + Recent products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stacked chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Avg. Cart by Category</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Stacked average price per period</p>
            </div>
          </div>
          {!loading && (!avgCartData || avgCartData.categories.length === 0) ? (
            <EmptyChart message="No category data available yet" icon={BarChart3} />
          ) : (
            <AvgCartStackedChart data={avgCartData} loading={loading} />
          )}
        </div>

        {/* Recent products list */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Products</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">{products.length} total</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyChart message="No products yet" icon={Package} />
          ) : (
            <div className="space-y-2">
              {products.slice(0, 6).map((product) => (
                <div key={product.slug} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={13} className="text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {product.price ? `${Number(product.price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €` : '—'}
                    </p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    product.isActive !== false
                      ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {product.isActive !== false ? 'Active' : 'Off'}
                  </span>
                </div>
              ))}
              {products.length > 6 && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-1">
                  +{products.length - 6} more products
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty state helper ────────────────────────────────────────────────────────

function EmptyChart({ message, icon: Icon }) {
  return (
    <div className="w-full h-[220px] flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
      {Icon && <Icon size={32} className="opacity-20" />}
      <p className="text-sm text-center max-w-[200px]">{message}</p>
    </div>
  );
}