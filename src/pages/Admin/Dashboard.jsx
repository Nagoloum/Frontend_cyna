// src/pages/admin/DashboardPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package, Tag, Users, TrendingUp, Layers,
  BarChart3, AlertCircle, ShoppingBag,
} from 'lucide-react';
import KPICard from '../../components/admin/dashboard/KPICard';
import PeriodSelector from '../../components/admin/dashboard/PeriodSelector';
import RevenueLineChart from '../../components/admin/dashboard/RevenueLineChart';
import SalesPieChart from '../../components/admin/dashboard/SalesPieChart';
import TopProductsChart from '../../components/admin/dashboard/TopProductsChart';
import QuickActions from '../../components/admin/dashboard/QuickActions';
import { dashboardAPI, buildImageUrl } from '../../services/api';
import { ADMIN_REFRESH_EVENT } from '../../layouts/admin/AdminHeader';
import {
  buildRevenueSeries,
  revenueByCategory,
  topProductsByRevenue,
  totalPaidRevenue,
} from '../../components/admin/dashboard/analytics';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n, opts = {}) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('en-US', opts);
}
function fmtEur(n) {
  if (n === null || n === undefined) return '—';
  return `${fmt(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function EmptyChart({ message, icon: Icon }) {
  return (
    <div className="w-full h-[200px] flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
      {Icon && <Icon size={28} className="opacity-20" />}
      <p className="text-sm text-center max-w-[180px]">{message}</p>
    </div>
  );
}

/** Product thumbnail with buildImageUrl + error fallback */
function ProductThumb({ src, name }) {
  const [err, setErr] = useState(false);
  const url = buildImageUrl(src);
  return (
    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-gray-100 dark:border-gray-700/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {url && !err
        ? <img src={url} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : <Package size={13} className="text-indigo-400" />}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [period, setPeriod]         = useState('7d');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [users,      setUsers]      = useState([]);
  const [services,   setServices]   = useState([]);
  const [commandes,  setCommandes]  = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await dashboardAPI.fetchAll();
      setProducts(  Array.isArray(data.products)   ? data.products   : []);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setUsers(     Array.isArray(data.users)      ? data.users      : []);
      setServices(  Array.isArray(data.services)   ? data.services   : []);
      setCommandes( Array.isArray(data.commandes)  ? data.commandes  : []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to load dashboard data.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Listen for the global refresh event triggered from AdminHeader.
  useEffect(() => {
    const onRefresh = () => fetchData();
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
  }, [fetchData]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  // `is_selected` désigne les "Top products" (mis en avant sur la home page).
  const topProducts      = products.filter(p => p.is_selected);
  const avgPrice = products.length
    ? products.reduce((s, p) => s + Number(p.priceMonth ?? p.price ?? 0), 0) / products.length
    : 0;
  const availableServices = services.filter(s => s.available !== false);

  // ── Chart data — computed from real PAID commandes ────────────────────────
  const revenueSeries  = useMemo(() => buildRevenueSeries(commandes, period),     [commandes, period]);
  const periodRevenue  = useMemo(() => totalPaidRevenue(commandes, period),       [commandes, period]);
  const salesPieData   = useMemo(() => revenueByCategory(commandes, products).slice(0, 5), [commandes, products]);
  const topProductData = useMemo(() => topProductsByRevenue(commandes, products, 6),       [commandes, products]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-2 sm:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0 sm:justify-between">
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

        {/* Controls */}
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={({ type }) => setPeriod(type)} />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load data</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
          </div>
          <button onClick={fetchData} className="ml-auto text-xs underline underline-offset-2 flex-shrink-0">Retry</button>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <QuickActions />

      {/* ── KPI Cards: 2 cols mobile, 4 cols desktop ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Products"
          value={loading ? '…' : fmt(products.length)}
          subtitle={loading ? '' : `${topProducts.length} top product${topProducts.length !== 1 ? 's' : ''}`}
          icon={Package}
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
          loading={loading}
        />
        <KPICard
          title="Services"
          value={loading ? '…' : fmt(services.length)}
          subtitle={loading ? '' : `${availableServices.length} available`}
          icon={Layers}
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
          loading={loading}
        />
        <KPICard
          title="Categories"
          value={loading ? '…' : fmt(categories.length)}
          subtitle={loading ? '' : `${categories.length} configured`}
          icon={Tag}
          iconBg="bg-fuchsia-50 dark:bg-fuchsia-500/10"
          iconColor="text-fuchsia-600 dark:text-fuchsia-400"
          loading={loading}
        />
        <KPICard
          title="Avg. Monthly Price"
          value={loading ? '…' : fmtEur(avgPrice)}
          subtitle={loading ? '' : 'Across all products'}
          icon={TrendingUp}
          iconBg="bg-green-50 dark:bg-green-500/10"
          iconColor="text-green-600 dark:text-green-400"
          loading={loading}
        />
      </div>

      {/* ── Users + Catalog summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KPICard
          title="Registered Users"
          value={loading ? '…' : fmt(users.length)}
          subtitle="Total user accounts"
          icon={Users}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          loading={loading}
        />
        <div className="sm:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Catalog Summary</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Top products',  value: topProducts.length,            color: 'text-indigo-600 dark:text-indigo-400',   bg: 'bg-indigo-50 dark:bg-indigo-500/10'   },
              { label: 'Services',      value: availableServices.length,       color: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-500/10'   },
              { label: 'Categories',    value: categories.length,              color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
              { label: 'Paid orders',   value: commandes.filter(c => String(c?.statut ?? '').toUpperCase() === 'PAID').length, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bg}`}>
                <span className={`text-lg font-bold tabular-nums ${color}`}>{loading ? '…' : value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Sum of paid orders · {fmtEur(periodRevenue)} this period
              </p>
            </div>
            <TrendingUp size={15} className="text-gray-300 dark:text-gray-600" />
          </div>
          <RevenueLineChart data={revenueSeries} period={period} loading={loading} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sales by Category</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Paid orders attributed to product categories</p>
          </div>
          {!loading && salesPieData.length === 0
            ? <EmptyChart message="No paid orders attributed to a category yet" icon={Tag} />
            : <SalesPieChart data={salesPieData} loading={loading} />}
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Products by Revenue</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Best-selling products from paid orders</p>
            </div>
            <BarChart3 size={15} className="text-gray-300 dark:text-gray-600" />
          </div>
          <TopProductsChart data={topProductData} loading={loading} />
        </div>

        {/* ── Recent Products ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5 flex flex-col">
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
            <div className="space-y-1.5">
              {[...products]
                .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
                .slice(0, 6)
                .map(p => (
                  <div key={p.slug ?? p._id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <ProductThumb src={p.images?.[0]} name={p.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        {p.priceMonth ? `${Number(p.priceMonth).toFixed(2)} €/mo` : '—'}
                        {p.priceYear  ? ` · ${Number(p.priceYear).toFixed(2)} €/yr` : ''}
                      </p>
                    </div>
                    {p.is_selected ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        Top
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">—</span>
                    )}
                  </div>
                ))}
              {products.length > 6 && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-1.5">
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
