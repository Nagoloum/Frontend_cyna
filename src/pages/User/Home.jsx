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
      <TopProducts />

      {/* 5. Pied de page (Non fixe, suit le scroll) */}
      <Footer />
    </div>
  );
}
