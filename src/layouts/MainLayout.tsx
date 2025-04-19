import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppLayout, BreadcrumbGroup } from '@cloudscape-design/components';
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes, UserAttributeKey } from 'aws-amplify/auth';
import Header from '../components/Header';

interface UserAttributes extends Partial<Record<UserAttributeKey, string>> {}

interface MainLayoutProps {
  title?: string;
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ title: propTitle, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);

  // 세션 스토리지에서 정보 로드 시도 (캐싱 메커니즘)
  useEffect(() => {
    const cachedData = sessionStorage.getItem('userAttributes');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        const timestamp = sessionStorage.getItem('userAttributesTimestamp');
        
        // 캐시가 30분 이내인 경우만 사용 (30분 = 1800000 밀리초)
        if (timestamp && (Date.now() - parseInt(timestamp)) < 1800000) {
          setUserAttributes(parsedData);
          setUserRole(parsedData.profile || null);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        // 캐시 데이터 파싱 오류는 무시하고 계속 진행
      }
    }

    // 캐시된 데이터가 없거나 만료된 경우 새로 가져오기
    async function loadUserAttributes() {
      try {
        setLoading(true);
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes as UserAttributes);
        setUserRole(attributes.profile || null);
        setIsAuthenticated(true);
        
        // 세션 스토리지에 저장 및 타임스탬프 기록
        sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
        sessionStorage.setItem('userAttributesTimestamp', Date.now().toString());
        setLoading(false);
      } catch (error) {
        console.error('사용자 속성 로드 오류:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setIsAuthenticated(false);
        setLoading(false);
        
        // 오류 발생 시 재시도 방지를 위해 실패 횟수 저장
        const failCount = parseInt(sessionStorage.getItem('userAttributesFailCount') || '0');
        if (failCount > 3) {
          console.log('최대 재시도 횟수 초과. 30분 동안 재시도하지 않습니다.');
          sessionStorage.setItem('userAttributesRetryBlock', (Date.now() + 1800000).toString());
          return;
        }
        sessionStorage.setItem('userAttributesFailCount', (failCount + 1).toString());
      }
    }
    
    // 재시도 블록 확인
    const retryBlock = sessionStorage.getItem('userAttributesRetryBlock');
    if (retryBlock && parseInt(retryBlock) > Date.now()) {
      console.log('재시도 블록 활성화 중. 요청을 건너뜁니다.');
      setLoading(false);
      return;
    }
    
    loadUserAttributes();
  }, []);

  // 강사용 메뉴 아이템
  const instructorNavigationItems: SideNavigationProps.Item[] = [
    { type: "link", text: t('nav.dashboard') || 'Dashboard', href: '/instructor/dashboard' },
    { 
      type: "expandable-link-group",
      text: t('nav.course_management') || 'Course Management',
      href: '/instructor/courses',
      items: [
        { type: "link", text: t('nav.courses') || 'Courses', href: '/instructor/courses' },
      ]
    },
    {
      type: "expandable-link-group",
      text: t('nav.assessment_tools') || 'Assessment Tools',
      href: '/instructor/assessments/pre-quiz',
      items: [
        { type: "link", text: t('nav.quiz') || 'Quiz', href: '/instructor/assessments/quiz' },
        { type: "link", text: t('nav.survey') || 'Survey', href: '/instructor/assessments/survey' },
      ]
    },
    {
      type: "expandable-link-group",
      text: t('nav.analytics') || 'Analytics & Reports',
      href: '/instructor/analytics/comparison',
      items: [
        { type: "link", text: t('nav.quiz_comparison') || 'Pre/Post Comparison', href: '/instructor/analytics/comparison' },
        { type: "link", text: t('nav.reports') || 'Reports', href: '/instructor/analytics/reports' },
        { type: "link", text: t('nav.insights') || 'Course Insights', href: '/instructor/analytics/insights' },
      ]
    }
  ];

  // 교육생용 메뉴 아이템
  const studentNavigationItems: SideNavigationProps.Item[] = [
    // 템플릿 리터럴 수정
    { type: "link", text: t('nav.home') || 'Home', href: `/student/\${location.pathname.split('/')[2] || ''}` },
    { 
      type: "expandable-link-group",
      text: t('nav.assessments') || 'Assessments',
      href: `/student/\${location.pathname.split('/')[2] || ''}/pre-quiz`,
      items: [
        { type: "link", text: t('nav.pre_survey') || 'Pre-Survey', href: `/student/\${location.pathname.split('/')[2] || ''}/survey` },
        { type: "link", text: t('nav.pre_quiz') || 'Pre-Quiz', href: `/student/\${location.pathname.split('/')[2] || ''}/pre-quiz` },
        { type: "link", text: t('nav.post_quiz') || 'Post-Quiz', href: `/student/\${location.pathname.split('/')[2] || ''}/post-quiz` },
      ]
    }
  ];
  
  // 과정 브라우저 페이지 메뉴 아이템
  const courseBrowserNavigationItems: SideNavigationProps.Item[] = [
    { type: "link", text: t('nav.courses') || 'All Courses', href: '/courses' }
  ];

  // URL 경로에 따라 메뉴 선택
  let navigationItems: SideNavigationProps.Item[];
  
  if (location.pathname.startsWith('/student')) {
    // 교육생 페이지
    navigationItems = studentNavigationItems;
  } else if (isAuthenticated) {
    // 강사 페이지 (로그인된 경우)
    navigationItems = [...instructorNavigationItems];
    
    // 관리자 메뉴 추가
    if (userRole === 'admin') {
      navigationItems.push(
        { type: "divider" },
        { type: "link", text: t('nav.admin') || 'Administration', href: '/admin' }
      );
    }
  } else {
    // 과정 브라우저 (로그인되지 않은 경우)
    navigationItems = courseBrowserNavigationItems;
  }

  const pathParts = location.pathname.split('/').filter(Boolean);
  const lastPathPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
  const formattedLastPart = lastPathPart.charAt(0).toUpperCase() + lastPathPart.slice(1).replace(/-/g, ' ');
  
  const pageTitle = propTitle || formattedLastPart || 'Dashboard';

  const breadcrumbItems = [
    { text: 'Home', href: '/' },
    ...pathParts.map((part, index) => {
      // 템플릿 리터럴 수정
      const href = `/\${pathParts.slice(0, index + 1).join('/')}`;
      const text = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return { text, href };
    })
  ];

  return (
    <>
      <Header />
      
      <AppLayout
        navigation={
          <SideNavigation
            header={{ text: 'TnC Assessment System', href: '/' }}
            items={navigationItems}
            activeHref={location.pathname}
            onFollow={e => {
              e.preventDefault();
              navigate(e.detail.href);
            }}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={breadcrumbItems}
            ariaLabel="Breadcrumbs"
            onFollow={e => {
              e.preventDefault();
              navigate(e.detail.href);
            }}
          />
        }
        content={children || <Outlet />}
        toolsHide={true}
        contentType="default"
        navigationWidth={300}
      />
    </>
  );
};

export default MainLayout;