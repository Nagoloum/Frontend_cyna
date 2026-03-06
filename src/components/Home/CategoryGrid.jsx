<<<<<<< HEAD
import * as React from "react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const categories = [
  {
    id: 1,

    name: "Vêtements",

    description: "Nouvelle collection",

    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=500",

    href: "/categories/vetements",
  },

  {
    id: 2,

    name: "Accessoires",

    description: "Détails essentiels",

    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500",

    href: "/categories/accessoires",
  },

  {
    id: 3,

    name: "Chaussures",

    description: "Marchez avec style",

    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500",

    href: "/categories/chaussures",
  },

  {
    id: 4,

    name: "Nouveautés",

    description: "Arrivages récents",

    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=500",

    href: "/nouveautes",
  },

  {
    id: 5,

    name: "Nouveautés",

    description: "Arrivages récents",

    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=500",

    href: "/nouveautes",
  },

  {
    id: 6,

    name: "Nouveautés",

    description: "Arrivages récents",

    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=500",

    href: "/nouveautes",
  },

  {
    id: 7,

    name: "Nouveautés",

    description: "Arrivages récents",

    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=500",

    href: "/nouveautes",
  },
];

const CategoryCarousel = () => {
  return (
    <section className="max-w-7xl mx-auto py-10 bg-white px-4 md:px-8">
      <div className="flex items-center justify-center mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-[#1a1c20] uppercase tracking-tight text-center">
          Nos Catégories
        </h2>
      </div>

      {/* Sur MOBILE (par défaut) : On affiche une simple GRID
          Sur DESKTOP (md:) : On laisse le composant Carousel gérer l'affichage
      */}
      <div className="block md:hidden">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* CAROUSEL : Uniquement visible à partir de md: */}
      <div className="hidden md:block">
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full relative px-12"
        >
          <CarouselContent className="-ml-8">
            {categories.map((category) => (
              <CarouselItem
                key={category.id}
                className="pl-8 md:basis-1/3 lg:basis-1/4"
              >
                <CategoryCard category={category} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 h-10 w-10 rounded-full border-gray-200 text-gray-400" />
          <CarouselNext className="right-0 h-10 w-10 rounded-full border-gray-200 text-gray-400" />
        </Carousel>
      </div>
    </section>
  );
};

/* Sous-composant pour éviter de répéter le code du design */
const CategoryCard = ({ category }) => (
  <Link
    to={category.href}
    className="flex flex-col items-center text-center group"
  >
    <div className="w-full aspect-square flex items-center justify-center mb-4 bg-[#f9f9f9] overflow-hidden rounded-2xl md:rounded-none transition-all duration-300">
      <img
        src={category.image}
        alt={category.name}
        className="w-3/4 h-3/4 object-contain transition-transform duration-700 group-hover:scale-110"
      />
    </div>
    <h3 className="text-[13px] md:text-[16px] font-bold uppercase tracking-[0.2em] text-[#1a1c20] mb-1">
      {category.name}
    </h3>
    <p className="text-[10px] md:text-[13px] italic text-gray-400 font-serif">
      {category.description}
    </p>
  </Link>
);

export default CategoryCarousel;
=======
const categories = [
  { id: 1, name: "Logiciels", image: "img_software.jpg" },
  { id: 2, name: "Hardware", image: "img_hardware.jpg" },
  { id: 3, name: "Audits", image: "img_security.jpg" },
  { id: 4, name: "Accessoires", image: "img_usb.jpg" },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-[#3A3F51] mb-6 border-b pb-2 border-gray-200">
        Nos Univers
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="group cursor-pointer">
            {/* Image personnalisable */}
            <div className="h-40 rounded-xl overflow-hidden shadow-md relative">
              <div className="absolute inset-0 bg-[#3A3F51]/20 group-hover:bg-[#8000FF]/20 transition z-10"></div>
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            {/* Nom de la catégorie */}
            <p className="text-center font-bold text-[#3A3F51] mt-3 group-hover:text-[#8000FF] transition">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
>>>>>>> b21562c5a17a893009007ba88af8856e1aa2ad46
