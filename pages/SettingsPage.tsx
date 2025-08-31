import React, { useState, useEffect } from 'react';
import * as settingsService from '../services/settingsService';
import type { AppSettings } from '../services/settingsService';
import type { ProcessingMode } from '../services/geminiService';
import { ProcessingModeSelector } from '../components/ProcessingModeSelector';
import { LoadingSpinner } from '../components/LoadingSpinner';

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(settingsService.getSettings());
    }, []);

    const handleModeChange = (mode: ProcessingMode) => {
        if (!settings) return;

        const newSettings = { ...settings, defaultProcessingMode: mode };
        setSettings(newSettings);
        setIsSaving(true);
        
        // Simula un salvataggio per dare un feedback visivo
        setTimeout(() => {
            settingsService.saveSettings(newSettings);
            setIsSaving(false);
        }, 300);
    };

    if (!settings) {
        return (
            <div className="flex justify-center items-center p-8">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Impostazioni</h1>

            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Modalità di Elaborazione Predefinita</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Scegli la modalità da usare all'avvio dell'app.</p>
                    </div>
                    {isSaving && (
                         <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <LoadingSpinner className="w-4 h-4" />
                            <span>Salvataggio...</span>
                        </div>
                    )}
                </div>

                <ProcessingModeSelector 
                    currentMode={settings.defaultProcessingMode}
                    onModeChange={handleModeChange}
                    disabled={isSaving}
                />
            </div>
        </div>
    );
};

export default SettingsPage;
