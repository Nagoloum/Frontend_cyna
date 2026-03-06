// src/components/admin/products/CategoryManager.jsx
import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Loader2, Tag, AlertCircle, Image } from 'lucide-react';
import { categoriesAPI } from '../../../services/api';

function CategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors duration-150">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Thumbnail */}
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {cat.image ? (
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <Tag size={13} className="text-indigo-500" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{cat.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            /{cat.slug}
            {cat.order !== undefined && ` · order ${cat.order}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button onClick={() => onEdit(cat)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(cat)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function CategoryManager({ categories: initialCategories = [], onClose, onSaved }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCat, setEditingCat] = useState(null);
  const [newName, setNewName]       = useState('');
  const [newOrder, setNewOrder]     = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [loadingSlug, setLoadingSlug]   = useState(null);
  const [error, setError]               = useState(null);

  const defaultNextOrder = useMemo(() => {
    if (!categories.length) return 1;
    const orders = categories.map((c) => (typeof c.order === 'number' ? c.order : null)).filter((v) => v !== null);
    if (!orders.length) return categories.length + 1;
    return Math.max(...orders) + 1;
  }, [categories]);

  // ── Create ──────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const orderValue =
      newOrder && !Number.isNaN(Number(newOrder)) ? Number(newOrder) : defaultNextOrder;

    setError(null);
    setLoadingSlug('new');
    try {
      const formData = new FormData();
      formData.append('name', newName.trim());
      formData.append('order', String(orderValue));
      if (newImageFile) formData.append('newImage', newImageFile);

      const res = await categoriesAPI.create(formData);
      const created = res.data?.data ?? res.data;
      setCategories((prev) => [...prev, created]);
      setNewName('');
      setNewOrder('');
      setNewImageFile(null);
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error while creating.');
    } finally {
      setLoadingSlug(null);
    }
  };

  // ── Update ───────────────────────────────────────────────────────────────────

  const handleUpdate = async () => {
    if (!editingCat || !editingCat.name.trim()) return;
    setError(null);
    setLoadingSlug(editingCat.slug);
    try {
      const payload = { name: editingCat.name.trim() };
      if (editingCat.order !== undefined) payload.order = editingCat.order;
      const res = await categoriesAPI.update(editingCat.slug, payload);
      const updated = res.data?.data ?? res.data;
      setCategories((prev) => prev.map((c) => (c.slug === editingCat.slug ? updated : c)));
      setEditingCat(null);
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error updating category.');
    } finally {
      setLoadingSlug(null);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This may affect associated products.`)) return;
    setError(null);
    setLoadingSlug(cat.slug);
    try {
      await categoriesAPI.delete(cat.slug);
      setCategories((prev) => prev.filter((c) => c.slug !== cat.slug));
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error while deleting.');
    } finally {
      setLoadingSlug(null);
    }
  };

  const inputCls = 'flex-1 h-9 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Manage Categories</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {categories.length} category{categories.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Create form */}
          <div className="space-y-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">New category</p>
            <div className="flex items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Category name…"
                className={inputCls}
              />
              <input
                type="number"
                min="1"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                placeholder={String(defaultNextOrder)}
                title="Display order"
                className="w-16 h-9 px-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 h-9 px-3 rounded-xl text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden">
                <Image size={13} className="flex-shrink-0" />
                <span className="truncate">
                  {newImageFile ? newImageFile.name : 'Upload image (optional)'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)} />
              </label>
              {newImageFile && (
                <button onClick={() => setNewImageFile(null)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={13} />
                </button>
              )}
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || loadingSlug === 'new'}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                {loadingSlug === 'new' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          {/* Categories list */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-gray-400 dark:text-gray-500">
                <Tag size={28} className="opacity-20" />
                <p className="text-sm">No categories yet</p>
                <p className="text-xs">Create your first category above</p>
              </div>
            ) : categories.map((cat) =>
              editingCat?.slug === cat.slug ? (
                <div key={cat.slug} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
                  <input
                    value={editingCat.name}
                    onChange={(e) => setEditingCat((prev) => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditingCat(null); }}
                    autoFocus
                    className="flex-1 h-8 px-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 border border-indigo-400 dark:border-indigo-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <button onClick={handleUpdate} disabled={loadingSlug === cat.slug}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 transition-all flex-shrink-0"
                  >
                    {loadingSlug === cat.slug ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  </button>
                  <button onClick={() => setEditingCat(null)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div key={cat.slug} className={loadingSlug === cat.slug ? 'opacity-50 pointer-events-none' : ''}>
                  <CategoryRow
                    cat={cat}
                    onEdit={(c) => setEditingCat({ ...c })}
                    onDelete={handleDelete}
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose}
            className="w-full h-9 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}