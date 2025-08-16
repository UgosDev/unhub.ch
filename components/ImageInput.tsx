import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, CameraIcon, DocumentPlusIcon, GoogleIcon, InformationCircleIcon } from './icons'; 
import { LoadingSpinner } from './LoadingSpinner';
import type { ProcessingMode } from '../services/geminiService';
import type { PendingFileTask } from '../App';
import { ProcessingModeSelector } from './ProcessingModeSelector';

declare const google: any;
declare const gapi: any;

interface ImageInputProps {
    pendingFileTasks: PendingFileTask[];
    onFilesSelected: (files: File[]) => void;
    onPendingTaskChange: (id: string, updates: Partial<Omit<PendingFileTask, 'id' | 'file'>>) => void;
    onConfirmProcessing: () => void;
    onCancelProcessing: () => void;
    onOpenCamera: () => void;
    onOpenEmailImport: () => void;
}

const FileDropzone: React.FC<{ 
    onFilesSelected: (files: File[]) => void;
    onOpenCamera: () => void;
    onOpenEmailImport: () => void;
}> = ({ onFilesSelected, onOpenCamera, onOpenEmailImport }) => {
    const [isGapiReady, setIsGapiReady] = useState(false);
    const [isFetchingFromDrive, setIsFetchingFromDrive] = useState(false);
    const [isDriveConfigured, setIsDriveConfigured] = useState(false);

    useEffect(() => {
        if (process.env.GOOGLE_CLIENT_ID && process.env.API_KEY) {
            setIsDriveConfigured(true);
        }
        
        const handleGapiReady = () => gapi.load('picker', () => setIsGapiReady(true));
        window.addEventListener('gapi-ready', handleGapiReady);
        if (typeof gapi !== 'undefined' && gapi.load) handleGapiReady();
        return () => window.removeEventListener('gapi-ready', handleGapiReady);
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length) onFilesSelected(acceptedFiles);
    }, [onFilesSelected]);

    const handleDriveImport = useCallback(() => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (tokenResponse: any) => {
                if (tokenResponse?.access_token) {
                    const view = new google.picker.View(google.picker.ViewId.DOCS);
                    view.setMimeTypes("application/pdf,image/png,image/jpeg,image/webp");
                    const picker = new google.picker.PickerBuilder()
                        .setOAuthToken(tokenResponse.access_token)
                        .setDeveloperKey(process.env.API_KEY!)
                        .addView(view)
                        .setCallback(async (data: any) => {
                            if (data.action === google.picker.Action.PICKED) {
                                setIsFetchingFromDrive(true);
                                try {
                                    const files = await Promise.all(data.docs.map(async (doc: any) => {
                                        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } });
                                        const blob = await res.blob();
                                        return new File([blob], doc.name, { type: doc.mimeType });
                                    }));
                                    onFilesSelected(files);
                                } catch (error) {
                                    alert("Errore durante il download da Google Drive.");
                                } finally {
                                    setIsFetchingFromDrive(false);
                                }
                            }
                        })
                        .build();
                    picker.setVisible(true);
                }
            },
        });
        tokenClient.requestAccessToken({ prompt: '' });
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'], 'application/pdf': ['.pdf'] }, multiple: true });

    return (
        <div className="w-full flex flex-col items-center justify-center p-4 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
            <div {...getRootProps()} className={`w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ease-in-out ${isDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <FileIcon className="w-12 h-12 mb-3 text-slate-400 dark:text-slate-500" />
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Trascina file qui</p>
                    <p className="text-sm mb-2">o clicca per selezionare</p>
                    <p className="text-xs">Immagini (PNG, JPG) e PDF.</p>
                </div>
            </div>
            <div className="my-3 text-slate-500 dark:text-slate-400 text-sm font-semibold flex items-center w-full">
                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div><span className="flex-shrink mx-4">OPPURE</span><div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={onOpenCamera} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"><CameraIcon className="w-6 h-6" /><span>Fotocamera</span></button>
                <button onClick={onOpenEmailImport} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors"><DocumentPlusIcon className="w-6 h-6" /> <span>Email</span></button>
                <button onClick={handleDriveImport} disabled={!isDriveConfigured || !isGapiReady || isFetchingFromDrive} title={!isDriveConfigured ? "Funzionalità Google Drive non configurata." : "Importa da Google Drive"} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                    {isFetchingFromDrive ? <LoadingSpinner className="w-6 h-6" /> : <GoogleIcon className="w-6 h-6" />}<span>Drive</span>
                </button>
            </div>
        </div>
    );
};

const PendingFilesView: React.FC<ImageInputProps> = (props) => {
    return (
        <div className="w-full flex flex-col p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 px-1 mb-4">2. Rivedi e Scegli la Modalità</h2>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                {props.pendingFileTasks.map(task => (
                    <div key={task.id} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-3">
                            <p className="font-bold text-slate-700 dark:text-slate-200 truncate pr-2" title={task.file.name}>{task.file.name}</p>
                            {task.isSuggesting && <LoadingSpinner className="w-5 h-5 flex-shrink-0" />}
                        </div>
                        <ProcessingModeSelector 
                            currentMode={task.mode}
                            onModeChange={(newMode) => props.onPendingTaskChange(task.id, { mode: newMode })}
                            shouldExtractImages={task.shouldExtractImages}
                            onShouldExtractImagesChange={(shouldExtract) => props.onPendingTaskChange(task.id, { shouldExtractImages: shouldExtract })}
                            disabled={task.isSuggesting}
                            suggestedMode={task.suggestedMode}
                        />
                    </div>
                ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2">
                <button onClick={props.onCancelProcessing} className="px-4 py-2 font-bold bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg w-full sm:w-auto">Annulla</button>
                <button onClick={props.onConfirmProcessing} className="px-4 py-2 font-bold bg-purple-600 text-white rounded-lg w-full sm:flex-grow">
                    Elabora {props.pendingFileTasks.length} file
                </button>
            </div>
        </div>
    );
};


export const ImageInput: React.FC<ImageInputProps> = (props) => {
    if (props.pendingFileTasks.length > 0) {
        return <PendingFilesView {...props} />;
    }

    return (
        <FileDropzone 
            onFilesSelected={props.onFilesSelected}
            onOpenCamera={props.onOpenCamera}
            onOpenEmailImport={props.onOpenEmailImport}
        />
    );
};
