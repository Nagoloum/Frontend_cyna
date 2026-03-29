import * as React from "react";
import { Link } from "react-router-dom";
import { productsAPI, buildImageUrl } from "@/services/api";
import { ShoppingBag, Package, ArrowRight, CheckCircle2, XCircle, Star } from "lucide-react";

const SkeletonCard = () => (
  <div className="cyna-card overflow-hidden">
    <div className="skeleton w-full" style={{ aspectRatio: "1/1" }} />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, onAddToCart }) => {
  const [imgErr, setImgErr] = React.useState(false);
  const images = product.images ?? [];
  const firstImg = images[0];
  const imageUrl = !imgErr ? buildImageUrl(firstImg?.path ?? firstImg) : null;
  const isOut = product.stock === 0;
  const priceMonth = product.priceMonth ?? product.price;
  const priceYear = product.priceYear;

  return (
    <div className={`cyna-card overflow-hidden group flex flex-col ${isOut ? "opacity-60" : ""}`}>
      {/* Image */}
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
        {/* Selected badge */}
        {product.is_selected && (
          <div className="absolute top-2.5 left-2.5">
            <span className="badge badge-accent gap-1 text-[10px]">
              <Star size={9} fill="currentColor" /> Top
            </span>
          </div>
        )}
        {isOut && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,.45)" }}
          >
            <span className="badge badge-danger gap-1">
              <XCircle size={12} /> Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3
            className="font-[Syne] font-700 text-sm leading-tight line-clamp-2 mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {product.name}
          </h3>
          {product.service?.name && (
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {product.service.name}
            </p>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {isOut ? (
            <><XCircle size={13} style={{ color: "var(--danger)" }} />
            <span style={{ color: "var(--danger)" }}>Out of stock</span></>
          ) : (
            <><CheckCircle2 size={13} style={{ color: "var(--success)" }} />
            <span style={{ color: "var(--success)" }}>Available immediately</span></>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            {priceMonth != null && (
              <p className="font-[Syne] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                {Number(priceMonth).toFixed(2)} €
                <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>/month</span>
              </p>
            )}
            {priceYear != null && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                or {Number(priceYear).toFixed(2)} €/year
              </p>
            )}
          </div>
          <button
            onClick={() => !isOut && onAddToCart(product)}
            disabled={isOut}
            className="btn-primary py-2 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <ShoppingBag size={13} />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TopProducts() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    productsAPI.getAllByOrder()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setProducts(Array.isArray(data) ? data.slice(0, 8) : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((i) => i._id === product._id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({ ...product, qty: 1, billingPeriod: "monthly" });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch { /* empty */ }
  };

  return (
    <section className="py-14 sm:py-16" style={{ background: "var(--bg-subtle)" }}>
      <div className="cyna-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label">Selection</p>
            <h2 className="section-title">Top Products Right Now</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>
              The most popular solutions among our customers
            </p>
          </div>
          <Link to="/products" className="btn-ghost py-2 px-4 text-sm hidden sm:inline-flex gap-2">
            All Products <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center"
            style={{ background: "var(--bg-base)" }}
          >
            <Package size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              No products available
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link to="/products" className="btn-ghost gap-2 w-full justify-center">
            All Products <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}