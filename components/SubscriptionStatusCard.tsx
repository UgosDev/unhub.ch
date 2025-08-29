import React from 'react';
import { CreditCardIcon, CoinIcon, SparklesIcon } from './icons';
import { COIN_TO_CHF_RATE } from '../services/geminiService';

interface SubscriptionStatusCardProps {
  subscription: {
    plan: 'free' | 'pro';
    scanCoinBalance: number;
    monthlyScanCoinAllowance: number;
    nextRefillDate: string;
  };
  onManagePlan: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ subscription, onManagePlan }) => {
    const balanceInCHF = (subscription.scanCoinBalance * COIN_TO_CHF_RATE).toFixed(2);
    const nextRefillDate = new Date(subscription.nextRefillDate);

    const progressPercentage = Math.min(100, (subscription.scanCoinBalance / subscription.monthlyScanCoinAllowance) * 100);

    return (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 text-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Il tuo Saldo</h2>
                    <p className="text-purple-200">Piano {subscription.plan === 'pro' ? 'Professionale' : 'Gratuito'}</p>
                </div>
                <button
                    onClick={onManagePlan}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm border border-white/20"
                >
                    <CreditCardIcon className="w-5 h-5" />
                    <span>Gestisci Piano</span>
                </button>
            </div>

            <div className="text-center">
                <p className="text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3">
                    <CoinIcon className="w-10 h-10 text-amber-300" />
                    {subscription.scanCoinBalance.toLocaleString('it-CH')}
                </p>
                <p className="text-purple-300 font-medium">ScanCoin disponibili (circa {balanceInCHF} CHF)</p>
            </div>
            
            <div>
                <div className="flex justify-between text-sm font-medium text-purple-200 mb-1">
                    <span>Prossima ricarica</span>
                    <span>{subscription.monthlyScanCoinAllowance.toLocaleString('it-CH')} coins</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-right text-xs text-purple-300 mt-1">
                    Ricarica tra {Math.ceil((nextRefillDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} giorni
                </p>
            </div>
        </div>
    );
};
