import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { firebase } from '../services/firebase';

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  subscription: {
    plan: 'free' | 'pro';
    scanCoinBalance: number;
    monthlyScanCoinAllowance: number;
    nextRefillDate: string;
  };
  address: string;
  householdMembers: string[];
  addressConfirmed: boolean;
  is2faEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorRecoveryCodes?: string[];
  familyId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUser: (updater: (prev: User | null) => User | null) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Mock user data for prototype
    const [user, setUser] = useState<User | null>({
        uid: 'mock-user-123',
        email: 'utente@esempio.com',
        name: 'Mario Rossi',
        subscription: {
            plan: 'pro',
            scanCoinBalance: 2500,
            monthlyScanCoinAllowance: 500,
            nextRefillDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        address: "Via Esempio 123\n6900 Lugano\nSvizzera",
        householdMembers: ["Maria Bianchi"],
        addressConfirmed: true,
        is2faEnabled: false,
        familyId: `fam-${Math.random().toString(36).substring(2, 9)}`,
    });
    const [loading, setLoading] = useState(false);

    const updateUser = async (updater: (prev: User | null) => User | null) => {
        setUser(updater);
        // In a real app, this would also save to a backend/firestore.
        console.log("User updated (mock)");
    };
    
    const reauthenticate = async (password: string): Promise<void> => {
        // This is a mock. In a real app, you would use firebase.auth().currentUser.reauthenticateWithCredential
        console.log("Reauthenticating with password:", password);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (password === 'password') { // Mock correct password
                    resolve();
                } else {
                    reject(new Error("Mock: Invalid password"));
                }
            }, 1000);
        });
    };

    const value = { user, loading, updateUser, reauthenticate };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
