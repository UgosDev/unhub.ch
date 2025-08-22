import React from 'react';
import { brandAssets, type BrandKey, colorStyles } from '../services/brandingService';

interface FooterProps {
  onNavigate: (page: string) => void;
  isAuth: boolean;
  brandKey: BrandKey;
  appLastUpdated?: string;
}

const FooterLink: React.FC<{ page: string; onNavigate: (page: string) => void; children: React.ReactNode, brandColorClass: string }> = ({ page, onNavigate, children, brandColorClass }) => (
    <li>
        <button onClick={() => onNavigate(page)} className={`text-slate-500 dark:text-slate-400 ${brandColorClass} transition-colors`}>
            {children}
        </button>
    </li>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate, isAuth, brandKey, appLastUpdated }) => {
  const { Logo, Wordmark, colorClass } = brandAssets[brandKey];
  const brandColors = colorStyles[colorClass] || colorStyles.purple;

  return (
    <footer className="w-full py-12 mt-auto shrink-0 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
                <button onClick={() => onNavigate(isAuth ? 'scan' : 'landing')} className="flex items-center gap-3">
                    <Logo className="h-8 w-8" />
                    <Wordmark className="h-6 text-slate-700 dark:text-slate-300"/>
                </button>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 max-w-xs">
                    Trasforma i tuoi documenti in dati intelligenti.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                    &copy; {new Date().getFullYear()} scansioni.ch - Tutti i diritti riservati.
                </p>
                 {appLastUpdated && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        Ultimo aggiornamento: {new Date(appLastUpdated).toLocaleString('it-CH', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                )}
            </div>
            
            <div className="lg:col-start-3">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Prodotto</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {isAuth && (
                    <>
                      <FooterLink page="scan" onNavigate={onNavigate} brandColorClass={brandColors.hoverText}>Scansione</FooterLink>
                      <FooterLink page="dashboard" onNavigate={onNavigate} brandColorClass={brandColors.hoverText}>Dashboard</FooterLink>
                      <FooterLink page="guide" onNavigate={onNavigate} brandColorClass={brandColors.hoverText}>Guida</FooterLink>
                    </>
                  )}
                  <FooterLink page="pricing" onNavigate={onNavigate} brandColorClass={brandColors.hoverText}>Prezzi</FooterLink>
                </ul>
            </div>
            
            <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Azienda</h3>
                 <ul className="mt-4 space-y-3 text-sm">
                   <FooterLink page="changelog" onNavigate={onNavigate} brandColorClass={brandColors.hoverText}>Changelog</FooterLink>
                </ul>
            </div>
            
            <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Legale</h3>
                 <ul className="mt-4 space-y-3 text-sm">
                   <FooterLink page="terms" onNavigate={onNavigate} brandColorClass={brandColors.hoverText}>Termini di Servizio</FooterLink>
                   <FooterLink page="privacy" onNavigate={onNavigate} brandColorClass={brandColors.hoverText}>Privacy Policy</FooterLink>
                </ul>
            </div>
        </div>
      </div>
    </footer>
  );
};