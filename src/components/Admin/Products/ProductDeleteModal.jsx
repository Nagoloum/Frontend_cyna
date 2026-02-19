// src/components/admin/products/ProductDeleteModal.jsx
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export default function ProductDeleteModal({ product, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icône */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>

        {/* Texte */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Delete this product?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          You are about to permanently delete:
        </p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
          {product?.name}
        </p>
        <p className="text-xs text-red-500 dark:text-red-400 mb-6">
          ⚠️ This action is irreversible. The product will be removed from the catalog and will no longer be accessible on the site.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
