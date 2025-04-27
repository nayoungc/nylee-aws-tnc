// src/hooks/useAppTranslation.ts
import { useTranslation } from 'react-i18next';

// 모든 네임스페이스를 포함하는 커스텀 훅
export const useAppTranslation = () => {
  return useTranslation([
    'common',
    'admin',
    'course_catalog',
    'navigation',
    'auth'
  ]);
};