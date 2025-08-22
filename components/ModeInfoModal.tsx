import React, { useEffect, type FC, type SVGProps } from 'react';
import { SparklesIcon, BoltIcon, BuildingOffice2Icon, BookOpenIcon, XMarkIcon, CheckCircleIcon, XCircleIcon, DocumentPlusIcon, ClipboardDocumentIcon, UserCircleIcon } from './icons';
import type { ProcessingMode } from '../services/geminiService';
import { COST_PER_SCAN_COINS } from '../services/geminiService';

interface ModeInfoModalProps {
    onClose: () => void;
}

const ModeCard: React.FC<{
    mode: ProcessingMode,
    title: string,
    Icon: FC<SVGProps<SVGSVGElement>>,
    activeClass: string,
    color: string,
    idealFor: string,
    pros: string[],
    cons: string[]
}> = ({ title, Icon, color, idealFor, pros, cons, mode }) => (
    <div className={`p-5 rounded-2xl flex flex-col bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80`}>
        <div className="flex items-center gap-3">
            <span className={`p-2 rounded-full bg-white dark:bg-slate-700 ${color}`}><Icon className="w-6 h-6" /></span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-semibold">{idealFor}</p>
        <p className={`mt-1 text-sm font-bold ${color}`}>{COST_PER_SCAN_COINS[mode] > 0 ? `${COST_PER_SCAN_COINS[mode]} ScanCoin / pagina` : 'Gratuito'}</p>
        
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Pro</h4>
            <ul className="space-y-1.5">
                {pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{pro}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Contro</h4>
            <ul className="space-y-1.5">
                {cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{con}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


export const ModeInfoModal: React.FC<ModeInfoModalProps> = ({ onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const modes = [
        {
          id: 'quality' as ProcessingMode,
          title: 'Chroma Scan',
          icon: SparklesIcon,
          color: 'text-purple-600 dark:text-purple-400',
          idealFor: 'Documenti importanti, contratti, rapporti medici.',
          pros: ['Massima qualità di analisi e OCR', 'Estrazione dati più accurata', 'Miglior raddrizzamento immagine'],
          cons: ['Costo più alto', 'Leggermente più lento di Quick Scan']
        },
        {
          id: 'scontrino' as ProcessingMode,
          title: 'Modalità Scontrino',
          icon: ClipboardDocumentIcon,
          color: 'text-orange-600 dark:text-orange-400',
          idealFor: 'Scontrini, ricevute, fatture con voci multiple.',
          pros: ['Estrae ogni singolo articolo', 'Calcola totali e IVA in automatico', 'Ottimizzato per formati piccoli'],
          cons: ['Meno efficace su documenti generici', 'Non estrae testo narrativo lungo']
        },
        {
          id: 'identity' as ProcessingMode,
          title: 'Doc. Identità',
          icon: UserCircleIcon,
          color: 'text-indigo-600 dark:text-indigo-400',
          idealFor: 'Carte d\'identità, patenti, permessi.',
          pros: ['Schema dati specializzato per documenti ID', 'Alta accuratezza su campi anagrafici', 'Riconosce fronte/retro in un unico fascicolo'],
          cons: ['Costo specializzato', 'Non adatto a documenti generici']
        },
        {
          id: 'speed' as ProcessingMode,
          title: 'Quick Scan',
          icon: BoltIcon,
          color: 'text-yellow-600 dark:text-yellow-400',
          idealFor: 'Grandi volumi, scontrini, fatture semplici.',
          pros: ['Velocità di elaborazione massima', 'Costo più basso', 'Ideale per scansioni rapide'],
          cons: ['Accuratezza dei dati leggermente inferiore', 'Analisi meno approfondita']
        },
        {
          id: 'business' as ProcessingMode,
          title: 'Batch Scan',
          icon: BuildingOffice2Icon,
          color: 'text-green-600 dark:text-green-400',
          idealFor: 'PDF con molte pagine, archiviazione batch.',
          pros: ['Elabora fino a 5 pagine in parallelo', 'Massima efficienza per PDF lunghi', 'Qualità di analisi alta'],
          cons: ['Costo per pagina più elevato', 'Benefici visibili solo su PDF multi-pagina']
        },
        {
          id: 'book' as ProcessingMode,
          title: 'Deep Scan',
          icon: BookOpenIcon,
          color: 'text-blue-600 dark:text-blue-400',
          idealFor: 'Libri, articoli, documenti con molto testo.',
          pros: ['Estrazione del testo parola per parola', 'Mantiene la formattazione originale', 'Perfetto per documenti lunghi da leggere'],
          cons: ['Non estrae dati strutturati (chiave-valore)', 'Costo più alto, specializzato per OCR puro']
        },
        {
          id: 'no-ai' as ProcessingMode,
          title: 'Simple Scan',
          icon: DocumentPlusIcon,
          color: 'text-slate-600 dark:text-slate-400',
          idealFor: 'Digitalizzazione rapida senza analisi dei dati.',
          pros: ['Gratuito e non consuma ScanCoin', 'Acquisizione istantanea', 'Applica comunque il watermark'],
          cons: ['Nessuna estrazione dati', 'Nessuna classificazione', 'Nessun raggruppamento automatico']
        },
    ];

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mode-info-title"
        >
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-7xl max-h-[90vh] flex flex-col gap-4 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center flex-shrink-0">
                    <h2 id="mode-info-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">Confronto Modalità di Elaborazione</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"
                        aria-label="Chiudi"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-5">
                    {modes.map((mode) => (
                        <ModeCard 
                            key={mode.id}
                            mode={mode.id}
                            title={mode.title}
                            Icon={mode.icon}
                            activeClass=""
                            color={mode.color}
                            idealFor={mode.idealFor}
                            pros={mode.pros}
                            cons={mode.cons}
                        />
                    ))}
                </main>
            </div>
        </div>
    );
};