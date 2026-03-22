import { useNavigate } from 'react-router-dom';

export default function PanierActions({ indisponible, isLogged, onLogin }) {
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      {!isLogged && (
        <button
          onClick={() => navigate('/auth')}
          className="w-full mb-3 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600"
        >
          Se connecter / créer un compte
        </button>
      )}

      {indisponible && (
        <p className="mb-3 text-sm text-red-700">
          Un ou plusieurs services sont indisponibles. Retirez-les ou remplacez-les avant de
          continuer.
        </p>
      )}

      <button
        onClick={() => navigate('/checkout')}
        disabled={indisponible}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          indisponible
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        Passer à la caisse
      </button>

      <button
        onClick={() => navigate('/produits')}
        className="w-full mt-3 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300"
      >
        Continuer mes achats
      </button>
    </div>
  );
}