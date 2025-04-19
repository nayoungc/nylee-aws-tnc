// src/layouts/MainLayout.tsx
import React, { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout, BreadcrumbGroup } from '@cloudscape-design/components';
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useTranslation } from 'react-i18next';

// 타입 정의
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 페이지 제목 매핑
  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/courses/catalog': 'Course Catalog',
    '/courses/my-courses': 'My Courses',
    '/courses/sessions': 'Session Management',
    '/assessments/pre-quiz': 'Pre-Quiz Management',
    '/assessments/post-quiz': 'Post-Quiz Management',
    '/assessments/survey': 'Survey Management',
    '/assessments/ai-generator': 'AI Question Generator',
    '/courses': 'Available Courses',
    '/admin': 'Administration'
  };

  // 사이드바 내비게이션 아이템
  const navigationItems: SideNavigationProps.Item[] = [
    { type: "link", text: t('nav.dashboard') || 'Dashboard', href: '/dashboard' },
    { 
      type: "expandable-link-group",
      text: t('nav.course_management') || 'Course Management',
      href: '/courses/catalog', 
      items: [
        { type: "link", text: t('nav.course_catalog') || 'Course Catalog', href: '/courses/catalog' },
        { type: "link", text: t('nav.my_courses') || 'My Courses', href: '/courses/my-courses' },
        { type: "link", text: t('nav.session_management') || 'Session Management', href: '/courses/sessions' },
      ]
    },
    {
      type: "expandable-link-group",
      text: t('nav.assessment_tools') || 'Assessment Tools',
      href: '/assessments/pre-quiz',
      items: [
        { type: "link", text: t('nav.pre_quiz') || 'Pre-Quiz Management', href: '/assessments/pre-quiz' },
        { type: "link", text: t('nav.post_quiz') || 'Post-Quiz Management', href: '/assessments/post-quiz' },
        { type: "link", text: t('nav.survey') || 'Survey Management', href: '/assessments/survey' },
        { type: "link", text: t('nav.ai_generator') || 'AI Question Generator', href: '/assessments/ai-generator' },
      ]
    },
    { type: "divider" },
    { type: "link", text: t('nav.courses') || 'Available Courses', href: '/courses' }
  ];

  // 현재 경로에서 페이지 제목 결정
  const pathParts = location.pathname.split('/').filter(Boolean);
  const lastPathPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
  const formattedLastPart = lastPathPart.charAt(0).toUpperCase() + lastPathPart.slice(1).replace(/-/g, ' ');
  
  const pageTitle = pageTitles[location.pathname] || formattedLastPart || 'Dashboard';

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
      content={children}
      toolsHide={true}
      contentType="default"
      navigationWidth={300}
    />
  );
};

export default MainLayout;