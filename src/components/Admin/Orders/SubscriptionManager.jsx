// src/components/admin/orders/SubscriptionManager.jsx
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, XCircle, CheckCircle, Loader2, Calendar, Package } from 'lucide-react';
import { ordersAPI } from '../../../services/api';
import StatusBadge from '../shared/StatusBadge';

// ── Ligne subscription ──────────────────────────────────────────────────────────
function SubscriptionRow({ sub, onRenew, onCancel, loading }) {
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const isExpiringSoon = sub.renewalDate
    ? (new Date(sub.renewalDate) - Date.now()) / (1000 * 60 * 60 * 24) <= 7
    : false;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        {/* Product icon */}
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <Package size={15} className="text-indigo-500" />
        </div>

        {/* Infos */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {sub.productName ?? sub.product?.name ?? 'Abonnement'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {sub.customerEmail ?? sub.customer?.email ?? '—'}
            </span>
            {isExpiringSoon && (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                Expiring soon
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Date renouvellement */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={12} />
          <span>{formatDate(sub.renewalDate ?? sub.nextBillingDate)}</span>
        </div>

        <StatusBadge status={sub.status ?? 'active'} />

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {sub.status !== 'cancelled' && (
            <>
              <button
                onClick={() => onRenew(sub)}
                disabled={!!loading}
                title="Renew"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-40 transition-all"
              >
                {loading === `renew_${sub.id}`
                  ? <Loader2 size={13} className="animate-spin" />
                  : <CheckCircle size={13} />}
              </button>
              <button
                onClick={() => onCancel(sub)}
                disabled={!!loading}
                title="Cancel"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 transition-all"
              >
                {loading === `cancel_${sub.id}`
                  ? <Loader2 size={13} className="animate-spin" />
                  : <XCircle size={13} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]                 = useState(null);
  const [filter, setFilter]               = useState('all');

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ⚠️ Endpoint à confirmer avec le backend
      // On réutilise ordersAPI.getAll avec un filtre type subscription
      const res = await ordersAPI.getAll({ type: 'subscription', status: filter !== 'all' ? filter : undefined });
      const data = res.data?.data ?? res.data;
      setSubscriptions(Array.isArray(data?.items ?? data) ? (data?.items ?? data) : []);
    } catch (err) {
      setError('Unable to load subscriptions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const handleRenew = async (sub) => {
    setActionLoading(`renew_${sub.id}`);
    try {
      // ⚠️ Endpoint à confirmer avec le backend
      await ordersAPI.updateStatus(sub.id, 'confirmed');
      setSubscriptions((prev) =>
        prev.map((s) => s.id === sub.id ? { ...s, status: 'active' } : s)
      );
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error while renewing.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (sub) => {
    if (!window.confirm(`Cancel l'subscription de ${sub.customerEmail ?? 'ce client'} ?`)) return;
    setActionLoading(`cancel_${sub.id}`);
    try {
      await ordersAPI.updateStatus(sub.id, 'cancelled');
      setSubscriptions((prev) =>
        prev.map((s) => s.id === sub.id ? { ...s, status: 'cancelled' } : s)
      );
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error while cancelling.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all'
    ? subscriptions
    : subscriptions.filter((s) => s.status === filter);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Active Subscriptions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} subscription{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtre */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 px-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          >
            <option value="all">All</option>
            <option value="active">Actives</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchSubscriptions}
            disabled={loading}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* List */}
      <div className="p-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
              <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-400 dark:text-gray-500">
            <Package size={28} className="opacity-30" />
            <p className="text-sm">Tocun subscription</p>
          </div>
        ) : (
          filtered.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onRenew={handleRenew}
              onCancel={handleCancel}
              loading={actionLoading}
            />
          ))
        )}
      </div>
    </div>
  );
}
