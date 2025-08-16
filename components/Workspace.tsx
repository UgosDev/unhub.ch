import React, { useState, useEffect } from 'react';
import type { ProcessedPageResult, DocumentGroup, ProcessingTask, ProcessingMode } from '../services/geminiService';
import type { PendingFileTask } from '../App';
import { ImageInput } from './ImageInput';
import { ResultsDisplay } from './ResultsDisplay';
import { ErrorDisplay } from './ErrorDisplay';
import { QueueView } from './QueueView';
import { ProcessingView } from './ProcessingView';
import { SparklesIcon, InformationCircleIcon, DocumentTextIcon } from './icons';
import { ModeInfoModal } from './ModeInfoModal';

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
    onOpenCamera: () => void;
    onOpenEmailImport: () => void; 
    onClear: () => void;
    onUpdateResult: (updatedResult: ProcessedPageResult) => void;
    onUpdateGroupTags: (groupId: string, newTags: string[]) => void;
    onConfirmDuplicate: (pageNumber: number) => void;
    onDenyDuplicate: (pageNumber: number) => void;
    onSendToApp: (group: DocumentGroup, targetApp: 'archivio' | 'polizze' | 'disdette', options?: { isPrivate?: boolean }) => void;
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
    pendingFileTasks: PendingFileTask[];
    onPendingTaskChange: (id: string, updates: Partial<Omit<PendingFileTask, 'id' | 'file'>>) => void;
    onConfirmProcessing: () => void;
    onCancelProcessing: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = (props) => {
    const { documentGroups, error, processingQueue, currentTaskProgress, isProcessing } = props;
    const hasResults = documentGroups.length > 0;
    
    const [isModeInfoModalOpen, setIsModeInfoModalOpen] = useState(false);

    // Layout a 2 colonne per lo stato iniziale (vuoto)
    if (!hasResults && !isProcessing) {
        return (
             <>
                {props.showTutorialBanner && <TutorialBanner onStart={props.onStartTutorial} onDismiss={props.onDismissTutorial} />}
                {props.isDemoMode && <DemoBanner onExit={props.onExitDemo} />}
                {error && <div className="lg:col-span-2"><ErrorDisplay error={error} /></div>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
                    {/* Colonna 1: Aggiungi Documenti */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 px-1 mb-4">
                            1. Aggiungi Documenti
                        </h2>
                        <ImageInput
                            pendingFileTasks={props.pendingFileTasks}
                            onPendingTaskChange={props.onPendingTaskChange}
                            onFilesSelected={props.onFilesSelected}
                            onConfirmProcessing={props.onConfirmProcessing}
                            onCancelProcessing={props.onCancelProcessing}
                            onOpenCamera={props.onOpenCamera}
                            onOpenEmailImport={props.onOpenEmailImport}
                        />
                    </div>
                    
                    {/* Colonna 2: Raccogli Risultati (Placeholder) */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 px-1 mb-4">
                            2. Raccogli i Risultati
                        </h2>
                        <div className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg min-h-[400px] border border-dashed border-slate-300 dark:border-slate-700">
                            <DocumentTextIcon className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                            <p className="text-slate-500 dark:text-slate-400 max-w-md">I tuoi documenti analizzati appariranno qui, raggruppati in fascicoli.</p>
                             <div className="my-4 text-slate-500 dark:text-slate-400 text-sm font-semibold flex items-center w-full max-w-xs">
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                                <span className="flex-shrink mx-4">OPPURE</span>
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                            </div>
                            <button
                                onClick={props.onStartDemo}
                                className="w-full max-w-xs flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                <span>Prova una Demo</span>
                            </button>
                        </div>
                    </div>
                </div>
                {isModeInfoModalOpen && <ModeInfoModal onClose={() => setIsModeInfoModalOpen(false)} />}
            </>
        );
    }

    // Layout a 2 colonne quando ci sono risultati o è in corso l'elaborazione
    return (
        <>
            <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
                {/* Pannello Sinistro (Input e Coda) */}
                <div className="w-full lg:w-1/3 lg:max-w-md lg:sticky lg:top-24 flex flex-col gap-6 self-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 px-1 mb-4">
                            1. Aggiungi Documenti
                        </h2>
                        <ImageInput
                           pendingFileTasks={props.pendingFileTasks}
                           onPendingTaskChange={props.onPendingTaskChange}
                           onFilesSelected={props.onFilesSelected}
                           onConfirmProcessing={props.onConfirmProcessing}
                           onCancelProcessing={props.onCancelProcessing}
                           onOpenCamera={props.onOpenCamera}
                           onOpenEmailImport={props.onOpenEmailImport}
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
                            onConfirmDuplicate={props.onConfirmDuplicate}
                            onDenyDuplicate={props.onDenyDuplicate}
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
