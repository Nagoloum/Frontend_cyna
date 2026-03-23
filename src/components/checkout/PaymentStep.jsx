import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; // Supposons que ce composant existe

// --- COMPOSANTS DE PAIEMENT FACTICES (PLACEHOLDERS) ---
// Dans une application réelle, ces composants proviendraient de `@stripe/react-stripe-js`
// et rendraient des iframes sécurisés.
const FakeSecureField = ({ placeholder }) => (
  <div className="w-full h-10 px-3 py-2 border rounded-md bg-slate-50 text-sm text-gray-500 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    {placeholder}
  </div>
);
const CardNumberElement = () => <FakeSecureField placeholder="Numéro de carte sécurisé" />;
const CardExpiryElement = () => <FakeSecureField placeholder="Date d'expiration" />;
const CardCvcElement = () => <FakeSecureField placeholder="CVC" />;
// --- FIN DES COMPOSANTS FACTICES ---


const PaymentStep = ({ onBack, onPaymentSubmit }) => {
  const [nameOnCard, setNameOnCard] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('new_card'); // 'new_card' ou l'ID d'une carte

  // MOCK DATA: À remplacer par un appel API
  const savedCards = [
    { id: 'card_1abc', brand: 'Visa', last4: '4242' },
    { id: 'card_2def', brand: 'Mastercard', last4: '5555' },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (processing) return;

    setProcessing(true);
    setError(null);

    // --- SIMULATION DE LA LOGIQUE DE PAIEMENT ---
    console.log(`Méthode de paiement choisie: ${paymentMethod}`);

    // Simule une attente réseau
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (paymentMethod === 'new_card') {
      // Logique pour une NOUVELLE CARTE
      // 1. Valider le nom sur la carte
      if (!nameOnCard.trim()) {
        setError("Le nom sur la carte est obligatoire.");
        setProcessing(false);
        return;
      }
      // 2. Appeler l'API de paiement (Stripe, etc.) pour créer un token
      // const { error, token } = await stripe.createToken(...);
      // if (error) { ... } else { onPaymentSubmit({ token: token.id }) }
      console.log("Token de paiement simulé créé pour la nouvelle carte.");
      onPaymentSubmit({ token: 'tok_simulated_newcard' });

    } else {
      // Logique pour une CARTE SAUVEGARDÉE
      console.log(`Paiement simulé avec la carte ID: ${paymentMethod}`);
      onPaymentSubmit({ paymentMethodId: paymentMethod });
    }

    // Le setProcessing(false) sera géré par le composant parent après la redirection
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de paiement</CardTitle>
        <CardDescription>Toutes les transactions sont sécurisées et chiffrées.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {savedCards.map((card) => (
              <Label key={card.id} htmlFor={card.id} className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === card.id ? 'border-primary ring-2 ring-primary' : 'hover:border-slate-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={card.id}
                  id={card.id}
                  checked={paymentMethod === card.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                />
                <span className="ml-4 font-medium">{card.brand} se terminant par {card.last4}</span>
              </Label>
            ))}
            <Label htmlFor="new_card" className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'new_card' ? 'border-primary ring-2 ring-primary' : 'hover:border-slate-300'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="new_card"
                id="new_card"
                checked={paymentMethod === 'new_card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
              />
              <span className="ml-4 font-medium">Utiliser une nouvelle carte</span>
            </Label>
          </div>

          {paymentMethod === 'new_card' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="nameOnCard">Nom sur la carte</Label>
                <Input id="nameOnCard" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} placeholder="Jean Dupont" required />
              </div>
              <div className="space-y-2">
                <Label>Numéro de carte</Label>
                <CardNumberElement />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiration (MM/AA)</Label>
                  <CardExpiryElement />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <CardCvcElement />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between items-center pt-6">
            <Button type="button" variant="outline" onClick={onBack} disabled={processing}>Retour</Button>
            <Button type="submit" disabled={processing}>
              {processing ? "Vérification..." : "Passer à la confirmation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;
