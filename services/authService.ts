import { auth, firebase } from './firebase';
import type { ProcessingMode } from './geminiService';
import * as firestoreService from './firestoreService';
import type { AppSettings } from './settingsService';
import { defaultSettings } from './settingsService';

// Tipi di dati specifici dell'applicazione
export interface Subscription {
    plan: 'Personale' | 'Professionale' | 'Business';
    scansUsed: number;
    scansTotal: number;
    totalCostEver: number;
    scansByModeEver: { [key in ProcessingMode]: number };
    scanCoinBalance: number;
    addressMismatchCount?: number;
}

export interface User {
    uid: string;
    name: string;
    email: string;
    address?: string;
    addressConfirmed?: boolean;
    householdMembers?: string[];
    subscription: Subscription;
    isProcessing?: boolean;
    processingHeartbeat?: string | null; // ISO String
    is2faEnabled?: boolean;
    twoFactorSecret?: string;
    twoFactorRecoveryCodes?: string[];
    familyId?: string;
    settings?: Partial<AppSettings>;
}

type FirebaseUser = firebase.User;

/**
 * Converte un oggetto utente di Firebase nel nostro oggetto utente dell'applicazione,
 * recuperando o creando il suo profilo dati da Firestore.
 * @param firebaseUser L'utente autenticato da Firebase.
 * @returns L'oggetto User completo per la nostra applicazione.
 */
export const getAppUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
        let appData = await firestoreService.getUserProfile(firebaseUser.uid);

        const defaultSubscription: Subscription = {
            plan: 'Personale',
            scansUsed: 0,
            scansTotal: 100,
            totalCostEver: 0,
            scansByModeEver: { quality: 0, speed: 0, business: 0, book: 0, 'no-ai': 0, scontrino: 0, identity: 0 },
            scanCoinBalance: 1000,
            addressMismatchCount: 0,
        };

        if (!appData) {
            // This now primarily handles first-time Google sign-ins or acts as a fallback
            // if the profile creation during registration failed.
            const name = firebaseUser.displayName || 'Nuovo Utente';
            const email = firebaseUser.email!;
            
            await firestoreService.createUserProfile(firebaseUser.uid, name, email, defaultSubscription);
            appData = { 
                name, 
                email, 
                address: '',
                addressConfirmed: false,
                householdMembers: [],
                subscription: defaultSubscription,
                isProcessing: false,
                processingHeartbeat: null,
                is2faEnabled: false,
                twoFactorSecret: undefined,
                twoFactorRecoveryCodes: [],
                familyId: firebaseUser.uid,
                settings: defaultSettings,
            };
        }

        // Merge stored settings with defaults to handle new keys added to the app
        const mergedSettings = { ...defaultSettings, ...(appData.settings || {}) };
        const mergedSubscription = { ...defaultSubscription, ...(appData.subscription || {}) };

        return {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || appData.name, // Prende il nome più aggiornato da Firebase Auth
            email: firebaseUser.email!,
            address: appData.address || '',
            addressConfirmed: appData.addressConfirmed || false,
            householdMembers: appData.householdMembers || [],
            subscription: mergedSubscription,
            isProcessing: appData.isProcessing,
            processingHeartbeat: appData.processingHeartbeat,
            is2faEnabled: appData.is2faEnabled,
            twoFactorSecret: appData.twoFactorSecret,
            twoFactorRecoveryCodes: appData.twoFactorRecoveryCodes,
            familyId: appData.familyId,
            settings: mergedSettings,
        };
    } catch (error) {
        console.warn("Failed to get or create user profile from Firestore (likely offline). Returning a temporary user object to maintain session.", error);
        
        // Return a temporary, partial user object to keep the user logged in.
        const temporarySubscription: Subscription = {
            plan: 'Personale',
            scansUsed: 0,
            scansTotal: 0,
            totalCostEver: 0,
            scansByModeEver: { quality: 0, speed: 0, business: 0, book: 0, 'no-ai': 0, scontrino: 0, identity: 0 },
            scanCoinBalance: 0,
            addressMismatchCount: 0,
        };
        return {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "Utente",
            email: firebaseUser.email!,
            address: '',
            addressConfirmed: false,
            householdMembers: [],
            subscription: temporarySubscription,
            isProcessing: false,
            is2faEnabled: false,
            twoFactorSecret: undefined,
            twoFactorRecoveryCodes: [],
            familyId: firebaseUser.uid,
            settings: defaultSettings,
        };
    }
};


/**
 * Registra un nuovo utente con email e password in Firebase e crea immediatamente il profilo in Firestore.
 * @param name Il nome visualizzato dell'utente.
 * @param email L'email dell'utente.
 * @param password La password dell'utente.
 */
