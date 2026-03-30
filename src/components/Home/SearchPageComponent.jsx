import { buildImageUrl, categoriesAPI, extractList, searchAPI, servicesAPI } from "@/services/api";
import {
  CheckCircle2, ChevronDown, Filter, Package,
  Search, SlidersHorizontal, X, XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (n) =>
  n !== undefined && n !== null
    ? `${Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`
    : null;

// ── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const [imgErr, setImgErr] = useState(false);
  const images = product.images ?? [];
  const firstImg = images[0];
  const imageUrl = !imgErr ? buildImageUrl(firstImg?.path ?? firstImg) : null;
  const isOut = product.stock === 0;
  const priceMonth = product.priceMonth ?? product.price;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={`cyna-card overflow-hidden group flex flex-col ${isOut ? "opacity-60" : ""}`}
      style={{ textDecoration: "none" }}
    >
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: "1/1", background: "var(--bg-muted)" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        {isOut && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,.45)" }}
          >
            <span className="text-white font-semibold text-xs px-3 py-1 rounded-full bg-red-500/80">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-[Kumbh Sans] font-semibold text-sm leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          {product.name}
        </h3>
        {product.service?.name && (
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            {product.service.name}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <div>
            {priceMonth ? (
              <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>
                {fmtPrice(priceMonth)}<span className="text-xs font-normal text-[var(--text-muted)]">/mo</span>
              </span>
            ) : (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Price on request</span>
            )}
          </div>
          {isOut ? (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <XCircle size={12} /> Out of stock
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <CheckCircle2 size={12} /> Available
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="cyna-card overflow-hidden">
    <div className="skeleton w-full" style={{ aspectRatio: "1/1" }} />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  </div>
);

// ── Range input ──────────────────────────────────────────────────────────────
function PriceRange({ min, max, onChange }) {
  const [localMin, setLocalMin] = useState(min ?? "");
  const [localMax, setLocalMax] = useState(max ?? "");
  const t = useRef(null);

  const commit = (newMin, newMax) => {
    clearTimeout(t.current);
    t.current = setTimeout(() => {
      onChange(
        newMin !== "" ? Number(newMin) : undefined,
        newMax !== "" ? Number(newMax) : undefined,
      );
    }, 600);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        placeholder="Min €"
        value={localMin}
        onChange={(e) => { setLocalMin(e.target.value); commit(e.target.value, localMax); }}
        className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
      />
      <span className="text-[var(--text-muted)] text-xs flex-shrink-0">—</span>
      <input
        type="number"
        min="0"
        placeholder="Max €"
        value={localMax}
        onChange={(e) => { setLocalMax(e.target.value); commit(localMin, e.target.value); }}
        className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [urlParams, setUrlParams] = useSearchParams();
  const q = urlParams.get("q") || "";

  // Local query (controlled input, not committed yet)
  const [query, setQuery] = useState(q);

  // Filter state
  const [minPrice, setMinPrice]           = useState(undefined);
  const [maxPrice, setMaxPrice]           = useState(undefined);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy]               = useState("");
  const [sortOrder, setSortOrder]         = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService]   = useState("");

  // Filter panel visibility (mobile)
  const [showFilters, setShowFilters] = useState(false);

  // Data
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const LIMIT = 12;

  // Metadata for filter dropdowns
  const [categories, setCategories] = useState([]);
  const [services, setServices]     = useState([]);

  // Load categories + services for filter dropdowns
  useEffect(() => {
    categoriesAPI.getAllByOrder()
      .then((r) => setCategories(extractList(r.data)))
      .catch(() => {});
    servicesAPI.getAll()
      .then((r) => setServices(extractList(r.data)))
      .catch(() => {});
  }, []);

  // Execute search whenever any filter changes
  useEffect(() => {
    if (!q && !selectedCategory && !selectedService && minPrice === undefined && maxPrice === undefined) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);

    const params = {
      ...(q                              && { text: q }),
      ...(selectedCategory               && { categories: [selectedCategory] }),
      ...(selectedService                && { services:   [selectedService]  }),
      ...(minPrice !== undefined         && { minPrice }),
      ...(maxPrice !== undefined         && { maxPrice }),
      ...(onlyAvailable                  && { onlyAvailable: true }),
      ...(sortBy                         && { sortBy }),
      sortOrder,
      page,
      limit: LIMIT,
    };

    searchAPI
      .search(params)
      .then((res) => {
        const data  = res.data?.data ?? res.data ?? {};
        const items = data?.items ?? data?.data ?? data ?? [];
        setResults(Array.isArray(items) ? items : []);
        setTotal(data?.total ?? (Array.isArray(items) ? items.length : 0));
      })
      .catch(() => { setResults([]); setTotal(0); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, selectedCategory, selectedService, minPrice, maxPrice, onlyAvailable, sortBy, sortOrder, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setUrlParams({ q: query });
  };

  const clearFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setOnlyAvailable(false);
    setSortBy("");
    setSortOrder("asc");
    setSelectedCategory("");
    setSelectedService("");
    setPage(1);
  };

  const hasActiveFilters =
    minPrice !== undefined || maxPrice !== undefined || onlyAvailable ||
    sortBy || selectedCategory || selectedService;

  const totalPages = Math.ceil(total / LIMIT) || 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>

      {/* Header / search bar */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10">
          <p className="section-label mt-5">Search</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a solution..."
                className="w-full pl-10 pr-4 h-12 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>
          {(q || hasActiveFilters) && (
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
              {loading ? "Searching…" : (
                <>
                  <strong style={{ color: "var(--text-primary)" }}>{total}</strong> result{total !== 1 ? "s" : ""}
                  {q && <> for «&nbsp;<strong style={{ color: "var(--text-primary)" }}>{q}</strong>&nbsp;»</>}
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="cyna-container py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar filters (desktop) / collapse (mobile) ── */}
          <aside className="lg:w-60 flex-shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="lg:hidden flex items-center gap-2 mb-4 h-9 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] w-full justify-between"
            >
              <span className="flex items-center gap-2"><SlidersHorizontal size={14} /> Filters</span>
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className={`space-y-5 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div className="cyna-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    <Filter size={11} className="inline mr-1" />Filters
                  </span>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-500 transition-colors">
                      <X size={11} /> Reset
                    </button>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c._id ?? c.slug} value={c._id ?? c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Service type</label>
                  <select
                    value={selectedService}
                    onChange={(e) => { setSelectedService(e.target.value); setPage(1); }}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                  >
                    <option value="">All services</option>
                    {services.map((s) => (
                      <option key={s._id ?? s.slug} value={s._id ?? s.slug}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Price / month (€)</label>
                  <PriceRange
                    min={minPrice}
                    max={maxPrice}
                    onChange={(mn, mx) => { setMinPrice(mn); setMaxPrice(mx); setPage(1); }}
                  />
                </div>

                {/* Only available */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => { setOnlyAvailable(e.target.checked); setPage(1); }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4 transition-colors duration-200" />
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>Available only</span>
                </label>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Sort by</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                      className="flex-1 h-9 px-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                    >
                      <option value="">Default</option>
                      <option value="prix">Price</option>
                      <option value="nouveauté">Newest</option>
                      <option value="disponibilité">Availability</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
                      className="w-20 h-9 px-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                    >
                      <option value="asc">↑ Asc</option>
                      <option value="desc">↓ Desc</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {!q && !hasActiveFilters ? (
              <div
                className="rounded-2xl border border-dashed border-[var(--border)] p-16 text-center"
                style={{ background: "var(--bg-subtle)" }}
              >
                <Search size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                  Enter a search term or select a filter
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Find the right cybersecurity solution for your business
                </p>
              </div>
            ) : loading ? (
              <div className="products-grid">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed border-[var(--border)] p-16 text-center"
                style={{ background: "var(--bg-subtle)" }}
              >
                <Package size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                  No results found
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-3 btn-ghost text-xs gap-1">
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {results.map((p) => (
                    <ProductCard key={p._id ?? p.slug} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="h-9 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] disabled:opacity-30 hover:border-[var(--accent)] transition-all"
                    >
                      ← Prev
                    </button>
                    <span className="text-sm px-2" style={{ color: "var(--text-muted)" }}>
                      Page {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="h-9 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] disabled:opacity-30 hover:border-[var(--accent)] transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
