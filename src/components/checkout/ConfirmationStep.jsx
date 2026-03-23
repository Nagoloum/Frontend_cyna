import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Nous allons supposer que vous avez un composant pour le résumé de la commande.
// Si PanierResume ne fonctionne pas directement, vous pouvez créer un composant
// OrderSummary spécifique pour le checkout.
import PanierResume from '@/components/Panier/PanierResume';

const ConfirmationStep = ({ onBack, onConfirm, orderDetails, processing }) => {
  // On déstructure les détails de la commande pour un accès facile
  const { address, payment, cart } = orderDetails;

  const renderPaymentDetails = () => {
    // Dans une vraie app, l'objet 'payment' contiendrait les détails de la carte
    // (ex: 'brand' et 'last4') récupérés via une API après avoir sauvegardé le moyen de paiement.
    if (payment?.brand) {
      return <p>Carte {payment.brand} se terminant par •••• {payment.last4}</p>;
    }
    // Si c'est une nouvelle carte, on affiche une information générique
    return <p>Paiement par nouvelle carte de crédit.</p>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérifiez et confirmez votre commande</CardTitle>
        <CardDescription>C'est la dernière étape avant de valider votre achat.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* Section 1: Récapitulatif de la commande */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Récapitulatif de la commande</h3>
          {/* Idéalement, PanierResume lit l'état global du panier ou vous lui passez les props nécessaires */}
          <PanierResume isCheckout={true} />
        </div>

        {/* Section 2: Détails de facturation et de paiement */}
        <div className="grid md:grid-cols-2 gap-8 pt-6 border-t">
          <div className="space-y-3">
            <h3 className="font-semibold">Adresse de facturation</h3>
            <div className="text-sm text-gray-700 p-4 border rounded-md bg-slate-50">
              <p className="font-bold">{address.firstName} {address.lastName}</p>
              <p>{address.address1}</p>
              {address.address2 && <p>{address.address2}</p>}
              <p>{address.postalCode} {address.city}, {address.country}</p>
              <p>Tél: {address.phone}</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold">Méthode de paiement</h3>
            <div className="text-sm text-gray-700 p-4 border rounded-md bg-slate-50">
              {renderPaymentDetails()}
            </div>
          </div>
        </div>

        {/* Section 3: Boutons d'action */}
        <div className="flex justify-between items-center pt-8 border-t">
          <Button type="button" variant="outline" onClick={onBack} disabled={processing}>
            Retour
          </Button>
          <Button type="button" onClick={onConfirm} disabled={processing} size="lg">
            {processing ? 'Finalisation en cours...' : 'Confirmer et Payer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfirmationStep;
