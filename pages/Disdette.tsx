import React, { useState, useEffect } from 'react';
import type { ProcessedPageResult } from '../services/geminiService';
import type { User } from '../services/authService';
import { generateDisdettaPdf, type DisdettaData } from '../services/pdfService';
import { DisdetteChLogoIcon, DisdetteChWordmarkIcon, DocumentTextIcon, DocumentPlusIcon, XMarkIcon, DownloadIcon, InformationCircleIcon, TrashIcon } from '../components/icons';

interface DisdetteProps {
    disdetteDocs: ProcessedPageResult[];
    user: User;
    onCreateDisdetta: (data: DisdettaData) => Promise<void>;
    onUpdateDocument: (doc: ProcessedPageResult) => void;
    onDeleteDocument: (doc: ProcessedPageResult) => void;
    isWizardOpen: boolean;
    onWizardOpen: () => void;
    onWizardClose: () => void;
    initialData: Partial<DisdettaData> | null;
}

const DisdettaItem: React.FC<{ item: ProcessedPageResult, onDownload: (data: DisdettaData) => void, onDelete: () => void, user: User }> = ({ item, onDownload, onDelete, user }) => {
    const datiEstratti = item.analysis.datiEstratti.reduce((acc, curr) => {
        acc[curr.chiave] = curr.valore;
        return acc;
    }, {} as Record<string, string>);

    const handleDownloadClick = () => {
        onDownload({
            recipientName: datiEstratti['Destinatario'],
            recipientAddress: datiEstratti['Indirizzo Destinatario'],
            contractDescription: datiEstratti['Oggetto Contratto'],
            contractNumber: datiEstratti['Numero Contratto'],
            effectiveDate: datiEstratti['Data Disdetta'],
            userName: user.name,
            userAddress: datiEstratti['Indirizzo Mittente'],
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex items-center gap-4 transition-transform transform hover:scale-[1.02]">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-green-700 dark:text-green-300"/>
            </div>
            <div className="flex-grow min-w-0">
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{item.analysis.soggetto}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{item.analysis.riassunto}</p>
            </div>
            <div className="text-right flex-shrink-0">
                 <p className="text-xs text-slate-500 dark:text-slate-400">Data effetto</p>
                 <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{new Date(item.analysis.dataDocumento).toLocaleDateString('it-CH')}</p>
            </div>
            <button onClick={handleDownloadClick} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700" title="Scarica PDF">
                <DownloadIcon className="w-5 h-5 text-slate-500"/>
            </button>
            <button onClick={onDelete} className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50" title="Elimina">
                <TrashIcon className="w-5 h-5 text-red-500"/>
            </button>
        </div>
    );
}

const DisdettaWizard: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: DisdettaData) => void,
    user: User,
    initialData: Partial<DisdettaData> | null,
}> = ({ isOpen, onClose, onSave, user, initialData }) => {
    const [formData, setFormData] = useState<Omit<DisdettaData, 'userName'>>({
        recipientName: '',
        recipientAddress: '',
        contractDescription: '',
        contractNumber: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        userAddress: user.address || '',
    });
    
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                userAddress: user.address || '',
                recipientName: initialData?.recipientName || '',
                recipientAddress: initialData?.recipientAddress || '',
                contractDescription: initialData?.contractDescription || '',
                contractNumber: initialData?.contractNumber || '',
                effectiveDate: initialData?.effectiveDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days from now
            }));
        }
    }, [initialData, user.address, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            ...formData, 
            userName: user.name,
        });
    };

    if (!isOpen) return null;
    
    const isAddressConfirmed = !!user.address && user.addressConfirmed;
    const canCreateDisdetta = isAddressConfirmed;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Crea Nuova Disdetta</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">1. I tuoi dati (Mittente)</h3>
                        {!canCreateDisdetta && (
                            <div className="p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm flex items-start gap-2">
                                <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Per creare una disdetta legalmente valida, è necessario prima inserire e confermare il tuo indirizzo di residenza nella pagina <strong>Profilo</strong>.</span>
                            </div>
                        )}
                        <textarea name="userAddress" value={formData.userAddress} readOnly={true} placeholder="Il tuo indirizzo completo (configura e conferma dal tuo profilo)" required rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md read-only:bg-slate-200 dark:read-only:bg-slate-600 border-slate-300 dark:border-slate-600"/>
                        
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-4 border-t border-slate-200 dark:border-slate-700">2. Dati del Destinatario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="Nome azienda/destinatario" required className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-600" disabled={!canCreateDisdetta}/>
                             <textarea name="recipientAddress" value={formData.recipientAddress} onChange={handleChange} placeholder="Indirizzo completo del destinatario" required rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md md:col-span-2 disabled:opacity-50 border-slate-300 dark:border-slate-600" disabled={!canCreateDisdetta}></textarea>
                        </div>
                         <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-4 border-t border-slate-200 dark:border-slate-700">3. Dettagli del Contratto</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="contractDescription" value={formData.contractDescription} onChange={handleChange} placeholder="Oggetto (es. Abbonamento Palestra)" required className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-600" disabled={!canCreateDisdetta}/>
                            <input name="contractNumber" value={formData.contractNumber} onChange={handleChange} placeholder="N. contratto (opzionale)" className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-600" disabled={!canCreateDisdetta}/>
                            <div>
                                <label className="text-sm text-slate-500 dark:text-slate-400">Data di decorrenza disdetta</label>
                                <input name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleChange} required className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-600" disabled={!canCreateDisdetta}/>
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 flex-shrink-0 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold bg-slate-200 dark:bg-slate-600 rounded-lg">Annulla</button>
                        <button type="submit" className="px-4 py-2 font-bold bg-green-600 text-white rounded-lg disabled:bg-slate-400" disabled={!canCreateDisdetta}>Crea e Scarica PDF</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const Disdette: React.FC<DisdetteProps> = ({ disdetteDocs, user, onCreateDisdetta, onUpdateDocument, onDeleteDocument, isWizardOpen, onWizardOpen, onWizardClose, initialData }) => {
    
    const handleSaveWizard = async (data: DisdettaData) => {
        await onCreateDisdetta(data);
        generateDisdettaPdf(data);
        onWizardClose();
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <DisdetteChLogoIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <DisdetteChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
                        <p className="text-slate-500 dark:text-slate-400">Genera e gestisci le tue disdette contrattuali.</p>
                    </div>
                </div>
                 <button onClick={onWizardOpen} className="flex items-center gap-2 px-4 py-2 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md">
                    <DocumentPlusIcon className="w-5 h-5"/>
                    <span>Nuova Disdetta</span>
                </button>
            </div>

            {disdetteDocs.length > 0 ? (
                <div className="space-y-4">
                    {disdetteDocs.map(item => (
                        <DisdettaItem key={item.uuid} item={item} onDownload={generateDisdettaPdf} onDelete={() => onDeleteDocument(item)} user={user} />
                    ))}
                </div>
            ) : (
                 <div className="text-center p-10 mt-4 bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <DocumentTextIcon className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        Nessuna Disdetta Trovata
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Crea la tua prima lettera di disdetta cliccando su "Nuova Disdetta".
                    </p>
                </div>
            )}
            
            <DisdettaWizard 
                isOpen={isWizardOpen}
                onClose={onWizardClose}
                onSave={handleSaveWizard}
                user={user}
                initialData={initialData}
            />

        </div>
    );
};

export default Disdette;