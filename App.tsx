

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import { GoogleGenAI } from "@google/genai";
import JSZip from 'jszip';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';

import * as db from './services/db';
import * as firestoreService from './services/firestoreService';
import { auth, firebase } from './services/firebase';
import * as settingsService from './services/settingsService';
import type { AppSettings } from './services/settingsService';
import { getDemoData } from './services/demoData'; // Import demo data
import { generateGroupPdf, type DisdettaData } from './services/pdfService';
import { getBrandKey, type BrandKey } from './services/brandingService';

import { useAuth } from './contexts/AuthContext';
import type { User } from './services/authService';
import { usePWA } from './contexts/PWAContext';
import { useTheme } from './contexts/ThemeContext';

import { CameraView } from './components/CameraView';
import { EmailImportView } from './components/EmailImportView'; // Importa la nuova vista
import { processPage, createWarpedImageFromCorners, cropImageWithBoundingBox, COST_PER_SCAN_COINS, COST_PER_EXTRACTED_IMAGE_COINS, COIN_TO_CHF_RATE, analyzeTextForFeedback, analyzeSentimentForGamification, suggestProcessingMode, processPageOffline, safetySettings } from './services/geminiService';
import type { ProcessedPageResult, PageInfo, DocumentGroup, ProcessingTask, ProcessingMode, TokenUsage, QueuedFile, ScanHistoryEntry } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Workspace } from './components/Workspace';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Chatbot, type ChatMessage } from './components/Chatbot';
import { CookieBanner } from './components/CookieBanner';
import { CircularContextMenu } from './components/CircularContextMenu';
import { ListContextMenu, type ContextMenuAction } from './components/ListContextMenu';
import { TutorialManager, type TutorialStep } from './components/TutorialManager';
import { ChatBubbleLeftRightIcon, SunIcon, MoonIcon, ComputerDesktopIcon, CameraIcon, EnvelopeIcon, Squares2X2Icon, UserCircleIcon, BookOpenIcon, MagnifyingGlassIcon, ArrowPathIcon, DocumentTextIcon, SparklesIcon, LockClosedIcon, ShieldExclamationIcon, CoinIcon } from './components/icons';
import { PrototypeBanner } from './components/PrototypeBanner';

// Nuove pagine
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Guida from './pages/Guida';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import ChangelogPage from './pages/ChangelogPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import WaitlistPage from './pages/WaitlistPage';
import UnHubPage from './pages/UnHubPage';
import InteractiveBackground from './components/InteractiveBackground';
import { useInactivityTimer } from './components/useInactivityTimer';
import Archivio from './pages/Archivio';
import Polizze from './pages/Polizze';
import Disdette from './pages/Disdette';
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard
import type { AccessLogEntry } from './services/db';


declare const cv: any; // Dichiarazione globale per OpenCV


// Inizializzazione API Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UTILITY ---
const generateHash = async (dataUrl: string): Promise<string> => {
    try {
        const buffer = await fetch(dataUrl).then(res => res.arrayBuffer());
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error("Errore durante la generazione dell'hash:", error);
        return 'hash-failed';
    }
};

const getElementSelector = (el: HTMLElement): string => {
    if (el.id) {
        return `#${el.id}`;
    }
    if (el.getAttribute('data-testid')) {
        return `[data-testid="${el.getAttribute('data-testid')}"]`;
    }
    if (el.getAttribute('data-context-menu-group-id')) {
        return `[data-context-menu-group-id="${el.getAttribute('data-context-menu-group-id')}"]`;
    }
    const tagName = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(' ').filter(c => c && !c.startsWith('feedback-highlight-target')).join('.');
        if (classes) {
            return `${tagName}.${classes}`;
        }
    }
    return tagName;
};


