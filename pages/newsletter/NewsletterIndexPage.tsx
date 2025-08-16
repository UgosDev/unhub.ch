import React from 'react';
import { Footer } from '../../components/Footer';
import LandingPageHeader from '../LandingPageHeader';
import { PrototypeBanner } from '../../components/PrototypeBanner';
import { type BrandKey } from '../../services/brandingService';
import { newsletterContent } from './content';
import { ArrowUturnLeftIcon } from '../../components/icons';


interface NewsletterIndexPageProps {
    onNavigate: (page: string) => void;
    isStandalonePage?: boolean;
    brandKey: BrandKey;
}

const NewsletterIndexPage: React.FC<NewsletterIndexPageProps> = ({ onNavigate, isStandalonePage, brandKey }) => {

    const content = (
         <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-5xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Archivio Newsletter</h1>
                {isStandalonePage && (
                     <button
                        onClick={() => onNavigate('landing')}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                        <span>Home</span>
                    </button>
                )}
            </div>
             <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                Resta aggiornato con le ultime novità, i consigli e gli annunci dal team di UnHub.ch.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsletterContent.map(issue => (
                    <button 
                        key={issue.id} 
                        onClick={() => onNavigate(`newsletter/${issue.id}`)}
                        className="block p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border border-slate-200 dark:border-slate-700 transition-all duration-300 text-left"
                    >
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{issue.date}</p>
                        <h2 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100">{issue.title}</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{issue.summary}</p>
                    </button>
                ))}
            </div>
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

export default NewsletterIndexPage;
