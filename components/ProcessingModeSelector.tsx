import React, { useState } from 'react';
import type { ProcessingMode } from '../services/geminiService';
import { SparklesIcon, BoltIcon, BuildingOffice2Icon, BookOpenIcon, DocumentPlusIcon, ChevronDownIcon, ClipboardDocumentIcon, UserCircleIcon, CameraIcon } from './icons';
import { COST_PER_SCAN_COINS } from '../services/geminiService';
import * as settingsService from '../services/settingsService';

interface ProcessingModeSelectorProps {
  currentMode: ProcessingMode;
  onModeChange: (mode: ProcessingMode) => void;
  shouldExtractImages?: boolean;
  onShouldExtractImagesChange?: (shouldExtract: boolean) => void;
  disabled: boolean;
  suggestedMode?: ProcessingMode | null;
}

const allModes = [
    {
      id: 'quality' as ProcessingMode,
      title: 'Chroma Scan',
      description: `Analisi precisa, massima qualità. • ${COST_PER_SCAN_COINS.quality} ScanCoin/scan`,
      icon: <SparklesIcon className="w-5 h-5" />,
      color: 'text-purple-600 dark:text-purple-400',
      activeClass: 'ring-purple-500 bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'fotografia' as ProcessingMode,
      title: 'Fotografia',
      description: `Analisi semantica di immagini. • ${COST_PER_SCAN_COINS.fotografia} ScanCoin/scan`,
      icon: <CameraIcon className="w-5 h-5" />,
      color: 'text-teal-600 dark:text-teal-400',
      activeClass: 'ring-teal-500 bg-teal-50 dark:bg-teal-900/20',
    },
    {
      id: 'scontrino' as ProcessingMode,
      title: 'Modalità Scontrino',
      description: `Estrae ogni riga da ricevute. • ${COST_PER_SCAN_COINS.scontrino} ScanCoin/scan`,
      icon: <ClipboardDocumentIcon className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400',
      activeClass: 'ring-orange-500 bg-orange-50 dark:bg-orange-900/20',
    },
    {
      id: 'identity' as ProcessingMode,
      title: 'Doc. Identità',
      description: `Estrae dati da CI, patenti, etc. • ${COST_PER_SCAN_COINS.identity} ScanCoin/scan`,
      icon: <UserCircleIcon className="w-5 h-5" />,
      color: 'text-indigo-600 dark:text-indigo-400',
      activeClass: 'ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      id: 'speed' as ProcessingMode,
      title: 'Quick Scan',
      description: `Risultati rapidi per grandi volumi. • ${COST_PER_SCAN_COINS.speed} ScanCoin/scan`,
      icon: <BoltIcon className="w-5 h-5" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      activeClass: 'ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      id: 'business' as ProcessingMode,
      title: 'Batch Scan',
      description: `Agenti paralleli, massima efficienza. • ${COST_PER_SCAN_COINS.business} ScanCoin/scan`,
      icon: <BuildingOffice2Icon className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400',
      activeClass: 'ring-green-500 bg-green-50 dark:bg-green-900/20',
    },
    {
      id: 'book' as ProcessingMode,
      title: 'Deep Scan',
      description: `Estrae testo parola per parola. • ${COST_PER_SCAN_COINS.book} ScanCoin/scan`,
      icon: <BookOpenIcon className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      activeClass: 'ring-blue-500 bg-blue-50 dark:bg-blue-900/20',
    },
     {
      id: 'no-ai' as ProcessingMode,
      title: 'Simple Scan',
      description: `Solo foto e watermark. • Gratis`,
      icon: <DocumentPlusIcon className="w-5 h-5" />,
      color: 'text-slate-600 dark:text-slate-400',
      activeClass: 'ring-slate-500 bg-slate-100 dark:bg-slate-700/20',
    },
];

const ModeButton: React.FC<{mode: typeof allModes[0], currentMode: ProcessingMode, onModeChange: (mode: ProcessingMode) => void, disabled: boolean, isSuggested: boolean, className?: string}> = ({ mode, currentMode, onModeChange, disabled, isSuggested, className }) => (
    <button
      key={mode.id}
      disabled={disabled}
      onClick={() => onModeChange(mode.id)}
      className={`relative p-3 text-left rounded-xl border border-transparent transition-all duration-200 w-full
        ${currentMode === mode.id ? `ring-2 ${mode.activeClass}` : 'bg-white dark:bg-slate-800 shadow-md hover:shadow-lg hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600'}
        ${disabled ? 'pointer-events-none' : ''} ${className}
        ${isSuggested ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}
    >
        {isSuggested && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full shadow-md">
                Consigliato
            </div>
        )}
      <div className="flex items-center gap-2">
        <span className={mode.color}>{mode.icon}</span>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">{mode.title}</h4>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{mode.description}</p>
    </button>
);


export const ProcessingModeSelector: React.FC<ProcessingModeSelectorProps> = ({ currentMode, onModeChange, shouldExtractImages, onShouldExtractImagesChange, disabled, suggestedMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const settings = settingsService.getSettings();
  const primaryModeIds = settings.primaryModes;

  const primaryModes = allModes.filter(m => primaryModeIds.includes(m.id));
  const secondaryModes = allModes.filter(m => !primaryModeIds.includes(m.id));
  
  const isExtractionAvailable = ['quality', 'business', 'book', 'scontrino'].includes(currentMode);
  
  return (
    <div className={`flex flex-col gap-3 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {primaryModes.map((mode) => (
          <ModeButton key={mode.id} mode={mode} currentMode={currentMode} onModeChange={onModeChange} disabled={disabled} isSuggested={suggestedMode === mode.id} />
        ))}
      </div>
      
       {onShouldExtractImagesChange && typeof shouldExtractImages === 'boolean' && (
        <div className={`transition-all duration-300 ${isExtractionAvailable ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <label className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 shadow-md rounded-xl cursor-pointer">
                <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Estrai immagini dal documento</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentMode === 'scontrino' ? "Identifica il logo/intestazione." : "Identifica loghi, firme, foto, ecc."}
                    </p>
                </div>
                <input
                    type="checkbox"
                    checked={shouldExtractImages}
                    onChange={(e) => onShouldExtractImagesChange(e.target.checked)}
                    disabled={disabled || !isExtractionAvailable}
                    className="w-5 h-5 rounded text-purple-600 bg-slate-100 border-slate-300 focus:ring-purple-500 dark:bg-slate-700 dark:border-slate-600"
                />
            </label>
        </div>
       )}

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-center items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
        disabled={disabled}
      >
        <span>{isExpanded ? 'Mostra meno' : 'Altre modalità'}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {secondaryModes.map((mode) => (
             <ModeButton key={mode.id} mode={mode} currentMode={currentMode} onModeChange={onModeChange} disabled={disabled} isSuggested={suggestedMode === mode.id} />
          ))}
        </div>
      )}
    </div>
  );
};