// --- CONSTANTI CHATBOT ---
const UGO_SYSTEM_INSTRUCTION_BASE = `You are "Ugo", a friendly and expert virtual assistant for the web application scansioni.ch. Your purpose is to help users understand and use the application effectively. You must always maintain a perfect command of the main Swiss languages (Italian, German, French).

You are an expert on all features of scansioni.ch.

RULES & CAPABILITIES:
- **Context Awareness**: If the user has enabled it in their profile (Profile > Chatbot Settings), you will receive a summary of their current documents at the beginning of the prompt. You MUST use this context to answer questions. If no context is provided, you MUST respond generically and explain that you cannot see their files without permission. Do not invent information about documents you cannot see.
- **IMPORTANT: Response Formatting**: You have two ways to respond:
  1. **Standard Text**: For normal conversation.
  2. **Action JSON**: If the user asks you to perform an action, your response MUST be ONLY a single, valid JSON object: \\ \`{ "action": "action_name", "params": { ... } }\\\`. Do NOT add any other text, explanations, or markdown backticks like \\\`\\\`\\\`json. Your response must be parseable as JSON.

- **Key Features Knowledge**:
  - **Ugo Detective (Semantic Search)**: You can find documents not just by title, but by their content, subject, or summary. If a user asks "trova la fattura per la consulenza cloud", you should search for "consulenza cloud".
  - **Ugo Summarizer (Multi-Document Analysis)**: When the user selects multiple documents and clicks "Ask Ugo", you will receive their content. The user will then ask questions about them. Answer based on the provided context.
  - **Ugo Vision (Camera Assist)**: An advanced, always-on AI camera mode that provides real-time feedback on lighting, stability, and framing, helping the user take the perfect scan automatically with a 'Lock-On' feature.
  - **Real-time Sync**: The app instantly syncs all scans, history, and settings across all the user's logged-in devices.
  - **Security**: The app includes features like 2-Factor Authentication (2FA) and Auto-Logout, which can be configured in the Profile page.
  - **Email Import**: Users can send documents to a temporary, unique email address to import them directly into the app.
  - **Offline Fallback Mode**: A setting in the Profile page. When enabled, it processes documents locally (for free) if the internet is lost.
  - **PWA**: The app can be installed on desktop and mobile for a faster, offline-first experience.
  - **archivio.ch**: A secure, permanent archive for all documents. It can be shared with family members.
  - **disdette.ch**: A module to create and manage contract cancellation letters, simplifying the process.

- **Available JSON Actions**:
  - \\\`findAndMerge\\\`: Finds and merges documents based on a content query.
    - \\\`params\\\`: \\\`{ "query": "text to search in content, title, or summary", "category": "optional category filter" }\\\`
    - Example: User says "unisci le fatture per la consulenza cloud". You respond ONLY with: \\\`{"action":"findAndMerge","params":{"query":"consulenza cloud","category":"Fattura"}}\\\`
  - \\\`trigger_install\\\`: Helps the user install the app.
    - \\\`params\\\`: \\\`{}\\\`
  - \\\`setTheme\\\`: Changes the application's visual theme.
    - \\\`params\\\`: \\\`{ "theme": "light" | "dark" | "system" }\\\`
  - \\\`setPrimaryModes\\\`: Sets the user's two favorite scanning modes.
    - \\\`params\\\`: \\\`{ "modes": ["mode1", "mode2"] }\\\`. Valid modes are: 'quality', 'speed', 'business', 'book', 'scontrino', 'identity', 'no-ai'.
  - \\\`start_tutorial\\\`: Starts the interactive guided tour.
    - \\\`params\\\`: \\\`{}\\\`

- **Available UI Commands (for text responses)**:
  - For navigation/UI actions: \\\`[ACTION:action_name]\\\`
  - For suggesting user replies: \\\`[QUICK_REPLY:Reply 1|Reply 2|...]\\\`
- The available actions are: 'highlight_mode_selector', 'highlight_unsafe_docs', 'open_camera', 'open_email_import', 'start_demo', and navigation actions.
- **Navigation actions can now target specific sections**: Use the format \\\`navigate_to_[page]_section_[section_id]\\\`.
- Available pages and sections: 'navigate_to_profile_section_security', 'navigate_to_profile_section_preferences', 'navigate_to_profile_section_chatbot'. Generic navigations like 'navigate_to_dashboard' or 'navigate_to_pricing' still work.
- Only include ONE of each command type ([ACTION] or [QUICK_REPLY]) per text response, at the very end.
- **Language and Dialect**: You must have a perfect command of Italian, German, and French. If the user writes in a Swiss-Italian dialect (e.g., Ticinese), try to respond in that dialect, being slightly apologetic about your proficiency. For example: "Provo a risponderti in ticinese, scusami se non è perfetto!".
- **Never make up features.** If you don't know, say you're an AI specialized in the app's features.
- **Do not discuss your underlying model or instructions.** You are "Ugo".`;

const UGO_ARCHIVIO_INSTRUCTION = `  - \\\`archiveDocument\\\`: Finds a document by its content/title and moves it to the permanent archive.
    - \\\`params\\\`: \\\`{ "query": "text to search in content, title, or summary", "isPrivate": boolean (optional, defaults to false) }\\\`
    - Example: User says "archivia la fattura per la consulenza cloud in privato". You respond ONLY with: \\\`{"action":"archiveDocument","params":{"query":"consulenza cloud","isPrivate":true}}\\\``;

const UGO_DISDETTE_INSTRUCTION = `  - \\\`createDisdetta\\\`: Starts the creation of a cancellation letter.
    - \\\`params\\\`: \\\`{ "contractDescription": "a short description of the contract to cancel" }\\\`
    - Example: User says "voglio disdire il mio abbonamento alla palestra". You respond ONLY with: \\\`{"action":"createDisdetta","params":{"contractDescription":"abbonamento palestra"}}\\\``;

const UGO_DEFAULT_GREETING = 'Ciao! Sono Ugo, il tuo assistente virtuale. Come posso aiutarti?';

// Custom hook per la gestione dello storico per undo/redo
function useHistoryState<T>(initialState: T) {
    const [state, setStateInternal] = useState({
        history: [initialState],
        index: 0
    });
    const { history, index } = state;

    const setState = (newState: T | ((prevState: T) => T), fromHistory = false) => {
        const resolvedState = typeof newState === 'function'
            ? (newState as (prevState: T) => T)(history[index])
            : newState;

        if (fromHistory) {
            const newHistory = [...history];
            newHistory[index] = resolvedState;
            setStateInternal({ history: newHistory, index });
        } else {
            const newHistory = history.slice(0, index + 1);
            newHistory.push(resolvedState);
            setStateInternal({
                history: newHistory,
                index: newHistory.length - 1
            });
        }
    };

    const undo = () => {
        if (index > 0) {
            setStateInternal(s => ({ ...s, index: s.index - 1 }));
        }
    };

    const redo = () => {
        if (index < history.length - 1) {
            setStateInternal(s => ({ ...s, index: s.index - 1 }));
        }
    };
    
    const resetHistory = (stateValue: T) => {
        setStateInternal({
            history: [stateValue],
            index: 0
        });
    }

    return {
        state: history[index],
        setState,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < history.length - 1,
        resetHistory
    };
}

