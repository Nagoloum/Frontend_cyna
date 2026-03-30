import { buildImageUrl, categoriesAPI, productsAPI } from "@/services/api";
import { CheckCircle2, ChevronDown, Package, Search, ShoppingBag, SlidersHorizontal, Star, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SkeletonCard = () => (
  <div className="cyna-card overflow-hidden">
    <div className="skeleton w-full" style={{ aspectRatio: "1/1" }} />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="flex justify-between">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-8 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, onAddToCart }) => {
  const [imgErr, setImgErr] = useState(false);
  const img = !imgErr ? buildImageUrl(product.images?.[0]?.path ?? product.images?.[0]) : null;
  const isOut = product.stock === 0;

  return (
    <div className={`cyna-card overflow-hidden group flex flex-col ${isOut ? "opacity-55" : ""}`}>
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: "1/1", background: "var(--bg-muted)" }}>
        {img
          ? <img src={img} alt={product.name} onError={() => setImgErr(true)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} style={{ color: "var(--text-muted)" }} /></div>
        }
        {product.is_selected && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-accent gap-1 text-[10px]">
              <Star size={8} fill="currentColor" /> Top
            </span>
          </div>
        )}
        {isOut && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,.45)" }}>
            <span className="badge badge-danger gap-1">
              <XCircle size={11} /> Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <h3 className="font-[Kumbh Sans] font-700 text-sm leading-tight line-clamp-2" style={{ color: "var(--text-primary)" }}>
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs">
          {isOut
            ? <><XCircle size={12} style={{ color: "var(--danger)" }} /><span style={{ color: "var(--danger)" }}>Out of stock</span></>
            : <><CheckCircle2 size={12} style={{ color: "var(--success)" }} /><span style={{ color: "var(--success)" }}>Available</span></>
          }
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
          <div>
            {product.priceMonth != null && (
              <p className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--text-primary)" }}>
                {Number(product.priceMonth).toFixed(2)} €
                <span className="text-[11px] font-normal ml-1" style={{ color: "var(--text-muted)" }}>/month</span>
              </p>
            )}
            {product.priceYear != null && (
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {Number(product.priceYear).toFixed(2)} €/year
              </p>
            )}
          </div>

          <div className="flex gap-1.5">
            <Link to={`/products/${product.slug}`} className="btn-ghost py-1.5 px-2.5 text-xs">
              View
            </Link>
            <button 
              onClick={() => !isOut && onAddToCart(product)} 
              disabled={isOut}
              className="btn-primary py-1.5 px-2.5 text-xs gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <ShoppingBag size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selCat, setSelCat] = useState("");
  const [sort, setSort] = useState("priority");
  const [showAvail, setShowAvail] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      productsAPI.getAll({ limit: 200 }),
      categoriesAPI.getAll()
    ]).then(([pRes, cRes]) => {
      const pd = pRes.data?.data?.items ?? pRes.data?.data ?? pRes.data ?? [];
      const cd = cRes.data?.data?.items ?? cRes.data?.data ?? cRes.data ?? [];
      setProducts(Array.isArray(pd) ? pd : []);
      setCategories(Array.isArray(cd) ? cd : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const ex = cart.find(i => i._id === product._id);
      if (ex) ex.qty = (ex.qty || 1) + 1;
      else cart.push({ ...product, qty: 1, billingPeriod: "monthly" });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch { /* empty */ }
  };

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchCat = !selCat || p.service?.category?.slug === selCat || p.service?.category === selCat;
      const matchAvail = !showAvail || p.stock !== 0;
      return matchSearch && matchCat && matchAvail;
    })
    .sort((a, b) => {
      if (sort === "priority") {
        if (a.stock === 0 && b.stock !== 0) return 1;
        if (b.stock === 0 && a.stock !== 0) return -1;
        return (b.priority ?? 0) - (a.priority ?? 0);
      }
      if (sort === "price-asc") return (a.priceMonth ?? 0) - (b.priceMonth ?? 0);
      if (sort === "price-desc") return (b.priceMonth ?? 0) - (a.priceMonth ?? 0);
      if (sort === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      return 0;
    });

  const activeFilters = [selCat, showAvail ? "Available only" : ""].filter(Boolean);

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      {/* Hero */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">Catalog</p>
          <h1 className="section-title mb-2">All Products</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
            {products.length} cybersecurity solutions available
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a product..."
                className="w-full pl-10 pr-4 h-11 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all" 
              />
            </div>
            <button 
              onClick={() => setFiltersOpen(v => !v)}
              className={`flex items-center gap-1.5 px-4 h-11 rounded-full border text-sm font-[Kumbh Sans] font-600 transition-all ${filtersOpen ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"}`}
            >
              <SlidersHorizontal size={15} /> Filters 
              {activeFilters.length > 0 && (
                <span className="badge badge-accent text-[10px] px-1.5 py-0.5">{activeFilters.length}</span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div className="mt-4 p-5 rounded-2xl border border-[var(--border)] max-w-2xl" style={{ background: "var(--bg-card)" }}>
              <div className="flex flex-wrap gap-4">
                {/* Category filter */}
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-[Kumbh Sans] font-600 mb-2" style={{ color: "var(--text-muted)" }}>CATEGORY</label>
                  <div className="relative">
                    <select 
                      value={selCat} 
                      onChange={e => setSelCat(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <option value="">All Categories</option>
                      {categories.map(c => (
                        <option key={c._id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Sort */}
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-[Kumbh Sans] font-600 mb-2" style={{ color: "var(--text-muted)" }}>SORT BY</label>
                  <div className="relative">
                    <select 
                      value={sort} 
                      onChange={e => setSort(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <option value="priority">Priority</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Availability toggle */}
                <div className="flex flex-col justify-end">
                  <button 
                    onClick={() => setShowAvail(v => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-[Kumbh Sans] font-600 transition-all ${showAvail ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)]"}`}
                  >
                    <CheckCircle2 size={14} /> Available only
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="cyna-container py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""}
          </p>
          {activeFilters.length > 0 && (
            <button 
              onClick={() => { setSelCat(""); setShowAvail(false); }}
              className="flex items-center gap-1 text-xs text-[var(--danger)] hover:underline"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-16 text-center" style={{ background: "var(--bg-subtle)" }}>
            <Package size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="font-[Kumbh Sans] font-600" style={{ color: "var(--text-secondary)" }}>
              No products found
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(p => (
              <ProductCard key={p._id ?? p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}