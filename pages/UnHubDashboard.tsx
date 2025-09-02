import React from 'react';
import type { User } from '../services/authService';
import { 
    UnHubChWordmarkIcon, ScansioniChLogoIcon, ArchivioChLogoIcon, PolizzeChLogoIcon, DisdetteChLogoIcon,
    CoinIcon, DocumentTextIcon, ShieldCheckIcon, DocumentDuplicateIcon 
} from '../components/icons';
import { brandAssets, type BrandKey } from '../services/brandingService';

interface UnHubDashboardProps {
    user: User;
    onNavigate: (page: string) => void;
    stats: {
        scanCoinBalance: number;
        archivedDocsCount: number;
        polizzeCount: number;
        disdetteCount: number;
    }
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-white/60 dark:bg-slate-700/50 rounded-lg text-purple-600 dark:text-purple-300">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const ServiceCard: React.FC<{ brandKey: BrandKey, onNavigate: () => void, stat: string }> = ({ brandKey, onNavigate, stat }) => {
    const { Logo, Wordmark, colorClass, heroSubtitle } = brandAssets[brandKey];
    const colorVariants = {
        purple: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
        red: 'hover:border-red-500/50 hover:shadow-red-500/10',
        cyan: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
        green: 'hover:border-green-500/50 hover:shadow-green-500/10',
    };

    return (
        <button 
            onClick={onNavigate} 
            className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col text-left h-full transition-all duration-300 border-2 border-transparent ${colorVariants[colorClass]}`}
        >
            <div className="flex items-center gap-3">
                <Logo className="h-9 w-9" />
                <Wordmark className="h-6 text-slate-800 dark:text-slate-200" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 flex-grow">{heroSubtitle.split('.')[0]}.</p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stat}</p>
            </div>
        </button>
    );
};


const UnHubDashboard: React.FC<UnHubDashboardProps> = ({ user, onNavigate, stats }) => {

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Benvenuto in UnHub, {user.name.split(' ')[0]}!</h1>
                <p className="text-slate-500 dark:text-slate-400">La tua dashboard centrale per un mondo digitale più semplice.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Saldo ScanCoin" value={stats.scanCoinBalance.toLocaleString('it-CH')} icon={<CoinIcon className="w-6 h-6"/>} />
                <StatCard title="Documenti Archiviati" value={stats.archivedDocsCount} icon={<DocumentDuplicateIcon className="w-6 h-6"/>} />
                <StatCard title="Polizze Gestite" value={stats.polizzeCount} icon={<ShieldCheckIcon className="w-6 h-6"/>} />
                <StatCard title="Disdette Create" value={stats.disdetteCount} icon={<DocumentTextIcon className="w-6 h-6"/>} />
            </div>

            {/* Service Navigation */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">I Tuoi Servizi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ServiceCard brandKey="scan" onNavigate={() => onNavigate('scan')} stat="Inizia una nuova scansione" />
                    <ServiceCard brandKey="archivio" onNavigate={() => onNavigate('archivio')} stat={`${stats.archivedDocsCount} documenti nel tuo archivio`} />
                    <ServiceCard brandKey="polizze" onNavigate={() => onNavigate('polizze')} stat={`${stats.polizzeCount} polizze nel tuo portafoglio`} />
                    <ServiceCard brandKey="disdette" onNavigate={() => onNavigate('disdette')} stat={`${stats.disdetteCount} disdette create`} />
                </div>
            </div>
        </div>
    );
};

export default UnHubDashboard;