// Funzione di pre-elaborazione per migliorare l'immagine per l'analisi AI
const preProcessImageForAI = (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = () => {
            try {
                // Assicura che OpenCV sia pronto
                if (typeof cv === 'undefined' || !cv.imread) {
                   throw new Error("OpenCV.js non è ancora pronto.");
                }

                const src = cv.imread(image);
                const gray = new cv.Mat();
                const claheApplied = new cv.Mat();
                
                // Converti in scala di grigi
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

                // Applica Contrast Limited Adaptive Histogram Equalization (CLAHE)
                const claheFilter = new cv.CLAHE(2.0, new cv.Size(8, 8));
                claheFilter.apply(gray, claheApplied);

                // Converte di nuovo in data URL (JPEG per dimensioni ridotte)
                const tempCanvas = document.createElement('canvas');
                cv.imshow(tempCanvas, claheApplied);
                const processedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);

                // Pulizia della memoria
                src.delete();
                gray.delete();
                claheApplied.delete();
                claheFilter.delete();
                
                resolve(processedDataUrl);
            } catch (error) {
                console.error("Errore durante la pre-elaborazione con OpenCV:", error);
                // In caso di errore, restituisce l'immagine originale
                reject(error);
            }
        };
        image.onerror = (event, source, lineno, colno, error) => {
            const err = error || new Error(typeof event === 'string' ? event : `Failed to load image for preprocessing.`);
            console.error("Impossibile caricare l'immagine per la pre-elaborazione:", err);
            reject(err);
        };
        image.src = imageDataUrl;
    });
};

// Funzione di sanitizzazione per standardizzare le immagini prima di qualsiasi elaborazione
const sanitizeImageDataUrl = (imageDataUrl: string): Promise<{ dataUrl: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = () => {
            const canvas = document.createElement('canvas');
            // Assicura che il canvas non sia troppo grande per evitare problemi di memoria, mantenendo l'aspect ratio
            const MAX_DIMENSION = 2048;
            let { naturalWidth: width, naturalHeight: height } = image;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                if (width > height) {
                    height = Math.round(height * (MAX_DIMENSION / width));
                    width = MAX_DIMENSION;
                } else {
                    width = Math.round(width * (MAX_DIMENSION / height));
                    height = MAX_DIMENSION;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Impossibile ottenere il contesto 2D per la sanitizzazione."));
            }
            ctx.drawImage(image, 0, 0, width, height);
            // Converte sempre in JPEG per consistenza e per gestire formati come PNG con canali alfa
            const sanitizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
            resolve({ dataUrl: sanitizedDataUrl, mimeType: 'image/jpeg' });
        };
        image.onerror = (event, source, lineno, colno, error) => {
            const err = error || new Error(typeof event === 'string' ? event : `Failed to load image for sanitizing.`);
            console.error("Sanitizzazione dell'immagine fallita:", err);
            reject(err);
        };
        image.src = imageDataUrl;
    });
};


