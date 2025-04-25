// src/components/layout/TopNavigationHeader.tsx
// app/components/layout/TopNavigationHeader.tsx
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
  const { isAuthenticated, logout, user, isAdmin } = useAuth(); // userInfo → user로 변경
  
  // 테마 메뉴 아이템
  const themeItems = [
    { 
      id: 'light', 
      text: t('header.theme.light', 'Light'), // 기본값 추가
      description: theme === 'light' ? '✓' : undefined 
    },
    { 
      id: 'dark', 
      text: t('header.theme.dark', 'Dark'), // 기본값 추가
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
    // 테마 전환 메뉴
    {
      type: 'menu-dropdown',
      text: t('header.theme.title', 'Theme'),
      iconName: 'star',
      title: t('header.theme.title', 'Theme'),
      items: themeItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        if (detail.id === 'light' || detail.id === 'dark') {
          toggleTheme();
        }
      }
    },
    // 언어 선택 메뉴
    {
      type: 'menu-dropdown',
      text: language === 'en' ? 'English' : '한국어',
      title: t('header.language.label', 'Language'),
      items: languageItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        changeLanguage(detail.id);
      }
    }
  ];

  // 인증 상태에 따라 추가 메뉴
  if (isAuthenticated && user) {
    // 사용자 이름 표시 로직 개선
    let displayName = t('header.user.account', 'Account');
    
    if (isAdmin) {
      displayName = '관리자';
    } else if (user.attributes?.name) {
      displayName = user.attributes.name;
    } else if (user.user?.username) {
      displayName = user.user.username;
    }
    
    // 로그인한 경우 사용자 메뉴 추가
    utilities.push({
      type: 'menu-dropdown',
      text: displayName,
      iconName: 'user-profile',
      items: [
        { id: 'profile', text: t('header.user.profile', '프로필') },
        { id: 'settings', text: t('header.user.settings', '설정') },
        { id: 'divider', text: '-' },
        { id: 'signout', text: t('header.user.signOut', '로그아웃') }
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
      text: t('header.user.login', '로그인'),
      href: '/login'
    });
  }

  return (
    <TopNavigation
      identity={{
        href: '/',
        title: t('header.title', 'AWS T&C 교육 포털'),
        logo: {
          src: '/assets/logo.svg',
          alt: t('header.logo.alt', 'AWS 로고')
        }
      }}
      utilities={utilities}
      i18nStrings={{
        searchIconAriaLabel: t('header.search.ariaLabel', '검색'),
        searchDismissIconAriaLabel: t('header.search.dismissAriaLabel', '검색 닫기'),
        overflowMenuTriggerText: t('header.overflow.triggerText', '더 보기'),
        overflowMenuTitleText: t('header.overflow.titleText', '메뉴'),
        overflowMenuBackIconAriaLabel: t('header.overflow.backAriaLabel', '뒤로'),
        overflowMenuDismissIconAriaLabel: t('header.overflow.dismissAriaLabel', '닫기')
      }}
    />
  );
};

export default TopNavigationHeader;