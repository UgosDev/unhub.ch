import { db, firebase } from './firebase';
import type { ProcessedPageResult, ScanHistoryEntry, Folder } from './geminiService';
import type { ChatMessage } from '../components/Chatbot';
import type { User, Subscription } from './authService';
import { defaultSettings } from './settingsService';

export interface ArchivedChat {
    id?: string; // Firestore uses string IDs
    timestamp: string;
    history: ChatMessage[];
}

export interface UserFeedback {
    id?: string;
    timestamp: firebase.firestore.Timestamp;
    type: 'scan' | 'chat';
    feedbackValue: 'good' | 'bad';
    context: {
        sourceFileName?: string;
        userMessage?: string;
        botResponse?: string;
        resultUuid?: string;
        targetElementSelector?: string;
    };
}

export interface AccessLogEntry {
    id?: string;
    timestamp: firebase.firestore.Timestamp;
    status: 'Success'; // Only logging successes for now
    method: 'Password' | 'Google' | '2FA' | 'Recovery Code';
    userAgent: string;
    ipAddress: string;
    location: string;
}


// --- Anonymous Feedback ---
export const submitAnonymousFeedback = async (feedbackData: object): Promise<void> => {
    // We don't need the user ID for the data, but we ensure the user is logged in
    // as per Firestore security rules.
    const userId = getUserId();
    await db.collection('anonymousFeedback').add({
        ...feedbackData,
        userId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
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


// --- User Profile ---
const getUserId = (): string => {
    const user = firebase.auth().currentUser;
    if (!user) {
        throw new Error("User not authenticated. Cannot perform DB operations.");
    }
    return user.uid;
};

export const getUserProfile = async (userId: string): Promise<Omit<User, 'uid'> | null> => {
    const userDocRef = db.collection("users").doc(userId);
    const docSnap = await userDocRef.get();
    if (docSnap.exists) {
        return docSnap.data() as Omit<User, 'uid'>;
    }
    return null;
};

export const onUserProfileUpdate = (userId: string, callback: (user: Omit<User, 'uid'> | null) => void): (() => void) => {
    const userDocRef = db.collection("users").doc(userId);
    return userDocRef.onSnapshot(
        (doc) => {
            if (doc.exists) {
                callback(doc.data() as Omit<User, 'uid'>);
            } else {
                // This could happen if the user is deleted from the backend
                callback(null);
            }
        },
        (error) => {
            console.error("Error listening to user profile:", error);
        }
    );
};


export const createUserProfile = async (userId: string, name: string, email: string, defaultSubscription: Subscription): Promise<void> => {
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.set({ 
        name, 
        email,
        address: '',
        addressConfirmed: false,
        householdMembers: [],
        subscription: defaultSubscription,
        isProcessing: false,
        processingHeartbeat: null,
        is2faEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: [],
        familyId: userId,
        settings: defaultSettings,
    });
};

export const updateUserProfile = async (userId: string, updates: Partial<Omit<User, 'uid'>>): Promise<void> => {
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.update(updates);
};

export const updateUserProcessingStatus = async (userId: string, isProcessing: boolean, heartbeat: string | null): Promise<void> => {
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.update({
        isProcessing,
        processingHeartbeat: heartbeat
    });
};


// --- Helper to delete all documents in a collection ---
const deleteCollection = async (userId: string, collectionName: string) => {
    try {
        const collectionRef = db.collection(`users/${userId}/${collectionName}`);
        const snapshot = await collectionRef.get();
        if (snapshot.empty) return;
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    } catch(e) {
        console.error(`Error deleting collection ${collectionName} for user ${userId}`, e);
        throw e;
    }
};

// --- Workspace (ex-Results) ---
export const onWorkspaceUpdate = (userId: string, callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const workspaceCollection = db.collection(`users/${userId}/workspace`).orderBy("timestamp");
    return workspaceCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error("Error listening to workspace:", error)
    );
};

export const getAllWorkspaceDocs = async (userId: string): Promise<ProcessedPageResult[]> => {
    const workspaceCollection = db.collection(`users/${userId}/workspace`);
    const q = workspaceCollection.orderBy("timestamp");
    const snapshot = await q.get();
    return snapshot.docs.map(doc => doc.data() as ProcessedPageResult);
};

export const addOrUpdateWorkspaceDoc = async (userId: string, result: ProcessedPageResult): Promise<void> => {
    const cleanResult = JSON.parse(JSON.stringify(result)); // Remove undefined
    const resultDocRef = db.collection(`users/${userId}/workspace`).doc(result.uuid);
    await resultDocRef.set(cleanResult);
};

export const deleteWorkspaceDoc = async (userId: string, resultUuid: string): Promise<void> => {
    const resultDocRef = db.collection(`users/${userId}/workspace`).doc(resultUuid);
    await resultDocRef.delete();
};

export const clearWorkspace = (userId: string) => deleteCollection(userId, 'workspace');

// --- Generic Module Listener ---
export const onModuleUpdate = (userId: string, module: 'archivio' | 'polizze' | 'disdette', callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const moduleCollection = db.collection(`users/${userId}/${module}`).orderBy("timestamp", "desc");
    return moduleCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error(`Error listening to ${module}:`, error)
    );
};

// --- Document Movement ---
export const moveDocsBetweenCollections = async (userId: string, docUuids: string[], fromCollection: string, toCollection: string, options?: { isPrivate?: boolean, folderId?: string | null }): Promise<void> => {
    if (docUuids.length === 0) return;
    
    const batch = db.batch();
    const fromCollectionRef = db.collection(`users/${userId}/${fromCollection}`);
    const toCollectionRef = db.collection(`users/${userId}/${toCollection}`);

    const docSnaps = await Promise.all(docUuids.map(uuid => fromCollectionRef.doc(uuid).get()));

    for (const docSnap of docSnaps) {
        if (docSnap.exists) {
            const data = docSnap.data() as ProcessedPageResult;
            
            if (toCollection === 'archivio') {
                data.isPrivate = options?.isPrivate ?? false;
                data.folderId = options?.folderId ?? null;
            }
            
            const toDocRef = toCollectionRef.doc(docSnap.id);
            batch.set(toDocRef, data);
            batch.delete(docSnap.ref);
        } else {
            console.warn(`Document with UUID ${docSnap.id} not found in ${fromCollection} to move.`);
        }
    }
    
    await batch.commit();
};

export const moveDocsToModule = async (userId: string, docUuids: string[], toModule: 'archivio' | 'polizze' | 'disdette', options?: { isPrivate?: boolean, folderId?: string | null }): Promise<void> => {
    await moveDocsBetweenCollections(userId, docUuids, 'workspace', toModule, options);
};

// --- Archivio Specific Actions ---
export const updateArchivedDoc = async (userId: string, doc: ProcessedPageResult): Promise<void> => {
    const docRef = db.collection(`users/${userId}/archivio`).doc(doc.uuid);
    await docRef.set(doc, { merge: true });
};

export const deleteArchivedDoc = async (userId: string, uuid: string): Promise<void> => {
    const docRef = db.collection(`users/${userId}/archivio`).doc(uuid);
    await docRef.delete();
};


// --- Disdette ---
export const addDisdettaDoc = async (userId: string, doc: ProcessedPageResult): Promise<void> => {
    const docRef = db.collection(`users/${userId}/disdette`).doc(doc.uuid);
    await docRef.set(doc);
};


// --- Scan History ---
export const onScanHistoryUpdate = (userId: string, callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const historyCollection = db.collection(`users/${userId}/scanHistory`).orderBy("timestamp", "desc");
    return historyCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error("Error listening to scan history:", error)
    );
};

