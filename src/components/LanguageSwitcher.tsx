// components/LanguageSwitcher.tsx
import React from 'react';
import { useTypedTranslation } from '@utils//i18n-utils';
import { Select } from '@cloudscape-design/components';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t, tString } = useTypedTranslation();
  
  const languages = [
    { value: 'en', label: t('language.english') },
    { value: 'ko', label: t('language.korean') }
  ];

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <Select
      selectedOption={{ value: i18n.language, label: i18n.language === 'en' ? tString('language.english') : tString('language.korean') }}
      onChange={({ detail }) => detail.selectedOption && handleLanguageChange(detail.selectedOption.value as string)}
      options={languages}
      ariaLabel={tString('user.preferred_language')}
    />
  );
};

export default LanguageSwitcher;