import React, { useState, useMemo, useEffect } from 'react';
import type { ProcessedPageResult } from '../services/geminiService';
import { performSemanticSearch } from '../services/geminiService';
import { 
    ArchivioChLogoIcon, ArchivioChWordmarkIcon, DocumentTextIcon, LockClosedIcon, 
    MagnifyingGlassIcon, XCircleIcon, TagIcon, EyeIcon, ArrowPathIcon, TrashIcon,
    Bars3Icon, XMarkIcon
} from '../components/icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ListContextMenu, type ContextMenuAction } from '../components/ListContextMenu';

interface ArchivioProps {
    archivedDocs: ProcessedPageResult[];
    onMoveDocument: (doc: ProcessedPageResult) => void;
    onDeleteDocument: (doc: ProcessedPageResult) => void;
}

const DetailModal: React.FC<{ doc: ProcessedPageResult; onClose: () => void }> = ({ doc, onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{doc.analysis.soggetto}</h3>
                <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500"/></button>
            </header>
            <main className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center justify-center p-2">
                    <img src={doc.processedImageDataUrl} alt="Documento" className="max-w-full max-h-full object-contain"/>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Riassunto</label>
                        <p>{doc.analysis.riassunto}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Dati Estratti</label>
                        <div className="text-sm space-y-1 mt-1">
                            {doc.analysis.datiEstratti.map((d: any) => <p key={d.chiave}><strong>{d.chiave}:</strong> {d.valore}</p>)}
                        </div>
                    </div>
                     {doc.tags && doc.tags.length > 0 && (
                        <div>
                             <label className="text-xs font-semibold text-slate-500">Tags</label>
                             <div className="flex flex-wrap gap-1.5 mt-1">
                                {doc.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full">{tag}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
);


const ArchivedItem: React.FC<{ 
    item: ProcessedPageResult, 
    onView: () => void,
    onContextMenu: (e: React.MouseEvent, doc: ProcessedPageResult) => void 
}> = ({ item, onView, onContextMenu }) => (
    <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col gap-3 transition-transform transform hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        onClick={onView}
        onContextMenu={(e) => onContextMenu(e, item)}
    >
        <div className="flex items-start gap-4">
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                    {item.isPrivate && <LockClosedIcon className="w-4 h-4 text-slate-500 flex-shrink-0" title="Questo documento è privato"/>}
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{item.analysis.soggetto}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{item.analysis.riassunto}</p>
                {!item.isPrivate && item.ownerName ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Aggiunto da: <span className="font-semibold">{item.ownerName}</span></p>
                ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 truncate">{new Date(item.timestamp).toLocaleDateString('it-CH')}</p>
                )}
            </div>
        </div>
        {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full">{tag}</span>
                ))}
            </div>
        )}
    </div>
);

