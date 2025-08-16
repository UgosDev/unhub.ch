import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon, HandThumbUpIcon, HandThumbDownIcon, DocumentDuplicateIcon, CogIcon } from './icons';

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isFeedbackRequest?: boolean;
    quickReplies?: string[];
    feedback?: 'good' | 'bad';
    richContent?: {
        type: 'image';
        url: string;
        alt: string;
    };
    originalUserQuery?: string;
    context?: any;
}

interface ChatbotProps {
    history: ChatMessage[];
    isLoading: boolean;
    onClose: () => void;
    onSendMessage: (message: string) => void;
    onUpdateHistory: (updater: React.SetStateAction<ChatMessage[]>) => void;
    onFeedbackResponse: (feedback: 'good' | 'bad') => void;
    onArchive: () => void;
    onNavigateToSettings: () => void;
}

const RATE_LIMIT_COUNT = 5; // Max messaggi
const RATE_LIMIT_WINDOW = 10000; // in 10 secondi (ms)

export const Chatbot: React.FC<ChatbotProps> = ({ history, isLoading, onClose, onSendMessage, onUpdateHistory, onFeedbackResponse, onArchive, onNavigateToSettings }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
    const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

    const inactivityTimerRef = useRef<number | null>(null);
    const autoCloseTimerRef = useRef<number | null>(null);

    const startTimers = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);

        inactivityTimerRef.current = window.setTimeout(() => {
            onUpdateHistory(prev => {
                if(prev.some(p=> p.isFeedbackRequest)) return prev;
                return [...prev, {
                    role: 'model',
                    text: 'Spero di esserti stato d\'aiuto! C\'è altro che posso fare?',
                    isFeedbackRequest: true,
                }]
            });

            autoCloseTimerRef.current = window.setTimeout(() => {
                onClose();
            }, 10000); // 10 seconds to auto-close
        }, 30000); // 30 seconds of inactivity
    }, [onClose, onUpdateHistory]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if(!isLoading) {
            startTimers();
        }
    }, [history, isLoading, startTimers]);

    const handleSendMessage = () => {
        const trimmedInput = input.trim();
        if (trimmedInput) {
            // Rate limiting logic
            const now = Date.now();
            const recentTimestamps = messageTimestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
            if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
                setRateLimitCooldown(10); // Cooldown in seconds
                const interval = setInterval(() => {
                    setRateLimitCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                return;
            }
            setMessageTimestamps([...recentTimestamps, now]);

            onSendMessage(trimmedInput);
            setInput('');
            startTimers(); // Reset inactivity timer on send
        }
    };

    const handleQuickReply = (text: string) => {
        onSendMessage(text);
        startTimers();
    };
    
    const handleFeedback = (feedback: 'good' | 'bad') => {
        onFeedbackResponse(feedback);
        // La logica che rimuove il prompt è ora gestita in App.tsx
    };

    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div
            className="fixed bottom-24 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-40 border border-slate-200 dark:border-slate-700"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-title"
        >
            <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h2 id="chatbot-title" className="font-bold text-lg text-slate-800 dark:text-slate-100">Assistente Ugo</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onNavigateToSettings} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Impostazioni Chatbot">
                        <CogIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    <button onClick={onArchive} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Archivia Chat">
                        <DocumentDuplicateIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Chiudi chat">
                        <XMarkIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900/50">
                {history.map((msg, index) => (
                    <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />}
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm break-words ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
                            {renderMarkdown(msg.text)}
                            {msg.isFeedbackRequest && !msg.context && (
                                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2">
                                    <button onClick={() => handleFeedback('good')} className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 text-slate-500 hover:text-green-600 transition-colors">
                                        <HandThumbUpIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleFeedback('bad')} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-500 hover:text-red-600 transition-colors">
                                        <HandThumbDownIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            {msg.quickReplies && msg.quickReplies.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600 flex flex-wrap gap-2">
                                    {msg.quickReplies.map((reply, i) => (
                                        <button key={i} onClick={() => handleQuickReply(reply)} className="px-3 py-1 bg-white dark:bg-slate-600 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full border border-slate-200 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-500">
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex gap-3 items-start justify-start">
                        <SparklesIcon className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                        <div className="max-w-[85%] p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center">
                            <div className="dot-flashing"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder={rateLimitCooldown > 0 ? `Attendi ${rateLimitCooldown}s...` : "Scrivi un messaggio..."}
                        className="flex-grow w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isLoading || rateLimitCooldown > 0}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim() || rateLimitCooldown > 0}
                        className="w-10 h-10 flex-shrink-0 bg-purple-600 text-white rounded-full flex items-center justify-center disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
                        aria-label="Invia messaggio"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};