import CategoryGrid from "@/components/Home/CategoryGrid";
import { HeroCarousel } from "@/components/Home/HeroCarousel";
import TopProducts from "@/components/Home/TopProducts";

export default function HomePage() {
  return (
    <div className="flex flex-col font-sans">
      <HeroCarousel />
      <CategoryGrid />
      <TopProducts />
    </div>
  );
}