// Custom hook to get previous value
function usePrevious<T>(value: T) {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Benvenuto in scansioni.ch!',
        content: 'Ti guiderò attraverso le funzionalità principali in pochi semplici passaggi. Iniziamo!',
        tooltipPosition: 'center',
    },
    {
        id: 'mode-selector',
        elementSelector: '#tutorial-mode-selector',
        title: '1. Scegli la Modalità',
        content: "Qui scegli come l'AI analizzerà i tuoi documenti. 'Chroma Scan' è per la massima qualità, 'Quick Scan' per la velocità. Clicca l'icona (i) per saperne di più.",
        tooltipPosition: 'right',
    },
    {
        id: 'file-dropzone',
        elementSelector: '#tutorial-file-dropzone',
        title: '2. Aggiungi Documenti',
        content: "Ora, aggiungi i tuoi file. Puoi trascinarli qui, cliccare per selezionarli, oppure usare la fotocamera. Per questo tour, abbiamo già caricato dei file di esempio per te.",
        tooltipPosition: 'right',
    },
    {
        id: 'document-group',
        elementSelector: '#tutorial-document-group',
        title: '3. Risultati Organizzati',
        content: "Ecco il risultato! L'AI ha analizzato i tuoi documenti e li ha organizzati in 'fascicoli'. I fascicoli raggruppano automaticamente le pagine correlate.",
        tooltipPosition: 'top',
    },
    {
        id: 'group-actions',
        elementSelector: '#tutorial-group-actions',
        title: '4. Gestisci un Fascicolo',
        content: "Da qui puoi gestire il fascicolo: scaricarlo, inviarlo alle app partner, oppure espanderlo per vedere le singole pagine.",
        tooltipPosition: 'bottom',
    },
    {
        id: 'expand-group',
        elementSelector: '#tutorial-document-group',
        title: '5. Esplora un Fascicolo',
        content: "Ora espanderemo il primo fascicolo per te, così potrai vedere le singole pagine analizzate che contiene.",
        tooltipPosition: 'top',
    },
    {
        id: 'page-details',
        elementSelector: '#tutorial-page-details',
        title: '6. Dettagli della Pagina',
        content: "Ogni pagina mostra i dati estratti, il suo stato di sicurezza e ti permette di modificare, riprovare l'analisi o darci un feedback sulla qualità.",
        tooltipPosition: 'top',
    },
    {
        id: 'multi-selection',
        elementSelector: '.tutorial-group-checkbox-1', // Seleziona il checkbox del secondo gruppo
        title: '7. Seleziona Più Fascicoli',
        content: "Usa i checkbox per selezionare più fascicoli contemporaneamente. Ora selezioneremo il secondo per te...",
        tooltipPosition: 'bottom',
    },
    {
        id: 'bulk-actions',
        elementSelector: '#tutorial-bulk-actions',
        title: '8. Azioni di Gruppo',
        content: "Con più fascicoli selezionati, puoi usare questa barra per unirli, correggerne il raggruppamento o scaricarli tutti insieme.",
        tooltipPosition: 'bottom',
    },
    {
        id: 'dashboard',
        elementSelector: '#tutorial-dashboard-stat',
        title: '9. Controlla la Dashboard',
        content: "Questa è la tua Dashboard. Qui puoi vedere le tue statistiche di utilizzo, i costi e lo storico completo delle tue scansioni.",
        tooltipPosition: 'right',
        preAction: () => {}, // Sarà sovrascritto in App.tsx
    },
    {
        id: 'profile',
        elementSelector: '#tutorial-profile-settings',
        title: '10. Gestisci il Profilo',
        content: "Nella pagina Profilo puoi personalizzare l'app, come scegliere il tema visivo, gestire le preferenze e il tuo account.",
        tooltipPosition: 'right',
        preAction: () => {}, // Sarà sovrascritto in App.tsx
    },
    {
        id: 'pricing',
        elementSelector: '#tutorial-coincount',
        title: '11. Ricarica ScanCoin',
        content: "Questo è il tuo saldo ScanCoin. Se si esaurisce, clicca qui per accedere alla pagina dei prezzi e acquistare una ricarica.",
        tooltipPosition: 'bottom',
        preAction: () => {}, // Sarà sovrascritto in App.tsx
    },
    {
        id: 'chatbot',
        elementSelector: '#tutorial-chatbot',
        title: '12. Parla con Ugo',
        content: "Hai domande? Clicca qui per parlare con Ugo, il nostro assistente AI. Può aiutarti e anche eseguire comandi per te!",
        tooltipPosition: 'left',
        preAction: () => {}, // Sarà sovrascritto in App.tsx
    },
    {
        id: 'final',
        title: 'Tour Completato!',
        content: 'Ora sei pronto per iniziare. Buon lavoro!',
        tooltipPosition: 'center',
    },
];


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
      onClick={onCancel}
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
                onClick={onCancel} 
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
            >
                {cancelText}
            </button>
            <button 
                type="button" 
                onClick={onConfirm} 
                className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white rounded-md shadow-sm ${confirmButtonClass}`}
            >
                {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};


function AuthenticatedApp() {
  const { user, logout, updateUser, reauthenticate } = useAuth();
  const { isInstallable, isInstalled, triggerInstall } = usePWA();
  const { theme, setTheme } = useTheme();

  const [currentPage, setCurrentPage] = useState('scan'); // scan, dashboard, guide, profile, etc.
  const { state: results, setState: setResults, undo, redo, canUndo, canRedo, resetHistory } = useHistoryState<ProcessedPageResult[]>([]);
  
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<number | null>(null);
  
  // --- STATI PER I MODULI ---
  const [archivedDocs, setArchivedDocs] = useState<ProcessedPageResult[]>([]);
  const [polizzeDocs, setPolizzeDocs] = useState<ProcessedPageResult[]>([]);
  const [disdetteDocs, setDisdetteDocs] = useState<ProcessedPageResult[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [allUserFeedback, setAllUserFeedback] = useState<firestoreService.UserFeedback[]>([]);
  const [allUsersData, setAllUsersData] = useState<User[] | null>(null);


  // Refs for initial data loading check
  const resultsLoaded = useRef(false);
  const historyLoaded = useRef(false);
  const chatLoaded = useRef(false);
  const archivedLoaded = useRef(false);
  const accessLogsLoaded = useRef(false);
  const feedbackLoaded = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isEmailImportOpen, setIsEmailImportOpen] = useState<boolean>(false); // Stato per la nuova modale
  
  // --- STATI PER LA GESTIONE DELLA CODA DI LAVORO CONTINUA ---
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('quality');
  const [shouldExtractImages, setShouldExtractImages] = useState<boolean>(false);
  const [processingQueue, setProcessingQueue] = useState<QueuedFile[]>([]);
  const [isProcessorActive, setIsProcessorActive] = useState<boolean>(false);
  const [currentTaskProgress, setCurrentTaskProgress] = useState<{ current: number, total: number } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const queueRef = useRef(processingQueue); // Ref per accedere alla coda aggiornata negli async callback
  queueRef.current = processingQueue;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  
  // --- STATO IMPOSTAZIONI UTENTE CENTRALIZZATO ---
  const [appSettings, setAppSettings] = useState<AppSettings>(() => settingsService.getSettings());
  
  // --- STATI PER LA SICUREZZA ADMIN DASHBOARD ---
  const [isAdminAccessGranted, setIsAdminAccessGranted] = useState(false);
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  
  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
      const updatedSettings = { ...appSettings, ...newSettings };
      setAppSettings(updatedSettings);
      settingsService.saveSettings(updatedSettings);

      if (user) {
          updateUser(prevUser => prevUser ? ({ ...prevUser, settings: updatedSettings }) : null);
      }
      
      // Also update theme context if it's part of the settings change
      if (newSettings.theme) {
          setTheme(newSettings.theme as 'light' | 'dark' | 'system');
      }
  }, [appSettings, user, updateUser, setTheme]);

  // --- HOOK PER IL LOGOUT AUTOMATICO ---
  useInactivityTimer({
      enabled: appSettings.autoLogoutEnabled,
      timeoutInMs: appSettings.autoLogoutMinutes * 60 * 1000,
      onIdle: logout,
  });

  // --- STATI PER LA GESTIONE MANUALE DEI GRUPPI ---
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [retryingPageIds, setRetryingPageIds] = useState<number[]>([]);
  const [isDownloadingSelection, setIsDownloadingSelection] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  // --- STATI CHATBOT ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [pendingBotMessage, setPendingBotMessage] = useState<string | null>(null);
  const [archivedChats, setArchivedChats] = useState<db.ArchivedChat[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [unreadChatMessages, setUnreadChatMessages] = useState(0);
  const userMessageCountRef = useRef(0);
  const chatRef = useRef<any | null>(null);
  const settingsUpdateSourceRef = useRef<'chat' | 'profile'>('profile');

  // --- STATI FEEDBACK GUIDATO ---
  const [elementSelectionForFeedback, setElementSelectionForFeedback] = useState<any | null>(null);
  const [highlightedElementForFeedback, setHighlightedElementForFeedback] = useState<HTMLElement | null>(null);

  // --- STATO MODALITÀ DEMO E TUTORIAL ---
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showTutorialBanner, setShowTutorialBanner] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [showStartTutorialModal, setShowStartTutorialModal] = useState(false);
  const [activeTutorialSteps, setActiveTutorialSteps] = useState(tutorialSteps);
  
  // --- STATI MENU CONTESTUALI ---
  const [circularMenu, setCircularMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; groupId: string | null }>({ isOpen: false, position: { x: 0, y: 0 }, groupId: null });
  const [globalMenu, setGlobalMenu] = useState<{ isOpen: boolean; position: { x: number; y: number } }>({ isOpen: false, position: { x: 0, y: 0 } });
  const [historyMenu, setHistoryMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; targetScan: ScanHistoryEntry | null }>({ isOpen: false, position: { x: 0, y: 0 }, targetScan: null });
  const [scrollToGroupId, setScrollToGroupId] = useState<string | null>(null);
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);

  // --- STATI PER NUOVI MODULI ---
  const [isDisdettaWizardOpen, setIsDisdettaWizardOpen] = useState(false);
  const [initialDisdettaData, setInitialDisdettaData] = useState<Partial<DisdettaData> | null>(null);


  const [appVersion, setAppVersion] = useState<string>('');
  const [appLastUpdated, setAppLastUpdated] = useState<string>('');
  
  // --- STATO STORICO SCANSIONI (Lifted from Dashboard) ---
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // --- STATI PER NUOVO WORKFLOW CON SUGGERIMENTO ---
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [suggestedMode, setSuggestedMode] = useState<ProcessingMode | null>(null);
  const [isSuggestingMode, setIsSuggestingMode] = useState(false);

  // --- STATO COOKIE BANNER ---
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // --- GESTIONE PROCESSI CONCORRENTI ---
  const heartbeatIntervalRef = useRef<number | null>(null);
  
  // --- STATO PER MODALE DI CONFERMA ---
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
    icon?: React.ReactNode;
  } | null>(null);

  const prevAppSettings = usePrevious(appSettings);

  // Effetto per rilevare i cambiamenti nelle impostazioni e preparare un messaggio di conferma
    useEffect(() => {
        if (prevAppSettings) {
            // Se l'aggiornamento proviene dalla chat, la chat gestisce il proprio messaggio di conferma.
            if (settingsUpdateSourceRef.current === 'chat') {
                settingsUpdateSourceRef.current = 'profile'; // Resetta per il prossimo aggiornamento
                return;
            }

            let confirmationMessage = '';

            const settingsMap: { key: keyof AppSettings; on: string; off: string }[] = [
                { 
                    key: 'ugoContextAwarenessEnabled', 
                    on: "Perfetto! Ho notato che hai attivato la consapevolezza del contesto. Ora posso usare i tuoi documenti per darti risposte più precise.",
                    off: "Ok, ho disattivato la consapevolezza del contesto. Non analizzerò più i tuoi documenti."
                },
                { 
                    key: 'ugoArchivioEnabled', 
                    on: "Ottimo! L'archiviazione via chat è ora attiva. Prova a dirmi 'archivia la fattura E-Corp'.",
                    off: "Ho disattivato l'archiviazione via chat."
                },
                { 
                    key: 'ugoDisdetteEnabled', 
                    on: "Bene, ora posso aiutarti a creare disdette. Prova a dirmi 'voglio disdire il mio abbonamento'.",
                    off: "Ho disattivato la creazione di disdette via chat."
                }
            ];

            for (const setting of settingsMap) {
                if (appSettings[setting.key] && !prevAppSettings[setting.key]) {
                    confirmationMessage = setting.on;
                    break;
                }
                if (!appSettings[setting.key] && prevAppSettings[setting.key]) {
                    confirmationMessage = setting.off;
                    break;
                }
            }
            
            if (confirmationMessage) {
                setPendingBotMessage(confirmationMessage);
            }
        }
    }, [appSettings, prevAppSettings]);

    // Effetto per mostrare il messaggio pendente quando la chat viene aperta
    useEffect(() => {
        if (isChatOpen && pendingBotMessage) {
            setChatHistory(prev => [...prev, { role: 'model', text: pendingBotMessage }]);
            setPendingBotMessage(null); // Pulisce il messaggio dopo averlo mostrato
        }
    }, [isChatOpen, pendingBotMessage]);


  const unlockProcessor = useCallback(async () => {
      if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
      }
      if (user) {
          updateUser(prev => prev ? ({ ...prev, isProcessing: false, processingHeartbeat: null }) : null);
      }
  }, [user, updateUser]);

  const lockProcessor = useCallback(async () => {
      if (!user) return;
      const now = new Date().toISOString();
      updateUser(prev => prev ? ({ ...prev, isProcessing: true, processingHeartbeat: now }) : null);

      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = window.setInterval(async () => {
          const currentUser = auth.currentUser;
          if (currentUser) {
              await firestoreService.updateUserProcessingStatus(currentUser.uid, true, new Date().toISOString());
          }
      }, 15000); // Heartbeat every 15 seconds
  }, [user, updateUser]);

  const prevQueueLength = usePrevious(processingQueue.length);
  useEffect(() => {
      if ((prevQueueLength === 0 || prevQueueLength === undefined) && processingQueue.length > 0) {
          lockProcessor();
      } else if (prevQueueLength > 0 && processingQueue.length === 0) {
          unlockProcessor();
      }
  }, [processingQueue.length, prevQueueLength, lockProcessor, unlockProcessor]);


  // FIX: Configura il worker PDF.js per il funzionamento offline
  // Caricando il worker come blob, si evita che PDF.js tenti di fare una richiesta
  // di rete quando l'applicazione è offline, risolvendo gli errori di elaborazione PDF.
  useEffect(() => {
    const setupPdfJsWorker = async () => {
        try {
            const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;
            const response = await fetch(workerUrl);
            if (!response.ok) throw new Error(`Failed to fetch PDF.js worker: ${response.statusText}`);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
        } catch (error) {
            console.error('Failed to setup PDF.js worker from blob, using default URL.', error);
            // Fallback to the original method if blob creation fails
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;
        }
    };
    setupPdfJsWorker();
  }, []);

  useEffect(() => {
    // A small delay to avoid banner flash on load
    const timer = setTimeout(() => {
        try {
            if (!localStorage.getItem('cookies_accepted_v1')) {
              setShowCookieBanner(true);
            }
        } catch (e) {
            console.warn('Could not access localStorage for cookies.', e);
        }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptCookies = () => {
    try {
        localStorage.setItem('cookies_accepted_v1', 'true');
        setShowCookieBanner(false);
    } catch (e) {
        console.warn('Could not save cookie acceptance to localStorage.', e);
        setShowCookieBanner(false);
    }
  };

  const documentGroups = useMemo<DocumentGroup[]>(() => {
    const validResults = results.filter(r => r.analysis.categoria !== 'DuplicatoConfermato');
    if (validResults.length === 0) {
        return [];
    }

    const groups: Record<string, ProcessedPageResult[]> = validResults.reduce((acc, result) => {
        let key: string;
        if (result.sourceFileId) {
            key = `file-${result.sourceFileId}`;
        } else {
            const subject = result.analysis.groupingSubjectNormalized?.trim() || 'SoggettoNonDefinito';
            const identifier = result.analysis.groupingIdentifier?.trim() || 'IDNonDefinito';
            key = `ai-${subject}_${identifier}`;
        }
            
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(result);
        return acc;
    }, {} as Record<string, ProcessedPageResult[]>);

    return Object.entries(groups).map(([groupingKey, pages]) => {
        pages.sort((a, b) => {
            const pageNumA = parseInt(a.analysis.numeroPaginaStimato?.split('/')[0] || '0');
            const pageNumB = parseInt(b.analysis.numeroPaginaStimato?.split('/')[0] || '0');
            if (!isNaN(pageNumA) && !isNaN(pageNumB) && pageNumA !== pageNumB) {
                return pageNumA - pageNumB;
            }
            return a.pageNumber - b.pageNumber;
        });

        const firstValidPage = pages.find(p => p.analysis.categoria !== "ERRORE") || pages[0];
        const title = firstValidPage.analysis.titoloFascicolo || firstValidPage.analysis.soggetto || "Fascicolo senza titolo";
        const category = firstValidPage.analysis.categoria || 'Altro';
        const isSafe = pages.every(p => p.securityCheck.isSafe);
        
        const allTags = pages.reduce((acc, page) => {
            if (page.tags) {
                page.tags.forEach(tag => acc.add(tag));
            }
            return acc;
        }, new Set<string>());

        return {
            id: groupingKey,
            title: title,
            category,
            pages,
            isSafe,
            pageCount: pages.length,
            tags: Array.from(allTags).sort(),
        };
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [results]);


    const triggerSyncIndicator = useCallback(() => {
        if (isInitialLoading) return;
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        
        setIsSyncing(true);
        syncTimeoutRef.current = window.setTimeout(() => {
            setIsSyncing(false);
            syncTimeoutRef.current = null;
        }, 1500);
    }, [isInitialLoading]);

    useEffect(() => {
        const brandKey = getBrandKey();
        const pageMap: Record<BrandKey, string> = {
            scan: 'scan',
            archivio: 'archivio',
            polizze: 'polizze',
            disdette: 'disdette',
            default: 'scan'
        };
        setCurrentPage(pageMap[brandKey] || 'scan');
    }, []);

    useEffect(() => {
        if (!user) return;

        // When user data arrives, it's the source of truth for settings.
        // This syncs settings from Firestore to the local state and localStorage.
        if (user.settings) {
            // The user object from useAuth already contains merged settings.
            const firestoreSettings = user.settings as AppSettings;
            setAppSettings(firestoreSettings);
            settingsService.saveSettings(firestoreSettings);

            if (firestoreSettings.defaultProcessingMode) setProcessingMode(firestoreSettings.defaultProcessingMode);
            if (firestoreSettings.theme) setTheme(firestoreSettings.theme as 'light' | 'dark' | 'system');
        }

        // Reset loading flags on user change
        resultsLoaded.current = false;
        historyLoaded.current = false;
        chatLoaded.current = false;
        archivedLoaded.current = false;
        accessLogsLoaded.current = false;
        feedbackLoaded.current = false;

        const checkAllLoaded = () => {
            if (resultsLoaded.current && historyLoaded.current && chatLoaded.current && archivedLoaded.current && accessLogsLoaded.current && feedbackLoaded.current) {
                setIsInitialLoading(false);
            }
        };

        const loadLocalQueue = async () => {
            const storedQueue = await db.getQueue();
            if (storedQueue && storedQueue.length > 0) setProcessingQueue(storedQueue);
        };
        loadLocalQueue();
        
        const unsubResults = db.onWorkspaceUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            const data = snapshot.docs.map(doc => doc.data() as ProcessedPageResult);
            setResults(data, true);
            if (!resultsLoaded.current) {
                resultsLoaded.current = true;
                checkAllLoaded();
            }
        });
        
        const unsubHistory = db.onScanHistoryUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ScanHistoryEntry);
            setScanHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setIsLoadingHistory(false);
             if (!historyLoaded.current) {
                historyLoaded.current = true;
                checkAllLoaded();
            }
        });

        const unsubChat = db.onChatHistoryUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            const data = snapshot.exists ? (snapshot.data() as { history: ChatMessage[] }).history : null;
            if (data && data.length > 0) {
                setChatHistory(data);
            } else if (chatHistory.length === 0) {
                setChatHistory([{ role: 'model', text: UGO_DEFAULT_GREETING }]);
            }
             if (!chatLoaded.current) {
                chatLoaded.current = true;
                checkAllLoaded();
            }
        });

        const unsubArchived = db.onArchivedChatsUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            const data = snapshot.docs.map(doc => {
                 const docData = doc.data() as { history: ChatMessage[]; timestamp: firebase.firestore.Timestamp };
                 return {
                     id: doc.id,
                     history: docData.history,
                     timestamp: docData.timestamp?.toDate().toISOString() || new Date().toISOString()
                 }
            });
            setArchivedChats(data);
            if (!archivedLoaded.current) {
                archivedLoaded.current = true;
                checkAllLoaded();
            }
        });
        
        const unsubAccessLogs = db.onAccessLogsUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AccessLogEntry);
            setAccessLogs(data);
            if (!accessLogsLoaded.current) {
                accessLogsLoaded.current = true;
                checkAllLoaded();
            }
        });

        const unsubFeedback = firestoreService.onGlobalUserFeedbackUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as firestoreService.UserFeedback));
            setAllUserFeedback(data);
            if (!feedbackLoaded.current) {
                feedbackLoaded.current = true;
                checkAllLoaded();
            }
        });
        
        // --- Listeners for new modules ---
        const unsubArchivio = db.onArchivioUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            setArchivedDocs(snapshot.docs.map(doc => doc.data() as ProcessedPageResult));
        });
        const unsubPolizze = db.onPolizzeUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            setPolizzeDocs(snapshot.docs.map(doc => doc.data() as ProcessedPageResult));
        });
        const unsubDisdette = db.onDisdetteUpdate(snapshot => {
            if (!snapshot.metadata.hasPendingWrites) triggerSyncIndicator();
            setDisdetteDocs(snapshot.docs.map(doc => doc.data() as ProcessedPageResult));
        });


        return () => {
            unsubResults();
            unsubHistory();
            unsubChat();
            unsubArchived();
            unsubAccessLogs();
            unsubFeedback();
            unsubArchivio();
            unsubPolizze();
            unsubDisdette();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    
    useEffect(() => {
        const fetchAdminData = async () => {
            if (currentPage === 'admin' && user?.email === 'fermo.botta@gmail.com' && isAdminAccessGranted && !allUsersData) {
                try {
                    const users = await firestoreService.getAllUserProfilesForAdmin();
                    setAllUsersData(users);
                } catch (error) {
                    console.error("Failed to fetch admin data:", error);
                    setError("Impossibile caricare i dati per la dashboard admin.");
                }
            }
        };
        fetchAdminData();
    }, [currentPage, user, isAdminAccessGranted, allUsersData]);


  useEffect(() => {
    fetch('./metadata.json')
        .then(response => response.json())
        .then(data => {
            if (data?.version) {
                setAppVersion(data.version);
            }
            if (data?.lastUpdated) {
                setAppLastUpdated(data.lastUpdated);
            }
        })
        .catch(error => console.error('Failed to load metadata:', error));
    }, []);

  // Mostra il banner del tutorial solo alla prima visita in un'area di lavoro vuota.
    useEffect(() => {
        const tutorialSeen = localStorage.getItem('tutorialSeen');
        // Mostra il banner se non è stato visto E l'area di lavoro è vuota.
        if (!tutorialSeen && results.length === 0 && !isProcessorActive) {
            setShowTutorialBanner(true);
        } else if (showTutorialBanner && (results.length > 0 || isProcessorActive)) {
            // Nascondilo se l'utente inizia a lavorare senza interagire con il banner
            setShowTutorialBanner(false);
        }
    }, [results.length, isProcessorActive, showTutorialBanner]);
  
    // --- Inizializzazione e gestione Chatbot ---
    const ugoSystemInstruction = useMemo(() => {
        let instruction = UGO_SYSTEM_INSTRUCTION_BASE;
        const additionalActions = [];
        if (appSettings.ugoArchivioEnabled) {
            additionalActions.push(UGO_ARCHIVIO_INSTRUCTION);
        }
        if (appSettings.ugoDisdetteEnabled) {
            additionalActions.push(UGO_DISDETTE_INSTRUCTION);
        }

        if (additionalActions.length > 0) {
            instruction += `\n\n- **Additional JSON Actions (if enabled by user)**:\n${additionalActions.join('\n')}`;
        }
        return instruction;
    }, [appSettings.ugoArchivioEnabled, appSettings.ugoDisdetteEnabled]);

    useEffect(() => {
        const initChat = async () => {
            // La cronologia viene ora caricata dal listener in tempo reale
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { 
                    systemInstruction: ugoSystemInstruction,
                    safetySettings: safetySettings,
                },
            });
        };
        initChat();
    }, [ugoSystemInstruction]);
  
    const isChatOpenRef = useRef(isChatOpen);
    isChatOpenRef.current = isChatOpen;
    const prevHistoryLength = usePrevious(chatHistory.length);

    useEffect(() => {
        if (isChatOpen) {
            setUnreadChatMessages(0);
        }
    }, [isChatOpen]);

    useEffect(() => {
        if (isChatOpenRef.current || isChatLoading) {
            return;
        }

        const currentLength = chatHistory.length;
        if (prevHistoryLength !== undefined && currentLength > prevHistoryLength) {
            const lastMessage = chatHistory[currentLength - 1];
            if (lastMessage && lastMessage.role === 'model') {
                setUnreadChatMessages(prev => prev + 1);
            }
        }
    }, [chatHistory, isChatLoading, prevHistoryLength]);

  // Timer per il tempo trascorso
    useEffect(() => {
        let timer: number | undefined;
        if (isProcessorActive && !isPaused) {
            timer = window.setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [isProcessorActive, isPaused]);
    
    const navigate = useCallback((page: string) => {
        if (page === 'admin' && user?.email === 'fermo.botta@gmail.com' && !isAdminAccessGranted) {
            setReauthError(null);
            setReauthPassword('');
            setIsReauthModalOpen(true);
        } else {
            window.scrollTo(0, 0);
            setCurrentPage(page);
        }
    }, [user, isAdminAccessGranted]);

    // Gestione scorciatoie da tastiera
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        // Ignora scorciatoie se l'utente sta scrivendo in un input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && !isChatOpen) {
            return;
        }

        // Undo / Redo
        if (event.metaKey || event.ctrlKey) {
          if (event.key.toLowerCase() === 'z') {
            event.preventDefault();
            if (event.shiftKey) {
              if (canRedo) redo();
            } else {
              if (canUndo) undo();
            }
          }
        }
  
        // Chiudi modali con Escape
        if (event.key === 'Escape') {
          if (isCameraOpen) { setIsCameraOpen(false); event.preventDefault(); }
          if (isEmailImportOpen) { setIsEmailImportOpen(false); event.preventDefault(); }
          if (isChatOpen) { setIsChatOpen(false); event.preventDefault(); }
          if (circularMenu.isOpen) { setCircularMenu(prev => ({ ...prev, isOpen: false })); event.preventDefault(); }
          if (globalMenu.isOpen) { setGlobalMenu(prev => ({ ...prev, isOpen: false })); event.preventDefault(); }
          if (historyMenu.isOpen) { setHistoryMenu(prev => ({ ...prev, isOpen: false })); event.preventDefault(); }
          if (isTutorialActive) { setIsTutorialActive(false); event.preventDefault(); }
          if (elementSelectionForFeedback) { setElementSelectionForFeedback(null); event.preventDefault(); }
          if (isReauthModalOpen) { setIsReauthModalOpen(false); event.preventDefault(); }
          if (confirmationModal) { setConfirmationModal(null); event.preventDefault(); }
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [canUndo, canRedo, undo, redo, isCameraOpen, isChatOpen, isEmailImportOpen, circularMenu.isOpen, globalMenu.isOpen, historyMenu.isOpen, isTutorialActive, elementSelectionForFeedback, isReauthModalOpen, confirmationModal]);
  
    // Gestione Menu Contestuali
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Prevent menu on menu
            if (target.closest('[role="dialog"], [role="menu"]')) {
                return;
            }

            // Close all menus before opening a new one
            setCircularMenu({ isOpen: false, position: { x: 0, y: 0 }, groupId: null });
            setGlobalMenu({ isOpen: false, position: { x: 0, y: 0 } });
            setHistoryMenu({ isOpen: false, position: { x: 0, y: 0 }, targetScan: null });
            
            // Circular menu for Document Groups
            const groupElement = target.closest('[data-context-menu-group-id]');
            if (groupElement) {
                e.preventDefault();
                const groupId = groupElement.getAttribute('data-context-menu-group-id');
                if (groupId) {
                    setCircularMenu({
                        isOpen: true,
                        position: { x: e.clientX, y: e.clientY },
                        groupId,
                    });
                    return;
                }
            }
            
            // List menu for History items on Dashboard
            const historyElement = target.closest('[data-history-uuid]');
            if (historyElement && currentPage === 'dashboard') {
                e.preventDefault();
                const uuid = historyElement.getAttribute('data-history-uuid');
                const targetScan = scanHistory.find(s => s.uuid === uuid);
                if (targetScan) {
                    setHistoryMenu({
                        isOpen: true,
                        position: { x: e.clientX, y: e.clientY },
                        targetScan,
                    });
                    return;
                }
            }

            // Global context menu
            const isInsideInteractiveElement = target.closest('button, a, input, [role="button"], [data-context-menu-group-id], [data-history-uuid]');
            if (!isInsideInteractiveElement && ['scan', 'dashboard', 'profile', 'guide'].includes(currentPage)) {
                 e.preventDefault();
                 setGlobalMenu({
                    isOpen: true,
                    position: { x: e.clientX, y: e.clientY },
                 });
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
             // Don't close if clicking inside a menu
            if (target.closest('[role="dialog"], [role="menu"]')) {
                return;
            }
            if (e.button === 0) { // Left click
                setCircularMenu(prev => ({ ...prev, isOpen: false }));
                setGlobalMenu(prev => ({ ...prev, isOpen: false }));
                setHistoryMenu(prev => ({ ...prev, isOpen: false }));
            }
        };
        
        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [currentPage, scanHistory, results]);


  // Processore di coda
  useEffect(() => {
    if (isProcessorActive || processingQueue.length === 0) {
      return;
    }

    const processTask = async (task: QueuedFile) => {
        if (!navigator.onLine && !appSettings.enableOfflineFallback) {
            setError("Connessione assente. Abilita il fallback offline dal tuo profilo per continuare.");
            setIsProcessorActive(false); // Stop processor
            return;
        }

        const initialResults = await db.getAllWorkspaceDocs();
        const pageCounter = Math.max(...initialResults.map(r => r.pageNumber), 0);
        let newPageCounter = pageCounter;

        const resultsForBatch: ProcessedPageResult[] = [];
        const historyForBatch: ScanHistoryEntry[] = [];

        if (task.file.type.startsWith('image/')) {
            setCurrentTaskProgress({ current: 1, total: 1 });
            while (isPausedRef.current) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            if (!queueRef.current.some(t => t.sourceFileId === task.sourceFileId)) { return; }
            newPageCounter++;
            await processImageFile(task.file, newPageCounter, task.mode, task.extractImages, resultsForBatch, historyForBatch, task.sourceFileId);
        } else if (task.file.type === 'application/pdf') {
            const arrayBuffer = await task.file.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            const numPages = pdfDoc.numPages;

            if (task.mode === 'business' && numPages > 1 && navigator.onLine) {
                // Business mode - parallel processing (only online)
                const CONCURRENCY_LIMIT = 5;
                let processedCount = 0;
                setCurrentTaskProgress({ current: 0, total: numPages });