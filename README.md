# Cyna Frontend

Interface utilisateur de la plateforme e-commerce de cybersécurité **Cyna** (SOC, EDR, XDR en abonnement). Construite avec React 19, Vite 7 et Tailwind CSS.

## Stack technique

| Outil | Rôle |
| --- | --- |
| React 19 | Framework UI |
| Vite 7 | Bundler et serveur de développement |
| React Router 7 | Routing SPA |
| Redux Toolkit | Gestion d'état global (auth, panier, notifications) |
| Tailwind CSS 3 | Styles utilitaires (design system dans `src/index.css`) |
| i18next | Internationalisation FR / EN / AR (avec support RTL) |
| Axios | Client HTTP vers l'API |
| Stripe Elements | Saisie de carte bancaire (aucune donnée carte brute) |
| Chart.js | Graphiques du tableau de bord admin |
| Sentry | Remontée des erreurs (si `VITE_SENTRY_DSN` est défini) |
| Vitest + Testing Library | Tests unitaires |

## Prérequis

- Node.js 20 ou plus récent
- npm 9 ou plus récent
- Le backend Cyna démarré sur <http://localhost:3000> (voir `Backend_cyna/`)

## Installation

```bash
cd Frontend_cyna
npm install
```

## Lancer en développement

```bash
npm run dev
```

L'application est accessible sur <http://localhost:5173>. L'URL de l'API est lue dans `.env` (`VITE_API_URL=http://localhost:3000/api`).

## Commandes disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation locale du build |
| `npm run lint` | Analyse ESLint |
| `npm test` | Tests unitaires (Vitest, une passe) |
| `npm run test:watch` | Tests en mode watch |

## Variables d'environnement

Les fichiers `.env` (développement) et `.env.production` (build de production) sont committés et ne contiennent que des valeurs publiques par nature.

| Variable | Rôle |
| --- | --- |
| `VITE_API_URL` | URL de l'API, avec le préfixe `/api` (ex. `http://localhost:3000/api`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe (obligatoire pour le paiement) |
| `VITE_SENTRY_DSN` | DSN Sentry (facultatif, monitoring) |
| `VITE_VAPID_PUBLIC_KEY` | Clé publique VAPID pour les notifications push (facultatif ; sans elle, la fonctionnalité push est désactivée) |
| `VITE_TVA_RATE` | Taux de TVA affiché (facultatif, défaut 0.20) |

Particularité : `VITE_API_URL` est injectée au build depuis les fichiers `.env` committés via `define` dans `vite.config.js`, afin qu'une variable obsolète du dashboard Vercel ne puisse pas la remplacer (incident réel documenté dans le fichier).

## Déploiement

Le déploiement de production se fait sur **Vercel** (projet `cynaapp`, déploiement automatique à chaque push). `vercel.json` porte la réécriture SPA et les en-têtes de sécurité (CSP, HSTS, X-Frame-Options, cache des assets).

Le backend de production est hébergé sur Render : `https://backend-cyna.onrender.com/api` (voir `.env.production`).

### Alternative Docker (locale)

Un `Dockerfile` multi-stage (Node puis Nginx) et un `nginx.conf` sont fournis pour un hébergement conteneurisé. Depuis la racine `Cyna/` :

```bash
cp .env.example .env       # renseigner MONGO_PASSWORD
docker-compose up --build -d
```

L'application est alors servie sur <http://localhost>.

## Structure du projet

```text
Frontend_cyna/
├── public/                 # Assets statiques (logo, sw.js pour le push)
├── src/
│   ├── components/
│   │   ├── Admin/          # Composants du backoffice (dashboard, produits)
│   │   ├── Auth/           # Connexion, inscription, 2FA, mots de passe
│   │   ├── Error/          # Page 404
│   │   ├── Home/           # Pages publiques (catalogue, panier, checkout, compte)
│   │   ├── Kit/            # Utilitaires UI (ThemeToggle)
│   │   ├── Policy/         # Pages légales (CGU, confidentialité, cookies)
│   │   └── ui/             # Composants de base (Card, Select, LoadError,
│   │                       #   ErrorBoundary, feedback : toasts + confirmations)
│   ├── layouts/            # Layout public, AdminLayout, RouteLayout (garde de route)
│   ├── lib/                # Helpers (pricing, stripe, push, préférences cookies)
│   ├── locales/            # fr.json, en.json, ar.json (clés alignées)
│   ├── pages/              # Pages routées (User/, Admin/, Auth/)
│   ├── services/           # Client API centralisé (api.js)
│   ├── store/              # Redux store et slices
│   ├── test/               # Configuration et tests Vitest
│   ├── i18n.js             # Configuration i18next + direction RTL
│   ├── App.jsx             # Routeur principal (lazy loading)
│   └── index.css           # Design system Cyna (variables CSS + Tailwind)
├── vercel.json             # Déploiement Vercel (SPA + en-têtes de sécurité)
├── Dockerfile              # Alternative conteneurisée (Node puis Nginx)
└── vite.config.js
```

## Internationalisation

Trois langues sont supportées : **français**, **anglais** et **arabe** (RTL). La langue est lue depuis `localStorage` (clé `lang`), avec repli sur l'anglais. La direction du document (`dir`) est synchronisée automatiquement dans `src/i18n.js`.

Pour ajouter une clé de traduction, éditer les trois fichiers `src/locales/fr.json`, `en.json` et `ar.json` (leurs clés doivent rester alignées).

## Gestion des erreurs

- `ErrorBoundary` global (monté dans `main.jsx`) : écran de repli et remontée à Sentry en cas d'erreur de rendu.
- `getApiErrorMessage()` (`src/services/api.js`) : transmet les messages métier du backend et remplace les erreurs techniques (réseau, 5xx) par un message générique traduit.
- `LoadError` (`src/components/ui/LoadError.jsx`) : état d'erreur avec bouton « Réessayer » sur les pages catalogue publiques.
- Toasts et boîtes de confirmation : `notify` / `confirmDialog` (`src/components/ui/feedback`).
