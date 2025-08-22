import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, CameraIcon, SparklesIcon, DocumentPlusIcon, GoogleIcon, InformationCircleIcon } from './icons'; 
import type { ProcessingMode } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

// These declarations are necessary to use the Google APIs loaded from script tags
declare const google: any;
declare const gapi: any;


interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onOpenCamera: () => void;
  onOpenEmailImport: () => void;
  processingMode: ProcessingMode;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesSelected, onOpenCamera, onOpenEmailImport, processingMode }) => {
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isFetchingFromDrive, setIsFetchingFromDrive] = useState(false);
  const [isDriveConfigured, setIsDriveConfigured] = useState(false);

  useEffect(() => {
    // Abilita la funzionalità solo se le credenziali necessarie sono presenti nell'ambiente.
    // Questo previene crash se le variabili d'ambiente non sono impostate.
    if (process.env.GOOGLE_CLIENT_ID && process.env.API_KEY) {
        setIsDriveConfigured(true);
    }
      
    const handleGapiReady = () => {
      // gapi.load is used to load specific modules of the GAPI library
      gapi.load('picker', () => setIsGapiReady(true));
    };
    window.addEventListener('gapi-ready', handleGapiReady);

    // If gapi is already on window (e.g. fast refresh), trigger manually
    if (typeof gapi !== 'undefined' && gapi.load) {
      handleGapiReady();
    }
    
    return () => window.removeEventListener('gapi-ready', handleGapiReady);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);
  
  const handleDriveImport = useCallback(() => {
    // This function is only called when the button is enabled, so we assume the env vars are set.
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
    const GOOGLE_API_KEY = process.env.API_KEY!;

    const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
                createPicker(tokenResponse.access_token);
            }
        },
    });

    const createPicker = (accessToken: string) => {
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("application/pdf,image/png,image/jpeg,image/webp");

        const picker = new google.picker.PickerBuilder()
            .setOAuthToken(accessToken)
            .setDeveloperKey(GOOGLE_API_KEY)
            .addView(view)
            .setCallback(async (data: any) => {
                if (data.action === google.picker.Action.PICKED) {
                    setIsFetchingFromDrive(true);
                    try {
                        const filesToQueue: File[] = [];
                        for (const doc of data.docs) {
                            const fileResponse = await fetch(
                                `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
                                { headers: { Authorization: `Bearer ${accessToken}` } }
                            );
                            if (!fileResponse.ok) {
                                throw new Error(`Failed to download file: ${doc.name}`);
                            }
                            const blob = await fileResponse.blob();
                            filesToQueue.push(new File([blob], doc.name, { type: doc.mimeType }));
                        }
                        onFilesSelected(filesToQueue);
                    } catch (error) {
                        console.error("Error fetching files from Google Drive:", error);
                        alert("Si è verificato un errore durante il download dei file da Google Drive.");
                    } finally {
                        setIsFetchingFromDrive(false);
                    }
                }
            })
            .build();
        picker.setVisible(true);
    };

    tokenClient.requestAccessToken({ prompt: '' });
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: true,
  });
  
  const modeStyles: { [key in ProcessingMode]?: { border: string; text: string; hoverBg: string; } } = {
    quality: { border: 'border-purple-500', text: 'text-purple-600 dark:text-purple-400', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
    scontrino: { border: 'border-orange-500', text: 'text-orange-600 dark:text-orange-400', hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20' },
    speed: { border: 'border-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20' },
    business: { border: 'border-green-500', text: 'text-green-600 dark:text-green-400', hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20' },
    book: { border: 'border-blue-500', text: 'text-blue-600 dark:text-blue-400', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    'no-ai': { border: 'border-slate-500', text: 'text-slate-600 dark:text-slate-400', hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-700/50' },
  };
  
  const currentStyle = modeStyles[processingMode] || modeStyles['no-ai']!;
  const isDriveButtonDisabled = !isDriveConfigured || !isGapiReady || isFetchingFromDrive;

  return (
    <div id="tutorial-file-dropzone" className="w-full flex flex-col items-center justify-center p-4 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
      <div
        {...getRootProps()}
        className={`w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ease-in-out
          ${isDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : `${currentStyle.border} ${currentStyle.hoverBg}`}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <FileIcon className="w-12 h-12 mb-3 text-slate-400 dark:text-slate-500" />
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Trascina file qui</p>
          <p className="text-sm mb-2">o clicca per selezionare</p>
          <p className="text-xs">Immagini (PNG, JPG) e PDF.</p>
        </div>
      </div>
       {processingMode === 'scontrino' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 px-2 flex items-center gap-1.5">
                <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
                <span>Per risultati ottimali, assicurati che la foto includa l'intero scontrino.</span>
            </p>
        )}
      <div className="my-3 text-slate-500 dark:text-slate-400 text-sm font-semibold flex items-center w-full">
        <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
        <span className="flex-shrink mx-4">OPPURE</span>
        <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
      </div>
       <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
                onClick={onOpenCamera}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
            >
                <CameraIcon className="w-6 h-6" />
                <span>Fotocamera</span>
            </button>
             <button
                onClick={onOpenEmailImport}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors"
            >
                <DocumentPlusIcon className="w-6 h-6" /> 
                <span>Email</span>
            </button>
            <button
                onClick={handleDriveImport}
                disabled={isDriveButtonDisabled}
                title={!isDriveConfigured ? "Funzionalità Google Drive non configurata dall'amministratore." : "Importa da Google Drive"}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                {isFetchingFromDrive ? <LoadingSpinner className="w-6 h-6" /> : <GoogleIcon className="w-6 h-6" />}
                <span>Drive</span>
            </button>
        </div>
    </div>
  );
};