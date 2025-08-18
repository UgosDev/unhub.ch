import React, { useState, useEffect } from 'react';

import { getBrandKey, type BrandKey } from './services/brandingService';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';

// Nuove pagine
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import ChangelogPage from './pages/ChangelogPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import WaitlistPage from './pages/WaitlistPage';
import UnHubPage from './pages/UnHubPage';
import { AuthenticatedApp } from './AuthenticatedApp';
import NewsletterIndexPage from './pages/newsletter/NewsletterIndexPage';
import { newsletterContent } from './pages/newsletter/content';
import { type ProcessingMode } from './services/geminiService';

export interface PendingFileTask {
    id: string;
    file: File;
    mode: ProcessingMode;
    suggestedMode: ProcessingMode | null;
    isSuggesting: boolean;
    shouldExtractImages: boolean;
}


// --- UN-AUTHENTICATED APP ---
function UnauthenticatedApp({ brandKey }: { brandKey: BrandKey }) {
    const [page, setPage] = useState('landing');
    const [currentNewsletter, setCurrentNewsletter] = useState<number | null>(null);
    const { user } = useAuth(); // Needed to pass isAuth to footer

    // Stato per gestire l'accesso alla waitlist bypassato
    const [waitlistAccess, setWaitlistAccess] = useState<Record<BrandKey, boolean>>(() => {
        const access: Record<string, boolean> = {};
        ['archivio', 'polizze', 'disdette'].forEach(brand => {
            try {
                access[brand] = sessionStorage.getItem(`waitlist_access_${brand}`) === 'true';
            } catch (e) {
                access[brand] = false; // Fallback in caso di errori con sessionStorage
            }
        });
        return access as Record<BrandKey, boolean>;
    });

    const grantWaitlistAccess = (brandToGrant: BrandKey) => {
        try {
            sessionStorage.setItem(`waitlist_access_${brandToGrant}`, 'true');
        } catch (e) {
            console.warn('sessionStorage not available');
        }
        setWaitlistAccess(prev => ({ ...prev, [brandToGrant]: true }));
    };

    const handleNavigate = (targetPage: string) => {
        setCurrentNewsletter(null); // Reset newsletter view on any navigation
        if (targetPage.startsWith('newsletter/')) {
            const issueId = parseInt(targetPage.split('/')[1], 10);
            if (!isNaN(issueId) && newsletterContent[issueId - 1]) {
                setCurrentNewsletter(issueId);
                setPage('newsletter');
            } else {
                setPage('newsletter'); // Fallback to index
            }
        } else {
            setPage(targetPage);
        }
    };
    
    // Show waitlist for specific brands. The parent `App` component ensures this is only
    // rendered for unauthenticated users, so we only need to check the brand.
    const isWaitlistBrand = ['archivio', 'polizze', 'disdette'].includes(brandKey);
    if (isWaitlistBrand && !waitlistAccess[brandKey]) {
         return <WaitlistPage onAccessGranted={() => grantWaitlistAccess(brandKey)} brandKey={brandKey} onNavigate={handleNavigate} />;
    }

    if (page === 'newsletter') {
        const NewsletterComponent = currentNewsletter ? newsletterContent[currentNewsletter - 1].component : null;
        return NewsletterComponent
            ? <NewsletterComponent onNavigate={handleNavigate} isStandalonePage={true} brandKey={brandKey} />
            : <NewsletterIndexPage onNavigate={handleNavigate} isStandalonePage={true} brandKey={brandKey} />;
    }

    switch (page) {
        case 'login':
            return <LoginPage onNavigateToRegister={() => setPage('register')} onNavigate={handleNavigate} brandKey={brandKey} />;
        case 'register':
            return <RegisterPage onNavigateToLogin={() => setPage('login')} onNavigateToTerms={() => setPage('terms')} onNavigateToPrivacy={() => setPage('privacy')} onNavigate={handleNavigate} brandKey={brandKey} />;
        case 'pricing':
            return <PricingPage onNavigateToRegister={() => setPage('register')} onNavigateBack={() => setPage('landing')} isInsideApp={false} onNavigate={handleNavigate} brandKey={brandKey} />;
        case 'changelog':
             return <ChangelogPage onNavigateBack={() => setPage('landing')} isStandalonePage={true} onNavigate={handleNavigate} brandKey={brandKey}/>;
        case 'terms':
            return <TermsOfServicePage onNavigateBack={() => setPage('landing')} isStandalonePage={true} onNavigate={handleNavigate} brandKey={brandKey}/>;
        case 'privacy':
            return <PrivacyPolicyPage onNavigateBack={() => setPage('landing')} isStandalonePage={true} onNavigate={handleNavigate} brandKey={brandKey} />;
        case 'landing':
            return <LandingPage onNavigate={handleNavigate} brandKey={brandKey} />;
        case 'unhub':
        default:
            return <UnHubPage />;
    }
}


// --- MAIN APP COMPONENT ---
function App() {
  const { user, isLoading } = useAuth();
  // Initialize state lazily to get the brand key on the first render, preventing a flash of incorrect content.
  const [brandKey, setBrandKey] = useState<BrandKey>(() => getBrandKey());

  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <UnauthenticatedApp brandKey={brandKey} />;
  }

  return <AuthenticatedApp />;
}

export default App;