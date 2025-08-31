

import React from 'react';
import { CreditCardIcon, CoinIcon } from './icons';
import type { Subscription } from '../services/authService';

interface SubscriptionStatusCardProps {
  subscription: Subscription;
  onManagePlan: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ subscription, onManagePlan }) => {
  const { plan, scanCoinBalance } = subscription;

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'professionale':
        return 'from-purple-500 to-indigo-500';
      case 'business':
        return 'from-slate-700 to-slate-800';
      case 'personale':
      default:
        return 'from-sky-500 to-cyan-500';
    }
  };

  return (
    <div className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between text-white bg-gradient-to-br ${getPlanColor(plan)}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-80">Piano Attuale</p>
          <p className="text-2xl font-bold">{plan}</p>
        </div>
         <div className="p-2 bg-white/20 rounded-lg">
          <CreditCardIcon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-6">
        <p className="text-sm opacity-80">Saldo Corrente</p>
        <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold">{scanCoinBalance.toLocaleString('it-CH')}</span>
            <span className="font-semibold">ScanCoin</span>
        </div>
      </div>
      <div className="mt-6">
         <button 
            onClick={onManagePlan}
            className="w-full text-center mt-4 bg-white/20 hover:bg-white/30 font-bold py-3 px-4 rounded-lg text-sm transition-colors"
         >
            Ricarica ScanCoin
        </button>
      </div>
    </div>
  );
};
