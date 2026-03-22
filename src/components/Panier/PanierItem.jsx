export default function PanierItem({
  article,
  supprimerArticle,
  mettreAJourQuantite,
}) {
  const sousTotal = article.prix * article.quantite;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      {/* Image produit */}
      <div className="flex-shrink-0">
        <img
          src={article.image}
          alt={article.nom}
          className="w-24 h-24 object-cover rounded-lg"
        />
      </div>

      {/* Détails produit */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900">{article.nom}</h3>
        <p className="text-gray-600 mt-1">{article.prix.toFixed(2)} €</p>

        {/* Contrôle quantité */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => mettreAJourQuantite(article.id, article.quantite - 1)}
            className="px-3 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
          >
            −
          </button>
          <span className="text-gray-900 font-semibold w-8 text-center">
            {article.quantite}
          </span>
          <button
            onClick={() => mettreAJourQuantite(article.id, article.quantite + 1)}
            className="px-3 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
          >
            +
          </button>
        </div>
      </div>

      {/* Sous-total et bouton supprimer */}
      <div className="flex flex-col items-end justify-between">
        <p className="text-lg font-bold text-gray-900">{sousTotal.toFixed(2)} €</p>
        <button
          onClick={() => supprimerArticle(article.id)}
          className="text-red-600 hover:text-red-800 font-semibold text-sm transition"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}