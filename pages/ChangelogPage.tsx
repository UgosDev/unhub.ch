import React, { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
    ArrowUturnLeftIcon, SparklesIcon, CreditCardIcon, LayersIcon, RocketLaunchIcon, 
    EyeIcon, LightBulbIcon, CameraIcon, ShieldCheckIcon, DownloadIcon, UsersIcon 
} from '../components/icons';
import { Footer } from '../components/Footer';
import { PrototypeBanner } from '../components/PrototypeBanner';
import LandingPageHeader from './LandingPageHeader';
import { type BrandKey } from '../services/brandingService';

interface ChangelogPageProps {
    onNavigateBack?: () => void;
    onNavigate?: (page: string) => void;
    isStandalonePage?: boolean;
    brandKey: BrandKey;
}

interface Change {
  tag: string;
  description: string;
}

interface Version {
  version: string;
  icon: React.ReactNode;
  changes: Change[];
}

const RoadmapCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl flex flex-col h-full border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-600">
        <div className="p-2 bg-white dark:bg-slate-700 rounded-full text-purple-600 dark:text-purple-400 self-start mb-4 shadow-sm">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
    </div>
);

const VersionBlock: React.FC<{ versionData: Version; index: number }> = ({ versionData, index }) => {
    const tagStyles: { [key: string]: string } = {
        'Aggiunto': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Migliorato': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Corretto': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'Modificato': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    };
    
    const isEven = index % 2 === 0;
    const alignmentClass = isEven ? 'md:flex-row-reverse' : 'md:flex-row';
    const pointerClass = isEven ? 'md:right-0 md:border-l-transparent md:border-r-slate-200 dark:md:border-r-slate-700' : 'md:left-0 md:border-r-transparent md:border-l-slate-200 dark:md:border-l-slate-700';

    return (
        <div className={`flex items-center w-full my-6 -ml-1.5 md:ml-0 ${alignmentClass}`}>
             <div className="hidden md:block w-5/12"></div> {/* Spacer */}
            <div className="hidden md:block w-2/12">
                <div className="h-full w-0.5 bg-slate-200 dark:bg-slate-700 mx-auto"></div>
            </div>
            <div className="w-full md:w-5/12">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 relative">
                    {/* Pointer */}
                    <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-0 w-0 border-y-8 border-y-transparent border-[10px] ${pointerClass}`}></div>
                    
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Versione {versionData.version}</h3>
                    <ul className="space-y-3 mt-4">
                        {versionData.changes.map((change, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full w-24 text-center flex-shrink-0 ${tagStyles[change.tag] || 'bg-slate-100'}`}>
                                    {change.tag}
                                </span>
                                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: change.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>') }}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const ChangelogPage: React.FC<ChangelogPageProps> = ({ onNavigateBack, onNavigate, isStandalonePage, brandKey = 'scan' }) => {
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const getIconForVersion = useMemo(() => (changes: Change[]): React.ReactNode => {
        const text = changes.map(c => c.tag.toLowerCase() + " " + c.description.toLowerCase()).join(' ');
        if (text.includes('famiglia') || text.includes('condivisione') || text.includes('utent')) return <UsersIcon className="w-6 h-6"/>;
        if (text.includes('archivio') || text.includes('polizze') || text.includes('disdette') || text.includes('modul')) return <LayersIcon className="w-6 h-6"/>;
        if (text.includes('ugo') || text.includes('chat') || text.includes('ai') || text.includes('gemini') || text.includes('semantica')) return <SparklesIcon className="w-6 h-6"/>;
        if (text.includes('pagamenti') || text.includes('prezzi') || text.includes('abbonament') || text.includes('coin')) return <CreditCardIcon className="w-6 h-6"/>;
        if (text.includes('fotocamera') || text.includes('camera') || text.includes('opencv') || text.includes('scatto')) return <CameraIcon className="w-6 h-6"/>;
        if (text.includes('sicurezza') || text.includes('2fa') || text.includes('privacy') || text.includes('login')) return <ShieldCheckIcon className="w-6 h-6"/>;
        if (text.includes('ui') || text.includes('ux') || text.includes('design') || text.includes('layout') || text.includes('interfaccia') || text.includes('tema')) return <EyeIcon className="w-6 h-6"/>;
        if (text.includes('pwa') || text.includes('offline') || text.includes('installa')) return <DownloadIcon className="w-6 h-6"/>;
        return <RocketLaunchIcon className="w-6 h-6" />;
    }, []);

    useEffect(() => {
        const parseChangelog = (markdown: string): Version[] => {
            const versions: Version[] = [];
            const versionRegex = /## \[(.*?)]\n([\s\S]*?)(?=\n## \[|$)/g;
            let match;

            while ((match = versionRegex.exec(markdown)) !== null) {
                const versionNumber = match[1];
                const contentBlock = match[2];
                const allChangesForVersion: Change[] = [];

                const changeTypeRegex = /### (.*?)\n([\s\S]*?)(?=\n### |$)/g;
                let changeMatch;

                while ((changeMatch = changeTypeRegex.exec(contentBlock)) !== null) {
                    const tag = changeMatch[1].trim();
                    const changesText = changeMatch[2];
                    const itemRegex = /\* (.*)/g;
                    let itemMatch;

                    while ((itemMatch = itemRegex.exec(changesText)) !== null) {
                        const description = itemMatch[1].trim();
                        if (description) {
                            allChangesForVersion.push({ tag, description });
                        }
                    }
                }

                if (allChangesForVersion.length > 0) {
                    versions.push({
                        version: versionNumber,
                        icon: getIconForVersion(allChangesForVersion),
                        changes: allChangesForVersion
                    });
                }
            }
            return versions;
        };

        fetch('./CHANGELOG.md')
            .then(res => res.text())
            .then(text => {
                const parsed = parseChangelog(text);
                setVersions(parsed);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load CHANGELOG.md", err);
                setIsLoading(false);
            });
    }, [getIconForVersion]);

    const pageContent = (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-5xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-300 dark:border-slate-700 pb-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Evoluzione del Progetto</h1>
                {onNavigateBack && (
                     <button
                        onClick={onNavigateBack}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                        <span>Indietro</span>
                    </button>
                )}
            </div>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-2 text-center text-slate-800 dark:text-slate-100">Cosa riserva il futuro</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Uno sguardo alle prossime grandi novità che stiamo sviluppando per te.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RoadmapCard 
                        icon={<CreditCardIcon className="w-6 h-6"/>}
                        title="Pagamenti Reali"
                        description="Integrazione con Stripe per l'acquisto sicuro di ScanCoin e la gestione degli abbonamenti."
                    />
                    <RoadmapCard 
                        icon={<LayersIcon className="w-6 h-6"/>}
                        title="Scansione Doppia Pagina"
                        description="Una nuova modalità per acquisire due pagine di un libro in un unico scatto, dividendole automaticamente."
                    />
                    <RoadmapCard 
                        icon={<LightBulbIcon className="w-6 h-6"/>}
                        title="Import da App di Messaggistica"
                        description="Invia documenti direttamente da Telegram o WhatsApp per un flusso di lavoro ancora più rapido."
                    />
                </div>
            </section>

             <h2 className="text-2xl font-bold mb-6 pt-8 border-t border-slate-300 dark:border-slate-700">Storico Versioni</h2>
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <LoadingSpinner />
                </div>
            ) : versions.length > 0 ? (
                <div className="relative">
                    {/* The timeline line */}
                    <div className="hidden md:block absolute top-10 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                    {versions.map((version, index) => (
                        <div key={version.version} className="relative">
                            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shadow-inner">
                                    {version.icon}
                                </div>
                            </div>
                             <VersionBlock versionData={version} index={index} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-4">Impossibile caricare lo storico delle versioni.</p>
            )}
        </div>
    );

    if (isStandalonePage && onNavigate) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
                <LandingPageHeader onNavigate={onNavigate} brandKey={brandKey} />
                <PrototypeBanner />
                <main className="flex-grow flex items-center justify-center w-full p-4 sm:p-6 lg:p-8">
                    {pageContent}
                </main>
                <Footer onNavigate={onNavigate} isAuth={false} brandKey={brandKey} />
            </div>
        );
    }
    
    return pageContent;
};

export default ChangelogPage;