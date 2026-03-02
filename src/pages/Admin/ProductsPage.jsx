// src/pages/Admin/Products.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';

import ProductTable       from '../../components/Admin/Products/ProductTable';
import ProductModal       from '../../components/Admin/Products/ProductModal';
import ProductDeleteModal from '../../components/Admin/Products/ProductDeleteModal';
import CategoryManager    from '../../components/Admin/Products/CategoryManager';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();

  // ── State données ──
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── State UI ──
  const [search, setSearch]         = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy]         = useState('createdAt');
  const [sortOrder, setSortOrder]   = useState('desc');

  // ── Modals ──
  const [showProductModal, setShowProductModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedProduct, setSelectedProduct]     = useState(null); // null = création
  const [productToDelete, setProductToDelete]     = useState(null);

  // Ouvrir directement le modal création si ?action=create dans l'URL
  useEffect(() => {
    if (searchParams.get('action') === 'create') setShowProductModal(true);
  }, [searchParams]);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productsAPI.getAll({
        page:         pagination.page,
        limit:        pagination.limit,
        search:       search || undefined,
        categorySlug: filterCategory || undefined,
        sortBy,
        order:        sortOrder,
      });
      const data = res.data?.data ?? res.data;
      setProducts(Array.isArray(data?.items ?? data) ? (data?.items ?? data) : []);
      if (data?.total !== undefined) {
        setPagination((p) => ({ ...p, total: data.total }));
      }
    } catch (err) {
      setError('Unable to load products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterCategory, sortBy, sortOrder]);

  // ── Fetch categorys ───────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.getAll();
      const data = res.data?.data ?? res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreate = () => { setSelectedProduct(null); setShowProductModal(true); };
  const handleEdit   = (product) => { setSelectedProduct(product); setShowProductModal(true); };
  const handleDelete = (product) => { setProductToDelete(product); setShowDeleteModal(true); };

  const handleModalClose = () => { setShowProductModal(false); setSelectedProduct(null); };
  const handleModalSaved = () => { handleModalClose(); fetchProducts(); };

  const handleDeleteConfirmed = async () => {
    if (!productToDelete) return;
    try {
      await productsAPI.delete(productToDelete.slug);
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error('Error suppression:', err);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortOrder('asc'); }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleFilterCategory = (slug) => {
    setFilterCategory(slug);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            SaaS Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total > 0
              ? `${pagination.total} product${pagination.total > 1 ? 's' : ''} in total`
              : 'Service catalog management'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Gérer categorys */}
          <button
            onClick={() => setShowCategoryManager(true)}
            className="
              flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-400
              hover:border-indigo-400 dark:hover:border-indigo-500
              hover:text-indigo-600 dark:hover:text-indigo-400
              transition-all duration-200 shadow-sm
            "
          >
            Categories
          </button>

          {/* Refresh */}
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="
              flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-400
              hover:border-indigo-400 dark:hover:border-indigo-500
              hover:text-indigo-600 dark:hover:text-indigo-400
              disabled:opacity-50 transition-all duration-200 shadow-sm
            "
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Add product */}
          <button
            onClick={handleCreate}
            className="
              flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium
              bg-indigo-500 hover:bg-indigo-600
              text-white transition-all duration-200 shadow-sm
            "
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* ── Products table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <ProductTable
          products={products}
          categories={categories}
          loading={loading}
          pagination={pagination}
          search={search}
          filterCategory={filterCategory}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearch={handleSearch}
          onFilterCategory={handleFilterCategory}
          onSort={handleSort}
          onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* ── Modal Création / Édition ── */}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={handleModalClose}
          onSaved={handleModalSaved}
        />
      )}

      {/* ── Modal Suppression ── */}
      {showDeleteModal && (
        <ProductDeleteModal
          product={productToDelete}
          onClose={() => { setShowDeleteModal(false); setProductToDelete(null); }}
          onConfirm={handleDeleteConfirmed}
        />
      )}

      {/* ── Modal Categories ── */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategoryManager(false)}
          onSaved={() => { fetchCategories(); }}
        />
      )}
    </div>
  );
}
