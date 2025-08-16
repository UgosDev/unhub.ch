import React, { useState, useMemo, useCallback } from 'react';
import type { UserFeedback } from '../services/firestoreService';
import type { User } from '../services/authService';
import { COIN_TO_CHF_RATE } from '../services/geminiService';
import { 
    HandThumbUpIcon, HandThumbDownIcon, SparklesIcon, EyeIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, 
    XMarkIcon, UsersIcon, DocumentDuplicateIcon, CoinIcon, ArrowUpIcon, ArrowDownIcon
} from '../components/icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { GoogleGenAI } from "@google/genai";

// Inizializzazione API Gemini per analisi
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


interface AdminDashboardProps {
    feedbackData: UserFeedback[];
    allUsersData: User[] | null;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; changeType?: 'positive' | 'negative'; subtext?: string; }> = ({ title, value, icon, change, changeType, subtext }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md flex flex-col justify-between">
        <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
            <div className="text-slate-400 dark:text-slate-500">{icon}</div>
        </div>
        <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</p>
            {subtext && <p className="text-xs text-slate-500 dark:text-slate-400">{subtext}</p>}
            {change && (
                <div className={`flex items-center text-sm mt-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                    {changeType === 'positive' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                    <span>{change}</span>
                </div>
            )}
        </div>
    </div>
);

const FeedbackDonutChart: React.FC<{ positive: number; negative: number }> = ({ positive, negative }) => {
    const total = positive + negative;
    if (total === 0) return <div className="flex items-center justify-center h-full text-slate-500">Nessun dato</div>;

    const positivePercent = (positive / total) * 100;
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (positivePercent / 100) * circumference;

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle className="text-red-200 dark:text-red-800/50" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
                <circle
                    className="text-green-500"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="54"
                    cx="60"
                    cy="60"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{Math.round(positivePercent)}%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Positivi</span>
            </div>
        </div>
    );
};

const FeedbackTypeBarChart: React.FC<{ scanCount: number; chatCount: number }> = ({ scanCount, chatCount }) => {
    const total = scanCount + chatCount;
    if (total === 0) return <div className="flex items-center justify-center h-full text-slate-500">Nessun dato</div>;
    
    const scanPercent = (scanCount / total) * 100;
    const chatPercent = (chatCount / total) * 100;

    return (
        <div className="w-full h-full flex flex-col justify-end gap-4 px-4">
            <div className="flex items-end justify-around h-full gap-6">
                <div className="flex flex-col items-center w-1/2">
                    <div className="font-bold text-lg text-slate-700 dark:text-slate-200">{scanCount}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg h-full flex items-end">
                        <div className="w-full bg-purple-500 rounded-t-lg" style={{ height: `${scanPercent}%`, transition: 'height 0.5s ease-out' }} />
                    </div>
                    <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">Scansioni</div>
                </div>
                 <div className="flex flex-col items-center w-1/2">
                    <div className="font-bold text-lg text-slate-700 dark:text-slate-200">{chatCount}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg h-full flex items-end">
                        <div className="w-full bg-sky-500 rounded-t-lg" style={{ height: `${chatPercent}%`, transition: 'height 0.5s ease-out' }} />
                    </div>
                    <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">Chat</div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ feedbackData, allUsersData }) => {
    const [filterType, setFilterType] = useState<'all' | 'scan' | 'chat'>('all');
    const [filterValue, setFilterValue] = useState<'all' | 'good' | 'bad'>('all');
    
    // State per l'analisi AI
    const [aiAnalysisResult, setAiAnalysisResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiError, setAiError] = useState('');

    const stats = useMemo(() => {
        const totalFeedback = feedbackData.length;
        const positiveCount = feedbackData.filter(f => f.feedbackValue === 'good').length;
        const negativeCount = totalFeedback - positiveCount;
        const scanFeedbackCount = feedbackData.filter(f => f.type === 'scan').length;
        const chatFeedbackCount = totalFeedback - scanFeedbackCount;
        const uniqueUsersWithFeedback = new Set(feedbackData.map(f => (f as any).userId)).size;

        return {
            totalFeedback,
            positiveCount,
            negativeCount,
            scanFeedbackCount,
            chatFeedbackCount,
            uniqueUsersWithFeedback,
        };
    }, [feedbackData]);
    
    const kpiData = useMemo(() => {
        if (!allUsersData) {
            return { totalUsers: 0, totalScans: 0, revenue: 0, monthlyForecast: 0 };
        }

        const totalScans = allUsersData.reduce((acc, u) => acc + (u.subscription?.scansUsed || 0), 0);
        const totalCostEverInCoins = allUsersData.reduce((acc, u) => acc + (u.subscription?.totalCostEver || 0), 0);
        
        // Calcolo previsione mensile
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const revenueThisMonthInCoins = allUsersData.reduce((acc, u) => {
             // Questo è un calcolo approssimativo. Un sistema reale avrebbe dati di transazione con timestamp.
             // Qui assumiamo che i costi siano distribuiti uniformemente nel tempo.
             // Per una demo, calcoliamo una media giornaliera e proiettiamo.
             return acc + (u.subscription?.totalCostEver || 0);
        }, 0);
        
        // Per semplicità demo, proiettiamo basandoci sul totale.
        // Un calcolo più preciso richiederebbe la data di registrazione dell'utente.
        const totalDaysSinceProjectStart = 30; // Valore fittizio
        const avgDailyRevenueCoins = totalCostEverInCoins / totalDaysSinceProjectStart;
        const monthlyForecastCoins = avgDailyRevenueCoins * daysInMonth;

        return {
            totalUsers: allUsersData.length,
            totalScans,
            revenue: totalCostEverInCoins * COIN_TO_CHF_RATE,
            monthlyForecast: monthlyForecastCoins * COIN_TO_CHF_RATE,
        };
    }, [allUsersData]);

    const handleAnalyzeWithAI = useCallback(async () => {
        if (isAnalyzing || feedbackData.length === 0) return;
        
        setIsAnalyzing(true);
        setAiAnalysisResult('');
        setAiError('');

        const feedbackSummary = feedbackData
            .map(fb => `- TIPO: ${fb.type}, VALUTAZIONE: ${fb.feedbackValue}, CONTESTO: ${JSON.stringify(fb.context)}`)
            .join('\n');
            
        const prompt = `Sei un analista di business per un'applicazione SaaS chiamata "scansioni.ch". Analizza il seguente dump di feedback degli utenti. Il tuo compito è fornire un'analisi chiara e concisa in formato MARKDOWN.

Struttura la tua risposta come segue:
1.  **Riepilogo Esecutivo**: Un paragrafo che riassume il sentiment generale e i punti chiave.
2.  **Temi Positivi Principali**: Elenco puntato dei 3 aspetti più apprezzati dagli utenti.
3.  **Criticità Ricorrenti**: Elenco puntato dei 3 problemi o lamentele più comuni.
4.  **Suggerimenti Pratici (Top 3)**: Elenco numerato di 3 azioni concrete e attuabili che il team di sviluppo dovrebbe considerare per migliorare il prodotto, basandoti direttamente sulle criticità emerse.

Ecco i dati del feedback:
${feedbackSummary}
`;

        try {
            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            for await (const chunk of responseStream) {
                setAiAnalysisResult(prev => prev + chunk.text);
            }

        } catch (error) {
            console.error("Errore analisi AI:", error);
            setAiError("Si è verificato un errore durante l'analisi. Riprova più tardi.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [feedbackData, isAnalyzing]);


    const filteredFeedback = useMemo(() => {
        return feedbackData.filter(item => {
            const typeMatch = filterType === 'all' || item.type === filterType;
            const valueMatch = filterValue === 'all' || item.feedbackValue === filterValue;
            return typeMatch && valueMatch;
        });
    }, [feedbackData, filterType, filterValue]);
    
    if (allUsersData === null) {
        return (
            <div className="flex flex-col items-center justify-center p-10">
                <LoadingSpinner />
                <p className="mt-4 text-slate-500">Caricamento dati admin...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <SparklesIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Dashboard Admin</h1>
                    <p className="text-slate-500 dark:text-slate-400">Panoramica sull'utilizzo e la soddisfazione degli utenti.</p>
                </div>
            </div>
            
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Utenti Totali" value={kpiData.totalUsers.toLocaleString('it-CH')} icon={<UsersIcon className="w-6 h-6"/>} />
                <StatCard title="Scansioni Totali" value={kpiData.totalScans.toLocaleString('it-CH')} icon={<DocumentDuplicateIcon className="w-6 h-6"/>} />
                <StatCard title="Ricavo Stimato (CHF)" value={kpiData.revenue.toFixed(2)} icon={<CoinIcon className="w-6 h-6"/>} />
                <StatCard title="Feedback Ricevuti" value={stats.totalFeedback.toLocaleString('it-CH')} icon={<ChatBubbleLeftRightIcon className="w-6 h-6"/>} />
            </div>

            {/* Financial Overview */}
             <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                <h2 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-4">Panoramica Finanziaria</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-1 bg-purple-50 dark:bg-purple-900/30 p-5 rounded-xl flex flex-col items-center justify-center text-center">
                        <p className="font-semibold text-purple-800 dark:text-purple-200">Previsione Entrate Mensili</p>
                        <p className="text-4xl font-extrabold text-purple-700 dark:text-purple-300 my-2">~{kpiData.monthlyForecast.toFixed(0)} CHF</p>
                        <p className="text-xs text-purple-500 dark:text-purple-400">Basato sull'attività media giornaliera.</p>
                    </div>
                     <div className="md:col-span-2 grid grid-cols-2 gap-5">
                        <StatCard title="Ricavo Totale (CHF)" value={kpiData.revenue.toFixed(2)} icon={<CoinIcon className="w-5 h-5"/>} />
                        <StatCard title="Costo Token Stimato (CHF)" value={`-` + (kpiData.revenue * 0.3).toFixed(2)} icon={<CoinIcon className="w-5 h-5"/>} subtext="Stima 30% dei ricavi"/>
                     </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Soddisfazione Utenti</h3>
                    <FeedbackDonutChart positive={stats.positiveCount} negative={stats.negativeCount} />
                </div>
                 <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Feedback per Tipo</h3>
                    <div className="flex-grow min-h-[200px]">
                        <FeedbackTypeBarChart scanCount={stats.scanFeedbackCount} chatCount={stats.chatFeedbackCount} />
                    </div>
                </div>
            </div>

             {/* AI Analysis Section */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analisi AI dei Feedback</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ottieni un riepilogo e suggerimenti pratici da Gemini.</p>
                    </div>
                    <button onClick={handleAnalyzeWithAI} disabled={isAnalyzing || feedbackData.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-slate-400">
                        {isAnalyzing ? <LoadingSpinner className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                        {isAnalyzing ? 'Analisi in corso...' : 'Analizza con AI'}
                    </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg min-h-[200px]">
                    {aiError && <p className="text-red-500">{aiError}</p>}
                    {aiAnalysisResult ? (
                        <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiAnalysisResult.replace(/\n/g, '<br/>') }}></div>
                    ) : !isAnalyzing && (
                         <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                            <p>I risultati dell'analisi appariranno qui.</p>
                        </div>
                    )}
                 </div>
            </div>

            {/* Feedback Table Section */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Tabella Feedback Recenti</h2>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Filtra per Tipo</label>
                        <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                            <option value="all">Tutti i Tipi</option>
                            <option value="scan">Scansione</option>
                            <option value="chat">Chat</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Filtra per Valutazione</label>
                         <select value={filterValue} onChange={e => setFilterValue(e.target.value as any)} className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                            <option value="all">Tutte le Valutazioni</option>
                            <option value="good">Positivo</option>
                            <option value="bad">Negativo</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Data</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Utente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Valutazione</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Contesto</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                             {filteredFeedback.map(fb => (
                                <tr key={fb.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{fb.timestamp?.toDate().toLocaleString('it-CH')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono" title={(fb as any).userId}>
                                        ...{(fb as any).userId?.slice(-8)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            {fb.type === 'scan' ? <DocumentTextIcon className="w-5 h-5"/> : <ChatBubbleLeftRightIcon className="w-5 h-5"/>}
                                            <span>{fb.type.charAt(0).toUpperCase() + fb.type.slice(1)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {fb.feedbackValue === 'good' 
                                            ? <HandThumbUpIcon className="w-5 h-5 text-green-500 mx-auto" title="Positivo" /> 
                                            : <HandThumbDownIcon className="w-5 h-5 text-red-500 mx-auto" title="Negativo" />}
                                    </td>
                                    <td className="px-4 py-3 text-sm max-w-sm">
                                        <p className="truncate" title={fb.context.sourceFileName || fb.context.botResponse}>{fb.context.sourceFileName || `Risposta: "${fb.context.botResponse}"`}</p>
                                        {fb.context.targetElementSelector && <code className="text-xs bg-slate-100 dark:bg-slate-700 p-1 rounded">Elemento: {fb.context.targetElementSelector}</code>}
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                     {filteredFeedback.length === 0 && (
                        <div className="text-center p-8 text-slate-500">
                            <XMarkIcon className="w-12 h-12 mx-auto text-slate-300" />
                            <p className="mt-2 font-semibold">Nessun feedback trovato</p>
                            <p className="text-sm">Prova a modificare i filtri o attendi nuovi feedback.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
