// src/components/admin/dashboard/KPICard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPICard — Carte KPI réutilisable
 *
 * Props :
 *   title       {string}   – Libellé de la métrique
 *   value       {string}   – Valeur principale formatée (ex: "12 450 €")
 *   variation   {number}   – Variation en % (positif/négatif/null)
 *   icon        {ReactNode} – Icône lucide-react
 *   iconBg      {string}   – Classe Tailwind couleur fond icône (ex: "bg-indigo-50 dark:bg-indigo-500/10")
 *   iconColor   {string}   – Classe Tailwind couleur icône
 *   loading     {boolean}  – Affiche un skeleton si true
 *   subtitle    {string}   – Texte secondaire optionnel
 */
export default function KPICard({
  title,
  value,
  variation = null,
  icon: Icon,
  iconBg = 'bg-indigo-50 dark:bg-indigo-500/10',
  iconColor = 'text-indigo-600 dark:text-indigo-400',
  loading = false,
  subtitle = null,
}) {
  const isPositive = variation > 0;
  const isNeutral = variation === 0 || variation === null;
  const isNegative = variation < 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="w-24 h-3 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
        <div className="w-32 h-7 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="
      group bg-white dark:bg-gray-800
      rounded-2xl p-5
      border border-gray-200 dark:border-gray-700/60
      shadow-sm hover:shadow-md
      hover:border-indigo-200 dark:hover:border-indigo-500/30
      transition-all duration-200
    ">
      {/* ── Ligne haute : icône + variation ── */}
      <div className="flex items-start justify-between mb-4">
        {/* Icône */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {Icon && <Icon size={18} className={iconColor} />}
        </div>

        {/* Badge variation */}
        {variation !== null && (
          <div className={`
            flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
            ${isPositive ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : ''}
            ${isNegative ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : ''}
            ${isNeutral  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
          `}>
            {isPositive && <TrendingUp size={11} />}
            {isNegative && <TrendingDown size={11} />}
            {isNeutral  && <Minus size={11} />}
            <span>{isPositive ? '+' : ''}{variation}%</span>
          </div>
        )}
      </div>

      {/* ── Titre ── */}
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        {title}
      </p>

      {/* ── Valeur principale ── */}
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {value}
      </p>

      {/* ── Sous-titre optionnel ── */}
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
