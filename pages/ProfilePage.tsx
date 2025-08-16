import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as firestoreService from '../services/firestoreService';
import type { ArchivedChat } from '../services/firestoreService';
import type { UsageHistoryEntry, ProcessingMode, ScanHistoryEntry } from '../services/geminiService';
import { 
    DocumentTextIcon, BoltIcon, CreditCardIcon, SparklesIcon, BuildingOffice2Icon, BookOpenIcon, 
    DocumentPlusIcon, ClipboardDocumentIcon, SunIcon, MoonIcon, ComputerDesktopIcon, DownloadIcon,
    UserCircleIcon, InformationCircleIcon, TrashIcon, ChatBubbleLeftRightIcon, XMarkIcon, ClockIcon,
    EyeIcon, ShieldCheckIcon, DocumentDuplicateIcon, CheckCircleIcon, UsersIcon, MapPinIcon, QuestionMarkCircleIcon,
    CoinIcon
} from '../components/icons';
import type { AppSettings } from '../services/settingsService';
import { ProcessingModeSelector } from '../components/ProcessingModeSelector';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SubscriptionStatusCard } from '../components/SubscriptionStatusCard';
import { COIN_TO_CHF_RATE } from '../services/geminiService';
import { useTheme } from '../contexts/ThemeContext';
import { usePWA } from '../contexts/PWAContext';
import type { ChatMessage } from '../components/Chatbot';
import type { AccessLogEntry } from '../services/db';
import * as otpauth from 'otpauth';
import QRCode from 'qrcode';
import { firebase } from '../services/firebase';

// Helper for hashing recovery codes
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}


interface ProfilePageProps {
    onLogout: () => void;
    currentPage: string;
    onNavigate: (page: string) => void;
    settings: AppSettings;
    onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
    onStartTutorial: () => void;
    archivedChats: ArchivedChat[];
    onDeleteArchivedChat: (id: string) => void;
    setScanHistory: React.Dispatch<React.SetStateAction<ScanHistoryEntry[]>>;
    onResetChat: () => void;
    scrollToSection: string | null;
    onScrolledToSection: () => void;
    accessLogs: AccessLogEntry[];
}

const allModesInfo = [
    { id: 'quality' as ProcessingMode, title: 'Chroma Scan', Icon: SparklesIcon },
    { id: 'scontrino' as ProcessingMode, title: 'Scontrino', Icon: ClipboardDocumentIcon },
    { id: 'identity' as ProcessingMode, title: 'Doc. Identità', Icon: UserCircleIcon },
    { id: 'speed' as ProcessingMode, title: 'Quick Scan', Icon: BoltIcon },
    { id: 'business' as ProcessingMode, title: 'Batch Scan', Icon: BuildingOffice2Icon },
    { id: 'book' as ProcessingMode, title: 'Deep Scan', Icon: BookOpenIcon },
    { id: 'no-ai' as ProcessingMode, title: 'Simple Scan', Icon: DocumentPlusIcon },
];

