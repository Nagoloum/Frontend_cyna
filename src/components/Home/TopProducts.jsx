<<<<<<< HEAD
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
=======
const topProducts = [
  { id: 101, name: "Serveur Rack V2", image: "srv.jpg" },
  { id: 102, name: "Licence Antivirus Pro", image: "av.jpg" },
  { id: 103, name: "Casque VR Security", image: "vr.jpg" },
  { id: 104, name: "Firewall Physique", image: "fw.jpg" },
];

export default function TopProducts() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 mb-12">
      {/* Titre imposé par le CDCF */}
      <h2 className="text-3xl font-bold text-center text-[#3A3F51] mb-10">
        Les Top Produits du moment
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {topProducts.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition border border-gray-100">
            {/* Format simple : Image + Nom comme demandé */}
            <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src={product.image} alt={product.name} className="max-h-full max-w-full" />
            </div>
            
            <h3 className="text-lg font-bold text-[#3A3F51] text-center truncate">
              {product.name}
            </h3>
            
            {/* Petit ajout UX (optionnel mais conseillé pour la vente) */}
            <button className="w-full mt-4 text-[#8000FF] font-semibold text-sm border border-[#8000FF] rounded py-1 hover:bg-[#8000FF] hover:text-white transition">
              Voir le produit
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
>>>>>>> b21562c5a17a893009007ba88af8856e1aa2ad46
