import React, { useState } from 'react';
import AddressForm from './AddressForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// MOCK DATA: Remplacez ceci par un appel API pour récupérer les adresses de l'utilisateur
const savedAddresses = [
  {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    address1: '123 rue de la République',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    phone: '0612345678'
  },
  {
    id: 2,
    firstName: 'Marie',
    lastName: 'Durand',
    address1: '456 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    phone: '0687654321'
  },
];

const AddressStep = ({ onNext }) => {
  // Par défaut, on sélectionne la première adresse si elle existe.
  const [selectedAddressId, setSelectedAddressId] = useState(savedAddresses.length > 0 ? savedAddresses[0].id : null);

  // On affiche le formulaire seulement s'il n'y a pas d'adresse sauvegardée, ou si l'utilisateur clique sur "Ajouter"
  const [showForm, setShowForm] = useState(savedAddresses.length === 0);

  // Gère la soumission du formulaire pour une nouvelle adresse
  const handleNewAddressSubmit = (formData) => {
    console.log('Nouvelle adresse à sauvegarder:', formData);
    // TODO: Implémentez la logique pour sauvegarder la nouvelle adresse via une API
    const newAddress = { ...formData, id: Date.now() }; // Simule un nouvel ID
    // Passez la nouvelle adresse à l'étape suivante
    onNext(newAddress); // Passe à l'étape suivante automatiquement
  };

  // Gère la sélection d'une adresse existante
  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
  }

  // Gère le clic sur le bouton "Continuer"
  const handleContinue = () => {
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);
    if (selectedAddress) {
      onNext(selectedAddress);
    } else {
      // Peut-être afficher une erreur si aucune adresse n'est sélectionnée
      console.error("Aucune adresse n'est sélectionnée.");
    }
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{savedAddresses.length > 0 ? "Ajouter une nouvelle adresse" : "Entrez votre adresse de facturation"}</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressForm
            onSubmit={handleNewAddressSubmit}
            // Affiche le bouton "Retour" seulement si des adresses existent déjà
            onBack={savedAddresses.length > 0 ? () => setShowForm(false) : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choisissez votre adresse de facturation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {savedAddresses.map(address => (
            <div
              key={address.id}
              onClick={() => handleSelectAddress(address)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-primary ring-2 ring-primary' : 'hover:border-slate-300'}`}
            >
              <p className="font-semibold">{address.firstName} {address.lastName}</p>
              <p className="text-sm text-gray-600">{address.address1}</p>
              <p className="text-sm text-gray-600">{address.city}, {address.postalCode}</p>
              <p className="text-sm text-gray-600">{address.country}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Ajouter une nouvelle adresse
          </Button>
          <Button onClick={handleContinue} disabled={!selectedAddressId}>
            Continuer vers le paiement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressStep;
