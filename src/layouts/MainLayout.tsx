// MainLayout.tsx
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function loadUserAttributes() {
      try {
        const attributes = await fetchUserAttributes();
        setUserRole(attributes.profile || null);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('사용자 속성 로드 오류:', error);
        setIsAuthenticated(false);
      }
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