const ThemeSelector: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { name: 'light' as const, label: 'Chiaro', Icon: SunIcon },
        { name: 'dark' as const, label: 'Scuro', Icon: MoonIcon },
        { name: 'system' as const, label: 'Sistema', Icon: ComputerDesktopIcon },
    ];

    return (
        <div id="tutorial-profile-settings">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Tema Applicazione</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Scegli l'aspetto dell'interfaccia.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
                {themes.map(({ name, label, Icon }) => (
                    <button
                        key={name}
                        onClick={() => setTheme(name)}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-colors ${
                            theme === name
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ArchivedChatModal: React.FC<{ chat: ArchivedChat; onClose: () => void }> = ({ chat, onClose }) => {
    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                        Chat del {new Date(chat.timestamp).toLocaleString('it-CH')}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XMarkIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </header>
                <div className="flex-grow p-4 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-900/50">
                    {chat.history.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />}
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
                                {renderMarkdown(msg.text)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RecoveryCodesView: React.FC<{ codes: string[]; onFinish: () => void; }> = ({ codes, onFinish }) => {
    const [hasSaved, setHasSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const getFileContent = (isForClipboard: boolean) => {
        const now = new Date();
        const contentArray = [
            "--- Codici di Recupero per scansioni.ch ---",
            `Generati il: ${now.toLocaleString('it-CH')}`,
            "",
            "IMPORTANTE: Salva questi codici in un luogo sicuro (es. password manager).",
            "Questi codici sono l'unico modo per accedere al tuo account se perdi il tuo dispositivo di autenticazione.",
            "",
            "ATTENZIONE: Questo nuovo set di codici invalida e sostituisce tutti i codici generati in precedenza.",
            "--------------------------------------------------",
            ...codes,
            "--------------------------------------------------",
        ];
        return contentArray.join(isForClipboard ? '\n' : '\r\n');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getFileContent(true)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const now = new Date();
        const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        const timeString = `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
        const fileName = `Codici-Recupero-scansioni-ch_${dateString}_${timeString}.txt`;

        const blob = new Blob([getFileContent(false)], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    
    return (
        <>
            <main className="p-6 space-y-4">
                <div className="bg-amber-100 dark:bg-amber-900/50 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200 p-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Salva i tuoi codici di recupero!</p>
                    <p className="text-sm">Conserva questi codici in un luogo sicuro come un password manager. Se perdi il tuo dispositivo, saranno l'unico modo per accedere al tuo account.</p>
                    <p className="text-sm mt-2 font-semibold">Attenzione: Tutti i codici generati in precedenza sono stati invalidati e non sono più utilizzabili.</p>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-center text-lg p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                    {codes.map(code => <div key={code}>{code}</div>)}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                    <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md shadow-sm">
                        {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <DocumentDuplicateIcon className="w-4 h-4" />}
                        {copied ? 'Copiato!' : 'Copia'}
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md shadow-sm">
                        <DownloadIcon className="w-4 h-4" /> Scarica
                    </button>
                </div>
                
                <div className="pt-4">
                    <label className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={hasSaved} onChange={e => setHasSaved(e.target.checked)} className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"/>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Ho salvato questi codici in un luogo sicuro.</span>
                    </label>
                </div>
            </main>
            <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                 <button onClick={onFinish} disabled={!hasSaved} className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-400">
                    Fine
                </button>
            </footer>
        </>
    );
};


const TwoFactorAuthSetupModal: React.FC<{ onClose: () => void; onActivate: (secret: string, recoveryCodeHashes: string[]) => void; userEmail: string; }> = ({ onClose, onActivate, userEmail }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [setupInfo, setSetupInfo] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [setupStep, setSetupStep] = useState<'configure' | 'showCodes'>('configure');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    
    useEffect(() => {
        const generateSetup = async () => {
            const secret = new otpauth.Secret({ size: 20 });
            const totp = new otpauth.TOTP({
                issuer: 'scansioni.ch',
                label: userEmail,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: secret,
            });
    
            const uri = otpauth.URI.stringify(totp);
            
            try {
                const qrDataUrl = await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M' });
                setSetupInfo({
                    secret: secret.base32,
                    qrCodeUrl: qrDataUrl,
                });
            } catch (err) {
                console.error("Failed to generate QR code", err);
                setError("Impossibile generare il codice QR.");
            }
        };
        generateSetup();
    }, [userEmail]);

    const handleVerifyAndShowCodes = () => {
        if (!setupInfo) return;
        setIsVerifying(true);
        setError('');

        try {
            const totp = new otpauth.TOTP({
                issuer: 'scansioni.ch',
                label: userEmail,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: otpauth.Secret.fromBase32(setupInfo.secret),
            });
    
            const delta = totp.validate({ token: code, window: 1 });
    
            if (delta === null) {
                setError('Codice non corretto. Riprova.');
            } else {
                // Generate 10 recovery codes
                const codes = Array.from({ length: 10 }, () => 
                    Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
                );
                setRecoveryCodes(codes);
                setSetupStep('showCodes');
            }
        } catch (err) {
            console.error("2FA validation error:", err);
            setError("Si è verificato un errore durante la verifica.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFinishSetup = async () => {
        if (!setupInfo) return;
        const hashedCodes = await Promise.all(recoveryCodes.map(c => sha256(c)));
        onActivate(setupInfo.secret, hashedCodes);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                        {setupStep === 'configure' ? 'Configura 2FA' : 'Salva i Codici di Recupero'}
                    </h3>
                </header>
                
                {setupStep === 'showCodes' ? (
                    <RecoveryCodesView codes={recoveryCodes} onFinish={handleFinishSetup} />
                ) : !setupInfo ? (
                    <div className="p-6 text-center">
                        <LoadingSpinner />
                        <p className="mt-2 text-slate-500">Generazione chiave segreta...</p>
                    </div>
                ) : (
                    <>
                        <main className="p-6 space-y-4">
                            <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">1. Scansiona il codice QR</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Usa la tua app di autenticazione (es. Google Authenticator) per scansionare l'immagine.</p>
                                <div className="mt-2 p-4 bg-white rounded-lg inline-block">
                                     <img src={setupInfo.qrCodeUrl} alt="QR Code per 2FA" className="w-48 h-48 mx-auto" />
                                </div>
                            </div>
                             <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">...o inserisci la chiave manualmente</p>
                                 <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md font-mono text-center text-sm">{setupInfo.secret}</div>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">2. Verifica il codice</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Inserisci il codice a 6 cifre generato dall'app per continuare.</p>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    maxLength={6}
                                    placeholder="123456"
                                    className="mt-2 w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-center text-2xl tracking-[.2em]"
                                />
                                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                            </div>
                        </main>
                         <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-bold bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Annulla</button>
                            <button onClick={handleVerifyAndShowCodes} disabled={isVerifying || code.length < 6} className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-400">
                                {isVerifying ? 'Verifica...' : 'Verifica e Continua'}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
};

const AccessLogs: React.FC<{ logs: AccessLogEntry[] }> = ({ logs }) => {
    const getMethodIcon = (method: AccessLogEntry['method']) => {
        switch (method) {
            case 'Google': return <UserCircleIcon className="w-5 h-5 text-blue-500" title="Google" />;
            case '2FA': return <ShieldCheckIcon className="w-5 h-5 text-green-500" title="2FA" />;
            case 'Recovery Code': return <ShieldCheckIcon className="w-5 h-5 text-amber-500" title="Codice di Recupero" />;
            case 'Password':
            default:
                return <UserCircleIcon className="w-5 h-5 text-slate-500" title="Password" />;
        }
    };
    
    const anonymizeIp = (ip: string) => {
        if (!ip || ip === 'N/A') return 'N/A';
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
        }
        return ip.includes(':') ? 'Indirizzo IPv6' : ip;
    };

    return (
        <div id="profile-section-access-logs" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Cronologia Accessi</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Mostra gli ultimi accessi riusciti al tuo account. Controlla questa sezione per attività sospette.</p>
            <div className="max-h-80 overflow-auto -mx-6 md:-mx-8">
                <table className="min-w-full">
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        {getMethodIcon(log.method)}
                                        <div>
                                            <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{log.method}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{log.timestamp && new Date(log.timestamp.toDate()).toLocaleString('it-CH')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <MapPinIcon className="w-4 h-4 text-slate-400" />
                                        <span>{log.location}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 ml-6 font-mono">{anonymizeIp(log.ipAddress)}</div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                                    <div title={log.userAgent} className="truncate max-w-xs">{log.userAgent}</div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-slate-500">
                                    Nessun registro accessi trovato.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const InstallHelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Come Installare l'App</h3>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XMarkIcon className="w-6 h-6 text-slate-500" /></button>
            </header>
            <main className="p-6 space-y-4">
                <p className="text-slate-600 dark:text-slate-300">L'installazione è gestita dal browser. Se il pulsante "Installa" non è attivo, ecco come procedere manualmente sui browser più comuni.</p>
                
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">Chrome / Edge (Desktop & Android)</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <li>Cerca l'icona di installazione (spesso un monitor con una freccia) nella barra degli indirizzi e cliccala.</li>
                        <li>Assicurati di non essere in modalità di navigazione in incognito.</li>
                        <li>A volte, interagire con il sito per qualche minuto e ricaricare la pagina può far apparire il prompt.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">Safari (iPhone & iPad)</h4>
                     <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <li>Tocca l'icona "Condividi" (il quadrato con la freccia verso l'alto) nella barra di navigazione in basso.</li>
                        <li>Scorri l'elenco delle opzioni e tocca "Aggiungi alla schermata Home".</li>
                        <li>Conferma il nome e l'icona per aggiungere l'app.</li>
                    </ul>
                </div>
            </main>
        </div>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, currentPage, onNavigate, settings, onUpdateSettings, onStartTutorial, archivedChats, onDeleteArchivedChat, setScanHistory, onResetChat, scrollToSection, onScrolledToSection, accessLogs }) => {
    const { user, updateUser, reauthenticate, setupCoinTransfer, deleteCurrentUserAccount, redeemCoinTransferCode } = useAuth();
    const { isInstallable, isInstalled, triggerInstall } = usePWA();
    const [isSaving, setIsSaving] = useState(false);
    const [viewingChat, setViewingChat] = useState<ArchivedChat | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [is2faSetupModalOpen, setIs2faSetupModalOpen] = useState(false);
    const [managingRecoveryCodesStep, setManagingRecoveryCodesStep] = useState<'idle' | 'password' | 'showCodes'>('idle');
    const [disabling2faStep, setDisabling2faStep] = useState<'idle' | 'password'>('idle');
    const [password, setPassword] = useState('');
    const [reauthError, setReauthError] = useState('');
    const [isReauthenticating, setIsReauthenticating] = useState(false);
    const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([]);
    const [familyIdToJoin, setFamilyIdToJoin] = useState('');
    const [inviteCopied, setInviteCopied] = useState(false);
    const [isInstallHelpModalOpen, setIsInstallHelpModalOpen] = useState(false);
    
    // State for user address
    const [address, setAddress] = useState(user?.address || '');
    const [householdMembers, setHouseholdMembers] = useState<string[]>(user?.householdMembers || []);
    const [isAddressSaving, setIsAddressSaving] = useState(false);
    const [addressSaveSuccess, setAddressSaveSuccess] = useState(false);

    // State for account deletion
    const [deleteStep, setDeleteStep] = useState<'closed' | 'confirm' | 'success'>('closed');
    const [deletePassword, setDeletePassword] = useState('');
    const [transferSecret, setTransferSecret] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [generatedTransferCode, setGeneratedTransferCode] = useState('');
    
    // NUOVO: State per il recupero coin
    const [transferCode, setTransferCode] = useState('');
    const [secretWord, setSecretWord] = useState('');
    const [redemptionMessage, setRedemptionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isRedeemingTransfer, setIsRedeemingTransfer] = useState(false);


    useEffect(() => {
        if (scrollToSection) {
            const element = document.getElementById(`profile-section-${scrollToSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight-section-animation');
                setTimeout(() => {
                    element.classList.remove('highlight-section-animation');
                    onScrolledToSection();
                }, 2500);
            } else {
                onScrolledToSection(); // Reset even if not found
            }
        }
    }, [scrollToSection, onScrolledToSection]);

    const handleAddressSave = async () => {
        if (!user || !address.trim()) return;
        setIsAddressSaving(true);
        setAddressSaveSuccess(false);
        try {
            // Confirmation logic: if at least one household member is added, the address is confirmed.
            const isConfirmed = householdMembers.length > 0;
            await updateUser({ ...user, address, householdMembers, addressConfirmed: isConfirmed });
            setAddressSaveSuccess(true);
            setTimeout(() => setAddressSaveSuccess(false), 2000);
        } catch (e) {
            console.error("Failed to save address", e);
        } finally {
            setIsAddressSaving(false);
        }
    };

    const handleMemberChange = (index: number, value: string) => {
        const newMembers = [...householdMembers];
        newMembers[index] = value;
        setHouseholdMembers(newMembers);
    };

    const addMember = () => {
        if (householdMembers.length < 5) {
            setHouseholdMembers([...householdMembers, '']);
        }
    };

    const removeMember = (index: number) => {
        setHouseholdMembers(householdMembers.filter((_, i) => i !== index));
    };


    const handleModeChange = (mode: ProcessingMode) => {
        setIsSaving(true);
        onUpdateSettings({ defaultProcessingMode: mode });
        setTimeout(() => setIsSaving(false), 300);
    };

    const handlePrimaryModeChange = (modeId: ProcessingMode, isChecked: boolean) => {
        const currentPrimary = settings.primaryModes;
        let newPrimary: ProcessingMode[];

        if (isChecked) {
            if (!currentPrimary.includes(modeId) && currentPrimary.length < 2) {
                newPrimary = [...currentPrimary, modeId];
            } else {
                return;
            }
        } else {
            if (currentPrimary.length > 1) {
                newPrimary = currentPrimary.filter(m => m !== modeId);
            } else {
                return;
            }
        }
        
        setIsSaving(true);
        onUpdateSettings({ primaryModes: newPrimary as [ProcessingMode, ProcessingMode] });
        setTimeout(() => setIsSaving(false), 300);
    };

    const handleRedeemCode = async () => {
        if (!promoCode.trim() || !user) return;
        setIsRedeeming(true);
        setPromoMessage(null);

        // Simulate API call for code validation
        await new Promise(resolve => setTimeout(resolve, 500));

        if (promoCode.toLowerCase() === 'anguilla') {
            const rewardAmount = 100;
            
            // Update user context
            updateUser(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    subscription: {
                        ...prev.subscription,
                        scanCoinBalance: prev.subscription.scanCoinBalance + rewardAmount,
                    }
                };
            });

            // Add to history
            const newHistoryEntry: ScanHistoryEntry = {
                timestamp: new Date().toISOString(),
                description: `Codice promozionale: ${promoCode}`,
                amountInCoins: rewardAmount,
                status: 'Credited',
                type: 'promo',
            };
            await firestoreService.addScanHistoryEntry(user.uid, newHistoryEntry);
            setScanHistory(prev => [newHistoryEntry, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            
            setPromoMessage({ type: 'success', text: `Successo! ${rewardAmount} ScanCoin sono stati aggiunti al tuo saldo.` });
            setPromoCode('');
        } else {
            setPromoMessage({ type: 'error', text: 'Codice non valido o scaduto.' });
        }

        setIsRedeeming(false);
    };
    
     const handle2faToggle = (enabled: boolean) => {
        if (enabled) {
            setIs2faSetupModalOpen(true);
        } else {
            setDisabling2faStep('password');
            setPassword('');
            setReauthError('');
        }
    };

    const handleActivate2fa = (secret: string, recoveryCodeHashes: string[]) => {
        updateUser(prev => prev ? { 
            ...prev, 
            is2faEnabled: true, 
            twoFactorSecret: secret,
            twoFactorRecoveryCodes: recoveryCodeHashes
        } : null);
        setIs2faSetupModalOpen(false);
    };

    const handleManageRecoveryCodes = () => {
        setManagingRecoveryCodesStep('password');
        setPassword('');
        setReauthError('');
    };

    const handleReauthenticate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setReauthError("La password è richiesta.");
            return;
        }
        setIsReauthenticating(true);
        setReauthError('');
        try {
            await reauthenticate(password);
            // Generate new codes
            const codes = Array.from({ length: 10 }, () => 
                Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
            );
            setNewRecoveryCodes(codes);
            setManagingRecoveryCodesStep('showCodes');
        } catch (err) {
            setReauthError("Password non corretta. Riprova.");
        } finally {
            setIsReauthenticating(false);
        }
    };
    
    const handleReauthenticateAndDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setReauthError("La password è richiesta.");
            return;
        }
        setIsReauthenticating(true);
        setReauthError('');
        try {
            await reauthenticate(password);
            // Re-authentication successful, now show confirmation dialog
            if (confirm("ATTENZIONE: Stai per disattivare l'autenticazione a due fattori. Questa azione ridurrà significativamente la sicurezza del tuo account. Sei sicuro di voler procedere?")) {
                await updateUser(prev => prev ? { ...prev, is2faEnabled: false, twoFactorSecret: firebase.firestore.FieldValue.delete() as any, twoFactorRecoveryCodes: [] } : null);
            }
            setDisabling2faStep('idle');
        } catch (err) {
             setReauthError("Password non corretta. Riprova.");
        } finally {
            setIsReauthenticating(false);
        }
    };

    const handleFinishRegenerate = async () => {
        const hashedCodes = await Promise.all(newRecoveryCodes.map(c => sha256(c)));
        await updateUser(prev => prev ? { 
            ...prev, 
            twoFactorRecoveryCodes: hashedCodes
        } : null);
        setManagingRecoveryCodesStep('idle');
        setNewRecoveryCodes([]);
    };


    if (!user) {
        return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    }

    const handleStartDeletionProcess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferSecret.trim()) {
            setDeleteError("La parola segreta è obbligatoria per il futuro recupero dei coin.");
            return;
        }
        setIsDeleting(true);
        setDeleteError('');
        try {
            await reauthenticate(deletePassword);
            const code = await setupCoinTransfer(transferSecret);
            setGeneratedTransferCode(code);
            setDeleteStep('success');
        } catch (err) {
            setDeleteError("Password non corretta o errore durante l'eliminazione. Riprova.");
            setDeletePassword('');
            setTransferSecret('');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFinalizeDeletion = async () => {
        setIsDeleting(true);
        try {
            await deleteCurrentUserAccount();
            // No need for further actions, onAuthStateChanged will handle the logout and UI change.
        } catch (err) {
            setDeleteError("Errore durante l'eliminazione finale dell'account. Copia il codice e riprova, o contatta il supporto.");
            setIsDeleting(false);
        }
    };
    
    const handleInstallClick = () => {
        if (isInstallable) {
            triggerInstall();
        } else if (!isInstalled) {
            setIsInstallHelpModalOpen(true);
        }
    };

    const handleCopyInvite = () => {
        if (!user || !user.familyId) return;
        const inviteLink = `${window.location.origin}?joinFamily=${user.familyId}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setInviteCopied(true);
            setTimeout(() => setInviteCopied(false), 2000);
        });
    };

    const handleJoinFamily = () => {
        if (!familyIdToJoin.trim() || !user) return;
        if (familyIdToJoin.trim() === user.familyId) {
            alert("Fai già parte di questa famiglia.");
            return;
        }
        if (confirm("Sei sicuro di voler unirti a questa famiglia? Potrai vedere i loro documenti condivisi e loro vedranno i tuoi.")) {
            updateUser(prev => prev ? ({ ...prev, familyId: familyIdToJoin.trim() }) : null);
            setFamilyIdToJoin('');
        }
    };

    const handleRedeemTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferCode.trim() || !secretWord.trim()) return;

        setIsRedeemingTransfer(true);
        setRedemptionMessage(null);
        try {
            const amount = await redeemCoinTransferCode(transferCode, secretWord);
            setRedemptionMessage({ type: 'success', text: `Successo! ${amount.toLocaleString('it-CH')} ScanCoin sono stati aggiunti al tuo saldo.` });
            setTransferCode('');
            setSecretWord('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Si è verificato un errore.';
            setRedemptionMessage({ type: 'error', text: message });
        } finally {
            setIsRedeemingTransfer(false);
        }
    };


    return (
        <>
            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Profilo e Saldo</h1>
                    <SubscriptionStatusCard subscription={user.subscription} onManagePlan={() => onNavigate('pricing')} />
                </div>

                <div id="profile-section-account" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Dettagli Account</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nome</label>
                            <p className="text-lg text-slate-800 dark:text-slate-100">{user.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                            <p className="text-lg text-slate-800 dark:text-slate-100">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div id="profile-section-address" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Indirizzo di Residenza</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Questo indirizzo verrà usato per precompilare i tuoi documenti (es. disdette) e per la sicurezza del servizio. Una volta confermato, non sarà più modificabile.</p>
                    
                    {user.addressConfirmed ? (
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700">
                            <p className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Indirizzo Confermato e Bloccato</p>
                            <div className="mt-2 text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono">{user.address}</div>
                            {user.householdMembers && user.householdMembers.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                                    <p className="text-xs font-semibold">Membri del nucleo:</p>
                                    <ul className="text-xs list-disc list-inside">
                                        {user.householdMembers.map((m, i) => <li key={i}>{m}</li>)}
                                    </ul>
                                </div>
                            )}
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">Per modificare l'indirizzo, contatta il supporto.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="user-address" className="text-sm font-medium text-slate-500 dark:text-slate-400">Il tuo indirizzo completo</label>
                                <textarea id="user-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Via Esempio 123&#10;6900 Lugano&#10;Svizzera" className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border-slate-300 dark:border-slate-600 focus:ring-purple-500 focus:border-purple-500"/>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Membri del nucleo familiare (opzionale)</label>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Aggiungendo almeno un membro, confermerai l'indirizzo per tutti. Utile per account condivisi.</p>
                                <div className="space-y-2">
                                    {householdMembers.map((member, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={member} onChange={(e) => handleMemberChange(index, e.target.value)} placeholder={`Nome e Cognome Membro ${index + 1}`} className="flex-grow p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                                            <button onClick={() => removeMember(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    ))}
                                    {householdMembers.length < 5 && (
                                        <button onClick={addMember} className="text-sm font-semibold text-purple-600 dark:text-purple-400 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-md">
                                            + Aggiungi membro
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                {addressSaveSuccess && <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Salvato!</span>}
                                {householdMembers.length > 0 ? (
                                     <button onClick={handleAddressSave} disabled={isAddressSaving || !address.trim()} className="px-4 py-2 font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center justify-center w-full sm:w-auto">
                                        {isAddressSaving ? <LoadingSpinner className="w-5 h-5" /> : 'Salva e Conferma Indirizzo'}
                                    </button>
                                ) : (
                                    <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                                        <p>Per confermare un indirizzo singolo, dovrai scansionare 5 documenti a te intestati.</p>
                                        <button disabled className="mt-2 text-slate-400 cursor-not-allowed">(Funzionalità in arrivo)</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div id="profile-section-family" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-3"><UsersIcon className="w-7 h-7" /> Gestione Famiglia</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Condividi il tuo archivio con i membri della famiglia. Tutti i documenti (eccetto quelli privati) saranno visibili agli altri membri.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Il tuo ID Famiglia</label>
                            <div className="mt-1 flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <p className="font-mono text-slate-700 dark:text-slate-200 flex-grow">{user.familyId}</p>
                                <button onClick={handleCopyInvite} className="px-3 py-1 text-sm font-semibold bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md shadow-sm">
                                    {inviteCopied ? 'Copiato!' : 'Copia Link Invito'}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Invia questo link agli altri membri per invitarli a unirsi al tuo archivio familiare.</p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <label htmlFor="join-family-id" className="text-sm font-medium text-slate-500 dark:text-slate-400">Unisciti a un'altra famiglia</label>
                            <p className="text-xs text-slate-400 mb-2">Incolla l'ID Famiglia che hai ricevuto per unirti al loro archivio.</p>
                            <div className="flex gap-2">
                                <input
                                    id="join-family-id"
                                    type="text"
                                    value={familyIdToJoin}
                                    onChange={(e) => setFamilyIdToJoin(e.target.value)}
                                    placeholder="Incolla ID Famiglia"
                                    className="flex-grow w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button onClick={handleJoinFamily} disabled={!familyIdToJoin.trim()} className="px-6 py-2 font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-400">
                                    Unisciti
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="profile-section-promo" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Codice Promozionale</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Hai un codice sconto? Inseriscilo qui per riscattare i tuoi ScanCoin.</p>

                    {promoMessage && (
                        <div className={`p-3 rounded-md text-sm mb-4 ${promoMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                            {promoMessage.text}
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Es. ANGUILLA"
                            className="flex-grow w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            disabled={isRedeeming}
                        />
                        <button
                            onClick={handleRedeemCode}
                            disabled={isRedeeming || !promoCode.trim()}
                            className="px-6 py-2 font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center w-32"
                        >
                            {isRedeeming ? <LoadingSpinner className="w-5 h-5" /> : 'Riscatta'}
                        </button>
                    </div>
                </div>
                
                 <div id="profile-section-recovery" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-3"><CoinIcon className="w-7 h-7"/> Recupero ScanCoin</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Se hai eliminato un account precedente, inserisci qui il codice di trasferimento e la parola segreta per recuperare il tuo saldo ScanCoin rimanente.</p>
                     {redemptionMessage && (
                        <div className={`p-3 rounded-md text-sm mb-4 ${redemptionMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                            {redemptionMessage.text}
                        </div>
                    )}
                    <form onSubmit={handleRedeemTransferSubmit} className="space-y-4">
                         <div className="flex flex-col sm:flex-row gap-4">
                             <div className="flex-1">
                                <label htmlFor="transfer-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Codice di Trasferimento (6 lettere)</label>
                                <input
                                    id="transfer-code"
                                    type="text"
                                    value={transferCode}
                                    onChange={(e) => setTransferCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    className="mt-1 w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg font-mono tracking-widest"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="secret-word" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Parola Segreta</label>
                                <input
                                    id="secret-word"
                                    type="password"
                                    value={secretWord}
                                    onChange={(e) => setSecretWord(e.target.value)}
                                    className="mt-1 w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isRedeemingTransfer || !transferCode.trim() || !secretWord.trim()}
                            className="w-full sm:w-auto px-6 py-2 font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-400"
                        >
                           {isRedeemingTransfer ? 'Verifica...' : 'Riscatta Coin'}
                        </button>
                    </form>
                </div>

                <div id="profile-section-preferences" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Preferenze</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Modifica le impostazioni dell'applicazione.</p>

                    {!settings ? <div className="flex justify-center p-4"><LoadingSpinner /></div> : (
                        <div className="space-y-8">
                            
                            <ThemeSelector />
                            
                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Modalità di Elaborazione Predefinita</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Scegli la modalità che verrà preselezionata all'avvio dell'app.</p>
                                    </div>
                                    {isSaving && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <LoadingSpinner className="w-4 h-4" />
                                            <span>Salvataggio...</span>
                                        </div>
                                    )}
                                </div>
                                <ProcessingModeSelector 
                                    currentMode={settings.defaultProcessingMode}
                                    onModeChange={handleModeChange}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Modalità Principali Visibili</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Scegli le due modalità da mostrare sempre per un accesso rapido.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {allModesInfo.map(mode => {
                                        const isChecked = settings.primaryModes.includes(mode.id);
                                        const isDisabled = !isChecked && settings.primaryModes.length >= 2;
                                        return (
                                            <label key={mode.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${isChecked ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onChange={(e) => handlePrimaryModeChange(mode.id, e.target.checked)}
                                                    className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{mode.title}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Automazioni</h3>
                                <label className="mt-4 flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                                    <div className="flex-grow">
                                        <span className="font-semibold text-slate-800 dark:text-slate-100">Archiviazione Automatica</span>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Una volta terminata l'elaborazione, sposta automaticamente i fascicoli sicuri dall'area di lavoro al modulo di destinazione corretto (es. Archivio, Polizze).
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.autoArchiveDocuments}
                                        onChange={(e) => onUpdateSettings({ autoArchiveDocuments: e.target.checked })}
                                        className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                    />
                                </label>
                            </div>
                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Funzionalità Offline</h3>
                                <label className="mt-4 flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                                    <div className="flex-grow">
                                        <span className="font-semibold text-slate-800 dark:text-slate-100">Abilita Fallback Offline</span>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            In caso di assenza di connessione, l'app userà un motore di analisi locale meno preciso per continuare a lavorare. L'elaborazione userà le risorse del tuo dispositivo e non consumerà ScanCoin.
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.enableOfflineFallback}
                                        onChange={(e) => onUpdateSettings({ enableOfflineFallback: e.target.checked })}
                                        className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div id="profile-section-app" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Applicazione</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Installa l'app sul tuo dispositivo per un accesso più rapido e funzionalità offline.</p>
                    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">Installa Progressive Web App (PWA)</span>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Aggiungi scansioni.ch alla tua schermata principale per un'esperienza simile a un'app nativa.
                            </p>
                        </div>
                        <button
                            onClick={handleInstallClick}
                            disabled={isInstalled}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors flex-shrink-0 ${
                                isInstalled 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 cursor-default'
                                    : isInstallable
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                        >
                            {isInstalled ? <CheckCircleIcon className="w-5 h-5" /> : (isInstallable ? <DownloadIcon className="w-5 h-5" /> : <QuestionMarkCircleIcon className="w-5 h-5" />)}
                            {isInstalled ? 'App Installata' : (isInstallable ? 'Installa App' : 'Come installare?')}
                        </button>
                    </div>
                </div>

                 <div id="profile-section-security" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Sicurezza</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Gestisci le impostazioni di sicurezza del tuo account.</p>

                     <div className="space-y-4">
                        <label className="flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                            <div className="flex-grow">
                                <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"><ClockIcon className="w-5 h-5"/> Logout Automatico per Inattività</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Esegui automaticamente il logout dopo un periodo di inattività per proteggere il tuo account.
                                </p>
                            </div>
                             <input
                                type="checkbox"
                                checked={settings.autoLogoutEnabled}
                                onChange={(e) => onUpdateSettings({ autoLogoutEnabled: e.target.checked })}
                                className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                            />
                        </label>
                        {settings.autoLogoutEnabled && (
                            <div className="pl-6">
                                <label htmlFor="logout-minutes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Durata inattività (minuti)</label>
                                <select
                                    id="logout-minutes"
                                    value={settings.autoLogoutMinutes}
                                    onChange={(e) => onUpdateSettings({ autoLogoutMinutes: parseInt(e.target.value, 10) })}
                                    className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-slate-700"
                                >
                                    <option value="5">5 minuti</option>
                                    <option value="10">10 minuti</option>
                                    <option value="15">15 minuti</option>
                                    <option value="30">30 minuti</option>
                                    <option value="60">1 ora</option>
                                </select>
                            </div>
                        )}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                             <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                                <div className="flex items-start">
                                    <div className="flex-grow">
                                        <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                            <ShieldCheckIcon className="w-5 h-5"/> Autenticazione a Due Fattori (2FA)
                                        </span>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                           {user.is2faEnabled 
                                                ? '2FA è attivo. Il tuo account è più sicuro.'
                                                : "Aggiungi un ulteriore livello di sicurezza al tuo account richiedendo un codice di verifica da un'app di autenticazione al login."
                                           }
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={user.is2faEnabled || false}
                                        onChange={(e) => handle2faToggle(e.target.checked)}
                                        className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                    />
                                </div>
                                {user.is2faEnabled && (
                                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                                        <button onClick={handleManageRecoveryCodes} className="w-full text-left font-semibold text-slate-700 dark:text-slate-200 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                            Gestisci codici di recupero
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                           <AccessLogs logs={accessLogs} />
                        </div>
                    </div>
                </div>

                 <div id="profile-section-chatbot" className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Assistente Ugo</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Personalizza il comportamento dell'assistente AI.</p>
                     <div className="space-y-4">
                        <label className="flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                            <div className="flex-grow">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">Assistenza Proattiva</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Consenti a Ugo di avviare una conversazione quando rileva un problema o un'opportunità, come documenti non sicuri o un saldo ScanCoin basso.
                                </p>
                            </div>
                             <input
                                type="checkbox"
                                checked={settings.chatbotProactiveAssist}
                                onChange={(e) => onUpdateSettings({ chatbotProactiveAssist: e.target.checked })}
                                className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                            />
                        </label>
                         <label className="flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                            <div className="flex-grow">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">Consapevolezza del Contesto</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Consenti a Ugo di accedere a un riassunto anonimo dei tuoi documenti nell'area di lavoro per fornire risposte più precise e contestuali.
                                </p>
                            </div>
                             <input
                                type="checkbox"
                                checked={settings.ugoContextAwarenessEnabled}
                                onChange={(e) => onUpdateSettings({ ugoContextAwarenessEnabled: e.target.checked })}
                                className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                            />
                        </label>
                        <label className="flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                            <div className="flex-grow">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">Archiviazione via Chat</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Consenti a Ugo di archiviare i documenti per te. Puoi dire "archivia la fattura E-Corp".
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.ugoArchivioEnabled}
                                onChange={(e) => onUpdateSettings({ ugoArchivioEnabled: e.target.checked })}
                                className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                            />
                        </label>
                        <label className="flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                            <div className="flex-grow">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">Creazione Disdette via Chat</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Permetti a Ugo di avviare la creazione di lettere di disdetta. Puoi dire "prepara una disdetta per il mio abbonamento in palestra".
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.ugoDisdetteEnabled}
                                onChange={(e) => onUpdateSettings({ ugoDisdetteEnabled: e.target.checked })}
                                className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                            />
                        </label>
                        <label className="flex items-start p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer">
                            <div className="flex-grow">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">Feedback Implicito</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Consenti a Ugo di analizzare le tue conversazioni per rilevare automaticamente lamentele o frustrazioni. Se viene rilevato un problema, Ugo potrebbe offrirti un piccolo rimborso in ScanCoin e segnalare il problema per aiutarci a migliorare.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.ugoImplicitFeedbackEnabled}
                                onChange={(e) => onUpdateSettings({ ugoImplicitFeedbackEnabled: e.target.checked })}
                                className="flex-shrink-0 mt-1 ml-4 h-6 w-6 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                            />
                        </label>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                             <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Archivio Chat</h3>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Rivedi le tue conversazioni passate con Ugo.</p>
                             <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                {archivedChats.length > 0 ? archivedChats.map(chat => (
                                    <div key={chat.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-slate-500" />
                                            <div>
                                                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">Chat del {new Date(chat.timestamp).toLocaleString('it-CH')}</p>
                                                <p className="text-xs text-slate-500">{chat.history.length} messaggi</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setViewingChat(chat)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><EyeIcon className="w-5 h-5 text-slate-500"/></button>
                                            <button onClick={() => onDeleteArchivedChat(chat.id!)} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-slate-500 text-center py-4">Nessuna chat archiviata.</p>}
                             </div>
                             <button onClick={onResetChat} className="mt-4 w-full text-center text-sm font-semibold text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50">
                                Resetta Cronologia Chat Corrente
                            </button>
                        </div>
                    </div>
                </div>

                <div id="profile-section-danger" className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg p-6 md:p-8 border border-red-300 dark:border-red-800">
                     <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">Zona Pericolo</h2>
                     <p className="text-sm text-red-700 dark:text-red-300 mb-6">Azioni irreversibili. Procedere con cautela.</p>
                     <div className="space-y-4">
                        <button onClick={onStartTutorial} className="w-full text-left font-semibold text-blue-700 dark:text-blue-300 p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50">
                            Riavvia il tour guidato
                        </button>
                        <button onClick={() => setDeleteStep('confirm')} className="w-full text-left font-semibold text-red-700 dark:text-red-300 p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50">
                            Elimina Account e Dati
                        </button>
                     </div>
                </div>
            </div>
            {viewingChat && <ArchivedChatModal chat={viewingChat} onClose={() => setViewingChat(null)} />}
            {isInstallHelpModalOpen && <InstallHelpModal onClose={() => setIsInstallHelpModalOpen(false)} />}
            {is2faSetupModalOpen && user && <TwoFactorAuthSetupModal userEmail={user.email} onClose={() => setIs2faSetupModalOpen(false)} onActivate={handleActivate2fa} />}
            
            {managingRecoveryCodesStep !== 'idle' && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
                        <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                                {managingRecoveryCodesStep === 'password' ? 'Verifica la tua identità' : 'Nuovi Codici di Recupero'}
                            </h3>
                        </header>
                         {managingRecoveryCodesStep === 'password' ? (
                            <form onSubmit={handleReauthenticate} className="p-6 space-y-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Per sicurezza, inserisci di nuovo la tua password per continuare.</p>
                                <div>
                                    <label htmlFor="reauth-password">Password</label>
                                    <input
                                        id="reauth-password"
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                                    />
                                    {reauthError && <p className="text-sm text-red-500 mt-1">{reauthError}</p>}
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setManagingRecoveryCodesStep('idle')} className="px-4 py-2 text-sm font-bold bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg">Annulla</button>
                                    <button type="submit" disabled={isReauthenticating} className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg disabled:bg-slate-400">
                                        {isReauthenticating ? 'Verifica...' : 'Continua'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <RecoveryCodesView codes={newRecoveryCodes} onFinish={handleFinishRegenerate} />
                        )}
                    </div>
                </div>
            )}
            
            {disabling2faStep === 'password' && (
                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
                        <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Disattiva 2FA</h3>
                        </header>
                        <form onSubmit={handleReauthenticateAndDisable2FA} className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Per disattivare l'autenticazione a due fattori, inserisci la tua password per confermare la tua identità.</p>
                            <div>
                                <label htmlFor="disable-2fa-password">Password</label>
                                <input
                                    id="disable-2fa-password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                                    required
                                />
                                {reauthError && <p className="text-sm text-red-500 mt-1">{reauthError}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setDisabling2faStep('idle')} className="px-4 py-2 text-sm font-bold bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg">Annulla</button>
                                <button type="submit" disabled={isReauthenticating} className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg disabled:bg-slate-400">
                                    {isReauthenticating ? 'Verifica...' : 'Disattiva 2FA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteStep !== 'closed' && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteStep('closed')}>
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        {deleteStep === 'confirm' ? (
                            <form onSubmit={handleStartDeletionProcess}>
                                <div className="p-6">
                                    <div className="text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                            <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">Elimina Account</h3>
                                    </div>
                                    <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 space-y-2">
                                        <p>Questa azione è <strong className="text-red-600">irreversibile</strong> e tutti i tuoi dati verranno eliminati.</p>
                                        <p>I tuoi ScanCoin rimanenti (<strong className="text-purple-600">{user.subscription.scanCoinBalance}</strong>) non sono rimborsabili in denaro. Tuttavia, puoi trasferirli a un nuovo account creato da te. Per farlo, ti forniremo un codice di trasferimento dopo l'eliminazione.</p>
                                        <p className="font-semibold">I coin non possono essere trasferiti a terzi per motivi legali.</p>
                                    </div>
                                    <div className="mt-5 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conferma la tua password</label>
                                            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required autoFocus />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Crea una parola segreta</label>
                                             <p className="text-xs text-slate-500 dark:text-slate-400">Servirà, insieme al codice, per sbloccare i coin sul tuo nuovo account.</p>
                                            <input type="text" value={transferSecret} onChange={(e) => setTransferSecret(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required />
                                        </div>
                                        {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-2xl">
                                    <button type="button" onClick={() => setDeleteStep('closed')} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md">Annulla</button>
                                    <button type="submit" disabled={isDeleting} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-slate-400">
                                        {isDeleting ? 'Preparazione...' : 'Conferma e Visualizza Codice'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                             <div className="p-6 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                    <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">Passo Finale: Salva il tuo Codice</h3>
                                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 space-y-3">
                                    <p>Il tuo account sta per essere eliminato. Salva queste informazioni in un luogo sicuro per poter recuperare i tuoi ScanCoin in futuro.</p>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                                        <p className="font-semibold">Salva queste informazioni per recuperare i tuoi ScanCoin:</p>
                                        <p className="mt-2">Il tuo codice di trasferimento è:</p>
                                        <p className="text-2xl font-bold tracking-widest text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 p-2 rounded-md my-2">{generatedTransferCode}</p>
                                        <p>Ricorda anche la <strong>parola segreta</strong> che hai impostato. Ti verranno chiesti entrambi al momento della registrazione di un nuovo account.</p>
                                    </div>
                                    {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
                                </div>
                                <button onClick={handleFinalizeDeletion} disabled={isDeleting} className="mt-6 w-full px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-slate-400">
                                    {isDeleting ? 'Eliminazione...' : "Ho salvato il codice, elimina l'account"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;
