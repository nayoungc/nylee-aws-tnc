// src/components/layout/TopNavigationHeader.tsx 수정
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
  const { t } = useTranslation();
  const { theme, toggleTheme, language, changeLanguage } = useApp();
  const { isAuthenticated, logout, user, getUserRoles } = useAuth(); // getUserRoles 추가
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  // 사용자 역할 가져오기
  useEffect(() => {
    if (isAuthenticated && user) {
      // getUserRoles가 존재한다면 사용, 없으면 대체 로직 사용
      if (typeof getUserRoles === 'function') {
        const roles = getUserRoles();
        setUserRoles(roles);
        console.log('User roles:', roles); // 디버깅용
      } else {
        // 대체 로직: Cognito 그룹이나 커스텀 속성에서 역할 추출
        const roles: string[] = [];
        
        // 사용자 풀의 그룹에서 역할 추출
        if (user.signInUserSession?.accessToken?.payload['cognito:groups']) {
          roles.push(...user.signInUserSession.accessToken.payload['cognito:groups']);
        }
        
        // 커스텀 속성에서 역할 추출
        if (user.attributes?.['custom:role']) {
          roles.push(user.attributes['custom:role']);
        }
        
        setUserRoles(roles);
        console.log('Extracted roles:', roles); // 디버깅용
      }
    }
  }, [isAuthenticated, user, getUserRoles]);

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
    let userRole = 'user';
    
    // 사용자 역할 확인
    const isAdmin = userRoles.includes('admin');
    const isInstructor = userRoles.includes('instructor');
    const isStudent = userRoles.includes('student') || (!isAdmin && !isInstructor);
    
    if (isAdmin) {
      userRole = '관리자';
    } else if (isInstructor) {
      userRole = '강사';
    } else {
      userRole = '수강생';
    }
    
    if (user.attributes?.name) {
      displayName = user.attributes.name;
    } else if (user.username) {
      displayName = user.username;
    } else if (user.email) {
      displayName = user.email;
    }
    
    console.log('User info:', { displayName, userRole, roles: userRoles }); // 디버깅용
    
    // 역할 기반 메뉴 아이템 구성
    const userMenuItems = [
      { id: 'profile', text: t('header.user.profile', '프로필') },
      { id: 'settings', text: t('header.user.settings', '설정') },
    ];
    
    // 관리자 메뉴
    if (isAdmin) {
      userMenuItems.push(
        { id: 'admin-dashboard', text: t('header.admin.dashboard', '관리자 대시보드') },
        { id: 'user-management', text: t('header.admin.userManagement', '사용자 관리') }
      );
    }
    
    // 강사 메뉴
    if (isInstructor || isAdmin) {
      userMenuItems.push(
        { id: 'course-catalog', text: t('header.instructor.catalog', '과정 카탈로그') },
        { id: 'course-management', text: t('header.instructor.courseManagement', '과정 관리') }
      );
    }
    
    // 구분선 및 로그아웃 추가
    userMenuItems.push(
      { id: 'divider', text: '-' },
      { id: 'signout', text: t('header.user.signOut', '로그아웃') }
    );
    
    // 로그인한 경우 사용자 메뉴 추가
    utilities.push({
      type: 'menu-dropdown',
      text: `\${displayName} (\${userRole})`,
      description: userRole,
      iconName: 'user-profile',
      items: userMenuItems,
      onItemClick: ({ detail }: { detail: { id: string } }) => {
        switch (detail.id) {
          case 'signout':
            logout();
            break;
          case 'profile':
            navigate('/profile');
            break;
          case 'settings':
            navigate('/settings');
            break;
          case 'admin-dashboard':
            navigate('/admin/dashboard');
            break;
          case 'user-management':
            navigate('/admin/users');
            break;
          case 'course-catalog':
            navigate('/instructor/catalog');
            break;
          case 'course-management':
            navigate('/instructor/courses');
            break;
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
          src: '/assets/aws.png', 
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