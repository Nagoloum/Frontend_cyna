import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const promoSlides = [
  {
    title: "Collection Printemps 2026",
    description: "Découvrez les nouvelles tendances avec Wood Partners.",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200",
    buttonText: "Acheter maintenant",
  },
  {
    title: "Offre Spéciale Accessoires",
    description: "Jusqu'à -50% sur une sélection de montres et sacs.",
    image:
      "https://images.unsplash.com/photo-1491336477066-31156b5e4f35?auto=format&fit=crop&q=80&w=1200",
    buttonText: "Voir les promos",
  },
  {
    title: "Confort & Style",
    description: "Des chaussures conçues pour durer toute la journée.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200",
    buttonText: "Explorer la gamme",
  },
];

export function HeroCarousel() {
  const [api, setApi] = React.useState();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  );

  // Initialisation de l'API Embla
  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 mb-12 relative group">
      <Carousel
        setApi={setApi} // On lie l'API ici
        plugins={[plugin.current]}
        className="w-full max-w-7xl mx-auto overflow-hidden rounded-3xl"
      >
        <CarouselContent>
          {promoSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[400px] md:h-[500px] w-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative h-full flex flex-col justify-center px-8 md:px-16 text-white max-w-2xl">
                  <h2 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-8 opacity-90">
                    {slide.description}
                  </p>
                  <Button
                    size="lg"
                    className="rounded-lg px-8 font-bold bg-secondary w-full"
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Les points de navigation */}
        <div className="absolute bottom-6 left-0 right-0">
          <div className="flex items-center justify-center gap-2">
            {promoSlides.map((_, index) => (
              <button
                key={index}
                className={`h-2 transition-all duration-300 rounded-full ${
                  index === current ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Aller à la slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Les boutons de navigation */}
        {current !== 0 && (
          <CarouselPrevious className="left-4 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {count !== current + 1 && (
          <CarouselNext className="right-4 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </Carousel>
      {/* Section Texte Fixe / Annonce */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-secondary/30 border border-border rounded-2xl p-6 md:p-10 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-[#1a1c20] mb-3 uppercase tracking-wider">
            Wood Partners — Votre destination mode durable
          </h3>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Profitez de la livraison offerte dès 50€ d'achat. Nos collections
            sont mises à jour chaque semaine pour vous offrir le meilleur des
            tendances actuelles avec une qualité irréprochable.
          </p>

          {/* Optionnel : un petit badge ou lien discret */}
          <div className="mt-4 flex justify-center gap-4 text-xs font-bold uppercase tracking-widest text-red-600">
            <span>• Qualité Premium</span>
            <span>• Support 24/7</span>
            <span>• Retours Gratuits</span>
          </div>
        </div>
      </div>
    </section>
  );
}
