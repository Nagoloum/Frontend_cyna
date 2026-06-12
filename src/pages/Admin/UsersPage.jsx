// src/pages/Admin/UsersPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, AlertCircle, Users as UsersIcon,
  ChevronLeft, ChevronRight, ShieldCheck, ShieldOff,
  CheckCircle, Ban, Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usersAPI } from '../../services/api';
import { ADMIN_REFRESH_EVENT } from '../../layouts/admin/AdminHeader';

const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};
const currentUserId = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const p = token ? decodeJwt(token) : null;
  return p?.id ?? p?._id ?? null;
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

const fullName = (u) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—';

function RoleBadge({ role }) {
  const { t } = useTranslation();
  const isAdmin = role === 'ADMIN';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isAdmin
        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
        : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300'
    }`}>
      {isAdmin ? t('admin.users.role_admin') : t('admin.users.role_customer')}
    </span>
  );
}

function StatusBadge({ active }) {
  const { t } = useTranslation();
  return active
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"><CheckCircle size={11} /> {t('admin.common.active')}</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"><Ban size={11} /> {t('admin.users.status_suspended')}</span>;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [actingId, setActingId]     = useState(null);
  const searchTimeout = useRef(null);
  const meId = currentUserId();

  const fetchUsers = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page:  opts.page  ?? pagination.page,
        limit: pagination.limit,
        ...((opts.search ?? search) ? { search: opts.search ?? search } : {}),
      };
      const res = await usersAPI.getAll(params);
      const payload = res.data?.data ?? res.data ?? {};
      const list = payload?.data ?? (Array.isArray(payload) ? payload : []);
      const total = payload?.total ?? list.length;
      setUsers(Array.isArray(list) ? list : []);
      setPagination((prev) => ({ ...prev, page: params.page, total }));
    } catch (err) {
      setError(err.response?.data?.message ?? t('admin.users.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const onRefresh = () => fetchUsers();
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
  }, [fetchUsers]);

  const handleSearch = (value) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchUsers({ search: value, page: 1 }), 400);
  };

  const toggleActive = async (user) => {
    const next = !user.isActive;
    if (!next && !window.confirm(t('admin.users.suspend_confirm', { email: user.email }))) {
      return;
    }
    setActingId(user._id);
    setError(null);
    try {
      await usersAPI.setActive(user._id, next);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message ?? t('admin.users.status_update_failed'));
    } finally {
      setActingId(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.users.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {pagination.total > 0 ? t('admin.users.total_count', { count: pagination.total }) : t('admin.users.subtitle')}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => fetchUsers()} className="ml-auto text-xs underline">{t('admin.common.retry')}</button>
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
              placeholder={t('admin.users.search_placeholder')}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
            />
          </div>
          {!loading && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
              {t('admin.users.result_count', { count: pagination.total })}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/60">
                {[
                  { id: 'name', label: t('admin.users.col_name') },
                  { id: 'email', label: t('admin.users.col_email') },
                  { id: 'role', label: t('admin.users.col_role') },
                  { id: 'status', label: t('admin.users.col_status') },
                  { id: 'joined', label: t('admin.users.col_joined') },
                  { id: 'actions', label: '' },
                ].map((col) => (
                  <th key={col.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + j * 8}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <UsersIcon size={36} className="opacity-20" />
                      <p className="text-sm font-medium">{t('admin.users.empty')}</p>
                      {search && <p className="text-xs">{t('admin.users.empty_search_hint')}</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = meId && String(meId) === String(user._id);
                  const active = user.isActive !== false;
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-xs">{fullName(user)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{user.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-3"><StatusBadge active={active} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-gray-400">{t('admin.users.you')}</span>
                        ) : (
                          <button
                            onClick={() => toggleActive(user)}
                            disabled={actingId === user._id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                              active
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10'
                            }`}
                          >
                            {actingId === user._id
                              ? <Loader2 size={13} className="animate-spin" />
                              : active ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                            {active ? t('admin.users.action_suspend') : t('admin.users.action_reactivate')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('admin.common.page_of', { page: pagination.page, total: totalPages })}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchUsers({ page: pagination.page - 1 })} disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => fetchUsers({ page: pagination.page + 1 })} disabled={pagination.page >= totalPages}
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
