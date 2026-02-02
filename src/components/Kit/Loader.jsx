// src/components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Arrière-plan semi-transparent qui s'adapte au thème */}
      <div className="absolute inset-0 bg-black/15 dark:bg-black/70 backdrop-blur-sm transition-colors duration-700" />

      {/* Conteneur du loader centré */}
      <div className="relative">
        <div className="relative w-32 h-32 sm:w-20 sm:h-20">
          {/* Cercle extérieur tournant (sens horaire) */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent 
                       border-r-indigo-500 dark:border-r-indigo-400 
                       border-b-indigo-500 dark:border-b-indigo-400 
                       animate-spin"
            style={{ animationDuration: '2.5s' }}
          />

          {/* Cercle intérieur tournant (sens anti-horaire) */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent 
                       border-t-indigo-500 dark:border-t-indigo-300 
                       animate-spin"
            style={{ animationDuration: '1.8s', animationDirection: 'reverse' }}
          />

          {/* Effet de glow doux et pulsation qui s'adapte au thème */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/30 dark:bg-indigo-400/20 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-indigo-500/20 dark:bg-indigo-300/10 animate-pulse" />
          <div className="absolute inset-8 rounded-full bg-indigo-400/10 dark:bg-indigo-200/5 animate-pulse delay-300" />
        </div>

      </div>
    </div>
  );
};

export default Loader;