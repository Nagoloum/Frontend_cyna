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
      <TopProducts />

      {/* 5. Pied de page (Non fixe, suit le scroll) */}
      <Footer />

    </div>
  );
}
