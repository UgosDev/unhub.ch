import React from 'react';
import { InformationCircleIcon } from './icons';

interface PrototypeBannerProps {
  onAskUgo?: () => void;
}

export const PrototypeBanner: React.FC<PrototypeBannerProps> = ({ onAskUgo }) => {
  const handleAskUgoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAskUgo) {
      onAskUgo();
    }
  };
  
  return (
    <div className="bg-amber-100 dark:bg-amber-900/50 border-b-2 border-amber-400 text-amber-800 dark:text-amber-200 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-3">
        <InformationCircleIcon className="w-8 h-8 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
        <div className="text-sm text-center">
          <span className="font-bold">Attenzione: versione prototipo.</span> Funzioni come pagamenti e importazioni sono simulate. A causa di instabilità nel database e per garantire la massima privacy, tutti i dati vengono cancellati dopo 24 ore. Il tuo feedback è prezioso: puoi{' '}
          {onAskUgo ? (
            <button onClick={handleAskUgoClick} className="font-bold underline hover:text-amber-600 dark:hover:text-amber-100">
              inviarlo direttamente a Ugo in chat
            </button>
          ) : (
            'inviarlo tramite il nostro assistente virtuale'
          )}.
        </div>
      </div>
    </div>
  );
};