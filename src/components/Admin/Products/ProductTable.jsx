// src/components/admin/products/ProductTable.jsx
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Edit2, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

const COLUMNS = [
  { key: 'name',      label: 'Product',    sortable: true  },
  { key: 'category',  label: 'Category',  sortable: true  },
  { key: 'price',     label: 'Price',       sortable: true  },
  { key: 'isActive',  label: 'Status',     sortable: false },
  { key: 'createdAt', label: 'Created',    sortable: true  },
  { key: 'actions',   label: '',           sortable: false },
];

function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600" />;
  return sortOrder === 'asc'
    ? <ChevronUp size={13} className="text-indigo-500" />
    : <ChevronDown size={13} className="text-indigo-500" />;
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function ProductTable({
  products = [], categories = [], loading = false,
  pagination, search, filterCategory, sortBy, sortOrder,
  onSearch, onFilterCategory, onSort, onPageChange, onEdit, onDelete,
}) {
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const formatPrice = (p) =>
    p !== undefined && p !== null
      ? `${Number(p).toLocaleString('en-US', { minimumFractionDigits: 2 })} €`
      : '—';

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      {/* ── Barre filtres ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700/60">
        {/* Recherche */}
        <div className="relative flex items-center flex-1 min-w-0 max-w-sm">
          <Search size={14} className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search a product…"
            className="
              w-full h-9 pl-9 pr-3 rounded-xl text-sm
              bg-gray-50 dark:bg-gray-700/60
              border border-gray-200 dark:border-gray-600
              text-gray-700 dark:text-gray-300
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              focus:border-indigo-400 dark:focus:border-indigo-500
              transition-all duration-200
            "
          />
        </div>

        {/* Filtre category */}
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategory(e.target.value)}
          className="
            h-9 px-3 rounded-xl text-sm
            bg-gray-50 dark:bg-gray-700/60
            border border-gray-200 dark:border-gray-600
            text-gray-700 dark:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            focus:border-indigo-400 dark:focus:border-indigo-500
            transition-all duration-200
          "
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>

        {/* Compteur results */}
        {!loading && (
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
            {pagination.total} result{pagination.total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700/60">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                    text-gray-500 dark:text-gray-400
                    ${col.sortable ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none' : ''}
                    transition-colors duration-150
                  `}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} sortBy={sortBy} sortOrder={sortOrder} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : products.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <Package size={36} className="opacity-30" />
                      <p className="text-sm font-medium">No products found</p>
                      {search && (
                        <p className="text-xs">Try a different search term</p>
                      )}
                    </div>
                  </td>
                </tr>
              )
              : products.map((product) => (
                <tr
                  key={product.slug}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-100 group"
                >
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail ou placeholder */}
                      <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={15} className="text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    {product.category ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {product.category?.name ?? product.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.billingPeriod && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                        /{product.billingPeriod}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={product.isActive !== false ? 'active' : 'inactive'}
                    />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDate(product.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 justify-end">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-150"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700/60">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {pagination.page} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isNear = Math.abs(page - pagination.page) <= 1 || page === 1 || page === totalPages;
              if (!isNear) {
                if (page === 2 || page === totalPages - 1) return <span key={page} className="text-gray-400 px-1 text-xs">…</span>;
                return null;
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`
                    w-7 h-7 rounded-lg text-xs font-medium transition-all duration-150
                    ${pagination.page === page
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
