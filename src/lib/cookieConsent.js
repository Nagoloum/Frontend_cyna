// ─────────────────────────────────────────────────────────────────────────────
// Consentement cookies (RGPD).
// Le choix est stocké une seule fois sous la clé "cookieConsent" :
//   'accepted' → toutes les fonctionnalités utilisant les cookies sont actives
//   'refused'  → aucune fonctionnalité utilisant les cookies n'est disponible
//   null       → aucun choix encore fait (le bandeau doit s'afficher)
// Le stockage du choix lui-même est strictement nécessaire (exempt de
// consentement) : il évite de redemander à chaque visite.
// ─────────────────────────────────────────────────────────────────────────────

export const COOKIE_CONSENT_KEY = 'cookieConsent';

// Clés posées par les fonctionnalités soumises au consentement (session,
// panier, préférences). Purgées lors d'un refus.
const GATED_KEYS = ['token', 'user', 'twoFAVerified', 'twoFARequired', 'twoFAMethod', 'cart', 'theme', 'lang'];

export const getCookieConsent = () => {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === 'accepted' || value === 'refused' ? value : null;
  } catch {
    return null;
  }
};

/** True uniquement si l'utilisateur a explicitement accepté les cookies. */
export const cookiesAllowed = () => getCookieConsent() === 'accepted';

export const setCookieConsent = (value) => {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    if (value === 'refused') {
      GATED_KEYS.forEach((key) => localStorage.removeItem(key));
    }
  } catch { /* stockage indisponible : le bandeau réapparaîtra */ }
  window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: value }));
};

/**
 * Rouvre le bandeau de consentement pour permettre de modifier son choix
 * (lien « Préférences de cookies » du footer, ou connexion bloquée).
 */
export const openCookieBanner = () => {
  window.dispatchEvent(new CustomEvent('cookie-consent-reopen'));
};
