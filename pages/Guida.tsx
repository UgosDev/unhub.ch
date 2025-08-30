import React, { useState, useMemo } from 'react';
import { getFaqData } from '../services/faqData';
import { MagnifyingGlassIcon, ChevronDownIcon, ChatBubbleLeftRightIcon } from '../components/icons';

interface GuidaProps {
    onAskUgo: (query: string) => void;
}

const FaqItem: React.FC<{
    item: ReturnType<typeof getFaqData>[0];
    isOpen: boolean;
    onToggle: () => void;
}> = ({ item, isOpen, onToggle }) => {
    const { Icon, question, answer } = item;
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center text-left p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                    <Icon className="w-7 h-7 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{question}</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
                <div className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-5 text-slate-600 dark:text-slate-300">
                        <div className="pl-11">{answer()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Guida: React.FC<GuidaProps> = ({ onAskUgo }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openId, setOpenId] = useState<number | null>(null);

    const faqItems = useMemo(() => getFaqData(), []);

    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return faqItems;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return faqItems.filter(
            item =>
                item.question.toLowerCase().includes(lowerCaseQuery) ||
                item.searchText.toLowerCase().includes(lowerCaseQuery)
        );
    }, [searchQuery, faqItems]);

    const handleToggle = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-center mb-2 text-slate-900 dark:text-slate-100">Centro di Supporto</h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                Trova risposte rapide alle domande più comuni.
            </p>

            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="search"
                    placeholder="Cerca una domanda (es. 'ScanCoin', 'fascicoli')..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-base bg-slate-100 dark:bg-slate-700 rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {filteredFaqs.map(item => (
                    <FaqItem
                        key={item.id}
                        item={item}
                        isOpen={openId === item.id}
                        onToggle={() => handleToggle(item.id)}
                    />
                ))}
                
                {searchQuery.trim() !== '' && (
                    <div className={filteredFaqs.length > 0 ? "border-t border-slate-200 dark:border-slate-700" : ""}>
                        <button
                            onClick={() => onAskUgo(searchQuery)}
                            className="w-full flex justify-between items-center text-left p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                            aria-label={`Chiedi a Ugo: ${searchQuery}`}
                        >
                            <div className="flex items-center gap-4">
                                <MagnifyingGlassIcon className="w-7 h-7 text-slate-400 flex-shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{searchQuery}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-semibold">
                                <span>Chiedi a Ugo</span>
                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            </div>
                        </button>
                    </div>
                )}
                
                {filteredFaqs.length === 0 && searchQuery.trim() === '' && (
                    <p className="p-8 text-center text-slate-500">Nessuna domanda frequente disponibile.</p>
                )}
            </div>
        </div>
    );
};

export default Guida;