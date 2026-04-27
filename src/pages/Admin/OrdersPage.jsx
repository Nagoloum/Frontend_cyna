/* eslint-disable no-unused-vars */
// src/pages/admin/OrdersPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, AlertCircle, ShoppingCart,
  ChevronLeft, ChevronRight, Eye, CheckCircle,
  XCircle, Clock, X, Package,
  User, Calendar, Hash, CreditCard,
} from 'lucide-react';
import { commandesAPI } from '../../services/api';

// Backend statuses: PENDING, PAID, CANCEL
const STATUS_CONFIG = {
  PENDING: { label: 'Pending',   color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400', icon: Clock       },
  PAID:    { label: 'Paid',      color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400', icon: CheckCircle },
  CANCEL:  { label: 'Cancelled', color: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',         icon: XCircle     },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatEur(n) {
  if (n === null || n === undefined) return '—';
  return `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;
}

const customerName = (user) => {
  if (!user) return '—';
  const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return full || user.email || '—';
};

// ── Order Detail Modal (read-only) ────────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
  const items = Array.isArray(order.abonnements) ? order.abonnements : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Order Details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">#{order.reference ?? '—'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: User,       label: 'Customer',  value: customerName(order.user) },
              { icon: Calendar,   label: 'Date',      value: formatDate(order.createdAt) },
              { icon: CreditCard, label: 'Total',     value: formatEur(order.totalPrice) },
              { icon: Hash,       label: 'Reference', value: order.reference ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <Icon size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <StatusBadge status={order.statut} />
          </div>

          {items.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subscriptions</p>
              <div className="space-y-2">
                {items.map((ab, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Package size={13} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {ab.product?.name ?? `Item ${i + 1}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {ab.quantity ?? 1} · {ab.periode === 'ANNEE' ? 'Yearly' : 'Monthly'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatEur(ab.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [pagination, setPagination]       = useState({ page: 1, limit: 10, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const searchTimeout = useRef(null);

  const fetchOrders = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page:  opts.page  ?? pagination.page,
        limit: pagination.limit,
        ...(opts.search ?? search ? { search: opts.search ?? search } : {}),
      };
      const res = await commandesAPI.getAll(params);
      const payload = res.data?.data ?? res.data ?? {};
      const list = payload?.data ?? payload?.items ?? (Array.isArray(payload) ? payload : []);
      const total = payload?.total ?? list.length;
      setOrders(Array.isArray(list) ? list : []);
      setPagination((prev) => ({ ...prev, page: params.page, total }));
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = (value) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchOrders({ search: value, page: 1 }), 400);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total > 0 ? `${pagination.total} orders total` : 'View customer orders'}
          </p>
        </div>
        <button
          onClick={() => fetchOrders()}
          disabled={loading}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 disabled:opacity-50 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => fetchOrders()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700/60">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
            />
          </div>
          {!loading && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
              {pagination.total} result{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/60">
                {['Reference', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <ShoppingCart size={36} className="opacity-20" />
                      <p className="text-sm font-medium">No orders found</p>
                      {search && <p className="text-xs">Try a different search term</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id ?? order.reference} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        #{order.reference ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-xs">
                          {customerName(order.user)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                          {order.user?.email ?? ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {order.nbreProducts ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {formatEur(order.totalPrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400">Page {pagination.page} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchOrders({ page: pagination.page - 1 })} disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => fetchOrders({ page: pagination.page + 1 })} disabled={pagination.page >= totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
