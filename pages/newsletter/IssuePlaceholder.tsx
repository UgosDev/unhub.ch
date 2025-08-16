import React from 'react';
import { Footer } from '../../components/Footer';
import LandingPageHeader from '../LandingPageHeader';
import { PrototypeBanner } from '../../components/PrototypeBanner';
import { type BrandKey } from '../../services/brandingService';
import { ArrowUturnLeftIcon } from '../../components/icons';

interface IssueProps {
    onNavigate: (page: string) => void;
    isStandalonePage?: boolean;
    brandKey: BrandKey;
    issueNumber: number;
}

const IssuePlaceholder: React.FC<IssueProps> = ({ onNavigate, isStandalonePage, brandKey, issueNumber }) => {

    const goBack = () => {
        if(isStandalonePage) {
            onNavigate('newsletter');
        } else {
            onNavigate('newsletter');
        }
    }

    const content = (
         <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-4xl mx-auto">
            <header className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Newsletter #{issueNumber}: Titolo in Arrivo</h1>
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                        <span>Archivio</span>
                    </button>
                </div>
                 <p className="mt-2 text-slate-500 dark:text-slate-400">Prossimamente</p>
            </header>
            <article className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
                <p>Stiamo preparando nuovi contenuti interessanti per te!</p>
                <p>Torna a trovarci presto per leggere questo numero della nostra newsletter.</p>
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

export default IssuePlaceholder;
