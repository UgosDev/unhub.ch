import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import * as authService from '../services/authService';
import { persistencePromise, auth, firebase } from '../services/firebase';
import type { User } from '../services/authService';
import * as firestoreService from '../services/firestoreService';
import * as otpauth from 'otpauth';

// Helper for hashing recovery codes
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticating: boolean;
    isAwaiting2fa: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    updateUser: (newUserOrFn: User | ((prevUser: User | null) => User | null)) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    verify2fa: (code: string) => Promise<void>;
    verifyRecoveryCode: (code: string) => Promise<void>;
    cancel2fa: () => Promise<void>;
    reauthenticate: (password: string) => Promise<void>;
    deleteCurrentUserAccount: () => Promise<void>;
    setupCoinTransfer: (secretWord: string) => Promise<string>;
    redeemCoinTransferCode: (code: string, secretWord: string) => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [pending2faUser, setPending2faUser] = useState<firebase.User | null>(null);
    const profileListenerUnsubscribeRef = useRef<(() => void) | null>(null);

    const logSuccessfulLogin = useCallback(async (method: 'Password' | 'Google' | '2FA' | 'Recovery Code', userToLog: firebase.User) => {
        try {
            let ipAddress = 'N/A';
            let location = 'N/A';

            try {
                const response = await fetch('https://ipapi.co/json/');
                if (response.ok) {
                    const data = await response.json();
                    ipAddress = data.ip || 'N/A';
                    location = (data.city && data.country_name) ? `${data.city}, ${data.country_name}` : 'Posizione non disponibile';
                }
            } catch (geoError) {
                console.warn("Could not fetch geolocation data:", geoError);
            }

            await firestoreService.addAccessLogEntry(userToLog.uid, {
                status: 'Success',
                method,
                userAgent: navigator.userAgent,
                ipAddress,
                location,
            });
        } catch (error) {
            console.error("Failed to add access log entry:", error);
        }
    }, []);

    const attachProfileListener = useCallback((uid: string) => {
        if (profileListenerUnsubscribeRef.current) {
            profileListenerUnsubscribeRef.current();
        }
    
        let isInitialSnapshot = true;
        profileListenerUnsubscribeRef.current = firestoreService.onUserProfileUpdate(uid, (liveProfileData) => {
            if (liveProfileData) {
                setUser({ uid, ...liveProfileData });
            } else {
                if (isInitialSnapshot) {
                    // This is the first snapshot after login, and it's null.
                    // This is likely the race condition for a new user. We ignore it and wait for the next update.
                    console.warn(`Firestore listener reported non-existent profile for user ${uid} on initial snapshot. This is likely a race condition and is being ignored.`);
                } else {
                    // This is a subsequent snapshot that is null, which means a real deletion happened.
                    console.error(`User ${uid} profile was deleted from Firestore. Logging out.`);
                    authService.logout();
                }
            }
            isInitialSnapshot = false; // Subsequent runs are not initial
        });
    }, []);

    useEffect(() => {
        let authUnsubscribe: (() => void) | undefined;
        const initialize = async () => {
            await persistencePromise.catch(error => {
                console.error("Error enabling Firestore persistence, app might not work offline.", error);
            });

            authUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
                // First, clear any previous live listener
                if (profileListenerUnsubscribeRef.current) {
                    profileListenerUnsubscribeRef.current();
                    profileListenerUnsubscribeRef.current = null;
                }

                if (firebaseUser) {
                    // User is signed in to Firebase Auth. Now get our app-specific profile.
                    setIsAuthenticating(true);
                    try {
                        const appUser = await authService.getAppUser(firebaseUser);

                        if (appUser.is2faEnabled) {
                            setPending2faUser(firebaseUser);
                            setUser(null); // Explicitly clear user until 2FA is complete
                            setIsAuthenticating(false);
                            setIsLoading(false);
                        } else {
                            // The very first sign-in for a new user is logged here
                            const isFirstSignIn = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;
                            if (isFirstSignIn) {
                                try {
                                    sessionStorage.setItem('isNewUserSession_v1', 'true');
                                } catch (e) { console.warn('sessionStorage not available'); }
                                const method = firebaseUser.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Password';
                                await logSuccessfulLogin(method, firebaseUser);
                            }

                            // Set user state immediately with the data we just fetched/created.
                            setUser(appUser);
                            setIsAuthenticating(false);
                            setIsLoading(false);

                            // Now, attach the listener for subsequent updates.
                            attachProfileListener(firebaseUser.uid);
                        }
                    } catch (error) {
                        console.error("Error setting up user session:", error);
                        await authService.logout(); // Force logout on critical error
                        setUser(null);
                        setPending2faUser(null);
                        setIsAuthenticating(false);
                        setIsLoading(false);
                    }
                } else {
                    // User is signed out
                    setUser(null);
                    setPending2faUser(null);
                    setIsAuthenticating(false);
                    setIsLoading(false);
                }
            });
        };
        
        initialize();

        return () => {
            if (authUnsubscribe) authUnsubscribe();
            if (profileListenerUnsubscribeRef.current) {
                profileListenerUnsubscribeRef.current();
            }
        };
    }, [logSuccessfulLogin, attachProfileListener]);

    const login = async (email: string, password: string) => {
        setIsAuthenticating(true);
        try {
            const firebaseUser = await authService.login(email, password);
            await logSuccessfulLogin('Password', firebaseUser);
            // onAuthStateChanged will handle the rest of the state updates.
        } catch (error) {
            setIsAuthenticating(false);
            throw error;
        }
    };
    
    const signInWithGoogle = async () => {
        setIsAuthenticating(true);
        try {
            await authService.signInWithGoogle();
             // onAuthStateChanged will handle profile creation and logging the first sign-in.
        } catch(error) {
            setIsAuthenticating(false);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsAuthenticating(true);
        try {
            await authService.register(name, email, password);
             // onAuthStateChanged will handle profile creation and logging the first sign-in.
        } catch(error) {
            setIsAuthenticating(false);
            throw error;
        }
    };

    const finalizeLogin = async (firebaseUser: firebase.User) => {
        // First, get the confirmed profile to avoid race conditions with the listener
        const appUser = await authService.getAppUser(firebaseUser);
        setUser(appUser);
        setPending2faUser(null);
        setIsAuthenticating(false);

        // Then, listen for subsequent changes
        attachProfileListener(firebaseUser.uid);
    };

    const verify2fa = async (code: string) => {
        if (!pending2faUser) throw new Error("Nessun login 2FA in attesa.");

        setIsAuthenticating(true);
        try {
            const profile = await firestoreService.getUserProfile(pending2faUser.uid);
            if (!profile || !profile.is2faEnabled || !profile.twoFactorSecret) {
                throw new Error("2FA non è configurato correttamente per questo account.");
            }
    
            const totp = new otpauth.TOTP({
                issuer: 'scansioni.ch',
                label: pending2faUser.email!,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: otpauth.Secret.fromBase32(profile.twoFactorSecret),
            });
    
            const delta = totp.validate({ token: code, window: 1 });
    
            if (delta === null) {
                throw new Error("Codice di verifica non corretto.");
            }
    
            await logSuccessfulLogin('2FA', pending2faUser);
            await finalizeLogin(pending2faUser);
    
        } catch (error) {
            setIsAuthenticating(false);
            throw error;
        }
    };

    const verifyRecoveryCode = async (code: string) => {
        if (!pending2faUser) throw new Error("Nessun login 2FA in attesa.");
        setIsAuthenticating(true);
        try {
            const profile = await firestoreService.getUserProfile(pending2faUser.uid);
            if (!profile || !profile.twoFactorRecoveryCodes || profile.twoFactorRecoveryCodes.length === 0) {
                throw new Error("Nessun codice di recupero disponibile per questo account.");
            }
    
            const hashedCode = await sha256(code);
            
            if (!profile.twoFactorRecoveryCodes.includes(hashedCode)) {
                throw new Error("Codice di recupero non valido.");
            }
            
            // Invalidate the used code
            const updatedRecoveryCodes = profile.twoFactorRecoveryCodes.filter(
                (c: string) => c !== hashedCode
            );
            await firestoreService.updateUserProfile(pending2faUser.uid, {
                twoFactorRecoveryCodes: updatedRecoveryCodes
            });
            
            await logSuccessfulLogin('Recovery Code', pending2faUser);
            await finalizeLogin(pending2faUser);
    
        } catch (error) {
            setIsAuthenticating(false);
            throw error;
        }
    };

    const cancel2fa = async () => {
        await authService.logout();
    };

    const sendPasswordReset = async (email: string) => {
        await authService.sendPasswordReset(email);
    };

    const logout = async () => {
        if (profileListenerUnsubscribeRef.current) {
            profileListenerUnsubscribeRef.current();
            profileListenerUnsubscribeRef.current = null;
        }
        await authService.logout();
    };

    const updateUser = useCallback(async (newUserOrFn: User | ((prevUser: User | null) => User | null)) => {
        const currentUser = user || (pending2faUser ? await authService.getAppUser(pending2faUser) : null);
        const newUserForDb = typeof newUserOrFn === 'function' ? newUserOrFn(currentUser) : newUserOrFn;
    
        if (newUserForDb) {
            // Prepare a separate object for the local state update.
            const newUserForState = { ...newUserForDb };
            
            // Check for Firestore sentinel values and replace them for the local state.
            // This prevents React state errors with non-serializable objects.
            if (newUserForState.twoFactorSecret && typeof newUserForState.twoFactorSecret === 'object') {
                newUserForState.twoFactorSecret = undefined;
            }

            // Optimistic update with the cleaned object.
            if (!pending2faUser) {
                setUser(newUserForState as User);
            }
            
            try {
                // Send the original object (with sentinels) to Firestore.
                const { uid, ...profileData } = newUserForDb;
                await authService.updateUserProfile(uid, profileData);
            } catch (e) {
                console.error("Failed to update user profile in Firestore.", e);
                // Revert optimistic update on failure.
                if (!pending2faUser) {
                    setUser(currentUser);
                }
            }
        } else {
            setUser(null);
        }
    }, [user, pending2faUser]);

    const reauthenticate = async (password: string) => {
        await authService.reauthenticate(password);
    };

    const setupCoinTransfer = async (secretWord: string): Promise<string> => {
        if (!user) throw new Error("Utente non loggato.");
        const code = await authService.createCoinTransferRecord(user.subscription.scanCoinBalance, secretWord);
        return code;
    };

    const deleteCurrentUserAccount = async () => {
        await authService.deleteCurrentUserAccount();
        // onAuthStateChanged will handle the rest by setting user to null.
    };

    const redeemCoinTransferCode = async (code: string, secretWord: string): Promise<number> => {
        return await authService.redeemCoinTransferCode(code, secretWord);
    };


    const value = { 
        user, 
        isLoading, 
        isAuthenticating, 
        isAwaiting2fa: !!pending2faUser,
        login, 
        logout, 
        register, 
        updateUser, 
        signInWithGoogle, 
        sendPasswordReset,
        verify2fa,
        verifyRecoveryCode,
        cancel2fa,
        reauthenticate,
        deleteCurrentUserAccount,
        setupCoinTransfer,
        redeemCoinTransferCode
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};