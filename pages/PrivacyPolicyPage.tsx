import React, { useRef, useState, useEffect } from 'react';
import { ArrowUturnLeftIcon, DownloadIcon } from '../components/icons';
import { Footer } from '../components/Footer';
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
    const contentRef = useRef<HTMLDivElement>(null);

    const content = (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Informativa sulla Privacy</h1>
                <div className="flex items-center gap-2">
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
                <p>La tua privacy è fondamentale per noi. Questa informativa spiega quali dati raccogliamo quando ti iscrivi alla nostra waitlist per UnHub.ch e i suoi servizi ("Servizio").</p>
                
                <h2>1. Dati Raccolti</h2>
                <p>Quando ti iscrivi alla nostra waitlist, raccogliamo il tuo indirizzo email. Se scegli di iscriverti alla newsletter, conserviamo anche tale preferenza.</p>

                <h2>2. Come Utilizziamo i Dati</h2>
                <ul>
                    <li><strong>Per Fornire Aggiornamenti:</strong> Utilizziamo il tuo indirizzo email per inviarti comunicazioni relative al lancio del servizio, all'accesso anticipato e ad altre notizie importanti.</li>
                    <li><strong>Per Marketing (con consenso):</strong> Se hai dato il tuo consenso, potremmo inviarti newsletter con offerte esclusive e aggiornamenti sullo sviluppo.</li>
                </ul>

                <h2>3. Conservazione dei Dati</h2>
                <p>Il tuo indirizzo email viene conservato in modo sicuro sui nostri sistemi fino al lancio del servizio o finché non decidi di annullare l'iscrizione.</p>

                <h2>4. I Tuoi Diritti</h2>
                <p>Hai il diritto di accedere, correggere o cancellare i tuoi dati in qualsiasi momento. Ogni email che inviamo contiene un link per annullare l'iscrizione con un solo click.</p>
                
                <h2>5. Cookie e Tecnologie Simili</h2>
                 <ul>
                    <li><strong>Cookie Essenziali:</strong> Utilizziamo il `localStorage` (simile a un cookie) per ricordare le tue preferenze, come l'accettazione di questa policy. Questi sono necessari per il funzionamento del sito.</li>
                    <li><strong>Cookie di Analisi:</strong> A seguito del tuo consenso, potremmo utilizzare servizi di terze parti che impostano cookie per raccogliere dati di utilizzo anonimi (es. numero di visitatori).</li>
                </ul>
            </article>
        </div>
    );
    
    // The simplified app no longer has a standalone page concept in the same way.
    // We render the content directly.
    return content;
};

export default PrivacyPolicyPage;