const Pagination: React.FC<{ currentPage: number, totalPages: number, onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center items-center gap-2 mt-6">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md disabled:opacity-50">Indietro</button>
        <span className="text-sm text-slate-500">Pagina {currentPage} di {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md disabled:opacity-50">Avanti</button>
    </div>
);


const Archivio: React.FC<ArchivioProps> = ({ archivedDocs, onMoveDocument, onDeleteDocument }) => {
    const [view, setView] = useState<'family' | 'private'>('family');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ProcessedPageResult[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    
    // --- Nuovi stati ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDoc, setSelectedDoc] = useState<ProcessedPageResult | null>(null);
    const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; targetDoc: ProcessedPageResult | null }>({ isOpen: false, position: { x: 0, y: 0 }, targetDoc: null });

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        // Reset pagination when filters change
        setCurrentPage(1);
    }, [view, selectedTag, searchResults]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchError(null);
        setSearchResults(null);
        try {
            const results = await performSemanticSearch(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error("Errore durante la ricerca semantica:", error);
            setSearchError("Si è verificato un errore durante la ricerca. Riprova.");
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        setSearchError(null);
    };
    
    const familyDocs = useMemo(() => archivedDocs.filter(doc => !doc.isPrivate), [archivedDocs]);
    const privateDocs = useMemo(() => archivedDocs.filter(doc => doc.isPrivate), [archivedDocs]);

    const isShowingSearchResults = searchResults !== null;
    const docsForCurrentView = isShowingSearchResults ? searchResults : (view === 'family' ? familyDocs : privateDocs);
    
    const allTags = useMemo(() => {
        const tagCounts = new Map<string, number>();
        (view === 'family' ? familyDocs : privateDocs).forEach(doc => {
            doc.tags?.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });
        return Array.from(tagCounts.entries()).sort((a,b) => b[1] - a[1]);
    }, [familyDocs, privateDocs, view]);

    const filteredDocs = useMemo(() => {
        if (!selectedTag) return docsForCurrentView;
        return docsForCurrentView.filter(doc => doc.tags?.includes(selectedTag));
    }, [docsForCurrentView, selectedTag]);
    
    const paginatedDocs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredDocs.slice(start, end);
    }, [filteredDocs, currentPage]);

    const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);

    const handleViewChange = (newView: 'family' | 'private') => {
        setView(newView);
        setSelectedTag(null);
        clearSearch();
    };

    const handleContextMenu = (e: React.MouseEvent, doc: ProcessedPageResult) => {
        e.preventDefault();
        setContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, targetDoc: doc });
    };

    const contextMenuActions = useMemo((): ContextMenuAction[] => {
        if (!contextMenu.targetDoc) return [];
        return [
            { label: 'Apri Dettagli', icon: <EyeIcon className="w-5 h-5"/>, handler: () => setSelectedDoc(contextMenu.targetDoc) },
            { type: 'separator' },
            { 
                label: `Sposta in Archivio ${contextMenu.targetDoc.isPrivate ? 'Familiare' : 'Privato'}`, 
                icon: <ArrowPathIcon className="w-5 h-5"/>, 
                handler: () => onMoveDocument(contextMenu.targetDoc!)
            },
            { label: 'Elimina Documento', icon: <TrashIcon className="w-5 h-5"/>, handler: () => onDeleteDocument(contextMenu.targetDoc!) }
        ];
    }, [contextMenu.targetDoc, onMoveDocument, onDeleteDocument]);
    
    const SidebarContent = () => (
        <>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                <TagIcon className="w-5 h-5" />
                Filtra per Tag
            </h3>
            <div className="flex flex-col items-start gap-1">
                 <button onClick={() => setSelectedTag(null)} className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex justify-between ${!selectedTag ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    <span>Tutti i documenti</span>
                    <span>{view === 'family' ? familyDocs.length : privateDocs.length}</span>
                 </button>
                {allTags.map(([tag, count]) => (
                    <button key={tag} onClick={() => setSelectedTag(tag)} className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex justify-between ${selectedTag === tag ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                        <span>{tag}</span>
                        <span>{count}</span>
                    </button>
                ))}
            </div>
        </>
    );

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
            {selectedDoc && <DetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
            <ListContextMenu {...contextMenu} actions={contextMenuActions} onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <ArchivioChLogoIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <ArchivioChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
                        <p className="text-slate-500 dark:text-slate-400">Il tuo archivio digitale permanente.</p>
                    </div>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-md bg-slate-100 dark:bg-slate-700">
                    <Bars3Icon className="w-6 h-6"/>
                </button>
            </div>
            
            <form onSubmit={handleSearch} className="relative">
                <MagnifyingGlassIcon className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca la garanzia della TV acquistata l'anno scorso..."
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Mobile (Drawer) */}
                 {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <aside className="fixed top-0 left-0 bottom-0 w-72 bg-slate-50 dark:bg-slate-800 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 p-2"><XMarkIcon className="w-6 h-6"/></button>
                            <SidebarContent />
                        </aside>
                    </div>
                )}
                
                {/* Sidebar Desktop */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24">
                        <SidebarContent />
                    </div>
                </aside>
                
                <main className="col-span-1 lg:col-span-3">
                     <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => handleViewChange('family')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${view === 'family' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>Archivio Familiare ({familyDocs.length})</button>
                            <button onClick={() => handleViewChange('private')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${view === 'private' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>Mio Archivio Privato ({privateDocs.length})</button>
                        </nav>
                    </div>

                    {isSearching ? (
                        <div className="text-center p-10"><LoadingSpinner /><p className="mt-2 text-slate-500">Ricerca in corso...</p></div>
                    ) : searchError ? (
                        <p className="text-center text-red-500">{searchError}</p>
                    ) : isShowingSearchResults ? (
                         <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Risultati Ricerca ({searchResults.length})</h2>
                                <button onClick={clearSearch} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <XCircleIcon className="w-4 h-4" /> Pulisci
                                </button>
                            </div>
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {searchResults.map((item) => <ArchivedItem key={item.uuid} item={item} onView={() => setSelectedDoc(item)} onContextMenu={handleContextMenu} />)}
                                </div>
                            ) : (
                                 <div className="text-center p-10 bg-white dark:bg-slate-800/50 rounded-2xl"><h3 className="text-xl font-bold">Nessun Risultato</h3><p>Prova a riformulare la ricerca.</p></div>
                            )}
                         </>
                    ) : paginatedDocs.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paginatedDocs.map((item) => <ArchivedItem key={item.uuid} item={item} onView={() => setSelectedDoc(item)} onContextMenu={handleContextMenu} />)}
                            </div>
                            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                        </>
                    ) : (
                        <div className="text-center p-10 bg-white dark:bg-slate-800/50 rounded-2xl"><h3 className="text-xl font-bold">Nessun Documento</h3><p>Non ci sono documenti in questa vista che corrispondono ai filtri.</p></div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Archivio;