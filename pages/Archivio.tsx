import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ProcessedPageResult } from '../services/geminiService';
import { performSemanticSearch } from '../services/geminiService';
import {
  ArchivioChLogoIcon, ArchivioChWordmarkIcon, DocumentTextIcon,
  MagnifyingGlassIcon, Bars3Icon, XMarkIcon, FolderIcon, PlusCircleIcon
} from '../components/icons';
import { LoadingSpinner } from '../components/LoadingSpinner';

/** ---------- Tipi locali (non invadono ProcessedPageResult) ---------- */
type ViewMode = 'normal' | 'trash';
type PrivacyView = 'family' | 'private';
type SortMode = 'date_desc' | 'date_asc' | 'title_asc';

type FolderColorMap = Map<string, string>;
type EphemeralFolderSet = Set<string>;

interface LocalDocMeta {
  fascicolo?: string | null;
}

interface ArchivioProps {
  archivedDocs: ProcessedPageResult[];
  onMoveDocument: (doc: ProcessedPageResult) => void;
  onDeleteDocument: (doc: ProcessedPageResult) => void;
  onUpdateDocument: (doc: ProcessedPageResult) => void;
}

/** ---------- Pannello di anteprima ---------- */
const DocumentPreviewPane: React.FC<{
  doc: ProcessedPageResult;
  isTrashed?: boolean;
  meta?: LocalDocMeta;
  onClose: () => void;
  onMoveToTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onUpdate: (doc: ProcessedPageResult) => void;
}> = ({ doc, isTrashed, meta, onClose, onMoveToTrash, onRestore, onUpdate }) => {
  return (
    <div className="bg-white dark:bg-slate-800 h-full flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <header className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
            aria-label="Chiudi"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="text-xs text-slate-500">
            {new Date(doc.timestamp).toLocaleDateString('it-CH')}
            {meta?.fascicolo ? ` • Fascicolo: ${meta.fascicolo}` : ''}
            {doc.isPrivate ? ' • Privato 🔒' : ' • Famiglia'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTrashed ? (
            <button
              onClick={() => onRestore(doc.uuid)}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Ripristina
            </button>
          ) : (
            <button
              onClick={() => onMoveToTrash(doc.uuid)}
              className="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Sposta nel cestino
            </button>
          )}
        </div>
      </header>

      <div className="w-full h-44 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
        {/* fallback immagine */}
        <img
          src={doc.processedImageDataUrl}
          alt="Anteprima documento"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 break-words">
          {doc.analysis?.soggetto ?? 'Documento'}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {doc.analysis?.riassunto ?? '—'}
        </p>

        {Array.isArray(doc.analysis?.datiEstratti) && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
            {doc.analysis!.datiEstratti.map((d: any, i: number) => (
              <div key={i}>
                <label className="text-xs font-semibold text-slate-500">{d.chiave}</label>
                <p className="text-sm text-slate-800 dark:text-slate-200">{d.valore}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <button className="flex-1 px-3 py-2 text-sm font-semibold rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200">
          Download
        </button>
        <button className="flex-1 px-3 py-2 text-sm font-semibold rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200">
          Sposta
        </button>
      </footer>
    </div>
  );
};

/** ---------- Component principale ---------- */
const Archivio: React.FC<ArchivioProps> = ({
  archivedDocs,
  onMoveDocument,
  onDeleteDocument,
  onUpdateDocument,
}) => {
  /** Stato base */
  const [view, setView] = useState<PrivacyView>('family');
  const [mode, setMode] = useState<ViewMode>('normal');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProcessedPageResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  /** Cartelle */
  const [folders, setFolders] = useState<Map<string, number>>(new Map());
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>('/');
  const [ephemeralFolders, setEphemeralFolders] = useState<EphemeralFolderSet>(new Set());
  const [folderColors, setFolderColors] = useState<FolderColorMap>(new Map());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const [sort, setSort] = useState<SortMode>('date_desc');

  /** Meta locali (fascicoli) + cestino */
  const [metaById, setMetaById] = useState<Map<string, LocalDocMeta>>(new Map());
  const [trashedIds, setTrashedIds] = useState<Set<string>>(new Set());

  /** Selezione multipla */
  const [multi, setMulti] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  
  /** Drag & Drop State */
  const [draggedItemIds, setDraggedItemIds] = useState<Set<string>>(new Set());
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const dragGhostRef = useRef<HTMLDivElement>(null);


  /** Doc per vista corrente */
  const familyDocs = useMemo(
    () => archivedDocs.filter((doc) => !doc.isPrivate),
    [archivedDocs]
  );
  const privateDocs = useMemo(
    () => archivedDocs.filter((doc) => doc.isPrivate),
    [archivedDocs]
  );
  const docsForPrivacy = view === 'family' ? familyDocs : privateDocs;

  /** Costruisci mappa cartelle */
  useEffect(() => {
    const folderMap = new Map<string, number>();
    folderMap.set('/', 0);

    docsForPrivacy.forEach((doc) => {
      const path = (doc as any).folderPath || '/';
      const parts = String(path).split('/').filter(Boolean);
      let current = '';
      for (const part of parts) {
        current += `/${part}`;
        if (!folderMap.has(current)) folderMap.set(current, 0);
      }
      folderMap.set(path, (folderMap.get(path) || 0) + 1);
    });

    // Cartelle effimere
    ephemeralFolders.forEach((p) => {
      if (!folderMap.has(p)) folderMap.set(p, 0);
    });

    setFolders(folderMap);
  }, [docsForPrivacy, ephemeralFolders]);

  /** Ricerca */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);
    try {
      const results = await performSemanticSearch(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchError('Si è verificato un errore durante la ricerca.');
    } finally {
      setIsSearching(false);
    }
  };
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchError(null);
  };

  /** Filtro documenti finali */
  const isShowingSearchResults = searchResults !== null;
  let finalDocs = (isShowingSearchResults ? searchResults! : docsForPrivacy).filter(
    (d) => (mode === 'trash') === trashedIds.has(d.uuid)
  );

  if (!isShowingSearchResults && mode === 'normal') {
    finalDocs = finalDocs.filter(
      (doc) => ((doc as any).folderPath || '/') === selectedFolderPath
    );
  }

  /** Ordinamento */
  finalDocs = useMemo(() => {
    const arr = [...finalDocs];
    if (sort === 'title_asc') {
      arr.sort((a, b) =>
        String(a.analysis?.soggetto ?? '').localeCompare(String(b.analysis?.soggetto ?? ''))
      );
    } else {
      const getDate = (d: ProcessedPageResult) =>
        new Date(d.timestamp || Date.now()).getTime();
      arr.sort((a, b) => getDate(b) - getDate(a));
      if (sort === 'date_asc') arr.reverse();
    }
    return arr;
  }, [finalDocs, sort]);

  /** Documento selezionato */
  const selectedDoc = useMemo(
    () => archivedDocs.find((d) => d.uuid === selectedDocId) || null,
    [selectedDocId, archivedDocs]
  );

  /** Creazione cartella */
  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      setIsCreatingFolder(false);
      return;
    }
    const newPath =
      selectedFolderPath === '/' ? `/${name}` : `${selectedFolderPath}/${name}`;
    if (folders.has(newPath)) {
      alert('Una cartella con questo nome esiste già qui.');
      return;
    }
    setEphemeralFolders((prev) => new Set(prev).add(newPath));
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  useEffect(() => {
    if (isCreatingFolder) newFolderInputRef.current?.focus();
  }, [isCreatingFolder]);

  /** Drag & Drop documenti */
  const handleDragStart = (e: React.DragEvent, docId: string) => {
    const idsToDrag = selection.has(docId) ? new Set(selection) : new Set([docId]);
    setDraggedItemIds(idsToDrag);
    e.dataTransfer.setData('application/document-uuids', JSON.stringify(Array.from(idsToDrag)));
    e.dataTransfer.effectAllowed = 'move';
    
    if (dragGhostRef.current) {
        const count = idsToDrag.size;
        const ghostNode = dragGhostRef.current;
        const countNode = ghostNode.querySelector<HTMLSpanElement>('#drag-count');
        const textNode = ghostNode.querySelector<HTMLSpanElement>('#drag-text');
        
        if (countNode) countNode.textContent = count.toString();
        if (textNode) textNode.textContent = count > 1 ? 'documenti' : 'documento';
        
        e.dataTransfer.setDragImage(ghostNode, 20, 20);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemIds(new Set());
    setDragOverFolder(null);
  };
  
  const handleDropOnFolder = (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault();
    const docUuidsJSON = e.dataTransfer.getData('application/document-uuids');
    if (!docUuidsJSON) {
        handleDragEnd();
        return;
    }
    
    const docUuids = JSON.parse(docUuidsJSON) as string[];
    const docsToMove = archivedDocs.filter(d => docUuids.includes(d.uuid));
    
    docsToMove.forEach(docToMove => {
        const currentPath = (docToMove as any).folderPath || '/';
        if (currentPath !== targetFolderPath) {
            onUpdateDocument({ ...(docToMove as any), folderPath: targetFolderPath });
        }
    });

    handleDragEnd();
  };


  /** Cestino */
  const moveToTrash = (id: string) => {
    setTrashedIds((s) => new Set(s).add(id));
    if (selectedDocId === id) setSelectedDocId(null);
  };
  const restoreFromTrash = (id: string) => {
    setTrashedIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  };
  const emptyTrash = () => {
    if (trashedIds.size === 0) return;
    if (!confirm('Svuotare definitivamente il cestino?')) return;
    archivedDocs.forEach((d) => {
      if (trashedIds.has(d.uuid)) onDeleteDocument(d);
    });
    setTrashedIds(new Set());
    setSelectedDocId(null);
  };

  /** Fascicoli */
  const mergeIntoFascicolo = () => {
    if (selection.size < 2) return;
    const name = prompt('Nome fascicolo') || '';
    if (!name.trim()) return;
    const newMap = new Map(metaById);
    selection.forEach((id) => {
      const prev = newMap.get(id) || {};
      newMap.set(id, { ...prev, fascicolo: name.trim() });
    });
    setMetaById(newMap);
    setSelection(new Set());
    setMulti(false);
  };
  const splitFascicolo = () => {
    if (selection.size === 0) return;
    const newMap = new Map(metaById);
    selection.forEach((id) => {
      const prev = newMap.get(id) || {};
      newMap.set(id, { ...prev, fascicolo: null });
    });
    setMetaById(newMap);
    setSelection(new Set());
    setMulti(false);
  };

  /** Cartella -> colore */
  const setFolderColor = (path: string, color: string) => {
    setFolderColors((m) => {
      const n = new Map(m);
      n.set(path, color);
      return n;
    });
  };

  /** Folder Item */
  const FolderItem: React.FC<{ path: string }> = ({ path }) => {
    const depth = path.split('/').filter(Boolean).length;
    const name = path === '/' ? 'Archivio Principale' : path.split('/').pop()!;
    const isSelected = path === selectedFolderPath && mode === 'normal';
    const color = folderColors.get(path) ?? '#9ca3af';
    const isDropTarget = path === dragOverFolder && draggedItemIds.size > 0;


    return (
      <div
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
          isSelected
            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            : isDropTarget
            ? 'bg-purple-100 dark:bg-purple-900/50 ring-2 ring-purple-500'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        style={{ paddingLeft: `${12 + (depth - 1) * 16}px` }}
        onDragEnter={(e) => { e.preventDefault(); setDragOverFolder(path); }}
        onDragLeave={() => setDragOverFolder(null)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDropOnFolder(e, path)}
      >
        <button
          onClick={() => {
            setMode('normal');
            setSelectedFolderPath(path);
          }}
          className="flex-1 text-left flex items-center gap-3"
        >
          <FolderIcon className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">{name}</span>
        </button>

        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
          {folders.get(path) || 0}
        </span>

        {/* Colore cartella */}
        <label className="ml-1 relative">
          <input
            type="color"
            value={color}
            onChange={(e) => setFolderColor(path, e.target.value)}
            className="absolute left-0 top-0 w-0 h-0 opacity-0 pointer-events-none"
            aria-hidden
          />
          <span
            className="inline-block w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner cursor-pointer"
            style={{ background: color }}
            title="Colore cartella"
            onClick={(e) => {
              const input = (e.currentTarget.previousSibling as HTMLInputElement) || null;
              input?.click();
            }}
          />
        </label>
      </div>
    );
  };

  /** Sidebar */
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cartelle</h2>
      </div>
      <nav className="flex-grow px-2 py-1 overflow-y-auto space-y-1">
        {Array.from(folders.keys())
          .sort()
          .map((path) => (
            <FolderItem key={path} path={path} />
          ))}

        {/* Cestino */}
        <button
          onClick={() => {
            setMode('trash');
            setSelectedDocId(null);
          }}
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
            mode === 'trash'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span className="w-5 h-5">🗑</span>
          <span className="truncate flex-1">Cestino</span>
          <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
            {trashedIds.size}
          </span>
        </button>

        {/* Input creazione cartella inline */}
        {isCreatingFolder && (
          <div
            className="flex items-center gap-2 mt-1"
            style={{ paddingLeft: `${12 + (selectedFolderPath.split('/').length - 2) * 16}px` }}
          >
            <FolderIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
            <input
              ref={newFolderInputRef}
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="flex-grow bg-transparent focus:outline-none text-sm p-1 border-b border-slate-300 dark:border-slate-600"
              placeholder="Nome cartella"
            />
          </div>
        )}
      </nav>

      <div className="p-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 gap-2">
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <PlusCircleIcon className="w-5 h-5" /> Nuova Cartella
        </button>
        <button
          onClick={() => {
            // sottocartella nel path corrente
            const name = prompt(`Nome sottocartella in "${selectedFolderPath}"`)?.trim();
            if (!name) return;
            const full =
              selectedFolderPath === '/' ? `/${name}` : `${selectedFolderPath}/${name}`;
            setEphemeralFolders((prev) => new Set(prev).add(full));
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <PlusCircleIcon className="w-5 h-5" /> Nuova Sottocartella
        </button>
      </div>
    </div>
  );

  /** Lista documenti */
  const toggleSelect = (id: string, checked: boolean) => {
    setSelection((s) => {
      const n = new Set(s);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-full mx-auto w-full h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <ArchivioChLogoIcon className="w-8 h-8" />
          </div>
          <div>
            <ArchivioChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
            <p className="text-slate-500 dark:text-slate-400">
              Il tuo archivio digitale permanente.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md bg-slate-100 dark:bg-slate-700"
          aria-label="Apri menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Main */}
      <div className="flex-grow flex gap-4 min-h-0">
        {/* Sidebar Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <aside
              className="fixed top-0 left-0 bottom-0 w-80 bg-slate-100 dark:bg-slate-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          {sidebarContent}
        </aside>

        {/* Contenuto */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Ricerca */}
          <form onSubmit={handleSearch} className="relative flex-shrink-0">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per testo, importo, IBAN, data…"
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label="Cancella ricerca"
              >
                ✕
              </button>
            )}
          </form>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setView('family')}
                  className={`px-3 py-1.5 text-sm ${
                    view === 'family'
                      ? 'bg-slate-200 dark:bg-slate-700'
                      : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  Famiglia
                </button>
                <button
                  onClick={() => setView('private')}
                  className={`px-3 py-1.5 text-sm ${
                    view === 'private'
                      ? 'bg-slate-200 dark:bg-slate-700'
                      : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  Privati 🔒
                </button>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="px-2 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="date_desc">Più recenti</option>
                <option value="date_asc">Più vecchi</option>
                <option value="title_asc">A–Z</option>
              </select>

              <label className="ml-2 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={multi}
                  onChange={(e) => {
                    setMulti(e.target.checked);
                    setSelection(new Set());
                  }}
                />
                Selezione multipla
              </label>

              <button
                disabled={selection.size < 2}
                onClick={mergeIntoFascicolo}
                className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white disabled:opacity-40"
                title="Unisci in fascicolo"
              >
                Unisci in fascicolo
              </button>
              <button
                disabled={selection.size === 0}
                onClick={splitFascicolo}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-40"
                title="Separa dal fascicolo"
              >
                Separa
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>
                {mode === 'trash' ? 'Cestino: ' : 'Documenti: '}
                <b>{finalDocs.length}</b>
              </span>
              {mode === 'trash' && (
                <button
                  onClick={emptyTrash}
                  className="ml-2 px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Svuota cestino
                </button>
              )}
            </div>
          </div>

          {/* Lista + Preview */}
          <div className="flex-grow flex min-h-0">
            <main className="flex-1 overflow-y-auto pr-2">
              {/* Tab/Info ricerca */}
              {searchError && (
                <div className="mb-2 text-sm text-red-600">{searchError}</div>
              )}

              {isSearching ? (
                <LoadingSpinner />
              ) : finalDocs.length > 0 ? (
                <div className="space-y-2">
                  {finalDocs.map((doc) => {
                    const selected = selectedDocId === doc.uuid;
                    const meta = metaById.get(doc.uuid);
                    const inTrash = trashedIds.has(doc.uuid);
                    const isBeingDragged = draggedItemIds.has(doc.uuid);

                    return (
                      <div
                        key={doc.uuid}
                        className={`w-full p-3 rounded-lg border transition-all duration-150 flex items-start gap-3 ${
                          selected
                            ? 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700'
                            : isBeingDragged 
                            ? 'opacity-40 border-dashed border-purple-400 bg-slate-100 dark:bg-slate-700'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                        draggable={mode === 'normal'}
                        onDragStart={(e) => handleDragStart(e, doc.uuid)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedDocId(doc.uuid)}
                      >
                        {multi ? (
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selection.has(doc.uuid)}
                            onChange={(e) => toggleSelect(doc.uuid, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="w-4" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {doc.analysis?.soggetto ?? 'Documento'}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {doc.analysis?.riassunto ?? '—'}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                              {((doc as any).folderPath || '/') === '/'
                                ? 'Principale'
                                : String((doc as any).folderPath).split('/').pop()}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                              {new Date(doc.timestamp).toLocaleDateString('it-CH')}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                              {doc.isPrivate ? 'Privato 🔒' : 'Famiglia 👥'}
                            </span>
                            {meta?.fascicolo && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                                Fascicolo: {meta.fascicolo}
                              </span>
                            )}
                            {inTrash && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">
                                Nel cestino
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500">
                  {mode === 'trash'
                    ? 'Il cestino è vuoto.'
                    : 'Nessun documento in questa cartella.'}
                </div>
              )}
            </main>

            {/* Preview */}
            <aside className={`w-[22rem] flex-shrink-0 ml-4 ${selectedDoc ? 'block' : 'hidden'} lg:block`}>
              {selectedDoc ? (
                <DocumentPreviewPane
                  doc={selectedDoc}
                  isTrashed={trashedIds.has(selectedDoc.uuid)}
                  meta={metaById.get(selectedDoc.uuid)}
                  onClose={() => setSelectedDocId(null)}
                  onMoveToTrash={moveToTrash}
                  onRestore={restoreFromTrash}
                  onUpdate={onUpdateDocument}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <DocumentTextIcon className="w-12 h-12 text-slate-400 mb-2" />
                  <p className="font-semibold">Seleziona un documento</p>
                  <p className="text-sm text-slate-500">I dettagli appariranno qui.</p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

       {/* Custom Drag Ghost Element */}
        <div ref={dragGhostRef} style={{ position: 'absolute', top: '-1000px', left: '-1000px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-700 shadow-lg rounded-lg p-2 border border-slate-300 dark:border-slate-600">
                <DocumentTextIcon className="w-6 h-6 text-purple-500" />
                <span id="drag-count" className="font-bold text-lg text-slate-800 dark:text-slate-100">1</span>
                <span id="drag-text" className="text-sm text-slate-600 dark:text-slate-300">documento</span>
            </div>
        </div>
    </div>
  );
};

export default Archivio;
