import React, { useState, useEffect } from 'react';
// FIX: Import AddressBookEntry type.
import type { ProcessedPageResult, AddressBookEntry } from '../services/geminiService';
import type { User } from '../services/authService';
import { generateDisdettaPdf, type DisdettaData } from '../services/pdfService';
import { DisdetteChLogoIcon, DisdetteChWordmarkIcon, DocumentTextIcon, DocumentPlusIcon, XMarkIcon, DownloadIcon, InformationCircleIcon, ClockIcon } from '../components/icons';

interface DisdetteProps {
    disdetteDocs: ProcessedPageResult[];
    user: User;
    onCreateDisdetta: (data: DisdettaData, status: 'Bozza' | 'Generata', reminderDate?: string) => Promise<void>;
    onUpdateDisdetta: (doc: ProcessedPageResult) => Promise<void>;
    isWizardOpen: boolean;
    onWizardOpen: () => void;
    onWizardClose: () => void;
    initialData: Partial<DisdettaData> | null;
    onNavigateToSection: (sectionId: string) => void;
    onAskUgo: (query: string) => void;
    // FIX: Add missing addressBook prop.
    addressBook: AddressBookEntry[];
}

const DisdettaItem: React.FC<{ item: ProcessedPageResult, onDownload: (data: DisdettaData) => void, user: User }> = ({ item, onDownload, user }) => {
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-green-700 dark:text-green-300"/>
            </div>
            <div className="flex-grow min-w-0">
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{item.analysis.soggetto}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{item.analysis.riassunto}</p>
                 {item.reminderDate && (
                    <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>Promemoria: {new Date(item.reminderDate).toLocaleDateString('it-CH')}</span>
                    </div>
                )}
            </div>
            <div className="text-right flex-shrink-0">
                 <p className="text-xs text-slate-500 dark:text-slate-400">Data effetto</p>
                 <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{new Date(item.analysis.dataDocumento).toLocaleDateString('it-CH')}</p>
            </div>
            <button onClick={handleDownloadClick} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                <DownloadIcon className="w-5 h-5 text-slate-500"/>
            </button>
        </div>
    );
}

interface DisdettaWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DisdettaData, wantsReminder: boolean) => void;
    user: User;
    initialData: Partial<DisdettaData> | null;
    onNavigateToSection: (sectionId: string) => void;
    onAskUgo: (query: string) => void;
    // FIX: Add missing addressBook prop.
    addressBook: AddressBookEntry[];
}


