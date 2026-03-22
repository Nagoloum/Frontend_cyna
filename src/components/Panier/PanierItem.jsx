export default function PanierItem({
  article,
  supprimerArticle,
  mettreAJourQuantite,
  changerDuree,
}) {
  const multiplicateur = article.durée === 'annuel' ? 10 : 1; // ex : annuel = 10 mois payés
  const prixUnitaire = article.prix * multiplicateur;
  const sousTotal = prixUnitaire * article.quantite;

  return (
    <div
      className={`flex gap-4 p-4 rounded-lg border ${
        article.disponible ? 'bg-white border-gray-200' : 'bg-gray-100 border-red-200 opacity-80'
      }`}
    >
      <img
        src={article.image}
        alt={article.nom}
        className="w-24 h-24 object-cover rounded-lg"
      />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{article.nom}</h3>
          {!article.disponible && (
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
              Indisponible
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-2 text-sm text-gray-700">
          <div>
            Durée :
            <select
              value={article.durée}
              onChange={(e) => changerDuree(article.id, e.target.value)}
              className="ml-2 rounded border border-gray-300 px-2 py-1"
            >
              <option value="mensuel">Mensuel</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!article.disponible}
              onClick={() => mettreAJourQuantite(article.id, article.quantite - 1)}
              className="w-8 h-8 rounded border border-gray-300 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 text-center">{article.quantite}</span>
            <button
              disabled={!article.disponible}
              onClick={() => mettreAJourQuantite(article.id, article.quantite + 1)}
              className="w-8 h-8 rounded border border-gray-300 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <p className="text-gray-600">
            Prix unitaire : {prixUnitaire.toFixed(2)} € / {article.durée}
          </p>
          <p className="text-gray-900 font-bold">Total : {sousTotal.toFixed(2)} €</p>
        </div>
      </div>

      <button
        onClick={() => supprimerArticle(article.id)}
        className="self-start text-red-600 hover:text-red-800 text-sm font-semibold"
      >
        Retirer
      </button>
    </div>
  );
}