export async function register(name: string, email: string, password: string): Promise<void> {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;
    if (!firebaseUser) throw new Error("User creation did not return a user object.");

    await firebaseUser.updateProfile({ displayName: name });
    
    // Create Firestore profile immediately to prevent race conditions
    const defaultSubscription: Subscription = {
        plan: 'Personale',
        scansUsed: 0,
        scansTotal: 100,
        totalCostEver: 0,
        scansByModeEver: { quality: 0, speed: 0, business: 0, book: 0, 'no-ai': 0, scontrino: 0, identity: 0 },
        scanCoinBalance: 1000,
        addressMismatchCount: 0,
    };
    await firestoreService.createUserProfile(firebaseUser.uid, name, email, defaultSubscription);
}

/**
 * Esegue il login di un utente con email e password tramite Firebase.
 * @param email L'email dell'utente.
 * @param password La password dell'utente.
 * @returns The authenticated Firebase user object.
 */
export async function login(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    if (!userCredential.user) {
        throw new Error("Login did not return a user object.");
    }
    return userCredential.user;
}

/**
 * Avvia il flusso di accesso con il popup di Google, gestendo il collegamento di account esistenti.
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const userCredential = await auth.signInWithPopup(provider);
        if (!userCredential.user) throw new Error("Google Sign-In did not return a user object.");
        return userCredential.user;
    } catch (error: any) {
        // Gestisce il caso in cui l'email dell'utente sia già registrata con una password.
        if (error.code === 'auth/account-exists-with-different-credential') {
            const pendingCred = error.credential;
            const email = error.email;
            const methods = await auth.fetchSignInMethodsForEmail(email);

            if (methods.includes(firebase.auth.EmailAuthProvider.PROVIDER_ID)) {
                const password = prompt(`L'email ${email} è già registrata. Per collegare il tuo account Google, inserisci la tua password attuale per verificare la tua identità.`);
                
                if (password) {
                    try {
                        const userCredential = await auth.signInWithEmailAndPassword(email, password);
                        if (!userCredential.user) throw new Error("Password sign-in failed during linking.");
                        
                        await userCredential.user.linkWithCredential(pendingCred);
                        
                        // After linking, auth.currentUser is the most reliable source
                        const linkedUser = auth.currentUser;
                        if (!linkedUser) throw new Error("User object not available after linking.");

                        // Log this specific successful linking event here for clarity
                        await firestoreService.addAccessLogEntry(linkedUser.uid, {
                           status: 'Success',
                           method: 'Google', // Logged as a Google sign-in
                           userAgent: navigator.userAgent,
                           ipAddress: 'N/A', // IP logging handled by AuthContext for consistency
                           location: 'N/A',
                        });
                        
                        return linkedUser;
                    } catch (linkError) {
                        console.error("Error linking Google account:", linkError);
                        throw new Error("Password non corretta o errore durante il collegamento dell'account. Riprova.");
                    }
                } else {
                    throw new Error("Collegamento annullato. Esegui il login con la password per continuare.");
                }
            }
        }
        // Rilancia qualsiasi altro errore.
        throw error;
    }
}


/**
 * Invia un'email per il ripristino della password.
 * @param email L'email a cui inviare il link di ripristino.
 */
export async function sendPasswordReset(email: string): Promise<void> {
    await auth.sendPasswordResetEmail(email);
}


/**
 * Esegue il logout dell'utente corrente da Firebase.
 */
export async function logout(): Promise<void> {
    await auth.signOut();
}

/**
 * Imposta un listener per le modifiche dello stato di autenticazione di Firebase.
 * @param callback La funzione da eseguire quando lo stato di autenticazione cambia.
 * @returns Una funzione per annullare l'iscrizione al listener.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            getAppUser(firebaseUser)
                .then(appUser => {
                    callback(appUser);
                })
                .catch(error => {
                    console.error("Auth state change error (unhandled):", error instanceof Error ? error.message : String(error));
                    // This catch should ideally not be hit anymore, but as a final safeguard, log out.
                    callback(null);
                });
        } else {
            callback(null);
        }
    });
}

/**
 * Aggiorna il profilo utente in Firestore.
 */
export async function updateUserProfile(userId: string, updates: Partial<Omit<User, 'uid'>>): Promise<void> {
    await firestoreService.updateUserProfile(userId, updates);
}

/**
 * Re-authenticates the current user with their password.
 * This is required for sensitive operations like changing email or deleting account.
 * @param password The user's current password.
 */
export async function reauthenticate(password: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("Nessun utente attualmente loggato o l'utente non ha un'email associata.");
    }
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
    await user.reauthenticateWithCredential(credential);
}