import { useMemo, useState } from 'react';
import PanierListe from './PanierListe';
import PanierResume from './PanierResume';
import PanierVide from './PanierVide';
import PanierActions from './PanierActions';

const servicesInit = [
  {
    id: 1,
    nom: 'Cyna EDR',
    prix: 15.0,
    quantite: 5,
    durée: 'mensuel', // mensuel | annuel
    disponible: true,
    image: '/images/service-edr.jpg',
  },
  {
    id: 2,
    nom: 'Cyna XDR',
    prix: 25.0,
    quantite: 2,
    durée: 'annuel',
    disponible: true,
    image: '/images/service-xdr.jpg',
  },
  {
    id: 3,
    nom: 'SOC as a Service',
    prix: 100.0,
    quantite: 1,
    durée: 'mensuel',
    disponible: false, // service indisponible
    image: '/images/service-soc.jpg',
  },
];

export default function Panier() {
  const [articles, setArticles] = useState(servicesInit);
  const [isLogged, setIsLogged] = useState(false);

  const supprimerArticle = (id) => {
    setArticles((prev) => prev.filter((article) => article.id !== id));
  };

  const mettreAJourQuantite = (id, nouvelleQuantite) => {
    setArticles((prev) =>
      prev
        .map((a) => (a.id === id ? { ...a, quantite: Math.max(1, nouvelleQuantite) } : a))
        .filter((a) => a.quantite > 0)
    );
  };

  const changerDuree = (id, nouvelleDuree) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, durée: nouvelleDuree } : a))
    );
  };

  const indisponibleDansPanier = useMemo(
    () => articles.some((article) => !article.disponible),
    [articles]
  );

  const activeArticles = useMemo(() => articles.filter((article) => article.disponible), [
    articles,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mon Panier SaaS</h1>

        {!isLogged && articles.length > 0 && (
          <div className="mb-6 rounded-lg bg-yellow-100 border border-yellow-300 p-4">
            <p className="text-yellow-800 text-sm">
              Vous n’êtes pas connecté. Sauvegardez votre panier en vous connectant ou passez en
              invité.
            </p>
          </div>
        )}

        {articles.length === 0 ? (
          <PanierVide />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PanierListe
                articles={articles}
                supprimerArticle={supprimerArticle}
                mettreAJourQuantite={mettreAJourQuantite}
                changerDuree={changerDuree}
              />
            </div>

            <div>
              <PanierResume articles={activeArticles} articlesTotaux={articles} />
              <PanierActions
                indisponible={indisponibleDansPanier}
                isLogged={isLogged}
                onLogin={() => setIsLogged(true)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}