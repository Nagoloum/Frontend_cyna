// src/pages/ErrorPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Image à gauche (moitié de l'écran sur desktop, pleine largeur sur mobile) */}
      <div className="w-full lg:w-1/2 relative overflow-hidden">
        <img
          src="images/404.jpeg"
          alt="Error background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Contenu à droite */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-8 py-16 transition-colors duration-700">
        <div className="text-center max-w-lg">
          {/* Numéro 404 */}
          <div className="flex flex-row items-center justify-center gap-8 mb-8">
            {/* Le grand 404 */}
            {/* Image à côté du 404 */}
            <div className="order-1 md:order-1">
              <img
                src="/logo.png"
                alt="Page not found illustration"
                className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl"
              />
            </div>

            <p className="text-8xl md:text-9xl font-bold text-indigo-600 dark:text-indigo-400 order-2 md:order-2">
              404
            </p>

          </div>

            {/* Titre */}
            <h1 className="mt-8 text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Page not found
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Sorry, we couldn’t find the page you’re looking for.
              It might have been removed, renamed, or is temporarily unavailable.
            </p>

            {/* Boutons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/getstarted"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-semibold text-lg rounded-full shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Back to Home
              </Link>

              <Link
                to="/auth"
                className="w-full sm:w-auto px-8 py-4 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold text-lg rounded-full hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-all duration-300"
              >
                Go to Login
              </Link>
            </div>

            {/* Lien support (optionnel) */}
            <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
              Need help?{' '}
              <a href="#" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Contact support <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </div>
      </div>
      );
}