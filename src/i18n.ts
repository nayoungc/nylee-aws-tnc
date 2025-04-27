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
    debug: isDevelopment,
    
    // 'en-US'를 'en'으로 처리하는 설정
    load: 'languageOnly',  // 언어 코드만 사용하고 국가 코드는 무시
    
    // 지원하는 언어 목록
    supportedLngs: ['en', 'ko'],
    
    // 기존 설정을 유지
    defaultNS: 'common',
    ns: ['common', 'admin', 'calendar', 'course_catalog', 'navigation', 'auth', 'tnc'],
    
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