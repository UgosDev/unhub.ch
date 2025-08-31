import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ProcessedPageResult, DocumentGroup, ProcessingTask, ProcessingMode, TokenUsage } from '../services/geminiService';
import { FileDropzone } from './FileViews';
import { ResultsDisplay } from './ResultsDisplay';
import { ErrorDisplay } from './ErrorDisplay';
import { QueueView } from './QueueView';
import { ProcessingModeSelector } from './ProcessingModeSelector';
import { ProcessingView } from './ProcessingView';
import { SparklesIcon, InformationCircleIcon, DocumentTextIcon, DocumentPlusIcon, XMarkIcon } from './icons';
import * as settingsService from '../services/settingsService';
import { ModeInfoModal } from './ModeInfoModal';
import { LoadingSpinner } from './LoadingSpinner';

const DemoBanner: React.FC<{ onExit: () => void }> = ({ onExit }) => (
    <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-400 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-500" />
            <div>
                <p className="font-bold">Modalità Demo Attiva</p>
                <p className="hidden sm:block text-sm">Stai esplorando l'app con dati di esempio. Le funzioni di invio e download sono disabilitate.</p>
            </div>
        </div>
        <button
            onClick={onExit}
            className="font-semibold text-sm px-4 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex-shrink-0"
        >
            Esci dalla Demo
        </button>
    </div>
);

const TutorialBanner: React.FC<{ onStart: () => void; onDismiss: () => void }> = ({ onStart, onDismiss }) => (
    <div className="bg-purple-100 dark:bg-purple-900/50 border border-purple-400 text-purple-800 dark:text-purple-200 px-4 py-3 rounded-xl relative mb-4 flex flex-col sm:flex-row items-center justify-between shadow-md gap-3">
        <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 sm:w-6 sm:h-6 text-purple-500 flex-shrink-0" />
            <div>
                <p className="font-bold">Benvenuto in scansioni.ch!</p>
                <p className="text-sm">Vuoi fare un tour guidato interattivo delle funzionalità principali?</p>
            </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <button
                onClick={onDismiss}
                className="font-semibold text-sm px-4 py-1.5 rounded-lg bg-purple-200/50 text-purple-700 hover:bg-purple-200/80 transition-colors"
            >
                No, grazie
            </button>
            <button
                onClick={onStart}
                className="font-semibold text-sm px-4 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
                Sì, iniziamo!
            </button>
        </div>
    </div>
);

interface WorkspaceProps {
    documentGroups: DocumentGroup[];
    error: string | null;
    processingQueue: ProcessingTask[];
    currentTaskProgress: { current: number; total: number } | null;
    processingMode: ProcessingMode;
    isProcessing: boolean;
    onProcessingModeChange: (mode: ProcessingMode) => void;
    shouldExtractImages: boolean;
    onShouldExtractImagesChange: (shouldExtract: boolean) => void;
    onFilesSelected: (files: File[]) => void;
    pendingFiles: File[];
    onRemovePendingFile: (index: number) => void;
    suggestedMode: ProcessingMode | null;
    isSuggestingMode: boolean;
    onConfirmProcessing: () => void;
    onClearPending: () => void;
    onOpenCamera: () => void;
    onOpenEmailImport: () => void;
    onClear: () => void;
    onUpdateResult: (updatedResult: ProcessedPageResult) => void;
    onUpdateGroupTags: (groupId: string, newTags: string[]) => void;
    onConfirmDuplicate: (pageNumber: number) => void;
    onDenyDuplicate: (pageNumber: number) => void;
    onSendToApp: (group: DocumentGroup, targetApp: 'archivio' | 'polizze' | 'disdette', options?: { isPrivate?: boolean, folderId?: string | null }) => void;
    onSendAll: () => void;
    onMoveSelectedToDefault: () => void;
    onDownloadSelected: () => void;
    isDownloadingSelection: boolean;
    selectedGroupIds: string[];
    onSelectGroup: (groupId: string) => void;
    onDeselectAll: () => void;
    onMergeGroups: () => void;
    onUngroup: (groupId: string) => void;
    onRetryGrouping: () => void;
    onUndo: () => void;
    canUndo: boolean;
    onRedo: () => void;
    canRedo: boolean;
    elapsedTime: number;
    totalScans: number;
    costInCoins: number;
    isPaused: boolean;
    onPauseProcessing: () => void;
    onResumeProcessing: () => void;
    onSkipProcessing: () => void;
    onCancelAllProcessing: () => void;
    onRetryScan: (pageNumber: number) => void;
    retryingPageIds: number[];
    highlightedElement: string | null;
    isDemoMode: boolean;
    onStartDemo: () => void;
    onExitDemo: () => void;
    showTutorialBanner: boolean;
    onStartTutorial: () => void;
    onDismissTutorial: () => void;
    expandedGroups: string[];
    onToggleExpandGroup: (groupId: string) => void;
    scrollToGroupId: string | null;
    onScrolledToGroup: () => void;
    onUgoSummarize: (groupIds: string[]) => void;
}

