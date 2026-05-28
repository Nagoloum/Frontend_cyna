import { DEFAULT_PRODUCT_IMAGE, getProductImage, productsAPI } from "@/services/api";
import { notify } from "@/components/ui/feedback";
import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import { ArrowRight, CheckCircle2, Package, ShoppingBag, Star, XCircle } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [imgErr, setImgErr] = React.useState(false);
  const imageUrl = imgErr ? DEFAULT_PRODUCT_IMAGE : getProductImage(product);
  const isOut = product.stock === 0;
  const priceMonth = product.priceMonth ?? product.price;
  const priceYear = product.priceYear;

  return (
    <div className={`cyna-card overflow-hidden group flex flex-col ${isOut ? "opacity-60" : ""}`}>
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: "1/1", background: "var(--bg-muted)" }}
      >
        <img
          src={imageUrl}
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
              <XCircle size={12} /> {t("topProducts.out_of_stock")}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-[Kumbh Sans] font-700 text-sm leading-tight line-clamp-2 mb-1" style={{ color: "var(--text-primary)" }}>
            {product.name}
          </h3>
          {product.service?.name && (
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{product.service.name}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "'Kumbh Sans', sans-serif" }}>
          {isOut ? (
            <><XCircle size={13} style={{ color: "var(--danger)" }} /><span style={{ color: "var(--danger)" }}>{t("topProducts.out_of_stock_label")}</span></>
          ) : (
            <><CheckCircle2 size={13} style={{ color: "var(--success)" }} /><span style={{ color: "var(--success)" }}>{t("topProducts.available")}</span></>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            {priceMonth != null && (
              <p className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                {Number(priceMonth).toFixed(2)} €
                <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>{t("topProducts.per_month")}</span>
              </p>
            )}
            {priceYear != null && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("topProducts.or_per_year", { price: Number(priceYear).toFixed(2) })}
              </p>
            )}
          </div>
          <button
            onClick={() => !isOut && onAddToCart(product)}
            disabled={isOut}
            className="btn-primary py-2 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <ShoppingBag size={13} />
            <span className="hidden sm:inline">{t("topProducts.add_to_cart")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TopProducts() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
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
      dispatch(addToCart({ ...product, qty: 1, billingPeriod: "monthly" }));
      notify.success(t("topProducts.added_to_cart"), product.name);
    } catch {
      notify.error(t("topProducts.cart_error"), t("topProducts.cart_error_msg"));
    }
  };

  return (
    <section className="py-14 sm:py-16" style={{ background: "var(--bg-subtle)" }}>
      <div className="cyna-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label">{t("topProducts.badge")}</p>
            <h2 className="section-title">{t("topProducts.title")}</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
              {t("topProducts.popular")}
            </p>
          </div>
          <Link to="/products" className="btn-ghost py-2 px-4 text-sm hidden sm:inline-flex gap-2">
            {t("topProducts.all_products")} <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center" style={{ background: "var(--bg-base)" }}>
            <Package size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>{t("topProducts.empty")}</p>
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
            {t("topProducts.all_products")} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
