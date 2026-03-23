import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AddressForm = ({ onSubmit, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    address1: initialData.address1 || "",
    address2: initialData.address2 || "",
    city: initialData.city || "",
    region: initialData.region || "",
    postalCode: initialData.postalCode || "",
    country: initialData.country || "",
    phone: initialData.phone || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Idéalement, vous ajouteriez une validation ici avant de soumettre
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-medium">Prénom</label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Jean"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-medium">Nom</label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Dupont"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="address1" className="block text-sm font-medium">Adresse 1 (rue, numéro)</label>
        <Input
          id="address1"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          placeholder="123 rue de la République"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="address2" className="block text-sm font-medium">Adresse 2 <span className="text-gray-500">(optionnel)</span></label>
        <Input
          id="address2"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          placeholder="Appartement, étage, etc."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="postalCode" className="block text-sm font-medium">Code postal</label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="75001"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium">Ville</label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Paris"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="region" className="block text-sm font-medium">Région</label>
          <Input
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Île-de-France"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="country" className="block text-sm font-medium">Pays</label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="France"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium">Numéro de téléphone mobile</label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="06 12 34 56 78"
          required
        />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        {onBack && <Button type="button" variant="outline" onClick={onBack}>Retour</Button>}
        <Button type="submit">
          Continuer vers le paiement
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
