// src/components/SimpleHeader.tsx 수정
import React from 'react';
import { TopNavigation } from '@cloudscape-design/components';
import { useTypedTranslation } from '@utils/i18n-utils';

const SimpleHeader: React.FC = () => {
  const { tString, i18n } = useTypedTranslation();
  
  // 언어 변경 핸들러
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };
  
  return (
    <TopNavigation
      identity={{
        href: '/',
        title: tString('app.title'),
        // 로고를 제거하거나 다른 이미지 사용
        logo: {
          src: '/images/aws.png', // 더 간소화된 로고
          alt: tString('app.title')
        }
      }}
      utilities={[
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