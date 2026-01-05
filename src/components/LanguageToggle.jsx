// src/components/BrowserTranslateToggle.jsx
import { useState } from 'react';

export default function BrowserTranslateToggle() {
  const [isFrench, setIsFrench] = useState(true);

  const toggleTranslation = () => {
    const targetLang = isFrench ? 'en' : 'fr';

    // Change la langue HTML
    document.documentElement.lang = targetLang;

    // Force Chrome à proposer la traduction en rechargeant avec un paramètre
    const separator = window.location.search ? '&' : '?';
    window.location.href = window.location.href + separator + '_translate_to=' + targetLang + '&_t=' + Date.now();

    setIsFrench(!isFrench);
  };

  return (
    <button
      onClick={toggleTranslation}
      className="fixed bottom-24 right-8 z-40 p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex items-center gap-2"
      title="Traduire la page avec le traducteur du navigateur"
    >
      <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {isFrench ? 'EN' : 'FR'}
      </span>
      <span className="text-2xl">
        {isFrench ? '🇬🇧' : '🇫🇷'}
      </span>
    </button>
  );
}