// src/components/admin/products/ProductModal.jsx
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { productsAPI, buildImageUrl, getImagePath } from '../../../services/api';
import AdminSelect from '../Shared/AdminSelect';

export default function ProductModal({ product = null, services = [], onClose, onSaved }) {
  const isEdit       = !!product;
  const fileInputRef = useRef(null);

  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [previews, setPreviews]             = useState([]);
  const [imageFiles, setImageFiles]         = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    name:        '',
    serviceId:   '',
    priceMonth:  '',
    priceYear:   '',
    stock:       '',
    is_selected: false,
  });

  useEffect(() => {
    if (!product) return;
    const rawService = product.service ?? product.serviceId;
    const serviceId  = typeof rawService === 'string' ? rawService : rawService?._id ?? '';

    const paths = (product.images ?? []).map(getImagePath).filter(Boolean);
    setExistingImages(paths);
    setPreviews(paths.map(buildImageUrl).filter(Boolean));

    setForm({
      name:        product.name        ?? '',
      serviceId,
      priceMonth:  product.priceMonth  ?? '',
      priceYear:   product.priceYear   ?? '',
      stock:       product.stock       ?? '',
      is_selected: product.is_selected ?? false,
    });
  }, [product]);

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

    if (!form.name.trim())                            { setError('Product name is required.'); return; }
    if (!form.serviceId)                              { setError('Please select a service.'); return; }
    if (form.priceMonth === '' || isNaN(Number(form.priceMonth))) { setError('Monthly price is required.'); return; }
    if (form.priceYear  === '' || isNaN(Number(form.priceYear)))  { setError('Yearly price is required.'); return; }
    if (!isEdit && imageFiles.length === 0)           { setError('At least one image is required.'); return; }

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
        imageFiles.forEach((f) => payload.append('images', f));
        existingImages.forEach((u) => payload.append('existingImages', u));
      } else {
        payload = {
          serviceId:   form.serviceId,
          name:        form.name.trim(),
          priceMonth:  Number(form.priceMonth) || 0,
          priceYear:   Number(form.priceYear)  || 0,
          stock:       Number(form.stock)      || 0,
          is_selected: form.is_selected,
        };
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
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit ? `Editing: ${product.name}` : 'Fill in the details for the new product'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          {/* Service */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Service <span className="text-red-500">*</span>
            </label>
            <AdminSelect name="serviceId" value={form.serviceId} onChange={handleChange}>
              <option value="">Select a service…</option>
              {services.length === 0 && (
                <option value="" disabled>No services available</option>
              )}
              {services.map((service) => (
                <option key={service._id ?? service.slug} value={service._id ?? service.slug}>
                  {service.name}
                </option>
              ))}
            </AdminSelect>
            {services.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                ⚠ No services found. Create a service first.
              </p>
            )}
          </div>

          {/* Prices + Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Monthly (€) <span className="text-red-500">*</span>
              </label>
              <input
                name="priceMonth"
                type="number"
                min="0"
                step="0.01"
                value={form.priceMonth}
                onChange={handleChange}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Yearly (€) <span className="text-red-500">*</span>
              </label>
              <input
                name="priceYear"
                type="number"
                min="0"
                step="0.01"
                value={form.priceYear}
                onChange={handleChange}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>

          {/* Top product toggle */}
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

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Product images {!isEdit && <span className="text-red-500">*</span>}
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
