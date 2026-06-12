// src/pages/Admin/PromotionsPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, AlertCircle, Tag, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Loader2,
} from 'lucide-react';
import { couponsAPI } from '../../services/api';
import { ADMIN_REFRESH_EVENT } from '../../layouts/admin/AdminHeader';

const LIMIT = 10;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const toInput = (d) => {
  if (!d) return '';
  try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; }
};

const EMPTY = {
  code: '', type: 'PERCENT', value: 10, active: true,
  startsAt: '', endsAt: '', maxUsage: 0, minAmount: 0,
};

function CouponModal({ coupon, onClose, onSaved }) {
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
    if (!form.code.trim()) { setError('Code is required.'); return; }
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
      if (res?.data?.success === false) { setError(res.data.message || 'Failed to save coupon.'); setSaving(false); return; }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to save coupon.');
      setSaving(false);
    }
  };

  const field = "w-full h-9 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
  const label = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit coupon' : 'New coupon'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={label}>Code</label>
              <input className={`${field} uppercase`} value={form.code} onChange={set('code')} placeholder="WELCOME10" /></div>
            <div><label className={label}>Type</label>
              <select className={field} value={form.type} onChange={set('type')}>
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed (€)</option>
              </select></div>
            <div><label className={label}>{form.type === 'PERCENT' ? 'Value (%)' : 'Value (€)'}</label>
              <input type="number" min="0" className={field} value={form.value} onChange={set('value')} /></div>
            <div><label className={label}>Starts at</label>
              <input type="date" className={field} value={form.startsAt} onChange={set('startsAt')} /></div>
            <div><label className={label}>Ends at</label>
              <input type="date" className={field} value={form.endsAt} onChange={set('endsAt')} /></div>
            <div><label className={label}>Max usage (0 = ∞)</label>
              <input type="number" min="0" className={field} value={form.maxUsage} onChange={set('maxUsage')} /></div>
            <div><label className={label}>Min amount HT (€)</label>
              <input type="number" min="0" className={field} value={form.minAmount} onChange={set('minAmount')} /></div>
            <label className="col-span-2 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 mt-1">
              <input type="checkbox" checked={form.active} onChange={set('active')} /> Active
            </label>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="h-9 px-4 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
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
      const payload = res.data?.data ?? res.data ?? {};
      const list = payload?.data ?? (Array.isArray(payload) ? payload : []);
      setCoupons(Array.isArray(list) ? list : []);
      setTotal(payload?.total ?? list.length);
      setPage(nextPage);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load coupons.');
    } finally { setLoading(false); }
  }, [page, search]);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total > 0 ? `${total} coupons` : 'Create and manage promo codes'}</p>
        </div>
        <button onClick={() => setModal('new')} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus size={15} /> New coupon
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
          <button onClick={() => fetchCoupons()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700/60">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search code…"
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700/60">
              {['Code', 'Value', 'Usage', 'Validity', 'Status', ''].map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{c}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + j * 8}%` }} /></td>
                  ))}</tr>
                ))
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                    <Tag size={36} className="opacity-20" /><p className="text-sm font-medium">No coupons yet</p>
                  </div>
                </td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white text-xs">{c.code}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{valueLabel(c)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{usageLabel(c)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{fmtDate(c.startsAt)} → {fmtDate(c.endsAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.active !== false ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400'}`}>
                        {c.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {confirmId === c._id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <button onClick={() => handleDelete(c._id)} className="text-xs font-semibold text-red-600 hover:underline">Confirm</button>
                          <button onClick={() => setConfirmId(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <button onClick={() => setModal(c)} className="p-1.5 rounded-lg text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600"><Pencil size={14} /></button>
                          <button onClick={() => setConfirmId(c._id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"><Trash2 size={14} /></button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchCoupons({ page: page - 1 })} disabled={page <= 1} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => fetchCoupons({ page: page + 1 })} disabled={page >= totalPages} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
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
