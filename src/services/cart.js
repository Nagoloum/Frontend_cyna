// src/services/cart.js
//
// Thin compatibility shim — all cart logic now lives in the Redux store.
// Import the thunks and actions from the store for new code.
// This file exists only so existing imports don't break during migration.

export {
  mergeOnLogin,
  archiveOnLogout,
  clearCartCompletely,
} from '../store/slices/cartSlice';
