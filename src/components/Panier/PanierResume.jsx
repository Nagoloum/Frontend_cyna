export default function PanierResume({ articles }) {
  const sousTotal = articles.reduce((total, article) => total + article.prix * article.quantite, 0);
  const fraisPort = sousTotal > 0 ? (sousTotal > 100 ? 0 : 9.99) : 0;
  const tva = (sousTotal + fraisPort) * 0.20;
  const totalTTC = sousTotal + fraisPort + tva;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé</h2>

      <div className="space-y-4 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-gray-600">
          <span>Sous-total</span>
          <span>{sousTotal.toFixed(2)} €</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Frais de port</span>
          <span className={fraisPort === 0 ? 'text-green-600 font-semibold' : ''}>
            {fraisPort === 0 ? 'Offerts' : `${fraisPort.toFixed(2)} €`}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>TVA (20%)</span>
          <span>{tva.toFixed(2)} €</span>
        </div>
      </div>

      <div className="flex justify-between text-xl font-bold text-gray-900 mt-6">
        <span>Total TTC</span>
        <span className="text-indigo-600">{totalTTC.toFixed(2)} €</span>
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        {sousTotal > 100 ? '✓ Livraison offerte' : 'Livraison offerte à partir de 100 €'}
      </p>
    </div>
  );
}