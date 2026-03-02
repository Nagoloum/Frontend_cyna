// src/components/admin/orders/OrderTable.jsx
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Eye, ChevronLeft, ChevronRight, ShoppingCart,
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

const STATUS_OPTIONS = [
  { value: '',          label: 'All statuses' },
  { value: 'pending',   label: 'Pending'       },
  { value: 'confirmed', label: 'Confirmed'        },
  { value: 'cancelled', label: 'Cancelled'          },
  { value: 'refunded',  label: 'Refunded'       },
];

const COLUMNS = [
  { key: 'id',         label: 'Reference',  sortable: true  },
  { key: 'customer',   label: 'Customer',     sortable: true  },
  { key: 'items',      label: 'Products',   sortable: false },
  { key: 'total',      label: 'Amount',    sortable: true  },
  { key: 'status',     label: 'Status',     sortable: false },
  { key: 'createdAt',  label: 'Date',       sortable: true  },
  { key: 'actions',    label: '',           sortable: false },
];

function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600" />;
  return sortOrder === 'asc'
    ? <ChevronUp   size={13} className="text-indigo-500" />
    : <ChevronDown size={13} className="text-indigo-500" />;
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${55 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function OrderTable({
  orders = [], loading = false,
  pagination, search, filterStatus, sortBy, sortOrder,
  onSearch, onFilterStatus, onSort, onPageChange, onViewDetail,
}) {
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const formatCurrency = (v) =>
    v != null ? `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })} €` : '—';

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const formatRef = (id) =>
    id ? `#${String(id).padStart(6, '0')}` : '—';

  return (
    <div>
      {/* ── Barre filtres ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700/60">
        {/* Recherche */}
        <div className="relative flex items-center flex-1 min-w-0 max-w-sm">
          <Search size={14} className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Reference, email client…"
            className="
              w-full h-9 pl-9 pr-3 rounded-xl text-sm
              bg-gray-50 dark:bg-gray-700/60
              border border-gray-200 dark:border-gray-600
              text-gray-700 dark:text-gray-300
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              focus:border-indigo-400 dark:focus:border-indigo-500
              transition-all duration-200
            "
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatus(e.target.value)}
          className="
            h-9 px-3 rounded-xl text-sm
            bg-gray-50 dark:bg-gray-700/60
            border border-gray-200 dark:border-gray-600
            text-gray-700 dark:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            focus:border-indigo-400 dark:focus:border-indigo-500
            transition-all duration-200
          "
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {!loading && (
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
            {pagination.total} result{pagination.total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700/60">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                    text-gray-500 dark:text-gray-400
                    ${col.sortable ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none' : ''}
                    transition-colors duration-150
                  `}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} sortBy={sortBy} sortOrder={sortOrder} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : orders.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <ShoppingCart size={36} className="opacity-30" />
                      <p className="text-sm font-medium">No orders found</p>
                      {search && <p className="text-xs">Try a different search term</p>}
                    </div>
                  </td>
                </tr>
              )
              : orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-100 group cursor-pointer"
                  onClick={() => onViewDetail(order)}
                >
                  {/* Reference */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                      {formatRef(order.id)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar initials */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {(order.customer?.name ?? order.customerName ?? '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                          {order.customer?.name ?? order.customerName ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[140px]">
                          {order.customer?.email ?? order.customerEmail ?? ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Products */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {(order.items ?? order.products ?? []).slice(0, 2).map((item, i) => (
                        <span key={i} className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[160px]">
                          {item.name ?? item.product?.name ?? `Product ${i + 1}`}
                        </span>
                      ))}
                      {(order.items ?? order.products ?? []).length > 2 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          +{(order.items ?? order.products).length - 2} more
                        </span>
                      )}
                      {!(order.items ?? order.products)?.length && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.total ?? order.amount)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={order.status ?? 'pending'} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewDetail(order)}
                      className="
                        p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                        text-gray-500 dark:text-gray-400
                        hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                        hover:text-indigo-600 dark:hover:text-indigo-400
                        transition-all duration-150
                      "
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {pagination.page} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isNear = Math.abs(page - pagination.page) <= 1 || page === 1 || page === totalPages;
              if (!isNear) {
                if (page === 2 || page === totalPages - 1) return <span key={page} className="text-gray-400 px-1 text-xs">…</span>;
                return null;
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`
                    w-7 h-7 rounded-lg text-xs font-medium transition-all duration-150
                    ${pagination.page === page
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
