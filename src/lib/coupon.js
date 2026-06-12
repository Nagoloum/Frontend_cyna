// Code promo appliqué, conservé en localStorage entre le panier et le checkout.
// La remise stockée est indicative (affichage) : le serveur recalcule toujours
// la remise authoritative à la création de la commande.
const KEY = 'appliedCoupon';

export const getAppliedCoupon = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAppliedCoupon = (coupon) => {
  try {
    if (coupon && coupon.code) {
      localStorage.setItem(KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    /* ignore */
  }
};

export const clearAppliedCoupon = () => setAppliedCoupon(null);
