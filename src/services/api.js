import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

export const buildImageUrl = (path) => {
  // 1. Check if path exists AND is actually a string
  if (!path || typeof path !== 'string') {
    return null;
  }

  // 2. Now it's safe to use string methods
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${clean}`;
};

/** Unwrap any NestJS response shape into a plain array */
export const extractList = (responseData) => {
  const d = responseData;
  const inner = d?.data ?? d;
  const arr   = inner?.items ?? inner?.data ?? inner;
  return Array.isArray(arr) ? arr : [];
};

export const extractTotal = (responseData) =>
  responseData?.data?.total ?? responseData?.total ?? 0;

// ── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

const storedToken = localStorage.getItem('token');
if (storedToken) setAuthToken(storedToken);

// ── Request interceptor : always attach the latest token from localStorage ──
// Fixes the case where setAuthToken() was never called (e.g. login via native fetch)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

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

// ── AUTH ──────────────────────────────────────────────────────────────────────

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
  }
  throw new Error(data.message || 'Login failed');
};

export const authAPI = {
  login,
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    window.location.href = '/auth';
  },
  me: async () => {
    const res = await api.get('/auth/user/me');
    return res.data?.data ?? res.data;
  },
  forgotPassword:    (email)                         => api.post('/auth/forgot-password', { email }),
  changePassword:    (currentPassword, newPassword)  => api.post('/auth/change-password', { currentPassword, newPassword }),
  emailConfirmation: (token)                         => api.get(`/auth/email-confirmation?token=${encodeURIComponent(token)}`),
};

// ── USERS ─────────────────────────────────────────────────────────────────────

export const usersAPI = {
  getAll:        (params = {}) => api.get('/users', { params }),
  getById:       (id)          => api.get(`/users/${id}`),
  updateProfile: (id, data)    => api.patch(`/users/profil/${id}`, data),
  delete:        (id)          => api.delete(`/users/${id}`),
};

// ── CATEGORIES ────────────────────────────────────────────────────────────────
// DTO: { name (required), newImage (file, required), description?, order (required) }

export const categoriesAPI = {
  getAll:       (params = {}) => api.get('/categories', { params }),
  getAllByOrder: ()            => api.get('/categories/category-by-order'),
  getBySlug:    (slug)        => api.get(`/categories/${slug}`),
  create:       (formData)    => api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:       (slug, data)  => api.patch(`/categories/${slug}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  delete:       (slug)        => api.delete(`/categories/${slug}`),
};

// ── SERVICES ──────────────────────────────────────────────────────────────────
// DTO: { name (required), categoryId (required), description?, available?, TechFile? }

export const servicesAPI = {
  getAll:    (params = {}) => api.get('/services', { params }),
  getBySlug: (slug)        => api.get(`/services/${slug}`),
  create:    (data)        => api.post('/services', data),
  update:    (slug, data)  => api.patch(`/services/${slug}`, data),
  delete:    (slug)        => api.delete(`/services/${slug}`),
};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
// DTO: { serviceId (required), name (required), images[]?, priceMonth, priceYear, stock?, is_selected?, priority? }

export const productsAPI = {
  getAll:       (params = {}) => api.get('/products', { params }),
  getAllByOrder: ()            => api.get('/products/product-by-order'),
  getBySlug:    (slug)        => api.get(`/products/${slug}`),
  create: (data) => api.post('/products', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  update: (slug, data) => api.patch(`/products/${slug}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  delete: (slug) => api.delete(`/products/${slug}`),
};

// ── ORDERS ────────────────────────────────────────────────────────────────────

export const ordersAPI = {
  getAll:       (params = {}) => api.get('/orders', { params }),
  getById:      (id)          => api.get(`/orders/${id}`),
  updateStatus: (id, status)  => api.patch(`/orders/${id}/status`, { status }),
  refund:       (id)          => api.post(`/orders/${id}/refund`),
};

// ── SUPPORT ───────────────────────────────────────────────────────────────────

export const supportAPI = {
  getAll:       (params = {}) => api.get('/support', { params }),
  getById:      (id)          => api.get(`/support/${id}`),
  reply:        (id, message) => api.patch(`/support/${id}/reply`, { message }),
  updateStatus: (id, status)  => api.patch(`/support/${id}/status`, { status }),
};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

export const dashboardAPI = {
  fetchAll: async () => {
    const [pR, cR, uR, sR] = await Promise.allSettled([
      api.get('/products',   { params: { limit: 1000 } }),
      api.get('/categories'),
      api.get('/users'),
      api.get('/services'),
    ]);
    const extract = (res) => res.status === 'rejected' ? [] : extractList(res.value.data);
    return {
      products:   extract(pR),
      categories: extract(cR),
      users:      extract(uR),
      services:   extract(sR),
    };
  },
};

export default api;