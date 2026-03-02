// src/pages/Admin/Orders.jsx
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { ordersAPI } from '../../services/api';

import OrderTable      from '../../components/Admin/Orders/OrderTable';
import OrderDetailModal from '../../components/Admin/Orders/OrderDetailModal';

export default function OrdersPage() {
  // ── Données ──
  const [orders, setOrders]         = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── Filtres ──
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy]         = useState('createdAt');
  const [sortOrder, setSortOrder]   = useState('desc');

  // ── Modal détail ──
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersAPI.getAll({
        page:    pagination.page,
        limit:   pagination.limit,
        search:  search   || undefined,
        status:  filterStatus || undefined,
        sortBy,
        order:   sortOrder,
      });
      const data = res.data?.data ?? res.data;
      setOrders(Array.isArray(data?.items ?? data) ? (data?.items ?? data) : []);
      if (data?.total !== undefined) {
        setPagination((p) => ({ ...p, total: data.total }));
      }
    } catch (err) {
      setError('Unable to load orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterStatus, sortBy, sortOrder]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortOrder('asc'); }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  // Local status update without full re-fetch
  const handleStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    // Also update order in modal if open
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleExport = async () => {
    try {
      const res = await ordersAPI.getAll({
        search:  search  || undefined,
        status:  filterStatus || undefined,
        format:  'csv',
        export:  true,
      });
      // Create download link
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `orders_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total > 0
              ? `${pagination.total} order${pagination.total > 1 ? 's' : ''} in total`
              : 'Order management and tracking'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="
              flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-400
              hover:border-indigo-400 dark:hover:border-indigo-500
              hover:text-indigo-600 dark:hover:text-indigo-400
              transition-all duration-200 shadow-sm
            "
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="
              flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-400
              hover:border-indigo-400 dark:hover:border-indigo-500
              hover:text-indigo-600 dark:hover:text-indigo-400
              disabled:opacity-50 transition-all duration-200 shadow-sm
            "
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <OrderTable
          orders={orders}
          loading={loading}
          pagination={pagination}
          search={search}
          filterStatus={filterStatus}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearch={handleSearch}
          onFilterStatus={handleFilterStatus}
          onSort={handleSort}
          onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
          onViewDetail={(order) => setSelectedOrder(order)}
        />
      </div>

      {/* ── Order detail modal ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={handleStatusUpdated}
          onRefresh={fetchOrders}
        />
      )}
    </div>
  );
}
