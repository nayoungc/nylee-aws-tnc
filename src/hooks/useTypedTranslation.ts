// src/hooks/useTypedTranslation.ts
import { useTranslation } from 'react-i18next';

export function useTypedTranslation() {
  const { t: originalT, i18n } = useTranslation();
  
  // 문자열로 타입이 보장된 번역 함수
  const t = (key: string, options?: any): string => String(originalT(key, options));
  
  return { t, i18n };
}