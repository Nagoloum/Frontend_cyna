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
              src="images/img1.jpg"
              alt="Productivité et organisation"
              className="rounded-3xl shadow-2xl max-w-full h-auto object-cover max-h-96 lg:max-h-full"
            />
          </div>

          {/* Contenu à droite */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8">
              <img 
                src="/logo.png" 
                alt="RememberMe Logo" 
                className="h-24 w-24 "
              />
            </div>

            {/* Titre et description */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Welcome to <span className="text-indigo-600 dark:text-indigo-400">RememberMe</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-12">
              Organize your tasks easily and increase your productivity. 
              A simple, intuitive, and efficient app to manage your daily life with style.
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
              No Money needed to start · Free forever
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}