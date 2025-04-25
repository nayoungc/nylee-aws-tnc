// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  changeLanguage: (lang: string) => void;
}

const defaultContext: AppContextType = {
  theme: 'light',
  toggleTheme: () => {},
  language: 'ko',
  changeLanguage: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<string>('ko');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    // 언어 변경 시 i18next도 함께 변경 (i18n이 초기화된 경우에만)
    if (window.i18n) {
      window.i18n.changeLanguage(lang);
    }
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, language, changeLanguage }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
