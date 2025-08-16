import React, { useState, useEffect } from 'react';
import type { ProcessingMode } from '../services/geminiService';
import { 
    XMarkIcon, EnvelopeIcon, PaperAirplaneIcon, ClockIcon, CheckCircleIcon, XCircleIcon, SparklesIcon,
    BoltIcon, BuildingOffice2Icon, BookOpenIcon, InformationCircleIcon, ClipboardDocumentCheckIcon, TrashIcon
} from './icons';

// --- TIPI E DATI MOCK ---
type SenderStatus = 'new' | 'whitelisted';
type ProcessingState = 'awaiting_approval' | 'awaiting_mode_selection' | 'auto_processing' | 'processed';

interface WhitelistEntry {
    email: string;
    defaultMode: ProcessingMode;
    autoProcess: boolean;
}

interface Attachment {
    name: string;
    type: 'pdf' | 'jpg' | 'png';
    file: File;
}

interface IncomingEmail {
    id: number;
    from: string;
    subject: string;
    attachments: Attachment[];
    status: SenderStatus;
    processingState: ProcessingState;
}

const mockAttachments = {
    pdf: new File([""], "fattura.pdf", { type: "application/pdf" }),
    jpg: new File([""], "ricevuta.jpg", { type: "image/jpeg" }),
    png: new File([""], "documento.png", { type: "image/png" }),
};

const MOCK_EMAILS: IncomingEmail[] = [
    { 
        id: 1, 
        from: 'contabilita@e-corp.com', 
        subject: 'Fattura Q3 2024', 
        attachments: [
            { name: 'Fattura_ECORP_Q3.pdf', type: 'pdf', file: mockAttachments.pdf }
        ], 
        status: 'new', 
        processingState: 'awaiting_approval' 
    },
    { 
        id: 2, 
        from: 'mario.rossi@personale.ch', 
        subject: 'Documenti assicurazione', 
        attachments: [{ name: 'Polizza_auto.jpg', type: 'jpg', file: mockAttachments.jpg }], 
        status: 'whitelisted', 
        processingState: 'awaiting_mode_selection' 
    },
     { 
        id: 3, 
        from: 'automatico@fornitore.ch', 
        subject: 'Bollettino Mensile', 
        attachments: [{ name: 'bollettino_sett.png', type: 'png', file: mockAttachments.png }], 
        status: 'whitelisted', 
        processingState: 'auto_processing' 
    },
];

const MOCK_WHITELIST: WhitelistEntry[] = [
    { email: 'mario.rossi@personale.ch', defaultMode: 'quality', autoProcess: false },
    { email: 'automatico@fornitore.ch', defaultMode: 'business', autoProcess: true },
];

const SCAN_MODES: { id: ProcessingMode, title: string, Icon: React.FC<any> }[] = [
    { id: 'quality', title: 'Chroma Scan', Icon: SparklesIcon },
    { id: 'speed', title: 'Quick Scan', Icon: BoltIcon },
    { id: 'business', title: 'Batch Scan', Icon: BuildingOffice2Icon },
    { id: 'book', title: 'Deep Scan', Icon: BookOpenIcon },
];

// --- COMPONENTI ---

