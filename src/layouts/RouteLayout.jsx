import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

export default function RouteLayout({ children, requireAuth = false }) {  // false par défaut = routes publiques
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let redirected = false; // Flag pour éviter les doubles redirects

    const checkAuthAndLoad = () => {
      if (requireAuth) {
        const token = localStorage.getItem('token');

        if (!token && !redirected) {
          redirected = true;
          navigate('/auth', { replace: true, state: { from: location } });
          return; // Stoppe tout le reste
        }
      }

      // Loader même sur routes publiques
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 600); // Transition fluide

      return () => clearTimeout(timer);
    };

    checkAuthAndLoad();
  }, [location.pathname, requireAuth, navigate, location]); // Seulement pathname, pas tout l'objet location !

  return (
    <>
      {/* Loader plein écran */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
          <Loader />
        </div>
      )}

      {/* Contenu avec belle transition */}
      <div
        className={`transition-all duration-700 ease-in-out ${
          loading
            ? 'opacity-0 translate-y-4'
            : 'opacity-100 translate-y-0'
        }`}
      >
        {children}
      </div>
    </>
  );
}