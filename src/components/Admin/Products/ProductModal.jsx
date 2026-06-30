// src/components/admin/products/ProductModal.jsx
import { AlertCircle, Loader2, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  buildImageUrl,
  getImagePath,
  productsAPI,
} from "../../../services/api";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  addProductFormPreviews,
  initProductForm,
  removeProductFormExistingImage,
  removeProductFormPreview,
  resetProductForm,
  setProductFormError,
  setProductFormLoading,
  updateProductForm,
} from "../../../store/slices/productFormSlice";
import AdminSelect from "../Shared/AdminSelect";

export default function ProductModal({
  product = null,
  services = [],
  onClose,
  onSaved,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error, previews, existingImages, form } = useAppSelector(
    (s) => s.productForm,
  );
  const isEdit = !!product;
  const fileInputRef = useRef(null);
  // File objects are not Redux-serializable kept in a ref
  const imageFilesRef = useRef([]);

  // Initialise form when product changes (edit mode)
  useEffect(() => {
    if (product) {
      const rawService = product.service ?? product.serviceId;
      const serviceId =
        typeof rawService === "string" ? rawService : (rawService?._id ?? "");
      const paths = (product.images ?? []).map(getImagePath).filter(Boolean);
      dispatch(
        initProductForm({
          serviceId,
          existingImages: paths,
          previews: paths.map(buildImageUrl).filter(Boolean),
          form: {
            name: product.name ?? "",
            description: product.description ?? "",
            serviceId,
            priceMonth: product.priceMonth ?? "",
            priceYear: product.priceYear ?? "",
            stock: product.stock ?? "",
            is_selected: product.is_selected ?? false,
          },
        }),
      );
    } else {
      dispatch(resetProductForm());
    }
    imageFilesRef.current = [];
  }, [product, dispatch]);

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      dispatch(resetProductForm());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(
      updateProductForm({ [name]: type === "checkbox" ? checked : value }),
    );
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    imageFilesRef.current = [...imageFilesRef.current, ...files];
    dispatch(addProductFormPreviews(newPreviews));
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    if (index < existingImages.length) {
      dispatch(removeProductFormExistingImage(index));
      dispatch(removeProductFormPreview(index));
    } else {
      const fileIndex = index - existingImages.length;
      const url = previews[index];
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      imageFilesRef.current = imageFilesRef.current.filter(
        (_, i) => i !== fileIndex,
      );
      dispatch(removeProductFormPreview(index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setProductFormError(null));

    if (!form.name.trim()) {
      dispatch(setProductFormError(t("admin.products.err_name_required")));
      return;
    }
    if (!form.serviceId) {
      dispatch(setProductFormError(t("admin.products.err_service_required")));
      return;
    }
    if (form.priceMonth === "" || isNaN(Number(form.priceMonth))) {
      dispatch(
        setProductFormError(t("admin.products.err_price_month_required")),
      );
      return;
    }
    if (form.priceYear === "" || isNaN(Number(form.priceYear))) {
      dispatch(
        setProductFormError(t("admin.products.err_price_year_required")),
      );
      return;
    }
    if (!isEdit && imageFilesRef.current.length === 0) {
      dispatch(setProductFormError(t("admin.products.err_image_required")));
      return;
    }

    dispatch(setProductFormLoading(true));
    try {
      let payload;
      if (imageFilesRef.current.length > 0) {
        payload = new FormData();
        payload.append("serviceId", form.serviceId);
        payload.append("name", form.name.trim());
        payload.append("description", form.description.trim());
        payload.append("priceMonth", String(Number(form.priceMonth) || 0));
        payload.append("priceYear", String(Number(form.priceYear) || 0));
        payload.append("stock", String(Number(form.stock) || 0));
        payload.append("is_selected", String(form.is_selected));
        imageFilesRef.current.forEach((f) => payload.append("images", f));
        existingImages.forEach((u) => payload.append("existingImages", u));
      } else {
        payload = {
          serviceId: form.serviceId,
          name: form.name.trim(),
          description: form.description.trim(),
          priceMonth: Number(form.priceMonth) || 0,
          priceYear: Number(form.priceYear) || 0,
          stock: Number(form.stock) || 0,
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
      const msg =
        err.response?.data?.message ?? err.message ?? t("admin.common.error");
      dispatch(setProductFormError(Array.isArray(msg) ? msg.join(" · ") : msg));
    } finally {
      dispatch(setProductFormLoading(false));
    }
  };

  const inputCls =
    "w-full h-10 px-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl flex flex-col max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEdit
                ? t("admin.products.edit_modal_title")
                : t("admin.products.add")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit
                ? t("admin.products.editing", { name: product.name })
                : t("admin.products.fill_details_new")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              {t("admin.products.label_name")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("admin.products.placeholder_name")}
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              {t("admin.products.label_description")}
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t("admin.products.placeholder_description")}
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Service */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              {t("admin.products.label_service")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <AdminSelect
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
            >
              <option value="">{t("admin.products.select_service")}</option>
              {services.length === 0 && (
                <option value="" disabled>
                  {t("admin.products.no_services_available")}
                </option>
              )}
              {services.map((service) => (
                <option
                  key={service._id ?? service.slug}
                  value={service._id ?? service.slug}
                >
                  {service.name}
                </option>
              ))}
            </AdminSelect>
            {services.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                ⚠ {t("admin.products.no_services_hint")}
              </p>
            )}
          </div>

          {/* Prices + Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                {t("admin.products.label_price_month")}{" "}
                <span className="text-red-500">*</span>
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
                {t("admin.products.label_price_year")}{" "}
                <span className="text-red-500">*</span>
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
                {t("admin.products.label_stock")}
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
                <input
                  type="checkbox"
                  name="is_selected"
                  checked={form.is_selected}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4 transition-colors duration-200" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("admin.products.label_top")}
              </span>
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-12">
              {t("admin.products.label_top_hint")}
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              {t("admin.products.label_images")}{" "}
              {!isEdit && <span className="text-red-500">*</span>}
            </label>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {previews.map((url, i) => (
                  <div
                    key={i}
                    className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
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
              {previews.length > 0
                ? t("admin.products.add_images")
                : t("admin.products.upload_images_edit")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 px-5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
            >
              {t("admin.common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading
                ? t("admin.common.saving")
                : isEdit
                  ? t("admin.common.save")
                  : t("admin.products.create")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
