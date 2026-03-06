// src/pages/admin/ProductsPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, FolderOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductTable from '../../components/admin/products/ProductTable';
import ProductModal from '../../components/admin/products/ProductModal';
import ProductDeleteModal from '../../components/admin/products/ProductDeleteModal';
import CategoryManager from '../../components/admin/products/CategoryManager';
import { productsAPI, categoriesAPI, servicesAPI } from '../../services/api';

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0 };

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [search, setSearch]         = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy]         = useState('createdAt');
  const [sortOrder, setSortOrder]   = useState('desc');

  // Modals
  const [showCreate, setShowCreate]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showCategories, setShowCategories] = useState(false);

  const searchTimeout = useRef(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: opts.page ?? pagination.page,
        limit: pagination.limit,
        sortBy: opts.sortBy ?? sortBy,
        order: opts.sortOrder ?? sortOrder,
        ...(opts.search ?? search ? { search: opts.search ?? search } : {}),
        ...(opts.filterCategory ?? filterCategory ? { categorySlug: opts.filterCategory ?? filterCategory } : {}),
      };
      const res = await productsAPI.getAll(params);
      const d = res.data;
      const inner = d?.data ?? d;
      const items = Array.isArray(inner?.items) ? inner.items
                  : Array.isArray(inner?.data)  ? inner.data
                  : Array.isArray(inner)         ? inner
                  : [];
      const total = d?.data?.total ?? d?.total ?? items.length;
      setProducts(items);
      setPagination((prev) => ({ ...prev, page: params.page, total }));
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterCategory, sortBy, sortOrder]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.getAll();
      const d = res.data;
      const inner = d?.data ?? d;
      const arr   = inner?.items ?? inner?.data ?? inner;
      setCategories(Array.isArray(arr) ? arr : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const res = await servicesAPI.getAll();
      const d = res.data;
      const si = d?.data ?? d;
      const sa = si?.items ?? si?.data ?? si;
      setServices(Array.isArray(sa) ? sa : []);
    } catch {
      setServices([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [fetchCategories, fetchServices]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open create modal if URL has ?action=create
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowCreate(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (value) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts({ search: value, page: 1 });
    }, 400);
  };

  const handleFilterCategory = (slug) => {
    setFilterCategory(slug);
    fetchProducts({ filterCategory: slug, page: 1 });
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    fetchProducts({ sortBy: field, sortOrder: newOrder, page: 1 });
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchProducts({ page });
  };

  const handleSaved = () => {
    setShowCreate(false);
    setEditProduct(null);
    fetchProducts({ page: 1 });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;
    await productsAPI.delete(deleteProduct.slug);
    setDeleteProduct(null);
    fetchProducts({ page: pagination.page });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your SaaS catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm"
          >
            <FolderOpen size={14} />
            <span className="hidden sm:inline">Categories</span>
          </button>
          <button
            onClick={() => fetchProducts()}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 disabled:opacity-50 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-sm"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => fetchProducts()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Table */}
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
          onPageChange={handlePageChange}
          onEdit={setEditProduct}
          onDelete={setDeleteProduct}
        />
      </div>

      {/* Modals */}
      {(showCreate || editProduct) && (
        <ProductModal
          product={editProduct}
          categories={categories}
          services={services}
          onClose={() => { setShowCreate(false); setEditProduct(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteProduct && (
        <ProductDeleteModal
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {showCategories && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategories(false)}
          onSaved={fetchCategories}
        />
      )}
    </div>
  );
}