import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define the possible theme values
type Theme = 'light' | 'dark' | 'system';

// Define the shape of the context data
interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  effectiveTheme: 'light' | 'dark';
}

// Create the context with a default undefined value
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define the props for the provider component
interface ThemeProviderProps {
  children: ReactNode;
}

// Create the provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // State to hold the current theme preference, initialized from localStorage or defaulting to 'system'
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem('theme');
      return (storedTheme as Theme) || 'system';
    } catch (e) {
      return 'system';
    }
  });

  // Effect to apply theme changes to the DOM and handle system preference changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }, [theme]);

  // Effect to listen for changes in system's color scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Re-trigger the theme application logic if the theme is set to 'system'
      if (theme === 'system') {
        const isDark = mediaQuery.matches;
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const effectiveTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme === 'dark' ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
