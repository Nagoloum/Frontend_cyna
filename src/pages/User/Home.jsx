<<<<<<< HEAD
import CategoryGrid from "@/components/Home/CategoryGrid";
import Footer from "@/components/Home/Footer";
import { HeroCarousel } from "@/components/Home/HeroCarousel";
import TopProducts from "@/components/Home/TopProducts";

export default function HomePage() {
  return (
    <div className="flex flex-col font-sans">
      {/* 1. Carrousel (3 parties, modifiable) */}
      <HeroCarousel />

      {/* 2. Grille de Catégories (Ordre modifiable) */}
      <CategoryGrid />

      {/* 3. Les Top Produits (Sélection Back-office) */}
=======
import Navbar from '../../components/Home/Navbar';
import Carousel from '../../components/Home/Carousel';
import InfoSection from '../../components/Home/InfoSection';
import CategoryGrid from '../../components/Home/CategoryGrid';
import TopProducts from '../../components/Home/TopProducts';
import Footer from '../../components/Home/Footer';

export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      
      {/* En-tête (Navigation) */}
      <Navbar />

      {/* 1. Carrousel (3 parties, modifiable) */}
      <Carousel />

      {/* 2. Texte Fixe (Modifiable) */}
      <InfoSection />

      {/* 3. Grille de Catégories (Ordre modifiable) */}
      <CategoryGrid />

      {/* 4. Les Top Produits (Sélection Back-office) */}
>>>>>>> b21562c5a17a893009007ba88af8856e1aa2ad46
      <TopProducts />

      {/* 5. Pied de page (Non fixe, suit le scroll) */}
      <Footer />
<<<<<<< HEAD
    </div>
  );
}
=======

    </div>
  );
}
>>>>>>> b21562c5a17a893009007ba88af8856e1aa2ad46
