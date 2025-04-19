// src/utils/i18n-utils.ts
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation resources
import enTranslation from '../locales/en.json';
import koTranslation from '../locales/ko.json';

// Initialize i18next if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: enTranslation
        },
        ko: {
          translation: koTranslation
        }
      },
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['localStorage', 'cookie', 'navigator'],
        lookupLocalStorage: 'language',
        caches: ['localStorage']
      }
    });
}

/**
 * useTranslation 훅을 확장하여 타입 안전한 번역 기능을 제공하는 커스텀 훅
 * @returns 확장된 번역 기능
 */
export const useTypedTranslation = () => {
  const { t, i18n } = useTranslation();
  
  /**
   * 번역 결과를 강제로 문자열로 처리하는 함수
   * @param key 번역 키
   * @param options 번역 옵션
   * @returns 번역된 문자열
   */
  const tString = (key: string, options?: any): string => {
    return String(t(key, options));
  };
  
  return {
    t,
    tString,
    i18n,
  };
};

/**
 * 번역 함수를 받아서 타입 안전한 문자열 번역 함수를 반환
 * @param translationFunc i18next의 번역 함수
 * @returns 문자열 타입을 보장하는 번역 함수
 */
export const createTString = (translationFunc: TFunction) => {
  return (key: string, options?: any): string => {
    return String(translationFunc(key, options));
  };
};

/**
 * Change the current language
 * @param language Language code to change to (e.g., 'en', 'ko')
 */
export const changeLanguage = (language: string): Promise<typeof i18n.t> => {
  return i18n.changeLanguage(language);
};

/**
 * Get the current language
 * @returns Current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Export the i18n instance for direct usage
export default i18n;