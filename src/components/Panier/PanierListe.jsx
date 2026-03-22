import PanierItem from './PanierItem';

export default function PanierListe({
  articles,
  supprimerArticle,
  mettreAJourQuantite,
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles du panier</h2>
      
      {articles.length === 0 ? (
        <p className="text-gray-600 text-center py-8">Aucun article dans le panier</p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <PanierItem
              key={article.id}
              article={article}
              supprimerArticle={supprimerArticle}
              mettreAJourQuantite={mettreAJourQuantite}
            />
          ))}
        </div>
      )}
    </div>
  );
}