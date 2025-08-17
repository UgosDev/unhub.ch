import React, { useState, useMemo } from 'react';
import type { ProcessedPageResult } from '../services/geminiService';
import { PolizzeChLogoIcon, PolizzeChWordmarkIcon, DocumentTextIcon, MagnifyingGlassIcon, ChevronDownIcon } from '../components/icons';
import PolizzaCard from './PolizzaCard';

interface PolizzeProps {
    polizzeDocs: ProcessedPageResult[];
    onUpdateDocument: (doc: ProcessedPageResult) => void;
    onDeleteDocument: (doc: ProcessedPageResult) => void;
}

type SortBy = 'scadenza' | 'premio' | 'nome';

const Polizze: React.FC<PolizzeProps> = ({ polizzeDocs, onUpdateDocument, onDeleteDocument }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('scadenza');

    const filteredAndSortedDocs = useMemo(() => {
        const getDetail = (doc: ProcessedPageResult, key: string, isNumeric = false) => {
            const detail = doc.analysis.datiEstratti?.find((d: any) => d.chiave.toLowerCase().includes(key.toLowerCase()));
            if (!detail) return isNumeric ? 0 : '';
            if (isNumeric) {
                const num = parseFloat(detail.valore.replace(/[^0-9.-]+/g, ''));
                return isNaN(num) ? 0 : num;
            }
            return detail.valore;
        };

        return polizzeDocs
            .filter(doc => {
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                const nPolizza = getDetail(doc, 'n. polizza') || getDetail(doc, 'numero polizza');
                return (
                    doc.analysis.soggetto?.toLowerCase().includes(lowerSearch) ||
                    doc.analysis.riassunto?.toLowerCase().includes(lowerSearch) ||
                    nPolizza.toLowerCase().includes(lowerSearch)
                );
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'scadenza':
                        const dateA = new Date(getDetail(a, 'scadenza') || 0).getTime();
                        const dateB = new Date(getDetail(b, 'scadenza') || 0).getTime();
                        return dateA - dateB;
                    case 'premio':
                        const premioA = getDetail(a, 'premio', true);
                        const premioB = getDetail(b, 'premio', true);
                        return premioB - premioA;
                    case 'nome':
                        return (a.analysis.soggetto || '').localeCompare(b.analysis.soggetto || '');
                    default:
                        return 0;
                }
            });
    }, [polizzeDocs, searchTerm, sortBy]);


    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
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

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:flex-grow">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Cerca per compagnia, n. polizza..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="sort-by" className="text-sm font-medium text-slate-600 dark:text-slate-300">Ordina per:</label>
                    <select
                        id="sort-by"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as SortBy)}
                        className="pl-3 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                    >
                        <option value="scadenza">Scadenza</option>
                        <option value="premio">Premio (più alto)</option>
                        <option value="nome">Nome A-Z</option>
                    </select>
                </div>
            </div>

            {filteredAndSortedDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedDocs.map((item) => (
                        <PolizzaCard 
                            key={item.uuid} 
                            item={item}
                            onDelete={() => onDeleteDocument(item)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 mt-4 bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <DocumentTextIcon className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {polizzeDocs.length > 0 ? 'Nessuna Corrispondenza' : 'Nessuna Polizza'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {polizzeDocs.length > 0 
                            ? "Nessuna polizza corrisponde ai criteri di ricerca. Prova a modificare i filtri."
                            : "Invia qui le tue polizze dalla pagina di scansione. L'AI le analizzerà e le organizzerà per te."
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default Polizze;
