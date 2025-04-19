import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppLayout, BreadcrumbGroup } from '@cloudscape-design/components';
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigationItems: SideNavigationProps.Item[] = [
    { type: "link", text: t('nav.dashboard') || 'Dashboard', href: '/dashboard' },
    { 
      type: "expandable-link-group",
      text: t('nav.course_management') || 'Course Management',
      href: '/courses/catalog', // 그룹의 기본 href 추가
      items: [
        { type: "link", text: t('nav.course_catalog') || 'Course Catalog', href: '/courses/catalog' },
        { type: "link", text: t('nav.my_courses') || 'My Courses', href: '/courses/my-courses' },
        { type: "link", text: t('nav.session_management') || 'Session Management', href: '/courses/sessions' },
      ]
    },
    {
      type: "expandable-link-group",
      text: t('nav.assessment_tools') || 'Assessment Tools',
      href: '/assessments/pre-quiz', // 그룹의 기본 href 추가
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

  // 브레드크럼 아이템 생성 - 기존 코드와 동일
  const breadcrumbItems = [
    { text: 'Home', href: '/' },
    ...location.pathname.split('/').filter(Boolean).map((part, index, parts) => {
      const href = `/\${parts.slice(0, index + 1).join('/')}`;
      return { text: part.charAt(0).toUpperCase() + part.slice(1), href };
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
      content={<Outlet />}
      toolsHide={true}
      contentType="default"
      navigationWidth={300}
    />
  );
};

export default MainLayout;