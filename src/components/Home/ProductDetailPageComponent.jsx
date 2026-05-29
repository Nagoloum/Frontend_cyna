import { DEFAULT_PRODUCT_IMAGE, buildImageUrl, getProductImage, productsAPI } from "@/services/api";
import { notify } from "@/components/ui/feedback";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Shield, ShoppingBag, Star, Users, XCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ImageGallery = ({ images }) => {
  const [idx, setIdx] = useState(0);
  const [errored, setErrored] = useState({});
  const urls = (images ?? []).map((i) => buildImageUrl(i)).filter(Boolean);

  if (!urls.length) {
    return (
      <div className="w-full rounded-2xl flex items-center justify-center border border-[var(--border)]"
        style={{ aspectRatio: "4/3", background: "var(--bg-muted)" }}>
        <ShoppingBag size={48} style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  const mainSrc = errored[idx] ? DEFAULT_PRODUCT_IMAGE : urls[idx];

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] mb-3"
        style={{ aspectRatio: "4/3", background: "var(--bg-muted)" }}>
        <img
          src={mainSrc}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setErrored((prev) => ({ ...prev, [idx]: true }))}
        />
        {urls.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => (i - 1 + urls.length) % urls.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] shadow-[var(--shadow-md)]"
              style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setIdx(i => (i + 1) % urls.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] shadow-[var(--shadow-md)]"
              style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((u, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? "border-[var(--accent)]" : "border-[var(--border)] opacity-60 hover:opacity-100"}`}
            >
              <img src={u} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState("monthly");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const FEATURES = [
    { icon: Shield, label: t("product.feat1_label"), desc: t("product.feat1_desc") },
    { icon: Zap,    label: t("product.feat2_label"), desc: t("product.feat2_desc") },
    { icon: Clock,  label: t("product.feat3_label"), desc: t("product.feat3_desc") },
    { icon: Users,  label: t("product.feat4_label"), desc: t("product.feat4_desc") },
  ];

  useEffect(() => {
    setLoading(true);
    productsAPI.getBySlug(slug)
      .then(res => {
        const p = res.data?.data ?? res.data;
        setProduct(p);
        return productsAPI.getAllByOrder();
      })
      .then(res => {
        const all = res.data?.data?.items ?? res.data?.data ?? res.data ?? [];
        setRelated(Array.isArray(all) ? all.filter(p => p.slug !== slug).slice(0, 4) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const ex = cart.find(i => i._id === product._id && i.billingPeriod === billing);
      if (ex) ex.qty = (ex.qty || 1) + qty;
      else cart.push({ ...product, qty, billingPeriod: billing });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      notify.success(t("product.added_notif"), `${product.name} × ${qty}`);
    } catch {
      notify.error(t("product.cart_error"), t("product.cart_error_msg"));
    }
  };

  if (loading) return (
    <div className="cyna-container py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="skeleton w-full rounded-2xl" style={{ aspectRatio: "4/3" }} />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className={`skeleton h-${i === 0 ? 8 : 4} rounded`} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="cyna-container py-24 text-center">
      <p className="font-[Kumbh Sans] font-700 text-lg mb-4" style={{ color: "var(--text-secondary)" }}>
        {t("product.not_found")}
      </p>
      <Link to="/products" className="btn-primary">{t("product.back_to_products")}</Link>
    </div>
  );

  const isOut = product.stock === 0;
  const price = billing === "monthly" ? product.priceMonth : product.priceYear;
  const pricePer = billing === "monthly" ? t("product.per_month") : t("product.per_year");

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)" }}>
      <div className="cyna-container py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8 flex-wrap" style={{ color: "var(--text-muted)", fontFamily: "'Kumbh Sans', sans-serif" }}>
          <Link to="/home" className="hover:text-[var(--accent)] transition-colors">{t("product.breadcrumb_home")}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[var(--accent)] transition-colors">{t("product.breadcrumb_products")}</Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 mb-16">
          <div><ImageGallery images={product.images} /></div>

          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.is_selected && (
                <span className="badge badge-accent gap-1">
                  <Star size={10} fill="currentColor" /> {t("product.top_product")}
                </span>
              )}
              {isOut
                ? <span className="badge badge-danger gap-1"><XCircle size={10} /> {t("product.out_of_stock")}</span>
                : <span className="badge badge-success gap-1"><CheckCircle2 size={10} /> {t("product.available")}</span>
              }
            </div>

            {/* Name */}
            <h1 className="font-[Kumbh Sans] font-800 mb-3 leading-tight" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--text-primary)" }}>
              {product.name}
            </h1>
            {product.service?.name && (
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                {t("product.service_label")} <span style={{ color: "var(--accent)" }}>{product.service.name}</span>
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed mb-6 pb-6" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif", borderBottom: "1px solid var(--border)" }}>
                {product.description}
              </p>
            )}

            {/* Billing toggle */}
            {product.priceYear != null && (
              <div className="mb-6">
                <p className="text-xs font-[Kumbh Sans] font-600 mb-2" style={{ color: "var(--text-muted)" }}>
                  {t("product.billing")}
                </p>
                <div className="inline-flex rounded-xl border border-[var(--border)] p-1" style={{ background: "var(--bg-subtle)" }}>
                  {[
                    { v: "monthly", label: t("product.billing_monthly") },
                    { v: "yearly",  label: t("product.billing_yearly")  },
                  ].map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => setBilling(v)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-[Kumbh Sans] font-600 transition-all ${billing === v ? "text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                      style={billing === v ? { background: "var(--accent)" } : {}}
                    >
                      {label}
                      {v === "yearly" && product.priceMonth && product.priceYear && (
                        <span className="ml-1.5 text-[10px] opacity-80">
                          -{Math.round((1 - product.priceYear / (product.priceMonth * 12)) * 100)}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              {price != null ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-[Kumbh Sans] font-800 text-4xl" style={{ color: "var(--text-primary)" }}>
                    {Number(price).toFixed(2)} €
                  </span>
                  <span className="text-base" style={{ color: "var(--text-muted)" }}>{pricePer}</span>
                </div>
              ) : (
                <p className="font-[Kumbh Sans] font-600 text-lg" style={{ color: "var(--text-muted)" }}>
                  {t("product.price_on_request")}
                </p>
              )}
            </div>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center rounded-xl border border-[var(--border)] overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-lg transition-colors hover:bg-[var(--bg-muted)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  −
                </button>
                <span className="w-10 text-center font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--text-primary)" }}>{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-lg transition-colors hover:bg-[var(--bg-muted)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOut}
                className={`flex-1 btn-primary gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${added ? "bg-[var(--success)] hover:bg-[var(--success)]" : ""}`}
              >
                <ShoppingBag size={18} />
                {isOut
                  ? t("product.service_unavailable")
                  : added
                    ? t("product.added_to_cart")
                    : t("product.subscribe")
                }
              </button>
            </div>

            {added && (
              <Link
                to="/cart"
                className="block text-center text-sm font-[Kumbh Sans] font-600 transition-colors hover:text-[var(--accent-hover)]"
                style={{ color: "var(--accent)" }}
              >
                {t("product.view_cart")}
              </Link>
            )}

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
                    <Icon size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-[Kumbh Sans] font-700" style={{ color: "var(--text-primary)" }}>{label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div className="cyna-divider mb-12" />
            <p className="section-label">{t("product.you_may_also_like")}</p>
            <h2 className="font-[Kumbh Sans] font-800 text-xl mb-6" style={{ color: "var(--text-primary)" }}>
              {t("product.similar_services")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const img = getProductImage(p);
                return (
                  <Link
                    key={p._id}
                    to={`/products/${p.slug}`}
                    className="cyna-card overflow-hidden group block"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="overflow-hidden" style={{ aspectRatio: "1/1", background: "var(--bg-muted)" }}>
                      <img src={img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-[Kumbh Sans] font-700 line-clamp-2 mb-1" style={{ color: "var(--text-primary)" }}>
                        {p.name}
                      </p>
                      {p.priceMonth != null && (
                        <p className="text-xs" style={{ color: "var(--accent)" }}>
                          {Number(p.priceMonth).toFixed(2)} {t("product.per_month_short")}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
