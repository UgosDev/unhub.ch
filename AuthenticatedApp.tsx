

import React, { useRef, useEffect } from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import { AppRouter } from './components/AppRouter';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CameraView } from './components/CameraView';
import { EmailImportView } from './components/EmailImportView';
import { Chatbot } from './components/Chatbot';
import { CookieBanner } from './components/CookieBanner';
import { CircularContextMenu } from './components/CircularContextMenu';
import { ListContextMenu } from './components/ListContextMenu';
import { TutorialManager } from './components/TutorialManager';
import { PrototypeBanner } from './components/PrototypeBanner';
import {
    ChatBubbleLeftRightIcon, CoinIcon, SparklesIcon
} from './components/icons';

// ConfirmationModal component is moved here as it's only used by AuthenticatedApp
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonClass?: string;
  icon?: React.ReactNode;
}> = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Conferma', 
  cancelText = 'Annulla', 
  onConfirm, 
  onCancel, 
  confirmButtonClass = 'bg-purple-600 hover:bg-purple-700', 
  icon 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" 
      onClick={() => onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="p-6 text-center">
            {icon && (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                    {icon}
                </div>
            )}
            <h3 id="confirmation-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {message}
            </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-2xl">
            <button 
                type="button" 
                onClick={() => onCancel()} 
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
            >
                {cancelText}
            </button>
            <button 
                type="button" 
                onClick={() => onConfirm()} 
                className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white rounded-md shadow-sm ${confirmButtonClass}`}
            >
                {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};


export const AuthenticatedApp = () => {
    const logic = useAppLogic();
    const brandKey = ['scan', 'archivio', 'polizze', 'disdette'].includes(logic.currentPage) ? logic.currentPage as any : 'scan';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
             {/* Dynamic Global Styles */}
            <style>{`
                .highlight-animation {
                    animation: pulse-purple 2s infinite;
                }
                @keyframes pulse-purple {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
                }
                .feedback-highlight-target {
                    outline: 2px dashed #9333ea;
                    outline-offset: 2px;
                    box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
                    border-radius: 4px;
                    transition: outline 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
                }
                .highlight-section-animation {
                    animation: pulse-bg-purple 2.5s 1;
                }
                 @keyframes pulse-bg-purple {
                    0% { background-color: transparent; }
                    30% { background-color: rgba(216, 180, 254, 0.3); } /* purple-200/30 */
                    100% { background-color: transparent; }
                }
                .dark .highlight-section-animation {
                     @keyframes pulse-bg-purple-dark {
                        0% { background-color: transparent; }
                        30% { background-color: rgba(107, 33, 168, 0.3); } /* purple-800/30 */
                        100% { background-color: transparent; }
                    }
                    animation-name: pulse-bg-purple-dark;
                }
            `}</style>
            
            <Header currentPage={logic.currentPage} onNavigate={logic.navigate} onLogout={logic.logout} isSyncing={logic.isSyncing} />
            <PrototypeBanner onAskUgo={() => logic.setIsChatOpen(true)} />
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                <AppRouter {...logic} />
            </main>
            
            <Footer onNavigate={logic.navigate} isAuth={true} brandKey={brandKey} appLastUpdated={logic.appLastUpdated} />

            {/* Modals and Overlays */}
            {logic.isCameraOpen && <CameraView onClose={logic.onCloseCamera} onFinish={logic.handleCameraFinish} processingMode={logic.processingMode} />}
            {logic.isEmailImportOpen && <EmailImportView onClose={() => logic.setIsEmailImportOpen(false)} onQueueFiles={(files, mode) => {
                const tasks = files.map(file => ({
                    id: crypto.randomUUID(), file, mode, suggestedMode: null, isSuggesting: false, shouldExtractImages: logic.shouldExtractImages
                }));
                logic.addFilesToQueue(tasks);
                logic.setIsEmailImportOpen(false);
            }} />}

            {logic.isChatOpen && (
                <Chatbot 
                    history={logic.chatHistory} 
                    isLoading={logic.isChatLoading} 
                    onClose={() => logic.setIsChatOpen(false)} 
                    onSendMessage={logic.handleSendMessage}
                    onUpdateHistory={logic.setChatHistory}
                    onFeedbackResponse={logic.handleFeedbackResponse}
                    onArchive={logic.handleArchiveChat}
                    onNavigateToSettings={() => { logic.setIsChatOpen(false); logic.navigate('profile'); logic.setScrollToSection('chatbot'); }}
                />
            )}
             <button
                id="tutorial-chatbot"
                onClick={logic.handleOpenChat}
                className={`fixed bottom-6 right-6 w-16 h-16 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-purple-700 transition-transform transform hover:scale-110 ${logic.isChatOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                aria-label="Apri assistente Ugo"
            >
                {logic.unreadChatMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800">
                        {logic.unreadChatMessages}
                    </span>
                )}
                <ChatBubbleLeftRightIcon className="w-8 h-8"/>
            </button>
            
            {logic.showCookieBanner && <CookieBanner onAccept={logic.handleAcceptCookies} onNavigateToPrivacy={() => logic.navigate('privacy')} brandKey={brandKey} />}

            {logic.circularMenu.isOpen && (
                <CircularContextMenu 
                    isOpen={logic.circularMenu.isOpen}
                    position={logic.circularMenu.position}
                    targetGroup={logic.documentGroups.find(g => g.id === logic.circularMenu.groupId)}
                    isSelected={!!logic.circularMenu.groupId && logic.selectedGroupIds.includes(logic.circularMenu.groupId)}
                    isExpanded={!!logic.circularMenu.groupId && logic.expandedGroups.includes(logic.circularMenu.groupId)}
                    onClose={() => logic.setCircularMenu(c => ({...c, isOpen: false}))}
                    onSelect={() => logic.circularMenu.groupId && logic.onSelectGroup(logic.circularMenu.groupId)}
                    onExpand={() => logic.circularMenu.groupId && logic.onToggleExpandGroup(logic.circularMenu.groupId)}
                    onSendToApp={() => {
                        const group = logic.documentGroups.find(g => g.id === logic.circularMenu.groupId);
                        if (group) {
                            const targetApp = group.category === 'Assicurazione' ? 'polizze' : 'archivio';
                            logic.onSendToApp(group, targetApp as any);
                        }
                    }}
                    onDownloadZip={() => {
                        const group = logic.documentGroups.find(g => g.id === logic.circularMenu.groupId);
                        if (group) logic.handleDownloadGroupZip(group);
                    }}
                    onDownloadPdf={() => {
                        const group = logic.documentGroups.find(g => g.id === logic.circularMenu.groupId);
                        if (group) logic.handleDownloadGroupPdf(group);
                    }}
                    onUngroup={() => logic.circularMenu.groupId && logic.onUngroup(logic.circularMenu.groupId)}
                    actionsConfig={logic.appSettings.circularMenuActions}
                />
            )}
            
            {logic.globalMenu.isOpen && (
                <ListContextMenu
                    isOpen={logic.globalMenu.isOpen}
                    position={logic.globalMenu.position}
                    onClose={() => logic.setGlobalMenu(c => ({...c, isOpen: false}))}
                    actions={logic.globalMenuActions}
                />
            )}
            
            {logic.historyMenu.isOpen && logic.historyMenu.targetScan && (
                 <ListContextMenu
                    isOpen={logic.historyMenu.isOpen}
                    position={logic.historyMenu.position}
                    onClose={() => logic.setHistoryMenu(c => ({...c, isOpen: false}))}
                    actions={logic.historyMenuActions}
                />
            )}

             {logic.isTutorialActive && (
                <TutorialManager 
                    isActive={logic.isTutorialActive}
                    steps={logic.activeTutorialSteps}
                    currentStepIndex={logic.currentTutorialStep}
                    onNext={() => logic.handleTutorialStepChange(logic.currentTutorialStep + 1)}
                    onPrev={() => logic.handleTutorialStepChange(logic.currentTutorialStep - 1)}
                    onStop={() => {
                        logic.setIsTutorialActive(false);
                        if(logic.isDemoMode) {
                            logic.setResults(prev => prev.filter(r => !r.isDemo));
                            logic.setIsDemoMode(false);
                        }
                    }}
                />
             )}
              {logic.isReauthModalOpen && (
                 <ConfirmationModal
                    isOpen={logic.isReauthModalOpen}
                    title="Accesso Amministratore Richiesto"
                    onCancel={() => logic.setIsReauthModalOpen(false)}
                    onConfirm={logic.handleReauthSubmit}
                    confirmText="Conferma"
                    message={
                        <form onSubmit={(e) => { e.preventDefault(); logic.handleReauthSubmit(); }}>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Per accedere a questa sezione protetta, inserisci nuovamente la tua password.</p>
                             <input
                                id="reauth-password"
                                type="password"
                                value={logic.reauthPassword}
                                onChange={(e) => logic.setReauthPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                                required
                                autoFocus
                            />
                            {logic.reauthError && <p className="text-sm text-red-500 mt-2">{logic.reauthError}</p>}
                        </form>
                    }
                />
             )}
             {logic.confirmationModal && (
                <ConfirmationModal
                    isOpen={logic.confirmationModal.isOpen}
                    title={logic.confirmationModal.title}
                    message={logic.confirmationModal.message}
                    confirmText={logic.confirmationModal.confirmText}
                    cancelText={logic.confirmationModal.cancelText}
                    onConfirm={logic.confirmationModal.onConfirm}
                    onCancel={logic.confirmationModal.onCancel}
                    confirmButtonClass={logic.confirmationModal.confirmButtonClass}
                    icon={logic.confirmationModal.icon}
                />
             )}
            {logic.showWelcomeModal && (
                <ConfirmationModal
                    isOpen={true}
                    title={`Benvenuto in scansioni.ch, ${logic.user?.name}!`}
                    message={
                        <>
                            Siamo felici di vederti! Per iniziare, ti abbiamo accreditato <strong>1.000 ScanCoin gratuiti</strong>.
                            <br/><br/>
                            Ti consigliamo di iniziare con il nostro <strong>tour guidato interattivo</strong> per scoprire tutte le funzionalità.
                        </>
                    }
                    confirmText="Inizia il Tour Guidato"
                    cancelText="Esplora da solo"
                    onConfirm={() => { logic.handleCloseWelcomeModal(); logic.handleStartTutorial(); }}
                    onCancel={logic.handleCloseWelcomeModal}
                    icon={<SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                />
            )}
        </div>
    );
}
