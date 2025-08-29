import React, { useMemo, useState, useEffect } from 'react';
import type { ProcessedPageResult, ScanHistoryEntry, ProcessingMode } from '../services/geminiService';
import { DocumentTextIcon, ShieldCheckIcon, ChevronRightIcon, CoinIcon, BoltIcon, DownloadIcon, CreditCardIcon, CheckCircleIcon, XCircleIcon, SparklesIcon, ArrowUturnLeftIcon } from '../components/icons';
import type { User } from '../services/authService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { generateHistoryPdf } from '../services/pdfService';
import { COIN_TO_CHF_RATE } from '../services/geminiService';


interface DashboardProps {
    user: User;
    onNavigate: (page: string) => void;
    history: ScanHistoryEntry[];
    isLoadingHistory: boolean;
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, subtext?: string, onClick?: () => void }> = ({ title, value, icon, subtext, onClick }) => {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex items-center gap-4 transition-all duration-200 w-full text-left ${onClick ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:shadow-lg hover:-translate-y-1' : ''}`}
        >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-300">
                {icon}
            </div>
            <div className="flex-grow">
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                {subtext && <p className="text-xs text-slate-400 dark:text-slate-500">{subtext}</p>}
            </div>
            {onClick && (
                <div className="ml-auto">
                    <ChevronRightIcon className="w-6 h-6 text-slate-400" />
                </div>
            )}
        </Tag>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, history, isLoadingHistory }) => {
    const [filterType, setFilterType] = useState<'all' | ScanHistoryEntry['type']>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | ScanHistoryEntry['status']>('all');
    const [filterMode, setFilterMode] = useState<'all' | ProcessingMode>('all');
    
    const overallStats = useMemo(() => {
        if (!user) {
            return { totalScans: 0, totalCostCHF: 0, totalCostCoins: 0, scansByMode: {} };
        }

        const { scansUsed, totalCostEver } = user.subscription;

        return {
            totalScans: scansUsed,
            totalCostCHF: totalCostEver * COIN_TO_CHF_RATE,
            totalCostCoins: totalCostEver,
            scansByMode: user.subscription.scansByModeEver,
        };
    }, [user]);

    const modeNames: { [key in ProcessingMode]?: string } = {
        quality: 'Chroma Scan',
        speed: 'Quick Scan',
        business: 'Batch Scan',
        book: 'Deep Scan',
        scontrino: 'Scontrino',
        identity: 'Doc. Identità',
        fotografia: 'Fotografia',
        'no-ai': 'Simple Scan'
    };

    const filteredHistory = useMemo(() => {
        return history.filter(entry => {
            const typeMatch = filterType === 'all' || entry.type === filterType;
            const statusMatch = filterStatus === 'all' || entry.status === filterStatus;
            const modeMatch = filterMode === 'all' || entry.processingMode === filterMode;
            return typeMatch && statusMatch && modeMatch;
        });
    }, [history, filterType, filterStatus, filterMode]);

    const TypeIcon: React.FC<{ type: ScanHistoryEntry['type'] }> = ({ type }) => {
        switch (type) {
            case 'scan': return <DocumentTextIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />;
            case 'reward': return <SparklesIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />;
            case 'refund': return <ArrowUturnLeftIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
            case 'promo': return <SparklesIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />;
            default: return <DocumentTextIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />;
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Riepilogo della tua attività e storico completo.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                 <h2 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-4">Statistiche Complessive</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div id="tutorial-dashboard-stat">
                        <StatCard 
                            title="Scansioni Totali" 
                            value={overallStats.totalScans.toLocaleString('it-CH')} 
                            icon={<DocumentTextIcon className="w-6 h-6"/>}
                            subtext="Da sempre"
                        />
                    </div>
                    <StatCard 
                        title="Saldo Attuale" 
                        value={user.subscription.scanCoinBalance.toLocaleString('it-CH')} 
                        icon={<CoinIcon className="w-6 h-6"/>}
                        subtext="ScanCoin"
                        onClick={() => onNavigate('pricing')}
                    />
                    <StatCard 
                        title="Costo Totale" 
                        value={overallStats.totalCostCoins.toLocaleString('it-CH')}
                        icon={<CreditCardIcon className="w-6 h-6"/>}
                        subtext={`~${overallStats.totalCostCHF.toFixed(2)} CHF`}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Storico Scansioni</h2>
                     <button
                        onClick={() => generateHistoryPdf(filteredHistory)}
                        disabled={filteredHistory.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-4 h-4"/>
                        <span>Scarica Report PDF</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                        <label htmlFor="filter-type" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Tipo</label>
                        <select
                            id="filter-type"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-slate-800"
                        >
                            <option value="all">Tutti i tipi</option>
                            <option value="scan">Scansione</option>
                            <option value="reward">Premio</option>
                            <option value="refund">Rimborso</option>
                            <option value="promo">Promo</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="filter-status" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Stato</label>
                        <select
                            id="filter-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-slate-800"
                        >
                            <option value="all">Tutti gli stati</option>
                            <option value="Success">Successo</option>
                            <option value="Error">Errore</option>
                            <option value="Credited">Accreditato</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="filter-mode" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Modalità</label>
                        <select
                            id="filter-mode"
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value as any)}
                             className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-slate-800"
                        >
                            <option value="all">Tutte le modalità</option>
                            {Object.entries(modeNames).map(([key, name]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="max-h-96 overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data e Ora</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrizione</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modalità</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variazione (SC)</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stato</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                             {isLoadingHistory ? (
                                <tr><td colSpan={5} className="text-center p-8"><LoadingSpinner /></td></tr>
                            ) : filteredHistory.length > 0 ? (
                                filteredHistory.map(entry => {
                                    const isCredit = entry.amountInCoins > 0;
                                    const amountText = `${isCredit ? '+' : ''}${entry.amountInCoins.toLocaleString('it-CH')}`;
                                    const amountColor = isCredit ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200';
                                    
                                    return (
                                        <tr key={entry.id} data-history-uuid={entry.uuid} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-context-menu">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{(entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp)).toLocaleString('it-CH')}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200 max-w-xs truncate" title={entry.description}>
                                                 <div className="flex items-center gap-2">
                                                    <TypeIcon type={entry.type} />
                                                    <span>{entry.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{entry.processingMode ? (modeNames[entry.processingMode] || 'N/A') : 'N/A'}</td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${amountColor}`}>{amountText}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                {entry.status === 'Success' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        <CheckCircleIcon className="w-4 h-4"/> Successo
                                                    </span>
                                                )}
                                                {entry.status === 'Error' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                                        <XCircleIcon className="w-4 h-4"/> Errore
                                                    </span>
                                                )}
                                                {entry.status === 'Credited' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        <CheckCircleIcon className="w-4 h-4"/> Accreditato
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500 dark:text-slate-400">
                                    {history.length > 0 ? 'Nessun risultato corrisponde ai filtri selezionati.' : 'Nessuna transazione trovata nello storico.'}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;