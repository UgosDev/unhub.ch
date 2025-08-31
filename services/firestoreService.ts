import type { ScanHistoryEntry } from './geminiService';

// This is ChatMessage from Chatbot component, but makes sense to have it here too.
interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface ArchivedChat {
    id?: string;
    timestamp: number; // as unix timestamp
    history: ChatMessage[];
}

export const addScanHistoryEntry = async (uid: string, entry: ScanHistoryEntry): Promise<void> => {
    if (!uid) {
        console.error("No UID provided, cannot add scan history entry.");
        return;
    }
    // This is a mock function for the prototype. In a real app, this would write to Firestore.
    console.log(`(Mock) Adding scan history for user ${uid}:`, entry);
    // await db.collection('users').doc(uid).collection('scan_history').add(entry);
};


// --- Waitlist Stats ---
export const onWaitlistLikesUpdate = (callback: (count: number) => void): (() => void) => {
    // Mock implementation: return a static number and an empty unsubscribe function.
    const staticLikes = 1337;
    callback(staticLikes);
    return () => {};
};

export const incrementWaitlistLikes = async (): Promise<void> => {
    // Mock implementation: returns a resolved promise and does nothing.
    console.log("(Mock) Incrementing waitlist likes.");
    return Promise.resolve();
};