// src/components/layout/TopNavigationHeader.tsx 
import React, { useEffect, useState } from 'react';
import {
  TopNavigation,
  TopNavigationProps
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useApp } from '@contexts/AppContext';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TopNavigationHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, language, changeLanguage } = useApp();
  const { isAuthenticated, logout, user, getUserRoles } = useAuth();
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<string[]>([]);

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
    if (href && !href.startsWith('http')) {
      navigate(href);
    } else if (href) {
      window.location.href = href;
    }
  };

  // 테마 메뉴 아이템
  const themeItems = [
    {
      id: 'light',
      text: t('header.theme.light', 'Light'),
      description: theme === 'light' ? '✓' : undefined
    },
    {
      id: 'dark',
      text: t('header.theme.dark', 'Dark'),
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

  // 기본 유틸리티 내비게이션 아이템
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
        handleLanguageChange(detail.id);
      }
    }
  ];

  // 인증 상태에 따른 메뉴 추가
  if (isAuthenticated && user) {
    // 사용자 정보 표시
    let displayName = user.attributes?.name || user.username || user.email || t('header.user.account', 'Account');
    
    // 사용자 역할 확인
    const isAdmin = userRoles.includes('admin');
    const isInstructor = userRoles.includes('instructor');
    
    // 역할에 따른 표시 텍스트
    let roleText = '';
    if (isAdmin) {
      roleText = t('header.role.admin', 'Admin');
    } else if (isInstructor) {
      roleText = t('header.role.instructor', 'Instructor');
    } else {
      roleText = t('header.role.student', 'Student');
    }
    
    // 사용자 메뉴 아이템
    const userItems = [
      { id: 'profile', text: t('header.user.profile', 'Profile') },
      { id: 'settings', text: t('header.user.settings', 'Settings') }
    ];
    
    // 관리자 메뉴
    if (isAdmin) {
      userItems.push(
        { id: 'admin-dashboard', text: t('header.admin.dashboard', 'Admin Dashboard') },
        { id: 'user-management', text: t('header.admin.userManagement', 'User Management') }
      );
    }
    
    // 강사 메뉴
    if (isInstructor || isAdmin) {
      userItems.push(
        { id: 'course-catalog', text: t('header.instructor.catalog', 'Course Catalog') },
        { id: 'course-management', text: t('header.instructor.courseManagement', 'Course Management') }
      );
    }
    
    // 구분선 및 로그아웃
    userItems.push(
      { id: 'divider', text: '-' },
      { id: 'signout', text: t('header.user.signOut', 'Sign Out') }
    );
    
    // 사용자 메뉴 추가
    utilities.push({
      type: 'menu-dropdown',
      iconName: 'user-profile',
      title: t('header.user.account', 'Account'),
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
      text: t('header.user.login', 'Login'),
      onClick: () => handleNavigation('/login')
    });
  }

  return (
    <TopNavigation
      identity={{
        href: '#',
        title: t('header.title', 'AWS T&C Education Portal'),
        logo: {
          src: '/assets/aws.png',
          alt: t('header.logo.alt', 'AWS Logo')
        },
        onFollow: () => {
          handleNavigation('/');
          return false;
        }
      }}
      utilities={utilities}
      i18nStrings={{
        searchIconAriaLabel: t('header.search.ariaLabel', 'Search'),
        searchDismissIconAriaLabel: t('header.search.dismissAriaLabel', 'Close search'),
        overflowMenuTriggerText: t('header.overflow.triggerText', 'More'),
        overflowMenuTitleText: t('header.overflow.titleText', 'Menu'),
        overflowMenuBackIconAriaLabel: t('header.overflow.backAriaLabel', 'Back'),
        overflowMenuDismissIconAriaLabel: t('header.overflow.dismissAriaLabel', 'Close')
      }}
    />
  );
};

export default TopNavigationHeader;