const EmailCard: React.FC<{
    email: IncomingEmail;
    whitelist: WhitelistEntry[];
    onApprove: (emailId: number, from: string) => void;
    onProcess: (emailId: number, attachments: File[], mode: ProcessingMode) => void;
}> = ({ email, whitelist, onApprove, onProcess }) => {
    
    const rule = whitelist.find(r => r.email === email.from);
    
    return (
        <div className="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{email.from}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{email.subject}</p>
                </div>
                {email.processingState === 'awaiting_approval' && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Nuovo Mittente</span>
                )}
                 {email.processingState === 'processed' && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Elaborato</span>
                )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Allegati ({email.attachments.length}):</p>
                <ul className="space-y-1">
                    {email.attachments.map((att, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-200 truncate">{att.name}</li>
                    ))}
                </ul>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                {email.processingState === 'awaiting_approval' && (
                     <div className="space-y-2">
                         <p className="text-sm font-semibold text-center text-slate-600 dark:text-slate-300 mb-2">Vuoi ricevere documenti da questo mittente?</p>
                         <div className="flex justify-center gap-2">
                            <button onClick={() => onApprove(email.id, email.from)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md hover:bg-green-200">
                                <CheckCircleIcon className="w-5 h-5"/> Approva Mittente
                            </button>
                        </div>
                    </div>
                )}
                {email.processingState === 'awaiting_mode_selection' && rule && (
                     <div className="space-y-2">
                        <button onClick={() => onProcess(email.id, email.attachments.map(a => a.file), rule.defaultMode)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-md hover:bg-purple-200">
                            <PaperAirplaneIcon className="w-5 h-5"/> Elabora con {SCAN_MODES.find(m => m.id === rule.defaultMode)?.title || 'Default'}
                        </button>
                         <p className="text-xs text-center text-slate-400">Puoi cambiare la modalità predefinita nella scheda "Whitelist".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const WhitelistManager: React.FC<{
    whitelist: WhitelistEntry[],
    onUpdateRule: (email: string, newRule: Partial<WhitelistEntry>) => void;
    onRemove: (email: string) => void;
}> = ({ whitelist, onUpdateRule, onRemove }) => {
    return (
        <div className="space-y-3">
             {whitelist.map(rule => (
                <div key={rule.email} className="bg-white dark:bg-slate-700/50 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 flex-grow truncate">{rule.email}</p>
                    <div className="flex items-center gap-2">
                        <select
                            value={rule.defaultMode}
                            onChange={(e) => onUpdateRule(rule.email, { defaultMode: e.target.value as ProcessingMode })}
                            className="text-sm bg-slate-100 dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded-md py-1"
                        >
                            {SCAN_MODES.map(mode => <option key={mode.id} value={mode.id}>{mode.title}</option>)}
                        </select>
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.autoProcess}
                                onChange={(e) => onUpdateRule(rule.email, { autoProcess: e.target.checked })}
                                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            Auto
                        </label>
                        <button onClick={() => onRemove(rule.email)} className="p-1.5 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const EmailImportView: React.FC<{
  onQueueFiles: (files: File[], mode: ProcessingMode) => void;
  onClose: () => void;
}> = ({ onQueueFiles, onClose }) => {
    const [emails, setEmails] = useState<IncomingEmail[]>([]);
    const [whitelist, setWhitelist] = useState<WhitelistEntry[]>(MOCK_WHITELIST);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [activeView, setActiveView] = useState<'inbox' | 'whitelist'>('inbox');

    useEffect(() => {
        const interval = setInterval(() => {
            const newEmails = MOCK_EMAILS.filter(me => !emails.some(e => e.id === me.id));
            if (newEmails.length > 0) {
                 const updatedEmails = newEmails.map(email => {
                    const rule = whitelist.find(r => r.email === email.from);
                    if (rule) {
                        return { ...email, status: 'whitelisted' as const, processingState: rule.autoProcess ? 'auto_processing' as const : 'awaiting_mode_selection' as const };
                    }
                    return email;
                });
                setEmails(prev => [...prev, ...updatedEmails]);
            }
        }, 5000); // Check for new emails every 5 seconds

        return () => clearInterval(interval);
    }, [emails, whitelist]);
    
    useEffect(() => {
        const autoProcessable = emails.filter(e => e.processingState === 'auto_processing');
        if (autoProcessable.length > 0) {
            autoProcessable.forEach(email => {
                const rule = whitelist.find(r => r.email === email.from);
                if (rule) {
                    onQueueFiles(email.attachments.map(a => a.file), rule.defaultMode);
                    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, processingState: 'processed' } : e));
                }
            });
        }
    }, [emails, whitelist, onQueueFiles]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleApprove = (emailId: number, from: string) => {
        const newRule: WhitelistEntry = { email: from, defaultMode: 'quality', autoProcess: false };
        setWhitelist(prev => [...prev, newRule]);
        setEmails(prev => prev.map(e => e.id === emailId ? { ...e, status: 'whitelisted', processingState: 'awaiting_mode_selection' } : e));
    };

    const handleProcess = (emailId: number, attachments: File[], mode: ProcessingMode) => {
        onQueueFiles(attachments, mode);
        setEmails(prev => prev.map(e => e.id === emailId ? { ...e, processingState: 'processed' } : e));
    };
    
    const handleUpdateRule = (email: string, newRule: Partial<WhitelistEntry>) => {
        setWhitelist(prev => prev.map(r => r.email === email ? { ...r, ...newRule } : r));
    };
    
    const handleRemoveFromWhitelist = (email: string) => {
        setWhitelist(prev => prev.filter(r => r.email !== email));
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const tempEmail = `utente.a7b3c9@scan.scansioni.ch`;

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-50 dark:bg-slate-800 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col">
                <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Importa via Email</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XMarkIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </header>
                
                <div className="p-4 flex-shrink-0 space-y-3">
                    <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Invia documenti a questo indirizzo:</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                             <p className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{tempEmail}</p>
                             <button onClick={() => navigator.clipboard.writeText(tempEmail)} className="px-2 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-md">Copia</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        <ClockIcon className="w-5 h-5" />
                        <span>La sessione scade tra: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
                    </div>
                </div>

                <div className="px-4 flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex gap-4">
                        <button onClick={() => setActiveView('inbox')} className={`py-2 font-semibold border-b-2 ${activeView === 'inbox' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500'}`}>Posta in Arrivo</button>
                        <button onClick={() => setActiveView('whitelist')} className={`py-2 font-semibold border-b-2 ${activeView === 'whitelist' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500'}`}>Whitelist</button>
                    </div>
                </div>

                <main className="flex-grow p-4 overflow-y-auto bg-slate-100 dark:bg-slate-900/50">
                    {activeView === 'inbox' && (
                        <div className="space-y-4">
                            {emails.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="font-semibold text-slate-600 dark:text-slate-300">In attesa di documenti...</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Invia una mail con allegati (PDF, JPG, PNG).</p>
                                </div>
                            ) : (
                                emails.map(email => (
                                    <EmailCard key={email.id} email={email} whitelist={whitelist} onApprove={handleApprove} onProcess={handleProcess} />
                                ))
                            )}
                        </div>
                    )}
                    {activeView === 'whitelist' && (
                        <WhitelistManager whitelist={whitelist} onUpdateRule={handleUpdateRule} onRemove={handleRemoveFromWhitelist} />
                    )}
                </main>
                
                <footer className="p-4 flex-shrink-0 border-t border-slate-200 dark:border-slate-700 text-center">
                     <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>Questa è una simulazione. La funzionalità richiede un backend.</span>
                    </p>
                </footer>
            </div>
        </div>
    );
};