import React, { useRef, useState, useEffect } from 'react';
import { ArrowUturnLeftIcon, DownloadIcon } from '../components/icons';
import { Footer } from '../components/Footer';
import { generateLegalPdf } from '../services/pdfService';
import { PrototypeBanner } from '../components/PrototypeBanner';
import { type BrandKey } from '../services/brandingService';
import LandingPageHeader from './LandingPageHeader';

interface PrivacyPolicyPageProps {
    onNavigateBack: () => void;
    onNavigate?: (page: string) => void;
    isStandalonePage?: boolean;
    brandKey: BrandKey;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateBack, onNavigate, isStandalonePage, brandKey }) => {
    const [appVersion, setAppVersion] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('./metadata.json')
            .then(res => res.json())
            .then(data => setAppVersion(data.version || ''))
            .catch(() => setAppVersion('N/A'));
    }, []);

    const handleDownload = () => {
        if (contentRef.current && appVersion) {
            generateLegalPdf("Informativa sulla Privacy", contentRef.current, appVersion);
        }
    };

    const content = (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Informativa sulla Privacy</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>PDF</span>
                    </button>
                    <button
                        onClick={onNavigateBack}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                        <span>Indietro</span>
                    </button>
                </div>
            </div>
            <article ref={contentRef} className="prose prose-slate dark:prose-invert max-w-none">
                <p>Ultimo aggiornamento: 20 Settembre 2025</p>
                <p>La tua privacy è fondamentale per noi. Questa informativa spiega in modo trasparente quali dati personali raccogliamo, come li trattiamo e dove li conserviamo quando utilizzi la nostra applicazione web scansioni.ch ("Servizio").</p>
                
                <h2>1. Dati Raccolti</h2>
                <p>Raccogliamo diverse categorie di dati per fornire e migliorare il nostro Servizio:</p>
                <ul>
                    <li><strong>Dati di Registrazione:</strong> Quando crei un account, raccogliamo il tuo nome e il tuo indirizzo email.</li>
                    <li><strong>Contenuto Elaborato:</strong> I file (immagini, PDF) che carichi per l'analisi. Questi file possono contenere dati personali, di cui sei l'unico responsabile.</li>
                    <li><strong>Dati di Accesso:</strong> Per la tua sicurezza, registriamo l'indirizzo IP e la località approssimativa (città/paese) al momento di ogni accesso riuscito. Questi dati sono visibili solo a te nel tuo Profilo.</li>
                    <li><strong>Dati di Utilizzo Anonimi:</strong> Utilizziamo strumenti di analisi per raccogliere dati anonimi su come interagisci con l'interfaccia dell'applicazione (es. click, scorrimento). Questi dati ci aiutano a identificare problemi e a migliorare l'esperienza utente.</li>
                </ul>

                <h2>2. Come Utilizziamo i Dati</h2>
                <ul>
                    <li><strong>Per Fornire il Servizio:</strong> La funzione principale dell'app è analizzare i tuoi documenti. Questa analisi avviene tramite l'invio dei dati dell'immagine a servizi di terze parti, specificamente l'API di Google Gemini. <strong>In accordo con i termini di servizio di Google, i dati inviati tramite l'API non vengono utilizzati per addestrare i loro modelli di intelligenza artificiale.</strong></li>
                    <li><strong>Per la Sicurezza del Tuo Account:</strong> I dati di accesso (indirizzo IP, località) vengono raccolti per permetterti di monitorare attività sospette sul tuo account.</li>
                    <li><strong>Per la Comunicazione:</strong> Utilizziamo il tuo indirizzo email per comunicazioni essenziali relative al tuo account, come la reimpostazione della password o notifiche importanti sul servizio.</li>
                    <li><strong>Per Migliorare l'Applicazione:</strong> I dati di utilizzo anonimi vengono analizzati in forma aggregata per capire quali funzionalità sono più usate e come possiamo rendere l'applicazione più intuitiva ed efficiente.</li>
                     <li><strong>Per la Comunicazione tra Applicazioni:</strong> Quando utilizzi la funzione "Invia a...", i dati del fascicolo selezionato vengono trasmessi direttamente dal tuo browser all'applicazione partner (es. `archivio.ch`) tramite un Broadcast Channel, senza passare attraverso i nostri server.</li>
                </ul>

                <h2>3. Conservazione dei Dati</h2>
                <p>I tuoi dati di lavoro (documenti analizzati, chat, ecc.) vengono salvati in modo sicuro su Google Firestore e sincronizzati tra i tuoi dispositivi. Non conserviamo copie delle immagini originali sui nostri server dopo l'elaborazione. Hai il pieno controllo per eliminare i tuoi dati in qualsiasi momento.</p>

                <h2>4. I Tuoi Diritti e il Controllo sui Dati</h2>
                <p>Hai il massimo controllo sui tuoi dati:</p>
                <ul>
                    <li><strong>Accesso e Modifica:</strong> Puoi visualizzare e modificare i dati estratti direttamente nell'interfaccia dell'applicazione.</li>
                    <li><strong>Cancellazione:</strong> Puoi eliminare singoli documenti o interi fascicoli in qualsiasi momento. L'azione "Pulisci Sessione" rimuove tutti i risultati dall'area di lavoro corrente.</li>
                    <li><strong>Cancellazione Totale:</strong> Utilizzando l'opzione "Cancella Account e Dati" nella pagina Profilo, attiverai un processo che elimina in modo irreversibile tutti i tuoi dati dai nostri sistemi.</li>
                </ul>

                <h2>5. Cookie e Tecnologie Simili</h2>
                 <ul>
                    <li><strong>Cookie Essenziali:</strong> Utilizziamo il `localStorage` (simile a un cookie) per gestire la tua sessione di login e salvare le tue preferenze (es. tema visivo). Questi sono necessari per il funzionamento dell'app.</li>
                    <li><strong>Cookie di Analisi:</strong> A seguito del tuo consenso, potremmo utilizzare servizi di terze parti che impostano cookie per raccogliere dati di utilizzo anonimi, come descritto nella Sezione 1.</li>
                </ul>
            </article>
        </div>
    );
    
    if (isStandalonePage && onNavigate) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
                <LandingPageHeader onNavigate={onNavigate} brandKey={brandKey} />
                <PrototypeBanner />
                <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    {content}
                </main>
                <Footer onNavigate={onNavigate} isAuth={false} brandKey={brandKey} />
            </div>
        );
    }

    return content;
};

export default PrivacyPolicyPage;
