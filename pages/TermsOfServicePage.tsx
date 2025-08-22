import React, { useRef, useState, useEffect } from 'react';
import { ArrowUturnLeftIcon, DownloadIcon } from '../components/icons';
import { Footer } from '../components/Footer';
import { generateLegalPdf } from '../services/pdfService';
import { PrototypeBanner } from '../components/PrototypeBanner';
import { type BrandKey } from '../services/brandingService';


interface TermsOfServicePageProps {
    onNavigateBack: () => void;
    onNavigate?: (page: string) => void;
    isStandalonePage?: boolean;
    brandKey: BrandKey;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigateBack, onNavigate, isStandalonePage, brandKey }) => {
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
            generateLegalPdf("Termini di Servizio", contentRef.current, appVersion);
        }
    };

    const content = (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Termini di Servizio</h1>
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
                <p>Ultimo aggiornamento: 19 Settembre 2025</p>
                <p>Benvenuto in scansioni.ch. Leggi attentamente questi Termini di Servizio ("Termini") prima di utilizzare il nostro servizio.</p>

                <h2>1. Accettazione dei Termini</h2>
                <p>Creando un account e utilizzando il servizio, accetti di essere vincolato da questi Termini e dalla nostra Informativa sulla Privacy. Se non sei d'accordo con una qualsiasi parte dei termini, non puoi utilizzare il servizio.</p>
                
                <h2>2. Descrizione del Servizio</h2>
                <p>scansioni.ch ("Servizio") fornisce strumenti software per la digitalizzazione, l'analisi tramite intelligenza artificiale (utilizzando API di terze parti come Google Gemini) e l'organizzazione di documenti. Il servizio opera su un modello basato su crediti virtuali ("ScanCoin").</p>
                
                <h2>3. Account Utente e Sicurezza</h2>
                <p>Per utilizzare il servizio è necessario registrare un account. Sei responsabile della sicurezza del tuo account e della riservatezza della tua password. Accetti di essere l'unico responsabile per tutte le attività che si verificano sotto il tuo account. Devi notificarci immediatamente qualsiasi violazione della sicurezza o uso non autorizzato del tuo account.</p>

                <h2>4. Contenuto dell'Utente e Licenza</h2>
                <p>Sei l'unico proprietario e responsabile dei documenti e dei dati che carichi ("Contenuto"). Utilizzando il servizio, ci concedi una licenza limitata, non esclusiva, revocabile e mondiale per elaborare il tuo Contenuto al solo fine di fornirti il Servizio. Non rivendichiamo alcuna proprietà sul tuo Contenuto e la sua riservatezza è protetta come descritto nella nostra Informativa sulla Privacy.</p>

                <h2>5. Utilizzo degli ScanCoin e Pagamenti</h2>
                <p>Tutte le operazioni di analisi AI hanno un costo in ScanCoin, come specificato nell'applicazione. Gli ScanCoin vengono acquistati in pacchetti o forniti tramite abbonamenti. Non hanno valore monetario reale al di fuori della piattaforma, non sono trasferibili e non sono rimborsabili, salvo diversamente specificato da offerte promozionali o richiesto dalla legge applicabile.</p>

                <h2>6. Condotta dell'Utente</h2>
                <p>Accetti di non utilizzare il Servizio per scopi illegali o non autorizzati. Ti impegni a non caricare documenti che contengano virus, malware, o che violino i diritti di proprietà intellettuale, la privacy o altri diritti di terzi. È severamente vietato tentare di decodificare, alterare o accedere in modo improprio ai nostri sistemi.</p>

                <h2>7. Limitazione di Responsabilità</h2>
                <p>Il Servizio è fornito "così com'è" e "come disponibile", senza garanzie di alcun tipo. Non garantiamo che l'analisi AI sarà sempre accurata al 100% o priva di errori. È tua esclusiva responsabilità verificare l'accuratezza dei dati estratti. Nella misura massima consentita dalla legge, scansioni.ch non sarà responsabile per danni diretti, indiretti, incidentali o consequenziali derivanti dall'uso o dall'impossibilità di usare il Servizio.</p>
                
                <h2>8. Modifiche ai Termini</h2>
                <p>Ci riserviamo il diritto, a nostra esclusiva discrezione, di modificare o sostituire questi Termini in qualsiasi momento. In caso di modifiche sostanziali, faremo uno sforzo ragionevole per fornire un preavviso di almeno 30 giorni, tramite email o con un avviso ben visibile all'interno dell'applicazione. L'uso continuato del Servizio dopo l'entrata in vigore di tali modifiche costituirà la tua accettazione dei nuovi Termini.</p>

                <h2>9. Risoluzione del Contratto</h2>
                <p>Puoi terminare il tuo account e smettere di usare il Servizio in qualsiasi momento tramite la tua pagina Profilo. Ci riserviamo il diritto di sospendere o chiudere il tuo account, senza preavviso, in caso di violazione di questi Termini.</p>

                <h2>10. Legge Applicabile e Foro Competente</h2>
                <p>Questi Termini saranno regolati e interpretati in conformità con il diritto materiale svizzero, ad esclusione delle norme sul conflitto di leggi. Qualsiasi controversia derivante da o in relazione a questi Termini sarà soggetta alla giurisdizione esclusiva dei tribunali competenti del Canton Ticino, Svizzera.</p>
            </article>
        </div>
    );
    
    if (isStandalonePage && onNavigate) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
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

export default TermsOfServicePage;