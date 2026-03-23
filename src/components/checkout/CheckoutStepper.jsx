import React from 'react';

// SVG auto-contenu pour l'icône de validation, pour éviter d'ajouter des dépendances
const CheckIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

const CheckoutStepper = ({ currentStep }) => {
  const steps = [
    { id: 'address', name: 'Adresse' },
    { id: 'payment', name: 'Paiement' },
    { id: 'confirmation', name: 'Confirmation' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Progress" className="py-8">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStepIndex;
          const isCurrent = stepIdx === currentStepIndex;

          return (
            <li key={step.id} className="relative flex-1">
              {/* Ligne de connexion, sauf pour le dernier élément */}
              {stepIdx < steps.length - 1 ? (
                <div className={`absolute left-1/2 top-4 -translate-x-0 w-full h-0.5 ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`} aria-hidden="true" />
              ) : null}

              <div className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-primary' : isCurrent ? 'border-2 border-primary bg-background' : 'border-2 border-gray-300 bg-background'}`}>
                  {isCompleted ? (
                    <CheckIcon />
                  ) : (
                    <span className={isCurrent ? 'text-primary font-bold' : 'text-gray-400'}>
                      {stepIdx + 1}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.name}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CheckoutStepper;
