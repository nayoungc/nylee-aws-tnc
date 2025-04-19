// src/layouts/MainLayout.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import {
  AppLayout,
  SideNavigation,
  TopNavigation,
  Spinner,
  Select,
  SelectProps,
  BreadcrumbGroup,
  BreadcrumbGroupProps
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
  title?: string;
}

// 명시적으로 타입 지정
type SideNavigationItem = SideNavigationProps.Item;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, tString, i18n } = useTypedTranslation();
  
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('');
  const [activeHref, setActiveHref] = useState<string>(location.pathname);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbGroupProps.Item[]>([]);

  // 인증 상태 및 사용자 속성 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        const isAuthenticated = !!session.tokens;
        setAuthenticated(isAuthenticated);
        
        if (isAuthenticated) {
          try {
            const attributes = await fetchUserAttributes();
            setUserAttributes(attributes);
            setUserName(attributes.name || attributes.email || '');
          } catch (error) {
            console.error('사용자 속성 로드 실패:', error);
            // 세션 스토리지에서 캐시된 데이터 시도
            const cachedData = sessionStorage.getItem('userAttributes');
            if (cachedData) {
              try {
                const parsedData = JSON.parse(cachedData);
                setUserAttributes(parsedData);
                setUserName(parsedData.name || parsedData.email || '');
              } catch (e) {
                console.error('캐시 데이터 파싱 오류:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        setAuthenticated(false);
        setUserAttributes(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // 경로 변경 감지 및 활성 항목 설정
  useEffect(() => {
    setActiveHref(location.pathname);
    generateBreadcrumbs(location.pathname);
  }, [location]);
  
  // Auth 이벤트 리스너
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUserAttributes();
          break;
        case 'signedOut':
          setAuthenticated(false);
          setUserAttributes(null);
          break;
      }
    });
    
    return () => listener();
  }, []);
  
  // 사용자 속성 가져오기
  const checkUserAttributes = async () => {
    try {
      const attributes = await fetchUserAttributes();
      setAuthenticated(true);
      setUserAttributes(attributes);
      setUserName(attributes.name || attributes.email || '');
    } catch (error) {
      console.error('사용자 속성 가져오기 실패:', error);
    }
  };
  
  // 로그아웃 함수
  const handleSignOut = async () => {
    try {
      await signOut();
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('userAttributesTimestamp');
      navigate('/signin');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  
  // 언어 옵션
  const languageOptions: SelectProps.Option[] = [
    { label: tString('language.korean'), value: 'ko' },
    { label: tString('language.english'), value: 'en' }
  ];
  
  // 현재 선택된 언어 가져오기
  const getCurrentLanguageOption = (): SelectProps.Option => {
    const currentLang = getCurrentLanguage().substring(0, 2); // 'ko-KR'에서 'ko'만 추출
    return languageOptions.find(option => option.value === currentLang) || languageOptions[0];
  };

  // 경로에서 빵 부스러기(breadcrumbs) 생성
  const generateBreadcrumbs = (path: string) => {
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
  };
  
  // 교육생용 기본 메뉴 아이템
  const getStudentItems = (): SideNavigationItem[] => [
    { type: 'link', text: t('nav.courses'), href: '/courses' },
  ];
  
  // 강사용 메뉴 아이템
  const getInstructorItems = (): SideNavigationItem[] => [
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
  ];
  
  // 관리자용 메뉴 아이템
  const getAdminItems = (): SideNavigationItem[] => [
    {
      type: 'section',
      text: t('nav.admin'),
      items: [
        { type: 'link', text: t('nav.admin'), href: '/admin' }
      ]
    }
  ];
  
  // 역할에 따른 메뉴 구성
  const getNavigationItems = (): SideNavigationItem[] => {
    // 기본 메뉴 (모든 사용자)
    let items: SideNavigationItem[] = getStudentItems();
    
    if (!authenticated) {
      return items;
    }
    
    // 로그인한 사용자의 역할에 따라 메뉴 추가
    const userRole = userAttributes?.profile;
    
    if (userRole === 'instructor') {
      items = [...items, ...getInstructorItems()];
    }
    
    if (userRole === 'admin') {
      items = [...items, ...getAdminItems()];
    }
    
    return items;
  };
  
  // 로딩 중일 때 표시할 컴포넌트
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 상단 네비게이션 */}
      <div id="header">
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
              type: "menu-dropdown", // type 속성 추가
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
      </div>
      
      {/* AppLayout */}
      <AppLayout
        contentType="default"
        navigation={
          <SideNavigation
            activeHref={activeHref}
            header={{ text: tString('app.title'), href: '/' }}
            items={getNavigationItems()}
            onFollow={(event) => {
              if (!event.detail.external) {
                event.preventDefault();
                navigate(event.detail.href);
              }
            }}
          />
        }
        toolsHide={true}
        breadcrumbs={
          <BreadcrumbGroup
            items={breadcrumbs}
            ariaLabel="Breadcrumbs"
            onFollow={(event) => {
              if (!event.detail.external) {
                event.preventDefault();
                navigate(event.detail.href);
              }
            }}
          />
        }
        notifications={<div />}
        content={children}
        headerSelector="#header"
        stickyNotifications
        navigationHide={false}
        contentHeader={<div />}
      />
    </div>
  );
};

export default MainLayout;