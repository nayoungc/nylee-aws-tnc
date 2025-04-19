import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@cloudscape-design/components';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <Select
      selectedOption={{ 
        value: i18n.language, 
        label: i18n.language === 'ko' ? '한국어' : 'English' 
      }}
      onChange={({ detail }) => 
        changeLanguage(detail.selectedOption.value || 'en')
      }
      options={[
        { value: 'en', label: 'English' },
        { value: 'ko', label: '한국어' }
      ]}
      ariaLabel={t('user.preferred_language') as string}
    />
  );
};

export default LanguageSwitcher;