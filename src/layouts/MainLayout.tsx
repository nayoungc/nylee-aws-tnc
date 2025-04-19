// src/layouts/MainLayout.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { 
  AppLayout, 
  BreadcrumbGroup, 
  ContentLayout, 
  Header as CloudscapeHeader
} from '@cloudscape-design/components';
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useTranslation } from 'react-i18next';

// Header 컴포넌트 import
import Header from '../components/Header';

// 타입 정의
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadUserAttributes() {
      try {
        const attributes = await fetchUserAttributes();
        setUserRole(attributes.profile || null);
      } catch (error) {
        console.error('사용자 속성 로드 오류:', error);
      }
    }
    
    loadUserAttributes();
  }, []);
  
  // 페이지 제목 매핑
  const pageTitles: Record<string, string> = {
    '/dashboard': String(t('nav.dashboard')),
    '/courses/catalog': String(t('nav.course_catalog')),
    '/courses/my-courses': String(t('nav.my_courses')),
    '/courses/sessions': String(t('nav.session_management')),
    '/assessments/pre-quiz': String(t('nav.pre_quiz')),
    '/assessments/post-quiz': String(t('nav.post_quiz')),
    '/assessments/survey': String(t('nav.survey')),
    '/assessments/ai-generator': String(t('nav.ai_generator')),
    '/courses': String(t('nav.courses')),
    '/admin': 'Administration'
  };

  // 사이드바 내비게이션 아이템
  const navigationItems: SideNavigationProps.Item[] = [
    { type: "link", text: t('nav.dashboard'), href: '/dashboard' },
    { 
      type: "expandable-link-group",
      text: t('nav.course_management') || 'Course Management',
      href: '/courses/catalog', 
      items: [
        { type: "link", text: t('nav.course_catalog'), href: '/courses/catalog' },
        { type: "link", text: t('nav.my_courses'), href: '/courses/my-courses' },
        { type: "link", text: t('nav.session_management'), href: '/courses/sessions' },
      ]
    },
    {
      type: "expandable-link-group",
      text: t('nav.assessment_tools') || 'Assessment Tools',
      href: '/assessments/pre-quiz',
      items: [
        { type: "link", text: t('nav.pre_quiz'), href: '/assessments/pre-quiz' },
        { type: "link", text: t('nav.post_quiz'), href: '/assessments/post-quiz' },
        { type: "link", text: t('nav.survey'), href: '/assessments/survey' },
        { type: "link", text: t('nav.ai_generator'), href: '/assessments/ai-generator' },
      ]
    },
    { type: "divider" },
    { type: "link", text: t('nav.courses'), href: '/courses' },
    // 관리자인 경우만 Admin 메뉴 추가
    ...(userRole === 'admin' ? [
      { type: "divider" },
      { type: "link", text: t('nav.admin') || 'Administration', href: '/admin' }
    ] : [])
  ];

  // 현재 경로에서 페이지 제목 결정
  const pathParts = location.pathname.split('/').filter(Boolean);
  const lastPathPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
  const formattedLastPart = lastPathPart.charAt(0).toUpperCase() + lastPathPart.slice(1).replace(/-/g, ' ');
  
  const pageTitle = pageTitles[location.pathname] || formattedLastPart || t('nav.dashboard');

  // 브레드크럼 아이템 생성
  const breadcrumbItems = [
    { text: 'Home', href: '/' },
    ...pathParts.map((part, index) => {
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
            activeHref={location.pathname}
            items={navigationItems}
            header={{ text: t('app.title'), href: '/' }}
            onFollow={e => {
              e.preventDefault();
              navigate(e.detail.href);
            }}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={breadcrumbItems}
            onFollow={e => {
              e.preventDefault();
              navigate(e.detail.href);
            }}
          />
        }
        content={
          <ContentLayout
            header={
              <CloudscapeHeader variant="h1">
                {pageTitle}
              </CloudscapeHeader>
            }
          >
            {children}
          </ContentLayout>
        }
        toolsHide={true}
      />
    </>
  );
};

export default MainLayout;