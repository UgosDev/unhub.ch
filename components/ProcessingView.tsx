



import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { DocumentTextIcon, PauseIcon, PlayIcon, StopIcon, CoinIcon, FastForwardIcon } from './icons';

interface ProcessingViewProps {
    progress: { current: number, total: number };
    elapsedTime: number;
    totalScans: number;
    costInCoins: number;
    phrases: string[];
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
    onSkip: () => void;
    onCancelAll: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ 
    progress, 
    elapsedTime, 
    totalScans, 
    costInCoins,
    phrases,
    isPaused,
    onPause,
    onResume,
    onSkip,
    onCancelAll
}) => {
    const [currentPhrase, setCurrentPhrase] = useState('Avvio elaborazione...');

    useEffect(() => {
        if (phrases.length > 0) {
            // Set an initial phrase immediately
            setCurrentPhrase(phrases[Math.floor(Math.random() * phrases.length)]);

            const intervalId = setInterval(() => {
                setCurrentPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
            }, 4000); // Change phrase every 4 seconds

            return () => clearInterval(intervalId);
        }
    }, [phrases]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 mb-6 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <LoadingSpinner />
                    <div className="text-left">
                         <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{currentPhrase}</p>
                         <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <span>Tempo: {formatTime(elapsedTime)}</span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
                            <span className="flex items-center gap-1">
                                <DocumentTextIcon className="w-4 h-4"/>
                                <span>{totalScans.toLocaleString('it-IT')} scans</span>
                            </span>
                            {costInCoins > 0 && (
                                <span className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-300">
                                    <CoinIcon className="w-4 h-4"/>
                                    <span>{costInCoins.toLocaleString('it-CH')} ScanCoin</span>
                                </span>
                            )}
                         </div>
                    </div>
                </div>
                <div className="w-full md:w-auto flex flex-col items-stretch gap-2">
                     <div className="w-full">
                        <div className="flex justify-between items-baseline mb-1">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {isPaused ? 'In Pausa' : 'Elaborazione...'}
                            </p>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                Pagina {progress.current} di {progress.total}
                            </p>
                        </div>
                         <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-purple-600 h-2.5 rounded-full transition-width duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2">
                        {isPaused ? (
                             <button onClick={onResume} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md">
                                <PlayIcon className="w-5 h-5"/> Riprendi
                            </button>
                        ) : (
                            <button onClick={onPause} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 rounded-md">
                                <PauseIcon className="w-5 h-5"/> Pausa
                            </button>
                        )}
                        <button onClick={onSkip} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                            <FastForwardIcon className="w-5 h-5"/> Salta File
                        </button>
                        <button onClick={onCancelAll} className="flex items-center justify-end gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md">
                            <StopIcon className="w-5 h-5"/> Annulla Tutto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};