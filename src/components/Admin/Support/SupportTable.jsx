// src/components/admin/support/SupportTable.jsx
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  MessageSquare, Eye, ChevronLeft, ChevronRight,
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

const STATUS_OPTIONS = [
  { value: '',         label: 'All statuses' },
  { value: 'open',     label: 'Open'           },
  { value: 'resolved', label: 'Resolved'           },
  { value: 'closed',   label: 'Closed'            },
];

const COLUMNS = [
  { key: 'subject',   label: 'Subject',        sortable: true  },
  { key: 'email',     label: 'Email',         sortable: true  },
  { key: 'source',    label: 'Source',        sortable: false },
  { key: 'status',    label: 'Status',        sortable: false },
  { key: 'createdAt', label: 'Received',       sortable: true  },
  { key: 'actions',   label: '',              sortable: false },
];

const SOURCE_CONFIG = {
  chatbot:  { label: 'Chatbot',    classes: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  form:     { label: 'Form', classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'         },
  email:    { label: 'Email',      classes: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  escalation:{ label: 'Escalation', classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'     },
};

function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600" />;
  return sortOrder === 'asc'
    ? <ChevronUp   size={13} className="text-indigo-500" />
    : <ChevronDown size={13} className="text-indigo-500" />;
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${55 + i * 9}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function SupportTable({
  messages = [], loading = false,
  pagination, search, filterStatus, sortBy, sortOrder,
  onSearch, onFilterStatus, onSort, onPageChange, onOpenConversation,
}) {
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : '—';

  return (
    <div>
      {/* ── Barre filtres ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700/60">
        {/* Recherche */}
        <div className="relative flex items-center flex-1 min-w-0 max-w-sm">
          <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Subject, email…"
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
            {pagination.total} message{pagination.total > 1 ? 's' : ''}
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
              : messages.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <MessageSquare size={36} className="opacity-30" />
                      <p className="text-sm font-medium">No messages found</p>
                      {search && <p className="text-xs">Try a different search term</p>}
                    </div>
                  </td>
                </tr>
              )
              : messages.map((msg) => {
                const source = SOURCE_CONFIG[msg.source] ?? SOURCE_CONFIG.form;
                const isUnread = msg.status === 'open' && !msg.repliedAt;

                return (
                  <tr
                    key={msg.id}
                    onClick={() => onOpenConversation(msg)}
                    className={`
                      hover:bg-gray-50 dark:hover:bg-gray-700/30
                      transition-colors duration-100 group cursor-pointer
                      ${isUnread ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}
                    `}
                  >
                    {/* Subject */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Point non-lu */}
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        )}
                        <p className={`truncate max-w-[220px] ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                          {msg.subject ?? msg.title ?? '(No subject)'}
                        </p>
                      </div>
                      {/* Aperçu du message */}
                      {msg.message && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[220px] mt-0.5">
                          {msg.message}
                        </p>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[160px] block">
                        {msg.email ?? msg.customerEmail ?? '—'}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${source.classes}`}>
                        {source.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={msg.status ?? 'open'} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenConversation(msg)}
                        className="
                          p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                          text-gray-500 dark:text-gray-400
                          hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                          hover:text-indigo-600 dark:hover:text-indigo-400
                          transition-all duration-150
                        "
                        title="View conversation"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
