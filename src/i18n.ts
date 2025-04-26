// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// 기본 번역 (locales 파일이 로드되지 않을 때를 대비)
const resources = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      appName: 'AWS Training Portal',
      home: 'Home',
      instructor: 'Instructor'
    },
    catalog: {
      title: 'Course Catalog'
    }
  },
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류',
      appName: 'AWS 교육 포털',
      home: '홈',
      instructor: '강사'
    },
    catalog: {
      title: '강의 카탈로그'
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko',
    debug: process.env.NODE_ENV === 'development', // 개발 환경에서 디버그 활성화
    
    resources, // 기본 번역 리소스 추가
    
    backend: {
      // 실제 파일 위치가 맞는지 확인
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    defaultNS: 'common',
    // 사용하는 모든 네임스페이스 추가
    ns: ['common', 'catalog', 'menu', 'navigation', 'auth', 'admin'],
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;