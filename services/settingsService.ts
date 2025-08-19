import type { ProcessingMode } from './geminiService';

export type MenuActionId = 'select' | 'expand' | 'send' | 'downloadZip' | 'downloadPdf' | 'ungroup';

export interface AppSettings {
    defaultProcessingMode: ProcessingMode;
    welcomeBannerDismissed: boolean;
    primaryModes: [ProcessingMode, ProcessingMode];
    theme?: 'light' | 'dark' | 'system';
    enableOfflineFallback: boolean;
    autoLogoutEnabled: boolean;
    autoLogoutMinutes: number;
    chatbotProactiveAssist: boolean;
    ugoContextAwarenessEnabled: boolean;
    circularMenuActions: (MenuActionId | null)[];
    autoArchiveDocuments: boolean;
    ugoArchivioEnabled: boolean;
    ugoDisdetteEnabled: boolean;
    ugoImplicitFeedbackEnabled: boolean;
    ugoCanReadNotes: boolean; // NUOVO
}

const SETTINGS_KEY = 'scansioni.ch.settings';

export const defaultSettings: AppSettings = {
    defaultProcessingMode: 'quality',
    welcomeBannerDismissed: false,
    primaryModes: ['quality', 'speed'],
    theme: 'system',
    enableOfflineFallback: false,
    autoLogoutEnabled: true,
    autoLogoutMinutes: 10,
    chatbotProactiveAssist: true,
    ugoContextAwarenessEnabled: false,
    circularMenuActions: ['select', 'expand', 'send', 'downloadZip', 'downloadPdf', 'ungroup'],
    autoArchiveDocuments: false,
    ugoArchivioEnabled: false,
    ugoDisdetteEnabled: true,
    ugoImplicitFeedbackEnabled: false,
    ugoCanReadNotes: false, // NUOVO
};

export function getSettings(): AppSettings {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            // Ensure circularMenuActions has 6 slots for backward compatibility
            if (!parsed.circularMenuActions || parsed.circularMenuActions.length !== 6) {
                const newActions = [...(parsed.circularMenuActions || defaultSettings.circularMenuActions)];
                while (newActions.length < 6) newActions.push(null);
                parsed.circularMenuActions = newActions.slice(0, 6);
            }
            // Merge defaults with stored settings to handle future additions to AppSettings
            return { ...defaultSettings, ...parsed };
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
    return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
}