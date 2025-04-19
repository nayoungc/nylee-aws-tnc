import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@cloudscape-design/components';
import { signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useTranslation } from 'react-i18next'; // react-i18next 가져오기

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // i18n 객체 가져오기
  const [username, setUsername] = useState<string>('');
  
  useEffect(() => {
    async function loadUserInfo() {
      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUsername(attributes.email || currentUser.username);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      }
    }
    
    loadUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 언어 변경 핸들러
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <TopNavigation
      identity={{
        href: '/',
        title: String(t('app.title')),  // String() 추가
        logo: {
          src: '/logo.png',
          alt: String(t('app.title'))   // String() 추가
        }
      }}
      utilities={[
        {
          type: 'menu-dropdown',
          text: i18n.language === 'ko' ? '한국어' : 'English',
          iconName: 'settings',  // 'globe' → 'settings' 변경
          items: [
            { id: 'en', text: 'English' },
            { id: 'ko', text: '한국어' }
          ],
          onItemClick: ({ detail }) => changeLanguage(detail.id)
        },
        {
          type: 'menu-dropdown',
          text: username,
          iconName: 'user-profile',
          items: [
            { id: 'signout', text: String(t('auth.sign_out')) }  // String() 추가
          ],
          onItemClick: ({ detail }) => {
            if (detail.id === 'signout') handleSignOut();
          }
        }
      ]}
    />
  );
};

export default Header;