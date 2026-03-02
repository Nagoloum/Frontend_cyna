import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// On retire "interface ProductCardProps" et le typage des arguments
const ProductCard = ({ image, name, price, stock, onAddToCart }) => {
  const isOutOfStock = stock === 0;

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge
              variant="destructive"
              className="text-sm px-4 py-1.5 font-semibold tracking-wide"
            >
              Rupture de stock
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="font-display text-base font-semibold text-foreground leading-tight line-clamp-2">
          {name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-foreground">
            {/* price.toFixed(2) peut planter si price n'est pas un nombre, 
                on ajoute une petite sécurité */}
            {Number(price).toFixed(2)}&nbsp;€
          </span>

          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={16} />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
