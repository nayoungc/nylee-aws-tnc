// src/utils/i18n-utils.ts
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

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