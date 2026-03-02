import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// ─────────────────────────────────────────────
// Utilitaires JWT (lecture côté client uniquement,
// la vraie validation reste côté backend)
// ─────────────────────────────────────────────

/**
 * Décode le payload d'un JWT sans librairie externe.
 * Ne valide PAS la signature — c'est le rôle du backend.
 */
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    // atob ne gère pas le base64url → on remplace les caractères
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

/**
 * Vérifie si le token JWT est expiré côté client.
 * Ajoute 10s de marge pour éviter les faux positifs au bord.
 */
const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now() - 10_000;
};

/**
 * Extrait le rôle depuis le payload JWT.
 * Plus sûr que lire localStorage.user (que l'utilisateur peut falsifier).
 */
const getRoleFromToken = (token) => {
  const payload = decodeToken(token);
  // Adapte le nom du champ selon ce que ton backend met dans le JWT
  // Exemples courants : payload.role | payload.user?.role | payload.data?.role
  return payload?.role ?? payload?.user?.role ?? null;
};

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────

/**
 * RouteLayout — Garde de route universel
 *
 * Props :
 *   requireAuth   {boolean}  – la route nécessite d'être connecté
 *   allowedRoles  {string[]} – rôles autorisés (ex: ['admin', 'superadmin'])
 *   redirectTo    {string}   – redirection si non authentifié (défaut: '/auth')
 *   children      {ReactNode}
 *
 * Usage :
 *   // Route publique (login, forgot-password…)
 *   <RouteLayout><LoginPage /></RouteLayout>
 *
 *   // Route privée admin uniquement
 *   <RouteLayout requireAuth allowedRoles={['admin', 'superadmin']}>
 *     <DashboardPage />
 *   </RouteLayout>
 *
 *   // Route privée tous rôles
 *   <RouteLayout requireAuth>
 *     <ProfilePage />
 *   </RouteLayout>
 */
export default function RouteLayout({
  children,
  requireAuth = false,
  allowedRoles = [],
  redirectTo = '/auth',
}) {
  const location = useLocation();

  // ── Route publique : pas de vérification
  if (!requireAuth) return <>{children}</>;

  // ── 1. Vérification présence du token
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // ── 2. Vérification expiration côté client
  //    (le backend rejette de toute façon, mais on évite un aller-retour inutile)
  if (isTokenExpired(token)) {
    // Nettoyage propre avant redirection
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // ── 3. Vérification du rôle (si des rôles sont requis)
  if (allowedRoles.length > 0) {
    const role = getRoleFromToken(token);

    if (!role || !allowedRoles.includes(role)) {
      // Connecté mais pas le bon rôle → page d'accueil ou 403
      return <Navigate to="/home" replace />;
    }
  }

  // ── Tout est OK
  return <>{children}</>;
}
