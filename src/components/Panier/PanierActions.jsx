import { useNavigate } from 'react-router-dom';

export default function PanierActions() {
  const navigate = useNavigate();

  const handleContinuerAchats = () => {
    navigate('/produits');
  };

  const handlePasserCommande = () => {
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <button
        onClick={handlePasserCommande}
        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
      >
        Passer la commande
      </button>

      <button
        onClick={handleContinuerAchats}
        className="w-full bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-300 transition duration-300"
      >
        Continuer mes achats
      </button>
    </div>
  );
}