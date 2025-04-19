// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@cloudscape-design/components';
import { signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadUserInfo() {
      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUsername(attributes.email || currentUser.username);
        setUserRole(attributes.profile || null);
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
        title: String(t('app.title')),
        logo: {
          src: '/images/aws.png', 
          alt: String(t('app.title'))
        }
      }}
      utilities={[
        {
          type: 'menu-dropdown',
          text: i18n.language === 'ko' ? '한국어' : 'English',
          iconName: 'settings',
          items: [ㅌㅂ
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
            ...(userRole === 'admin' ? [{ id: 'admin', text: t('nav.admin') || 'Administration' }] : []),
            { id: 'signout', text: String(t('auth.sign_out')) }
          ],
          onItemClick: ({ detail }) => {
            if (detail.id === 'signout') handleSignOut();
            if (detail.id === 'admin') navigate('/admin');
          }
        }
      ]}
    />
  );
};

export default Header;