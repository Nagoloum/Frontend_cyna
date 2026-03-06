// src/components/admin/products/ProductModal.jsx
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, AlertCircle, Loader2, Package } from 'lucide-react';
import { productsAPI } from '../../../services/api';

const BILLING_PERIODS = ['monthly', 'annual', 'one-time'];

export default function ProductModal({ product = null, categories = [], services = [], onClose, onSaved }) {
  const isEdit      = !!product;
  const fileInputRef = useRef(null);

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [previews, setPreviews]         = useState([]);
  const [imageFiles, setImageFiles]     = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    name:          '',
    description:   '',
    price:         '',
    billingPeriod: 'monthly',
    categorySlug:  '',
    serviceId:     '',
    isActive:      true,
    quantity:      '',
  });

  // Pre-fill when editing
  useEffect(() => {
    if (product) {
      const rawService = product.service;
      const serviceId =
        typeof rawService === 'string' ? rawService : rawService?._id ?? '';

      setForm({
        name:          product.name ?? '',
        description:   product.description ?? '',
        price:         product.price ?? product.priceMonth ?? '',
        billingPeriod: product.billingPeriod ?? 'monthly',
        categorySlug:  product.category?.slug ?? product.categorySlug ?? '',
        serviceId,
        isActive:      product.isActive !== false,
        quantity:      product.quantity ?? product.stock ?? '',
      });
      const imgs = product.images ?? [];
      setExistingImages(imgs);
      setPreviews(imgs);
    }
  }, [product]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImages.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setPreviews((prev) => {
        const url = prev[index];
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim())                         { setError('Product name is required.'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('Price must be a valid number.'); return; }
    if (!form.serviceId)                           { setError('Please select a service.'); return; }

    setLoading(true);
    try {
      const priceValue = Number(form.price);
      let priceMonth = priceValue;
      let priceYear  = Math.round(priceValue * 12 * 100) / 100;

      if (form.billingPeriod === 'annual') {
        priceYear  = priceValue;
        priceMonth = Math.round((priceValue / 12) * 100) / 100;
      } else if (form.billingPeriod === 'one-time') {
        priceMonth = priceValue;
        priceYear  = priceValue;
      }

      const stock = form.quantity ? Number(form.quantity) : 0;

      const basePayload = {
        serviceId:   form.serviceId,
        name:        form.name.trim(),
        description: form.description.trim(),
        priceMonth,
        priceYear,
        stock,
        is_selected: form.isActive,
        priority:    false,
        ...(form.categorySlug ? { categorySlug: form.categorySlug } : {}),
      };

      let payload;
      if (imageFiles.length > 0) {
        payload = new FormData();
        Object.entries(basePayload).forEach(([k, v]) => payload.append(k, String(v)));
        imageFiles.forEach((f) => payload.append('images', f));
        // Send existing image URLs so backend knows which to keep
        existingImages.forEach((url) => payload.append('existingImages', url));
      } else {
        payload = basePayload;
      }

      if (isEdit) {
        await productsAPI.update(product.slug, payload);
      } else {
        await productsAPI.create(payload);
      }

      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'An error occurred.';
      setError(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit ? `Editing: ${product.name}` : 'Fill in the details for the new service'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Product name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. EDR Pro Plan"
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Service description, key features…"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Price + Billing + Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Price (€) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Billing
              </label>
              <select name="billingPeriod" value={form.billingPeriod} onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
              >
                {BILLING_PERIODS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Stock / Qty
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Unlimited"
                className={inputCls}
              />
            </div>
          </div>

          {/* Service + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Service <span className="text-red-500">*</span>
              </label>
              <select name="serviceId" value={form.serviceId} onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
              >
                <option value="">Select a service…</option>
                {services.length === 0 && (
                  <option value="" disabled>No services available</option>
                )}
                {services.map((service) => (
                  <option key={service._id ?? service.slug} value={service._id ?? service.slug}>
                    {service.name}
                  </option>
                ))}
              </select>
              {services.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠ No services found. Create a service first.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select name="categorySlug" value={form.categorySlug} onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-5 transition-colors duration-200" />
              </label>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {form.isActive ? 'Active — visible on site' : 'Inactive — hidden from catalog'}
              </span>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Product images
            </label>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    <button type="button" onClick={() => handleRemoveImage(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all duration-200"
            >
              <Upload size={15} />
              {previews.length > 0 ? 'Add more images' : 'Upload images'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={loading}
              className="h-10 px-5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="h-10 px-6 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}