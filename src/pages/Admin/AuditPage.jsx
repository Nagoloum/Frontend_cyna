// src/pages/Admin/AuditPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, AlertCircle, ScrollText,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { auditAPI } from '../../services/api';
import { ADMIN_REFRESH_EVENT } from '../../layouts/admin/AdminHeader';

const LIMIT = 20;

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const actionColor = (action = '') => {
  if (action.includes('deleted') || action.includes('suspended'))
    return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400';
  if (action.includes('login') || action.includes('reactivated') || action.includes('2fa_enabled'))
    return 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400';
  return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400';
};

export default function AuditPage() {
  const { t } = useTranslation();
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const searchTimeout = useRef(null);

  const fetchLogs = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const nextPage = opts.page ?? page;
      const nextSearch = opts.search ?? search;
      const params = { page: nextPage, limit: LIMIT, ...(nextSearch ? { search: nextSearch } : {}) };
      const res = await auditAPI.getAll(params);
      // Handle all NestJS ApiResponse shapes: { data: { items|data: [...], total } } or { data: [...] }
      const payload = res.data?.data ?? res.data ?? {};
      const list = payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
      setLogs(Array.isArray(list) ? list : []);
      setTotal(payload?.total ?? list.length);
      setPage(nextPage);
    } catch (err) {
      setError(err.response?.data?.message ?? t('admin.common.error'));
    } finally {
      setLoading(false);
    }
  }, [page, search, t]);

  useEffect(() => { fetchLogs(); /* initial */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onRefresh = () => fetchLogs();
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
  }, [fetchLogs]);

  const handleSearch = (value) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchLogs({ search: value, page: 1 }), 400);
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.audit.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {total > 0 ? t('admin.audit.subtitle_count', { count: total }) : t('admin.audit.subtitle_empty')}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => fetchLogs()} className="ml-auto text-xs underline">{t('admin.common.retry')}</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700/60">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('admin.audit.search_placeholder')}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/60">
                {[
                  t('admin.audit.col_when'),
                  t('admin.audit.col_action'),
                  t('admin.audit.col_actor'),
                  t('admin.audit.col_target'),
                  t('admin.audit.col_details'),
                ].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + j * 8}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <ScrollText size={36} className="opacity-20" />
                      <p className="text-sm font-medium">{t('admin.audit.no_events')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors align-top">
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-mono ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 truncate max-w-[180px]">{log.actorEmail ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {log.targetType ? `${log.targetType}:${(log.targetId ?? '').slice(-6)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {log.metadata && Object.keys(log.metadata).length > 0
                        ? JSON.stringify(log.metadata)
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('admin.common.page_of', { page, total: totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchLogs({ page: page - 1 })}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchLogs({ page: page + 1 })}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
