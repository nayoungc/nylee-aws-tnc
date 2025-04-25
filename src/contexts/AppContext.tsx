// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import { useTranslation } from 'react-i18next';

interface AppContextType {
  theme: Mode;
  toggleTheme: () => void;
  language: string;
  changeLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  
  // 테마 상태
  const [theme, setTheme] = useState<Mode>(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Mode 타입에 맞는 값만 사용
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return prefersDark ? 'dark' : 'light';
  });

  // 언어 상태
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || i18n.language;
  });

  const toggleTheme = () => {
    // 명시적으로 Mode 타입으로 처리
    const newTheme: Mode = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // 테마 적용
  useEffect(() => {
    applyMode(theme);
    document.documentElement.setAttribute('data-mode', theme);
  }, [theme]);

  // 언어 적용
  useEffect(() => {
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const value = {
    theme,
    toggleTheme,
    language,
    changeLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};