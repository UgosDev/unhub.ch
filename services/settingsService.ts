import { type ProcessingMode } from './geminiService';

export interface AppSettings {
    defaultProcessingMode: ProcessingMode;
    primaryModes: [ProcessingMode, ProcessingMode];
    autoArchiveDocuments: boolean;
    enableOfflineFallback: boolean;
    autoLogoutEnabled: boolean;
    autoLogoutMinutes: number;
    chatbotProactiveAssist: boolean;
    ugoContextAwarenessEnabled: boolean;
    ugoArchivioEnabled: boolean;
    ugoDisdetteEnabled: boolean;
    ugoImplicitFeedbackEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
    defaultProcessingMode: 'quality',
    primaryModes: ['quality', 'scontrino'],
    autoArchiveDocuments: true,
    enableOfflineFallback: true,
    autoLogoutEnabled: true,
    autoLogoutMinutes: 15,
    chatbotProactiveAssist: true,
    ugoContextAwarenessEnabled: true,
    ugoArchivioEnabled: true,
    ugoDisdetteEnabled: true,
    ugoImplicitFeedbackEnabled: false,
};

const SETTINGS_KEY = 'scansioni_app_settings';

export const getSettings = (): AppSettings => {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        }
    } catch (e) {
        console.error('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings to localStorage', e);
    }
};
