import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ProcessedPageResult, Folder } from '../services/geminiService';
import { CATEGORIES } from '../services/geminiService';
import { performSemanticSearch } from '../services/geminiService';
import { 
    ArchivioChLogoIcon, ArchivioChWordmarkIcon, DocumentTextIcon, LockClosedIcon, 
    MagnifyingGlassIcon, FolderIcon, FolderPlusIcon, PencilIcon, ChevronRightIcon,
    Bars3Icon, XMarkIcon, EyeIcon, TrashIcon, PlusCircleIcon
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

const FOLDER_COLORS = [
    '#64748b', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#ec4899'
];

const FolderEditModal: React.FC<{
    folder: Folder;
    onClose: () => void;
    onSave: (updates: Partial<Folder>) => void;
    onDelete: () => void;
}> = ({ folder, onClose, onSave, onDelete }) => {
    const [name, setName] = useState(folder.name);
    const [color, setColor] = useState(folder.color);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name: name.trim(), color });
        }
    };
    
    const handleDeleteConfirm = () => {
        onDelete();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Modifica Cartella</h3>
                </div>
                {!isDeleting ? (
                    <>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nome Cartella</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Colore</label>
                                <div className="mt-2 grid grid-cols-7 gap-2">
                                    {FOLDER_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-purple-500' : ''}`}
                                            style={{ backgroundColor: c }}
                                            aria-label={`Seleziona colore ${c}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-between items-center">
                            <button onClick={() => setIsDeleting(true)} className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg">Elimina</button>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-bold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                                {/* FIX: Changed button color from red to purple for consistency. */}
                                <button onClick={handleSave} className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg">Salva</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-5 text-center">
                            <h4 className="font-bold text-lg text-red-600">Sei sicuro?</h4>
                            <p className="mt-2 text-slate-600 dark:text-slate-300">
                                Eliminando la cartella "{folder.name}", tutti i documenti al suo interno verranno spostati nell'Archivio Principale. L'azione è irreversibile.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-center gap-4">
                            <button onClick={() => setIsDeleting(false)} className="px-6 py-2 text-sm font-bold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                            <button onClick={handleDeleteConfirm} className="px-6 py-2 text-sm font-bold bg-red-600 text-white rounded-lg">Conferma Eliminazione</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const FolderTreeItem: React.FC<{
    folder: Folder;
    allFolders: Folder[];
    currentFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    level: number;
    draggedItem: { type: 'doc' | 'folder', id: string } | null;
    onDrop: (targetFolderId: string | null) => void;
    onContextMenu: (e: React.MouseEvent, folder: Folder) => void;
}> = ({ folder, allFolders, currentFolderId, onSelectFolder, level, draggedItem, onDrop, onContextMenu }) => {
    const children = allFolders.filter(f => f.parentId === folder.id);
    const [isDropTarget, setIsDropTarget] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedItem && draggedItem.id !== folder.id && (draggedItem.type === 'doc' || draggedItem.id !== folder.parentId)) {
            setIsDropTarget(true);
        }
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropTarget(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropTarget(false);
        onDrop(folder.id);
    };

    return (
        <div style={{ paddingLeft: `${level * 1}rem` }}>
            <button
                onClick={() => onSelectFolder(folder.id)}
                onContextMenu={(e) => onContextMenu(e, folder)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full text-left px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 text-sm transition-colors ${
                    currentFolderId === folder.id ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                } ${isDropTarget ? 'ring-2 ring-red-500' : ''}`}
            >
                <FolderIcon className="w-5 h-5 flex-shrink-0" style={{ color: folder.color }} />
                <span className="truncate">{folder.name}</span>
            </button>
            {children.length > 0 && (
                <div className="border-l border-slate-200 dark:border-slate-700 ml-3 pl-1">
                    {children.map(child => (
                        <FolderTreeItem
                            key={child.id}
                            folder={child}
                            allFolders={allFolders}
                            currentFolderId={currentFolderId}
                            onSelectFolder={onSelectFolder}
                            level={level + 1}
                            draggedItem={draggedItem}
                            onDrop={onDrop}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DocumentEditModal: React.FC<{
    doc: ProcessedPageResult;
    onClose: () => void;
    onSave: (updates: Partial<ProcessedPageResult>) => void;
}> = ({ doc, onClose, onSave }) => {
    const [soggetto, setSoggetto] = useState(doc.analysis.soggetto || '');
    const [categoria, setCategoria] = useState(doc.analysis.categoria || 'Altro');
    const [tags, setTags] = useState((doc.tags || []).join(', '));
    const [datiEstratti, setDatiEstratti] = useState(doc.analysis.datiEstratti || []);

    const handleDatiChange = (index: number, keyOrValue: 'chiave' | 'valore', value: string) => {
        const newDati = [...datiEstratti];
        newDati[index] = { ...newDati[index], [keyOrValue]: value };
        setDatiEstratti(newDati);
    };
    const addDato = () => setDatiEstratti([...datiEstratti, { chiave: '', valore: '' }]);
    const removeDato = (indexToRemove: number) => setDatiEstratti(datiEstratti.filter((_, i) => i !== indexToRemove));

    const handleSave = () => {
        const updatedAnalysis = {
            ...doc.analysis,
            soggetto,
            categoria,
            datiEstratti,
        };
        const updatedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave({ analysis: updatedAnalysis, tags: updatedTags });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Modifica Documento</h3>
                </header>
                <main className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Soggetto</label>
                        <input type="text" value={soggetto} onChange={e => setSoggetto(e.target.value)} className="mt-1 w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Categoria</label>
                        <select value={categoria} onChange={e => setCategoria(e.target.value)} className="mt-1 w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md">
                           {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tag (separati da virgola)</label>
                        <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                         <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Dati Estratti</label>
                         <div className="mt-2 space-y-2">
                             {datiEstratti.map((d, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input type="text" placeholder="Chiave" value={d.chiave} onChange={e => handleDatiChange(i, 'chiave', e.target.value)} className="flex-1 p-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border-slate-300 dark:border-slate-600" />
                                    <input type="text" placeholder="Valore" value={d.valore} onChange={e => handleDatiChange(i, 'valore', e.target.value)} className="flex-1 p-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border-slate-300 dark:border-slate-600" />
                                    <button onClick={() => removeDato(i)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600"><XMarkIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                         </div>
                         {/* FIX: Changed button color from red to purple for consistency. */}
                         <button onClick={addDato} className="mt-2 text-sm flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold"><PlusCircleIcon className="w-4 h-4"/> Aggiungi Campo</button>
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                    {/* FIX: Changed button color from red to purple for consistency. */}
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg">Salva Modifiche</button>
                </footer>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPALE ---
const Archivio: React.FC<ArchivioProps> = (props) => {
    const { folders, archivedDocs, onUpdateDocument, onAddFolder, onUpdateFolder, onDeleteFolder, onDeleteDocument } = props;
    
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<ProcessedPageResult[]>([]);
    const [draggedItem, setDraggedItem] = useState<{ type: 'doc' | 'folder', id: string } | null>(null);
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewedDoc, setViewedDoc] = useState<ProcessedPageResult | null>(null);
    const [editingDoc, setEditingDoc] = useState<ProcessedPageResult | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folder: Folder } | null>(null);
    const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await performSemanticSearch(searchQuery, archivedDocs);
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, archivedDocs]);

    const breadcrumbs = useMemo(() => {
        const path = [];
        let currentId = currentFolderId;
        while (currentId) {
            const folder = folders.find(f => f.id === currentId);
            if (folder) {
                path.unshift(folder);
                currentId = folder.parentId;
            } else {
                break;
            }
        }
        return path;
    }, [currentFolderId, folders]);

    const { subfolders, documentsInCurrentFolder } = useMemo(() => {
        const subfolders = folders.filter(f => f.parentId === currentFolderId);
        const docs = archivedDocs.filter(doc => doc.folderId === currentFolderId);
        return { subfolders, documentsInCurrentFolder: docs };
    }, [currentFolderId, folders, archivedDocs]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await onAddFolder({
            name: newFolderName,
            color: "#64748b", // default color (slate)
            parentId: currentFolderId,
            description: ""
        });
        setIsNewFolderModalOpen(false);
        setNewFolderName('');
    };
    
    const handleDrop = (targetFolderId: string | null) => {
        if (!draggedItem) return;
        
        if (draggedItem.type === 'doc') {
            onUpdateDocument(draggedItem.id, { folderId: targetFolderId });
        } else if (draggedItem.type === 'folder' && draggedItem.id !== targetFolderId) {
            onUpdateFolder(draggedItem.id, { parentId: targetFolderId });
        }
        setDraggedItem(null);
    };
    
    const handleFolderContextMenu = (e: React.MouseEvent, folder: Folder) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, folder });
    };

    const isSearchingActive = searchQuery.trim().length > 0;

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <ArchivioChLogoIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <ArchivioChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Il tuo archivio digitale sicuro.</p>
                    </div>
                </div>
                 <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Bars3Icon className="w-6 h-6"/>
                </button>
            </div>

            {/* Main Layout */}
            <div className="flex gap-6 flex-grow min-h-0">
                {/* Sidebar */}
                <aside className={`flex-shrink-0 w-64 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex-col md:flex ${isSidebarOpen ? 'fixed inset-0 z-40 flex' : 'hidden'}`}>
                    <div className="flex justify-between items-center mb-4 md:hidden">
                        <h3 className="font-bold">Navigazione</h3>
                        <button onClick={() => setIsSidebarOpen(false)}><XMarkIcon className="w-6 h-6"/></button>
                    </div>
                    <button onClick={() => setIsNewFolderModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200">
                        <FolderPlusIcon className="w-5 h-5" /> Nuova Cartella
                    </button>
                    <nav className="mt-4 space-y-1 flex-grow overflow-y-auto">
                        <button
                            onClick={() => setCurrentFolderId(null)}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(null); }}
                            className={`w-full text-left px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 text-sm transition-colors ${
                                currentFolderId === null ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <FolderIcon className="w-5 h-5 text-slate-500" /> Archivio Principale
                        </button>
                        {folders.filter(f => f.parentId === null).map(folder => (
                            <FolderTreeItem
                                key={folder.id}
                                folder={folder}
                                allFolders={folders}
                                currentFolderId={currentFolderId}
                                onSelectFolder={setCurrentFolderId}
                                level={0}
                                draggedItem={draggedItem}
                                onDrop={handleDrop}
                                onContextMenu={handleFolderContextMenu}
                            />
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-grow flex flex-col gap-4 min-w-0">
                    {/* Search and Breadcrumbs */}
                    <div className="flex-shrink-0 space-y-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
                             <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Cerca in tutto l'archivio..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm focus:ring-2 focus:ring-red-500"
                                />
                             </form>
                        </div>
                         {!isSearchingActive && (
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 flex-wrap">
                                <button onClick={() => setCurrentFolderId(null)} className="hover:text-slate-800 dark:hover:text-slate-200">Archivio</button>
                                {breadcrumbs.map(folder => (
                                    <React.Fragment key={folder.id}>
                                        <ChevronRightIcon className="w-4 h-4" />
                                        <button onClick={() => setCurrentFolderId(folder.id)} className="hover:text-slate-800 dark:hover:text-slate-200">{folder.name}</button>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Content Display */}
                    <div className="flex-grow overflow-y-auto pr-2">
                        {isSearchingActive ? (
                             isSearching ? <div className="flex justify-center pt-10"><LoadingSpinner/></div> : (
                                <>
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Risultati della ricerca per "{searchQuery}"</h3>
                                    {searchResults.length > 0 ? (
                                        <div className="space-y-2">
                                            {searchResults.map(doc => (
                                                 <div key={doc.uuid} className="relative group p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-4">
                                                    <div onClick={() => setViewedDoc(doc)} className="flex-grow flex items-center gap-4 cursor-pointer">
                                                        <DocumentTextIcon className="w-6 h-6 text-slate-400 flex-shrink-0"/>
                                                        <div className="flex-grow min-w-0">
                                                            <p className="font-semibold truncate">{doc.analysis.soggetto}</p>
                                                            <p className="text-xs text-slate-500">In: {folders.find(f => f.id === doc.folderId)?.name || 'Archivio Principale'}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingDoc(doc); }} className="p-1.5 bg-white/50 dark:bg-slate-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Modifica documento">
                                                        <PencilIcon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-10 mt-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                            <p className="font-semibold text-slate-600 dark:text-slate-300">Nessun risultato</p>
                                            <p className="text-sm text-slate-500">Prova a usare termini di ricerca diversi.</p>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            <div className="space-y-6">
                                {subfolders.length > 0 && (
                                    <section>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Cartelle</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {subfolders.map(folder => (
                                                <div
                                                    key={folder.id}
                                                    draggable
                                                    onDragStart={() => setDraggedItem({ type: 'folder', id: folder.id })}
                                                    onDragEnd={() => setDraggedItem(null)}
                                                    onDoubleClick={() => setCurrentFolderId(folder.id)}
                                                    // FIX: The onDrop handler was calling an undefined 'onDrop' function instead of 'handleDrop'.
                                                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(folder.id); }}
                                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                                                    className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3"
                                                >
                                                    <FolderIcon className="w-6 h-6 flex-shrink-0" style={{ color: folder.color }} />
                                                    <span className="font-semibold truncate">{folder.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {documentsInCurrentFolder.length > 0 && (
                                     <section>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Documenti</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {documentsInCurrentFolder.map(doc => (
                                                 <div
                                                    key={doc.uuid}
                                                    draggable
                                                    onDragStart={() => setDraggedItem({ type: 'doc', id: doc.uuid })}
                                                    onDragEnd={() => setDraggedItem(null)}
                                                    className="relative bg-white dark:bg-slate-800 rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group"
                                                >
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingDoc(doc); }} className="absolute top-2 right-2 z-10 p-1.5 bg-white/50 dark:bg-slate-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Modifica documento">
                                                        <PencilIcon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                                                    </button>
                                                    <div onClick={() => setViewedDoc(doc)} className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-t-lg flex items-center justify-center overflow-hidden">
                                                        <img src={doc.processedImageDataUrl || doc.originalImageDataUrl} alt={doc.analysis.soggetto} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                    </div>
                                                    <div onClick={() => setViewedDoc(doc)} className="p-3">
                                                        <p className="font-semibold truncate text-sm">{doc.analysis.soggetto}</p>
                                                        <p className="text-xs text-slate-500">{new Date(doc.timestamp).toLocaleDateString('it-CH')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {subfolders.length === 0 && documentsInCurrentFolder.length === 0 && (
                                    <div className="text-center p-10 mt-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <p className="font-semibold text-slate-600 dark:text-slate-300">Cartella vuota</p>
                                        <p className="text-sm text-slate-500">Trascina qui file o cartelle per organizzarli.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            {/* New Folder Modal */}
             {isNewFolderModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg">Nuova Cartella</h3>
                        </div>
                        <div className="p-5">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                placeholder="Nome della cartella"
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                                autoFocus
                            />
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setIsNewFolderModalOpen(false)} className="px-4 py-2 text-sm font-bold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                            <button onClick={handleCreateFolder} className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg">Crea</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Document Detail Modal */}
            {viewedDoc && (
                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewedDoc(null)}>
                    <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate pr-4">{viewedDoc.analysis.soggetto}</h3>
                             <button onClick={() => setViewedDoc(null)}><XMarkIcon className="w-6 h-6"/></button>
                        </header>
                         <div className="flex-grow flex flex-col md:flex-row min-h-0">
                            <div className="w-full md:w-1/2 p-4 bg-slate-100 dark:bg-slate-900/50">
                                <img src={viewedDoc.processedImageDataUrl || viewedDoc.originalImageDataUrl} alt="Documento" className="w-full h-full object-contain"/>
                            </div>
                            <div className="w-full md:w-1/2 p-4 overflow-y-auto space-y-3">
                                {viewedDoc.analysis.datiEstratti.map((item, index) => (
                                    <div key={index}>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.chiave}</p>
                                        <p className="text-slate-800 dark:text-slate-100">{item.valore}</p>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Folder Context Menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    className="fixed z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 border border-slate-200 dark:border-slate-700 w-48"
                >
                    <button
                        onClick={() => { setEditingFolder(contextMenu.folder); setContextMenu(null); }}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <PencilIcon className="w-4 h-4" /> Modifica Cartella
                    </button>
                </div>
            )}

            {/* Folder Edit Modal */}
            {editingFolder && (
                <FolderEditModal
                    folder={editingFolder}
                    onClose={() => setEditingFolder(null)}
                    onSave={(updates) => {
                        onUpdateFolder(editingFolder.id, updates);
                        setEditingFolder(null);
                    }}
                    onDelete={() => {
                        onDeleteFolder(editingFolder.id);
                        setEditingFolder(null);
                    }}
                />
            )}

            {/* Document Edit Modal */}
            {editingDoc && (
                <DocumentEditModal
                    doc={editingDoc}
                    onClose={() => setEditingDoc(null)}
                    onSave={(updates) => {
                        onUpdateDocument(editingDoc.uuid, updates);
                        setEditingDoc(null);
                    }}
                />
            )}
        </div>
    );
};

export default Archivio;