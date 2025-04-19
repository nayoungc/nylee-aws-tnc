// src/utils/i18n-utils.ts
import { useTranslation } from 'react-i18next';

export function useTypedTranslation() {
  const { t, i18n } = useTranslation();
  
  // 항상 문자열을 반환하는 함수
  const tString = (key: string, options?: any): string => {
    return String(t(key, options));
  };
  
  return { tString, t, i18n };
}