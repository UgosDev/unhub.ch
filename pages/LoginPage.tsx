import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon, ShieldCheckIcon } from '../components/icons';
import { Footer } from '../components/Footer';
import { PrototypeBanner } from '../components/PrototypeBanner';
import { brandAssets, colorStyles, type BrandKey } from '../services/brandingService';

interface LoginPageProps {
    onNavigateToRegister: () => void;
    onNavigate: (page: string) => void;
    brandKey: BrandKey;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister, onNavigate, brandKey }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [code, setCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState<'login' | 'reset'>('login');
    const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);
    const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false);
    const { login, signInWithGoogle, sendPasswordReset, isAwaiting2fa, verify2fa, verifyRecoveryCode, cancel2fa, authenticateWithPasskey } = useAuth();

    const { Logo, Wordmark, colorClass } = brandAssets[brandKey];
    const brandColors = colorStyles[colorClass] || colorStyles.purple;

    useEffect(() => {
        const checkPasskeySupport = async () => {
            if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
                setIsPasskeyAvailable(true);
            }
        };
        checkPasskeySupport();
    }, []);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Credenziali non valide. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setMessage(null);
        setIsSubmitting(true);
        try {
            await signInWithGoogle();
            // onAuthStateChanged will handle the UI update.
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Accesso con Google fallito.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePasskeySignIn = async () => {
        setError(null);
        setMessage(null);
        setIsSubmitting(true);
        try {
            await authenticateWithPasskey();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Autenticazione con Passkey fallita.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsSubmitting(true);
        try {
            await sendPasswordReset(resetEmail);
            setMessage(`Email di ripristino inviata a ${resetEmail}. Controlla la tua casella di posta.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Impossibile inviare l\'email di ripristino.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handle2faSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await verify2fa(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Codice non valido.");
            setCode('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecoverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await verifyRecoveryCode(recoveryCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Codice di recupero non valido.");
            setRecoveryCode('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchToReset = () => {
        setError(null);
        setMessage(null);
        setView('reset');
    };
    
    const switchToLogin = () => {
        setError(null);
        setMessage(null);
        setView('login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <PrototypeBanner />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <button onClick={() => onNavigate('landing')} className="flex justify-center items-center gap-3 mb-8 w-full">
                        <Logo className="h-10 w-10" />
                        <Wordmark className="h-8 text-slate-900 dark:text-slate-100" />
                    </button>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        {message && (
                             <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                                <span className="block sm:inline">{message}</span>
                            </div>
                        )}

                        {isAwaiting2fa ? (
                            isUsingRecoveryCode ? (
                                <>
                                    <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-1">Usa un Codice di Recupero</h2>
                                    <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Inserisci uno dei codici di recupero che hai salvato.</p>
                                    <form onSubmit={handleRecoverySubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="recovery-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Codice di recupero</label>
                                            <input id="recovery-code" name="recovery-code" type="text" required value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 ${brandColors.border}`}/>
                                        </div>
                                        <div>
                                            <button type="submit" disabled={isSubmitting} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white ${brandColors.bg} ${brandColors.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${brandColors.ring} disabled:bg-slate-400 disabled:cursor-wait`}>
                                                {isSubmitting ? 'Verifica in corso...' : 'Accedi'}
                                            </button>
                                        </div>
                                    </form>
                                    <p className="mt-6 text-center text-sm">
                                        <button onClick={() => setIsUsingRecoveryCode(false)} className="font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Usa un codice dall'app</button>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-1">Verifica a Due Fattori</h2>
                                    <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Inserisci il codice dalla tua app di autenticazione.</p>
                                    <form onSubmit={handle2faSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="2fa-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Codice a 6 cifre</label>
                                            <input id="2fa-code" name="2fa-code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 ${brandColors.border} text-center text-2xl tracking-[.5em]`}/>
                                        </div>
                                        <div>
                                            <button type="submit" disabled={isSubmitting} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white ${brandColors.bg} ${brandColors.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${brandColors.ring} disabled:bg-slate-400 disabled:cursor-wait`}>
                                                {isSubmitting ? 'Verifica in corso...' : 'Verifica e Accedi'}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="mt-6 text-center text-sm flex justify-center items-center gap-4">
                                        <button onClick={() => setIsUsingRecoveryCode(true)} className="font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Usa un codice di recupero</button>
                                        <span className="text-slate-300 dark:text-slate-600">|</span>
                                        <button onClick={() => cancel2fa()} className="font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Annulla login</button>
                                    </div>
                                </>
                            )
                        ) : view === 'login' ? (
                            <>
                                <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-1">Bentornato!</h2>
                                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Accedi per continuare.</p>
                                {isPasskeyAvailable && (
                                    <div className="mb-4">
                                        <button onClick={handlePasskeySignIn} disabled={isSubmitting} className={`w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white ${brandColors.bg} ${brandColors.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${brandColors.ring} disabled:bg-slate-400 disabled:cursor-wait`}>
                                            <ShieldCheckIcon className="w-5 h-5" />
                                            Accedi con Passkey
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none ${brandColors.ring} ${brandColors.border}`}/>
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none ${brandColors.ring} ${brandColors.border}`}/>
                                    </div>
                                    <div className="text-right text-sm">
                                        <button type="button" onClick={switchToReset} className={`font-medium ${brandColors.text} ${brandColors.hoverText}`.replace('hover:text-', 'hover:text-opacity-80 dark:hover:text-')}>Password dimenticata?</button>
                                    </div>
                                    <div>
                                        <button type="submit" disabled={isSubmitting} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-wait`}>
                                            {isSubmitting && !error ? 'Accesso in corso...' : 'Accedi con Email'}
                                        </button>
                                    </div>
                                </form>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300 dark:border-slate-600" /></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">oppure</span></div>
                                </div>
                                <div>
                                     <button onClick={handleGoogleSignIn} disabled={isSubmitting} className={`w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${brandColors.ring} disabled:bg-slate-200 disabled:cursor-wait`}>
                                        <GoogleIcon className="w-5 h-5" />
                                        Accedi con Google
                                    </button>
                                </div>
                                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                    Non hai un account?{' '}
                                    <button onClick={onNavigateToRegister} className={`font-medium ${brandColors.text} ${brandColors.hoverText}`.replace('hover:text-', 'hover:text-opacity-80 dark:hover:text-')}>Registrati</button>
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-1">Ripristina Password</h2>
                                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Inserisci la tua email per ricevere le istruzioni.</p>
                                <form onSubmit={handlePasswordReset} className="space-y-4">
                                     <div>
                                        <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                        <input id="reset-email" name="email" type="email" autoComplete="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none ${brandColors.ring} ${brandColors.border}`}/>
                                    </div>
                                    <div>
                                        <button type="submit" disabled={isSubmitting} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white ${brandColors.bg} ${brandColors.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${brandColors.ring} disabled:bg-slate-400 disabled:cursor-wait`}>
                                            {isSubmitting ? 'Invio in corso...' : 'Invia Email di Ripristino'}
                                        </button>
                                    </div>
                                </form>
                                <p className="mt-6 text-center text-sm">
                                    <button onClick={switchToLogin} className={`font-medium ${brandColors.text} ${brandColors.hoverText}`.replace('hover:text-', 'hover:text-opacity-80 dark:hover:text-')}>Torna al Login</button>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer onNavigate={onNavigate} isAuth={false} brandKey={brandKey} />
        </div>
    );
};

export default LoginPage;
