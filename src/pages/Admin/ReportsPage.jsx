/* eslint-disable no-unused-vars */
// src/pages/Admin/Reports.jsx
import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI, productsAPI, ordersAPI } from '../../services/api';

import ReportKPIStrip        from '../../components/Admin/Reports/ReportKPIStrip';
import RevenueByPeriodChart  from '../../components/Admin/Reports/RevenueByPeriodChart';
import TopProductsTable      from '../../components/Admin/Reports/TopProductsTable';
import CategoryBreakdown     from '../../components/Admin/Reports/CategoryBreakdown';
import ReportExportPanel     from '../../components/Admin/Reports/ReportExportPanel';
import { AlertBanner }       from '../../components/Admin/Shared';

const PERIOD_OPTIONS = [
  { value: '7d',    label: '7 last days'    },
  { value: '30d',   label: '30 last days'   },
  { value: '5w',    label: '5 last weeks' },
  { value: 'month', label: 'This month'          },
  { value: '3m',    label: 'Last 3 months'     },
  { value: '1y',    label: 'This year'         },
];

export default function ReportsPage() {
  const [period, setPeriod]         = useState('30d');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Données
  const [kpis, setKpis]               = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // ── Fetch tout en parallèle ────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, revenueRes, productsRes, catRes] = await Promise.allSettled([
        dashboardAPI.getKpis(period),
        dashboardAPI.getSales(period),
        productsAPI.getAll({ sortBy: 'sales', order: 'desc', limit: 10 }),
        dashboardAPI.getSalesByCategory(period),
      ]);

      // KPIs globaux
      if (kpiRes.status === 'fulfilled') {
        const d = kpiRes.value.data?.data ?? kpiRes.value.data;
        setKpis(d);
      } else {
        // Données de démo
        setKpis({
          totalRevenue:     48250,
          revenueVariation: +18.4,
          totalOrders:      312,
          ordersVariation:  +11.2,
          avgCart:          154.6,
          avgCartVariation: -1.8,
          newCustomers:     87,
          newCustomersVariation: +24.5,
          conversionRate:   3.2,
          refundRate:       1.4,
        });
      }

      // Courbe revenus
      if (revenueRes.status === 'fulfilled') {
        const d = revenueRes.value.data?.data ?? revenueRes.value.data;
        setRevenueData(Array.isArray(d) ? d : []);
      } else {
        setRevenueData([
          { label: 'Sem 1', revenue: 9800,  orders: 58  },
          { label: 'Sem 2', revenue: 12400, orders: 74  },
          { label: 'Sem 3', revenue: 11200, orders: 68  },
          { label: 'Sem 4', revenue: 14850, orders: 92  },
          { label: 'Sem 5', revenue: 16300, orders: 104 },
        ]);
      }

      // Top products
      if (productsRes.status === 'fulfilled') {
        const d = productsRes.value.data?.data ?? productsRes.value.data;
        setTopProducts(Array.isArray(d?.items ?? d) ? (d?.items ?? d) : []);
      } else {
        setTopProducts([
          { slug: 'edr-enterprise', name: 'EDR Enterprise', category: { name: 'EDR' }, price: 299,  sales: 84,  revenue: 25116, trend: +12 },
          { slug: 'xdr-pro',        name: 'XDR Pro',        category: { name: 'XDR' }, price: 199,  sales: 61,  revenue: 12139, trend: +8  },
          { slug: 'soc-managed',    name: 'SOC Managé',     category: { name: 'SOC' }, price: 499,  sales: 29,  revenue: 14471, trend: +21 },
          { slug: 'edr-starter',    name: 'EDR Starter',    category: { name: 'EDR' }, price: 99,   sales: 112, revenue: 11088, trend: -3  },
          { slug: 'xdr-enterprise', name: 'XDR Enterprise', category: { name: 'XDR' }, price: 349,  sales: 18,  revenue: 6282,  trend: +5  },
        ]);
      }

      // Répartition par category
      if (catRes.status === 'fulfilled') {
        const d = catRes.value.data?.data ?? catRes.value.data;
        setCategoryData(Array.isArray(d) ? d : []);
      } else {
        setCategoryData([
          { label: 'EDR', value: 36204, orders: 196, avg: 184.7 },
          { label: 'XDR', value: 18421, orders: 79,  avg: 233.2 },
          { label: 'SOC', value: 14471, orders: 29,  avg: 498.9 },
          { label: 'Totres', value: 3154, orders: 8,  avg: 394.3 },
        ]);
      }
    } catch (err) {
      setError('Some data could not be loaded. Charts display demo data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Reports & Analyses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Detailed performance by product, category and period
          </p>
        </div>

        {/* Period selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="
            self-start h-9 px-3.5 rounded-xl text-sm font-medium
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-300
            hover:border-indigo-400 dark:hover:border-indigo-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            transition-all duration-200 shadow-sm
          "
        >
          {PERIOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Alerte données demo ── */}
      {error && (
        <AlertBanner
          type="warning"
          title="Partial data"
          message={error}
          dismissible
        />
      )}

      {/* ── KPI Strip ── */}
      <ReportKPIStrip kpis={kpis} loading={loading} />

      {/* ── Courbe revenus pleine largeur ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Revenue Trend
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Revenue and order volume over the selected period
          </p>
        </div>
        <RevenueByPeriodChart data={revenueData} loading={loading} />
      </div>

      {/* ── Top products + Category breakdown (2 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Top products — 3/5 */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Top 10 Products
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Ranked by revenue generated
            </p>
          </div>
          <TopProductsTable products={topProducts} loading={loading} />
        </div>

        {/* Répartition categorys — 2/5 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              By Category
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Revenue, orders and average cart
            </p>
          </div>
          <CategoryBreakdown data={categoryData} loading={loading} />
        </div>
      </div>

      {/* ── Panel export ── */}
      <ReportExportPanel period={period} />

    </div>
  );
}
