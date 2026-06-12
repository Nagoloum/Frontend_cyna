// Calcul de TVA cote client — UNIQUEMENT pour l'affichage (panier, recapitulatif
// checkout). Le montant reellement debite est (re)calcule cote serveur a la
// creation de la commande, qui fait foi. Le taux est configurable via
// VITE_TVA_RATE (fraction, ex. 0.20 = 20%) et doit rester aligne avec le
// TVA_RATE du backend.
export const TVA_RATE = (() => {
  const r = Number(import.meta.env.VITE_TVA_RATE);
  return Number.isFinite(r) && r >= 0 && r <= 1 ? r : 0.2;
})();

export const TVA_PERCENT = Math.round(TVA_RATE * 100);

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 * A partir d'un sous-total HT (et d'une remise éventuelle), renvoie
 * { ht, discount, net, tva, ttc, rate }. La remise réduit la base taxable
 * (la TVA s'applique au HT après remise), comme côté serveur.
 */
export const computeTotals = (subtotalHT, discount = 0) => {
  const ht = round2(subtotalHT);
  const d = round2(Math.max(0, Math.min(Number(discount) || 0, ht)));
  const net = round2(ht - d);
  const tva = round2(net * TVA_RATE);
  const ttc = round2(net + tva);
  return { ht, discount: d, net, tva, ttc, rate: TVA_RATE };
};
