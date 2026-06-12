import { buildImageUrl, categoriesAPI, productsAPI } from "@/services/api";
import { notify } from "@/components/ui/feedback";
import { ArrowLeft, Filter, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import Card from "@/components/ui/Card";

const SkeletonProduct = () => (
  <div className="cyna-card overflow-hidden">
    <div className="skeleton w-full" style={{ aspectRatio: "1/1" }} />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="flex justify-between items-center">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

export default function CategoryDetailPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("priority");
  const [showAvail, setShowAvail] = useState(false);

  useEffect(() => {
    setLoading(true);
    categoriesAPI.getBySlugForUser(slug)
      .then((catRes) => {
        const payload = catRes.data?.data ?? catRes.data ?? {};
        const cat = payload.category ?? payload;
        setCategory(cat);

        const embedded = payload.products ?? cat?.products ?? null;
        if (Array.isArray(embedded) && embedded.length > 0) {
          setProducts(embedded);
          return;
        }
        return productsAPI.getAllByOrder().then((prodRes) => {
          const all = prodRes.data?.data?.items ?? prodRes.data?.data ?? prodRes.data ?? [];
          const arr = Array.isArray(all) ? all : [];
          const catProds = arr.filter(p =>
            p.service?.category?.slug === slug ||
            p.service?.category === cat?._id ||
            p.categorySlug === slug
          );
          setProducts(catProds);
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = (product) => {
    try {
      dispatch(addToCart({ ...product, qty: 1, billingPeriod: "monthly" }));
      notify.success(t("categoryDetail.added_to_cart"), product.name);
    } catch {
      notify.error(t("categoryDetail.cart_error"), t("categoryDetail.cart_error_msg"));
    }
  };

  const sortedProducts = [...products]
    .filter(p => showAvail ? p.stock !== 0 : true)
    .sort((a, b) => {
      if (sort === "priority") {
        if (a.stock === 0 && b.stock !== 0) return 1;
        if (b.stock === 0 && a.stock !== 0) return -1;
        return (b.is_selected ? 1 : 0) - (a.is_selected ? 1 : 0);
      }
      if (sort === "price-asc") return (a.priceMonth ?? 0) - (b.priceMonth ?? 0);
      if (sort === "price-desc") return (b.priceMonth ?? 0) - (a.priceMonth ?? 0);
      return 0;
    });

  const catImg = buildImageUrl(category?.image?.path ?? category?.image);

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      {/* Category hero */}
      <div className="relative overflow-hidden" style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        {catImg && (
          <img
            src={catImg}
            alt={category?.name}
            className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-5"
          />
        )}
        <div className="relative cyna-container py-10 sm:py-14">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm mb-6 hover:text-[var(--accent)] transition-colors"
            style={{ color: "var(--text-muted)", fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            <ArrowLeft size={15} /> {t("categoryDetail.all_categories")}
          </Link>

          {loading && !category ? (
            <div>
              <div className="skeleton h-8 w-48 rounded mb-3" />
              <div className="skeleton h-4 w-96 rounded" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {catImg && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border)] flex-shrink-0 shadow-[var(--shadow-md)]">
                  <img src={catImg} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="section-label" style={{ marginBottom: 0 }}>{t("categoryDetail.badge")}</p>
                </div>
                <h1 className="font-[Kumbh Sans] font-800 text-2xl sm:text-3xl" style={{ color: "var(--text-primary)" }}>
                  {category?.name ?? slug}
                </h1>
                {category?.description && (
                  <p className="mt-2 text-sm max-w-2xl" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters + grid */}
      <div className="cyna-container py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-6">
          <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "'Kumbh Sans', sans-serif" }}>
            {sortedProducts.length <= 1
              ? t("categoryDetail.count", { count: sortedProducts.length })
              : t("categoryDetail.count_plural", { count: sortedProducts.length })}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Available filter */}
            <button
              onClick={() => setShowAvail(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[Kumbh Sans] font-600 border transition-all ${showAvail
                ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                }`}
            >
              <Filter size={12} /> {t("categoryDetail.available_only")}
            </button>

            {/* Sort */}
            <div className="w-44">
              <Select size="sm" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="priority">{t("categoryDetail.sort_priority")}</option>
                <option value="price-asc">{t("categoryDetail.sort_price_asc")}</option>
                <option value="price-desc">{t("categoryDetail.sort_price_desc")}</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="products-grid mb-6 lg:mb-10">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonProduct key={i} />)}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-2xl mb-6 lg:mb-10 border border-dashed border-[var(--border)] p-16 text-center" style={{ background: "var(--bg-subtle)" }}>
            <Package size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="font-[Kumbh Sans] font-600 mb-1" style={{ color: "var(--text-secondary)" }}>
              {t("categoryDetail.empty")}
            </p>
          </div>
        ) : (
          <div className="products-grid mb-6 lg:mb-10">
            {sortedProducts.map(p => (
              <Card key={p._id ?? p.id} variant="product" item={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
