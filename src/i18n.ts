// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 영어와 한국어 번역 리소스
import translationEN from './translations/en.json';
import translationKO from './translations/ko.json';

// 리소스 구성
const resources = {
  en: {
    translation: translationEN
  },
  ko: {
    translation: translationKO
  }
};

i18n
  // 언어 감지 기능 사용
  .use(LanguageDetector)
  // React i18next 모듈 초기화
  .use(initReactI18next)
  // 초기화 옵션
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React에서는 XSS 방지가 내장되어 있음
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;