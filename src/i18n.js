import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';

const savedLang = localStorage.getItem('lang') || 'en';

// Langues à écriture de droite à gauche (fondation pour l'arabe/hébreu).
const RTL_LANGS = ['ar', 'he', 'fa', 'ur'];

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Synchronise <html lang> et <html dir> avec la langue active : indispensable
// pour les lecteurs d'écran (lang) et le support RTL (dir).
const applyHtmlLangDir = (lng) => {
  if (typeof document === 'undefined') return;
  const base = String(lng || 'en').split('-')[0];
  document.documentElement.lang = base;
  document.documentElement.dir = RTL_LANGS.includes(base) ? 'rtl' : 'ltr';
};

applyHtmlLangDir(i18n.language || savedLang);
i18n.on('languageChanged', applyHtmlLangDir);

export default i18n;
