import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import notificationsReducer from './slices/notificationsSlice';
import productFormReducer from './slices/productFormSlice';

// Persist cart to localStorage and apply theme side-effects after each relevant action
const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  if (action.type.startsWith('cart/')) {
    localStorage.setItem('cart', JSON.stringify(state.cart.items));
  }

  if (action.type === 'ui/toggleTheme' || action.type === 'ui/setTheme') {
    const { theme } = state.ui;
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    cart: cartReducer,
    notifications: notificationsReducer,
    productForm: productFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

// Apply saved theme on store init (document class must match stored preference)
const { theme } = store.getState().ui;
if (typeof document !== 'undefined') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
