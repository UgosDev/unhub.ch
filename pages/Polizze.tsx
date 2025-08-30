import React, { useState, useEffect, useCallback } from 'react';
import type { ProcessedPageResult } from '../services/geminiService';
import { PolizzeChLogoIcon, PolizzeChWordmarkIcon, DocumentTextIcon, SparklesIcon, UsersIcon, ShieldCheckIcon, DocumentPlusIcon, XMarkIcon, PaperAirplaneIcon } from '../components/icons';
import type { Consultant } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import * as db from '../services/db';
import { analyzePoliciesForInsights } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface PolizzeProps {
    polizzeDocs: ProcessedPageResult[];
    archivedDocs: ProcessedPageResult[];
    consultants: Consultant[];
}

const AiInsights: React.FC<{ policies: ProcessedPageResult[] }> = ({ policies }) => {
    const [analysis, setAnalysis] = useState<{ insights: string[]; upcomingRenewals: { title: string; date: string }[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const runAnalysis = useCallback(async () => {
        if (policies.length === 0) return;
        setIsLoading(true);
        setError('');
        try {
            const result = await analyzePoliciesForInsights(policies);
            setAnalysis(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Analisi AI fallita.');
        } finally {
            setIsLoading(false);
        }
    }, [policies]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-500" />
                    Analisi AI del Portafoglio
                </h3>
                <button onClick={runAnalysis} disabled={isLoading || policies.length === 0} className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-md hover:bg-purple-200 disabled:opacity-50">
                    {isLoading ? 'Analisi...' : 'Analizza Ora'}
                </button>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 min-h-[100px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                ) : !analysis ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center pt-4">Clicca "Analizza Ora" per ricevere suggerimenti personalizzati sulle tue polizze.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">Suggerimenti</h4>
                            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                                {analysis.insights.map((insight, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <ShieldCheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">Scadenze imminenti</h4>
                            {analysis.upcomingRenewals.length > 0 ? (
                                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
                                    {analysis.upcomingRenewals.map((renewal, i) => (
                                        <li key={i}><strong>{new Date(renewal.date).toLocaleDateString('it-CH')}:</strong> {renewal.title}</li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-slate-500 dark:text-slate-400">Nessuna scadenza nei prossimi 90 giorni.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ShareDocsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    consultant: Consultant;
    polizzeDocs: ProcessedPageResult[];
    archivedDocs: ProcessedPageResult[];
    onShare: (consultantId: string, docUuids: string[]) => void;
}> = ({ isOpen, onClose, consultant, polizzeDocs, archivedDocs, onShare }) => {
    const [selectedUuids, setSelectedUuids] = useState<string[]>(consultant.sharedDocUuids || []);
    const allDocs = [...polizzeDocs, ...archivedDocs];

    const toggleSelection = (uuid: string) => {
        setSelectedUuids(prev => 
            prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]
        );
    };

    const handleConfirmShare = () => {
        onShare(consultant.id, selectedUuids);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col">
                <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Condividi con {consultant.name}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-4 overflow-y-auto">
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Seleziona i documenti da rendere visibili al tuo consulente.</p>
                    <div className="space-y-2">
                        {allDocs.map(doc => (
                            <label key={doc.uuid} className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md cursor-pointer">
                                <input type="checkbox" checked={selectedUuids.includes(doc.uuid)} onChange={() => toggleSelection(doc.uuid)} className="h-5 w-5 rounded text-purple-600"/>
                                <DocumentTextIcon className="w-5 h-5 text-slate-400"/>
                                <span className="flex-grow truncate">{doc.analysis.soggetto}</span>
                                <span className="text-xs text-slate-400">{new Date(doc.timestamp).toLocaleDateString('it-CH')}</span>
                            </label>
                        ))}
                    </div>
                </main>
                <footer className="p-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 font-bold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                    <button onClick={handleConfirmShare} className="px-4 py-2 font-bold bg-purple-600 text-white rounded-lg">Salva Condivisione</button>
                </footer>
            </div>
        </div>
    );
};


const Polizze: React.FC<PolizzeProps> = ({ polizzeDocs, archivedDocs, consultants }) => {
    const { user } = useAuth();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [sharingConsultant, setSharingConsultant] = useState<Consultant | null>(null);

    const handleInvite = async () => {
        if (!inviteName || !inviteEmail) return;
        await db.inviteConsultant(inviteName, inviteEmail);
        setIsInviteModalOpen(false);
        setInviteName('');
        setInviteEmail('');
    };

    const handleUpdatePermissions = async (consultantId: string, docUuids: string[]) => {
        await db.updateConsultantPermissions(consultantId, docUuids);
    };

    const handleRevoke = async (consultantId: string) => {
        if (window.confirm("Sei sicuro di voler revocare l'accesso a questo consulente?")) {
            await db.revokeConsultantAccess(consultantId);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                        <PolizzeChLogoIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <PolizzeChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
                        <p className="text-slate-500 dark:text-slate-400">Tutte le tue polizze, a portata di mano.</p>
                    </div>
                </div>

                <AiInsights policies={polizzeDocs} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-4">
                         <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Le Tue Polizze</h2>
                        {polizzeDocs.length > 0 ? (
                             polizzeDocs.map((item) => (
                                <div key={item.uuid} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex items-center gap-4">
                                    <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg"><DocumentTextIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400"/></div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.analysis.soggetto}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{item.analysis.riassunto}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border border-dashed border-slate-300 dark:border-slate-700">
                                <DocumentTextIcon className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600 mx-auto" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Nessuna Polizza</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    Invia qui le tue polizze dalla pagina di scansione per averle sempre organizzate e disponibili.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                         <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">I Tuoi Consulenti</h2>
                        {consultants.map(c => (
                            <div key={c.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{c.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{c.email}</p>
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                                     <button onClick={() => setSharingConsultant(c)} className="flex-1 text-sm font-semibold bg-slate-200 dark:bg-slate-700 rounded-md py-1.5">Condividi</button>
                                     <button onClick={() => handleRevoke(c.id)} className="text-sm font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md px-2 py-1.5">Revoca</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setIsInviteModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50">
                            <DocumentPlusIcon className="w-5 h-5"/> Invita Consulente
                        </button>
                    </div>
                </div>
            </div>

            {isInviteModalOpen && (
                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl">
                        <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg">Invita un Consulente</h3>
                            <button onClick={() => setIsInviteModalOpen(false)}><XMarkIcon className="w-6 h-6"/></button>
                        </header>
                        <main className="p-6 space-y-4">
                            <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Nome e Cognome" className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                             <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email" className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                        </main>
                        <footer className="p-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 font-bold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                            <button onClick={handleInvite} className="px-4 py-2 font-bold bg-purple-600 text-white rounded-lg">Invia Invito</button>
                        </footer>
                    </div>
                </div>
            )}
            
            {sharingConsultant && (
                <ShareDocsModal 
                    isOpen={!!sharingConsultant}
                    onClose={() => setSharingConsultant(null)}
                    consultant={sharingConsultant}
                    polizzeDocs={polizzeDocs}
                    archivedDocs={archivedDocs}
                    onShare={handleUpdatePermissions}
                />
            )}
        </>
    );
};

export default Polizze;
