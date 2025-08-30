import React, { useState, useEffect } from 'react';
import { Footer } from '../components/Footer';
import LandingPageHeader from './LandingPageHeader';
import { PrototypeBanner } from '../components/PrototypeBanner';
import { brandAssets, type BrandKey } from '../services/brandingService';

interface LandingPageProps {
    onNavigate: (page: 'login' | 'register' | 'pricing' | 'changelog' | 'terms' | 'privacy' | 'landing') => void;
    brandKey: BrandKey;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col p-6 bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg transition-transform transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-300 mb-4 w-fit">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
);

const HowItWorksStep: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
    <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300 font-bold text-2xl">
            {number}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; title: string }> = ({ quote, author, title }) => (
    <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <p className="relative text-slate-700 dark:text-slate-300">
            <span className="absolute -top-3 -left-4 text-6xl text-slate-100 dark:text-slate-700 font-serif">“</span>
            <span className="relative">{quote}</span>
        </p>
        <div className="mt-4">
            <p className="font-bold text-slate-900 dark:text-slate-100">{author}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        </div>
    </div>
);


const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="group border-b border-slate-200 dark:border-slate-700 last:border-b-0 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
            {question}
            <div className="ml-4 text-slate-500 group-open:rotate-180 transition-transform">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </div>
        </summary>
        <div className="mt-4 text-slate-600 dark:text-slate-400">
            {children}
        </div>
    </details>
);


const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, brandKey }) => {
  const [version, setVersion] = useState('');
  const brand = brandAssets[brandKey] || brandAssets.default;

  useEffect(() => {
    fetch('./metadata.json')
      .then(response => response.json())
      .then(data => {
        if(data?.version) { setVersion(data.version); }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col">
      <LandingPageHeader onNavigate={onNavigate} version={version} brandKey={brandKey} />
      <PrototypeBanner />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 text-center flex flex-col items-center bg-white dark:bg-slate-800/5 overflow-hidden">
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-200/50 dark:bg-purple-900/30 rounded-full filter blur-3xl opacity-50"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-sky-200/50 dark:bg-sky-900/30 rounded-full filter blur-3xl opacity-50"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                   {brand.heroTitle}
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
                    {brand.heroSubtitle}
                </p>
                <button
                    onClick={() => onNavigate('register')}
                    className="mt-10 px-8 py-4 text-lg font-bold bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                    Inizia Gratuitamente
                </button>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-16">
                     <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                        Tutto in tre semplici passaggi
                     </h2>
                     <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                        Il nostro processo è progettato per essere veloce, intuitivo e potente.
                     </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   <HowItWorksStep number="1" title="Scansiona" description="Usa la fotocamera o carica file (PDF, JPG, PNG). L'app rileva i bordi e raddrizza l'immagine." />
                   <HowItWorksStep number="2" title="Analizza" description="L'AI estrae dati, classifica il documento e lo controlla per la sicurezza. Tutto in pochi secondi." />
                   <HowItWorksStep number="3" title="Gestisci" description="I documenti vengono raggruppati in fascicoli. Controlla, modifica e invia alle nostre app partner." />
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 bg-white dark:bg-slate-800/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                     <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                        Una suite di strumenti potenti
                     </h2>
                     <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                        Dalla scansione alla gestione, tutto ciò che ti serve per l'ordine digitale.
                     </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {brand.features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 sm:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                     <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                        Dicono di noi
                     </h2>
                     <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                        Scopri perché professionisti e privati scelgono scansioni.ch.
                     </p>
                </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <TestimonialCard quote="Ha trasformato il modo in cui gestisco le fatture. Il raggruppamento automatico mi fa risparmiare ore ogni settimana." author="Luca Bianchi" title="Freelance" />
                    <TestimonialCard quote="La sicurezza è fondamentale per noi. Il controllo delle minacce integrato ci dà la tranquillità di cui avevamo bisogno." author="Giulia Neri" title="Responsabile Amministrativa, Studio Legale Verdi" />
                    <TestimonialCard quote="L'interfaccia è pulita e super intuitiva. In 5 minuti stavo già scansionando i miei documenti senza problemi." author="Marco Rossetti" title="Utente Privato" />
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-28 bg-white dark:bg-slate-800/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center mb-16">
                     <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                        Domande Frequenti
                     </h2>
                </div>
                <div className="space-y-2">
                    <FaqItem question="Come funzionano gli ScanCoin?">
                        Gli ScanCoin sono la valuta interna dell'app. Invece di un abbonamento, acquisti pacchetti di ScanCoin e li usi per pagare le scansioni. Ogni modalità ha un costo diverso, offrendoti massima flessibilità.
                    </FaqItem>
                    <FaqItem question="I miei dati sono al sicuro?">
                        Sì. I tuoi documenti vengono analizzati ma non memorizzati sui nostri server. Vengono salvati in modo sicuro e sincronizzati tra i tuoi dispositivi tramite Firebase Firestore. Usiamo l'API di Google Gemini per l'analisi, che non utilizza i dati per addestrare i suoi modelli.
                    </FaqItem>
                    <FaqItem question="Posso usare l'app su più dispositivi?">
                        Sì! Tutti i tuoi dati, incluse le scansioni, lo storico e il saldo ScanCoin, sono sincronizzati in tempo reale su tutti i tuoi dispositivi. Inizia a lavorare sul computer e continua sul telefono senza interruzioni.
                    </FaqItem>
                </div>
            </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-20 sm:py-28">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                    Pronto a dire addio alla carta?
                 </h2>
                 <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Crea un account gratuito e ricevi i tuoi primi ScanCoin per iniziare subito.
                 </p>
                 <button
                    onClick={() => onNavigate('register')}
                    className="mt-8 px-8 py-4 text-lg font-bold bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-xl hover:shadow-2xl"
                 >
                    Inizia Ora
                 </button>
             </div>
        </section>

      </main>

       <Footer onNavigate={onNavigate} isAuth={false} brandKey={brandKey} />
    </div>
  );
};

export default LandingPage;
