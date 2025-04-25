// src/components/layout/TopNavigationHeader.tsx
import React from 'react';
import { 
  TopNavigation, 
  TopNavigationProps 
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useApp } from '@contexts/AppContext';
import { useAuth } from '@hooks/useAuth';

const TopNavigationHeader: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, changeLanguage } = useApp();
  const { isAuthenticated, logout, userInfo } = useAuth();
  
  // 테마 메뉴 아이템
  const themeItems = [
    { 
      id: 'light', 
      text: t('header.theme.light'), 
      description: theme === 'light' ? '✓' : undefined 
    },
    { 
      id: 'dark', 
      text: t('header.theme.dark'), 
      description: theme === 'dark' ? '✓' : undefined 
    }
  ];

  // 언어 메뉴 아이템
  const languageItems = [
    { 
      id: 'en', 
      text: 'English', 
      description: language === 'en' ? '✓' : undefined 
    },
    { 
      id: 'ko', 
      text: '한국어', 
      description: language === 'ko' ? '✓' : undefined 
    }
  ];

  // 유틸리티 내비게이션 아이템
  const utilities: TopNavigationProps.Utility[] = [
    // 테마 전환 메뉴 (드롭다운으로 변경)
    {
      type: 'menu-dropdown',
      text: t('header.theme.title'),
      iconName: 'star',
      title: t('header.theme.title'),
      items: themeItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        if (detail.id === 'light' || detail.id === 'dark') {
          toggleTheme();
        }
      }
    },
    // 언어 선택 메뉴 (드롭다운으로 변경)
    {
      type: 'menu-dropdown',
      text: language === 'en' ? 'English' : '한국어',
      title: t('header.language.label'),
      items: languageItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        changeLanguage(detail.id);
      }
    }
  ];

  // 인증 상태에 따라 추가 메뉴
  if (isAuthenticated && userInfo) {
    // 로그인한 경우 사용자 메뉴 추가
    utilities.push({
      type: 'menu-dropdown',
      text: userInfo.attributes?.name || userInfo.user?.username || t('header.user.account'),
      iconName: 'user-profile',
      items: [
        { id: 'profile', text: t('header.user.profile') },
        { id: 'settings', text: t('header.user.settings') },
        { id: 'divider', text: '-' },
        { id: 'signout', text: t('header.user.signOut') }
      ],
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        if (detail.id === 'signout') {
          logout();
        }
      }
    });
  } else {
    // 로그인하지 않은 경우 로그인 버튼 추가
    utilities.push({
      type: 'button',
      text: t('header.user.login'),
      href: '/login'
    });
  }

  return (
    <TopNavigation
      identity={{
        href: '/',
        title: t('header.title'),
        logo: {
          src: '/assets/logo.svg',
          alt: t('header.logo.alt')
        }
      }}
      utilities={utilities}
      i18nStrings={{
        searchIconAriaLabel: t('header.search.ariaLabel'),
        searchDismissIconAriaLabel: t('header.search.dismissAriaLabel'),
        overflowMenuTriggerText: t('header.overflow.triggerText'),
        overflowMenuTitleText: t('header.overflow.titleText'),
        overflowMenuBackIconAriaLabel: t('header.overflow.backAriaLabel'),
        overflowMenuDismissIconAriaLabel: t('header.overflow.dismissAriaLabel')
      }}
    />
  );
};

export default TopNavigationHeader;