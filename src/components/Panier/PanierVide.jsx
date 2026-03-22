import { useNavigate } from 'react-router-dom';

export default function PanierVide() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
      <svg
        className="w-24 h-24 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m-12 9h14m-7-9v6m0 0v6"
        />
      </svg>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
      <p className="text-gray-600 text-center mb-8">
        Découvrez nos produits et ajoutez-les à votre panier
      </p>

      <button
        onClick={() => navigate('/produits')}
        className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300"
      >
        Continuer vos achats
      </button>
    </div>
  );
}