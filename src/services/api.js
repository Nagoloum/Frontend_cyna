// src/services/api.js
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Instance Axios
// ─────────────────────────────────────────────────────────────────────────────

// Utilise VITE_API_URL si défini dans .env, sinon fallback localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Gestion du token
// ─────────────────────────────────────────────────────────────────────────────

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Charger le token au démarrage (si déjà connecté)
const storedToken = localStorage.getItem('token');
if (storedToken) {
  setAuthToken(storedToken);
}

// ─────────────────────────────────────────────────────────────────────────────
// Intercepteur réponse — gestion globale des erreurs
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nettoyage complet de la session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
      // Redirection vers login
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH  →  /api/auth
// ─────────────────────────────────────────────────────────────────────────────

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const data = response.data;
  if (data.success && data.data) {
    const token = data.data.token;
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
    }
    return data.data;
  } else {
    throw new Error(data.message || 'Login failed');
  }
};

export const authAPI = {
  login,

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    window.location.href = '/auth';
  },

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),

  emailConfirmation: (token) =>
    api.get(`/auth/email-confirmation?token=${encodeURIComponent(token)}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES  →  /api/categories
// ─────────────────────────────────────────────────────────────────────────────
// Routes confirmées dans les logs NestJS :
//   POST   /api/categories
//   GET    /api/categories
//   GET    /api/categories/category-by-order
//   GET    /api/categories/:slug
//   PATCH  /api/categories/:slug
//   DELETE /api/categories/:slug

export const categoriesAPI = {
  /** GET /api/categories */
  getAll: (params = {}) =>
    api.get('/categories', { params }),

  /** GET /api/categories/category-by-order */
  getAllByOrder: () =>
    api.get('/categories/category-by-order'),

  /** GET /api/categories/:slug */
  getBySlug: (slug) =>
    api.get(`/categories/${slug}`),

  /** POST /api/categories */
  create: (data) =>
    api.post('/categories', data),

  /** PATCH /api/categories/:slug */
  update: (slug, data) =>
    api.patch(`/categories/${slug}`, data),

  /** DELETE /api/categories/:slug */
  delete: (slug) =>
    api.delete(`/categories/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES  →  /api/services
// ─────────────────────────────────────────────────────────────────────────────
// Routes confirmées dans les logs NestJS :
//   POST   /api/services
//   GET    /api/services
//   GET    /api/services/:slug
//   PATCH  /api/services/:slug
//   DELETE /api/services/:slug

export const servicesAPI = {
  /** GET /api/services */
  getAll: (params = {}) =>
    api.get('/services', { params }),

  /** GET /api/services/:slug */
  getBySlug: (slug) =>
    api.get(`/services/${slug}`),

  /** POST /api/services */
  create: (data) =>
    api.post('/services', data),

  /** PATCH /api/services/:slug */
  update: (slug, data) =>
    api.patch(`/services/${slug}`, data),

  /** DELETE /api/services/:slug */
  delete: (slug) =>
    api.delete(`/services/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS  →  /api/products
// ─────────────────────────────────────────────────────────────────────────────
// Routes confirmées dans les logs NestJS :
//   POST   /api/products
//   GET    /api/products
//   GET    /api/products/product-by-order
//   GET    /api/products/:slug
//   PATCH  /api/products/:slug
//   DELETE /api/products/:slug

export const productsAPI = {
  /** GET /api/products
   *  Params supportés : { page, limit, search, categorySlug, sortBy, order }
   */
  getAll: (params = {}) =>
    api.get('/products', { params }),

  /** GET /api/products/product-by-order */
  getAllByOrder: () =>
    api.get('/products/product-by-order'),

  /** GET /api/products/:slug */
  getBySlug: (slug) =>
    api.get(`/products/${slug}`),

  /** POST /api/products
   *  Détecte automatiquement FormData (upload images) vs JSON
   */
  create: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/products', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /** PATCH /api/products/:slug */
  update: (slug, data) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/products/${slug}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /** DELETE /api/products/:slug */
  delete: (slug) =>
    api.delete(`/products/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS  →  /api/orders
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ Routes pas encore dans les logs — à valider avec le backend
//    Mettre à jour les endpoints quand disponibles

export const ordersAPI = {
  /** GET /api/orders */
  getAll: (params = {}) =>
    api.get('/orders', { params }),

  /** GET /api/orders/:id */
  getById: (id) =>
    api.get(`/orders/${id}`),

  /** PATCH /api/orders/:id/status */
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),

  /** POST /api/orders/:id/refund */
  refund: (id) =>
    api.post(`/orders/${id}/refund`),
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT  →  /api/support
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ Routes pas encore dans les logs — à valider avec le backend

export const supportAPI = {
  /** GET /api/support */
  getAll: (params = {}) =>
    api.get('/support', { params }),

  /** GET /api/support/:id */
  getById: (id) =>
    api.get(`/support/${id}`),

  /** PATCH /api/support/:id/reply */
  reply: (id, message) =>
    api.patch(`/support/${id}/reply`, { message }),

  /** PATCH /api/support/:id/status */
  updateStatus: (id, status) =>
    api.patch(`/support/${id}/status`, { status }),
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD  →  /api/admin/dashboard
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ Routes pas encore dans les logs — à valider avec le backend

export const dashboardAPI = {
  getKpis: (period) =>
    api.get('/admin/dashboard/kpis', { params: { period } }),

  getSales: (period) =>
    api.get('/admin/dashboard/sales', { params: { period } }),

  getAvgCart: (period) =>
    api.get('/admin/dashboard/avg-cart', { params: { period } }),

  getSalesByCategory: (period) =>
    api.get('/admin/dashboard/sales-by-category', { params: { period } }),

  /** Retourne un Blob binaire pour déclencher un téléchargement */
  export: (period, format = 'csv') =>
    api.get('/admin/dashboard/export', {
      params: { period, format },
      responseType: 'blob',
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
export default api;