export const addScanHistoryEntry = async (userId: string, entry: ScanHistoryEntry): Promise<void> => {
    const historyCollection = db.collection(`users/${userId}/scanHistory`);
    const { id, ...entryData } = entry;
    await historyCollection.add(entryData);
};

export const getAllScanHistory = async (userId: string): Promise<ScanHistoryEntry[]> => {
    const historyCollection = db.collection(`users/${userId}/scanHistory`);
    const q = historyCollection.orderBy("timestamp", "desc");
    const snapshot = await q.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ScanHistoryEntry);
};

export const clearAllScanHistory = (userId: string) => deleteCollection(userId, 'scanHistory');


// --- Chat History ---
export const onChatHistoryUpdate = (userId: string, callback: (snapshot: firebase.firestore.DocumentSnapshot) => void): (() => void) => {
    const chatDocRef = db.collection(`users/${userId}/chat`).doc('current');
    return chatDocRef.onSnapshot(
        (doc) => callback(doc),
        (error) => console.error("Error listening to chat history:", error)
    );
};

export const saveChatHistory = async (userId:string, history: ChatMessage[]): Promise<void> => {
    const cleanHistory = JSON.parse(JSON.stringify(history));
    const chatDocRef = db.collection(`users/${userId}/chat`).doc('current');
    await chatDocRef.set({ history: cleanHistory });
};

export const loadChatHistory = async (userId: string): Promise<ChatMessage[] | undefined> => {
    const chatDocRef = db.collection(`users/${userId}/chat`).doc('current');
    const docSnap = await chatDocRef.get();
    if(docSnap.exists) {
        return (docSnap.data() as { history: ChatMessage[] }).history;
    }
    return undefined;
};

export const clearChatHistory = async (userId: string): Promise<void> => {
    const chatDocRef = db.collection(`users/${userId}/chat`).doc('current');
    await chatDocRef.delete();
};

// --- Archived Chats ---
export const onArchivedChatsUpdate = (userId: string, callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const archivedChatsCollection = db.collection(`users/${userId}/archivedChats`).orderBy("timestamp", "desc");
    return archivedChatsCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error("Error listening to archived chats:", error)
    );
};


