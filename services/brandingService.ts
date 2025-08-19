import React from 'react';
import {
    ScansioniChLogoIcon, ScansioniChWordmarkIcon,
    ArchivioChLogoIcon, ArchivioChWordmarkIcon,
    PolizzeChLogoIcon, PolizzeChWordmarkIcon,
    DisdetteChLogoIcon, DisdetteChWordmarkIcon,
    SparklesIcon, CameraIcon, ShieldCheckIcon, DocumentDuplicateIcon, ChatBubbleLeftRightIcon, CoinIcon, MagnifyingGlassIcon, UsersIcon, DocumentTextIcon
} from '../components/icons';

const scansioniFeatures = [
    { icon: React.createElement(SparklesIcon, { className: "w-8 h-8"}), title: "Analisi AI Avanzata", description: "Estrai dati, classifica documenti e ottieni riassunti in pochi secondi con Google Gemini." },
    { icon: React.createElement(CameraIcon, { className: "w-8 h-8"}), title: "Scansione Professionale", description: "Usa la fotocamera con guida all'allineamento per scatti perfetti. L'AI ritaglia e raddrizza per te." },
    { icon: React.createElement(ShieldCheckIcon, { className: "w-8 h-8" }), title: "Privacy e Sicurezza AI", description: "Utilizziamo l'IA di Google Gemini con la garanzia che i tuoi dati non vengano usati per addestrare modelli. Sicurezza a livello enterprise per la tua tranquillità." }
];

const notesFeatures = [
    { icon: React.createElement(DocumentTextIcon, { className: "w-8 h-8"}), title: "Note Contestuali", description: "Crea note personali, familiari o per consulenti e collegale direttamente ai tuoi documenti." },
    { icon: React.createElement(DocumentDuplicateIcon, { className: "w-8 h-8"}), title: "Menzioni @Documento", description: "Tagga facilmente i documenti nelle tue note digitando '@' per un accesso rapido e contestuale." },
    { icon: React.createElement(UsersIcon, { className: "w-8 h-8"}), title: "Condivisione Semplice", description: "Le note familiari sono automaticamente condivise con il tuo nucleo, facilitando la collaborazione." }
];

export const brandAssets = {
    scan: {
        Logo: ScansioniChLogoIcon,
        Wordmark: ScansioniChWordmarkIcon,
        colorClass: 'purple' as const,
        heroTitle: React.createElement(React.Fragment, null, "Trasforma i tuoi documenti ", React.createElement("br", null), " in ", React.createElement("span", { className: "text-purple-600 dark:text-purple-400" }, "dati intelligenti"), "."),
        heroSubtitle: 'Smetti di perdere tempo con la carta. Scansiona, analizza e organizza fatture, ricevute e contratti con la potenza dell\'intelligenza artificiale. In modo sicuro e istantaneo.',
        features: scansioniFeatures,
    },
    archivio: {
        Logo: ArchivioChLogoIcon,
        Wordmark: ArchivioChWordmarkIcon,
        colorClass: 'red' as const,
        heroTitle: React.createElement(React.Fragment, null, "Il tuo archivio digitale. ", React.createElement("br", null), React.createElement("span", { className: "text-red-600 dark:text-red-400" }, "Sicuro e per sempre.")),
        heroSubtitle: 'Conserva, cerca e condividi i tuoi documenti importanti con la massima tranquillità. La ricerca semantica ti permette di trovare ciò che cerchi, sempre.',
        features: [
            { icon: React.createElement(ShieldCheckIcon, { className: "w-8 h-8"}), title: "Archiviazione Sicura", description: "Conserva i tuoi documenti in un caveau digitale protetto e crittografato." },
            { icon: React.createElement(MagnifyingGlassIcon, { className: "w-8 h-8"}), title: "Ricerca Semantica", description: "Trova documenti con linguaggio naturale. Cerca 'la garanzia del frigo' e la troveremo per te." },
            { icon: React.createElement(UsersIcon, { className: "w-8 h-8"}), title: "Condivisione Familiare", description: "Condividi l'accesso al tuo archivio con i membri della famiglia in modo sicuro e controllato." }
        ],
    },
    polizze: {
        Logo: PolizzeChLogoIcon,
        Wordmark: PolizzeChWordmarkIcon,
        colorClass: 'cyan' as const,
        heroTitle: React.createElement(React.Fragment, null, "Tutte le tue polizze, ", React.createElement("br", null), React.createElement("span", { className: "text-cyan-600 dark:text-cyan-400" }, "a portata di mano.")),
        heroSubtitle: 'Centralizza le tue assicurazioni, monitora le scadenze e non perdere mai più un dettaglio importante grazie all\'analisi AI.',
        features: [
            { icon: React.createElement(DocumentDuplicateIcon, { className: "w-8 h-8"}), title: "Portfolio Centralizzato", description: "Visualizza tutte le tue polizze, da qualsiasi compagnia, in un unico posto." },
            { icon: React.createElement(SparklesIcon, { className: "w-8 h-8"}), title: "Analisi Intelligente", description: "L'AI estrae automaticamente i dati chiave come premi, scadenze e franchigie." },
            { icon: React.createElement(ShieldCheckIcon, { className: "w-8 h-8"}), title: "Massima Sicurezza", description: "I tuoi dati sensibili sono protetti con crittografia end-to-end e non vengono mai condivisi." }
        ],
    },
    disdette: {
        Logo: DisdetteChLogoIcon,
        Wordmark: DisdetteChWordmarkIcon,
        colorClass: 'green' as const,
        heroTitle: React.createElement(React.Fragment, null, "Disdette contrattuali, ", React.createElement("br", null), React.createElement("span", { className: "text-green-600 dark:text-green-400" }, "semplici e veloci.")),
        heroSubtitle: 'Crea, gestisci e invia lettere di disdetta in pochi click. Senza stress e senza perdere scadenze importanti.',
        features: [
            { icon: React.createElement(SparklesIcon, { className: "w-8 h-8"}), title: "Creazione Guidata", description: "Il nostro wizard ti aiuta a compilare la lettera di disdetta perfetta in pochi passaggi." },
            { icon: React.createElement(CameraIcon, { className: "w-8 h-8"}), title: "Importa da Scansione", description: "Scansiona un contratto e lascia che l'AI pre-compili i dati per la disdetta." },
            { icon: React.createElement(ChatBubbleLeftRightIcon, { className: "w-8 h-8"}), title: "Promemoria Scadenze", description: "Non perdere mai più una scadenza. Ti avvisiamo noi quando è il momento di agire." }
        ],
    },
    notes: {
        Logo: ScansioniChLogoIcon, // Using main brand logo
        Wordmark: ScansioniChWordmarkIcon, // Using main brand wordmark
        colorClass: 'purple' as const,
        heroTitle: React.createElement(React.Fragment, null, "Collega i puntini. ", React.createElement("br", null), React.createElement("span", { className: "text-purple-600 dark:text-purple-400" }, "Crea note intelligenti.")),
        heroSubtitle: 'Arricchisci i tuoi documenti con note personali, familiari o per consulenti. Tagga i file con @ per creare un hub di conoscenza connesso.',
        features: notesFeatures,
    },
    default: {
        Logo: ScansioniChLogoIcon,
        Wordmark: ScansioniChWordmarkIcon,
        colorClass: 'purple' as const,
        heroTitle: React.createElement(React.Fragment, null, "Trasforma i tuoi documenti ", React.createElement("br", null), " in ", React.createElement("span", { className: "text-purple-600 dark:text-purple-400" }, "dati intelligenti"), "."),
        heroSubtitle: 'Smetti di perdere tempo con la carta. Scansiona, analizza e organizza fatture, ricevute e contratti con la potenza dell\'intelligenza artificiale. In modo sicuro e istantaneo.',
        features: scansioniFeatures,
    }
};

