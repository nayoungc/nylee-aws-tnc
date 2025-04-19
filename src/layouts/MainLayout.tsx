// src/layouts/MainLayout.tsx
import React, { useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import {
  AppLayout,
  SideNavigation,
  TopNavigation,
  Spinner,
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  Box
} from '@cloudscape-design/components';
import { SideNavigationProps } from '@cloudscape-design/components';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useTypedTranslation } from '../utils/i18n-utils';
import { changeLanguage, getCurrentLanguage } from '../utils/i18n-utils';

interface MainLayoutProps {
  children: ReactNode;
}

// 명시적으로 타입 지정
type SideNavigationItem = SideNavigationProps.Item;

// 스케레톤 UI 컴포넌트 - 메뉴 로딩 중 표시
const MenuSkeleton = () => (
  <Box padding="s">
    {Array(5).fill(0).map((_, i) => (
      <div key={i} style={{
        animation: "pulse 1.5s infinite ease-in-out",
        background: "light",
        height: "20px"
      }}>
        <Box 
          padding="s" 
          margin="s" 
        />
      </div>
    ))}
    <style>{`
      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
    `}</style>
  </Box>
);

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, tString } = useTypedTranslation();
  
  // 인증/사용자 상태 관리
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  
  // UI 상태 관리
  const [activeHref, setActiveHref] = useState<string>(location.pathname);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbGroupProps.Item[]>([]);
  const [menuLoading, setMenuLoading] = useState<boolean>(true);

  // 비동기적으로 인증 상태 확인
  const checkAuthStateAsync = useCallback(async () => {
    try {
      const cachedAuthState = sessionStorage.getItem('authenticatedState');
      const cachedData = sessionStorage.getItem('userAttributes');
      const timestamp = sessionStorage.getItem('userAttributesTimestamp');
      const CACHE_TTL = 15 * 60 * 1000; // 15분
      
      if (cachedAuthState && cachedData && timestamp && 
          (Date.now() - parseInt(timestamp) < CACHE_TTL)) {
        try {
          const parsedData = JSON.parse(cachedData);
          const isAuth = cachedAuthState === 'true';
          
          setAuthenticated(isAuth);
          if (isAuth) {
            setUserAttributes(parsedData);
            setUserName(parsedData.name || parsedData.email || '');
          }
          
          setMenuLoading(false);
        } catch (e) {
          console.error('캐시 데이터 파싱 오류:', e);
        }
      }

      // Amplify Gen 2 방식으로 현재 사용자 가져오기
      const currentUser = await getCurrentUser();
      setAuthenticated(true);
      
      // 사용자 속성 가져오기
      const attributes = {
        name: currentUser.username,
        email: currentUser.signInDetails?.loginId || '',
        profile: currentUser.userId.includes('admin') ? 'admin' : 
                 currentUser.userId.includes('instructor') ? 'instructor' : 'student'
      };
      
      setUserAttributes(attributes);
      setUserName(attributes.name || attributes.email || '');
      
      // 캐싱
      sessionStorage.setItem('authenticatedState', 'true');
      sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
      sessionStorage.setItem('userAttributesTimestamp', Date.now().toString());
      
    } catch (error) {
      // 인증되지 않은 경우
      setAuthenticated(false);
      setUserAttributes(null);
      setUserName('');
      sessionStorage.setItem('authenticatedState', 'false');
    } finally {
      setMenuLoading(false);
    }
  }, []);

  // 인증 상태 및 사용자 속성 확인
  useEffect(() => {
    checkAuthStateAsync();
  }, [checkAuthStateAsync]);
  
  
  // Auth 이벤트 리스너 설정
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuthStateAsync();
          break;
        case 'signedOut':
          setAuthenticated(false);
          setUserAttributes(null);
          sessionStorage.removeItem('userAttributes');
          sessionStorage.removeItem('userAttributesTimestamp');
          sessionStorage.setItem('authenticatedState', 'false');
          break;
      }
    });
    
    return () => listener();
  }, [checkAuthStateAsync]);
  
  // 로그아웃 함수
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('userAttributesTimestamp');
      sessionStorage.setItem('authenticatedState', 'false');
      setAuthenticated(false);
      setUserAttributes(null);
      navigate('/signin');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }, [navigate]);
  
  // 현재 선택된 언어 가져오기
  const getCurrentLanguageText = useCallback((): string => {
    const currentLang = getCurrentLanguage().substring(0, 2);
    return currentLang === 'ko' ? tString('language.korean') : tString('language.english');
  }, [tString]);

  // 경로에서 빵 부스러기(breadcrumbs) 생성
  const generateBreadcrumbs = useCallback((path: string) => {
    const pathSegments = path.split('/').filter(segment => segment);
    const breadcrumbItems: BreadcrumbGroupProps.Item[] = [
      { text: t('nav.home'), href: '/' }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/\${segment}`;
      
      let text = '';
      
      switch (segment) {
        case 'courses':
          text = t('nav.courses');
          break;
        case 'course':
          text = pathSegments[index + 1] ? t('nav.course_details') : t('nav.courses');
          break;
        case 'instructor':
          text = t('nav.instructor');
          break;
        case 'dashboard':
          text = t('nav.dashboard');
          break;
        case 'assessments':
          text = t('nav.assessments');
          break;
        case 'survey':
          text = t('nav.survey');
          break;
        case 'survey-creator':
          text = t('nav.survey_creator');
          break;
        case 'quiz':
          text = t('nav.quiz');
          break;
        case 'quiz-creator':
          text = t('nav.quiz_creator');
          break;
        case 'analytics':
          text = t('nav.analytics');
          break;
        case 'reports':
          text = t('nav.reports');
          break;
        case 'admin':
          text = t('nav.admin');
          break;
        default:
          if (segment.length > 10 && segment.includes('-')) {
            return;
          }
          text = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      breadcrumbItems.push({ text, href: currentPath });
    });
    
    setBreadcrumbs(breadcrumbItems);
  }, [t]);

  // 경로 변경 감지 및 활성 항목 설정
  useEffect(() => {
    setActiveHref(location.pathname);
    generateBreadcrumbs(location.pathname);
  }, [location, generateBreadcrumbs]);
  
  
  // 교육생용 기본 메뉴 아이템
  const studentItems = useMemo((): SideNavigationItem[] => [
    { type: 'link', text: t('nav.courses'), href: '/courses' },
  ], [t]);
  
  // 강사용 메뉴 아이템
  const instructorItems = useMemo((): SideNavigationItem[] => [
    {
      type: 'section',
      text: t('nav.instructor'),
      items: [
        { type: 'link', text: t('nav.dashboard'), href: '/instructor/dashboard' },
        {
          type: 'expandable-link-group',
          text: t('nav.course_management'),
          href: '/instructor/courses',  
          items: [
            { type: 'link', text: t('nav.courses'), href: '/instructor/courses' },
            { type: 'link', text: t('nav.course_catalog'), href: '/instructor/courses/catalog' }
          ]
        },
        {
          type: 'expandable-link-group',
          text: t('nav.assessment_tools'),
          href: '/instructor/assessments',  
          items: [
            { type: 'link', text: t('nav.quiz'), href: '/instructor/assessments/quiz' },
            { type: 'link', text: t('nav.survey'), href: '/instructor/assessments/survey' }
          ]
        },
        {
          type: 'expandable-link-group',
          text: t('nav.analytics'),
          href: '/instructor/analytics',  
          items: [
            { type: 'link', text: tString('nav.quiz_comparison'), href: '/instructor/analytics/comparison' },
            { type: 'link', text: tString('nav.reports'), href: '/instructor/analytics/reports' },
            { type: 'link', text: tString('nav.insights'), href: '/instructor/analytics/insights' }
          ]
        }
      ]
    }
  ], [t, tString]);
  
  // 관리자용 메뉴 아이템
  const adminItems = useMemo((): SideNavigationItem[] => [
    {
      type: 'section',
      text: t('nav.admin'),
      items: [
        { type: 'link', text: t('nav.admin'), href: '/admin' }
      ]
    }
  ], [t]);
  
  // 역할에 따른 메뉴 구성
  const navigationItems = useMemo((): SideNavigationItem[] => {
    let items: SideNavigationItem[] = [...studentItems];
    
    if (!authenticated) {
      return items;
    }
    
    const userRole = userAttributes?.profile;
    
    if (userRole === 'instructor') {
      items = [...items, ...instructorItems];
    }
    
    if (userRole === 'admin') {
      items = [...items, ...adminItems];
    }
    
    return items;
  }, [authenticated, userAttributes, studentItems, instructorItems, adminItems]);

  // 네비게이션 링크 이벤트 핸들러
  const handleNavigationFollow = useCallback((event: CustomEvent<{ href: string, external?: boolean }>) => {
    if (!event.detail.external) {
      event.preventDefault();
      navigate(event.detail.href);
    }
  }, [navigate]);
  
  // 사이드 네비게이션 컴포넌트
  const sideNavigation = useMemo(() => {
    if (menuLoading) {
      return <MenuSkeleton />;
    }
    
    return (
      <SideNavigation
        activeHref={activeHref}
        header={{ text: tString('app.title'), href: '/' }}
        items={navigationItems}
        onFollow={handleNavigationFollow}
      />
    );
  }, [activeHref, navigationItems, handleNavigationFollow, menuLoading, tString]);

  // breadcrumbs 컴포넌트
  const breadcrumbsComponent = useMemo(() => (
    <BreadcrumbGroup
      items={breadcrumbs}
      ariaLabel="Breadcrumbs"
      onFollow={handleNavigationFollow}
    />
  ), [breadcrumbs, handleNavigationFollow]);

  // 상단 네비게이션
  const topNav = useMemo(() => (
    <TopNavigation
      identity={{
        href: "/",
        title: tString('app.title'),
        logo: {
          src: "/logo.png",
          alt: "Company logo"
        }
      }}
      utilities={[
        {
          type: "menu-dropdown",
          iconName: "user-profile",
          ariaLabel: "Settings",
          text: userName || tString('nav.language_settings'),
          description: authenticated ? userName : "",
          items: [
            {
              id: "language-ko",
              text: tString('language.korean')
            },
            {
              id: "language-en",
              text: tString('language.english')
            },
            {
              id: "divider",
              text: "─────────────"
            },
            {
              id: authenticated ? "signout" : "signin",
              text: authenticated ? tString('auth.sign_out') : tString('auth.sign_in')
            }
          ],
          onItemClick: event => {
            switch(event.detail.id) {
              case "language-ko":
                changeLanguage('ko');
                break;
              case "language-en":
                changeLanguage('en');
                break;
              case "signout":
                handleSignOut();
                break;
              case "signin":
                navigate("/signin");
                break;
            }
          }
        }
      ]}
      i18nStrings={{
        searchIconAriaLabel: tString('search.icon_label') || 'Search',
        searchDismissIconAriaLabel: tString('search.dismiss_search') || 'Dismiss search',
        overflowMenuTriggerText: tString('nav.more') || 'More',
        overflowMenuTitleText: tString('nav.all') || 'All',
        overflowMenuBackIconAriaLabel: tString('nav.back') || 'Back',
        overflowMenuDismissIconAriaLabel: tString('nav.dismiss') || 'Dismiss'
      }}
    />
  ), [tString, userName, authenticated, navigate, handleSignOut]);

  if (authenticated === null) {
    return (
      <div>
        <div id="header">
          {topNav}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div id="header" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        {topNav}
      </div>
      
      <AppLayout
        contentType="default"
        navigation={sideNavigation}
        toolsHide={true}
        breadcrumbs={breadcrumbsComponent}
        notifications={<div />}
        content={children}
        headerSelector="#header"
        stickyNotifications
        navigationHide={false}
        contentHeader={<div />}
        navigationOpen={menuLoading ? undefined : undefined}
      />
    </div>
  );
};

export default React.memo(MainLayout);