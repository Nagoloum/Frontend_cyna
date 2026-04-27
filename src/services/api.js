import axios from 'axios';
import { notify } from '@/components/ui/feedback';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build absolute URL for stored images (storage/*) */
export const buildImageUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${clean}`;
};

/** Unwrap any NestJS ApiResponse shape → plain array */
export const extractList = (responseData) => {
  const d   = responseData;
  const inner = d?.data ?? d;
  const arr   = inner?.items ?? inner?.data ?? inner;
  return Array.isArray(arr) ? arr : [];
};

export const extractTotal = (responseData) =>
  responseData?.data?.total ?? responseData?.total ?? 0;

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

// Restore token on page load
const storedToken = localStorage.getItem('token');
if (storedToken) setAuthToken(storedToken);

// Always attach latest token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (only when a token was actually set — prevents redirect loops
// on the public login attempt itself).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('twoFAVerified');
      localStorage.removeItem('twoFARequired');
      setAuthToken(null);
      notify.warning(
        'Session expirée',
        'Veuillez vous reconnecter pour continuer.',
        { duration: 5000 }
      );
      // Defer redirect slightly so the toast renders before navigation.
      setTimeout(() => { window.location.href = '/auth'; }, 600);
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH   POST /auth/login · POST /auth/register · GET /auth/user/me
//        POST /auth/forgot-password · POST /auth/change-password?token=
//        GET  /auth/email-confirmation?token=
// ─────────────────────────────────────────────────────────────────────────────

/** Decode a JWT payload (no signature check — display-only). */
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const data = response.data;
  if (!data?.success || !data?.data?.token) {
    throw new Error(data?.message || 'Login failed');
  }

  const token = data.data.token;
  // Backend's login response only contains { token }. Extract user info from
  // the JWT payload so the frontend can drive role-based redirects.
  const payload = decodeJwt(token) ?? {};
  const user = data.data.user ?? {
    _id:       payload._id     ?? payload.id   ?? payload.sub ?? null,
    email:     payload.email   ?? null,
    firstName: payload.firstName ?? null,
    lastName:  payload.lastName  ?? null,
    role:      payload.role    ?? null,
    confirmed: payload.confirmed ?? true,
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  // Clear any prior 2FA state — a fresh login restarts the flow.
  localStorage.removeItem('twoFAVerified');
  localStorage.removeItem('twoFARequired');
  setAuthToken(token);

  return { token, user };
};

export const authAPI = {
  login,

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('twoFAVerified');
    localStorage.removeItem('twoFARequired');
    setAuthToken(null);
    window.location.href = '/auth';
  },

  /** GET /auth/user/me — returns the current logged-in user */
  me: async () => {
    const res = await api.get('/auth/user/me');
    return res.data?.data ?? res.data;
  },

  /** POST /auth/register */
  register: (data) => api.post('/auth/register', data),

  /** POST /auth/check-code  { code: "123456" } — verifies the 6-digit 2FA code */
  verify2FA: (code) => api.post('/auth/check-code', { code }),

  /** GET /auth/email-confirmation?token= */
  emailConfirmation: (token) =>
    api.get(`/auth/email-confirmation?token=${encodeURIComponent(token)}`),

  /** POST /auth/forgot-password  { email } — sends a reset link */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /**
   * POST /auth/change-password?token=TOKEN  { password }
   * Used for token-based password reset (from the forgot-password email link).
   */
  resetPassword: (token, newPassword) =>
    api.post(`/auth/change-password?token=${encodeURIComponent(token)}`, {
      password: newPassword,
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// USERS   GET /users · GET /users/:id · PATCH /users/profil/:id · DELETE /users/:id
// ─────────────────────────────────────────────────────────────────────────────

export const usersAPI = {
  /** Admin only — list all users */
  getAll: (params = {}) => api.get('/users', { params }),

  getById: (id) => api.get(`/users/${id}`),

  /**
   * PATCH /users/profil/:id
   * Backend DTO accepts only { firstName, lastName, email, password } (whitelisted).
   * Any other field (phone, timezone, language…) is silently dropped server-side.
   */
  updateProfile: (id, data) => api.patch(`/users/profil/${id}`, data),

  /** DELETE /users/:id */
  delete: (id) => api.delete(`/users/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES   GET /categories · GET /categories/category-by-order
//              GET /categories/category-for-user/:slug · GET /categories/:slug
//              POST /categories (multipart) · PATCH /categories/:slug (multipart)
//              DELETE /categories/:slug
// ─────────────────────────────────────────────────────────────────────────────

export const categoriesAPI = {
  /** Paginated list — admin */
  getAll: (params = {}) => api.get('/categories', { params }),

  /** Ordered list for homepage grid */
  getAllByOrder: () => api.get('/categories/category-by-order'),

  /** Public category page with its products */
  getBySlugForUser: (slug) => api.get(`/categories/category-for-user/${slug}`),

  /** Full details — admin */
  getBySlug: (slug) => api.get(`/categories/${slug}`),

  /** Requires multipart/form-data with field `newImage` */
  create: (formData) =>
    api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (slug, data) =>
    api.patch(`/categories/${slug}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  delete: (slug) => api.delete(`/categories/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES   GET /services · GET /services/:slug
//            POST /services (multipart/no-file) · PATCH · DELETE
// ─────────────────────────────────────────────────────────────────────────────

export const servicesAPI = {
  getAll:    (params = {}) => api.get('/services', { params }),
  getBySlug: (slug)        => api.get(`/services/${slug}`),

  /** Body: { name, categoryId, description?, available?, TechFile? } */
  create: (data) => api.post('/services', data),
  update: (slug, data) => api.patch(`/services/${slug}`, data),
  delete: (slug) => api.delete(`/services/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS   GET /products · GET /products/product-by-order
//            GET /products/findBySlug/:slug (public)
//            GET /products/:slug (admin)
//            POST /products (multipart) · PATCH · DELETE
// ─────────────────────────────────────────────────────────────────────────────

export const productsAPI = {
  /** Paginated list — supports { page, limit, sortBy, order, search, categorySlug } */
  getAll: (params = {}) => api.get('/products', { params }),

  /** Ordered / featured list for homepage */
  getAllByOrder: () => api.get('/products/product-by-order'),

  /** Public product detail page */
  getBySlug: (slug) => api.get(`/products/findBySlug/${slug}`),

  /** Admin product detail */
  getBySlugAdmin: (slug) => api.get(`/products/${slug}`),

  /** Body: FormData with optional `images[]` files */
  create: (data) =>
    api.post('/products', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  update: (slug, data) =>
    api.patch(`/products/${slug}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  delete: (slug) => api.delete(`/products/${slug}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// SLIDERS   GET /sliders · GET /sliders/sliderTop?limit=N
//           POST /sliders (multipart, field: newImage)
//           PATCH /sliders/:idSlider (multipart, field: newImage)
//           DELETE /sliders/:idSlider
// ─────────────────────────────────────────────────────────────────────────────

export const slidersAPI = {
  /** Full list — admin */
  getAll: () => api.get('/sliders'),

  /** Public top sliders for homepage carousel (default limit = 3 in backend) */
  getTop: (limit = 5) => api.get('/sliders/sliderTop', { params: { limit } }),

  /** FormData must include `newImage` file + `title`, optional `linkUrl`, `NameUrl`, `order` */
  create: (formData) =>
    api.post('/sliders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, data) =>
    api.patch(`/sliders/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  delete: (id) => api.delete(`/sliders/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// ADRESSE FACTURATIONS   (auth required)
//   POST /adresse-facturations · GET /adresse-facturations/by-user
//   GET /adresse-facturations/:id · PATCH /adresse-facturations/:id
//   DELETE /adresse-facturations/:id
//   Admin: GET /adresse-facturations (paginated)
// ─────────────────────────────────────────────────────────────────────────────

export const adressesAPI = {
  /** Current user's addresses */
  getByUser: () => api.get('/adresse-facturations/by-user'),

  getById: (id) => api.get(`/adresse-facturations/${id}`),

  /**
   * Body: { firstName, lastName, adresse, complementAdresse?,
   *         city, region, country, codePostal, phone }
   */
  create: (data) => api.post('/adresse-facturations', data),

  update: (id, data) => api.patch(`/adresse-facturations/${id}`, data),

  delete: (id) => api.delete(`/adresse-facturations/${id}`),

  /** Admin only */
  getAll: (params = {}) => api.get('/adresse-facturations', { params }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CARTES BANCAIRES   (auth required)
//   POST /carte-bancaires · GET /carte-bancaires/by-user
//   GET /carte-bancaires/:id · PATCH /carte-bancaires/:id
//   DELETE /carte-bancaires/:id
// ─────────────────────────────────────────────────────────────────────────────

export const cartesAPI = {
  /** Current user's saved cards */
  getByUser: () => api.get('/carte-bancaires/by-user'),

  getById: (id) => api.get(`/carte-bancaires/${id}`),

  /**
   * Body: { carteName, carteNumber, carteDate, carteCVV }
   * NOTE: Store tokens / last-4 only in production — never raw card numbers.
   */
  create: (data) => api.post('/carte-bancaires', data),

  update: (id, data) => api.patch(`/carte-bancaires/${id}`, data),

  delete: (id) => api.delete(`/carte-bancaires/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES   (auth required)
//   POST /commandes/create               → creates order + Stripe Checkout session
//   GET  /commandes/by-user              → current user's orders
//   GET  /commandes/:reference           → single order by reference
//   GET  /commandes/payment/success?orderId=&session_id=
//   GET  /commandes/payment/cancel?orderId=
//   Admin: GET /commandes (paginated)
// ─────────────────────────────────────────────────────────────────────────────

export const commandesAPI = {
  /**
   * Body: { cbId: string, abonnements: [{ productId, quantity, periode: 'MOIS'|'ANNEE', dateDebut?, dateFin?, price? }] }
   * Returns: { commande, url, sessionId }  → redirect window to `url`
   */
  create: (data) => api.post('/commandes/create', data),

  /** Current user's orders */
  getByUser: (params = {}) => api.get('/commandes/by-user', { params }),

  /** Single order by reference (owner or admin) */
  getByReference: (reference) => api.get(`/commandes/${reference}`),

  /** Confirm Stripe payment success */
  paymentSuccess: (orderId, sessionId) =>
    api.get('/commandes/payment/success', { params: { orderId, session_id: sessionId } }),

  /** Admin only — paginated list of all orders */
  getAll: (params = {}) => api.get('/commandes', { params }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT   POST /contact (public)
// ─────────────────────────────────────────────────────────────────────────────

export const contactAPI = {
  /** Body: { email, subject, message } */
  create: (data) => api.post('/contact', data),
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH   GET /search
//   Params: text?, categories[]?, services[]?, minPrice?, maxPrice?,
//           onlyAvailable?, sortBy? (prix|nouveauté|disponibilité),
//           sortOrder? (asc|desc), page?, limit?
// ─────────────────────────────────────────────────────────────────────────────

export const searchAPI = {
  /**
   * Advanced product search.
   * @param {Object} params
   * @param {string}   [params.text]
   * @param {string[]} [params.categories]   array of category IDs / slugs
   * @param {string[]} [params.services]     array of service IDs / slugs
   * @param {number}   [params.minPrice]
   * @param {number}   [params.maxPrice]
   * @param {boolean}  [params.onlyAvailable]
   * @param {'prix'|'nouveauté'|'disponibilité'} [params.sortBy]
   * @param {'asc'|'desc'} [params.sortOrder]
   * @param {number}   [params.page]
   * @param {number}   [params.limit]
   */
  search: (params = {}) => {
    // axios needs array params serialized as repeated keys: categories[]=...
    return api.get('/search', {
      params,
      paramsSerializer: (p) => {
        const sp = new URLSearchParams();
        Object.entries(p).forEach(([k, v]) => {
          if (v === undefined || v === null || v === '') return;
          if (Array.isArray(v)) v.forEach((item) => sp.append(k, item));
          else sp.append(k, String(v));
        });
        return sp.toString();
      },
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD   (aggregates several endpoints for the admin overview)
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardAPI = {
  fetchAll: async () => {
    const [pR, cR, uR, sR, slR] = await Promise.allSettled([
      api.get('/products',   { params: { limit: 1000 } }),
      api.get('/categories'),
      api.get('/users'),
      api.get('/services'),
      api.get('/sliders'),
    ]);
    const extract = (res) =>
      res.status === 'rejected' ? [] : extractList(res.value.data);
    return {
      products:   extract(pR),
      categories: extract(cR),
      users:      extract(uR),
      services:   extract(sR),
      sliders:    extract(slR),
    };
  },
};

export default api;
