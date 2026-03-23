import React, { useState } from 'react';

// Importation des composants du processus et de la mise en page
import RouteLayout from '@/layouts/RouteLayout';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import AddressStep from '@/components/checkout/AddressStep';
import PaymentStep from '@/components/checkout/PaymentStep';
import ConfirmationStep from '@/components/checkout/ConfirmationStep';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Supposons que vous utilisez react-router-dom

const CheckoutPage = () => {
  // 'address' | 'payment' | 'confirmation' | 'success'
  const [currentStep, setCurrentStep] = useState('address');

  // État pour stocker toutes les données de la commande au fur et à mesure
  const [orderData, setOrderData] = useState({
    address: null,
    payment: null,
    // Les détails du panier pourraient venir d'un Contexte global (Zustand, Redux, etc.)
    cart: { items: [], total: 0 }, 
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Fonctions de navigation et de mise à jour des données ---

  const handleGoToStep = (step) => {
    setCurrentStep(step);
  };
  
  const handleAddressNext = (address) => {
    setOrderData(prev => ({ ...prev, address }));
    handleGoToStep('payment');
  };

  const handlePaymentNext = (paymentData) => {
    setOrderData(prev => ({ ...prev, payment: paymentData }));
    handleGoToStep('confirmation');
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    console.log("FINALISATION DE LA COMMANDE...", orderData);
    
    // Simule un appel API à votre backend
    try {
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData),
      // });
      // if (!response.ok) throw new Error("La commande a échoué");
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simule une attente de 2s
      
      console.log("COMMANDE RÉUSSIE !");
      handleGoToStep('success');

    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      // Idéalement, afficher une notification d'erreur à l'utilisateur
    } finally {
      setIsProcessing(false);
    }
  };


  // --- Rendu du composant ---

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 'address':
        return <AddressStep onNext={handleAddressNext} />;
      case 'payment':
        return <PaymentStep onBack={() => handleGoToStep('address')} onPaymentSubmit={handlePaymentNext} />;
      case 'confirmation':
        return <ConfirmationStep 
                    onBack={() => handleGoToStep('payment')} 
                    onConfirm={handleConfirmOrder} 
                    orderDetails={orderData}
                    processing={isProcessing}
                />;
      default:
        // Fallback pour le cas où l'étape est inconnue
        return <AddressStep onNext={handleAddressNext} />;
    }
  };
  
  // Affiche un message de succès à la fin
  if (currentStep === 'success') {
    return (
      <RouteLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
            <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <CardTitle className="text-2xl text-green-600">Merci pour votre commande !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>Votre commande a été traitée avec succès.</p>
                    <p>Un e-mail de confirmation avec les détails de votre commande vous a été envoyé à l'adresse associée à votre compte.</p>
                    <Button asChild>
                        <Link to="/user/dashboard">Accéder à mon espace client</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </RouteLayout>
    );
  }

  return (
    <RouteLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Finaliser ma commande</h1>
                <p className="mt-2 text-lg text-muted-foreground">Suivez les étapes pour compléter votre achat.</p>
            </div>
            
            {/* Le stepper est affiché ici */}
            <CheckoutStepper currentStep={currentStep} />
            
            {/* Le composant de l'étape actuelle est rendu ici */}
            <div className="mt-12">
                {renderCurrentStepComponent()}
            </div>
        </div>
      </div>
    </RouteLayout>
  );
};

export default CheckoutPage;
