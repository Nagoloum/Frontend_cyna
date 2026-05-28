import { createSlice } from '@reduxjs/toolkit';

const ACTIVE_KEY = 'cart';

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mergeCarts = (a = [], b = []) => {
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

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: safeParse(typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_KEY) : null),
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    },
    addToCart: (state, action) => {
      const newItem = action.payload;
      const keyOf = (i) => `${i._id ?? i.id}::${i.billingPeriod ?? 'monthly'}`;
      const key = keyOf(newItem);
      const existing = state.items.find((i) => keyOf(i) === key);
      if (existing) {
        existing.qty = (Number(existing.qty) || 1) + (Number(newItem.qty) || 1);
      } else {
        state.items.push({ ...newItem, qty: Number(newItem.qty) || 1 });
      }
    },
    updateCartItem: (state, action) => {
      const { id, billingPeriod, patch } = action.payload;
      const item = state.items.find(
        (i) => i._id === id && i.billingPeriod === billingPeriod,
      );
      if (item) Object.assign(item, patch);
    },
    removeCartItem: (state, action) => {
      const { id, billingPeriod } = action.payload;
      state.items = state.items.filter(
        (i) => !(i._id === id && i.billingPeriod === billingPeriod),
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  setCartItems, addToCart, updateCartItem, removeCartItem, clearCart,
} = cartSlice.actions;

// ── Thunks (cart operations involving localStorage) ────────────────────────────

export const mergeOnLogin = (userId) => (dispatch, getState) => {
  if (!userId) return;
  const userKey = `cart:${userId}`;
  const previous = safeParse(localStorage.getItem(userKey));
  const currentItems = getState().cart.items;
  const merged = mergeCarts(previous, currentItems);
  localStorage.setItem(userKey, JSON.stringify(merged));
  dispatch(setCartItems(merged));
};

export const archiveOnLogout = (userId) => (dispatch, getState) => {
  if (userId) {
    const current = getState().cart.items;
    localStorage.setItem(`cart:${userId}`, JSON.stringify(current));
  }
  dispatch(clearCart());
};

export const clearCartCompletely = (userId) => (dispatch) => {
  localStorage.removeItem(ACTIVE_KEY);
  if (userId) localStorage.removeItem(`cart:${userId}`);
  dispatch(clearCart());
};

export default cartSlice.reducer;
