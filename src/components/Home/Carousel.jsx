// Carousel.js
import { useState } from 'react';

// Simulation des données venant du Back-Office
const slidesData = [
  { id: 1, image: "url_img_1", title: "Audit Cyber", link: "/audit" },
  { id: 2, image: "url_img_2", title: "Nouveau Hardware", link: "/shop" },
  { id: 3, image: "url_img_3", title: "Promotions", link: "/promo" },
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ... (Logique de défilement identique au code précédent) ...

  return (
    <div className="relative w-full h-[450px] overflow-hidden bg-[#3A3F51]">
       {/* Le code d'affichage utilise slidesData.map() */}
       {/* Cela garantit que si l'admin change l'ordre, le site s'adapte direct */}
       <div className="flex justify-center items-center h-full text-white">
          <h2 className="text-4xl font-bold">{slidesData[currentIndex].title}</h2>
          {/* Affiche ici ton image et tes textes dynamiques */}
       </div>
    </div>
  );
}