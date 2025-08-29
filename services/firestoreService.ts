import { db, firebase } from './firebase';
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
    const docRef = db.collection("public_stats").doc("waitlist");
    return docRef.onSnapshot(
        (doc) => {
            if (doc.exists) {
                callback(doc.data()?.likes || 0);
            } else {
                callback(0);
            }
        },
        (error) => {
            console.error("Error listening to likes:", error);
        }
    );
};

export const incrementWaitlistLikes = async (): Promise<void> => {
    const docRef = db.collection("public_stats").doc("waitlist");
    await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) {
            transaction.set(docRef, { likes: 1 });
        } else {
            transaction.update(docRef, { likes: firebase.firestore.FieldValue.increment(1) });
        }
    });
};
