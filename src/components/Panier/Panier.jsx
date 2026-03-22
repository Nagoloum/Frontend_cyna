import { useState } from 'react';
import PanierListe from './PanierListe';
import PanierResume from './PanierResume';
import PanierVide from './PanierVide';
import PanierActions from './PanierActions';

export default function Panier() {
  const [articles, setArticles] = useState([
    {
      id: 1,
      nom: 'Produit 1',
      prix: 29.99,
      quantite: 2,
      image: '/images/produit1.jpg',
    },
    {
      id: 2,
      nom: 'Produit 2',
      prix: 49.99,
      quantite: 1,
      image: '/images/produit2.jpg',
    },
  ]);

  const supprimerArticle = (id) => {
    setArticles(articles.filter((article) => article.id !== id));
  };

  const mettreAJourQuantite = (id, nouvelleQuantite) => {
    if (nouvelleQuantite <= 0) {
      supprimerArticle(id);
      return;
    }
    setArticles(
      articles.map((article) =>
        article.id === id ? { ...article, quantite: nouvelleQuantite } : article
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mon Panier</h1>

        {articles.length === 0 ? (
          <PanierVide />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2">
              <PanierListe
                articles={articles}
                supprimerArticle={supprimerArticle}
                mettreAJourQuantite={mettreAJourQuantite}
              />
            </div>

            {/* Résumé et actions */}
            <div>
              <PanierResume articles={articles} />
              <PanierActions />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}