import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon, XMarkIcon, RocketLaunchIcon, HeartIcon, WhatsappIcon } from '../components/icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { brandAssets, colorStyles, type BrandKey } from '../services/brandingService';
import InteractiveBackground from '../components/InteractiveBackground';
import * as db from '../services/db';

interface WaitlistPageProps {
    onAccessGranted: () => void;
    brandKey: BrandKey;
    appLastUpdated?: string;
    onNavigate: (page: string) => void;
    onBrandChange: (newBrand: BrandKey) => void;
}

const SECRET_CODE = 'australopiteco';

const WaitlistPage: React.FC<WaitlistPageProps> = ({ onAccessGranted, brandKey, appLastUpdated, onNavigate, onBrandChange }) => {
    const [email, setEmail] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false); // Unified state
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [isDonationBannerVisible, setIsDonationBannerVisible] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);

    const { Logo, Wordmark, colorClass } = brandAssets[brandKey];
    const brandColors = colorStyles[colorClass] || colorStyles.purple;

    useEffect(() => {
        if (sessionStorage.getItem('donationBannerDismissed') !== 'true') {
            const timer = setTimeout(() => setIsDonationBannerVisible(true), 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = db.onWaitlistLikesUpdate(setLikeCount);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        try {
            if (localStorage.getItem('waitlist_liked_v1') === 'true') {
                setHasLiked(true);
            }
        } catch (e) {
            console.warn("Could not access localStorage for likes.");
        }
    }, []);
    
    const handleLike = () => {
        if (hasLiked) return;
        setHasLiked(true);
        setLikeCount(prev => prev + 1); // Optimistic update
        try {
            localStorage.setItem('waitlist_liked_v1', 'true');
        } catch (e) { console.warn("Could not save like status to localStorage."); }
        
        db.incrementWaitlistLikes().catch(err => {
            console.error("Failed to increment likes:", err);
            // Revert optimistic update on failure
            setLikeCount(prev => prev - 1);
            setHasLiked(false);
            try {
                localStorage.removeItem('waitlist_liked_v1');
            } catch (e) {}
        });
    };

    const handleDismissDonationBanner = () => {
        setIsDonationBannerVisible(false);
        try {
            sessionStorage.setItem('donationBannerDismissed', 'true');
        } catch (e) {
            console.warn("Could not access sessionStorage to dismiss banner.", e);
        }
    };
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const lowerCaseValue = value.trim().toLowerCase();
        setEmail(value);

        // Secret commands to switch views
        if (lowerCaseValue === 'scansioni.ch') {
            onBrandChange('scan');
        } else if (lowerCaseValue === 'archivio.ch') {
            onBrandChange('archivio');
        } else if (lowerCaseValue === 'polizze.ch') {
            onBrandChange('polizze');
        } else if (lowerCaseValue === 'disdette.ch') {
            onBrandChange('disdette');
        } else if (lowerCaseValue === 'unhub.ch') {
            onNavigate('unhub');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        
        const lowerCaseValue = email.trim().toLowerCase();

        if (lowerCaseValue === SECRET_CODE) {
            onAccessGranted();
            return;
        }

        const siteCommands = ['scansioni.ch', 'archivio.ch', 'polizze.ch', 'disdette.ch', 'unhub.ch'];
        if (siteCommands.includes(lowerCaseValue)) {
             if (lowerCaseValue === 'scansioni.ch') {
                onBrandChange('scan');
            } else if (lowerCaseValue === 'archivio.ch') {
                onBrandChange('archivio');
            } else if (lowerCaseValue === 'polizze.ch') {
                onBrandChange('polizze');
            } else if (lowerCaseValue === 'disdette.ch') {
                onBrandChange('disdette');
            } else if (lowerCaseValue === 'unhub.ch') {
                onNavigate('unhub');
            }
            setEmail('');
            return;
        }

        if (!acceptedTerms) {
            setError("Devi accettare l'informativa sulla privacy e iscriverti per continuare.");
            const form = e.currentTarget as HTMLFormElement;
            form.classList.add('animate-shake');
            setTimeout(() => form.classList.remove('animate-shake'), 500);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Inserisci un indirizzo email valido.');
            const form = e.currentTarget as HTMLFormElement;
            form.classList.add('animate-shake');
            setTimeout(() => form.classList.remove('animate-shake'), 500);
            return;
        }
        
        setSubmissionStatus('submitting');
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // In a real app, we'd send the email and newsletterOptIn value to a backend service.
            console.log(`Submitting email: ${email}, Newsletter Opt-in: ${acceptedTerms}`);
            setMessage(`Grazie! ${email} è stato aggiunto alla nostra waitlist. Ti faremo sapere non appena saremo pronti!`);
            setEmail('');
            setAcceptedTerms(false);
            setSubmissionStatus('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Si è verificato un errore. Riprova più tardi.');
            setSubmissionStatus('idle');
            const form = e.currentTarget as HTMLFormElement;
            form.classList.add('animate-shake');
            setTimeout(() => form.classList.remove('animate-shake'), 500);
        }
    };
    
    const brandContent = {
        scan: {
            title: <>Il futuro della digitalizzazione è <span className="text-purple-400">in arrivo</span>.</>,
            subtitle: 'Stiamo mettendo a punto gli ultimi dettagli. Lascia la tua email per essere tra i primi ad accedere alla nuova versione di scansioni.ch.',
            background: (
                <>
                    <div className="waitlist-bg-grid"></div>
                    <div className="scanner-line line1"></div>
                    <div className="scanner-line line2"></div>
                    <div className="scanner-line line3"></div>
                    <div className="scanner-line line4"></div>
                </>
            )
        },
        disdette: {
            title: <>Elimina la burocrazia. <span className="text-green-400">Semplifica le disdette.</span></>,
            subtitle: 'Stiamo per lanciare il modo più semplice per gestire e inviare le tue disdette contrattuali. Inserisci la tua email per ottenere l\'accesso anticipato.',
        },
        archivio: {
            title: <>Il tuo archivio digitale. <span className="text-red-400">Sicuro e per sempre.</span></>,
            subtitle: 'Conserva, cerca e condividi i tuoi documenti più importanti con la massima tranquillità. La ricerca semantica ti permette di trovare ciò che cerchi, sempre.',
        },
        polizze: {
            title: <>Tutte le tue polizze, <span className="text-cyan-400">a portata di mano.</span></>,
            subtitle: 'Centralizza le tue assicurazioni, monitora le scadenze e non perdere mai più un dettaglio importante. Lascia la tua email per l\'accesso anticipato.',
        }
    }
    
    const currentContent = brandContent[brandKey] || brandContent.scan;
    
    const serviceNameMap: Partial<Record<BrandKey, string>> = {
        scan: 'scansioni',
        archivio: 'archivio',
        polizze: 'polizze',
        disdette: 'disdette'
    };
    const serviceName = serviceNameMap[brandKey];
    const donationLink = serviceName ? `https://swiss-nest.ch/${serviceName}` : 'https://swiss-nest.ch';

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                {brandKey === 'scan' ? currentContent.background : <InteractiveBackground brandKey={brandKey} />}
            </div>

            <main className="relative z-10 text-center flex flex-col items-center w-full">
                <Logo className="h-16 w-16 mb-4" />
                <Wordmark className="h-10 mb-8" />

                {submissionStatus !== 'success' ? (
                    <>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                             {currentContent.title}
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
                            {currentContent.subtitle}
                        </p>

                        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-lg flex flex-col items-center gap-4">
                            <input
                                type="text"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Il tuo indirizzo email..."
                                className={`w-full px-5 py-4 bg-slate-800 border-2 border-slate-700 rounded-full text-lg placeholder-slate-500 focus:outline-none focus:ring-2 ${brandColors.ring} ${brandColors.border} transition-all`}
                                aria-label="Indirizzo email"
                            />
                            <div className="w-full max-w-lg text-left px-2">
                                <label className="flex items-start gap-3 text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 h-5 w-5 rounded text-purple-500 bg-slate-700 border-slate-600 focus:ring-purple-500 flex-shrink-0"
                                    />
                                    <span className="text-xs">
                                        Accetto di ricevere aggiornamenti sullo sviluppo e offerte esclusive e dichiaro di aver letto e accettato la{' '}
                                        <button type="button" onClick={() => onNavigate('privacy')} className="font-semibold underline hover:text-white">
                                            Privacy Policy
                                        </button>.*
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={submissionStatus === 'submitting' || !acceptedTerms}
                                className={`relative overflow-hidden w-full max-w-xs px-8 py-4 text-lg font-bold text-white rounded-full transition-transform transform hover:scale-105 shadow-xl ${brandColors.bg} ${brandColors.hoverBg} ${brandColors.shadow} disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center`}
                            >
                                <span className="shimmer-effect"></span>
                                {submissionStatus === 'submitting' ? (
                                    <LoadingSpinner className="w-6 h-6" />
                                ) : (
                                    'Rimani Aggiornato'
                                )}
                            </button>
                        </form>
                        {error && <p className="mt-4 text-red-400">{error}</p>}
                    </>
                ) : (
                    <div className="animate-fade-in text-center flex flex-col items-center">
                        <CheckCircleIcon className="w-20 h-20 text-green-400 mb-4" />
                        <h2 className="text-3xl font-bold">Registrazione Completata!</h2>
                        <p className="mt-4 max-w-md text-lg text-slate-300">{message}</p>
                    </div>
                )}
                
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={handleLike}
                        disabled={hasLiked}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors ${
                            hasLiked
                                ? 'bg-red-500/20 border-red-500/50 text-white cursor-default'
                                : 'bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
                        }`}
                    >
                        <HeartIcon className={`w-5 h-5 transition-colors ${hasLiked ? 'text-red-500' : 'text-slate-400'}`} fill={hasLiked ? 'currentColor' : 'none'} />
                        <span className="font-bold">{likeCount.toLocaleString('it-CH')}</span>
                    </button>
                    <a
                        href="https://whatsapp.com/channel/0029VbC8pvU9mrGilI9dOr3i"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 bg-green-500 border-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                    >
                        <WhatsappIcon className="w-5 h-5" />
                        Seguici su WhatsApp
                    </a>
                </div>
            </main>

            {isDonationBannerVisible && serviceName && (
                <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 z-20 flex items-start sm:items-center gap-4 animate-fade-in-up">
                    <div className={`p-2 rounded-full ${brandColors.bg} bg-opacity-20 text-white flex-shrink-0`}>
                        <RocketLaunchIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-bold text-white">Sostieni la nostra visione!</h4>
                        <p className="text-sm text-slate-200 mt-1">
                            Ogni contributo ci aiuta a lanciare {serviceName}.ch più velocemente. I sostenitori ricevono aggiornamenti esclusivi.
                        </p>
                        <a href={donationLink} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-block text-sm font-bold ${brandColors.text} ${brandColors.hoverText} hover:underline`}>
                            Scopri di più su Swiss-Nest.ch &rarr;
                        </a>
                    </div>
                    <button onClick={handleDismissDonationBanner} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/20 rounded-full flex-shrink-0 absolute top-2 right-2 sm:static">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {appLastUpdated && (
                <footer className="absolute bottom-4 text-center text-xs text-slate-500 z-10">
                    Ultimo aggiornamento: {new Date(appLastUpdated).toLocaleString('it-CH', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}
                </footer>
            )}
        </div>
    );
};

export default WaitlistPage;