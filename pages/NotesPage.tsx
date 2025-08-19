import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Note, NoteType, ProcessedPageResult } from '../services/geminiService';
import type { User } from '../services/authService';
import { PlusCircleIcon, DocumentTextIcon, UsersIcon, UserCircleIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '../components/icons';
import { ErrorDisplay } from '../components/ErrorDisplay';

interface NotesPageProps {
    user: User;
    notes: Note[];
    documents: ProcessedPageResult[];
    onAddNote: (note: Omit<Note, 'id'>) => void;
    onUpdateNote: (note: Note) => void;
    onDeleteNote: (note: Note) => void;
    onDocumentTagClick: (uuid: string) => void;
    activeNoteId: string | null;
    setActiveNoteId: (id: string | null) => void;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    error: string | null;
}

const NoteEditor: React.FC<{
    activeNote: Note;
    documents: ProcessedPageResult[];
    onSave: (note: Note) => void;
    onCancel: () => void;
    onDocumentTagClick: (uuid: string) => void;
}> = ({ activeNote, documents, onSave, onCancel, onDocumentTagClick }) => {
    const [title, setTitle] = useState(activeNote.title);
    const [content, setContent] = useState(activeNote.content);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    
    // @mention state
    const [mention, setMention] = useState<{ active: boolean; query: string; position: { top: number; left: number } }>({ active: false, query: '', position: { top: 0, left: 0 } });
    const mentionSuggestions = useMemo(() => {
        if (!mention.active || !mention.query) return [];
        const lowerQuery = mention.query.toLowerCase();
        return documents.filter(doc => doc.analysis.soggetto?.toLowerCase().includes(lowerQuery) || doc.sourceFileName.toLowerCase().includes(lowerQuery)).slice(0, 5);
    }, [mention, documents]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setContent(text);

        const cursorPosition = e.target.selectionStart;
        const textUpToCursor = text.substring(0, cursorPosition);
        const mentionMatch = textUpToCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            const rect = contentRef.current?.getBoundingClientRect();
            if (rect) {
                setMention({
                    active: true,
                    query: mentionMatch[1],
                    position: { top: rect.top + 20, left: rect.left + 10 } // simplified position
                });
            }
        } else {
            setMention({ active: false, query: '', position: { top: 0, left: 0 } });
        }
    };
    
    const handleSuggestionClick = (doc: ProcessedPageResult) => {
        const tag = `@[${doc.analysis.soggetto || doc.sourceFileName}](${doc.uuid}) `;
        const newContent = content.replace(/@(\w*)$/, tag);
        setContent(newContent);
        setMention({ active: false, query: '', position: { top: 0, left: 0 } });
        contentRef.current?.focus();
    };

    const handleSave = () => {
        onSave({ ...activeNote, title, content, updatedAt: new Date().toISOString() });
    };

    const renderNoteContentWithLinks = (text: string) => {
        const parts = text.split(/(@\[.*?\]\(.*?\))/g);
        return parts.map((part, index) => {
            const match = part.match(/@\[(.*?)\]\((.*?)\)/);
            if (match) {
                const [, title, uuid] = match;
                return (
                    <button key={index} onClick={() => onDocumentTagClick(uuid)} className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-1 rounded-sm font-semibold">
                        @{title}
                    </button>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Titolo della nota"
                    className="w-full text-xl font-bold bg-transparent focus:outline-none"
                />
                 <div className="flex items-center gap-2">
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6"/></button>
                    <button onClick={handleSave} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"><CheckIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="relative flex-grow">
                <textarea
                    ref={contentRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Scrivi qui la tua nota... Usa @ per menzionare un documento."
                    className="w-full h-full p-4 resize-none bg-transparent focus:outline-none"
                />
                 {mention.active && mentionSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full max-w-md bg-white dark:bg-slate-700 rounded-md shadow-lg border border-slate-200 dark:border-slate-600" style={{ top: mention.position.top, left: mention.position.left }}>
                        <ul className="py-1">
                            {mentionSuggestions.map(doc => (
                                <li key={doc.uuid}>
                                    <button onClick={() => handleSuggestionClick(doc)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">
                                        <p className="font-semibold">{doc.analysis.soggetto}</p>
                                        <p className="text-xs text-slate-500">{doc.sourceFileName}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
        </div>
    );
};

const NoteViewer: React.FC<{
    note: Note, 
    onEdit: () => void, 
    onDelete: () => void,
    onDocumentTagClick: (uuid: string) => void
}> = ({ note, onEdit, onDelete, onDocumentTagClick }) => {
    const renderNoteContent = (text: string) => {
        return text.split(/(\n)/g).map((line, i) => {
            if (line === '\n') return <br key={i} />;
            const parts = line.split(/(@\[.*?\]\(.*?\))/g);
            return (
                <p key={i}>
                    {parts.map((part, index) => {
                        const match = part.match(/@\[(.*?)\]\((.*?)\)/);
                        if (match) {
                            const [, title, uuid] = match;
                            return (
                                <button key={index} onClick={() => onDocumentTagClick(uuid)} className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-1 py-0.5 rounded-md font-semibold hover:underline">
                                    @{title}
                                </button>
                            );
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </p>
            )
        })
    };

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{note.title}</h2>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{note.type === 'family' ? `di ${note.authorName || 'Sconosciuto'}` : 'Personale'}</span>
                        <span className="mx-2">·</span>
                        <span>Ultima modifica: {new Date(note.updatedAt).toLocaleDateString('it-CH')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onDelete} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><TrashIcon className="w-5 h-5"/></button>
                    <button onClick={onEdit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><PencilIcon className="w-5 h-5"/></button>
                </div>
            </header>
            <main className="p-4 prose dark:prose-invert max-w-none flex-grow overflow-y-auto">
                {renderNoteContent(note.content)}
            </main>
        </div>
    );
};

const NotesPage: React.FC<NotesPageProps> = (props) => {
    const [filter, setFilter] = useState<NoteType | 'all'>('all');

    const filteredNotes = useMemo(() => {
        return props.notes
            .filter(note => filter === 'all' || note.type === filter)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [props.notes, filter]);

    const activeNote = useMemo(() => {
        if (!props.activeNoteId) return null;
        return props.notes.find(n => n.id === props.activeNoteId) || null;
    }, [props.activeNoteId, props.notes]);
    
    useEffect(() => {
        if (props.activeNoteId && !props.notes.some(n => n.id === props.activeNoteId)) {
            props.setActiveNoteId(null);
            props.setIsEditing(false);
        }
    }, [props.activeNoteId, props.notes, props.setActiveNoteId, props.setIsEditing]);


    const handleNewNote = () => {
        const newNote: Omit<Note, 'id'> = {
            title: 'Nuova Nota',
            content: '',
            type: filter === 'all' ? 'personal' : filter,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            authorUid: props.user.uid,
            authorName: props.user.name,
        };
        props.onAddNote(newNote);
    };

    const handleSelectNote = (noteId: string) => {
        props.setActiveNoteId(noteId);
        props.setIsEditing(false);
    };
    
    const filterOptions: { id: NoteType | 'all', label: string, Icon: React.FC<any> }[] = [
        { id: 'all', label: 'Tutte', Icon: DocumentTextIcon },
        { id: 'personal', label: 'Personali', Icon: UserCircleIcon },
        { id: 'family', label: 'Famiglia', Icon: UsersIcon },
    ];

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-1/3 max-w-sm flex-shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Le tue Note</h1>
                    <button onClick={handleNewNote} className="p-2 text-purple-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><PlusCircleIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1">
                     {filterOptions.map(({ id, label, Icon }) => (
                         <button key={id} onClick={() => setFilter(id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md ${filter === id ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                     ))}
                </div>
                <div className="flex-grow overflow-y-auto">
                    {filteredNotes.map(note => (
                        <button key={note.id} onClick={() => handleSelectNote(note.id)} className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700/50 ${props.activeNoteId === note.id ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{note.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{note.content || 'Nessun contenuto'}</p>
                            <p className="text-xs text-slate-400 mt-1">{note.type === 'family' ? `Famiglia · ${note.authorName}` : 'Personale'}</p>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main View */}
            <main className="flex-1 flex flex-col">
                {props.error && <div className="p-4 flex-shrink-0 border-b border-slate-200 dark:border-slate-700"><ErrorDisplay error={props.error} /></div>}
                <div className="flex-grow min-h-0">
                    {activeNote && props.isEditing ? (
                        <NoteEditor 
                            activeNote={activeNote}
                            documents={props.documents}
                            onSave={props.onUpdateNote}
                            onCancel={() => props.setIsEditing(false)}
                            onDocumentTagClick={props.onDocumentTagClick}
                        />
                    ) : activeNote ? (
                        <NoteViewer 
                            note={activeNote}
                            onEdit={() => props.setIsEditing(true)}
                            onDelete={() => props.onDeleteNote(activeNote)}
                            onDocumentTagClick={props.onDocumentTagClick}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                            <DocumentTextIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4"/>
                            <h2 className="text-xl font-semibold">Seleziona o crea una nota</h2>
                            <p>Le tue note appariranno qui.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NotesPage;