import { categoriesAPI } from "@/services/api";
import { ArrowRight, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Card from "@/components/ui/Card";

const SkeletonCard = () => (
  <div className="cyna-card p-0 overflow-hidden">
    <div className="skeleton aspect-[4/3] w-full" />
    <div className="p-3 sm:p-4 space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  </div>
);

const NavButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95"
    style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
  >
    {children}
  </button>
);

export default function CategoryGrid() {
  const { t } = useTranslation();
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [carouselApi, setCarouselApi] = React.useState(null);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    categoriesAPI.getAllByOrder()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!carouselApi) return;
    setCurrent(carouselApi.selectedScrollSnap());
    const onSelect = () => setCurrent(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  return (
    <section className="py-10 sm:py-16" style={{ background: "var(--bg-base)" }}>
      <div className="cyna-container">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 sm:mb-8">
          <div>
            <p className="section-label">{t("categoryGrid.badge")}</p>
            <h2 className="section-title">{t("categoryGrid.title")}</h2>
            <p className="mt-1.5 text-xs sm:text-sm" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
              {t("categoryGrid.subtitle")}
            </p>
          </div>
          <Link to="/categories" className="btn-ghost py-2 px-4 text-sm hidden sm:inline-flex gap-2 shrink-0">
            {t("categoryGrid.view_all")} <ArrowRight size={15} />
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
            <div className="hidden sm:grid categories-grid">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div
            className="rounded-2xl border border-dashed border-[var(--border)] p-6 sm:p-12 text-center"
            style={{ background: "var(--bg-subtle)" }}
          >
            <Layers size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              {t("categoryGrid.empty")}
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && categories.length > 0 && (
          <>
            {/* ── Mobile: horizontal carousel ── */}
            <div className="sm:hidden overflow-hidden -mx-4">
              <Carousel
                setApi={setCarouselApi}
                opts={{ align: "start", dragFree: false }}
                className="w-full"
              >
                <CarouselContent className="ml-4">
                  {categories.map((cat) => (
                    <CarouselItem
                      key={cat._id || cat.id || cat.slug}
                      className="basis-[65%] pr-3"
                    >
                      <Card variant="category" item={cat} />
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
                  {categories.map((_, i) => (
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
              <div className="categories-grid">
                {categories.map((cat) => (
                  <Card key={cat._id || cat.id || cat.slug} variant="category" item={cat} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mobile "voir tout" button */}
        <div className="mt-5 sm:hidden">
          <Link to="/categories" className="btn-ghost gap-2 w-full justify-center">
            {t("categoryGrid.view_all_solutions")} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
