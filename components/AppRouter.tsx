import React from 'react';
import type { AppLogic } from '../hooks/useAppLogic'; // Assuming you export the return type of useAppLogic

import { Workspace } from './Workspace';
import Dashboard from '../pages/Dashboard';
import Guida from '../pages/Guida';
import ProfilePage from '../pages/ProfilePage';
import PricingPage from '../pages/PricingPage';
import ChangelogPage from '../pages/ChangelogPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import Archivio from '../pages/Archivio';
import Polizze from '../pages/Polizze';
import Disdette from '../pages/Disdette';
import AdminDashboard from '../pages/AdminDashboard';
import NewsletterIndexPage from '../pages/newsletter/NewsletterIndexPage';
import { newsletterContent } from '../pages/newsletter/content';
import { getBrandKey, type BrandKey } from '../services/brandingService';


export const AppRouter: React.FC<AppLogic> = (props) => {
    const { 
        currentPage, 
        currentNewsletter,
        user,
        navigate,
        archivedDocs,
        handleMoveArchivedDocument,
        handleDeleteArchivedDocument,
        handleUpdateArchivedDocument,
        polizzeDocs,
        handleUpdatePolizzaDocument,
        handleDeletePolizzaDocument,
        disdetteDocs,
        handleCreateDisdetta,
        handleUpdateDisdettaDocument,
        handleDeleteDisdettaDocument,
        isDisdettaWizardOpen,
        setIsDisdettaWizardOpen,
        initialDisdettaData,
        setInitialDisdettaData,
        scanHistory,
        isLoadingHistory,
        handleAskUgo,
        allUserFeedback,
        allUsersData,
        appSettings,
        handleUpdateSettings,
        onStartTutorial,
        archivedChats,
        handleDeleteArchivedChat,
        setScanHistory,
        resetChat,
        scrollToSection,
        setScrollToSection,
        accessLogs
    } = props;

    const brandKey = ['scan', 'archivio', 'polizze', 'disdette'].includes(currentPage) ? currentPage as BrandKey : 'scan';

    if (currentPage === 'newsletter') {
        const NewsletterContent = currentNewsletter ? newsletterContent[currentNewsletter - 1]?.component : null;
        return NewsletterContent 
            ? <NewsletterContent onNavigate={navigate} brandKey={brandKey} />
            : <NewsletterIndexPage onNavigate={navigate} brandKey={brandKey} />;
    }
    
    switch(currentPage) {
        case 'archivio':
            return <Archivio 
                        archivedDocs={archivedDocs} 
                        onMoveDocument={handleMoveArchivedDocument}
                        onDeleteDocument={handleDeleteArchivedDocument}
                        onUpdateDocument={handleUpdateArchivedDocument}
                    />;
        case 'polizze':
            return <Polizze 
                        polizzeDocs={polizzeDocs}
                        onUpdateDocument={handleUpdatePolizzaDocument}
                        onDeleteDocument={handleDeletePolizzaDocument}
                    />;
        case 'disdette':
            return <Disdette
                        disdetteDocs={disdetteDocs}
                        user={user!}
                        onCreateDisdetta={handleCreateDisdetta}
                        onUpdateDocument={handleUpdateDisdettaDocument}
                        onDeleteDocument={handleDeleteDisdettaDocument}
                        isWizardOpen={isDisdettaWizardOpen}
                        onWizardOpen={() => setIsDisdettaWizardOpen(true)}
                        onWizardClose={() => {
                            setIsDisdettaWizardOpen(false);
                            setInitialDisdettaData(null);
                        }}
                        initialData={initialDisdettaData}
                    />;
        case 'dashboard':
            return <Dashboard user={user!} onNavigate={navigate} history={scanHistory} isLoadingHistory={isLoadingHistory} />;
        case 'guide':
            return <Guida onAskUgo={handleAskUgo} />;
        case 'admin':
             if (user?.email !== 'fermo.botta@gmail.com' || !props.isAdminAccessGranted) {
                 return <Workspace {...props} />; // Fallback to workspace
             }
            return <AdminDashboard feedbackData={allUserFeedback} allUsersData={allUsersData} />;
        case 'profile':
            return <ProfilePage 
                onLogout={props.logout} 
                currentPage={currentPage} 
                onNavigate={navigate} 
                settings={appSettings} 
                onUpdateSettings={handleUpdateSettings} 
                onStartTutorial={onStartTutorial} 
                archivedChats={archivedChats}
                onDeleteArchivedChat={handleDeleteArchivedChat}
                setScanHistory={setScanHistory}
                onResetChat={resetChat}
                scrollToSection={scrollToSection}
                onScrolledToSection={() => setScrollToSection(null)}
                accessLogs={accessLogs}
            />;
        case 'pricing':
            return <PricingPage onNavigateToRegister={() => {}} onNavigateBack={() => navigate('scan')} onNavigate={navigate} isInsideApp={true} brandKey={brandKey} />;
        case 'changelog':
            return <ChangelogPage onNavigateBack={() => navigate('scan')} onNavigate={navigate} brandKey={brandKey} />;
        case 'terms':
            return <TermsOfServicePage onNavigateBack={() => navigate('profile')} onNavigate={navigate} brandKey={brandKey} />;
        case 'privacy':
            return <PrivacyPolicyPage onNavigateBack={() => navigate('profile')} onNavigate={navigate} brandKey={brandKey} />;
        case 'scan':
        default:
            return <Workspace {...props} />;
    }
};