export const Workspace: React.FC<WorkspaceProps> = (props) => {
    const { 
        documentGroups, error, processingQueue, currentTaskProgress, isProcessing, 
        pendingFiles, onFilesSelected, onConfirmProcessing, onClearPending, onRemovePendingFile,
        suggestedMode, isSuggestingMode, onConfirmDuplicate, onDenyDuplicate
    } = props;
    const hasResults = documentGroups.length > 0;
    
    const [isModeInfoModalOpen, setIsModeInfoModalOpen] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
          onFilesSelected(acceptedFiles);
        }
    }, [onFilesSelected]);
      
    const { getRootProps: getMoreFilesRootProps, getInputProps: getMoreFilesInputProps, isDragActive: isMoreFilesDragActive } = useDropzone({
        onDrop,
        accept: { 
          'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
          'application/pdf': ['.pdf']
        },
        multiple: true,
    });

    // Layout per la conferma dei file in attesa
    if (pendingFiles.length > 0) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
                 <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out; }`}</style>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Rivedi e Conferma</h2>
                    <p className="text-slate-500 dark:text-slate-400">Hai selezionato {pendingFiles.length} file. Scegli una modalità e avvia l'elaborazione.</p>
                </div>
                
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-4 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                        {pendingFiles.map((file, index) => (
                            <li key={`${file.name}-${index}`} className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <DocumentTextIcon className="w-5 h-5 text-slate-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-200 truncate flex-grow text-left">{file.name}</span>
                                <span className="text-xs text-slate-400 flex-shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                                 <button onClick={() => onRemovePendingFile(index)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-500 hover:text-red-500">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div
                    {...getMoreFilesRootProps()}
                    className={`w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ease-in-out
                        border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20
                        ${isMoreFilesDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                >
                    <input {...getMoreFilesInputProps()} />
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <DocumentPlusIcon className="w-8 h-8 mb-2" />
                        <p className="font-semibold">Aggiungi altri file</p>
                        <p className="text-sm">Trascina qui o clicca per selezionare</p>
                    </div>
                </div>
    
                <div>
                     <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Scegli Modalità</h2>
                        {isSuggestingMode && <LoadingSpinner className="w-5 h-5" />}
                    </div>
                    <div id="tutorial-mode-selector">
                        <ProcessingModeSelector 
                            currentMode={props.processingMode}
                            onModeChange={props.onProcessingModeChange}
                            shouldExtractImages={props.shouldExtractImages}
                            onShouldExtractImagesChange={props.onShouldExtractImagesChange}
                            disabled={false}
                            suggestedMode={suggestedMode}
                        />
                    </div>
                </div>
                
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClearPending} className="font-semibold text-red-600 dark:text-red-400 hover:underline">
                        Annulla
                    </button>
                    <button id="tutorial-start-processing" onClick={onConfirmProcessing} className="px-8 py-3 text-lg font-bold bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-lg">
                        Avvia Elaborazione ({pendingFiles.length} file)
                    </button>
                </div>
            </div>
        );
    }

    // Layout a 3 colonne per lo stato iniziale (vuoto)
    if (!hasResults && !isProcessing) {
        return (
             <>
                {props.showTutorialBanner && <TutorialBanner onStart={props.onStartTutorial} onDismiss={props.onDismissTutorial} />}
                {props.isDemoMode && <DemoBanner onExit={props.onExitDemo} />}
                {error && <ErrorDisplay error={error} />}
                 <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Inizia una Nuova Sessione</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Trascina i tuoi documenti qui sotto per avviare l'analisi intelligente.</p>
                </div>

                <div className="mt-8 max-w-xl mx-auto" id="tutorial-file-dropzone">
                    <FileDropzone 
                        onFilesSelected={onFilesSelected} 
                        onOpenCamera={props.onOpenCamera} 
                        onOpenEmailImport={props.onOpenEmailImport}
                        processingMode={props.processingMode}
                    />
                </div>
                 <div className="mt-12 text-center">
                     <button
                        onClick={props.onStartDemo}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mx-auto"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>Non hai file? Prova una Demo</span>
                    </button>
                </div>
                {isModeInfoModalOpen && <ModeInfoModal onClose={() => setIsModeInfoModalOpen(false)} />}
            </>
        );
    }

    // Layout classico a 2 colonne quando ci sono risultati o è in corso l'elaborazione
    return (
        <>
            <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
                {/* Pannello Sinistro (Input e Coda) */}
                <div className="w-full lg:w-1/3 lg:max-w-md lg:sticky lg:top-24 flex flex-col gap-6 self-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 px-1 mb-4">
                            Aggiungi Altri Documenti
                        </h2>
                        <FileDropzone 
                            onFilesSelected={onFilesSelected} 
                            onOpenCamera={props.onOpenCamera} 
                            onOpenEmailImport={props.onOpenEmailImport} // Passato il nuovo handler
                            processingMode={props.processingMode}
                        />
                    </div>

                    {(processingQueue.length > 0) && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 px-1 mb-4">
                                Coda di Lavoro
                            </h2>
                            <QueueView
                                queue={processingQueue}
                                currentTaskProgress={currentTaskProgress}
                            />
                        </div>
                    )}
                </div>
                
                {/* Pannello Destro (Output) */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                     {props.isDemoMode && <DemoBanner onExit={props.onExitDemo} />}
                     {error && <ErrorDisplay error={error} />}
                     
                     {isProcessing && currentTaskProgress && (
                        <ProcessingView
                            progress={currentTaskProgress}
                            elapsedTime={props.elapsedTime}
                            totalScans={props.totalScans}
                            costInCoins={props.costInCoins}
                            phrases={[
                              'Analisi semantica in corso...',
                              'Ottimizzazione immagine...',
                              'Rilevamento angoli documento...',
                              'Estrazione dati chiave...',
                              'Verifica di sicurezza...',
                              'Normalizzazione dati...',
                              'Raggruppamento intelligente...'
                            ]}
                            isPaused={props.isPaused}
                            onPause={props.onPauseProcessing}
                            onResume={props.onResumeProcessing}
                            onSkip={props.onSkipProcessing}
                            onCancelAll={props.onCancelAllProcessing}
                        />
                    )}

                     {hasResults && (
                         <ResultsDisplay
                            documentGroups={props.documentGroups}
                            onClear={props.onClear}
                            onUpdateResult={props.onUpdateResult}
                            onUpdateGroupTags={props.onUpdateGroupTags}
                            onConfirmDuplicate={onConfirmDuplicate}
                            onDenyDuplicate={onDenyDuplicate}
                            onSendToApp={props.onSendToApp}
                            onSendAll={props.onSendAll}
                            onMoveSelectedToDefault={props.onMoveSelectedToDefault}
                            onDownloadSelected={props.onDownloadSelected}
                            isDownloadingSelection={props.isDownloadingSelection}
                            isLoading={isProcessing}
                            selectedGroupIds={props.selectedGroupIds}
                            onSelectGroup={props.onSelectGroup}
                            onDeselectAll={props.onDeselectAll}
                            onMergeGroups={props.onMergeGroups}
                            onUngroup={props.onUngroup}
                            onRetryGrouping={props.onRetryGrouping}
                            onUndo={props.onUndo}
                            canUndo={props.canUndo}
                            onRedo={props.onRedo}
                            canRedo={props.canRedo}
                            onRetryScan={props.onRetryScan}
                            retryingPageIds={props.retryingPageIds}
                            expandedGroups={props.expandedGroups}
                            onToggleExpandGroup={props.onToggleExpandGroup}
                            scrollToGroupId={props.scrollToGroupId}
                            onScrolledToGroup={props.onScrolledToGroup}
                            onUgoSummarize={props.onUgoSummarize}
                            onStartDemo={props.onStartDemo}
                         />
                     )}
                </div>
            </div>
            {isModeInfoModalOpen && <ModeInfoModal onClose={() => setIsModeInfoModalOpen(false)} />}
        </>
    );
};
