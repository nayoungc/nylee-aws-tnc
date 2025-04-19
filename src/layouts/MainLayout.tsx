// src/layouts/MainLayout.tsx
import React, { useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import {
  AppLayout,
  SideNavigation,
  TopNavigation,
  Spinner,
  SelectProps,
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  Box
} from '@cloudscape-design/components';
import { SideNavigationProps } from '@cloudscape-design/components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchAuthSession,
  fetchUserAttributes,
  signOut
} from 'aws-amplify/auth';
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
      <div style={{
        animation: "pulse 1.5s infinite ease-in-out",
        background:"light",
        height:"20px"
      }}>
        <Box 
          key={i}
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
  const [authenticated, setAuthenticated] = useState<boolean | null>(null); // null은 "아직 확인 안 됨"을 의미
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  
  // UI 상태 관리
  const [activeHref, setActiveHref] = useState<string>(location.pathname);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbGroupProps.Item[]>([]);
  const [menuLoading, setMenuLoading] = useState<boolean>(true); // 메뉴 로딩 상태 별도 관리

  // 인증 상태 및 사용자 속성 확인 - 최적화
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 이미 세션 스토리지에 캐시된 사용자 정보가 있는지 확인
    const cachedAuthState = sessionStorage.getItem('authenticatedState');
    const cachedData = sessionStorage.getItem('userAttributes');
    const timestamp = sessionStorage.getItem('userAttributesTimestamp');
    const CACHE_TTL = 15 * 60 * 1000; // 15분
    
    if (cachedAuthState && cachedData && timestamp && 
        (Date.now() - parseInt(timestamp) < CACHE_TTL)) {
      try {
        const parsedData = JSON.parse(cachedData);
        const isAuth = cachedAuthState === 'true';
        
        // 캐시된 데이터로 상태 빠르게 설정
        setAuthenticated(isAuth);
        if (isAuth) {
          setUserAttributes(parsedData);
          setUserName(parsedData.name || parsedData.email || '');
        }
        
        // 메뉴 로딩 상태 해제
        setMenuLoading(false);
        
        // 그러나 백그라운드에서 최신 정보 확인
        checkAuthStateAsync();
        return;
      } catch (e) {
        console.error('캐시 데이터 파싱 오류:', e);
      }
    }
    
    // 캐시된 데이터가 없는 경우 즉시 확인
    checkAuthStateAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 비동기적으로 인증 상태 확인 (백그라운드 작업으로 처리)
  const checkAuthStateAsync = async () => {
    try {
      const session = await fetchAuthSession();
      const isAuthenticated = !!session.tokens;
      
      // 인증 상태 캐싱
      sessionStorage.setItem('authenticatedState', String(isAuthenticated));
      setAuthenticated(isAuthenticated);
      
      if (isAuthenticated) {
        try {
          // 사용자 속성 불러오기
          const attributes = await fetchUserAttributes();
          setUserAttributes(attributes);
          setUserName(attributes.name || attributes.email || '');
          
          // 캐싱
          sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
          sessionStorage.setItem('userAttributesTimestamp', Date.now().toString());
        } catch (error) {
          console.error('사용자 속성 로드 실패:', error);
        }
      } else {
        setUserAttributes(null);
        setUserName('');
      }
    } catch (error) {
      console.error('인증 확인 오류:', error);
      setAuthenticated(false);
      setUserAttributes(null);
    } finally {
      setMenuLoading(false);
    }
  };

  // 경로 변경 감지 및 활성 항목 설정
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setActiveHref(location.pathname);
    generateBreadcrumbs(location.pathname);
  }, [location]);
  
  // Auth 이벤트 리스너
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, []);
  
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
  const getCurrentLanguageText = (): string => {
    const currentLang = getCurrentLanguage().substring(0, 2); // 'ko-KR'에서 'ko'만 추출
    return currentLang === 'ko' ? tString('language.korean') : tString('language.english');
  };

  // 경로에서 빵 부스러기(breadcrumbs) 생성
  const generateBreadcrumbs = useCallback((path: string) => {
    const pathSegments = path.split('/').filter(segment => segment);
    const breadcrumbItems: BreadcrumbGroupProps.Item[] = [
      { text: t('nav.home'), href: '/' }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/\${segment}`;
      
      // 특수 경로의 경우 의미 있는 이름 사용
      let text = '';
      
      switch (segment) {
        case 'courses':
          text = t('nav.courses');
          break;
        case 'course':
          // 다음 세그먼트가 있으면 그것이 courseId
          if (pathSegments[index + 1]) {
            text = t('nav.course_details');
          } else {
            text = t('nav.courses');
          }
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
          // UUID 같은 ID로 추정되는 경우 표시 안함
          if (segment.length > 10 && segment.includes('-')) {
            return;
          }
          text = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      breadcrumbItems.push({ text, href: currentPath });
    });
    
    setBreadcrumbs(breadcrumbItems);
  }, [t]);
  
  // 교육생용 기본 메뉴 아이템 - useMemo로 메모이제이션
  const studentItems = useMemo((): SideNavigationItem[] => [
    { type: 'link', text: t('nav.courses'), href: '/courses' },
  ], [t]);
  
  // 강사용 메뉴 아이템 - useMemo로 메모이제이션
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
  
  // 관리자용 메뉴 아이템 - useMemo로 메모이제이션
  const adminItems = useMemo((): SideNavigationItem[] => [
    {
      type: 'section',
      text: t('nav.admin'),
      items: [
        { type: 'link', text: t('nav.admin'), href: '/admin' }
      ]
    }
  ], [t]);
  
  // 역할에 따른 메뉴 구성 - useMemo로 메모이제이션
  const navigationItems = useMemo((): SideNavigationItem[] => {
    // 기본 메뉴 (모든 사용자)
    let items: SideNavigationItem[] = [...studentItems];
    
    if (!authenticated) {
      return items;
    }
    
    // 로그인한 사용자의 역할에 따라 메뉴 추가
    const userRole = userAttributes?.profile;
    
    if (userRole === 'instructor') {
      items = [...items, ...instructorItems];
    }
    
    if (userRole === 'admin') {
      items = [...items, ...adminItems];
    }
    
    return items;
  }, [authenticated, userAttributes, studentItems, instructorItems, adminItems]);

  // 네비게이션 링크 이벤트 핸들러 메모이제이션
  const handleNavigationFollow = useCallback((event: CustomEvent<{ href: string, external?: boolean }>) => {
    if (!event.detail.external) {
      event.preventDefault();
      navigate(event.detail.href);
    }
  }, [navigate]);
  
  // 사이드 네비게이션 컴포넌트 메모이제이션
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

  // breadcrumbs 컴포넌트 메모이제이션
  const breadcrumbsComponent = useMemo(() => (
    <BreadcrumbGroup
      items={breadcrumbs}
      ariaLabel="Breadcrumbs"
      onFollow={handleNavigationFollow}
    />
  ), [breadcrumbs, handleNavigationFollow]);

  // 상단 네비게이션 메모이제이션 
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
              text: "─────────────"  // Divider를 텍스트로 표현
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

  // 아직 인증 상태 확인 중이면 빈 레이아웃만 표시
  if (authenticated === null) {
    return (
      <div>
        {/* 최소한의 UI만 표시 */}
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
      {/* 상단 네비게이션 */}
      <div id="header" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        {topNav}
      </div>
      
      {/* AppLayout */}
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
        // 중요: 초기 화면 깜빡임 최소화를 위해 로딩 상태일 때 렌더링 지연
        navigationOpen={menuLoading ? undefined : undefined}
      />
    </div>
  );
};

// 컴포넌트 자체도 메모이제이션하여 상위 컴포넌트 리렌더링 시 불필요한 재계산 방지
export default React.memo(MainLayout);