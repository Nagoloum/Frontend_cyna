import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from "../ProductCard";

const topProducts = [
  {
    id: 1,
    name: "Veste en Lin Premium",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500",
    stock: 10,
  },
  {
    id: 2,
    name: "Sac à dos Urbain",
    price: 85.0,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500",
    stock: 5,
  },
  {
    id: 3,
    name: "Montre Minimaliste Noir",
    price: 199.0,
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=500",
    stock: 0, // Affichera "Rupture de stock"
  },
  {
    id: 4,
    name: "Sneakers White Edition",
    price: 110.5,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500",
    stock: 12,
  },
  {
    id: 5,
    name: "Lunettes de Soleil Classic",
    price: 45.0,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500",
    stock: 8,
  },
];
const TopProducts = () => {
  const handleAddToCart = (name) => {
    console.log(`Ajout de ${name} au panier`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 py-10">
      <div className="mb-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1a1c20] uppercase tracking-tight">
          Nos Meilleurs Produits
        </h2>
      </div>

      {/* VERSION MOBILE : Grille 1 colonne (ou 2 si tu préfères) */}
      <div className="md:hidden">
        <div className="grid grid-cols-1 gap-8">
          {topProducts.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
              stock={product.stock}
              onAddToCart={() => handleAddToCart(product.name)}
            />
          ))}
        </div>
      </div>

      {/* VERSION DESKTOP : Carrousel */}
      <div className="hidden md:block">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative group"
        >
          <CarouselContent className="-ml-4">
            {topProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 md:basis-1/3 lg:basis-1/4"
              >
                <div className="pb-4">
                  <ProductCard
                    image={product.image}
                    name={product.name}
                    price={product.price}
                    stock={product.stock}
                    onAddToCart={() => handleAddToCart(product.name)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="-left-12 rounded-full border-gray-200 text-gray-400 hover:bg-primary hover:text-white transition-all shadow-none" />
          <CarouselNext className="-right-12 rounded-full border-gray-200 text-gray-400 hover:bg-primary hover:text-white transition-all shadow-none" />
        </Carousel>
      </div>
    </section>
  );
};

export default TopProducts;
