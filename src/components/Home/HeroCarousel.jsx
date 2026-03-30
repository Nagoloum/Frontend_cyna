import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Lock, Shield, Zap } from "lucide-react";
import * as React from "react";

const DEFAULT_SLIDES = [
  {
    title: "Next-Generation\nSOC Protection",
    description: "Real-time monitoring, advanced threat detection, and incident response to secure your infrastructure.",
    tag: "SOC",
    color: "#7c3aed",
    icon: Shield,
    cta: "Discover the SOC",
  },
  {
    title: "Endpoint Detection\n& Response",
    description: "Protect every endpoint in your IT environment with our AI-powered EDR solution.",
    tag: "EDR",
    color: "#6d28d9",
    icon: Zap,
    cta: "Explore EDR",
  },
  {
    title: "Extended Detection\n& Response",
    description: "A unified view of all your threats. Intelligent correlation across endpoints, network, and cloud.",
    tag: "XDR",
    color: "#5b21b6",
    icon: Lock,
    cta: "See XDR",
  },
];

export function HeroCarousel() {
  const [api, setApi] = React.useState();
  const [current, setCurrent] = React.useState(0);
  const plugin = React.useRef(Autoplay({ delay: 5500, stopOnInteraction: true }));

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const slides = DEFAULT_SLIDES;

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {slides.map((slide, i) => {
            const Icon = slide.icon;
            return (
              <CarouselItem key={i}>
                <div className="relative py-4 max-h-[420px] sm:min-h-[480px] lg:min-h-[540px] flex items-center overflow-hidden">
                  {/* Background gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${slide.color}22 0%, transparent 70%), var(--bg-subtle)`,
                    }}
                  />
                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                    style={{
                      backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                      backgroundSize: "48px 48px",
                    }}
                  />
                  {/* Floating orb */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none hidden lg:block"
                    style={{ background: slide.color }}
                  />

                  <div className="cyna-container relative z-10 py-16 sm:py-20">
                    <div className="max-w-xl">
                      {/* Tag */}
                      <div className="flex items-center gap-2 mb-5">
                        <span className="badge badge-accent gap-1.5">
                          <Icon size={11} />
                          {slide.tag}
                        </span>
                        <span className="text-xs font-[Kumbh Sans]" style={{ color: "var(--text-muted)" }}>
                          Cyna Security Platform
                        </span>
                      </div>

                      {/* Title */}
                      <h1
                        className="font-[Kumbh Sans] font-extrabold mb-4 leading-[1.1]"
                        style={{
                          fontSize: "clamp(1.8rem, 5vw, 3rem)",
                          color: "var(--text-primary)",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {slide.title}
                      </h1>

                      {/* Description */}
                      <p
                        className="text-base sm:text-lg mb-8 leading-relaxed"
                        style={{ color: "var(--text-secondary)", maxWidth: "480px" }}
                      >
                        {slide.description}
                      </p>

                      {/* CTAs */}
                      <button className="btn-ghost gap-2">
                        Request a Demo
                      </button>
                    </div>
                  </div>

                  {/* Right visual (desktop) */}
                  <div className="absolute right-32 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center">
                    <div
                      className="w-56 h-56 rounded-3xl flex items-center justify-center shadow-[var(--shadow-lg)] border border-[var(--border)]"
                      style={{ background: "var(--bg-card)" }}
                    >
                      <div
                        className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[var(--shadow-accent)]"
                        style={{ background: `linear-gradient(135deg, ${slide.color}, #a78bfa)` }}
                      >
                        <Icon size={44} color="#fff" />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-6">
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
                style={{
                  background: i === current ? "var(--accent)" : "var(--border)",
                }}
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