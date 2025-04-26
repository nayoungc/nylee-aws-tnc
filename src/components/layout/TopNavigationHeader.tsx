// src/components/layout/TopNavigationHeader.tsx 
import React, { useEffect, useState } from 'react';
import {
  TopNavigation,
  TopNavigationProps
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useApp } from '@contexts/AppContext';
import { useAuth } from '@hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const TopNavigationHeader: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'navigation', 'auth', 'admin']);
  const { theme, toggleTheme, language, changeLanguage } = useApp();
  const { isAuthenticated, logout, user, getUserRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeHref, setActiveHref] = useState<string>('/');

  // 현재 경로 추적
  useEffect(() => {
    setActiveHref(location.pathname);
  }, [location.pathname]);

  // 사용자 역할 가져오기
  useEffect(() => {
    if (isAuthenticated && user) {
      if (typeof getUserRoles === 'function') {
        const roles = getUserRoles();
        setUserRoles(roles);
      } else {
        const roles: string[] = [];

        if (user.signInUserSession?.accessToken?.payload['cognito:groups']) {
          roles.push(...user.signInUserSession.accessToken.payload['cognito:groups']);
        }

        if (user.attributes?.['custom:role']) {
          roles.push(user.attributes['custom:role']);
        }

        setUserRoles(roles);
      }
    } else {
      setUserRoles([]);
    }
  }, [isAuthenticated, user, getUserRoles]);

  // 언어 변경 핸들러
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang).then(() => {
      if (changeLanguage) {
        changeLanguage(lang);
      }
      console.log(`Language changed to: \${lang}`);
    });
  };

  // SPA 네비게이션 핸들러
  const handleNavigation = (href: string) => {
    if (!href) return;
    
    if (!href.startsWith('http')) {
      navigate(href);
      setActiveHref(href);
    } else {
      window.location.href = href;
    }
  };

  // 테마 메뉴 아이템
  const themeItems = [
    {
      id: 'light',
      text: t('menu:theme.light'),
      description: theme === 'light' ? '✓' : undefined
    },
    {
      id: 'dark',
      text: t('menu:theme.dark'),
      description: theme === 'dark' ? '✓' : undefined
    }
  ];

  // 언어 메뉴 아이템
  const languageItems = [
    {
      id: 'en',
      text: t('menu:language.english', 'English'),
      description: language === 'en' ? '✓' : undefined
    },
    {
      id: 'ko',
      text: t('menu:language.korean', '한국어'),
      description: language === 'ko' ? '✓' : undefined
    }
  ];

  // 기본 유틸리티 내비게이션 아이템
  const utilities: TopNavigationProps.Utility[] = [
    // 테마 전환 메뉴
    {
      type: 'menu-dropdown',
      text: t('menu:theme.title'),
      iconName: 'star',
      title: t('menu:theme.title'),
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
      text: language === 'en' ? t('menu:language.english', 'English') : t('menu:language.korean', '한국어'),
      title: t('menu:language.label'),
      items: languageItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        handleLanguageChange(detail.id);
      }
    }
  ];

  // 인증 상태에 따른 메뉴 추가
  if (isAuthenticated && user) {
    // 사용자 정보 표시
    let displayName = user.attributes?.name || user.username || user.email || t('menu:user.account');
    
    // 사용자 역할 확인
    const isAdmin = userRoles.includes('admin');
    const isInstructor = userRoles.includes('instructor');
    
    // 역할에 따른 표시 텍스트
    let roleText = '';
    if (isAdmin) {
      roleText = t('menu:role.admin');
    } else if (isInstructor) {
      roleText = t('menu:role.instructor');
    } else {
      roleText = t('menu:role.student');
    }
    
    // 사용자 메뉴 아이템 - 다국어 파일에서 가져오기
    const userItems = [
      { id: 'profile', text: t('menu:user.profile') },
      { id: 'settings', text: t('menu:user.settings') }
    ];
    
    // 구분선 및 로그아웃
    userItems.push(
      { id: 'divider', text: '-' },
      { id: 'signout', text: t('menu:user.signOut') }
    );
    
    // 사용자 메뉴 추가
    utilities.push({
      type: 'menu-dropdown',
      iconName: 'user-profile',
      title: t('menu:user.account'),
      text: displayName,
      description: roleText,
      items: userItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        switch (detail.id) {
          case 'signout':
            logout();
            break;
          case 'profile':
            handleNavigation('/profile');
            break;
          case 'settings':
            handleNavigation('/settings');
            break;
        }
      }
    });
  } else {
    // 로그인하지 않은 경우 로그인 버튼 추가
    utilities.push({
      type: 'button',
      text: t('menu:user.login'),
      onClick: () => handleNavigation('/login')
    });
  }

  return (
    <TopNavigation
      identity={{
        href: '/',
        title: t('menu:header.title'),
        logo: {
          src: '/assets/aws.png',
          alt: t('menu:header.logo.alt')
        },
        onFollow: (event) => {
          event.preventDefault();
          handleNavigation('/');
          return false;
        }
      }}
      utilities={utilities}
      i18nStrings={{
        searchIconAriaLabel: t('menu:search.ariaLabel'),
        searchDismissIconAriaLabel: t('menu:search.dismissAriaLabel'),
        overflowMenuTriggerText: t('menu:overflow.triggerText'),
        overflowMenuTitleText: t('menu:overflow.titleText'),
        overflowMenuBackIconAriaLabel: t('menu:overflow.backAriaLabel'),
        overflowMenuDismissIconAriaLabel: t('menu:overflow.dismissAriaLabel')
      }}
    />
  );
};

export default TopNavigationHeader;