export const archiveCurrentChat = async (userId: string, history: ChatMessage[]): Promise<void> => {
    const cleanHistory = JSON.parse(JSON.stringify(history));
    const archivedChatsCollection = db.collection(`users/${userId}/archivedChats`);
    await archivedChatsCollection.add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        history: cleanHistory
    });
};

export const getArchivedChats = async (userId: string): Promise<ArchivedChat[]> => {
    const archivedChatsCollection = db.collection(`users/${userId}/archivedChats`);
    const q = archivedChatsCollection.orderBy("timestamp", "desc");
    const snapshot = await q.get();
    return snapshot.docs.map(doc => {
        const data = doc.data() as { history: ChatMessage[]; timestamp: firebase.firestore.Timestamp };
        return {
            id: doc.id,
            history: data.history,
            timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString()
        }
    });
};

export const deleteArchivedChat = async (userId: string, id: string): Promise<void> => {
    const chatDocRef = db.collection(`users/${userId}/archivedChats`).doc(id);
    await chatDocRef.delete();
};


// --- Stats (for achievements, etc.) ---
export const getStat = async(userId: string, statName: string): Promise<any> => {
    const statDocRef = db.collection(`users/${userId}/stats`).doc(statName);
    const docSnap = await statDocRef.get();
    return docSnap.exists ? (docSnap.data() as { value: any }).value : undefined;
};

export const setStat = async (userId: string, statName: string, value: any): Promise<void> => {
    const statDocRef = db.collection(`users/${userId}/stats`).doc(statName);
    await statDocRef.set({ value });
};

// --- User Feedback (Global Collection) ---
export const onGlobalUserFeedbackUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const feedbackCollection = db.collection(`userFeedback`).orderBy("timestamp", "desc");
    return feedbackCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error("Error listening to global user feedback:", error)
    );
};

export const addUserFeedback = async (userId: string, feedbackData: Omit<UserFeedback, 'id' | 'timestamp'>): Promise<void> => {
    const feedbackCollection = db.collection(`userFeedback`);
    await feedbackCollection.add({
        ...feedbackData,
        userId: userId, // Add user ID for context
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
};

// --- Access Logs ---
export const onAccessLogsUpdate = (userId: string, callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const logsCollection = db.collection(`users/${userId}/accessLogs`).orderBy("timestamp", "desc");
    return logsCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error("Error listening to access logs:", error)
    );
};

export const addAccessLogEntry = async (userId: string, entryData: Omit<AccessLogEntry, 'id' | 'timestamp'>): Promise<void> => {
    const logsCollection = db.collection(`users/${userId}/accessLogs`);
    await logsCollection.add({
        ...entryData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
};

// --- ADMIN FUNCTIONS ---
export const getAllUserProfilesForAdmin = async (): Promise<User[]> => {
    // In a real app, this would be protected by security rules
    // ensuring only admin users can call this.
    const usersCollection = db.collection("users");
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }) as User);
};

// --- Folder Management ---
export const onFoldersUpdate = (userId: string, callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const foldersCollection = db.collection(`users/${userId}/folders`);
    return foldersCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error("Error listening to folders:", error)
    );
};

export const addFolder = async (userId: string, folderData: Omit<Folder, 'id'>): Promise<string> => {
    const foldersCollection = db.collection(`users/${userId}/folders`);
    const docRef = await foldersCollection.add(folderData);
    return docRef.id;
};

export const updateFolder = async (userId: string, folderId: string, updates: Partial<Omit<Folder, 'id' | 'ownerUid'>>): Promise<void> => {
    const folderDocRef = db.collection(`users/${userId}/folders`).doc(folderId);
    await folderDocRef.update(updates);
};

export const deleteFolder = async (userId: string, folderId: string): Promise<void> => {
    const folderDocRef = db.collection(`users/${userId}/folders`).doc(folderId);
    await folderDocRef.delete();
};

// --- BATCH WRITES ---
export const batchAddWorkspaceAndHistory = async (userId: string, results: ProcessedPageResult[], historyEntries: ScanHistoryEntry[]): Promise<void> => {
    if (results.length === 0 && historyEntries.length === 0) {
        return;
    }

    const batch = db.batch();

    const workspaceCollectionRef = db.collection(`users/${userId}/workspace`);
    results.forEach(result => {
        const docRef = workspaceCollectionRef.doc(result.uuid);
        // Remove undefined values before sending to Firestore
        batch.set(docRef, JSON.parse(JSON.stringify(result)));
    });

    const historyCollectionRef = db.collection(`users/${userId}/scanHistory`);
    historyEntries.forEach(entry => {
        const { id, ...entryData } = entry; // remove temp id if it exists
        const docRef = historyCollectionRef.doc(); // auto-generate ID
        batch.set(docRef, entryData);
    });

    await batch.commit();
};