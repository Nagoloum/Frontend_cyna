import { buildImageUrl, categoriesAPI } from "@/services/api";
import { ArrowRight, Layers } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

const SkeletonCard = () => (
  <div className="cyna-card p-0 overflow-hidden">
    <div className="skeleton aspect-[4/3] w-full" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  </div>
);

const CategoryCard = ({ category }) => {
  const imageUrl = buildImageUrl(category.image?.path || category.image);
  return (
    <Link
      to={`/categories/${category.slug}`}
      className="cyna-card group overflow-hidden block"
      style={{ textDecoration: "none" }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "4/3", background: "var(--bg-muted)" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={32} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        {/* Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
          style={{ background: "linear-gradient(to top, rgba(124,58,237,.7), transparent)" }}
        >
          <span className="text-white text-xs font-semibold font-[Kumbh Sans] flex items-center gap-1">
            View Products <ArrowRight size={12} />
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3
          className="font-[Kumbh Sans] font-700 text-sm leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          {category.name}
        </h3>
        {category.description && (
          <p
            className="text-xs line-clamp-2 leading-relaxed"
            style={{ color: "var(--text-muted)", fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default function CategoryGrid() {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    categoriesAPI.getAllByOrder()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-14 sm:py-16" style={{ background: "var(--bg-base)" }}>
      <div className="cyna-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label">Catalog</p>
            <h2 className="section-title">Our Solutions</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
              Discover our complete range of cybersecurity solutions
            </p>
          </div>
          <Link
            to="/categories"
            className="btn-ghost py-2 px-4 text-sm hidden sm:inline-flex gap-2"
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="categories-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center"
            style={{ background: "var(--bg-subtle)" }}
          >
            <Layers size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              No categories available
            </p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat._id || cat.id || cat.slug} category={cat} />
            ))}
          </div>
        )}

        {/* Mobile see all */}
        <div className="mt-6 text-center sm:hidden">
          <Link to="/categories" className="btn-ghost gap-2 w-full justify-center">
            View All Solutions <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}