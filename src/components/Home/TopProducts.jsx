import { DEFAULT_PRODUCT_IMAGE, getProductImage, productsAPI } from "@/services/api";
import { notify } from "@/components/ui/feedback";
import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Package, ShoppingBag, Star, XCircle } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const SkeletonCard = () => (
  <div className="cyna-card overflow-hidden">
    <div className="skeleton w-full" style={{ aspectRatio: "1/1" }} />
    <div className="p-3 sm:p-4 space-y-3">
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-8 w-16 rounded-lg" />
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
          <div className="absolute top-2 left-2">
            <span className="badge badge-accent gap-1 text-[9px] sm:text-[10px]">
              <Star size={8} fill="currentColor" /> Top
            </span>
          </div>
        )}
        {isOut && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,.45)" }}>
            <span className="badge badge-danger gap-1 text-[10px]">
              <XCircle size={11} /> {t("topProducts.out_of_stock")}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 sm:gap-3">
        <div>
          <h3
            className="font-[Kumbh Sans] font-700 text-xs sm:text-sm leading-tight line-clamp-2 mb-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            {product.name}
          </h3>
          {product.service?.name && (
            <p className="text-[10px] sm:text-[11px]" style={{ color: "var(--text-muted)" }}>
              {product.service.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ fontFamily: "'Kumbh Sans', sans-serif" }}>
          {isOut ? (
            <><XCircle size={11} style={{ color: "var(--danger)" }} /><span style={{ color: "var(--danger)" }}>{t("topProducts.out_of_stock_label")}</span></>
          ) : (
            <><CheckCircle2 size={11} style={{ color: "var(--success)" }} /><span style={{ color: "var(--success)" }}>{t("topProducts.available")}</span></>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            {priceMonth != null && (
              <p className="font-[Kumbh Sans] font-700 text-sm sm:text-base leading-tight" style={{ color: "var(--text-primary)" }}>
                {Number(priceMonth).toFixed(2)} €
                <span className="text-[10px] sm:text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                  {t("topProducts.per_month")}
                </span>
              </p>
            )}
            {priceYear != null && (
              <p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {t("topProducts.or_per_year", { price: Number(priceYear).toFixed(2) })}
              </p>
            )}
          </div>
          <button
            onClick={() => !isOut && onAddToCart(product)}
            disabled={isOut}
            className="btn-primary py-1.5 px-2 sm:py-2 sm:px-3 text-[10px] sm:text-xs gap-1 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <ShoppingBag size={11} />
            <span>{t("topProducts.add_to_cart")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95"
    style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
  >
    {children}
  </button>
);

export default function TopProducts() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [carouselApi, setCarouselApi] = React.useState(null);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    productsAPI.getAllByOrder()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setProducts(Array.isArray(data) ? data.slice(0, 8) : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!carouselApi) return;
    setCurrent(carouselApi.selectedScrollSnap());
    const onSelect = () => setCurrent(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const handleAddToCart = (product) => {
    try {
      dispatch(addToCart({ ...product, qty: 1, billingPeriod: "monthly" }));
      notify.success(t("topProducts.added_to_cart"), product.name);
    } catch {
      notify.error(t("topProducts.cart_error"), t("topProducts.cart_error_msg"));
    }
  };

  return (
    <section className="py-10 sm:py-16" style={{ background: "var(--bg-subtle)" }}>
      <div className="cyna-container">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 sm:mb-8">
          <div>
            <p className="section-label">{t("topProducts.badge")}</p>
            <h2 className="section-title">{t("topProducts.title")}</h2>
            <p className="mt-1.5 text-xs sm:text-sm" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
              {t("topProducts.popular")}
            </p>
          </div>
          <Link to="/products" className="btn-ghost py-2 px-4 text-sm hidden sm:inline-flex gap-2 shrink-0">
            {t("topProducts.all_products")} <ArrowRight size={15} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <>
            <div className="sm:hidden overflow-hidden -mx-4">
              <div className="flex gap-3 pl-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-[65%]"><SkeletonCard /></div>
                ))}
              </div>
            </div>
            <div className="hidden sm:grid products-grid">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div
            className="rounded-2xl border border-dashed border-[var(--border)] p-6 sm:p-12 text-center"
            style={{ background: "var(--bg-base)" }}
          >
            <Package size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              {t("topProducts.empty")}
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && products.length > 0 && (
          <>
            {/* ── Mobile: horizontal carousel ── */}
            <div className="sm:hidden overflow-hidden -mx-4">
              <Carousel
                setApi={setCarouselApi}
                opts={{ align: "start", dragFree: false }}
                className="w-full"
              >
                <CarouselContent className="ml-4">
                  {products.map((p) => (
                    <CarouselItem
                      key={p._id || p.id}
                      className="basis-[65%] pr-3"
                    >
                      <ProductCard product={p} onAddToCart={handleAddToCart} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Arrows + dots */}
              <div className="flex items-center justify-between px-4 mt-4">
                <div className="flex gap-2">
                  <NavButton onClick={() => carouselApi?.scrollPrev()}>
                    <ChevronLeft size={15} />
                  </NavButton>
                  <NavButton onClick={() => carouselApi?.scrollNext()}>
                    <ChevronRight size={15} />
                  </NavButton>
                </div>
                <div className="flex items-center gap-1.5">
                  {products.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => carouselApi?.scrollTo(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === current ? "20px" : "8px",
                        height: "8px",
                        background: i === current ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Desktop: grid ── */}
            <div className="hidden sm:block">
              <div className="products-grid">
                {products.map((p) => (
                  <ProductCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mobile "voir tout" button */}
        <div className="mt-5 sm:hidden">
          <Link to="/products" className="btn-ghost gap-2 w-full justify-center">
            {t("topProducts.all_products")} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
