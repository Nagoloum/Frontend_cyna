# Cyna — Frontend

Interface utilisateur de la plateforme SaaS de cybersécurité **Cyna**. Construite avec React 19, Vite 7 et Tailwind CSS.

---

## Stack technique

| Outil | Version | Rôle |
| --- | --- | --- |
| React | 19.2 | Framework UI |
| Vite | 7.2 | Bundler & dev server |
| React Router | 7.11 | Routing SPA |
| Redux Toolkit | 2.12 | Gestion d'état global |
| Tailwind CSS | 3.4 | Styles utilitaires |
| i18next | 26.3 | Internationalisation (FR / EN) |
| Axios | 1.13 | Requêtes HTTP vers l'API |
| Lucide React | 0.562 | Icônes |
| Radix UI + Shadcn | — | Composants accessibles |

---

## Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (inclus avec Node)
- Le **backend Cyna** démarré sur <http://localhost:3000> (voir `Backend_cyna/`)

---

## Installation

```bash
# 1. Se placer dans le dossier frontend
cd Frontend_cyna

# 2. Installer les dépendances
npm install
```

---

## Lancer en développement

```bash
npm run dev
```

L'application est accessible sur <http://localhost:5173>.

Le proxy Vite redirige automatiquement les requêtes `/api/*` vers `http://localhost:3000`.

---

## Commandes disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Démarre le serveur de développement avec HMR |
| `npm run build` | Compile l'application pour la production dans `dist/` |
| `npm run preview` | Prévisualise le build de production localement |
| `npm run lint` | Analyse le code avec ESLint |

---

## Variables d'environnement

Aucune variable d'environnement n'est requise pour le développement local. Le proxy est configuré dans `vite.config.js` :

```js
server: {
  proxy: {
    "/api": "http://localhost:3000",
  },
}
```

Pour un déploiement personnalisé, créer un fichier `.env` à la racine de `Frontend_cyna/` :

```env
VITE_API_URL=https://votre-domaine.com
```

---

## Structure du projet

```text
Frontend_cyna/
├── public/                 # Assets statiques (logo, favicon…)
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── Admin/          # Tableau de bord administrateur
│   │   ├── Home/           # Navbar, Footer, Hero, grilles…
│   │   ├── Kit/            # Utilitaires UI (ThemeToggle, LanguageToggle)
│   │   ├── Policy/         # Pages légales (CGU, confidentialité, cookies)
│   │   └── ui/             # Composants de base (ChatBot, feedback…)
│   ├── layouts/            # Layouts (Layout, AdminLayout, RouteLayout)
│   ├── locales/            # Fichiers de traduction
│   │   ├── fr.json         # Français
│   │   └── en.json         # Anglais
│   ├── pages/              # Pages (User/, Admin/, Auth/)
│   ├── services/           # Clients API (api.js, cart.js)
│   ├── store/              # Redux store et slices
│   │   └── slices/         # auth, cart, ui, notifications, productForm
│   ├── i18n.js             # Configuration i18next
│   ├── App.jsx             # Routeur principal
│   ├── main.jsx            # Point d'entrée React
│   └── index.css           # Design system Cyna (variables CSS + Tailwind)
├── Dockerfile              # Build multi-stage (Node → Nginx)
├── nginx.conf              # Config Nginx pour SPA + proxy API
├── vite.config.js
└── tailwind.config.js
```

---

## Internationalisation

L'application supporte le **français** et l'**anglais**. La langue est détectée automatiquement depuis le `localStorage` (clé `lang`), avec fallback sur l'anglais.

Pour ajouter une clé de traduction, éditer les deux fichiers :

- `src/locales/fr.json`
- `src/locales/en.json`

---

## Déploiement avec Docker

Un `Dockerfile` multi-stage est fourni. Il compile l'application avec Node puis la sert via Nginx sur le port **80**.

```bash
# Build de l'image
docker build -t cyna-frontend .

# Lancer le conteneur
docker run -p 80:80 cyna-frontend
```

Pour lancer l'ensemble de la stack (frontend + backend + MongoDB) depuis la racine du projet :

```bash
# Depuis Cyna/ (dossier racine)
cp .env.example .env       # Renseigner MONGO_PASSWORD
docker-compose up --build -d
```

L'application sera accessible sur <http://localhost>.

---

## Comptes de test

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | <admin@cyna-it.fr> | *(défini lors du seed)* |
| Utilisateur | <user@example.com> | *(défini lors du seed)* |
