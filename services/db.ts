import * as firestoreService from './firestoreService';

export interface AccessLogEntry {
    id: string;
    method: 'Password' | 'Google' | '2FA' | 'Recovery Code';
    timestamp: any;
    location: string;
    ipAddress: string;
    userAgent: string;
}

// --- Waitlist Stats ---
export const onWaitlistLikesUpdate = (callback: (count: number) => void): (() => void) => firestoreService.onWaitlistLikesUpdate(callback);
export const incrementWaitlistLikes = (): Promise<void> => firestoreService.incrementWaitlistLikes();