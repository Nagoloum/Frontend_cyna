// src/pages/Admin/Support.jsx
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { supportAPI } from '../../services/api';

import SupportTable      from '../../components/Admin/Support/SupportTable';
import ConversationModal from '../../components/Admin/Support/ConversationModal';

export default function SupportPage() {
  // ── Données ──
  const [messages, setMessages]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── Filtres ──
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy]             = useState('createdAt');
  const [sortOrder, setSortOrder]       = useState('desc');

  // ── Modal ──
  const [selectedMessage, setSelectedMessage] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supportAPI.getAll({
        page:   pagination.page,
        limit:  pagination.limit,
        search: search        || undefined,
        status: filterStatus  || undefined,
        sortBy,
        order:  sortOrder,
      });
      const data = res.data?.data ?? res.data;
      setMessages(Array.isArray(data?.items ?? data) ? (data?.items ?? data) : []);
      if (data?.total !== undefined) {
        setPagination((p) => ({ ...p, total: data.total }));
      }
    } catch (err) {
      setError('Unable to load support messages.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterStatus, sortBy, sortOrder]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

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

  // Mise à day locale sans re-fetch
  const handleStatusUpdated = (messageId, newStatus) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status: newStatus } : m))
    );
    if (selectedMessage?.id === messageId) {
      setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleReplySent = (messageId) => {
    handleStatusUpdated(messageId, 'resolved');
  };

  // KPIs rapides depuis les données chargées
  const stats = {
    open:     messages.filter((m) => m.status === 'open').length,
    resolved: messages.filter((m) => m.status === 'resolved').length,
    total:    pagination.total,
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Support & Messages
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Customer requests and conversation management
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="
            self-start flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-600 dark:text-gray-400
            hover:border-indigo-400 dark:hover:border-indigo-500
            hover:text-indigo-600 dark:hover:text-indigo-400
            disabled:opacity-50 transition-all duration-200 shadow-sm
          "
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── KPI mini-cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total messages',   value: stats.total,    color: 'text-gray-900 dark:text-white',          bg: 'bg-white dark:bg-gray-800' },
          { label: 'Pending',       value: stats.open,     color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Resolveds',          value: stats.resolved, color: 'text-green-600 dark:text-green-400',     bg: 'bg-green-50 dark:bg-green-500/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60 shadow-sm`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <SupportTable
          messages={messages}
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
          onOpenConversation={(msg) => setSelectedMessage(msg)}
        />
      </div>

      {/* ── Modal conversation ── */}
      {selectedMessage && (
        <ConversationModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onStatusUpdated={handleStatusUpdated}
          onReplySent={handleReplySent}
        />
      )}
    </div>
  );
}
