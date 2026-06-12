// src/pages/Admin/PromotionsPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, AlertCircle, Tag, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Loader2,
} from 'lucide-react';
import { couponsAPI, extractList } from '../../services/api';
import { ADMIN_REFRESH_EVENT } from '../../layouts/admin/AdminHeader';
import AdminSelect from '../../components/Admin/Shared/AdminSelect';

const LIMIT = 10;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const toInput = (d) => {
  if (!d) return '';
  try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; }
};

const EMPTY = {
  code: '', type: 'PERCENT', value: 10, active: true,
  startsAt: '', endsAt: '', maxUsage: 0, minAmount: 0,
};

function CouponModal({ coupon, onClose, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!coupon?._id;
  const [form, setForm] = useState(() => coupon ? {
    code: coupon.code ?? '', type: coupon.type ?? 'PERCENT', value: coupon.value ?? 0,
    active: coupon.active !== false, startsAt: toInput(coupon.startsAt), endsAt: toInput(coupon.endsAt),
    maxUsage: coupon.maxUsage ?? 0, minAmount: coupon.minAmount ?? 0,
  } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.code.trim()) { setError(t('admin.promotions.error_code_required')); return; }
    setSaving(true);
    setError('');
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      active: !!form.active,
      maxUsage: Number(form.maxUsage) || 0,
      minAmount: Number(form.minAmount) || 0,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : '',
    };
    try {
      const res = isEdit ? await couponsAPI.update(coupon._id, payload) : await couponsAPI.create(payload);
      if (res?.data?.success === false) { setError(res.data.message || t('admin.common.error')); setSaving(false); return; }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? t('admin.common.error'));
      setSaving(false);
    }
  };

  const inp = 'w-full h-9 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all';
  const lbl = 'block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {isEdit ? t('admin.promotions.edit_modal_title') : t('admin.promotions.new_modal_title')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Code */}
            <div className="col-span-2">
              <label className={lbl}>{t('admin.promotions.label_code')}</label>
              <input
                className={`${inp} uppercase`}
                value={form.code}
                onChange={set('code')}
                placeholder="WELCOME10"
              />
            </div>

            {/* Type */}
            <div>
              <label className={lbl}>{t('admin.promotions.label_type')}</label>
              <AdminSelect value={form.type} onChange={set('type')}>
                <option value="">—</option>
                <option value="PERCENT">{t('admin.promotions.type_percent')}</option>
                <option value="FIXED">{t('admin.promotions.type_fixed')}</option>
              </AdminSelect>
            </div>

            {/* Value */}
            <div>
              <label className={lbl}>
                {form.type === 'PERCENT' ? t('admin.promotions.label_value_pct') : t('admin.promotions.label_value_eur')}
              </label>
              <input type="number" min="0" className={inp} value={form.value} onChange={set('value')} />
            </div>

            {/* Dates */}
            <div>
              <label className={lbl}>{t('admin.promotions.label_starts')}</label>
              <input type="date" className={inp} value={form.startsAt} onChange={set('startsAt')} />
            </div>
            <div>
              <label className={lbl}>{t('admin.promotions.label_ends')}</label>
              <input type="date" className={inp} value={form.endsAt} onChange={set('endsAt')} />
            </div>

            {/* Max usage / min amount */}
            <div>
              <label className={lbl}>{t('admin.promotions.label_max_usage')}</label>
              <input type="number" min="0" className={inp} value={form.maxUsage} onChange={set('maxUsage')} />
            </div>
            <div>
              <label className={lbl}>{t('admin.promotions.label_min_amount')}</label>
              <input type="number" min="0" className={inp} value={form.minAmount} onChange={set('minAmount')} />
            </div>

            {/* Active toggle — styled like other admin toggles */}
            <label className="col-span-2 flex items-center gap-2.5 cursor-pointer mt-1">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={set('active')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4 transition-colors duration-200" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('admin.promotions.label_active')}</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-9 px-4 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
            >
              {t('admin.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2 transition-all"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? t('admin.common.saving') : t('admin.common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null); // null | 'new' | coupon object
  const [confirmId, setConfirmId] = useState(null);
  const searchTimeout = useRef(null);

  const fetchCoupons = useCallback(async (opts = {}) => {
    setLoading(true); setError(null);
    try {
      const nextPage = opts.page ?? page;
      const nextSearch = opts.search ?? search;
      const params = { page: nextPage, limit: LIMIT, ...(nextSearch ? { search: nextSearch } : {}) };
      const res = await couponsAPI.getAll(params);
      // Handle all NestJS ApiResponse shapes: { data: { items|data: [...], total } } or { data: [...] }
      const payload = res.data?.data ?? res.data ?? {};
      const list = payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
      setCoupons(Array.isArray(list) ? list : []);
      setTotal(payload?.total ?? list.length);
      setPage(nextPage);
    } catch (err) {
      setError(err.response?.data?.message ?? t('admin.common.error'));
    } finally { setLoading(false); }
  }, [page, search, t]);

  useEffect(() => { fetchCoupons(); /* initial */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const onRefresh = () => fetchCoupons();
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
  }, [fetchCoupons]);

  const handleSearch = (value) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchCoupons({ search: value, page: 1 }), 400);
  };

  const handleDelete = async (id) => {
    try { await couponsAPI.remove(id); fetchCoupons(); } catch { /* ignore */ } finally { setConfirmId(null); }
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;
  const usageLabel = (c) => `${c.usedCount ?? 0}${c.maxUsage > 0 ? ` / ${c.maxUsage}` : ''}`;
  const valueLabel = (c) => (c.type === 'PERCENT' ? `${c.value}%` : `${Number(c.value).toFixed(2)} €`);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.promotions.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total > 0 ? t('admin.promotions.subtitle_count', { count: total }) : t('admin.promotions.subtitle_empty')}
          </p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
        >
          <Plus size={15} /> {t('admin.promotions.add')}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
          <button onClick={() => fetchCoupons()} className="ml-auto text-xs underline">{t('admin.common.retry')}</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700/60">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('admin.promotions.search_placeholder')}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/60">
                {[
                  t('admin.promotions.col_code'),
                  t('admin.promotions.col_value'),
                  t('admin.promotions.col_usage'),
                  t('admin.promotions.col_validity'),
                  t('admin.promotions.col_status'),
                  '',
                ].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + j * 8}%` }} />
                    </td>
                  ))}</tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <Tag size={36} className="opacity-20" />
                      <p className="text-sm font-medium">{t('admin.promotions.empty')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white text-xs">{c.code}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{valueLabel(c)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{usageLabel(c)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{fmtDate(c.startsAt)} → {fmtDate(c.endsAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.active !== false
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.active !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {c.active !== false ? t('admin.common.active') : t('admin.common.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {confirmId === c._id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <button onClick={() => handleDelete(c._id)} className="text-xs font-semibold text-red-600 hover:underline">
                            {t('admin.promotions.confirm_delete')}
                          </button>
                          <button onClick={() => setConfirmId(null)} className="text-xs text-gray-400 hover:underline">
                            {t('admin.promotions.cancel_delete')}
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setModal(c)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmId(c._id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('admin.common.page_of', { page, total: totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchCoupons({ page: page - 1 })}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchCoupons({ page: page + 1 })}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <CouponModal
          coupon={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => fetchCoupons()}
        />
      )}
    </div>
  );
}
