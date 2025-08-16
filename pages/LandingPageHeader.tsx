import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '../components/icons';
import { brandAssets, type BrandKey } from '../services/brandingService';

interface LandingPageHeaderProps {
    onNavigate: (page: 'login' | 'register' | 'pricing' | 'changelog' | 'terms' | 'privacy' | 'landing') => void;
    version?: string;
    brandKey: BrandKey;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
    <a
        href={href}
        onClick={onClick}
        className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
    >
        {children}
    </a>
);

const LandingPageHeader: React.FC<LandingPageHeaderProps> = ({ onNavigate, version, brandKey }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { Logo, Wordmark } = brandAssets[brandKey] || brandAssets.default;

    const handleMobileNav = (page: 'login' | 'register' | 'pricing' | 'changelog') => {
        onNavigate(page);
        setIsMenuOpen(false);
    }
    
    const handleMobileLink = () => {
        setIsMenuOpen(false);
    }

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Logo className="h-9 w-9" />
                        <div className="flex items-baseline gap-2">
                             <Wordmark className="h-7 text-slate-900 dark:text-slate-100" />
                            {version && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate('changelog'); }}
                                    className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    title="Vedi storico versioni"
                                >
                                    v{version}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <NavLink href="#how-it-works">Come Funziona</NavLink>
                        <NavLink href="#testimonials">Dicono di noi</NavLink>
                        <NavLink href="#faq">FAQ</NavLink>
                        <NavLink href="#" onClick={() => onNavigate('pricing')}>Prezzi</NavLink>
                    </nav>

                    <div className="hidden lg:flex items-center gap-4">
                        <button onClick={() => onNavigate('login')} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            Accedi
                        </button>
                        <button onClick={() => onNavigate('register')} className="px-5 py-2 text-sm font-bold bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg">
                            Registrati
                        </button>
                    </div>

                    {/* Mobile Nav Button */}
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                            {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 shadow-lg p-4">
                    <nav className="flex flex-col gap-4">
                        <NavLink href="#how-it-works" onClick={handleMobileLink}>Come Funziona</NavLink>
                        <NavLink href="#testimonials" onClick={handleMobileLink}>Dicono di noi</NavLink>
                        <NavLink href="#faq" onClick={handleMobileLink}>FAQ</NavLink>
                        <NavLink href="#" onClick={() => handleMobileNav('pricing')}>Prezzi</NavLink>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col gap-3">
                            <button onClick={() => handleMobileNav('login')} className="w-full text-center px-5 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full">
                                Accedi
                            </button>
                            <button onClick={() => handleMobileNav('register')} className="w-full px-5 py-2 text-sm font-bold bg-purple-600 text-white rounded-full">
                                Registrati
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default LandingPageHeader;
