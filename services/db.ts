import { auth, firebase, db } from './firebase';
import type { Folder, ScanHistoryEntry, ProcessedPageResult, QueuedFile, AddressBookEntry } from './geminiService';
import type { ChatMessage } from '../components/Chatbot';
import * as firestoreService from './firestoreService';
import type { User, Consultant } from './authService';
export type { ArchivedChat, AccessLogEntry } from './firestoreService';

// --- User Management ---
const getUserId = (): string => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated. Cannot perform DB operations.");
    }
    return user.uid;
};

// --- IndexedDB for Queue ---
const DB_NAME = 'scansioni-ch-queue';
const DB_VERSION = 1;
const QUEUE_STORE_NAME = 'processing-queue';

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
                    db.createObjectStore(QUEUE_STORE_NAME, { keyPath: 'sourceFileId' });
                }
            };
        });
    }
    return dbPromise;
};

export const getQueue = async (): Promise<QueuedFile[]> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(QUEUE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(QUEUE_STORE_NAME);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

export const addTasksToQueue = async (tasks: QueuedFile[]): Promise<void> => {
    const db = await getDb();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(QUEUE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(QUEUE_STORE_NAME);
        tasks.forEach(task => store.put(task));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const removeTaskFromQueue = async (sourceFileId: string): Promise<void> => {
    const db = await getDb();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(QUEUE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(QUEUE_STORE_NAME);
        const request = store.delete(sourceFileId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const clearQueue = async (): Promise<void> => {
    const db = await getDb();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(QUEUE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(QUEUE_STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// --- Anonymous Feedback ---
export const submitAnonymousFeedback = async (feedbackData: object): Promise<void> => {
    // We don't need the user ID for the data, but we ensure the user is logged in
    // as per Firestore security rules.
    getUserId(); 
    await firestoreService.submitAnonymousFeedback(feedbackData);
};

// --- Waitlist Stats ---
export const onWaitlistLikesUpdate = (callback: (count: number) => void): (() => void) => firestoreService.onWaitlistLikesUpdate(callback);
export const incrementWaitlistLikes = (): Promise<void> => firestoreService.incrementWaitlistLikes();


// --- Firestore Wrappers ---
// --- ONE-TIME GETTERS ---
export const getAllWorkspaceDocs = (): Promise<ProcessedPageResult[]> => firestoreService.getAllWorkspaceDocs(getUserId());
export const getAllScanHistory = (): Promise<ScanHistoryEntry[]> => firestoreService.getAllScanHistory(getUserId());
export const loadChatHistory = (): Promise<ChatMessage[] | undefined> => firestoreService.loadChatHistory(getUserId());

// --- REAL-TIME LISTENERS ---
export const onUserProfileUpdate = (userId: string, callback: (user: Omit<User, 'uid'> | null) => void): (() => void) => firestoreService.onUserProfileUpdate(userId, callback);
export const onWorkspaceUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onWorkspaceUpdate(getUserId(), callback);
export const onArchivioUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onModuleUpdate(getUserId(), 'archivio', callback);
export const onPolizzeUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onModuleUpdate(getUserId(), 'polizze', callback);
export const onDisdetteUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onModuleUpdate(getUserId(), 'disdette', callback);
export const onScanHistoryUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onScanHistoryUpdate(getUserId(), callback);
export const onChatHistoryUpdate = (callback: (snapshot: firebase.firestore.DocumentSnapshot) => void): (() => void) => firestoreService.onChatHistoryUpdate(getUserId(), callback);
export const onArchivedChatsUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onArchivedChatsUpdate(getUserId(), callback);
export const onAccessLogsUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onAccessLogsUpdate(getUserId(), callback);
export const onFoldersUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onFoldersUpdate(getUserId(), callback);
export const onAddressBookUpdate = (callback: (snapshot: firebase.firestore.QuerySnapshot) => void): (() => void) => firestoreService.onAddressBookUpdate(getUserId(), callback);

// --- WRITERS / DELETERS ---
export const addOrUpdateWorkspaceDoc = (result: ProcessedPageResult): Promise<void> => firestoreService.addOrUpdateWorkspaceDoc(getUserId(), result);
export const updateArchivedDoc = (doc: ProcessedPageResult): Promise<void> => firestoreService.updateArchivedDoc(getUserId(), doc);
export const deleteArchivedDoc = (uuid: string): Promise<void> => firestoreService.deleteArchivedDoc(getUserId(), uuid);
export const addDisdettaDoc = (doc: ProcessedPageResult): Promise<void> => firestoreService.addDisdettaDoc(getUserId(), doc);
export const updateDisdettaDoc = (doc: ProcessedPageResult): Promise<void> => firestoreService.updateDisdettaDoc(getUserId(), doc);
export const deleteWorkspaceDoc = (resultUuid: string): Promise<void> => firestoreService.deleteWorkspaceDoc(getUserId(), resultUuid);
export const clearWorkspace = (): Promise<void> => firestoreService.clearWorkspace(getUserId());
export const moveDocsToModule = (docUuids: string[], toModule: 'archivio' | 'polizze' | 'disdette', options?: { isPrivate?: boolean, folderId?: string | null }): Promise<void> => firestoreService.moveDocsToModule(getUserId(), docUuids, toModule, options);
export const moveDocsBetweenCollections = (docUuids: string[], from: string, to: string): Promise<void> => firestoreService.moveDocsBetweenCollections(getUserId(), docUuids, from, to);
export const addScanHistoryEntry = (entry: ScanHistoryEntry): Promise<void> => firestoreService.addScanHistoryEntry(getUserId(), entry);
export const saveChatHistory = (history: ChatMessage[]): Promise<void> => firestoreService.saveChatHistory(getUserId(), history);
export const clearChatHistory = (): Promise<void> => firestoreService.clearChatHistory(getUserId());
export const archiveCurrentChat = (history: ChatMessage[]): Promise<void> => firestoreService.archiveCurrentChat(getUserId(), history);
export const getArchivedChats = (): Promise<firestoreService.ArchivedChat[]> => firestoreService.getArchivedChats(getUserId());
export const deleteArchivedChat = (id: string): Promise<void> => firestoreService.deleteArchivedChat(getUserId(), id);
export const getStat = (statName: string): Promise<any> => firestoreService.getStat(getUserId(), statName);
export const setStat = (statName: string, value: any): Promise<void> => firestoreService.setStat(getUserId(), statName, value);
export const addAccessLogEntry = (entryData: Omit<firestoreService.AccessLogEntry, 'id' | 'timestamp'>): Promise<void> => firestoreService.addAccessLogEntry(getUserId(), entryData);
export const addFolder = (folderData: Omit<Folder, 'id'>): Promise<string> => firestoreService.addFolder(getUserId(), folderData);
export const updateFolder = (folderId: string, updates: Partial<Folder>): Promise<void> => firestoreService.updateFolder(getUserId(), folderId, updates);
export const deleteFolder = (folderId: string): Promise<void> => firestoreService.deleteFolder(getUserId(), folderId);
export const deleteCollection = (userId: string, collectionName: string): Promise<void> => firestoreService.deleteCollection(userId, collectionName);
export const deleteUserProfile = (userId: string): Promise<void> => firestoreService.deleteUserProfile(userId);
export const addOrUpdateAddressBookEntry = (entry: Omit<AddressBookEntry, 'id' | 'lastUsed'>): Promise<void> => firestoreService.addOrUpdateAddressBookEntry(getUserId(), entry);
export const deleteAddressBookEntry = (entryId: string): Promise<void> => firestoreService.deleteAddressBookEntry(getUserId(), entryId);

// --- Consultant Management ---
// FIX: Rename 'data' variable to 'consultants' to avoid potential obscure naming conflicts.
export const onConsultantsUpdate = (callback: (consultants: Consultant[]) => void): (() => void) => {
    const userId = getUserId();
    const collectionRef = db.collection(`users/${userId}/consultants`);
    return collectionRef.onSnapshot(snapshot => {
        const consultants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Consultant);
        callback(consultants);
    }, error => console.error("Error listening to consultants:", error));
};

export const inviteConsultant = async (name: string, email: string): Promise<void> => {
    const userId = getUserId();
    const collectionRef = db.collection(`users/${userId}/consultants`);
    await collectionRef.add({
        name,
        email,
        status: 'verified',
        sharedDocUuids: [],
    });
};

export const updateConsultantPermissions = async (consultantId: string, sharedDocUuids: string[]): Promise<void> => {
    const userId = getUserId();
    const docRef = db.collection(`users/${userId}/consultants`).doc(consultantId);
    await docRef.update({ sharedDocUuids });
};

export const revokeConsultantAccess = async (consultantId: string): Promise<void> => {
    const userId = getUserId();
    const docRef = db.collection(`users/${userId}/consultants`).doc(consultantId);
    await docRef.delete();
};


// --- BATCH WRITERS ---
export const batchAddWorkspaceAndHistory = (results: ProcessedPageResult[], historyEntries: ScanHistoryEntry[]): Promise<void> => firestoreService.batchAddWorkspaceAndHistory(getUserId(), results, historyEntries);