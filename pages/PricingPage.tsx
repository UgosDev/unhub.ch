import React, { useState } from 'react';
import { CoinIcon, CheckCircleIcon, SparklesIcon, ArrowUturnLeftIcon } from '../components/icons';
import { Footer } from '../components/Footer';
import { PrototypeBanner } from '../components/PrototypeBanner';
import { brandAssets, type BrandKey } from '../services/brandingService';
import LandingPageHeader from './LandingPageHeader';

interface PricingPageProps {
    onNavigateToRegister: () => void;
    onNavigateBack: () => void;
    onNavigate: (page: string) => void;
    isInsideApp?: boolean;
    isStandalonePage?: boolean;
    brandKey?: BrandKey;
}

const singlePacks = [
    {
        name: 'Piccolo',
        price: 10,
        coins: 1000,
        bonusInfo: null,
        isPopular: false,
        upsell: {
            planName: 'Personale',
            monthlyPrice: 9,
        },
    },
    {
        name: 'Medio',
        price: 50,
        coins: 5500,
        bonusInfo: '+10% Bonus', // 500 extra coins
        isPopular: true,
        upsell: null,
    },
    {
        name: 'Grande',
        price: 100,
        coins: 12000,
        bonusInfo: '+20% Bonus', // 2000 extra coins
        isPopular: false,
        upsell: null,
    },
];

const subscriptionPlans = [
    {
        name: 'Personale',
        monthlyPrice: 9,
        yearlyPrice: 90,
        coins: 1000,
        features: [
            '1.000 ScanCoin ogni mese',
            'Accesso a tutte le modalità',
            'Ideale per uso privato',
        ],
        isPopular: false,
    },
    {
        name: 'Professionale',
        monthlyPrice: 29,
        yearlyPrice: 290,
        coins: 4000,
        features: [
            '4.000 ScanCoin ogni mese',
            'Supporto prioritario via email',
            'Storico illimitato',
        ],
        isPopular: true,
    },
    {
        name: 'Business',
        monthlyPrice: 79,
        yearlyPrice: 790,
        coins: 12000,
        features: [
            '12.000 ScanCoin ogni mese',
            'Gestione multi-utente (futura)',
            'Accesso API (futuro)',
        ],
        isPopular: false,
    },
];

