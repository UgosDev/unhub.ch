import React from 'react';
import { brandAssets, type BrandKey, colorStyles } from '../services/brandingService';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '../components/icons';

interface LandingPageHeaderProps {
  onNavigate: (page: string) => void;
  brandKey: BrandKey;
}

const LandingPageHeader: React.FC<LandingPageHeaderProps> = ({ onNavigate, brandKey }) => {
    const { Logo, Wordmark, colorClass } = brandAssets[brandKey];
    const brandColors = colorStyles[colorClass] || colorStyles.purple;
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        const newTheme = theme === 'system' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark')
            : theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    const effectiveTheme = theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;


    return (
        <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto flex justify-between items-center">
                <button onClick={() => onNavigate('landing')} className="flex items-center gap-3">
                    <Logo className="h-8 w-8" />
                    <Wordmark className="h-6 hidden sm:block text-slate-700 dark:text-slate-300"/>
                </button>
                <nav className="flex items-center gap-4 sm:gap-6">
                    <button onClick={() => onNavigate('pricing')} className={`text-sm font-semibold text-slate-600 dark:text-slate-300 ${brandColors.hoverText} transition-colors`}>Prezzi</button>
                    <button onClick={() => onNavigate('changelog')} className={`text-sm font-semibold text-slate-600 dark:text-slate-300 ${brandColors.hoverText} transition-colors`}>Changelog</button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        {effectiveTheme === 'dark' ? <SunIcon className="w-5 h-5 text-slate-400" /> : <MoonIcon className="w-5 h-5 text-slate-500" />}
                    </button>
                    <button onClick={() => onNavigate('login')} className={`px-4 py-2 text-sm font-bold text-white rounded-full ${brandColors.bg} ${brandColors.hoverBg} transition-colors shadow-md`}>
                        Accedi
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default LandingPageHeader;
