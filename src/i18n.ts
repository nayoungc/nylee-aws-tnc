import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Only initialize once
if (!i18n.isInitialized) {
  i18n
    .use(Backend) // HTTP 백엔드 사용
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // resources 설정 제거 (파일을 직접 import 하지 않음)
      fallbackLng: 'ko',
      supportedLngs: ['en', 'ko'], 
      debug: process.env.NODE_ENV === 'development',
      interpolation: { escapeValue: false },
      
      // 백엔드 설정 추가 - public 폴더에서 로드
      backend: {
        loadPath: '/locales/{{lng}}/translation.json'
      },
      
      detection: {
        order: ['localStorage', 'cookie', 'navigator'],
        lookupLocalStorage: 'language',
        caches: ['localStorage']
      },
      react: { useSuspense: false }
    });
}

export default i18n;