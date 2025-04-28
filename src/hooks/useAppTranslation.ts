// src/hooks/useAppTranslation.ts
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '../i18n';

export const useAppTranslation = () => {
  const [isReady, setIsReady] = useState(i18n.isInitialized);
  
  useEffect(() => {
    if (!isReady) {
      const handleInitialized = () => {
        setIsReady(true);
      };
      
      if (i18n.isInitialized) {
        setIsReady(true);
      } else {
        i18n.on('initialized', handleInitialized);
      }
      
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, [isReady]);
  
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