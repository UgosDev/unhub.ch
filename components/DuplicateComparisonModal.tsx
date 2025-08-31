import React from 'react';
import { XMarkIcon } from './icons';

interface DuplicateComparisonModalProps {
  originalImageUrl: string;
  currentImageUrl: string;
  onClose: () => void;
}

export const DuplicateComparisonModal: React.FC<DuplicateComparisonModalProps> = ({ originalImageUrl, currentImageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 id="comparison-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Confronto Duplicati
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"
            aria-label="Chiudi confronto"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-slate-600 dark:text-slate-300">Documento Originale</h3>
            <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 rounded-lg p-2">
                 <img src={originalImageUrl} alt="Original document" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-slate-600 dark:text-slate-300">Scansione Corrente</h3>
             <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 rounded-lg p-2">
                <img src={currentImageUrl} alt="Current scan" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
