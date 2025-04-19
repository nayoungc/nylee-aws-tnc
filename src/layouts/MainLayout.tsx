import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppLayout, BreadcrumbGroup } from '@cloudscape-design/components';
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import Header from '../components/Header';

interface MainLayoutProps {
  title?: string;
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ title: propTitle, children }) => {
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

  // 내비게이션 아이템 수정 - AI Generator 제거
  const baseNavigationItems: SideNavigationProps.Item[] = [
    { type: "link", text: t('nav.dashboard') || 'Dashboard', href: '/dashboard' },
    { 
      type: "expandable-link-group",
      text: t('nav.course_management') || 'Course Management',
      href: '/courses/my-courses',
      items: [
        { type: "link", text: t('nav.courses') || 'Courses', href: '/courses/my-courses' },
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
        // AI Generator 메뉴 항목 제거됨
      ]
    },
    { type: "divider" },
    { type: "link", text: t('nav.courses') || 'Available Courses', href: '/courses' }
  ];

  // admin인 경우 관리자 메뉴 추가
  const navigationItems = [...baseNavigationItems];
  
  if (userRole === 'admin') {
    navigationItems.push(
      { type: "divider" },
      { type: "link", text: t('nav.admin') || 'Administration', href: '/admin' }
    );
  }

  const pathParts = location.pathname.split('/').filter(Boolean);
  const lastPathPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
  const formattedLastPart = lastPathPart.charAt(0).toUpperCase() + lastPathPart.slice(1).replace(/-/g, ' ');
  
  const pageTitle = propTitle || formattedLastPart || 'Dashboard';

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