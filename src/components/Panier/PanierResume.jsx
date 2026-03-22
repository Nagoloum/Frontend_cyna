export default function PanierResume({ articles = [], articlesTotaux = [] }) {
  const sousTotal = (articles || []).reduce((sum, a) => {
    const mult = a.durée === 'annuel' ? 10 : 1;
    return sum + a.prix * mult * a.quantite;
  }, 0);

  const indisponibles = (articlesTotaux || []).filter((a) => !a.disponible).length;
  const tax = sousTotal * 0.2;
  const total = sousTotal + tax;
  const remise = sousTotal > 500 ? sousTotal * 0.1 : 0;
  const totalAvecRemise = total - remise;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Résumé</h2>

      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span>{sousTotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>TVA (20%)</span>
          <span>{tax.toFixed(2)} €</span>
        </div>
        {remise > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Remise (10% {'>'} 500€)</span>
            <span>-{remise.toFixed(2)} €</span>
          </div>
        )}
        {indisponibles > 0 && (
          <p className="text-sm text-red-600">
            {indisponibles} services indisponibles exclus du total
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-gray-200 pt-4 flex justify-between items-center font-bold text-xl text-gray-900">
        <span>Total</span>
        <span>{totalAvecRemise.toFixed(2)} €</span>
        </div>
    </div>
  );
}