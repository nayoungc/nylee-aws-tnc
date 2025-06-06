import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectProps } from '@cloudscape-design/components';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation(['navigation']);

  // 현재 선택된 언어에 따라 옵션 선택
  const selectedOption = {
    label: i18n.language === 'ko' ? '한국어' : 'English',
    value: i18n.language
  };

  const options = [
    { label: 'English', value: 'en' },
    { label: '한국어', value: 'ko' },
  ];

  // 타입 정의 추가
  const handleLanguageChange = ({ detail }: { detail: SelectProps.ChangeDetail }) => {
    const newLang = detail.selectedOption?.value ?? 'en'; // 기본값으로 'en' 설정
    i18n.changeLanguage(newLang);
    
    // 필요하다면 언어 설정을 localStorage에 저장
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <Select
      selectedOption={selectedOption}
      onChange={handleLanguageChange}
      options={options}
      ariaLabel={t('navigation:language_label')}
    />
  );
};

export default LanguageSwitcher;