// /src/components/common/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@cloudscape-design/components';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation(['navigation']);

  return (
    <Select
      selectedOption={{ 
        label: i18n.language === 'ko' 
          ? t('navigation:language_korean') 
          : t('navigation:language_english'), 
        value: i18n.language 
      }}
      onChange={({ detail }) => {
        i18n.changeLanguage(detail.selectedOption.value);
      }}
      options={[
        { label: t('navigation:language_english'), value: 'en' },
        { label: t('navigation:language_korean'), value: 'ko' },
      ]}
      ariaLabel={t('navigation:language_label')}
    />
  );
};

export default LanguageSwitcher;