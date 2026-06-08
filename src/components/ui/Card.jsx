import { cn } from "@/lib/utils";
import {
    DEFAULT_PRODUCT_IMAGE,
    buildImageUrl,
    getProductImage,
} from "@/services/api";
import {
    ArrowRight,
    CheckCircle2,
    Layers,
    Package,
    ShoppingBag,
    Star,
    XCircle,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/**
 * Card composant UNIQUE et réutilisable pour toutes les cartes du site.
 *
 * La carte est ENTIÈREMENT cliquable et redirige vers la page de détail :
 *   - variant="product"  → /products/:slug   (image carrée, prix, ajout au panier)
 *   - variant="category" → /categories/:slug (image paysage, description)
 *
 * Pour ajouter / ajuster une variante, tout se centralise ici.
 *
 * Props :
 *   item         (object)   Entité produit ou catégorie (doit contenir `slug`).
 *   variant      (string)   "product" | "category". Défaut : "product".
 *   to           (string)   Surcharge optionnelle de l'URL de destination.
 *   onAddToCart  (func)     Produit uniquement : affiche le bouton « Ajouter au panier ».
 *                           Le clic n'entraîne PAS la navigation.
 *   aspectRatio  (string)   Surcharge du ratio de l'image (ex. "16 / 9").
 *   className    (string)   Classes additionnelles.
 */

const DEFAULT_ASPECT = { product: "1 / 1", category: "4 / 3" };

export default function Card({
  item,
  variant = "product",
  to,
  onAddToCart,
  aspectRatio,
  className,
  ...rest
}) {
  const { t } = useTranslation();
  const [imgErr, setImgErr] = React.useState(false);

  if (!item) return null;

  const isCategory = variant === "category";

  // Destination toute la carte pointe vers la page de détail
  const href =
    to ?? (isCategory ? `/categories/${item.slug}` : `/products/${item.slug}`);

  // Résolution de l'image
  const imageUrl = isCategory
    ? buildImageUrl(item.image?.path ?? item.image)
    : imgErr
      ? DEFAULT_PRODUCT_IMAGE
      : getProductImage(item);
  const FallbackIcon = isCategory ? Layers : Package;

  // États propres aux produits
  const isOut = !isCategory && item.stock === 0;
  const priceMonth = item.priceMonth ?? item.price;
  const priceYear = item.priceYear;
  const ratio = aspectRatio ?? DEFAULT_ASPECT[variant];

  // Le bouton vit à l'intérieur du <Link> : on bloque la navigation
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOut) onAddToCart?.(item);
  };

  return (
    <Link
      to={href}
      className={cn(
        "cyna-card group overflow-hidden flex flex-col",
        isOut && "opacity-60",
        className,
      )}
      style={{ textDecoration: "none" }}
      {...rest}
    >
      {/* ── Image ── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: ratio, background: "var(--bg-muted)" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            onError={() => !isCategory && setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FallbackIcon size={28} style={{ color: "var(--text-muted)" }} />
          </div>
        )}

        {/* Badge « Top » (produit mis en avant) */}
        {!isCategory && item.is_selected && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-accent gap-1 text-[9px] sm:text-[10px]">
              <Star size={8} fill="currentColor" /> {t("card.top")}
            </span>
          </div>
        )}

        {/* Overlay rupture de stock */}
        {isOut && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,.45)" }}
          >
            <span className="badge badge-danger gap-1 text-[10px]">
              <XCircle size={11} /> {t("card.out_of_stock")}
            </span>
          </div>
        )}

        {/* Overlay « Voir les produits » (catégorie, au survol) */}
        {isCategory && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
            style={{
              background:
                "linear-gradient(to top, rgba(124,58,237,.7), transparent)",
            }}
          >
            <span className="text-white text-xs font-semibold flex items-center gap-1">
              {t("card.view_products")} <ArrowRight size={12} />
            </span>
          </div>
        )}
      </div>

      {/* ── Corps ── */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3
            className="font-[Kumbh Sans] font-700 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            {item.name}
          </h3>
          {/* Sous-titre produit : service rattaché */}
          {!isCategory && item.service?.name && (
            <p
              className="text-[10px] sm:text-[11px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {item.service.name}
            </p>
          )}
        </div>

        {/* Description (catégorie) */}
        {isCategory && item.description && (
          <p
            className="text-[11px] sm:text-xs line-clamp-2 leading-relaxed"
            style={{
              color: "var(--text-muted)",
              fontFamily: "'Kumbh Sans', sans-serif",
            }}
          >
            {item.description}
          </p>
        )}

        {/* Disponibilité (produit) */}
        {!isCategory && (
          <div
            className="flex items-center gap-1 text-[10px] sm:text-xs"
            style={{ fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            {isOut ? (
              <>
                <XCircle size={11} style={{ color: "var(--danger)" }} />
                <span style={{ color: "var(--danger)" }}>
                  {t("card.out_of_stock")}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={11} style={{ color: "var(--success)" }} />
                <span style={{ color: "var(--success)" }}>
                  {t("card.available")}
                </span>
              </>
            )}
          </div>
        )}

        {/* Prix + ajout panier (produit) */}
        {!isCategory && (
          <div
            className="mt-auto flex items-end justify-between gap-2 pt-2.5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="min-w-0">
              {priceMonth != null && (
                <p
                  className="font-[Kumbh Sans] font-700 text-sm sm:text-base leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {Number(priceMonth).toFixed(2)} €
                  <span
                    className="text-[10px] sm:text-xs font-normal ml-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t("card.per_month")}
                  </span>
                </p>
              )}
              {priceYear != null && (
                <p
                  className="text-[10px] sm:text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("card.or_per_year", {
                    price: Number(priceYear).toFixed(2),
                  })}
                </p>
              )}
            </div>

            {onAddToCart && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOut}
                aria-label={t("card.add_to_cart")}
                className="btn-primary py-1.5 px-2 sm:py-2 sm:px-3 text-[10px] sm:text-xs gap-1 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ShoppingBag size={12} />
                <span className="hidden sm:inline">{t("card.add_to_cart")}</span>
              </button>
            )}
          </div>
        )}

        {/* Lien « Explorer » (catégorie) */}
        {isCategory && (
          <div
            className="mt-auto flex items-center gap-1.5 text-xs font-[Kumbh Sans] font-600 pt-2"
            style={{ color: "var(--accent)" }}
          >
            {t("card.explore")} <ArrowRight size={12} />
          </div>
        )}
      </div>
    </Link>
  );
}
