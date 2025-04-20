// src/components/SimpleHeader.tsx
import React from 'react';
import { TopNavigation } from '@cloudscape-design/components';
import { useTypedTranslation } from '../utils/i18n-utils';
import { useNavigate } from 'react-router-dom';

const SimpleHeader: React.FC = () => {
  const { tString, i18n } = useTypedTranslation();
  const navigate = useNavigate();
  
  // 언어 변경 핸들러
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };
  
  return (
    <TopNavigation
      identity={{
        href: '/',
        title: tString('app.title'),
        logo: {
          src: '/images/aws.png',
          alt: tString('app.title')
        }
      }}
      utilities={[
        // 언어 선택기만 표시
        {
          type: 'button',
          text: i18n.language === 'ko' ? '🇰🇷 한국어' : '🇺🇸 English',
          onClick: () => changeLanguage(i18n.language === 'ko' ? 'en' : 'ko')
        }
      ]}
    />
  );
};

export default SimpleHeader;