// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // 번역 파일을 로드하기 위한 백엔드 활성화
  .use(Backend)
  // 브라우저에서 언어 자동 감지 활성화
  .use(LanguageDetector)
  // react-i18next 초기화
  .use(initReactI18next)
  // i18next 초기화
  .init({
    fallbackLng: 'en', // 기본 언어
    debug: process.env.NODE_ENV === 'development', // 개발 환경에서만 디버그 모드 활성화
    
    supportedLngs: ['en', 'ko'], // 지원 언어
    
    interpolation: {
      escapeValue: false, // React에서는 이미 XSS 방지를 하므로 false로 설정
    },
    
    // 언어 감지 옵션
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    // 백엔드 옵션
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // 번역 파일 경로
    }
  });

export default i18n;