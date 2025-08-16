import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon } from '../components/icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { brandAssets, colorStyles, type BrandKey } from '../services/brandingService';

interface WaitlistPageProps {
    onAccessGranted: () => void;
    brandKey: BrandKey;
    appLastUpdated?: string;
    onNavigate: (page: string) => void;
}

const SECRET_CODE = 'australopiteco';

// Componente per l'effetto tritacarte (disdette.ch)
const ShredderBackground: React.FC = () => {
    const [strips, setStrips] = useState<React.CSSProperties[]>([]);

    useEffect(() => {
        const generateStrips = () => {
            const newStrips: React.CSSProperties[] = [];
            const count = Math.floor(window.innerWidth / 25);
            for (let i = 0; i < count; i++) {
                newStrips.push({
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    animationDuration: `${Math.random() * 5 + 4}s`,
                    animationDelay: `${Math.random() * -5}s`,
                });
            }
            setStrips(newStrips);
        };
        generateStrips();
    }, []);

    return (
        <div className="shredder-container">
            {strips.map((style, i) => (
                <div key={i} className="shred-strip" style={style} />
            ))}
        </div>
    );
};

// Componente per l'effetto cassaforte (archivio.ch)
const VaultBackground: React.FC = () => {
    return (
        <div className="vault-bg">
            <div className="vault-dial"></div>
        </div>
    );
};

// Nuovo componente per l'effetto griglia esagonale (polizze.ch)
const PolizzeBackground: React.FC = () => {
    return (
        <div className="polizze-bg">
            <div className="hex-grid"></div>
        </div>
    );
};


const WaitlistPage: React.FC<WaitlistPageProps> = ({ onAccessGranted, brandKey, appLastUpdated, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const mouseLineRef = useRef<HTMLDivElement>(null);
    const [currentBrandKey, setCurrentBrandKey] = useState<BrandKey>(brandKey);

    const { Logo, Wordmark, colorClass } = brandAssets[currentBrandKey];
    const brandColors = colorStyles[colorClass] || colorStyles.purple;
    
    useEffect(() => {
        setCurrentBrandKey(brandKey);
    }, [brandKey]);


    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (mouseLineRef.current) {
                mouseLineRef.current.style.top = `${e.clientY}px`;
            }
        };
        const handleMouseEnter = () => {
            if (mouseLineRef.current) mouseLineRef.current.style.opacity = '1';
        };
        const handleMouseLeave = () => {
            if (mouseLineRef.current) mouseLineRef.current.style.opacity = '0';
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseenter', handleMouseEnter);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        
        // Initial fade in for the mouse line
        const timeoutId = setTimeout(handleMouseEnter, 200);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseenter', handleMouseEnter);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timeoutId);
        };
    }, []);
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const lowerCaseValue = value.trim().toLowerCase();
        setEmail(value);

        // Secret commands to switch views
        if (lowerCaseValue === 'scansioni.ch') {
            setCurrentBrandKey('scan');
        } else if (lowerCaseValue === 'archivio.ch') {
            setCurrentBrandKey('archivio');
        } else if (lowerCaseValue === 'polizze.ch') {
            setCurrentBrandKey('polizze');
        } else if (lowerCaseValue === 'disdette.ch') {
            setCurrentBrandKey('disdette');
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
                setCurrentBrandKey('scan');
            } else if (lowerCaseValue === 'archivio.ch') {
                setCurrentBrandKey('archivio');
            } else if (lowerCaseValue === 'polizze.ch') {
                setCurrentBrandKey('polizze');
            } else if (lowerCaseValue === 'disdette.ch') {
                setCurrentBrandKey('disdette');
            } else if (lowerCaseValue === 'unhub.ch') {
                onNavigate('unhub');
            }
            setEmail('');
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
            setMessage(`Grazie! ${email} è stato aggiunto alla nostra waitlist. Ti faremo sapere non appena saremo pronti!`);
            setEmail('');
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
            mouseLineClass: 'mouse-scanner-line',
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
            mouseLineClass: 'mouse-shredder-line',
            background: <ShredderBackground />
        },
        archivio: {
            title: <>Il tuo archivio digitale. <span className="text-red-400">Sicuro e per sempre.</span></>,
            subtitle: 'Conserva, cerca e condividi i tuoi documenti più importanti. Inserisci la tua email per essere tra i primi ad accedere.',
            mouseLineClass: 'mouse-vault-line',
            background: <VaultBackground />
        },
        polizze: {
            title: <>Tutte le tue polizze, <span className="text-cyan-400">a portata di mano.</span></>,
            subtitle: 'Centralizza le tue assicurazioni, monitora le scadenze e non perdere mai più un dettaglio importante. Lascia la tua email per l\'accesso anticipato.',
            mouseLineClass: 'mouse-polizze-line',
            background: <PolizzeBackground />
        }
    }
    
    const currentContent = brandContent[currentBrandKey] || brandContent.scan;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects Container */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {currentContent.background}
                <div ref={mouseLineRef} className={currentContent.mouseLineClass}></div>
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
                            <button
                                type="submit"
                                disabled={submissionStatus === 'submitting'}
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
            </main>

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