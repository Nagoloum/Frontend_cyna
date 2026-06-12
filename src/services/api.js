import { notify } from '@/components/ui/feedback';
import axios from 'axios';
import i18n from '../i18n';
import { cookiesAllowed, openCookieBanner } from '../lib/privacyPrefs';
import { store } from '../store';
import { archiveOnLogout, mergeOnLogin } from '../store/slices/cartSlice';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build absolute URL for stored images (storage/*).
 * Accepts either a path string or an image object ({ path | url | src }).
 */
export const buildImageUrl = (input) => {
  if (!input) return null;
  const path =
    typeof input === 'string'
      ? input
      : input?.path ?? input?.url ?? input?.src ?? null;
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${clean}`;
};

/** Extract the raw stored path from an image object/string (for resending to backend). */
export const getImagePath = (input) => {
  if (!input) return null;
  if (typeof input === 'string') return input;
  return input?.path ?? input?.url ?? input?.src ?? null;
};

/** Default product placeholder image served from /public */
export const DEFAULT_PRODUCT_IMAGE = '/images/img.jpg';

/** Resolve the first usable image URL for a product, or fall back to the default. */
export const getProductImage = (product) => {
  const images = product?.images ?? [];
  return buildImageUrl(images[0]) ?? DEFAULT_PRODUCT_IMAGE;
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
  // Envoie automatiquement le cookie httpOnly accessToken sur chaque requête
  // cross-origin (défini par le backend sur login/2FA).
  withCredentials: true,
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

// Réponses d'erreur :
// - Le backend renvoie désormais de vrais codes HTTP 4xx pour les erreurs
//   métier, marquées par l'en-tête `X-App-Error`. Ces réponses portent notre
//   enveloppe { success:false, message } : on les "re-résout" pour que le code
//   appelant continue de lire `res.data.success` exactement comme avant (il
//   recevait un 200 auparavant). Comportement frontend strictement inchangé.
// - Un 401 SANS ce marqueur = session expirée / non authentifié (guard) →
//   déconnexion automatique (sauf sur les endpoints d'auth publics).
// - Les erreurs techniques (5xx, réseau) continuent d'être rejetées.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAppError = error.response?.headers?.['x-app-error'] === '1';

    if (
      status === 401 &&
      !isAppError &&
      localStorage.getItem('token') &&
      !String(error.config?.url ?? '').includes('/auth/')
    ) {
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
      return Promise.reject(error);
    }

    // Erreur métier de l'API → on la présente comme une réponse résolue.
    if (isAppError && error.response) {
      return Promise.resolve(error.response);
    }

    return Promise.reject(error);
  }
);

/**
 * Message d'erreur présentable à l'utilisateur.
 * - Messages métier du backend (4xx) : transmis tels quels.
 * - Erreurs levées localement (ex. consentement cookies) : transmises.
 * - Erreurs techniques (réseau, 5xx, exceptions JS) : remplacées par un
 *   message générique — ne jamais exposer de détails internes.
 */
export const getApiErrorMessage = (err, fallback) => {
  const status = err?.response?.status;
  const m = err?.response?.data?.message;
  if (status && status < 500 && m) {
    return Array.isArray(m) ? m.join(' · ') : String(m);
  }
  if (!err?.response && !err?.request && err?.message) {
    return err.message;
  }
  return fallback ?? 'Une erreur est survenue. Veuillez réessayer plus tard.';
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH   POST /auth/login · POST /auth/register · GET /auth/user/me
//        POST /auth/forgot-password · POST /auth/change-password?token=
//        GET  /auth/email-confirmation?token=
// ─────────────────────────────────────────────────────────────────────────────

/** Decode a JWT payload (no signature check display-only). */
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const login = async (credentials) => {
  // La session repose sur un stockage local (token) : sans consentement
  // cookies, la connexion fait partie des fonctionnalités indisponibles.
  // Le bandeau est rouvert pour permettre d'accepter puis réessayer.
  if (!cookiesAllowed()) {
    openCookieBanner();
    throw new Error(i18n.t('cookie_banner.login_blocked'));
  }
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
  // Clear any prior 2FA state a fresh login restarts the flow.
  localStorage.removeItem('twoFAVerified');
  localStorage.removeItem('twoFARequired');
  setAuthToken(token);

  // Merge any items the user added while anonymous with their previously
  // archived cart (kept across sessions in localStorage under cart:<userId>).
  if (user?._id) store.dispatch(mergeOnLogin(user._id));

  // Per-user 2FA method ('NONE' | 'EMAIL' | 'TOTP') drives the post-login step.
  const twoFactorMethod = data.data.twoFactorMethod ?? 'NONE';

  return { token, user, twoFactorMethod };
};

export const authAPI = {
  login,

  /**
   * Clear the session WITHOUT redirecting (archives the cart, wipes tokens).
   * Used by the /logout page which controls the redirect + loading UI itself.
   */
  clearSession: () => {
    // Archive the current cart under this user's slot before clearing the
    // active cart, so they find their items again at next login.
    let archivedFor = null;
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      archivedFor = stored?._id ?? stored?.id ?? null;
    } catch { /* ignore */ }
    store.dispatch(archiveOnLogout(archivedFor));

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('twoFAVerified');
    localStorage.removeItem('twoFARequired');
    setAuthToken(null);

    // Efface le cookie httpOnly côté serveur (le JS ne peut pas le lire/supprimer
    // directement — seul le backend peut le révoquer via Set-Cookie).
    api.post('/auth/logout').catch(() => { /* fire-and-forget */ });
  },

  logout: () => {
    authAPI.clearSession();
    window.location.href = '/auth';
  },

  /** GET /auth/user/me returns the current logged-in user */
  me: async () => {
    const res = await api.get('/auth/user/me');
    return res.data?.data ?? res.data;
  },

  /** POST /auth/register */
  register: (data) => api.post('/auth/register', data),

  /** POST /auth/check-code  { code: "123456" } verifies the 6-digit EMAIL 2FA code */
  verify2FA: (code) => api.post('/auth/check-code', { code }),

  /** POST /auth/2fa/totp/verify { code } — verifies a TOTP code at the login 2FA step */
  verifyTotp: (code) => api.post('/auth/2fa/totp/verify', { code }),

  // ── 2FA management (settings) ──
  /** POST /auth/2fa/totp/init → { otpauthUrl, qrDataUrl, secret } */
  setupTotp: () => api.post('/auth/2fa/totp/init'),
  /** POST /auth/2fa/totp/activate { code } — verify code then enable Google Authenticator */
  activateTotp: (code) => api.post('/auth/2fa/totp/activate', { code }),
  /** POST /auth/2fa/email/activate — enable email 2FA */
  activateEmail2FA: () => api.post('/auth/2fa/email/activate'),
  /** POST /auth/2fa/disable { password } — disable 2FA (password required) */
  disable2FA: (password) => api.post('/auth/2fa/disable', { password }),

  /** GET /auth/email-confirmation?token= */
  emailConfirmation: (token) =>
    api.get(`/auth/email-confirmation?token=${encodeURIComponent(token)}`),

  /** POST /auth/forgot-password  { email } sends a reset link */
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
  /** Admin only list all users */
  getAll: (params = {}) => api.get('/users', { params }),

  getById: (id) => api.get(`/users/${id}`),

  /**
   * PATCH /users/profil/:id
   * Backend DTO accepts only { firstName, lastName, email }.
   * Password changes go through `changePassword` (it verifies the current password).
   */
  updateProfile: (id, data) => api.patch(`/users/profil/${id}`, data),

  /**
   * PATCH /users/profil/change-password
   * Body: { currentPassword, newPassword, confirmPassword }
   * The backend verifies the current password (bcrypt) and the new-password strength.
   */
  changePassword: (data) => api.patch('/users/profil/change-password', data),

  /** DELETE /users/:id */
  delete: (id) => api.delete(`/users/${id}`),

  /** PATCH /users/:id/status — admin suspend/reactivate. Body: { isActive } */
  setActive: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES   GET /categories · GET /categories/category-by-order
//              GET /categories/category-for-user/:slug · GET /categories/:slug
//              POST /categories (multipart) · PATCH /categories/:slug (multipart)
//              DELETE /categories/:slug
// ─────────────────────────────────────────────────────────────────────────────

export const categoriesAPI = {
  /** Paginated list admin */
  getAll: (params = {}) => api.get('/categories', { params }),

  /** Ordered list for homepage grid */
  getAllByOrder: () => api.get('/categories/category-by-order'),

  /** Public category page with its products */
  getBySlugForUser: (slug) => api.get(`/categories/category-for-user/${slug}`),

  /** Full details admin */
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
  /** Paginated list supports { page, limit, sortBy, order, search, categorySlug } */
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
  /** Full list admin */
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

  /** GET /adresse-facturations/defaut/:id — marks this address as default (unsets the others). */
  setDefault: (id) => api.get(`/adresse-facturations/defaut/${id}`),

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
   * POST /carte-bancaires/setup-intent
   * Creates a Stripe SetupIntent (usage: off_session) so a card can be saved
   * WITHOUT being charged. Returns { clientSecret, setupIntentId, stripeCustomerId }.
   */
  createSetupIntent: () => api.post('/carte-bancaires/setup-intent'),

  /**
   * Body: { carteName, carteNumber, carteDate, carteCVV }
   * NOTE: Store tokens / last-4 only in production never raw card numbers.
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
   * Body: { cbId, adresseFacturationId, abonnements: [{ productId, quantity, periode: 'MOIS'|'ANNEE' }] }
   * Charges the saved card off-session (no redirect). Returns ApiResponse whose
   * `data.status` is 'PAID' | 'REQUIRES_ACTION' (with clientSecret) | 'PENDING'.
   */
  create: (data) => api.post('/commandes/create', data),

  /**
   * Guest checkout (no account needed upfront). Body: {
   *   email, firstName, lastName, adresse, complementAdresse?, city, region,
   *   country, codePostal, phone, stripePaymentMethodId, abonnements:[...]
   * }. Returns `data.status` = 'PAID' | 'REQUIRES_ACTION' (clientSecret) | 'PENDING'.
   */
  guestCheckout: (data) => api.post('/commandes/guest-checkout', data),

  /** Current user's orders */
  getByUser: (params = {}) => api.get('/commandes/by-user', { params }),

  /** Single order by reference (owner or admin) */
  getByReference: (reference) => api.get(`/commandes/${reference}`),

  /** Download the order's PDF invoice (generated on the fly). Returns a Blob. */
  downloadInvoice: async (reference) => {
    const res = await api.get(
      `/commandes/${encodeURIComponent(reference)}/facture`,
      { responseType: 'blob' }
    );
    return res.data;
  },

  /** Confirm a Stripe payment (after 3-D Secure) — pass the PaymentIntent id. */
  paymentSuccess: (orderId, sessionId, paymentIntentId) =>
    api.get('/commandes/payment/success', {
      params: { orderId, session_id: sessionId, payment_intent: paymentIntentId },
    }),

  /** Admin only paginated list of all orders */
  getAll: (params = {}) => api.get('/commandes', { params }),

  /** Admin only — change an order's status. statut: 'PENDING'|'PAID'|'CANCELED' */
  updateStatut: (id, statut) =>
    api.patch(`/commandes/${id}/statut`, { statut }),

  // ── Subscriptions (abonnements) ──
  /** Current user's subscriptions (flattened across orders, raw ISO dates). */
  getAbonnements: () => api.get('/commandes/abonnements/by-user'),

  /** Cancel a subscription. */
  resilierAbonnement: (id) => api.get(`/commandes/abonnement/resilier/${id}`),

  /** Modify a subscription — body: { quantity, periode: 'MOIS'|'ANNEE' } (price recomputed, no charge). */
  updateAbonnement: (id, data) => api.patch(`/commandes/abonnement/${id}`, data),

  /**
   * Renew a subscription — charges the saved card off-session.
   * Returns `data.status` = 'PAID' | 'REQUIRES_ACTION' (with clientSecret) | 'PENDING'.
   */
  renouvelerAbonnement: (id) => api.post(`/commandes/abonnement/renouveler/${id}`),

  /** Finalize a renewal after 3-D Secure — pass the confirmed PaymentIntent id. */
  confirmRenouvellement: (id, paymentIntentId) =>
    api.post(`/commandes/abonnement/renouveler/${id}/confirm`, { paymentIntentId }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT   POST /contact (public)
// ─────────────────────────────────────────────────────────────────────────────

export const contactAPI = {
  /** Body: { email, subject, message } */
  create: (data) => api.post('/contact', data),

  /** Admin — list contact messages (paginated when page/limit are passed) */
  getAll: (params = {}) => api.get('/contact', { params }),

  /** Admin — reply to a message (persists + emails the customer). */
  reply: (id, message) => api.patch(`/contact/${id}/reply`, { message }),

  /** Admin — set ticket status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED'. */
  setStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),

  /** Admin — delete a message */
  remove: (id) => api.delete(`/contact/${id}`),
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
    const [pR, cR, uR, sR, slR, oR] = await Promise.allSettled([
      api.get('/products',   { params: { limit: 1000 } }),
      api.get('/categories'),
      api.get('/users'),
      api.get('/services'),
      api.get('/sliders'),
      api.get('/commandes',  { params: { limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' } }),
    ]);
    const extract = (res) =>
      res.status === 'rejected' ? [] : extractList(res.value.data);
    return {
      products:   extract(pR),
      categories: extract(cR),
      users:      extract(uR),
      services:   extract(sR),
      sliders:    extract(slR),
      commandes:  extract(oR),
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT   GET /audit-logs (admin, paginated, read-only)
// ─────────────────────────────────────────────────────────────────────────────

export const auditAPI = {
  /** Admin — paginated audit log. params: { page, limit, search } */
  getAll: (params = {}) => api.get('/audit-logs', { params }),
};

// ─────────────────────────────────────────────────────────────────────────────
// COUPONS   POST /coupons/validate (public) · admin CRUD on /coupons
// ─────────────────────────────────────────────────────────────────────────────

export const couponsAPI = {
  /** Validate a code against an HT amount. Body: { code, amount }. */
  validate: (code, amount) => api.post('/coupons/validate', { code, amount }),

  /** Admin — list coupons (paginated when page/limit passed). */
  getAll: (params = {}) => api.get('/coupons', { params }),
  /** Admin — create a coupon. */
  create: (data) => api.post('/coupons', data),
  /** Admin — update a coupon. */
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  /** Admin — delete a coupon. */
  remove: (id) => api.delete(`/coupons/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// PUSH   POST /push/subscribe · POST /push/unsubscribe
// ─────────────────────────────────────────────────────────────────────────────

export const pushAPI = {
  /** Enregistre (ou met à jour) la souscription push de l'appareil courant. */
  subscribe: (sub) =>
    api.post('/push/subscribe', { endpoint: sub.endpoint, keys: sub.keys }),

  /** Supprime la souscription push de l'appareil courant. */
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }),
};

export default api;
