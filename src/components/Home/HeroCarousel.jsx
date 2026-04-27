import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { buildImageUrl, slidersAPI } from "@/services/api";

const FALLBACK_SLIDES = [
  {
    title: "Next-Generation\nSOC Protection",
    description: "Real-time monitoring, advanced threat detection, and incident response to secure your infrastructure.",
    color: "#7c3aed",
    cta: "Discover the SOC",
    linkUrl: "/categories",
    isFallback: true,
  },
  {
    title: "Endpoint Detection\n& Response",
    description: "Protect every endpoint in your IT environment with our AI-powered EDR solution.",
    color: "#6d28d9",
    cta: "Explore EDR",
    linkUrl: "/categories",
    isFallback: true,
  },
  {
    title: "Extended Detection\n& Response",
    description: "A unified view of all your threats. Intelligent correlation across endpoints, network, and cloud.",
    color: "#5b21b6",
    cta: "See XDR",
    linkUrl: "/categories",
    isFallback: true,
  },
];

const COLORS_CYCLE = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#7e22ce"];

function normaliseSlider(s, idx) {
  return {
    _id:     s._id,
    title:   s.title,
    image:   buildImageUrl(s.image),
    linkUrl: s.linkUrl || null,
    nameUrl: s.NameUrl || s.nameUrl || "Discover",
    order:   s.order ?? idx,
    color:   COLORS_CYCLE[idx % COLORS_CYCLE.length],
    isFallback: false,
  };
}

function DbSlide({ slide }) {
  return (
    <div className="relative py-4 max-h-[420px] sm:min-h-[480px] lg:min-h-[540px] flex items-center overflow-hidden">
      {slide.image && (
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, ${slide.color}ee 0%, ${slide.color}99 40%, transparent 80%), rgba(0,0,0,.35)`,
          zIndex: 1,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          zIndex: 2,
        }}
      />

      <div className="cyna-container relative py-16 sm:py-20" style={{ zIndex: 3 }}>
        <div className="max-w-xl">
          <h1
            className="font-[Kumbh Sans] font-extrabold mb-6 leading-[1.1] text-white"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", whiteSpace: "pre-line" }}
          >
            {slide.title}
          </h1>

          {slide.linkUrl && (
            <Link to={slide.linkUrl} className="btn-primary inline-flex items-center mt-2">
              {slide.nameUrl}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FallbackSlide({ slide }) {
  return (
    <div className="relative py-4 max-h-[420px] sm:min-h-[480px] lg:min-h-[540px] flex items-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${slide.color}22 0%, transparent 70%), var(--bg-subtle)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="cyna-container relative z-10 py-16 sm:py-20">
        <div className="max-w-xl">
          <h1
            className="font-[Kumbh Sans] font-extrabold mb-4 leading-[1.1]"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "var(--text-primary)", whiteSpace: "pre-line" }}
          >
            {slide.title}
          </h1>

          <p
            className="text-base sm:text-lg mb-8 leading-relaxed"
            style={{ color: "var(--text-secondary)", maxWidth: "480px" }}
          >
            {slide.description}
          </p>

          <Link to={slide.linkUrl} className="btn-primary inline-flex items-center">
            {slide.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [api, setApi]         = React.useState();
  const [current, setCurrent] = React.useState(0);
  const [slides, setSlides]   = React.useState([]);
  const [useFallback, setUseFallback] = React.useState(false);
  const plugin = React.useRef(Autoplay({ delay: 5500, stopOnInteraction: true }));

  React.useEffect(() => {
    slidersAPI
      .getTop(5)
      .then((res) => {
        const raw = res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(raw) ? raw : [];
        if (arr.length === 0) {
          setUseFallback(true);
          setSlides(FALLBACK_SLIDES);
        } else {
          setUseFallback(false);
          setSlides(arr.map(normaliseSlider));
        }
      })
      .catch(() => {
        setUseFallback(true);
        setSlides(FALLBACK_SLIDES);
      });
  }, []);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (slides.length === 0) return null;

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={slide._id ?? i}>
              {useFallback ? (
                <FallbackSlide slide={slide} />
              ) : (
                <DbSlide slide={slide} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-6 z-10">
          <button
            onClick={() => api?.scrollPrev()}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-6 h-2" : "w-2 h-2 hover:opacity-70"
                }`}
                style={{ background: i === current ? "var(--accent)" : "var(--border)" }}
              />
            ))}
          </div>

          <button
            onClick={() => api?.scrollNext()}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </Carousel>
    </section>
  );
}
