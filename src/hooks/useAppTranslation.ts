// src/hooks/useAppTranslation.ts
import { useTranslation } from 'react-i18next';

export const useAppTranslation = () => {
  return useTranslation([
    'common',
    'admin',
    'calendar',
    'course_catalog',
    'navigation',
    'auth',
    'tnc',
    'instructor'
  ]);
};