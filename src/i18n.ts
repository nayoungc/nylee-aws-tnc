// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { isDevelopment } from '@utils/env';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko',
    debug: isDevelopment, // 개발 환경에서만 디버그 활성화
    
    // 기본 네임스페이스와 사용할 모든 네임스페이스 명시
    defaultNS: 'common',
    ns: ['common', 'admin', 'calendar', 'course_catalog', 'navigation', 'auth', 'tnc', 'course'],
        
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;