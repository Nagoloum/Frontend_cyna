/* eslint-disable no-unused-vars */
// src/pages/admin/ProductsPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, AlertCircle, Search,
  Edit2, Trash2, Package, Tag, Layers,
  ChevronLeft, ChevronRight, ChevronsUpDown,
  ChevronUp, ChevronDown, X, Loader2, Upload,
  Image as ImageIcon, AlertTriangle,
  ToggleLeft, ToggleRight,
  LayoutDashboard, GripVertical,
  ExternalLink,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  productsAPI, categoriesAPI, servicesAPI,
  slidersAPI, buildImageUrl, extractList, getImagePath,
} from '../../services/api';
import { notify } from '@/components/ui/feedback';
import AdminSelect from '../../components/Admin/Shared/AdminSelect';
import { ADMIN_REFRESH_EVENT } from '../../layouts/admin/AdminHeader';

/**
 * Cross-tab signal so any list that depends on a shared resource
 * (categories, services) refetches after a CRUD elsewhere.
 */
const ADMIN_DATA_EVENT = 'admin-data-changed';
const emitAdminChange = (kind) =>
  window.dispatchEvent(new CustomEvent(ADMIN_DATA_EVENT, { detail: { kind } }));

/**
 * The backend uses an ApiResponse pattern that returns HTTP 200 even on
 * business errors, with `{ success: false, message }`. Throw so that callers'
 * try/catch path takes over and surfaces the message to the user.
 */
const ensureOk = (res) => {
  if (res?.data && res.data.success === false) {
    const err = new Error(res.data.message ?? 'Operation failed');
    err.response = { data: res.data };
    throw err;
  }
  return res;
};

/** Resolve an id-or-populated-doc reference to a plain string id/slug. */
const refToValue = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return raw._id ?? raw.id ?? raw.slug ?? '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtPrice = (n) => n !== undefined && n !== null ? `${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })} €` : '—';

function Thumb({ src, alt, size = 9, placeholder: Placeholder = Package }) {
  const [error, setError] = useState(false);
  const url = buildImageUrl(src);
  return (
    <div className={`w-${size} h-${size} rounded-xl flex-shrink-0 overflow-hidden bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-gray-100 dark:border-gray-700/60`}>
      {url && !error
        ? <img src={url} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />
        : <Placeholder size={size === 9 ? 15 : 13} className="text-indigo-400" />}
    </div>
  );
}

const SkeletonRow = ({ cols = 5 }) => (
  <tr>{[...Array(cols)].map((_, i) => (
    <td key={i} className="px-4 py-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + i * 10}%` }} />
    </td>
  ))}</tr>
);

const EmptyState = ({ icon: Icon, message, sub }) => (
  <tr><td colSpan={99} className="px-4 py-16 text-center">
    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
      <Icon size={36} className="opacity-20" />
      <p className="text-sm font-medium">{message}</p>
      {sub && <p className="text-xs">{sub}</p>}
    </div>
  </td></tr>
);

const StatusPill = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
    active ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
           : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

const SortIcon = ({ field, sortBy, order }) => {
  if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-300 dark:text-gray-600" />;
  return order === 'asc' ? <ChevronUp size={12} className="text-indigo-500" /> : <ChevronDown size={12} className="text-indigo-500" />;
};

