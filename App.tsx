import React, { useState, useEffect } from 'react';
import { getBrandKey, type BrandKey } from './services/brandingService';

// Keep pages that are part of the waitlist experience
import WaitlistPage from './pages/WaitlistPage';
import UnHubPage from './pages/UnHubPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { CookieBanner } from './components/CookieBanner';

function App() {
    const [page, setPage] = useState('waitlist'); // 'waitlist', 'unhub', 'privacy'
    const [brandKey, setBrandKey] = useState<BrandKey>(getBrandKey());
    
    const [showCookieBanner, setShowCookieBanner] = useState(false);
    const [appLastUpdated, setAppLastUpdated] = useState<string>('');
    
    useEffect(() => {
        fetch('./metadata.json')
            .then(response => response.json())
            .then(data => {
                if (data?.lastUpdated) {
                    setAppLastUpdated(data.lastUpdated);
                }
            })
            .catch(error => console.error('Failed to load metadata:', error));
    }, []);

    useEffect(() => {
        // A small delay to avoid banner flash on load
        const timer = setTimeout(() => {
            try {
                if (!localStorage.getItem('cookies_accepted_v1')) {
                    setShowCookieBanner(true);
                }
            } catch (e) {
                console.warn('Could not access localStorage for cookies.', e);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleAcceptCookies = () => {
        try {
            localStorage.setItem('cookies_accepted_v1', 'true');
            setShowCookieBanner(false);
        } catch (e) {
            console.warn('Could not save cookie acceptance to localStorage.', e);
        }
    };
    
    const navigate = (newPage: string) => {
        if (newPage === 'unhub') {
            setPage('unhub');
        } else if (newPage === 'privacy') {
            setPage('privacy');
        } else {
            // Any other navigation from inside the waitlist pages (like from footer) goes back to waitlist
            setPage('waitlist');
        }
    };

    const handleBrandChange = (newBrand: BrandKey) => {
        setBrandKey(newBrand);
        setPage('waitlist');
    };

    const grantAccess = () => {
        // Secret code was entered. The user requested to remove everything else.
        // We show an alert to acknowledge the action but keep the user on the waitlist page.
        alert("Accesso sbloccato. In questa versione semplificata, la pagina di attesa rimane attiva. Ricarica la pagina per continuare a esplorare.");
    };

    const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <>
            {children}
            {showCookieBanner && <CookieBanner onAccept={handleAcceptCookies} onNavigateToPrivacy={() => navigate('privacy')} brandKey={brandKey} />}
        </>
    );
    
    const renderPage = () => {
        switch(page) {
            case 'unhub':
                return <UnHubPage />;
            case 'privacy':
                return <PrivacyPolicyPage onNavigateBack={() => navigate('waitlist')} onNavigate={navigate} isStandalonePage={false} brandKey={brandKey} />;
            case 'waitlist':
            default:
                return <WaitlistPage onAccessGranted={grantAccess} brandKey={brandKey} appLastUpdated={appLastUpdated} onNavigate={navigate} onBrandChange={handleBrandChange} />;
        }
    }

    return <PageWrapper>{renderPage()}</PageWrapper>;
}

export default App;
