import { DEFAULT_PRODUCT_IMAGE, buildImageUrl, categoriesAPI, getProductImage, productsAPI } from "@/services/api";
import { notify } from "@/components/ui/feedback";
import { ArrowLeft, CheckCircle2, ChevronDown, Filter, Package, ShoppingBag, Star, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

const ProductCard = ({ product, onAddToCart }) => {
  const [imgErr, setImgErr] = useState(false);
  const img = imgErr ? DEFAULT_PRODUCT_IMAGE : getProductImage(product);
  const isOut = product.stock === 0;

  return (
    <div className={`cyna-card overflow-hidden group flex flex-col ${isOut ? "opacity-55" : ""}`}>
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: "1/1", background: "var(--bg-muted)" }}>
        <img
          src={img}
          alt={product.name}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.is_selected && (
          <div className="absolute top-2.5 left-2.5">
            <span className="badge badge-accent gap-1 text-[10px]">
              <Star size={9} fill="currentColor" /> Top
            </span>
          </div>
        )}
        {isOut && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,.45)" }}>
            <span className="badge badge-danger gap-1">
              <XCircle size={12} /> Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <div>
          <h3 className="font-[Kumbh Sans] font-700 text-sm leading-tight line-clamp-2 mb-1" style={{ color: "var(--text-primary)" }}>
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {isOut
            ? <><XCircle size={12} style={{ color: "var(--danger)" }} /><span style={{ color: "var(--danger)" }}>Out of stock</span></>
            : <><CheckCircle2 size={12} style={{ color: "var(--success)" }} /><span style={{ color: "var(--success)" }}>Available</span></>
          }
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
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

          <Link
            to={`/products/${product.slug}`}
            className="btn-ghost py-1.5 px-3 text-xs"
          >
            Details
          </Link>

          <button
            onClick={() => !isOut && onAddToCart(product)}
            disabled={isOut}
            className="btn-primary py-1.5 px-3 text-xs gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <ShoppingBag size={12} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CategoryDetailPage() {
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

        // Endpoint may return products embedded; otherwise derive them from
        // the public ordered list and filter by category.
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
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const ex = cart.find(i => i._id === product._id);
      if (ex) ex.qty = (ex.qty || 1) + 1;
      else cart.push({ ...product, qty: 1, billingPeriod: "monthly" });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      notify.success("Added to cart", product.name);
    } catch {
      notify.error("Cart error", "Could not add this product to your cart.");
    }
  };

  // Sort & Filter logic
  const sortedProducts = [...products]
    .filter(p => showAvail ? p.stock !== 0 : true)
    .sort((a, b) => {
      if (sort === "priority") {
        if (a.stock === 0 && b.stock !== 0) return 1;
        if (b.stock === 0 && a.stock !== 0) return -1;
        return (b.priority ?? 0) - (a.priority ?? 0);
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
            <ArrowLeft size={15} /> All Categories
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
                  <p className="section-label" style={{ marginBottom: 0 }}>Category</p>
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "'Kumbh Sans', sans-serif" }}>
            <strong style={{ color: "var(--text-primary)" }}>{sortedProducts.length}</strong> product{sortedProducts.length !== 1 ? "s" : ""}
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
              <Filter size={12} /> Available only
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-[Kumbh Sans] font-600 border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="priority">Priority</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonProduct key={i} />)}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-16 text-center" style={{ background: "var(--bg-subtle)" }}>
            <Package size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="font-[Kumbh Sans] font-600 mb-1" style={{ color: "var(--text-secondary)" }}>
              No products in this category
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {sortedProducts.map(p => (
              <ProductCard key={p._id ?? p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}