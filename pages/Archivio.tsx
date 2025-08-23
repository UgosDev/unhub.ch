import React from 'react';
import type { ProcessedPageResult, Folder } from '../services/geminiService';
import { performSemanticSearch } from '../services/geminiService';
import { 
    ArchivioChLogoIcon, ArchivioChWordmarkIcon, DocumentTextIcon, LockClosedIcon, 
    MagnifyingGlassIcon, XCircleIcon, FolderIcon, EyeIcon, ArrowPathIcon, TrashIcon,
    Bars3Icon, XMarkIcon, FolderPlusIcon, EllipsisVerticalIcon, ChevronRightIcon, PencilIcon
} from '../components/icons';
import { LoadingSpinner } from '../components/LoadingSpinner';

// --- TIPI E INTERFACCE ---
interface ArchivioProps {
    archivedDocs: ProcessedPageResult[];
    folders: Folder[];
    userUid: string;
    onUpdateDocument: (uuid: string, updates: Partial<ProcessedPageResult>) => void;
    onDeleteDocument: (doc: ProcessedPageResult) => void;
    onAddFolder: (folderData: Omit<Folder, 'id' | 'ownerUid'>) => Promise<string>;
    onUpdateFolder: (folderId: string, updates: Partial<Folder>) => void;
    onDeleteFolder: (folderId: string) => void;
}

interface FolderNode extends Folder {
    children: FolderNode[];
}

// --- COMPONENTI INTERNI ---
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
                        <div className="text-sm space-y-1 mt-1 max-h-60 overflow-y-auto">
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

const ArchivedItem: React.FC<{ item: ProcessedPageResult, onView: () => void, onDelete: () => void, folderPath?: string }> = ({ item, onView, onDelete, folderPath }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("application/document-uuid", item.uuid);
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col gap-3 transition-transform transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group"
            draggable
            onDragStart={handleDragStart}
        >
            <div className="flex items-start gap-4" onClick={onView}>
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
                     {folderPath && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate" title={folderPath}>
                            <span className="font-semibold">Percorso:</span> {folderPath}
                        </p>
                    )}
                </div>
            </div>
             <div className="flex justify-between items-end">
                {item.tags && item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex-grow">
                        {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full">{tag}</span>
                        ))}
                    </div>
                ) : <div/>}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onView} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Visualizza"><EyeIcon className="w-4 h-4"/></button>
                    <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Elimina"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
        </div>
    );
};

const FolderModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string, color: string) => void;
    initialData?: Partial<Omit<Folder, 'id' | 'ownerUid' | 'parentId'>> | null;
    title: string;
}> = ({ isOpen, onClose, onSave, initialData, title }) => {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [color, setColor] = React.useState('#a855f7');
    const colors = ['#a855f7', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#ec4899'];

    React.useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setColor(initialData.color || '#a855f7');
        } else {
            setName('');
            setDescription('');
            setColor('#a855f7');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name, description, color);
        }
    };

    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg">{title}</h3>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nome Cartella</label>
                            <input value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Descrizione (opzionale)</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Colore</label>
                            <div className="mt-2 flex gap-2">
                                {colors.map(c => (
                                    <button type="button" key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`} />
                                ))}
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                        <button type="submit" className="px-4 py-2 font-semibold bg-red-600 text-white rounded-lg">Salva</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

// --- FUNZIONI HELPER ---
const buildFolderTree = (folders: Folder[]): FolderNode[] => {
    const folderMap = new Map<string, FolderNode>(folders.map(f => [f.id, { ...f, children: [] }]));
    const tree: FolderNode[] = [];
    folderMap.forEach(node => {
        if (node.parentId && folderMap.has(node.parentId)) {
            folderMap.get(node.parentId)!.children.push(node);
        } else {
            tree.push(node);
        }
    });
    return tree;
};

// --- COMPONENTE PRINCIPALE ---
const Archivio: React.FC<ArchivioProps> = (props) => {
    const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
    const [modalState, setModalState] = React.useState<{ type: 'new' | 'edit' | null; folder?: Folder | null, parentId?: string | null }>({ type: null });
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [selectedDoc, setSelectedDoc] = React.useState<ProcessedPageResult | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<ProcessedPageResult[] | null>(null);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isGlobalSearch, setIsGlobalSearch] = React.useState(true);
    const searchTimeoutRef = React.useRef<number | null>(null);

    const folderMap = React.useMemo(() => new Map(props.folders.map(f => [f.id, f])), [props.folders]);

    const getFolderPath = React.useCallback((folderId: string | null | undefined): string => {
        if (!folderId) return 'Archivio Principale';
        let path = '';
        let currentId: string | null = folderId;
        const pathParts: string[] = [];
        while (currentId) {
            const folder = folderMap.get(currentId);
            if (folder) {
                pathParts.unshift(folder.name);
                currentId = folder.parentId;
            } else {
                break;
            }
        }
        return `Archivio > ${pathParts.join(' > ')}`;
    }, [folderMap]);
    
    const breadcrumbs = React.useMemo(() => {
        const crumbs: Folder[] = [];
        let currentId = selectedFolderId;
        while (currentId) {
            const folder = folderMap.get(currentId);
            if (folder) {
                crumbs.unshift(folder);
                currentId = folder.parentId;
            } else {
                break;
            }
        }
        return crumbs;
    }, [selectedFolderId, folderMap]);

    const folderTree = React.useMemo(() => buildFolderTree(props.folders), [props.folders]);
    
    React.useEffect(() => {
        if (!selectedFolderId) {
            setIsGlobalSearch(true);
        }
    }, [selectedFolderId]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!query.trim()) {
            setSearchResults(null);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchTimeoutRef.current = window.setTimeout(async () => {
            const docsInScope = (isGlobalSearch || !selectedFolderId)
                ? props.archivedDocs
                : props.archivedDocs.filter(doc => (doc.folderId || null) === selectedFolderId);

            try {
                const results = await performSemanticSearch(query, docsInScope);
                setSearchResults(results);
            } catch (error) {
                console.error("Semantic search failed:", error);
                // Optionally show an error to the user
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };
    
    const handleSaveFolder = async (name: string, description: string, color: string) => {
        if (modalState.type === 'new') {
            await props.onAddFolder({ name, description, color, parentId: modalState.parentId || null });
        } else if (modalState.type === 'edit' && modalState.folder) {
            await props.onUpdateFolder(modalState.folder.id, { ...modalState.folder, name, description, color });
        }
        setModalState({ type: null });
    };

    const handleDeleteFolder = (folderId: string) => {
        if (confirm("Sei sicuro di voler eliminare questa cartella? I documenti al suo interno verranno spostati nell'archivio principale.")) {
            props.onDeleteFolder(folderId);
            if (selectedFolderId === folderId) setSelectedFolderId(null);
        }
    };
    
    const displayedDocs = React.useMemo(() => {
        if (searchResults !== null) return searchResults;
        return props.archivedDocs.filter(doc => (doc.folderId || null) === selectedFolderId);
    }, [props.archivedDocs, selectedFolderId, searchResults]);
    
    const handleDrop = (folderId: string | null, e: React.DragEvent) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('bg-red-100', 'dark:bg-red-900/50');
        const uuid = e.dataTransfer.getData("application/document-uuid");
        if (uuid) props.onUpdateDocument(uuid, { folderId: folderId || null });
    };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; (e.currentTarget as HTMLElement).classList.add('bg-red-100', 'dark:bg-red-900/50'); };
    const handleDragLeave = (e: React.DragEvent) => { (e.currentTarget as HTMLElement).classList.remove('bg-red-100', 'dark:bg-red-900/50'); };

    const FolderTreeItem: React.FC<{ node: FolderNode; level: number }> = ({ node, level }) => (
        <div style={{ paddingLeft: `${level * 1.25}rem` }}>
            <div 
                onClick={() => { setSelectedFolderId(node.id); setIsSidebarOpen(false); }}
                onDrop={(e) => { e.stopPropagation(); handleDrop(node.id, e) }}
                onDragOver={(e) => { e.stopPropagation(); handleDragOver(e) }}
                onDragLeave={(e) => { e.stopPropagation(); handleDragLeave(e) }}
                className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex justify-between items-center group cursor-pointer ${selectedFolderId === node.id ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <div className="flex items-center gap-2 truncate">
                    <span style={{ color: node.color }}><FolderIcon className="w-5 h-5"/></span>
                    <span className="truncate">{node.name}</span>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100">
                     <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'new', parentId: node.id }); }} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title="Crea sottocartella"><FolderPlusIcon className="w-4 h-4"/></button>
                     <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'edit', folder: node }); }} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title="Modifica"><PencilIcon className="w-4 h-4"/></button>
                     <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(node.id); }} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title="Elimina"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            {node.children.length > 0 && (
                <div className="mt-1 space-y-1">{node.children.sort((a,b) => a.name.localeCompare(b.name)).map(child => <FolderTreeItem key={child.id} node={child} level={level + 1} />)}</div>
            )}
        </div>
    );
    
    const SidebarContent = () => (
        <div className="p-4 bg-white dark:bg-slate-800 h-full flex flex-col">
            <button 
                onClick={() => setModalState({ type: 'new', parentId: selectedFolderId })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
            >
                <FolderPlusIcon className="w-5 h-5" /> Nuova Cartella
            </button>
            <nav className="mt-4 space-y-1 flex-grow overflow-y-auto">
                 <div 
                    onClick={() => { setSelectedFolderId(null); setIsSidebarOpen(false); }}
                    onDrop={(e) => handleDrop(null, e)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer ${!selectedFolderId ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    <FolderIcon className="w-5 h-5" /> Archivio Principale
                 </div>
                 {folderTree.sort((a,b) => a.name.localeCompare(b.name)).map(node => <FolderTreeItem key={node.id} node={node} level={0} />)}
            </nav>
        </div>
    );

    return (
        <div className="flex w-full h-full">
            {selectedDoc && <DetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
            <FolderModal 
                isOpen={!!modalState.type} 
                onClose={() => setModalState({ type: null })}
                onSave={handleSaveFolder}
                initialData={modalState.type === 'edit' ? modalState.folder : null}
                title={modalState.type === 'edit' ? 'Modifica Cartella' : (modalState.folder ? `Nuova Sottocartella in "${modalState.folder.name}"` : 'Nuova Cartella Principale')}
            />

            {/* Sidebar per Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-700">
                <SidebarContent />
            </aside>
            
            {/* Sidebar per Mobile */}
            <div className={`fixed inset-0 z-40 lg:hidden transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-72 h-full"><SidebarContent /></div>
                <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
            </div>

            <main className="flex-grow p-4 sm:p-6 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2"><Bars3Icon className="w-6 h-6"/></button>
                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg hidden sm:block">
                            <ArchivioChLogoIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <ArchivioChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Il tuo archivio sicuro e organizzato.</p>
                        </div>
                    </div>
                 </div>

                 <div>
                    <div className="relative">
                        {isSearching 
                            ? <LoadingSpinner className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                            : <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
                        }
                        <input type="search" value={searchQuery} onChange={handleSearchChange} placeholder={isGlobalSearch ? "Cerca in tutto l'archivio..." : "Cerca nella cartella corrente..."} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-red-500"/>
                    </div>
                     {selectedFolderId && (
                        <div className="mt-2">
                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer w-fit">
                                <input 
                                    type="checkbox" 
                                    checked={!isGlobalSearch} 
                                    onChange={(e) => setIsGlobalSearch(!e.target.checked)}
                                    className="h-4 w-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700"
                                />
                                Cerca solo in questa cartella
                            </label>
                        </div>
                    )}
                 </div>

                 <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                    <button onClick={() => setSelectedFolderId(null)} className="hover:text-red-600">Archivio</button>
                    {breadcrumbs.map(crumb => (
                        <React.Fragment key={crumb.id}>
                            <ChevronRightIcon className="w-4 h-4 mx-1"/>
                            <button onClick={() => setSelectedFolderId(crumb.id)} className="hover:text-red-600">{crumb.name}</button>
                        </React.Fragment>
                    ))}
                 </div>
                 
                 {searchResults !== null && (
                    <div className="pb-2 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold">Risultati della ricerca per "{searchQuery}" <span className="text-base font-normal text-slate-500">({searchResults.length})</span></h3>
                    </div>
                 )}


                {isSearching ? (
                     <div className="text-center py-10"><LoadingSpinner /></div>
                ) : displayedDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {displayedDocs.map((item) => <ArchivedItem key={item.uuid} item={item} onView={() => setSelectedDoc(item)} onDelete={() => props.onDeleteDocument(item)} folderPath={searchResults !== null ? getFolderPath(item.folderId) : undefined} />)}
                    </div>
                ) : (
                    <div className="text-center p-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <DocumentTextIcon className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                           {searchResults !== null ? 'Nessun Risultato' : (selectedFolderId ? 'Cartella Vuota' : 'Archivio Vuoto')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {searchResults !== null ? `La tua ricerca per "${searchQuery}" non ha prodotto risultati.` : 'Sposta i documenti qui dalla pagina di scansione per iniziare.'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Archivio;