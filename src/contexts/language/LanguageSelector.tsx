// src/components/language/LanguageSelector.tsx
import React from 'react';
import { ButtonDropdown } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useApp } from '@contexts/AppContext';

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage } = useApp();
  const { t } = useTranslation();

  const languages = [
    { id: 'ko', text: '한국어', iconUrl: '/assets/flags/ko.svg' },
    { id: 'en', text: 'English', iconUrl: '/assets/flags/en.svg' },
  ];

  const currentLanguage = languages.find(lang => lang.id === language) || languages[0];

  return (
    <ButtonDropdown
      ariaLabel={t('header.language.label')}
      variant="icon"
      items={languages}
      onItemClick={({ detail }) => changeLanguage(detail.id)}
      expandToViewport
    >
      {currentLanguage.text}
    </ButtonDropdown>
  );
};

export default LanguageSelector;