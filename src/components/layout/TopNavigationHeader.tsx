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
// LanguageSwitcher를 직접 사용하지 않음 (TopNavigation에 직접 컴포넌트를 넣을 수 없음)

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
      text: t('navigation:theme_light'),
      description: theme === 'light' ? '✓' : undefined
    },
    {
      id: 'dark',
      text: t('navigation:theme_dark'),
      description: theme === 'dark' ? '✓' : undefined
    }
  ];

  // 언어 메뉴 아이템 
  const languageItems = [
    {
      id: 'en',
      text: t('navigation:language_english'),
      description: i18n.language === 'en' ? '✓' : undefined
    },
    {
      id: 'ko',
      text: t('navigation:language_korean'),
      description: i18n.language === 'ko' ? '✓' : undefined
    }
  ];

  // 기본 유틸리티 내비게이션 아이템
  const utilities: TopNavigationProps.Utility[] = [
    // 테마 전환 메뉴
    {
      type: 'menu-dropdown',
      text: t('navigation:theme_title'),
      iconName: 'star',
      title: t('navigation:theme_title'),
      items: themeItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        if (detail.id === 'light' || detail.id === 'dark') {
          toggleTheme();
        }
      }
    },
    // 언어 선택 메뉴 (LanguageSwitcher 컴포넌트 대신 메뉴 드롭다운 사용)
    {
      type: 'menu-dropdown',
      text: i18n.language === 'ko' ? t('navigation:language_korean') : t('navigation:language_english'),
      title: t('navigation:language_label'),
      items: languageItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        handleLanguageChange(detail.id);
      }
    }
  ];

  // 인증 상태에 따른 메뉴 추가
  if (isAuthenticated && user) {
    // 사용자 정보 표시
    let displayName = user.attributes?.name || user.username || user.email || t('navigation:user_account');
    
    // 사용자 역할 확인
    const isAdmin = userRoles.includes('admin');
    const isInstructor = userRoles.includes('instructor');
    
    // 역할에 따른 표시 텍스트
    let roleText = '';
    if (isAdmin) {
      roleText = t('navigation:role_admin');
    } else if (isInstructor) {
      roleText = t('navigation:role_instructor');
    } else {
      roleText = t('navigation:role_student');
    }
    
    // 사용자 메뉴 아이템
    const userItems = [
      { id: 'profile', text: t('navigation:user_profile') },
      { id: 'settings', text: t('navigation:user_settings') }
    ];
    
    // 구분선 및 로그아웃
    userItems.push(
      { id: 'divider', text: '-' },
      { id: 'signout', text: t('navigation:user_sign_out') }
    );
    
    // 사용자 메뉴 추가
    utilities.push({
      type: 'menu-dropdown',
      iconName: 'user-profile',
      title: t('navigation:user_account'),
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
      text: t('navigation:user_login'),
      onClick: () => handleNavigation('/login')
    });
  }

  return (
    <TopNavigation
      identity={{
        href: '/',
        title: t('navigation:header_title'),
        logo: {
          src: '/assets/aws.png',
          alt: t('navigation:header_logo_alt')
        },
        onFollow: (event) => {
          event.preventDefault();
          handleNavigation('/');
          return false;
        }
      }}
      utilities={utilities}
      i18nStrings={{
        searchIconAriaLabel: t('navigation:search_aria_label'),
        searchDismissIconAriaLabel: t('navigation:search_dismiss_aria_label'),
        overflowMenuTriggerText: t('navigation:overflow_trigger_text'),
        overflowMenuTitleText: t('navigation:overflow_title_text'),
        overflowMenuBackIconAriaLabel: t('navigation:overflow_back_aria_label'),
        overflowMenuDismissIconAriaLabel: t('navigation:overflow_dismiss_aria_label')
      }}
    />
  );
};

export default TopNavigationHeader;