export type BrandKey = keyof typeof brandAssets;
export type BrandColor = typeof brandAssets[BrandKey]['colorClass'];

export const getBrandKey = (): BrandKey => {
    try {
        // 1. Priorità massima al parametro URL per il testing
        const urlParams = new URLSearchParams(window.location.search);
        const brandParam = urlParams.get('brand');
        if (brandParam && ['scan', 'archivio', 'polizze', 'disdette', 'notes'].includes(brandParam)) {
            // Rimuove il parametro per non interferire con la navigazione successiva
            window.history.replaceState({}, document.title, window.location.pathname);
            return brandParam as BrandKey;
        }

        // 2. Logica di produzione basata sull'hostname
        const hostname = window.location.hostname;
        if (hostname.includes('archivio.ch')) return 'archivio';
        if (hostname.includes('polizze.ch')) return 'polizze';
        if (hostname.includes('disdette.ch')) return 'disdette';
        if (hostname.includes('scansioni.ch')) return 'scan';

        // 3. Fallback per ambiente di sviluppo: rotazione automatica
        const brandsInCycle: BrandKey[] = ['archivio', 'polizze', 'disdette', 'scan', 'notes'];
        const sessionKey = 'dev-brand-cycle-index';
        
        let currentIndex = parseInt(sessionStorage.getItem(sessionKey) || '0', 10);
        if (isNaN(currentIndex) || currentIndex >= brandsInCycle.length) {
            currentIndex = 0;
        }

        const currentBrand = brandsInCycle[currentIndex];
        
        const nextIndex = (currentIndex + 1) % brandsInCycle.length;
        sessionStorage.setItem(sessionKey, nextIndex.toString());

        return currentBrand;
        
    } catch (e) {
        console.error("Impossibile determinare il brand, si torna al default.", e);
        return 'scan'; // Default sicuro
    }
};

export const colorStyles: Record<BrandColor, Record<string, string>> = {
    purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-600', hoverBg: 'hover:bg-purple-700', shadow: 'hover:shadow-purple-500/30', ring: 'focus:ring-purple-500', border: 'focus:border-purple-500', darkText: 'dark:text-purple-400', hoverText: 'hover:text-purple-600 dark:hover:text-purple-400' },
    red: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-600', hoverBg: 'hover:bg-red-700', shadow: 'hover:shadow-red-500/30', ring: 'focus:ring-red-500', border: 'focus:border-red-500', darkText: 'dark:text-red-400', hoverText: 'hover:text-red-600 dark:hover:text-red-400' },
    cyan: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-600', hoverBg: 'hover:bg-cyan-700', shadow: 'hover:shadow-cyan-500/30', ring: 'focus:ring-cyan-500', border: 'focus:border-cyan-500', darkText: 'dark:text-cyan-400', hoverText: 'hover:text-cyan-600 dark:hover:text-cyan-400' },
    green: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-600', hoverBg: 'hover:bg-green-700', shadow: 'hover:shadow-green-500/30', ring: 'focus:ring-green-500', border: 'focus:border-green-500', darkText: 'dark:text-green-400', hoverText: 'hover:text-green-600 dark:hover:text-green-400' }
};