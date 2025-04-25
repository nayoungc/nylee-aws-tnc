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
      appName: 'AWS Training Portal'
    }
  },
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류',
      appName: 'AWS 교육 포털'
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // i18next를 react-i18next와 연결
  .init({
    fallbackLng: 'en',
    debug: false, // 개발 환경에서만 true로 설정
    
    resources, // 기본 번역 리소스 추가
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    defaultNS: 'common',
    ns: ['common'],
    
    interpolation: {
      escapeValue: false, // React에서는 이미 XSS 방어가 되어있음
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;