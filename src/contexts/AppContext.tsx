// src/contexts/AppContext.tsx
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import i18n from 'i18next';

interface AppContextType {
  theme: Mode;
  toggleTheme: () => void;
  isDarkMode: boolean;
  language: string;
  changeLanguage: (lang: string) => void;
}

// 기본값 설정
const defaultContext: AppContextType = {
  theme: 'light' as Mode,
  toggleTheme: () => {},
  isDarkMode: false,
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
  // 초기 테마 결정 로직
  const [theme, setTheme] = useState<Mode>(() => {
    // 브라우저에서만 실행되도록 체크 (SSR 호환성)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // 명시적으로 Mode 타입으로 처리하여 타입 오류 해결
      if (savedTheme === 'light') return 'light' as Mode;
      if (savedTheme === 'dark') return 'dark' as Mode;
      
      // 시스템 설정 기반 기본값
      return prefersDark ? ('dark' as Mode) : ('light' as Mode);
    }
    // 기본값
    return 'light' as Mode;
  });

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language');
      return savedLang || navigator.language.substring(0, 2) || 'ko';
    }
    return 'ko';
  });

  const isDarkMode = theme === 'dark';

  // 테마 토글 함수
  const toggleTheme = () => {
    const newTheme: Mode = theme === 'light' ? ('dark' as Mode) : ('light' as Mode);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // 임포트한 i18n 객체 직접 사용
    if (typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(lang);
    }
  };

  // 테마 적용 이펙트
  useEffect(() => {
    // CloudScape 글로벌 테마 적용
    applyMode(theme);
    
    // HTML 루트에 테마 속성 설정
    document.documentElement.setAttribute('data-mode', theme);
    document.documentElement.setAttribute('data-language', language);
    
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // 필요시 시스템 테마 자동 반영 로직 추가 가능
      // 자동 적용을 원하는 경우 아래 주석을 해제
      // const newTheme = e.matches ? ('dark' as Mode) : ('light' as Mode);
      // setTheme(newTheme);
      // localStorage.setItem('theme', newTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, language]);

  return (
    <AppContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDarkMode,
      language, 
      changeLanguage 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;