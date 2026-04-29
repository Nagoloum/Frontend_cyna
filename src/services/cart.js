// src/services/cart.js
//
// Cart persistence + merge logic.
//
// Two storage slots are used in localStorage:
//   - "cart"            : the active cart shown in the UI (anonymous OR logged-in)
//   - "cart:<userId>"   : the persisted cart for a specific user, kept across
//                         logout/login so the user always finds their items.
//
// Anonymous additions persist in "cart". When a user signs in, the anonymous
// cart is merged into the user's saved cart. When they sign out, the active
// cart is archived under their userId so the next anonymous session starts fresh.

const ACTIVE_KEY = 'cart';
const userKey = (userId) => `cart:${userId}`;

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Read the currently active cart. */
export const loadCart = () => safeParse(localStorage.getItem(ACTIVE_KEY));

/** Persist the active cart and notify listeners (Navbar badge, etc.). */
export const saveCart = (items) => {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(items ?? []));
  window.dispatchEvent(new Event('cart-updated'));
};

/**
 * Merge two carts by (productId, billingPeriod). Quantities are summed.
 * Returns a new array. Items from `b` are appended after `a` for stability.
 */
export const mergeCarts = (a = [], b = []) => {
  const keyOf = (i) => `${i._id ?? i.id}::${i.billingPeriod ?? 'monthly'}`;
  const map = new Map();

  for (const item of [...a, ...b]) {
    const k = keyOf(item);
    const existing = map.get(k);
    if (existing) {
      existing.qty = (Number(existing.qty) || 1) + (Number(item.qty) || 1);
    } else {
      map.set(k, { ...item, qty: Number(item.qty) || 1 });
    }
  }
  return Array.from(map.values());
};

/**
 * Called right after a successful login.
 * Loads the user's previously archived cart, merges it with what was added
 * anonymously, and writes the combined cart back to BOTH the active slot and
 * the user-specific slot.
 */
export const mergeOnLogin = (userId) => {
  if (!userId) return loadCart();
  const anonymous = loadCart();
  const previous  = safeParse(localStorage.getItem(userKey(userId)));
  const merged    = mergeCarts(previous, anonymous);
  localStorage.setItem(userKey(userId), JSON.stringify(merged));
  saveCart(merged);
  return merged;
};

/**
 * Called right before logging out.
 * Archives the current cart under the user's slot so it's restored on next
 * login, then clears the active slot so the next anonymous session is empty.
 */
export const archiveOnLogout = (userId) => {
  if (userId) {
    const current = loadCart();
    localStorage.setItem(userKey(userId), JSON.stringify(current));
  }
  localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event('cart-updated'));
};

/**
 * Called after the user clears their account or after a successful checkout.
 * Empties both the active and the user's persisted carts.
 */
export const clearCartCompletely = (userId) => {
  localStorage.removeItem(ACTIVE_KEY);
  if (userId) localStorage.removeItem(userKey(userId));
  window.dispatchEvent(new Event('cart-updated'));
};
