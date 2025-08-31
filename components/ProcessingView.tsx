
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { 
    PauseIcon, PlayIcon, StopIcon, FastForwardIcon, SparklesIcon, BoltIcon, 
    BuildingOffice2Icon, BookOpenIcon, DocumentPlusIcon, ClipboardDocumentIcon, 
    UserCircleIcon, CameraIcon, DocumentTextIcon
} from './icons';
import type { ProcessingMode } from '../services/geminiService';

interface ProcessingViewProps {
    taskName: string;
    mode: ProcessingMode;
    progress: { current: number; total: number };
    elapsedTime: number;
    totalScansInSession: number;
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
    onSkip: () => void;
    onCancelAll: () => void;
}

const modeDisplayInfo: { [key in ProcessingMode]: { name: string; Icon: React.FC<any>; color: string; } } = {
    quality: { name: 'Chroma Scan', Icon: SparklesIcon, color: 'text-purple-500' },
    speed: { name: 'Quick Scan', Icon: BoltIcon, color: 'text-yellow-500' },
    business: { name: 'Batch Scan', Icon: BuildingOffice2Icon, color: 'text-green-500' },
    book: { name: 'Deep Scan', Icon: BookOpenIcon, color: 'text-blue-600' },
    scontrino: { name: 'Scontrino', Icon: ClipboardDocumentIcon, color: 'text-orange-500' },
    identity: { name: 'Doc. Identità', Icon: UserCircleIcon, color: 'text-indigo-600' },
    fotografia: { name: 'Fotografia', Icon: CameraIcon, color: 'text-teal-600' },
    'no-ai': { name: 'Simple Scan', Icon: DocumentPlusIcon, color: 'text-slate-500' },
};

export const ProcessingView: React.FC<ProcessingViewProps> = ({ 
    taskName,
    mode,
    progress, 
    elapsedTime, 
    totalScansInSession, 
    isPaused,
    onPause,
    onResume,
    onSkip,
    onCancelAll
}) => {
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    const { Icon: ModeIcon, color: modeColor } = modeDisplayInfo[mode] || modeDisplayInfo['no-ai'];

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-5 mb-6 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left Side */}
                <div className="flex items-center gap-4 w-full sm:w-1/2">
                    <div className="flex-shrink-0">
                         {isPaused ? (
                            <ModeIcon className={`w-10 h-10 text-slate-400 dark:text-slate-500`} />
                         ) : (
                            <div className="relative w-10 h-10">
                                <ModeIcon className={`w-full h-full ${modeColor} animate-pulse`} />
                            </div>
                         )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate" title={taskName}>
                            {isPaused ? 'In Pausa...' : taskName || 'Inizializzazione...'}
                        </h3>
                        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <span>Tempo: {formatTime(elapsedTime)}</span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
                            <span className="flex items-center gap-1">
                                <DocumentTextIcon className="w-4 h-4"/>
                                <span>{totalScansInSession.toLocaleString('it-CH')} scans</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Right Side */}
                <div className="w-full sm:w-1/2 flex flex-col gap-2">
                    <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Elaborazione...</p>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pagina {progress.current} di {progress.total}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-300 ${isPaused ? 'bg-slate-400' : 'bg-purple-600'}`} 
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2">
                         {isPaused ? (
                             <button onClick={onResume} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-md transition-transform transform hover:scale-105">
                                <PlayIcon className="w-5 h-5"/> Riprendi
                            </button>
                        ) : (
                            <button onClick={onPause} className="relative flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-500 rounded-md border-2 border-black shadow-md transition-transform transform hover:scale-105">
                                <PauseIcon className="w-5 h-5"/> Pausa
                            </button>
                        )}
                        <button onClick={onSkip} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md transition-transform transform hover:scale-105">
                            <FastForwardIcon className="w-5 h-5"/> Salta File
                        </button>
                        <button onClick={onCancelAll} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-md transition-transform transform hover:scale-105">
                            <StopIcon className="w-5 h-5"/> Annulla Tutto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
