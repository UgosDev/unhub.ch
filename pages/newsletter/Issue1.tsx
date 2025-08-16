import React from 'react';
import { Footer } from '../../components/Footer';
import LandingPageHeader from '../LandingPageHeader';
import { PrototypeBanner } from '../../components/PrototypeBanner';
import { type BrandKey } from '../../services/brandingService';
import { ArrowUturnLeftIcon, ScansioniChLogoIcon, ArchivioChLogoIcon, PolizzeChLogoIcon, DisdetteChLogoIcon } from '../../components/icons';

interface IssueProps {
    onNavigate: (page: string) => void;
    isStandalonePage?: boolean;
    brandKey: BrandKey;
}

const Issue1: React.FC<IssueProps> = ({ onNavigate, isStandalonePage, brandKey }) => {
    
    const goBack = () => {
        if(isStandalonePage) {
            onNavigate('newsletter');
        } else {
            onNavigate('newsletter');
        }
    }

    const content = (
         <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
            <header className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Benvenuti a UnHub.ch!</h1>
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                        <span>Archivio</span>
                    </button>
                </div>
                <p className="mt-2 text-slate-500 dark:text-slate-400">10 Ottobre 2025 | Numero #1</p>
            </header>
            <article className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
                <p className="lead">Ciao e benvenuto nella nostra prima newsletter! Siamo entusiasti di presentarti <strong>UnHub.ch</strong>, il nuovo ecosistema digitale progettato per semplificare la gestione dei tuoi documenti più importanti.</p>
                
                <h2>Un'Unica Piattaforma per Tutte le Tue Esigenze</h2>
                <p>Abbiamo unito la potenza di quattro servizi specializzati in un'unica, intuitiva piattaforma. Non dovrai più saltare da un sito all'altro: tutto ciò di cui hai bisogno è ora centralizzato, sicuro e sincronizzato su tutti i tuoi dispositivi.</p>

                <h3>I Pilastri di UnHub.ch</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-4">
                        <ScansioniChLogoIcon className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">scansioni.ch</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Il motore di tutto. Digitalizza qualsiasi documento con la nostra AI e preparalo per l'archiviazione o la gestione.</p>
                        </div>
                    </div>
                     <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-4">
                        <ArchivioChLogoIcon className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">archivio.ch</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Il tuo caveau digitale. Conserva documenti importanti in modo sicuro, con ricerca intelligente e condivisione familiare.</p>
                        </div>
                    </div>
                     <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-4">
                        <PolizzeChLogoIcon className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">polizze.ch</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Tieni sotto controllo le tue assicurazioni. L'AI estrae premi e scadenze per te.</p>
                        </div>
                    </div>
                     <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-4">
                        <DisdetteChLogoIcon className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">disdette.ch</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Crea lettere di disdetta precompilate in pochi secondi, senza stress e senza perdere scadenze.</p>
                        </div>
                    </div>
                </div>

                <h3 className="mt-6">Come Iniziare</h3>
                <ol>
                    <li><strong>Scansiona un Documento:</strong> Vai al modulo `scansioni.ch` e carica una fattura o una polizza.</li>
                    <li><strong>Verifica i Dati:</strong> Controlla i dati estratti dalla nostra intelligenza artificiale.</li>
                    <li><strong>Archivia:</strong> Clicca su "Sposta in archivio" o "Sposta in polizze" per conservare il documento nel modulo corretto.</li>
                </ol>
                <p>È tutto! Il documento è ora al sicuro e accessibile da qualsiasi dispositivo. Nelle prossime newsletter, esploreremo in dettaglio le funzionalità di ogni modulo.</p>
                
                <p>Grazie per essere parte del nostro viaggio.</p>
                <p>Il Team di UnHub.ch</p>

            </article>
        </div>
    );
    
    if (isStandalonePage) {
         return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
                <LandingPageHeader onNavigate={onNavigate} brandKey={brandKey} />
                <PrototypeBanner />
                <main className="flex-grow flex items-center justify-center w-full p-4 sm:p-6 lg:p-8">
                    {content}
                </main>
                <Footer onNavigate={onNavigate} isAuth={false} brandKey={brandKey} />
            </div>
        );
    }
    
    return content;
}

export default Issue1;
