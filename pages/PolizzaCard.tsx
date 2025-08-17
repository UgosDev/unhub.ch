import React, { useState } from 'react';
import type { ProcessedPageResult } from '../services/geminiService';
import { DocumentTextIcon, UsersIcon, TrashIcon, ChevronDownIcon } from '../components/icons';

interface PolizzaCardProps {
    item: ProcessedPageResult;
    onDelete: () => void;
}

const PolizzaCard: React.FC<PolizzaCardProps> = ({ item, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const getDetail = (key: string): string => {
        if (!item.analysis.datiEstratti) return 'N/D';
        const detail = item.analysis.datiEstratti.find((d: any) => 
            d.chiave.toLowerCase().includes(key.toLowerCase())
        );
        return detail ? detail.valore : 'N/D';
    };
    
    const getExpiryStatus = (): { text: string; color: string; } => {
        const expiryDateStr = getDetail('scadenza');
        if (expiryDateStr === 'N/D') return { text: 'Data non trovata', color: 'bg-slate-400' };
        
        try {
            const expiryDate = new Date(expiryDateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return { text: 'Scaduta', color: 'bg-red-500' };
            if (diffDays <= 30) return { text: `In scadenza tra ${diffDays} gg`, color: 'bg-amber-500' };
            return { text: 'Valida', color: 'bg-green-500' };

        } catch (e) {
            return { text: 'Data invalida', color: 'bg-slate-400' };
        }
    };
    
    const { text: expiryText, color: expiryColor } = getExpiryStatus();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Immagine */}
            <div className="h-40 bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center">
                <img src={item.processedImageDataUrl} alt={`Anteprima ${item.analysis.soggetto}`} className="max-w-full max-h-full object-contain" />
            </div>

            {/* Contenuto */}
            <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-xs font-bold text-white rounded-full ${expiryColor}`}>
                        {expiryText}
                    </span>
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-10">
                                <button onClick={onDelete} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600">
                                    <TrashIcon className="w-4 h-4" /> Sposta nel cestino
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 mt-2 truncate">{item.analysis.soggetto}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.analysis.riassunto}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">N. Polizza</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{getDetail('n. polizza') || getDetail('numero polizza')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Premio Annuo</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{getDetail('premio')}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Scadenza</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{getDetail('scadenza')}</span>
                    </div>
                </div>

                <div className="mt-auto pt-5 flex items-center gap-2">
                    <button className="flex-1 px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Dettagli</button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                        <UsersIcon className="w-4 h-4" /> Condividi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PolizzaCard;
