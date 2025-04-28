// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// 초기화 Promise를 export하여 다른 곳에서 사용할 수 있게 함
export const i18nInstance = i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next);

export const initI18n = i18nInstance.init({
  fallbackLng: 'ko',
  debug: true,
  
  // 'en-US'를 'en'으로 처리하는 설정
  load: 'languageOnly',
  
  // 모든 네임스페이스 포함
  supportedLngs: ['en', 'ko'],
  defaultNS: 'common',
  ns: ['common', 'admin', 'calendar', 'course_catalog', 'navigation', 'auth', 'tnc', 'instructor'],
  
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