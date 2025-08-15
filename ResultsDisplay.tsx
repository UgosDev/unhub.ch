import React, { useState, useEffect, useCallback, forwardRef, useRef, useMemo } from 'react';
import type { ProcessedPageResult, DocumentGroup } from '../services/geminiService';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { 
    XMarkIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon, 
    ShieldCheckIcon, ShieldExclamationIcon, ChatBubbleLeftRightIcon, PencilIcon, CheckCircleIcon,
    XCircleIcon, PlusCircleIcon, TrashIcon, DocumentDuplicateIcon, QuestionMarkCircleIcon, 
    ArchivioChLogoIcon, ArchivioChWordmarkIcon, PolizzeChLogoIcon, PolizzeChWordmarkIcon,
    RectangleStackIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, LayersIcon, PaperAirplaneIcon,
    ArrowPathIcon, ArrowsRightLeftIcon, HandThumbUpIcon, HandThumbDownIcon, MagnifyingGlassIcon,
    InformationCircleIcon, ComputerDesktopIcon, SparklesIcon
} from './icons';
import { DuplicateComparisonModal } from './DuplicateComparisonModal';
import { LoadingSpinner } from './LoadingSpinner';

const CATEGORIES = ["Fattura", "Ricevuta", "Multa", "Assicurazione", "RapportoMedico", "EstrattoConto", "Contratto", "Lettera", "Volantino", "Pubblicità", "Altro"];