const PricingPage: React.FC<PricingPageProps> = ({ onNavigateToRegister, onNavigateBack, isInsideApp, onNavigate, brandKey = 'scan' }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [isUpsellSelected, setIsUpsellSelected] = useState(false);
    const { Logo, Wordmark } = brandAssets[brandKey];

    const handlePurchase = (planName: string) => {
        if (isInsideApp) {
            alert(`(Simulazione) Hai scelto il pacchetto "${planName}". La funzionalità di acquisto non è ancora implementata.`);
        } else {
            onNavigateToRegister();
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col">
            {!isInsideApp && <PrototypeBanner />}
            {isInsideApp ? (
                 <header className="py-4 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <button className="flex items-center gap-3" onClick={onNavigateBack}>
                            <Logo className="h-9 w-9" />
                            <Wordmark className="h-7 text-slate-900 dark:text-slate-100" />
                        </button>
                        <button
                            onClick={onNavigateBack}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                            Torna Indietro
                        </button>
                    </div>
                </header>
            ) : (
                <LandingPageHeader onNavigate={onNavigate} brandKey={brandKey} />
            )}
           

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
                    {/* Single Packs Section */}
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Ricarica i tuoi <span className="text-purple-600 dark:text-purple-400">ScanCoin</span>
                        </h1>
                        <p className="mt-5 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400">
                            Scegli il pacchetto di ricarica singola più adatto a te. Flessibilità totale, nessun impegno.
                        </p>
                    </div>

                    <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {singlePacks.map((pack) => (
                            <div key={pack.name} className={`bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-8 flex flex-col relative transition-transform transform hover:-translate-y-1 ${pack.isPopular ? 'border-2 border-purple-500' : 'border border-slate-200 dark:border-slate-700'}`}>
                                {pack.isPopular && (
                                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 text-sm font-semibold tracking-wider text-white uppercase bg-purple-600 rounded-full">Più Popolare</span>
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pack.name}</h3>
                                <div className="mt-4 text-slate-500 dark:text-slate-400">
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{pack.coins.toLocaleString('it-CH')}</span>
                                        <span className="ml-2 text-lg font-medium">ScanCoin</span>
                                    </div>
                                    {pack.bonusInfo && <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{pack.bonusInfo}</p>}
                                </div>
                                <p className="mt-4 text-2xl font-bold text-slate-700 dark:text-slate-200">{pack.price} CHF</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Pagamento unico</p>

                                {pack.upsell && (
                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                            <input type="checkbox" checked={isUpsellSelected} onChange={(e) => setIsUpsellSelected(e.target.checked)} className="mt-1 h-5 w-5 rounded text-purple-600 focus:ring-purple-500" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-slate-100">Trasformalo in abbonamento</span>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Ricevi {pack.coins.toLocaleString('it-CH')} ScanCoin ogni mese per soli {pack.upsell.monthlyPrice} CHF/mese e risparmia subito!
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                <div className="mt-auto pt-8">
                                    <button onClick={() => handlePurchase(pack.name)} className={`w-full font-bold py-3 px-6 rounded-lg transition-colors ${pack.isPopular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                        Acquista Ora
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Founders Edition */}
                    <section className="mt-16">
                        <div className="relative p-8 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 -m-4">
                                <SparklesIcon className="w-32 h-32 text-purple-500/20" />
                            </div>
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div className="md:col-span-2">
                                    <span className="px-3 py-1 text-sm font-semibold tracking-wider bg-purple-500 text-white rounded-full">Offerta Limitata</span>
                                    <h3 className="mt-4 text-3xl font-extrabold">Founders Edition</h3>
                                    <p className="mt-2 text-slate-300 max-w-lg">Un'occasione unica per i nostri primi sostenitori. Ottieni accesso a vita e vantaggi esclusivi con un singolo pagamento.</p>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-sm text-slate-400">Pagamento Unico</p>
                                    <p className="text-5xl font-extrabold my-2">299 CHF</p>
                                    <button onClick={() => handlePurchase('Founders Edition')} className="w-full md:w-auto mt-4 font-bold py-3 px-8 rounded-lg bg-white text-slate-900 hover:bg-slate-200 transition-colors">
                                        Diventa un Founder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Subscriptions Section */}
                    <div className="mt-20 pt-16 border-t-2 border-dashed border-slate-300 dark:border-slate-700">
                         <div className="text-center">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Oppure, per un valore ancora maggiore...</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
                                Scegli un abbonamento per ricevere ScanCoin ogni mese a un prezzo scontato.
                            </p>
                        </div>

                        <div className="mt-10 flex justify-center">
                             <div className="relative flex p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                                <button onClick={() => setBillingCycle('monthly')} className={`relative w-32 py-2 text-sm font-bold rounded-full transition-colors ${billingCycle === 'monthly' ? 'text-purple-700' : 'text-slate-600 dark:text-slate-300'}`}>
                                    Mensile
                                </button>
                                <button onClick={() => setBillingCycle('annually')} className={`relative w-32 py-2 text-sm font-bold rounded-full transition-colors ${billingCycle === 'annually' ? 'text-purple-700' : 'text-slate-600 dark:text-slate-300'}`}>
                                    Annuale
                                    <span className="absolute top-0 -right-2 transform translate-x-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-semibold bg-emerald-200 text-emerald-800 rounded-full">-2 mesi</span>
                                </button>
                                <span className={`absolute top-1 bottom-1 left-1 w-[120px] bg-white dark:bg-slate-800 shadow-md rounded-full transition-transform duration-300 ease-in-out ${billingCycle === 'annually' ? 'transform translate-x-full' : ''}`} />
                            </div>
                        </div>
                        
                        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {subscriptionPlans.map((plan) => (
                                <div key={plan.name} className={`bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-8 flex flex-col relative transition-transform transform hover:-translate-y-1 ${plan.isPopular ? 'border-2 border-purple-500' : 'border border-slate-200 dark:border-slate-700'}`}>
                                    {plan.isPopular && (
                                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                            <span className="px-4 py-1 text-sm font-semibold tracking-wider text-white uppercase bg-purple-600 rounded-full">Consigliato</span>
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                    <p className="mt-2 text-slate-500 dark:text-slate-400 flex items-center gap-2"><CoinIcon className="w-5 h-5"/>{plan.coins.toLocaleString('it-CH')} ScanCoin / mese</p>
                                    
                                    <div className="mt-6">
                                        <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
                                            {billingCycle === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice / 12).toFixed(0)}
                                        </span>
                                        <span className="ml-1 text-xl font-medium text-slate-500 dark:text-slate-400">CHF / mese</span>
                                        {billingCycle === 'annually' && <p className="text-sm text-slate-400">fatturati {plan.yearlyPrice} CHF all'anno</p>}
                                    </div>
                                    
                                    <ul className="mt-8 space-y-3 flex-grow">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start">
                                                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mr-2 mt-px" />
                                                <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-8">
                                        <button onClick={() => handlePurchase(plan.name)} className={`w-full font-bold py-3 px-6 rounded-lg transition-colors ${plan.isPopular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                            Scegli Piano
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </main>

            <Footer onNavigate={onNavigate} isAuth={!!isInsideApp} brandKey={brandKey} />
        </div>
    );
};

export default PricingPage;