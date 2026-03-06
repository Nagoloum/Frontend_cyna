// src/services/api.js
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Instance Axios
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Token management
// ─────────────────────────────────────────────────────────────────────────────

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const storedToken = localStorage.getItem('token');
if (storedToken) setAuthToken(storedToken);

// ─────────────────────────────────────────────────────────────────────────────
// Response interceptor — global error handling
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
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
    const user  = data.data.user ?? data.data;

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
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

  /** GET /api/auth/user/me — fetch current user */
  me: async () => {
    const response = await api.get('/auth/user/me');
    const data = response.data;
    return data.data ?? data;
  },

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  emailConfirmation: (token) =>
    api.get(`/auth/email-confirmation?token=${encodeURIComponent(token)}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// USERS  →  /api/users
// ─────────────────────────────────────────────────────────────────────────────

export const usersAPI = {
  /** GET /api/users */
  getAll: (params = {}) =>
    api.get('/users', { params }),

  /** GET /api/users/:id */
  getById: (id) =>
    api.get(`/users/${id}`),

  /** PATCH /api/users/profil/:id */
  updateProfile: (id, data) =>
    api.patch(`/users/profil/${id}`, data),

  /** DELETE /api/users/:id */
  delete: (id) =>
    api.delete(`/users/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES  →  /api/categories
// ─────────────────────────────────────────────────────────────────────────────

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
  create: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/categories', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /** PATCH /api/categories/:slug */
  update: (slug, data) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/categories/${slug}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /** DELETE /api/categories/:slug */
  delete: (slug) =>
    api.delete(`/categories/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES  →  /api/services
// ─────────────────────────────────────────────────────────────────────────────

export const servicesAPI = {
  /** GET /api/services */
  getAll: (params = {}) =>
    api.get('/services', { params }),

  /** GET /api/services/:slug */
  getBySlug: (slug) =>
    api.get(`/services/${slug}`),

  /** POST /api/services */
  create: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/services', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /** PATCH /api/services/:slug */
  update: (slug, data) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/services/${slug}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /** DELETE /api/services/:slug */
  delete: (slug) =>
    api.delete(`/services/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS  →  /api/products
// ─────────────────────────────────────────────────────────────────────────────

export const productsAPI = {
  /** GET /api/products
   *  Params: { page, limit, search, categorySlug, sortBy, order }
   */
  getAll: (params = {}) =>
    api.get('/products', { params }),

  /** GET /api/products/product-by-order */
  getAllByOrder: () =>
    api.get('/products/product-by-order'),

  /** GET /api/products/:slug */
  getBySlug: (slug) =>
    api.get(`/products/${slug}`),

  /** POST /api/products */
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
// ORDERS  →  /api/orders  (endpoints TBD — graceful fallback built-in)
// ─────────────────────────────────────────────────────────────────────────────

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
// SUPPORT  →  /api/support  (endpoints TBD)
// ─────────────────────────────────────────────────────────────────────────────

export const supportAPI = {
  getAll: (params = {}) =>
    api.get('/support', { params }),

  getById: (id) =>
    api.get(`/support/${id}`),

  reply: (id, message) =>
    api.patch(`/support/${id}/reply`, { message }),

  updateStatus: (id, status) =>
    api.patch(`/support/${id}/status`, { status }),
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD  →  derived from existing endpoints (products, categories, users)
// NOTE: No /admin/dashboard endpoints exist yet in the backend.
// Dashboard stats are computed client-side from real data.
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardAPI = {
  /**
   * Fetch all data needed to build KPIs.
   * Returns { products, categories, users }
   */
  fetchAll: async () => {
    const [productsRes, categoriesRes, usersRes] = await Promise.allSettled([
      api.get('/products', { params: { limit: 1000 } }),
      api.get('/categories'),
      api.get('/users'),
    ]);

    const extract = (res) => {
      if (res.status === 'rejected') return [];
      const d = res.value.data;
      // Handle all common NestJS shapes:
      // { data: [...] } | { data: { items: [...], total } } | { items: [...] } | [...]
      const inner = d?.data ?? d;
      const arr   = inner?.items ?? inner?.data ?? inner;
      return Array.isArray(arr) ? arr : [];
    };

    return {
      products: extract(productsRes),
      categories: extract(categoriesRes),
      users: extract(usersRes),
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
export default api;