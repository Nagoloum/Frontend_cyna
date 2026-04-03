import { buildImageUrl, categoriesAPI } from "@/services/api";
import { ArrowRight, Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SkeletonCard = () => (
  <div className="cyna-card overflow-hidden">
    <div className="skeleton w-full" style={{ aspectRatio: "16/9" }} />
    <div className="p-5 space-y-3">
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  </div>
);

const CategoryCard = ({ cat }) => {
  const img = buildImageUrl(cat.image?.path ?? cat.image);
  return (
    <Link
      to={`/categories/${cat.slug}`}
      className="cyna-card group overflow-hidden flex flex-col"
      style={{ textDecoration: "none" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: "16/9", background: "var(--bg-muted)" }}>
        {img ? (
          <img 
            src={img} 
            alt={cat.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={40} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        {/* Overlay gradient */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, rgba(124,58,237,.65), transparent)" }} 
        />
        <div className="absolute bottom-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-xs font-[Kumbh Sans] font-700 flex items-center gap-1">
            View Products <ArrowRight size={12} />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 
          className="font-[Kumbh Sans] font-700 text-base mb-1.5 group-hover:text-[var(--accent)] transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          {cat.name}
        </h3>
        {cat.description && (
          <p 
            className="text-sm leading-relaxed line-clamp-2 flex-1"
            style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            {cat.description}
          </p>
        )}
        <div 
          className="mt-4 flex items-center gap-1.5 text-xs font-[Kumbh Sans] font-600"
          style={{ color: "var(--accent)" }}
        >
          Explore <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    categoriesAPI.getAllByOrder()
      .then(res => {
        const d = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(d) ? d : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      {/* Hero */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-12 sm:py-16">
          <p className="section-label">Catalog</p>
          <h1 className="section-title mb-3">Our Security Solutions</h1>
          <p 
            className="text-base max-w-xl mb-8" 
            style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            Discover our range of SaaS cybersecurity solutions: SOC, EDR, XDR and more.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search 
              size={16} 
              className="absolute left-4 top-1/2 -translate-y-1/2" 
              style={{ color: "var(--text-muted)" }} 
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter categories..."
              className="w-full pl-10 pr-4 h-11 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="cyna-container py-12 sm:py-16">
        {loading ? (
          <div className="categories-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div 
            className="rounded-2xl border border-dashed border-[var(--border)] p-16 text-center mt-12" 
            style={{ background: "var(--bg-subtle)" }}
          >
            <Layers size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p 
              className="font-[Kumbh Sans] font-600 mb-1" 
              style={{ color: "var(--text-secondary)" }}
            >
              No categories found
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="categories-grid">
            {filtered.map(cat => (
              <CategoryCard key={cat._id ?? cat.slug} cat={cat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}