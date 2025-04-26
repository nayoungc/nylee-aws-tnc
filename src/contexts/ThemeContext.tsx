// src/contexts/ThemeContext.tsx
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { applyMode, Mode } from '@cloudscape-design/global-styles';

// Theme context type 정의
type ThemeContextType = {
  theme: Mode;
  toggleTheme: () => void;
  isDarkMode: boolean;
};

// 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 테마 프로바이더 컴포넌트
export function ThemeProvider({ children }: { children: ReactNode }) {
  // 초기 테마 결정 로직 - 타입 오류 해결
  const [theme, setTheme] = useState<Mode>(() => {
    // 브라우저에서만 실행되도록 체크 (SSR 호환성)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // 타입 단언 사용하여 오류 해결
      if (savedTheme === 'light') return 'light' as Mode;
      if (savedTheme === 'dark') return 'dark' as Mode;
      
      // 시스템 설정 기반 기본값
      return prefersDark ? ('dark' as Mode) : ('light' as Mode);
    }
    // 기본값
    return 'light' as Mode;
  });

  const isDarkMode = theme === 'dark';

  // 테마 토글 함수
  const toggleTheme = () => {
    const newTheme: Mode = theme === 'light' ? ('dark' as Mode) : ('light' as Mode);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 테마 적용 이펙트
  useEffect(() => {
    // CloudScape 글로벌 테마 적용
    applyMode(theme);
    
    // HTML 루트에 테마 속성 설정
    document.documentElement.setAttribute('data-mode', theme);
    
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // 필요시 시스템 테마 자동 반영 로직 추가 가능
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 컨텍스트 값
  const value = {
    theme,
    toggleTheme,
    isDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 커스텀 훅
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}