const DisdettaWizard: React.FC<DisdettaWizardProps> = ({ isOpen, onClose, onSave, user, initialData, onNavigateToSection, onAskUgo, addressBook }) => {
    const userFullAddress = [
        user.addressStreet,
        `${user.addressZip || ''} ${user.addressCity || ''}`.trim(),
        user.addressCountry
    ].filter(Boolean).join('\n');

    const [formData, setFormData] = useState<Omit<DisdettaData, 'userName'>>({
        recipientName: '',
        recipientAddress: '',
        contractDescription: '',
        contractNumber: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        userAddress: userFullAddress || '',
    });
    const [wantsReminder, setWantsReminder] = useState(false);
    
    useEffect(() => {
        const userFullAddress = [
            user.addressStreet,
            `${user.addressZip || ''} ${user.addressCity || ''}`.trim(),
            user.addressCountry
        ].filter(Boolean).join('\n');

        setFormData(prev => ({
            ...prev,
            userAddress: userFullAddress || '',
            recipientName: initialData?.recipientName || '',
            recipientAddress: initialData?.recipientAddress || '',
            contractDescription: initialData?.contractDescription || '',
            contractNumber: initialData?.contractNumber || '',
            effectiveDate: initialData?.effectiveDate || new Date().toISOString().split('T')[0],
        }));
        setWantsReminder(false); // Reset reminder on open
    }, [initialData, user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // FIX: Implement address autofill from address book.
        if (name === 'recipientName') {
            const matchingEntry = addressBook.find(entry => entry.name === value);
            if (matchingEntry) {
                setFormData(prev => ({ ...prev, recipientAddress: matchingEntry.address }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(
            { ...formData, userName: user.name },
            wantsReminder
        );
    };

    if (!isOpen) return null;
    
    const isAddressConfirmed = !!user.addressStreet && user.addressConfirmed;
    const canCreateDisdetta = isAddressConfirmed;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col">
                <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Crea Nuova Disdetta</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">1. I tuoi dati (Mittente)</h3>
                        {!canCreateDisdetta && (
                            <div className="p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                                    <span>Per continuare, per favore inserisci e conferma il tuo indirizzo di residenza.</span>
                                </div>
                                <div className="flex items-center gap-2 pl-7">
                                    <button 
                                        type="button"
                                        onClick={() => onNavigateToSection('address')} 
                                        className="font-bold underline hover:text-yellow-900 dark:hover:text-yellow-100"
                                    >
                                        Vai al Profilo
                                    </button>
                                    <span className="text-yellow-600 dark:text-yellow-400">|</span>
                                    <button 
                                        type="button"
                                        onClick={() => onAskUgo('Perché devo confermare il mio indirizzo per creare una disdetta?')} 
                                        className="font-bold underline hover:text-yellow-900 dark:hover:text-yellow-100"
                                    >
                                        Chiedi a Ugo
                                    </button>
                                </div>
                            </div>
                        )}
                        <textarea name="userAddress" value={formData.userAddress} readOnly={isAddressConfirmed} placeholder="Il tuo indirizzo completo (configura dal profilo)" required rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50 read-only:bg-slate-200 dark:read-only:bg-slate-600" disabled={!canCreateDisdetta}/>
                        
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-4 border-t border-slate-200 dark:border-slate-700">2. Dati del Destinatario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* FIX: Add datalist for address book suggestions */}
                            <input list="address-book-recipients" name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="Nome azienda/destinatario" required className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50 md:col-span-2" disabled={!canCreateDisdetta}/>
                            <datalist id="address-book-recipients">
                                {addressBook.map((entry) => <option key={entry.id} value={entry.name} />)}
                            </datalist>
                            <textarea name="recipientAddress" value={formData.recipientAddress} onChange={handleChange} placeholder="Indirizzo completo del destinatario" required rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md md:col-span-2 disabled:opacity-50" disabled={!canCreateDisdetta}></textarea>
                        </div>
                         <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-4 border-t border-slate-200 dark:border-slate-700">3. Dettagli del Contratto</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="contractDescription" value={formData.contractDescription} onChange={handleChange} placeholder="Oggetto (es. Abbonamento Palestra)" required className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50" disabled={!canCreateDisdetta}/>
                            <input name="contractNumber" value={formData.contractNumber} onChange={handleChange} placeholder="N. contratto (opzionale)" className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50" disabled={!canCreateDisdetta}/>
                            <div>
                                <label className="text-sm text-slate-500 dark:text-slate-400">Data di scadenza effettiva della disdetta</label>
                                <input name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleChange} required className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md disabled:opacity-50" disabled={!canCreateDisdetta}/>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                             <label className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg cursor-pointer disabled:opacity-50">
                                <input
                                    type="checkbox"
                                    checked={wantsReminder}
                                    onChange={e => setWantsReminder(e.target.checked)}
                                    className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
                                    disabled={!canCreateDisdetta}
                                />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Imposta un promemoria per questa data</span>
                            </label>
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

const Disdette: React.FC<DisdetteProps> = ({ disdetteDocs, user, onCreateDisdetta, onUpdateDisdetta, isWizardOpen, onWizardOpen, onWizardClose, initialData, onNavigateToSection, onAskUgo, addressBook }) => {

    const handleSaveAndDownload = async (data: DisdettaData, wantsReminder: boolean) => {
        const reminderDate = wantsReminder ? data.effectiveDate : undefined;
        await onCreateDisdetta(data, 'Generata', reminderDate);
        generateDisdettaPdf(data);
        onWizardClose();
    };

    const sortedDocs = [...disdetteDocs].sort((a, b) => 
        new Date(a.analysis.dataDocumento).getTime() - new Date(b.analysis.dataDocumento).getTime()
    );

    return (
        <>
            <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <DisdetteChLogoIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <DisdetteChWordmarkIcon className="h-7 text-slate-800 dark:text-slate-200" />
                            <p className="text-slate-500 dark:text-slate-400">Gestisci le tue disdette in modo semplice e veloce.</p>
                        </div>
                    </div>
                    <button onClick={onWizardOpen} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        <DocumentPlusIcon className="w-5 h-5" />
                        Crea Nuova Disdetta
                    </button>
                </div>

                {sortedDocs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {sortedDocs.map((item) => (
                            <DisdettaItem key={item.uuid} item={item} onDownload={generateDisdettaPdf} user={user} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border border-dashed border-slate-300 dark:border-slate-700">
                        <DocumentTextIcon className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Nessuna Disdetta</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                           Crea la tua prima lettera di disdetta usando il wizard guidato. I documenti appariranno qui.
                        </p>
                    </div>
                )}
            </div>
            <DisdettaWizard
                isOpen={isWizardOpen}
                onClose={onWizardClose}
                onSave={handleSaveAndDownload}
                user={user}
                initialData={initialData}
                onNavigateToSection={onNavigateToSection}
                onAskUgo={onAskUgo}
                addressBook={addressBook}
            />
        </>
    );
};

export default Disdette;