const Th = ({ label, field, sortBy, order, onSort, className = '' }) => (
  <th onClick={() => field && onSort?.(field)}
    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap ${field ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none' : ''} transition-colors ${className}`}>
    <span className="flex items-center gap-1">{label}{field && <SortIcon field={field} sortBy={sortBy} order={order} />}</span>
  </th>
);

function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit) || 1;
  if (total <= limit) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
      <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} / {totalPages}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all">
          <ChevronLeft size={15} />
        </button>
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1;
          const near = Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
          if (!near) {
            if (p === 2 || p === totalPages - 1) return <span key={p} className="text-gray-400 px-1 text-xs">…</span>;
            return null;
          }
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${page === p ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ name, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const run = async () => { setLoading(true); try { await onConfirm(); } finally { setLoading(false); } };
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={15} /></button>
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Delete permanently?</h3>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 my-3 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl truncate">{name}</p>
        <p className="text-xs text-red-500 mb-5">⚠ This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-all">Cancel</button>
          <button onClick={run} disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>, document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDERS TAB
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Slider form modal — supports create & edit.
 * Backend: POST/PATCH /sliders  (multipart/form-data, field: newImage)
 * DTO: { title (required), newImage (file), linkUrl?, NameUrl (required), order? }
 */
function SliderFormModal({ slider, onClose, onSaved }) {
  const isEdit  = !!slider;
  const fileRef = useRef(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]   = useState(buildImageUrl(slider?.image) ?? null);

  const [form, setForm] = useState({
    title:   slider?.title   ?? '',
    NameUrl: slider?.NameUrl ?? slider?.nameUrl ?? '',
    linkUrl: slider?.linkUrl ?? '',
    order:   slider?.order   ?? 0,
  });

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim())   return setError('Title is required.');
    if (!form.NameUrl.trim()) return setError('Button label is required.');
    if (!form.linkUrl.trim()) return setError('Link URL is required.');
    if (!isEdit && !imageFile) return setError('An image is required for a new slider.');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',   form.title.trim());
      fd.append('NameUrl', form.NameUrl.trim());
      fd.append('linkUrl', form.linkUrl.trim());
      fd.append('order',   String(Number(form.order) || 0));
      if (imageFile) fd.append('newImage', imageFile);

      if (isEdit) ensureOk(await slidersAPI.update(slider._id, fd));
      else        ensureOk(await slidersAPI.create(fd));
      notify.success(isEdit ? 'Slide updated' : 'Slide created', form.title.trim());
      emitAdminChange('slider');
      onSaved();
    } catch (err) {
      const m = err.response?.data?.message ?? err.message ?? 'An error occurred.';
      const msg = Array.isArray(m) ? m.join(' · ') : m;
      setError(msg);
      notify.error('Save failed', msg);
    } finally { setLoading(false); }
  };

  const inp = 'w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Slide' : 'New Slide'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hero carousel — home page</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={13} className="mt-0.5 flex-shrink-0" />{error}</div>}

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Image {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-24 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors flex-shrink-0 bg-gray-50 dark:bg-gray-700/50"
              >
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover" onError={() => setPreview(null)} />
                  : <ImageIcon size={20} className="text-gray-300 dark:text-gray-600" />}
              </div>
              <div className="flex-1">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all">
                  <Upload size={13} />{imageFile ? imageFile.name : isEdit ? 'Change image' : 'Choose image'}
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG or WebP · max 2 MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Next-Generation SOC Protection" className={inp} />
          </div>

          {/* NameUrl — used as the carousel CTA button label */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Button label <span className="text-red-500">*</span></label>
            <input name="NameUrl" value={form.NameUrl} onChange={handleChange} placeholder="e.g. Discover, Learn more" className={inp} />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Text displayed on the carousel call-to-action button.</p>
          </div>

          {/* Link URL + Order */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Link URL <span className="text-red-500">*</span>
              </label>
              <input name="linkUrl" value={form.linkUrl} onChange={handleChange} placeholder="/categories" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Order</label>
              <input name="order" type="number" min="0" value={form.order} onChange={handleChange} className={inp} />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 h-10 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}

function SlidersTab() {
  const [sliders, setSliders]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(null);

  const fetchSliders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await slidersAPI.getAll();
      const raw = res.data?.data ?? res.data ?? [];
      setSliders(Array.isArray(raw) ? raw.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []);
    } catch (e) { setError(e.response?.data?.message ?? 'Failed to load sliders.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSliders(); }, [fetchSliders]);

  useEffect(() => {
    const onRefresh = () => fetchSliders();
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
  }, [fetchSliders]);

  const onSaved  = () => { setModal(null); fetchSliders(); };
  const onDelete = async () => {
    const title = modal.data.title;
    try {
      await slidersAPI.delete(modal.data._id);
      notify.success('Slide deleted', title);
      emitAdminChange('slider');
    } catch (err) {
      notify.error('Delete failed', err.response?.data?.message ?? err.message ?? 'Unknown error');
    }
    setModal(null);
    fetchSliders();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
          {sliders.length} slide{sliders.length !== 1 ? 's' : ''} — displayed in homepage hero carousel
        </p>
        <button onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-all">
          <Plus size={13} />Add Slide
        </button>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={14} />{error}<button onClick={() => fetchSliders()} className="ml-auto text-xs underline">Retry</button></div>}

      {/* Slider grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2].map(i => <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse h-48" />)}
        </div>
      ) : sliders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-14 text-center">
          <LayoutDashboard size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No slides yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create your first slide to populate the homepage carousel</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sliders.map(s => (
            <div key={s._id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden flex flex-col">
              {/* Preview */}
              <div className="relative h-36 bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {s.image ? (
                  <img src={buildImageUrl(s.image)} alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={28} className="text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                {/* Order badge */}
                <span className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-black/60 text-white text-xs font-bold">
                  {s.order ?? 0}
                </span>
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ type: 'edit', data: s })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 shadow-sm border border-gray-200 dark:border-gray-600 transition-colors">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => setModal({ type: 'delete', data: s })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-500 shadow-sm border border-gray-200 dark:border-gray-600 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col gap-2">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{s.title}</p>
                {(s.NameUrl || s.linkUrl) && (
                  <div className="flex items-center gap-2 mt-auto text-xs text-gray-500 dark:text-gray-400 truncate">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {s.NameUrl || '—'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span className="truncate">{s.linkUrl || '—'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <SliderFormModal slider={modal.data} onClose={() => setModal(null)} onSaved={onSaved} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal name={modal.data.title} onClose={() => setModal(null)} onConfirm={onDelete} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS TAB  (unchanged from original, kept intact)
// ─────────────────────────────────────────────────────────────────────────────

function ProductFormModal({ product, categories, services, onClose, onSaved }) {
  const isEdit  = !!product;
  const fileRef = useRef(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [imageFiles, setImageFiles]     = useState([]);

  // Store the original stored paths (strings) so they can be re-sent to the
  // backend during PATCH; previews are derived URLs for display.
  const [existingImages, setExistingImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    name:        '',
    serviceId:   '',
    priceMonth:  '',
    priceYear:   '',
    stock:       '',
    is_selected: false,
  });

  // Pre-fill / reset whenever the edited product changes (modal can be reused).
  useEffect(() => {
    const paths = (product?.images ?? []).map(getImagePath).filter(Boolean);
    setExistingImages(paths);
    setPreviews(paths.map(buildImageUrl).filter(Boolean));
    setImageFiles([]);
    setError(null);
    setForm({
      name:        product?.name        ?? '',
      serviceId:   refToValue(product?.service ?? product?.serviceId),
      priceMonth:  product?.priceMonth  ?? product?.price ?? '',
      priceYear:   product?.priceYear   ?? '',
      stock:       product?.stock       ?? '',
      is_selected: product?.is_selected ?? false,
    });
    // We intentionally do not include `previews` in the dep array — the previews
    // we just set will trigger the cleanup effect below when the modal unmounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => () => previews.forEach(u => u.startsWith('blob:') && URL.revokeObjectURL(u)), [previews]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const addImages = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles(p => [...p, ...files]);
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeImage = i => {
    if (i < existingImages.length) setExistingImages(p => p.filter((_, j) => j !== i));
    else {
      const fi = i - existingImages.length;
      setImageFiles(p => p.filter((_, j) => j !== fi));
      const url = previews[i];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    }
    setPreviews(p => p.filter((_, j) => j !== i));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim())               return setError('Product name is required.');
    if (!form.serviceId)                 return setError('Please select a service.');
    if (!form.priceMonth && !form.priceYear) return setError('At least one price is required.');
    if (!isEdit && imageFiles.length === 0) return setError('At least one image is required.');

    setLoading(true);
    try {
      let payload;
      if (imageFiles.length > 0) {
        payload = new FormData();
        payload.append('serviceId',   form.serviceId);
        payload.append('name',        form.name.trim());
        payload.append('priceMonth',  String(Number(form.priceMonth) || 0));
        payload.append('priceYear',   String(Number(form.priceYear)  || 0));
        payload.append('stock',       String(Number(form.stock)      || 0));
        payload.append('is_selected', String(form.is_selected));
        imageFiles.forEach(f => payload.append('images', f));
        existingImages.forEach(u => payload.append('existingImages', u));
      } else {
        payload = {
          serviceId: form.serviceId, name: form.name.trim(),
          priceMonth: Number(form.priceMonth) || 0, priceYear: Number(form.priceYear) || 0,
          stock: Number(form.stock) || 0, is_selected: form.is_selected,
        };
      }
      if (isEdit) ensureOk(await productsAPI.update(product.slug, payload));
      else        ensureOk(await productsAPI.create(payload));
      notify.success(
        isEdit ? 'Product updated' : 'Product created',
        form.name.trim()
      );
      emitAdminChange('product');
      onSaved();
    } catch (err) {
      const m = err.response?.data?.message ?? err.message ?? 'An error occurred.';
      const msg = Array.isArray(m) ? m.join(' · ') : m;
      setError(msg);
      notify.error('Save failed', msg);
    } finally { setLoading(false); }
  };

  const inp = 'w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Product' : 'New Product'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isEdit ? `Editing: ${product.name}` : 'Fill in the details'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={14} className="mt-0.5 flex-shrink-0" />{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Name <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. EDR Pro Plan" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Service <span className="text-red-500">*</span></label>
            <AdminSelect name="serviceId" value={form.serviceId} onChange={handleChange}>
              <option value="">Select a service…</option>
              {services.map(s => <option key={s._id ?? s.slug} value={s._id ?? s.slug}>{s.name}</option>)}
            </AdminSelect>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['priceMonth','Monthly (€)'],['priceYear','Yearly (€)'],['stock','Stock']].map(([name, label]) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">{label}</label>
                <input name={name} type="number" min="0" step={name.includes('price') ? '0.01' : '1'} value={form[name]} onChange={handleChange} placeholder="0" className={inp} />
              </div>
            ))}
          </div>
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative">
                <input type="checkbox" name="is_selected" checked={form.is_selected} onChange={handleChange} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4 transition-colors duration-200" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Top product</span>
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-12">
              Featured in the homepage <strong>Top Products</strong> section.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Product images {!isEdit && <span className="text-red-500">*</span>}
            </label>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <Upload size={14} />{previews.length > 0 ? 'Add more images' : isEdit ? 'Upload images' : 'Upload images (required)'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}

function ProductsTab({ categories, services }) {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [pagination, setPagination]     = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch]             = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy]             = useState('createdAt');
  const [sortOrder, setSortOrder]       = useState('desc');
  const [modal, setModal]               = useState(null);
  const searchRef = useRef(null);
  const [searchParams] = useSearchParams();

  const fetch = useCallback(async (opts = {}) => {
    setLoading(true); setError(null);
    try {
      const params = {
        page:  opts.page  ?? pagination.page,
        limit: pagination.limit,
        sortBy: opts.sortBy ?? sortBy,
        order: opts.sortOrder ?? sortOrder,
        ...(opts.search ?? search ? { search: opts.search ?? search } : {}),
        ...(opts.filterCategory ?? filterCategory ? { categorySlug: opts.filterCategory ?? filterCategory } : {}),
      };
      const res = await productsAPI.getAll(params);
      const d = res.data;
      const inner = d?.data ?? d;
      const items = Array.isArray(inner?.items) ? inner.items : Array.isArray(inner?.data) ? inner.data : Array.isArray(inner) ? inner : [];
      setPagination(p => ({ ...p, page: params.page, total: d?.data?.total ?? d?.total ?? items.length }));
      setProducts(items);
    } catch (e) { setError(e.response?.data?.message ?? 'Failed to load products.'); }
    finally { setLoading(false); }
  }, [pagination.page, pagination.limit, search, filterCategory, sortBy, sortOrder]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { if (searchParams.get('action') === 'create') setModal({ type: 'create' }); }, [searchParams]);

  // Refetch whenever a related entity changes elsewhere in the dashboard.
  useEffect(() => {
    const onChange = (e) => {
      if (!e?.detail?.kind || ['product', 'category', 'service'].includes(e.detail.kind)) {
        fetch();
      }
    };
    const onRefresh = () => fetch();
    window.addEventListener(ADMIN_DATA_EVENT, onChange);
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(ADMIN_DATA_EVENT, onChange);
      window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    };
  }, [fetch]);

  const onSearch = v => { setSearch(v); clearTimeout(searchRef.current); searchRef.current = setTimeout(() => fetch({ search: v, page: 1 }), 400); };
  const onSort = f => { const o = sortBy === f && sortOrder === 'asc' ? 'desc' : 'asc'; setSortBy(f); setSortOrder(o); fetch({ sortBy: f, sortOrder: o, page: 1 }); };
  const onSaved  = () => { setModal(null); fetch({ page: 1 }); };
  const onDelete = async () => {
    const name = modal.data.name;
    try {
      await productsAPI.delete(modal.data.slug);
      notify.success('Product deleted', name);
      emitAdminChange('product');
    } catch (err) {
      notify.error('Delete failed', err.response?.data?.message ?? err.message ?? 'Unknown error');
    }
    setModal(null);
    fetch({ page: pagination.page });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search products…"
            className="w-full h-9 pl-8 pr-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
        </div>
        <div className="w-44">
          <AdminSelect size="sm"
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); fetch({ filterCategory: e.target.value, page: 1 }); }}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </AdminSelect>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto hidden sm:block">{pagination.total} product{pagination.total !== 1 ? 's' : ''}</span>
        <button onClick={() => setModal({ type: 'create' })} className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-all">
          <Plus size={13} />Add Product
        </button>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={14} />{error}<button onClick={() => fetch()} className="ml-auto text-xs underline">Retry</button></div>}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/60">
                <Th label="Product"  field="name"      sortBy={sortBy} order={sortOrder} onSort={onSort} />
                <Th label="Service"  field="service"   sortBy={sortBy} order={sortOrder} onSort={onSort} />
                <Th label="Category" />
                <Th label="Monthly"  field="priceMonth" sortBy={sortBy} order={sortOrder} onSort={onSort} />
                <Th label="Yearly"   field="priceYear"  sortBy={sortBy} order={sortOrder} onSort={onSort} />
                <Th label="Stock"    field="stock"      sortBy={sortBy} order={sortOrder} onSort={onSort} />
                <Th label="Top" />
                <Th label="Created"  field="createdAt" sortBy={sortBy} order={sortOrder} onSort={onSort} />
                <Th label="" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={9} />)
                : products.length === 0 ? <EmptyState icon={Package} message="No products found" sub={search ? 'Try a different search term' : 'Create your first product'} />
                : products.map(p => (
                  <tr key={p.slug ?? p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><Thumb src={p.images?.[0]} alt={p.name} /><div className="min-w-0"><p className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{p.name}</p><p className="text-xs text-gray-400 truncate max-w-[160px]">/{p.slug}</p></div></div></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-600 dark:text-gray-300">{p.service?.name ?? '—'}</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{p.service?.category?.name ?? '—'}</span></td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{fmtPrice(p.priceMonth)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{fmtPrice(p.priceYear)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.stock ?? '∞'}</td>
                    <td className="px-4 py-3">
                      {p.is_selected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Top
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{fmtDate(p.createdAt)}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => setModal({ type: 'edit', data: p })} className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => setModal({ type: 'delete', data: p })} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={13} /></button>
                    </div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} total={pagination.total} limit={pagination.limit} onChange={p => { setPagination(prev => ({...prev, page:p})); fetch({ page: p }); }} />
      </div>

      {(modal?.type === 'create' || modal?.type === 'edit') && (<ProductFormModal product={modal.data} categories={categories} services={services} onClose={() => setModal(null)} onSaved={onSaved} />)}
      {modal?.type === 'delete' && (<DeleteModal name={modal.data.name} onClose={() => setModal(null)} onConfirm={onDelete} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES TAB (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function ServiceFormModal({ service, categories, onClose, onSaved }) {
  const isEdit = !!service;
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [form, setForm] = useState({
    name:        '',
    categoryId:  '',
    description: '',
    available:   true,
  });

  // Pre-fill / reset on prop change. `category` may be a populated doc, an
  // ObjectId string, or absent (with `categoryId` instead) — handle all cases.
  useEffect(() => {
    setError(null);
    setForm({
      name:        service?.name        ?? '',
      categoryId:  refToValue(service?.category ?? service?.categoryId),
      description: service?.description ?? '',
      available:   service?.available   ?? true,
    });
  }, [service]);

  const handleChange = e => { const { name, value, type, checked } = e.target; setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value })); };
  const handleSubmit = async e => {
    e.preventDefault(); setError(null);
    if (!form.name.trim()) return setError('Service name is required.');
    if (!form.categoryId)  return setError('Please select a category.');
    setLoading(true);
    try {
      const payload = { name: form.name.trim(), categoryId: form.categoryId, description: form.description.trim(), available: form.available };
      if (isEdit) ensureOk(await servicesAPI.update(service.slug, payload));
      else        ensureOk(await servicesAPI.create(payload));
      notify.success(isEdit ? 'Service updated' : 'Service created', form.name.trim());
      emitAdminChange('service');
      onSaved();
    } catch (err) {
      const m = err.response?.data?.message ?? err.message ?? 'An error occurred.';
      const msg = Array.isArray(m) ? m.join(' · ') : m;
      setError(msg);
      notify.error('Save failed', msg);
    }
    finally { setLoading(false); }
  };
  const inp = 'w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all';
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Service' : 'New Service'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={13} className="mt-0.5 flex-shrink-0" />{error}</div>}
          <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Name <span className="text-red-500">*</span></label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. EDR Protection" className={inp} /></div>
          <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label><AdminSelect name="categoryId" value={form.categoryId} onChange={handleChange}><option value="">Select a category…</option>{categories.map(c => <option key={c._id ?? c.slug} value={c._id ?? c.slug}>{c.name}</option>)}</AdminSelect></div>
          <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Optional…" className="w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" /></div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div className="relative">
              <input type="checkbox" name="available" checked={form.available} onChange={handleChange} className="sr-only peer" />
              <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4 transition-colors duration-200" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Available to customers</span>
          </label>
          <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">{loading && <Loader2 size={13} className="animate-spin" />}{loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Service'}</button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}

function ServicesTab({ categories }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [modal, setModal]       = useState(null);

  const fetch = useCallback(async (opts = {}) => {
    setLoading(true); setError(null);
    try { const res = await servicesAPI.getAll(opts.params ?? {}); setServices(extractList(res.data)); }
    catch (e) { setError(e.response?.data?.message ?? 'Failed to load services.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = services.filter(s => {
    if (search && !s.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory) {
      const catRef = s.category;
      const catId   = typeof catRef === 'object' ? catRef?._id  : null;
      const catSlug = typeof catRef === 'object' ? catRef?.slug : null;
      const catStr  = typeof catRef === 'string' ? catRef       : null;
      if (filterCategory !== catId && filterCategory !== catSlug && filterCategory !== catStr) return false;
    }
    return true;
  });
  const onDelete = async () => {
    const name = modal.data.name;
    try {
      await servicesAPI.delete(modal.data.slug);
      notify.success('Service deleted', name);
      emitAdminChange('service');
    } catch (err) {
      notify.error('Delete failed', err.response?.data?.message ?? err.message ?? 'Unknown error');
    }
    setModal(null);
    fetch();
  };
  const onSaved  = () => { setModal(null); fetch(); };

  // Refetch when other tabs change services or categories, or on global refresh.
  useEffect(() => {
    const onChange = (e) => {
      if (!e?.detail?.kind || ['service', 'category'].includes(e.detail.kind)) fetch();
    };
    const onRefresh = () => fetch();
    window.addEventListener(ADMIN_DATA_EVENT, onChange);
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(ADMIN_DATA_EVENT, onChange);
      window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    };
  }, [fetch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…"
            className="w-full h-9 pl-8 pr-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
        </div>
        <div className="w-44">
          <AdminSelect size="sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c._id ?? c.slug} value={c._id ?? c.slug}>{c.name}</option>)}
          </AdminSelect>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto hidden sm:block">{filtered.length} service{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setModal({ type: 'create' })} className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-all"><Plus size={13} />Add Service</button>
      </div>
      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={14} />{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700/60"><Th label="Service" /><Th label="Category" /><Th label="Description" /><Th label="Availability" /><Th label="Created" /><Th label="" /></tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
            {loading ? [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={6} />)
              : filtered.length === 0 ? <EmptyState icon={Layers} message="No services found" sub="Create your first service" />
              : filtered.map(s => (
                <tr key={s.slug ?? s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-100 dark:border-violet-500/20"><Layers size={14} className="text-violet-500" /></div><div className="min-w-0"><p className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{s.name}</p><p className="text-xs text-gray-400 truncate">/{s.slug}</p></div></div></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{s.category?.name ?? '—'}</span></td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[200px]"><p className="truncate">{s.description || '—'}</p></td>
                  <td className="px-4 py-3"><StatusPill active={s.available !== false} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(s.createdAt)}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end"><button onClick={() => setModal({ type: 'edit', data: s })} className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all"><Edit2 size={13} /></button><button onClick={() => setModal({ type: 'delete', data: s })} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={13} /></button></div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {(modal?.type === 'create' || modal?.type === 'edit') && (<ServiceFormModal service={modal.data} categories={categories} onClose={() => setModal(null)} onSaved={onSaved} />)}
      {modal?.type === 'delete' && (<DeleteModal name={modal.data.name} onClose={() => setModal(null)} onConfirm={onDelete} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES TAB (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function CategoryFormModal({ category, onClose, onSaved, nextOrder }) {
  const isEdit  = !!category;
  const fileRef = useRef(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [form, setForm] = useState({
    name:        '',
    description: '',
    order:       nextOrder ?? 1,
  });

  // Pre-fill / reset on prop change.
  useEffect(() => {
    setError(null);
    setImageFile(null);
    setPreview(buildImageUrl(category?.image) ?? null);
    setForm({
      name:        category?.name        ?? '',
      description: category?.description ?? '',
      order:       category?.order       ?? nextOrder ?? 1,
    });
  }, [category, nextOrder]);

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleFile = e => { const file = e.target.files?.[0]; if (!file) return; if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); setImageFile(file); setPreview(URL.createObjectURL(file)); e.target.value = ''; };
  const handleSubmit = async e => {
    e.preventDefault(); setError(null);
    if (!form.name.trim())     return setError('Category name is required.');
    if (!isEdit && !imageFile) return setError('An image is required for a new category.');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',  form.name.trim());
      fd.append('order', String(Number(form.order) || 1));
      if (form.description.trim()) fd.append('description', form.description.trim());
      if (imageFile) fd.append('newImage', imageFile);
      if (isEdit) ensureOk(await categoriesAPI.update(category.slug, fd));
      else        ensureOk(await categoriesAPI.create(fd));
      notify.success(isEdit ? 'Category updated' : 'Category created', form.name.trim());
      emitAdminChange('category');
      onSaved();
    } catch (err) {
      const m = err.response?.data?.message ?? err.message ?? 'An error occurred.';
      const msg = Array.isArray(m) ? m.join(' · ') : m;
      setError(msg);
      notify.error('Save failed', msg);
    }
    finally { setLoading(false); }
  };
  const inp = 'w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all';
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={13} className="mt-0.5 flex-shrink-0" />{error}</div>}
          <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Image {!isEdit && <span className="text-red-500">*</span>}</label>
            <div className="flex items-center gap-3">
              <div onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors flex-shrink-0 bg-gray-50 dark:bg-gray-700/50">{preview ? <img src={preview} alt="" className="w-full h-full object-cover" onError={() => setPreview(null)} /> : <ImageIcon size={22} className="text-gray-300 dark:text-gray-600" />}</div>
              <div className="flex-1"><button type="button" onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all"><Upload size={13} />{imageFile ? imageFile.name : isEdit ? 'Change image' : 'Choose image'}</button><p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG or WebP · max 2 MB</p></div>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Name <span className="text-red-500">*</span></label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Endpoint Security" className={inp} /></div>
            <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Order</label><input name="order" type="number" min="1" value={form.order} onChange={handleChange} className={inp} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional…" className="w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" /></div>
          <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">{loading && <Loader2 size={13} className="animate-spin" />}{loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}</button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [modal, setModal]           = useState(null);
  const nextOrder = categories.length ? Math.max(...categories.map(c => c.order ?? 0)) + 1 : 1;

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await categoriesAPI.getAll(); setCategories(extractList(res.data)); }
    catch (e) { setError(e.response?.data?.message ?? 'Failed to load categories.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const onDelete = async () => {
    const name = modal.data.name;
    try {
      await categoriesAPI.delete(modal.data.slug);
      notify.success('Category deleted', name);
      emitAdminChange('category');
    } catch (err) {
      notify.error('Delete failed', err.response?.data?.message ?? err.message ?? 'Unknown error');
    }
    setModal(null);
    fetch();
  };
  const onSaved  = () => { setModal(null); fetch(); };

  // Refetch when categories change elsewhere, or on global refresh.
  useEffect(() => {
    const onChange = (e) => {
      if (!e?.detail?.kind || e.detail.kind === 'category') fetch();
    };
    const onRefresh = () => fetch();
    window.addEventListener(ADMIN_DATA_EVENT, onChange);
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(ADMIN_DATA_EVENT, onChange);
      window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    };
  }, [fetch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</span>
        <button onClick={() => setModal({ type: 'create' })} className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-all"><Plus size={13} />Add Category</button>
      </div>
      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 text-sm"><AlertCircle size={14} />{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700/60"><Th label="Category" /><Th label="Slug" /><Th label="Description" /><Th label="Order" /><Th label="Created" /><Th label="" /></tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
            {loading ? [...Array(3)].map((_, i) => <SkeletonRow key={i} cols={6} />)
              : categories.length === 0 ? <EmptyState icon={Tag} message="No categories yet" sub="Create your first category" />
              : categories.map(cat => (
                <tr key={cat.slug ?? cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700/60 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">{cat.image ? <img src={buildImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} /> : <Tag size={14} className="text-indigo-400" />}</div><p className="font-medium text-gray-900 dark:text-white">{cat.name}</p></div></td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400 dark:text-gray-500">/{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[200px]"><p className="truncate">{cat.description || '—'}</p></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">{cat.order ?? '—'}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(cat.createdAt)}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end"><button onClick={() => setModal({ type: 'edit', data: cat })} className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all"><Edit2 size={13} /></button><button onClick={() => setModal({ type: 'delete', data: cat })} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={13} /></button></div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {(modal?.type === 'create' || modal?.type === 'edit') && (<CategoryFormModal category={modal.data} nextOrder={nextOrder} onClose={() => setModal(null)} onSaved={onSaved} />)}
      {modal?.type === 'delete' && (<DeleteModal name={modal.data.name} onClose={() => setModal(null)} onConfirm={onDelete} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE  — 4 tabs: Products · Services · Categories · Sliders
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'products',   label: 'Products',   icon: Package        },
  { id: 'services',   label: 'Services',   icon: Layers         },
  { id: 'categories', label: 'Categories', icon: Tag            },
  { id: 'sliders',    label: 'Sliders',    icon: LayoutDashboard },
];

export default function ProductsPage() {
  const [tab, setTab]               = useState('products');
  const [categories, setCategories] = useState([]);
  const [services, setServices]     = useState([]);

  const reloadShared = useCallback(() => {
    categoriesAPI.getAll().then(r => setCategories(extractList(r.data))).catch(() => {});
    servicesAPI.getAll().then(r => setServices(extractList(r.data))).catch(() => {});
  }, []);

  useEffect(() => { reloadShared(); }, [reloadShared]);

  // Keep the shared dropdowns in sync after any CRUD on categories/services.
  useEffect(() => {
    const onChange = (e) => {
      if (!e?.detail?.kind || ['category', 'service'].includes(e.detail.kind)) {
        reloadShared();
      }
    };
    window.addEventListener(ADMIN_DATA_EVENT, onChange);
    return () => window.removeEventListener(ADMIN_DATA_EVENT, onChange);
  }, [reloadShared]);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catalog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage products, services, categories and carousel slides
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-fit overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start whitespace-nowrap ${
              tab === id
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'products'   && <ProductsTab   categories={categories} services={services} />}
      {tab === 'services'   && <ServicesTab   categories={categories} />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'sliders'    && <SlidersTab />}
    </div>
  );
}
