import React, { useState, useEffect } from 'react';
import { 
    UserCircleIcon, CoinIcon, Bars3Icon, XMarkIcon, ArrowPathIcon 
} from './icons';
import { useAuth } from '../contexts/AuthContext';
import { brandAssets, type BrandKey } from '../services/brandingService';

interface HeaderProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    isSyncing: boolean;
}

const NavLink: React.FC<{ page: string, currentPage: string, onNavigate: (page: string) => void, brandColor: string, children: React.ReactNode, className?: string }> = ({ page, currentPage, onNavigate, brandColor, children, className }) => {
    const isActive = page === currentPage;
    const baseClasses = 'px-3 py-2 text-sm font-medium rounded-md transition-colors';
    
    // Using CSS variables to handle dynamic colors for Tailwind JIT
    const activeStyle = {
        '--brand-bg': `var(--color-${brandColor}-100)`,
        '--brand-text': `var(--color-${brandColor}-700)`,
        '--dark-brand-bg': `var(--color-${brandColor}-500-20)`,
        '--dark-brand-text': `var(--color-${brandColor}-300)`,
    } as React.CSSProperties;

    const activeClasses = 'bg-[--brand-bg] text-[--brand-text] dark:bg-[--dark-brand-bg] dark:text-[--dark-brand-text]';
    const inactiveClasses = 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50';
    
    return (
        <button
            id={`nav-link-${page}`}
            onClick={() => onNavigate(page)}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`}
            style={isActive ? activeStyle : {}}
        >
            {children}
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onLogout, isSyncing }) => {
    const [version, setVersion] = useState<string>('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    
    const brandKey = (currentPage === 'profile' || currentPage === 'unhub')
        ? 'unhub' as BrandKey
        : ['scan', 'archivio', 'polizze', 'disdette'].includes(currentPage) 
        ? currentPage as BrandKey 
        : 'unhub';
    const { Logo, Wordmark, colorClass } = brandAssets[brandKey];
    
    // Define logo colors for CSS variables
    const logoColors = {
        purple: { '--logo-light-fill': '#c6a1fc', '--logo-dark-fill': '#9e5bfe' },
        red: { '--logo-light-fill': '#fc7d6e', '--logo-dark-fill': '#fe3f27' },
        cyan: { '--logo-light-fill': '#c0fbfc', '--logo-dark-fill': '#61f5fe' },
        green: { '--logo-light-fill': '#86efac', '--logo-dark-fill': '#15803d' },
    };
    
    const brandStyleVars = (logoColors[colorClass] || logoColors.purple) as React.CSSProperties;
    
    useEffect(() => {
        fetch('./metadata.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data?.version) {
                    setVersion(data.version);
                }
            })
            .catch(error => console.error('Failed to load version:', error));
    }, []);

    const handleMobileNav = (page: string) => {
        onNavigate(page);
        setIsMenuOpen(false);
    };

    const handleMobileLogout = () => {
        onLogout();
        setIsMenuOpen(false);
    };

  return (
    <header 
        className="bg-white/80 dark:bg-slate-900/80 shadow-md backdrop-blur-sm sticky top-0 z-30"
        style={brandStyleVars}
    >
       <style>{`
        :root {
          --color-purple-100: #f3e8ff; --color-purple-700: #7e22ce; --color-purple-500-20: rgba(168, 85, 247, 0.2); --color-purple-300: #d8b4fe;
          --color-red-100: #fee2e2; --color-red-700: #b91c1c; --color-red-500-20: rgba(239, 68, 68, 0.2); --color-red-300: #fca5a5;
          --color-cyan-100: #cffafe; --color-cyan-700: #0e7490; --color-cyan-500-20: rgba(6, 182, 212, 0.2); --color-cyan-300: #67e8f9;
          --color-green-100: #dcfce7; --color-green-700: #15803d; --color-green-500-20: rgba(34, 197, 94, 0.2); --color-green-300: #86efac;
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('unhub')} className="flex items-center gap-2" aria-label="Vai alla dashboard principale">
                <Logo className="h-8 w-8 flex-shrink-0" />
                <div className="hidden sm:block">
                    <Wordmark className="h-6 text-slate-900 dark:text-slate-100" />
                </div>
            </button>
            {version && (
                <button 
                    onClick={() => onNavigate('changelog')}
                    className="font-semibold text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-xs px-1.5 py-0.5 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    title="Vedi storico versioni"
                >
                    v{version}
                </button>
            )}
          </div>
          
          <nav id="tutorial-header-nav" className="hidden lg:flex items-center gap-1 sm:gap-2">
            <NavLink page="unhub" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Hub</NavLink>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <NavLink page="scan" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Scansione</NavLink>
            <NavLink page="archivio" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Archivio</NavLink>
            <NavLink page="polizze" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Polizze</NavLink>
            <NavLink page="disdette" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Disdette</NavLink>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
             {isSyncing && (
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-semibold transition-opacity duration-300">
                    <ArrowPathIcon className="w-4 h-4 animate-spin"/>
                    <span className="hidden xl:inline">Sincronizzazione...</span>
                </div>
            )}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <NavLink page="dashboard" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Dashboard</NavLink>
            <NavLink page="guide" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Guida</NavLink>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            {user && (
                <button
                    id="tutorial-coincount"
                    onClick={() => onNavigate('pricing')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-purple-700 bg-purple-100 dark:text-purple-200 dark:bg-purple-500/20 rounded-full hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
                >
                    <CoinIcon className="w-5 h-5" />
                    <span className="font-bold">{user.subscription.scanCoinBalance.toLocaleString('it-CH')}</span>
                </button>
            )}
            {user?.email === 'fermo.botta@gmail.com' && (
              <NavLink page="admin" currentPage={currentPage} onNavigate={onNavigate} brandColor={colorClass}>Admin</NavLink>
            )}
            <NavLink page="profile" currentPage={currentPage} onNavigate={onNavigate} className="flex items-center gap-2 !ml-2" brandColor={colorClass}>
                <UserCircleIcon className="w-5 h-5"/>
                <span>Profilo</span>
            </NavLink>
             <button
                onClick={onLogout}
                className="ml-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30"
            >
                Logout
            </button>
          </nav>

          <div className="flex items-center lg:hidden gap-3">
            {isSyncing && <ArrowPathIcon className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400"/>}
            <NavLink page="profile" currentPage={currentPage} onNavigate={onNavigate} className="!p-2" brandColor={colorClass}>
                 <span className="sr-only">Profilo</span>
                 <UserCircleIcon className="h-6 w-6" />
            </NavLink>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Apri menu principale</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200 dark:border-slate-700">
                <NavLink page="unhub" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Hub</NavLink>
                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                <NavLink page="scan" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Scansione</NavLink>
                <NavLink page="archivio" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Archivio</NavLink>
                <NavLink page="polizze" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Polizze</NavLink>
                <NavLink page="disdette" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Disdette</NavLink>
                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                <NavLink page="dashboard" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Dashboard</NavLink>
                <NavLink page="guide" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Guida</NavLink>
                {user?.email === 'fermo.botta@gmail.com' && (
                  <NavLink page="admin" currentPage={currentPage} onNavigate={handleMobileNav} brandColor={colorClass} className="block w-full text-left !text-base">Admin</NavLink>
                )}
                
                 <div className="pt-4 mt-2 space-y-2 border-t border-slate-200 dark:border-slate-700">
                     {user && (
                        <button
                            onClick={() => handleMobileNav('pricing')}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-base font-semibold text-purple-700 bg-purple-100 dark:text-purple-200 dark:bg-purple-500/20 rounded-md hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
                        >
                            <CoinIcon className="w-6 h-6" />
                            <span className="font-bold">{user.subscription.scanCoinBalance.toLocaleString('it-CH')} ScanCoin</span>
                        </button>
                    )}
                    <button
                        onClick={handleMobileLogout}
                        className="w-full text-center block px-3 py-2 rounded-md text-base font-medium text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30"
                    >
                        Logout
                    </button>
                    {version && (
                        <button 
                            onClick={() => handleMobileNav('changelog')}
                            className="w-full mt-2 font-semibold text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-xs p-2 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50"
                            title="Vedi storico versioni"
                        >
                            Versione v{version}
                        </button>
                     )}
                 </div>
            </div>
        </div>
      )}
    </header>
  );
};