import React from 'react';
import type { ProcessingMode } from '../services/geminiService';
import { SparklesIcon, ClipboardDocumentIcon, UserCircleIcon, BoltIcon, BuildingOffice2Icon, BookOpenIcon, DocumentPlusIcon } from './icons';

interface ProcessingModeSelectorProps {
    currentMode: ProcessingMode;
    onModeChange: (mode: ProcessingMode) => void;
    disabled?: boolean;
}

const modesInfo = [
    { id: 'quality' as ProcessingMode, title: 'Chroma Scan', Icon: SparklesIcon, description: 'Massima qualità e analisi approfondita.' },
    { id: 'scontrino' as ProcessingMode, title: 'Scontrino', Icon: ClipboardDocumentIcon, description: 'Ottimizzato per ricevute e scontrini.' },
    { id: 'identity' as ProcessingMode, title: 'Doc. Identità', Icon: UserCircleIcon, description: 'Per carte d\'identità, passaporti, etc.' },
    { id: 'speed' as ProcessingMode, title: 'Quick Scan', Icon: BoltIcon, description: 'Veloce e a basso costo per analisi rapide.' },
    { id: 'business' as ProcessingMode, title: 'Batch Scan', Icon: BuildingOffice2Icon, description: 'Elabora più documenti in una volta.' },
    { id: 'book' as ProcessingMode, title: 'Deep Scan', Icon: BookOpenIcon, description: 'Ideale per pagine di libri o documenti densi.' },
    { id: 'no-ai' as ProcessingMode, title: 'Simple Scan', Icon: DocumentPlusIcon, description: 'Solo scansione, senza analisi AI.' },
];

export const ProcessingModeSelector: React.FC<ProcessingModeSelectorProps> = ({ currentMode, onModeChange, disabled }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modesInfo.map(mode => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    disabled={disabled}
                    className={`p-4 rounded-lg border-2 flex items-center gap-4 transition-all duration-200 text-left
                        ${currentMode === mode.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <div className={`p-2 rounded-full ${currentMode === mode.id ? 'bg-purple-100 dark:bg-purple-800' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        <mode.Icon className={`w-6 h-6 ${currentMode === mode.id ? 'text-purple-600 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'}`} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{mode.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{mode.description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};
