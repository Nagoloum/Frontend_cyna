// src/pages/GetStartedPage.jsx (ou GetStartedComponent.jsx)
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GetStartedPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth'); // Redirige vers la page de connexion/inscription
  };

  return (
    <div className="h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 ">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-screen">

          {/* Image à gauche (cachée sur petit écran ou en haut sur mobile) */}
          <div className="order-2 lg:order-1 hidden lg:block justify-center lg:justify-end">
            <img
              src="images/img.jpg"
              alt="Productivité et organisation"
              className="rounded-3xl shadow-2xl max-w-full h-auto object-cover max-h-96 lg:max-h-full"
            />
          </div>

          {/* Contenu à droite */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8 gap-4">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-16 lg:w-16 object-contain"
                alt="CYNA Logo"
              >
                <path
                  d="M16.8693 0.0138722C17.512 0.0971052 18.169 0.152594 18.8117 0.291316C24.8246 1.55368 28.8237 5.06334 30.9089 10.64C31.1946 11.4168 31.3231 12.2491 31.4945 13.0676C31.5802 13.4976 31.4945 13.5809 31.0374 13.5809C29.7092 13.5809 28.3809 13.6641 27.0527 13.567C24.0534 13.3312 21.1683 12.6514 18.5261 11.1671C16.8408 10.2099 15.1269 10.1822 13.4273 11.1671C11.642 12.1936 10.5279 13.6363 10.5422 15.731C10.5422 16.1056 10.6279 16.5079 10.7707 16.8408C11.4991 18.5471 12.6132 19.9066 14.5127 20.4753C16.0267 20.9192 17.4549 20.6002 18.7974 19.8927C20.797 18.8384 22.8965 18.0754 25.1531 17.8396C26.9384 17.6454 28.7523 17.5899 30.5518 17.5206C31.2945 17.4928 31.523 17.7841 31.4659 18.5194C31.2517 20.9747 30.2376 23.0972 28.6237 24.9699C26.2814 27.6889 23.4249 29.6726 19.8258 30.5465C16.498 31.3511 13.1702 31.3927 9.98521 30.0333C5.34344 28.0357 1.95852 24.7896 0.630254 19.9759C-1.79775 11.1116 3.04398 3.48192 10.785 0.901691C12.1847 0.430037 13.6415 0.166466 15.1269 0.0693609C15.2268 0.0693609 15.3268 0.0277443 15.4411 0H16.8836L16.8693 0.0138722Z"
                  fill="url(#paint0)"
                />
                <defs>
                  <linearGradient id="paint0" x1="0" y1="16" x2="32" y2="16" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#302082" />
                    <stop offset="1" stop-color="#7C00FF" />
                  </linearGradient>
                </defs>
              </svg>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                Cyna
              </h1>

            </div>

            {/* Titre et description */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Welcome to <span className="text-indigo-600 dark:text-indigo-400">CYNA</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-12">
              Discover security products and services to guarantee your well-being and protect your privacy.
            </p>

            {/* Bouton Call to Action */}
            <button
              onClick={handleGetStarted}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-lg rounded-full shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started →
            </button>

            {/* Petit texte secondaire (optionnel) */}
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              No Money needed to start · Credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}