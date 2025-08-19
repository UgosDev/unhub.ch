import { db, firebase } from './firebase';
import type { ProcessedPageResult, ScanHistoryEntry, Note } from './geminiService';
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

// Helper for hashing
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const batch = db.batch();

    // 1. Set user profile
    batch.set(userDocRef, { 
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
        role: 'client',
        collaborations: [],
    });

    // 2. Add initial credit to history
    const historyCollectionRef = userDocRef.collection('scanHistory');
    const initialCreditEntry: Omit<ScanHistoryEntry, 'id'> = {
        timestamp: firebase.firestore.FieldValue.serverTimestamp() as any,
        description: 'Credito iniziale di benvenuto',
        amountInCoins: 1000,
        status: 'Credited',
        type: 'promo'
    };
    batch.set(historyCollectionRef.doc(), initialCreditEntry);

    // Commit both operations
    await batch.commit();
};


export const updateUserProfile = async (userId: string, updates: Partial<Omit<User, 'uid'>>): Promise<void> => {
    const userDocRef = db.collection("users").doc(userId);
    // Using set with merge is more robust for updating complex objects and handling field deletions.
    await userDocRef.set(updates, { merge: true });
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

export const deleteAllUserData = async (userId: string): Promise<void> => {
    const collections = [
        'workspace', 'archivio', 'polizze', 'disdette', 
        'scanHistory', 'chat', 'archivedChats', 'stats', 'accessLogs', 'notes'
    ];
    
    // Delete all subcollections
    const deletionPromises = collections.map(name => deleteCollection(userId, name));
    await Promise.all(deletionPromises);
    
    // Delete the main user document
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.delete();
};


// --- Coin Transfer on Deletion ---
export const createCoinTransferRecord = async (userId: string, balance: number, code: string, secretWord: string): Promise<void> => {
    if (balance <= 0) {
        // Don't create a record if there's nothing to transfer
        return;
    }
    const transferDocRef = db.collection("coinTransfers").doc(userId);
    const secretWordHash = await sha256(secretWord);

    await transferDocRef.set({
        balance,
        code,
        secretWordHash,
        claimed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        originalEmail: firebase.auth().currentUser?.email // for reference/support
    });
};

export const redeemCoinTransferCode = async (currentUserId: string, code: string, secretWord: string): Promise<number> => {
    const user = db.collection('users').doc(currentUserId);
    if (!user) {
        throw new Error("Devi essere loggato per riscattare un codice.");
    }
    const transferCollectionRef = db.collection('coinTransfers');
    const query = transferCollectionRef.where('code', '==', code).where('claimed', '==', false).limit(1);

    const snapshot = await query.get();

    if (snapshot.empty) {
        throw new Error("Codice di trasferimento non valido o già utilizzato.");
    }

    const transferDoc = snapshot.docs[0];
    const transferData = transferDoc.data();
    const secretWordHash = await sha256(secretWord);

    if (transferData.secretWordHash !== secretWordHash) {
        throw new Error("Parola segreta non corretta.");
    }
    
    const currentUserRef = db.collection('users').doc(currentUserId);
    const historyCollectionRef = db.collection(`users/${currentUserId}/scanHistory`);

    let transferredAmount = 0;

    await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(currentUserRef);
        if (!userDoc.exists) {
            throw new Error("Utente corrente non trovato.");
        }
        
        const userData = userDoc.data() as User;
        transferredAmount = transferData.balance;
        const newBalance = (userData.subscription.scanCoinBalance || 0) + transferredAmount;

        // 1. Update user's balance
        transaction.update(currentUserRef, { 'subscription.scanCoinBalance': newBalance });
        
        // 2. Mark transfer as claimed
        transaction.update(transferDoc.ref, { 
            claimed: true,
            claimedByUid: currentUserId,
            claimedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. Add a history entry for the credit
        const historyEntry: Omit<ScanHistoryEntry, 'id'> = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp() as any,
            description: `Crediti recuperati da account precedente (ID: ...${transferDoc.id.slice(-6)})`,
            amountInCoins: transferredAmount,
            status: 'Credited',
            type: 'promo', // Or a new 'transfer' type
        };
        transaction.set(historyCollectionRef.doc(), historyEntry);
    });
    
    return transferredAmount;
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
    await resultDocRef.set(cleanResult, { merge: true });
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
export const moveDocsBetweenCollections = async (userId: string, docUuids: string[], fromCollection: string, toCollection: string, options?: { isPrivate?: boolean, embeddings?: Record<string, number[]> }): Promise<void> => {
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
                if (options?.embeddings && options.embeddings[docSnap.id]) {
                    data.embedding = options.embeddings[docSnap.id];
                }
                data.folderPath = '/'; // Initialize at root
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

export const moveDocsToModule = async (userId: string, docUuids: string[], toModule: 'archivio' | 'polizze' | 'disdette', options?: { isPrivate?: boolean, embeddings?: Record<string, number[]> }): Promise<void> => {
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

// --- Polizze Specific Actions ---
export const updatePolizzaDoc = async (userId: string, doc: ProcessedPageResult): Promise<void> => {
    const docRef = db.collection(`users/${userId}/polizze`).doc(doc.uuid);
    await docRef.set(doc, { merge: true });
};

export const deletePolizzaDoc = async (userId: string, uuid: string): Promise<void> => {
    const docRef = db.collection(`users/${userId}/polizze`).doc(uuid);
    await docRef.delete();
};

// --- Disdette ---
export const addDisdettaDoc = async (userId: string, doc: ProcessedPageResult): Promise<void> => {
    const docRef = db.collection(`users/${userId}/disdette`).doc(doc.uuid);
    await docRef.set(doc);
};

export const updateDisdettaDoc = async (userId: string, doc: ProcessedPageResult): Promise<void> => {
    const docRef = db.collection(`users/${userId}/disdette`).doc(doc.uuid);
    await docRef.set(doc, { merge: true });
};

export const deleteDisdettaDoc = async (userId: string, uuid: string): Promise<void> => {
    const docRef = db.collection(`users/${userId}/disdette`).doc(uuid);
    await docRef.delete();
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


// --- VECTOR SEARCH & EMBEDDINGS ---
export const saveArchivioEmbedding = async (userId: string, docUuid: string, embedding: number[]): Promise<void> => {
    const docRef = db.collection(`users/${userId}/archivio`).doc(docUuid);
    // Use set with merge to create/update the embedding field
    await docRef.set({ embedding }, { merge: true });
};

export const findNearestArchivedDocs = async (userId: string, queryVector: number[], limit: number): Promise<{uuid: string; distance: number}[]> => {
    const archivioCollectionRef = db.collection(`users/${userId}/archivio`);
    
    // The findNearest method may not be in the default compat types, so we cast to any.
    const query = (archivioCollectionRef as any).findNearest(
        'embedding', 
        firebase.firestore.Vector.fromArray(queryVector), 
        {
            limit: limit,
            distanceMeasure: 'EUCLIDEAN'
        }
    );

    const snapshot = await query.get();

    return snapshot.docs.map((doc: any) => ({
        uuid: doc.id,
        distance: doc.distance, // Distance is returned on the document in the snapshot
    }));
};

export const getArchivedDocsByUuids = async (userId: string, uuids: string[]): Promise<ProcessedPageResult[]> => {
    if (uuids.length === 0) {
        return [];
    }
    // Firestore 'in' query supports up to 30 elements in the array.
    if (uuids.length > 30) {
        console.warn("getArchivedDocsByUuids was called with more than 30 UUIDs. This is not supported by Firestore 'in' queries. The list will be truncated.");
        uuids = uuids.slice(0, 30);
    }
    
    const archivioCollectionRef = db.collection(`users/${userId}/archivio`);
    const query = archivioCollectionRef.where(firebase.firestore.FieldPath.documentId(), 'in', uuids);
    const snapshot = await query.get();
    
    // The order is not guaranteed by 'in' query, so we re-order based on the input uuids array.
    const docsMap = new Map<string, ProcessedPageResult>();
    snapshot.docs.forEach(doc => {
        docsMap.set(doc.id, doc.data() as ProcessedPageResult);
    });

    return uuids.map(uuid => docsMap.get(uuid)).filter((doc): doc is ProcessedPageResult => !!doc);
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
        // Pass object directly to Firestore; it handles undefined fields.
        // This preserves FieldValue objects like serverTimestamp().
        batch.set(docRef, result);
    });

    const historyCollectionRef = db.collection(`users/${userId}/scanHistory`);
    historyEntries.forEach(entry => {
        const { id, ...entryData } = entry; // remove temp id if it exists
        const docRef = historyCollectionRef.doc(); // auto-generate ID
        batch.set(docRef, entryData);
    });

    await batch.commit();
};

export const processScanTransaction = async (userId: string, familyId: string, cost: number, workspaceDocs: ProcessedPageResult[], historyEntries: Omit<ScanHistoryEntry, 'id'>[]): Promise<void> => {
    const familyHeadRef = db.collection('users').doc(familyId);
    const userWorkspaceRef = db.collection(`users/${userId}/workspace`);
    const userHistoryRef = db.collection(`users/${userId}/scanHistory`);

    await db.runTransaction(async (transaction) => {
        const familyHeadDoc = await transaction.get(familyHeadRef);
        if (!familyHeadDoc.exists) {
            throw new Error("Account del capo famiglia non trovato.");
        }
        const familyData = familyHeadDoc.data() as User;
        
        const currentBalance = familyData.subscription.scanCoinBalance;
        if (currentBalance < cost) {
            throw new Error("Credito ScanCoin insufficiente nel pool familiare.");
        }
        const newBalance = currentBalance - cost;

        // 1. Update family head's balance
        transaction.update(familyHeadRef, { 'subscription.scanCoinBalance': newBalance });

        // 2. Add new documents to the current user's workspace
        workspaceDocs.forEach(doc => {
            const docRef = userWorkspaceRef.doc(doc.uuid);
            transaction.set(docRef, JSON.parse(JSON.stringify(doc)));
        });

        // 3. Add history entries to the current user's history
        historyEntries.forEach(entry => {
            const historyRef = userHistoryRef.doc();
            transaction.set(historyRef, entry);
        });
    });
};


// --- Notes ---
export const onNotesUpdate = (userId: string, callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => {
    const notesCollection = db.collection(`users/${userId}/notes`).orderBy("updatedAt", "desc");
    return notesCollection.onSnapshot(
        (snapshot) => callback(snapshot),
        (error) => console.error("Error listening to notes:", error)
    );
};

export const addNote = async (userId: string, note: Omit<Note, 'id'>): Promise<string> => {
    const notesCollection = db.collection(`users/${userId}/notes`);
    const docRef = await notesCollection.add(note);
    return docRef.id;
};

export const updateNote = async (userId: string, note: Note): Promise<void> => {
    const { id, ...noteData } = note;
    if (!id) throw new Error("Note ID is required for update.");
    const noteDocRef = db.collection(`users/${userId}/notes`).doc(id);
    await noteDocRef.set(noteData, { merge: true });
};

export const deleteNote = async (userId: string, noteId: string): Promise<void> => {
    const noteDocRef = db.collection(`users/${userId}/notes`).doc(noteId);
    await noteDocRef.delete();
};

// --- NUOVE FUNZIONI PER COLLABORAZIONE (STUB) ---

export const findUserByEmail = async (email: string): Promise<(User & { uid: string }) | null> => {
    console.log(`[STUB] Cercando utente con email: ${email}`);
    // In produzione, questo richiederebbe una Cloud Function o regole di sicurezza specifiche
    // che permettano una query limitata. Per ora, simuliamo una ricerca che non trova nessuno
    // per evitare di dover implementare la logica completa ora.
    // const usersRef = db.collection('users');
    // const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    // if (snapshot.empty) return null;
    // return { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User & { uid: string };
    return null; 
};

export const addCollaboration = async (client: User, broker: User & { uid: string }, selectedDocIds: string[], targetModule: 'polizze' | 'archivio') => {
    console.log(`[STUB] Aggiungendo collaborazione tra ${client.email} e ${broker.email}`);
    console.log(`[STUB] Documenti da condividere in ${targetModule}:`, selectedDocIds);
    // Logica di batch write per aggiornare i profili e i documenti...
    // E.g., db.batch()...commit();
};

export const removeCollaboration = async (clientUid: string, brokerUid: string) => {
    console.log(`[STUB] Rimuovendo collaborazione tra client ${clientUid} e broker ${brokerUid}`);
    // Logica di transazione per rimuovere dai profili e dai documenti...
};

export const reportBroker = async (clientUid: string, brokerUid: string, reason: string) => {
    console.log(`[STUB] Segnalando broker ${brokerUid} da parte di ${clientUid} per il motivo: "${reason}"`);
    // const reportsRef = db.collection('brokerReports');
    // await reportsRef.add({ reporterUid: clientUid, reportedUid: brokerUid, reason, timestamp: ... });
};