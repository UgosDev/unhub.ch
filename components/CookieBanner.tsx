import React from 'react';
import { colorStyles, type BrandKey, type BrandColor } from '../services/brandingService';

interface CookieBannerProps {
  onAccept: () => void;
  onNavigateToPrivacy: () => void;
  brandKey: BrandKey;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onAccept, onNavigateToPrivacy, brandKey }) => {
  const colorClass: BrandColor = brandKey === 'archivio' ? 'red' : brandKey === 'polizze' ? 'cyan' : brandKey === 'disdette' ? 'green' : 'purple';
  const brandColors = colorStyles[colorClass] || colorStyles.purple;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 border-t border-slate-200 dark:border-slate-700 z-50 animate-slideUp">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
      `}</style>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Utilizziamo cookie essenziali e, con il tuo consenso, cookie di analisi (Google Analytics) per migliorare la tua esperienza.
          <button onClick={onNavigateToPrivacy} className={`font-semibold ${brandColors.text} hover:underline ml-1`}>
            Leggi la nostra policy
          </button>.
        </p>
        <button
          onClick={onAccept}
          className={`px-6 py-2 text-sm font-bold ${brandColors.bg} text-white rounded-full ${brandColors.hoverBg} transition-colors shadow-md flex-shrink-0`}
        >
          Accetta
        </button>
      </div>
    </div>
  );
};