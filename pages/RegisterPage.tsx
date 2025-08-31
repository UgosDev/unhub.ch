import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ScansioniChLogoIcon, ScansioniChWordmarkIcon, GoogleIcon, ShieldCheckIcon } from '../components/icons';
import { Footer } from '../components/Footer';
import { PrototypeBanner } from '../components/PrototypeBanner';
import { type BrandKey } from '../services/brandingService';

interface RegisterPageProps {
    onNavigateToLogin: () => void;
    onNavigateToTerms: () => void;
    onNavigateToPrivacy: () => void;
    onNavigate: (page: string) => void;
    brandKey: BrandKey;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin, onNavigateToTerms, onNavigateToPrivacy, onNavigate, brandKey }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) {
            setError("Devi accettare i Termini di Servizio e la Privacy Policy per continuare.");
            return;
        }
        if (password.length < 8) {
            setError("La password deve essere di almeno 8 caratteri.");
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await register(name, email, password);
            // On success, AuthProvider updates state, and App.tsx switches views.
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Si è verificato un errore.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Accesso con Google fallito.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <PrototypeBanner />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="flex justify-center items-center gap-3 mb-8">
                        <ScansioniChLogoIcon className="h-10 w-10" />
                        <ScansioniChWordmarkIcon className="h-8 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
                        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-1">Crea un account</h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Inizia a digitalizzare in pochi secondi.</p>
                         {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Nome e Cognome
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="email-register" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email
                                </label>
                                <input
                                    id="email-register"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="password-register" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <input
                                    id="password-register"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div className="pt-2">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="text-slate-500 dark:text-slate-400">
                                            Dichiaro di aver letto e accettato i{' '}
                                            <button type="button" onClick={onNavigateToTerms} className="font-medium text-purple-600 hover:underline dark:text-purple-400">
                                                Termini di Servizio
                                            </button>
                                            {' '}e la{' '}
                                            <button type="button" onClick={onNavigateToPrivacy} className="font-medium text-purple-600 hover:underline dark:text-purple-400">
                                                Privacy Policy
                                            </button>
                                            .
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !acceptedTerms}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Creazione in corso...' : 'Registrati'}
                                </button>
                            </div>
                        </form>
                         <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300 dark:border-slate-600" /></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">oppure</span></div>
                        </div>
                        <div>
                                <button onClick={handleGoogleSignIn} disabled={isSubmitting} className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-200 disabled:cursor-wait">
                                <GoogleIcon className="w-5 h-5" />
                                Registrati con Google
                            </button>
                        </div>
                        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span>Utilizziamo l'IA sicura di Google. I tuoi dati non vengono usati per addestrare modelli.</span>
                        </div>
                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Hai già un account?{' '}
                            <button onClick={onNavigateToLogin} className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                                Accedi
                            </button>
                        </p>
                    </div>
                </div>
            </main>
            <Footer onNavigate={onNavigate} isAuth={false} brandKey={brandKey} />
        </div>
    );
};

export default RegisterPage;