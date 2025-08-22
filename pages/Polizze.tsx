import React from 'react';
import type { ProcessedPageResult } from '../services/geminiService';
import { PolizzeChLogoIcon, PolizzeChWordmarkIcon, DocumentTextIcon } from '../components/icons';

interface PolizzeProps {
    polizzeDocs: ProcessedPageResult[];
}

const PolizzaItem: React.FC<{ item: ProcessedPageResult }> = ({ item }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex items-center gap-4">
        <img src={item.processedImageDataUrl} alt={item.analysis.soggetto} className="w-16 h-24 object-cover rounded-md border border-slate-200 dark:border-slate-700"/>
        <div className="flex-grow min-w-0">
            <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{item.analysis.soggetto}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{item.analysis.riassunto}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 truncate">{item.sourceFileName}</p>
        </div>
        <div className="text-right flex-shrink-0">
             <p className="text-xs text-slate-500 dark:text-slate-400">Archiviato il</p>
             <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{new Date(item.timestamp).toLocaleDateString('it-CH')}</p>
        </div>
    </div>
);

const Polizze: React.FC<PolizzeProps> = ({ polizzeDocs }) => {
    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                        <PolizzeChLogoIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <PolizzeChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
                        <p className="text-slate-500 dark:text-slate-400">Tutte le tue polizze, a portata di mano.</p>
                    </div>
                </div>
            </div>

            {polizzeDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {polizzeDocs.map((item) => (
                        <PolizzaItem key={item.uuid} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border border-dashed border-slate-300 dark:border-slate-700">
                    <DocumentTextIcon className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Nessuna Polizza</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Invia qui le tue polizze dalla pagina di scansione per averle sempre organizzate e disponibili.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Polizze;