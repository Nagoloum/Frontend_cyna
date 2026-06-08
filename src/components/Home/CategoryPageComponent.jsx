import { categoriesAPI } from "@/services/api";
import { Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";

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

export default function CategoriesPage() {
  const { t } = useTranslation();
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
          <p className="section-label">{t("categories.badge")}</p>
          <h1 className="section-title mb-3">{t("categories.title")}</h1>
          <p
            className="text-base max-w-xl mb-8"
            style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            {t("categories.subtitle")}
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
              placeholder={t("categories.search_placeholder")}
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
              {t("categories.empty")}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("categories.empty_hint")}
            </p>
          </div>
        ) : (
          <div className="categories-grid">
            {filtered.map(cat => (
              <Card key={cat._id ?? cat.slug} variant="category" item={cat} aspectRatio="16 / 9" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
