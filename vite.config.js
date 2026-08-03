import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lit un fichier .env sans passer par process.env (contrairement à loadEnv,
// où une variable d'environnement du build — ex. dashboard Vercel — écrase le
// fichier ; c'est ainsi qu'un VITE_API_URL obsolète côté Vercel a pointé la
// prod sur un ancien backend).
const parseEnvFile = (file) => {
  try {
    return Object.fromEntries(
      fs.readFileSync(file, "utf8").split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
    );
  } catch {
    return {};
  }
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_API_URL : les fichiers .env committés font foi. Les autres VITE_*
  // gardent le comportement Vite standard (process.env prioritaire).
  const fileEnv = {
    ...parseEnvFile(path.resolve(__dirname, ".env")),
    ...parseEnvFile(path.resolve(__dirname, `.env.${mode}`)),
  };
  return {
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(fileEnv.VITE_API_URL),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
  };
});