const ResultItem: React.FC<{
    item: ProcessedPageResult;
    onUpdate: (updatedResult: ProcessedPageResult) => void;
    onConfirmDuplicate: (pageNumber: number) => void;
    onDenyDuplicate: (pageNumber: number) => void;
    onRetryScan: (pageNumber: number) => void;
    isRetrying: boolean;
    isTutorialTarget?: boolean;
}> = ({ item, onUpdate, onConfirmDuplicate, onDenyDuplicate, onRetryScan, isRetrying, isTutorialTarget }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableAnalysis, setEditableAnalysis] = useState(item.analysis);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isShowingOriginal, setIsShowingOriginal] = useState(false);
    const [isComparingDuplicates, setIsComparingDuplicates] = useState(false);
    const [extractedImageToView, setExtractedImageToView] = useState<{url: string, alt: string} | null>(null);
    const [uuidCopied, setUuidCopied] = useState(false);
    
    useEffect(() => { setEditableAnalysis(item.analysis); }, [item.analysis]);

    const handleSave = () => { onUpdate({ ...item, analysis: editableAnalysis }); setIsEditing(false); };
    const handleCancel = () => { setEditableAnalysis(item.analysis); setIsEditing(false); };
    const handleFieldChange = (field: keyof typeof editableAnalysis, value: any) => { setEditableAnalysis(prev => ({ ...prev, [field]: value })); };
    const handleKeyValueChange = (index: number, keyOrValue: 'chiave' | 'valore', value: string) => {
        const newDati = [...editableAnalysis.datiEstratti];
        newDati[index] = { ...newDati[index], [keyOrValue]: value };
        handleFieldChange('datiEstratti', newDati);
    };
    const handleAddKeyValue = () => handleFieldChange('datiEstratti', [...editableAnalysis.datiEstratti, { chiave: '', valore: '' }]);
    const handleRemoveKeyValue = (index: number) => handleFieldChange('datiEstratti', editableAnalysis.datiEstratti.filter((_, i) => i !== index));

    const handleFeedback = (feedback: 'good' | 'bad') => {
        const newFeedback = item.feedback === feedback ? undefined : feedback;
        onUpdate({ ...item, feedback: newFeedback });
    };
    
    const handleCopyUuid = () => {
        navigator.clipboard.writeText(item.uuid).then(() => {
            setUuidCopied(true);
            setTimeout(() => setUuidCopied(false), 2000);
        });
    };

    const qualityBadge = {
        'Ottima': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        'Buona': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Sufficiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'Parziale': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        'Bassa': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
        'ERRORE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }[item.analysis.qualitaScansione] || 'bg-slate-100 text-slate-800';
    
    const modeMetadata = {
        quality: { color: 'bg-purple-500', name: 'Pixel Perfect' },
        speed: { color: 'bg-yellow-500', name: 'Flash' },
        business: { color: 'bg-green-500', name: 'Multi-Task' },
    };
    
    const showRetry = item.analysis.categoria === 'ERRORE' || ['Bassa', 'Parziale'].includes(item.analysis.qualitaScansione);
    const isSafe = item.securityCheck?.isSafe ?? true;

    if (item.isPotentialDuplicateOf) {
        return (
            <>
            {isComparingDuplicates && (
                <DuplicateComparisonModal 
                    originalImageUrl={item.isPotentialDuplicateOf.originalImageDataUrl}
                    currentImageUrl={item.originalImageDataUrl}
                    onClose={() => setIsComparingDuplicates(false)}
                />
            )}
             <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg shadow-md border border-amber-400/50 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <img src={item.originalImageDataUrl} alt={`Pagina ${item.pageNumber}`} className="w-20 h-28 object-cover rounded-md border"/>
                    </div>
                    <div className="flex-grow">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full w-fit bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                            <DocumentDuplicateIcon className="w-4 h-4"/>
                            <span>Potenziale Duplicato</span>
                        </span>
                        <p className="font-bold text-lg text-amber-900 dark:text-amber-100 mt-2">Corrispondenza Trovata</p>
                        <p className="text-sm text-amber-800 dark:text-amber-300">Questo documento sembra identico a '{item.isPotentialDuplicateOf.sourceFileName}'.</p>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-amber-200 dark:border-amber-700/50 pt-3">
                    <button onClick={() => setIsComparingDuplicates(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md shadow-sm">
                        <ArrowsRightLeftIcon className="w-4 h-4" /> Confronta
                    </button>
                    <button onClick={() => onDenyDuplicate(item.pageNumber)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-700 rounded-md shadow-sm">
                        <CheckCircleIcon className="w-4 h-4" /> Non è un duplicato
                    </button>
                    <button onClick={() => onConfirmDuplicate(item.pageNumber)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700 rounded-md shadow-sm">
                        <TrashIcon className="w-4 h-4" /> Conferma Duplicato
                    </button>
                </div>
            </div>
            </>
        )
    }

    // Rendering normale
    return (
        <div id={isTutorialTarget ? 'tutorial-page-details' : undefined} className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-purple-400 dark:hover:ring-purple-600 flex flex-col">
            {isImageModalOpen && (
                 <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsImageModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 w-full max-w-4xl max-h-[90vh] flex flex-col gap-4 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.sourceFileName}</h3>
                            <button onClick={() => setIsImageModalOpen(false)} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-grow min-h-0">
                            <img src={isShowingOriginal ? item.originalImageDataUrl : item.processedImageDataUrl} alt="Documento" className="w-full h-full object-contain"/>
                        </div>
                        <div className="flex-shrink-0 text-center">
                            <button onClick={() => setIsShowingOriginal(s => !s)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg">
                                Mostra {isShowingOriginal ? 'Elaborata' : 'Originale'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {extractedImageToView && (
                 <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setExtractedImageToView(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 w-full max-w-lg max-h-[80vh] flex flex-col gap-4 relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{extractedImageToView.alt}</h3>
                        <div className="flex-grow min-h-0 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                            <img src={extractedImageToView.url} alt={extractedImageToView.alt} className="w-full h-full object-contain" />
                        </div>
                        <button onClick={() => setExtractedImageToView(null)} className="mt-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg self-center">Chiudi</button>
                    </div>
                </div>
            )}

            <div className="p-3 flex flex-col sm:flex-row gap-3 flex-grow">
                <div className="relative flex-shrink-0 w-full sm:w-20 h-40 sm:h-28">
                     <img 
                        src={item.processedImageDataUrl} 
                        alt={`Anteprima pagina ${item.pageNumber}`} 
                        className="w-full h-full object-cover rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer"
                        onClick={() => setIsImageModalOpen(true)}
                     />
                    <button onClick={() => setIsImageModalOpen(true)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md"><EyeIcon className="w-8 h-8 text-white" /></button>
                </div>
                
                <div className="flex-grow min-w-0">
                    { !isEditing ? (
                        <div className="flex flex-col h-full">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate" title={item.analysis.soggetto}>{item.analysis.soggetto}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.analysis.riassunto}</p>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-1">
                                <span 
                                    className={`w-2 h-2 rounded-full ${modeMetadata[item.processingMode]?.color || 'bg-slate-400'}`} 
                                    title={`Modalità: ${modeMetadata[item.processingMode]?.name || 'N/A'}`}
                                ></span>
                                <span className="truncate" title={item.sourceFileName}>{item.sourceFileName}</span>
                                <span className="flex-shrink-0 font-mono">
                                    {new Date(item.timestamp).toLocaleTimeString('it-CH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="mt-auto pt-2 flex flex-wrap gap-2 items-center">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${qualityBadge}`}>{item.analysis.qualitaScansione}</span>
                                <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${isSafe ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                    {isSafe ? <ShieldCheckIcon className="w-3.5 h-3.5"/> : <ShieldExclamationIcon className="w-3.5 h-3.5"/>}
                                    {isSafe ? "Sicuro" : "Rischio"}
                                </span>
                                 {item.processedOffline && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                        <ComputerDesktopIcon className="w-3.5 h-3.5" />
                                        Offline
                                    </span>
                                )}
                                <div className="ml-auto flex items-center gap-1">
                                    {isRetrying ? (
                                        <div className="p-1.5"><LoadingSpinner className="w-4 h-4 text-blue-500"/></div>
                                    ) : showRetry && (
                                        <button onClick={() => onRetryScan(item.pageNumber)} title="Riprova analisi" className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <ArrowPathIcon className="w-4 h-4"/>
                                        </button>
                                    )}
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-1"></div>
                                    {uuidCopied ? (
                                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold px-1.5">
                                            <CheckCircleIcon className="w-4 h-4"/>
                                            <span>Copiato!</span>
                                        </div>
                                    ) : (
                                        <button onClick={handleCopyUuid} title="Copia ID univoco (UUID)" className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <DocumentDuplicateIcon className="w-4 h-4"/>
                                        </button>
                                    )}
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-1"></div>
                                    <button onClick={() => handleFeedback('good')} title="Buona analisi" className={`p-1.5 rounded-full transition-colors ${item.feedback === 'good' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                        <HandThumbUpIcon className="w-4 h-4"/>
                                    </button>
                                    <button onClick={() => handleFeedback('bad')} title="Analisi da migliorare" className={`p-1.5 rounded-full transition-colors ${item.feedback === 'bad' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                        <HandThumbDownIcon className="w-4 h-4"/>
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ml-1">
                                        <PencilIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500">Soggetto</label>
                                <input type="text" value={editableAnalysis.soggetto} onChange={e => handleFieldChange('soggetto', e.target.value)} className="w-full p-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border-slate-300 dark:border-slate-600" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Categoria</label>
                                <select value={editableAnalysis.categoria} onChange={e => handleFieldChange('categoria', e.target.value)} className="w-full p-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border-slate-300 dark:border-slate-600">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
             {isEditing && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                     <p className="text-xs font-medium text-slate-500 mb-2">Dati Estratti</p>
                     <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {editableAnalysis.datiEstratti.map((d, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input type="text" placeholder="Chiave" value={d.chiave} onChange={e => handleKeyValueChange(i, 'chiave', e.target.value)} className="flex-1 p-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border-slate-300 dark:border-slate-600" />
                                <input type="text" placeholder="Valore" value={d.valore} onChange={e => handleKeyValueChange(i, 'valore', e.target.value)} className="flex-1 p-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border-slate-300 dark:border-slate-600" />
                                <button onClick={() => handleRemoveKeyValue(i)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600"><XMarkIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                     </div>
                     <button onClick={handleAddKeyValue} className="mt-2 text-sm flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold"><PlusCircleIcon className="w-4 h-4"/> Aggiungi</button>
                    <div className="flex gap-2 justify-end mt-4">
                        <button onClick={handleCancel} className="px-3 py-1.5 text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300">Annulla</button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-sm font-semibold bg-purple-600 text-white rounded-md hover:bg-purple-700">Salva</button>
                    </div>
                </div>
            )}
             {item.extractedImages && item.extractedImages.length > 0 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                    <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Immagini Estratte</h5>
                    <div className="flex flex-wrap gap-2">
                        {item.extractedImages.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.imageDataUrl}
                                    alt={img.description}
                                    className="w-16 h-16 object-contain rounded-md border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-pointer"
                                    onClick={() => setExtractedImageToView({ url: img.imageDataUrl, alt: img.description })}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center p-1 pointer-events-none">
                                    <p className="text-white text-xs text-center line-clamp-2">{img.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const DocumentGroupItem = forwardRef<HTMLDivElement, {
    group: DocumentGroup;
    isFirst: boolean;
    groupIndex: number;
    onUpdateResult: (updatedResult: ProcessedPageResult) => void;
    onConfirmDuplicate: (pageNumber: number) => void;
    onDenyDuplicate: (pageNumber: number) => void;
    onSendToApp: (group: DocumentGroup, targetApp: 'archivio' | 'polizze' | 'disdette') => void;
    onSelect: (groupId: string) => void;
    isSelected: boolean;
    onUngroup: (groupId: string) => void;
    onRetryScan: (pageNumber: number) => void;
    retryingPageIds: number[];
    isExpanded: boolean;
    onToggleExpand: () => void;
}>(({ group, isFirst, groupIndex, onUpdateResult, onConfirmDuplicate, onDenyDuplicate, onSendToApp, onSelect, isSelected, onUngroup, onRetryScan, retryingPageIds, isExpanded, onToggleExpand }, ref) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        const zip = new JSZip();
        for (const page of group.pages) {
            const response = await fetch(page.processedImageDataUrl);
            const blob = await response.blob();
            const fileName = page.sourceFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            zip.file(`${fileName}_pag_${page.pageInfo.currentPage}.jpg`, blob);
        }
        zip.generateAsync({ type: 'blob' }).then(content => {
            const zipFileName = group.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            saveAs(content, `${zipFileName}.zip`);
        });
        setDownloading(false);
    };
    
    const targetApp = group.category === 'Assicurazione' ? 'polizze' : 'archivio';
    const otherApp = targetApp === 'polizze' ? 'archivio' : 'polizze';
    const OtherLogo = otherApp === 'polizze' ? PolizzeChLogoIcon : ArchivioChLogoIcon;


    return (
        <div 
            ref={ref} 
            id={isFirst ? 'tutorial-document-group' : undefined}
            data-context-menu-group-id={group.id} 
            className={`bg-slate-50 dark:bg-slate-800/30 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/80 overflow-hidden ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
        >
            <header 
                 id={isFirst ? 'tutorial-group-actions' : undefined}
                 className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
             >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <input type="checkbox" checked={isSelected} onChange={() => onSelect(group.id)} className={`w-5 h-5 rounded text-purple-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-purple-500 tutorial-group-checkbox-${groupIndex}`} />
                    <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 truncate" title={group.title}>{group.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${group.isSafe ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{group.isSafe ? 'Sicuro' : 'Non Sicuro'}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{group.category} • {group.pageCount} pagin{group.pageCount === 1 ? 'a' : 'e'}</span>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                     <button onClick={handleDownload} disabled={downloading} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                        {downloading ? <LoadingSpinner className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5"/>}
                    </button>
                     <div className="relative group">
                         <button onClick={() => onSendToApp(group, targetApp)} disabled={!group.isSafe} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${!group.isSafe ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                             <PaperAirplaneIcon className="w-4 h-4" /> Sposta in {targetApp}
                         </button>
                         <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <button onClick={() => onSendToApp(group, otherApp)} disabled={!group.isSafe} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">
                                <OtherLogo className="w-4 h-4" />
                                <span>Sposta in {otherApp}</span>
                            </button>
                         </div>
                     </div>
                     <button onClick={onToggleExpand} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                        {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                    </button>
                </div>
            </header>
            {isExpanded && (
                <div className="bg-slate-100 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    {group.pages.map((item, index) => (
                        <ResultItem
                            key={item.pageNumber}
                            item={item}
                            onUpdate={onUpdateResult}
                            onConfirmDuplicate={onConfirmDuplicate}
                            onDenyDuplicate={onDenyDuplicate}
                            onRetryScan={onRetryScan}
                            isRetrying={retryingPageIds.includes(item.pageNumber)}
                            isTutorialTarget={isFirst && index === 0}
                        />
                    ))}
                </div>
            )}
        </div>
    )
});

interface ResultsDisplayProps {
    documentGroups: DocumentGroup[];
    isLoading: boolean;
    selectedGroupIds: string[];
    isDownloadingSelection: boolean;
    canUndo: boolean;
    canRedo: boolean;
    expandedGroups: string[];
    retryingPageIds: number[];
    scrollToGroupId: string | null;
    onClear: () => void;
    onUpdateResult: (updatedResult: ProcessedPageResult) => void;
    onUpdateGroupTags: (groupId: string, newTags: string[]) => void;
    onConfirmDuplicate: (pageNumber: number) => void;
    onDenyDuplicate: (pageNumber: number) => void;
    onSendToApp: (group: DocumentGroup, targetApp: 'archivio' | 'polizze' | 'disdette') => void;
    onSendAll: () => void;
    onMoveSelectedToDefault: () => void;
    onDownloadSelected: () => void;
    onSelectGroup: (groupId: string) => void;
    onDeselectAll: () => void;
    onMergeGroups: () => void;
    onUngroup: (groupId: string) => void;
    onRetryGrouping: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onRetryScan: (pageNumber: number) => void;
    onToggleExpandGroup: (groupId: string) => void;
    onScrolledToGroup: () => void;
    onUgoSummarize: (groupIds: string[]) => void;
    onStartDemo: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = (props) => {
    const {
        documentGroups,
        isLoading,
        selectedGroupIds,
        isDownloadingSelection,
        canUndo,
        canRedo,
        onClear,
        onSendAll,
        onMoveSelectedToDefault,
        onDownloadSelected,
        onDeselectAll,
        onMergeGroups,
        onRetryGrouping,
        onUndo,
        onRedo,
        onUgoSummarize,
        onStartDemo,
    } = props;

    const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (props.scrollToGroupId && groupRefs.current[props.scrollToGroupId]) {
            groupRefs.current[props.scrollToGroupId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            props.onScrolledToGroup();
        }
    }, [props.scrollToGroupId, props.onScrolledToGroup]);


    const isMultiSelectActive = selectedGroupIds.length > 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">3. Risultati</h2>
                <div className="flex items-center gap-2">
                    <button onClick={onStartDemo} className="px-3 py-1.5 text-sm font-semibold bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5">
                        <SparklesIcon className="w-4 h-4" /> Prova Demo
                    </button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                    <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                    <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ArrowUturnRightIcon className="w-5 h-5"/></button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={onSendAll} className="px-3 py-1.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Invia Tutto</button>
                    <button onClick={onClear} className="px-3 py-1.5 text-sm font-semibold bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors">Pulisci Sessione</button>
                </div>
            </div>
            
            {isMultiSelectActive && (
                <div id="tutorial-bulk-actions" className="sticky top-20 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">{selectedGroupIds.length} fascicoli selezionati</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => onUgoSummarize(selectedGroupIds)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                            <ChatBubbleLeftRightIcon className="w-5 h-5"/> Chiedi a Ugo
                        </button>
                        <button onClick={onMoveSelectedToDefault} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                            <PaperAirplaneIcon className="w-5 h-5"/> Sposta Selezionati
                        </button>
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-600"></div>
                        <button onClick={onDeselectAll} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">Deseleziona</button>
                        <button onClick={onMergeGroups} disabled={selectedGroupIds.length < 2} className="px-3 py-1.5 text-sm font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50">Unisci</button>
                        <button onClick={onRetryGrouping} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Correggi Gruppo</button>
                        <button onClick={onDownloadSelected} disabled={isDownloadingSelection} className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-200 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300 disabled:opacity-50">
                            {isDownloadingSelection ? 'Creazione ZIP...' : 'Scarica ZIP'}
                        </button>
                    </div>
                </div>
            )}
            
            <div className="space-y-6">
                {documentGroups.map((group, index) => (
                    <DocumentGroupItem
                        ref={el => { groupRefs.current[group.id] = el; }}
                        key={group.id}
                        group={group}
                        isFirst={index === 0}
                        groupIndex={index}
                        onUpdateResult={props.onUpdateResult}
                        onConfirmDuplicate={props.onConfirmDuplicate}
                        onDenyDuplicate={props.onDenyDuplicate}
                        onSendToApp={props.onSendToApp}
                        onSelect={props.onSelectGroup}
                        isSelected={selectedGroupIds.includes(group.id)}
                        onUngroup={props.onUngroup}
                        onRetryScan={props.onRetryScan}
                        retryingPageIds={props.retryingPageIds}
                        isExpanded={props.expandedGroups.includes(group.id)}
                        onToggleExpand={() => props.onToggleExpandGroup(group.id)}
                    />
                ))}
            </div>
            {isLoading && (
                 <div className="text-center p-8 text-slate-500">
                    <LoadingSpinner />
                    <p className="mt-2">Nuovi risultati in arrivo...</p>
                </div>
            )}
        </div>
    );
};